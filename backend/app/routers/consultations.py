"""Appointment-authorized WebRTC signaling. Media is peer-to-peer and not recorded."""
import asyncio
import base64
import datetime as dt
import hashlib
import hmac
import json
import time
import uuid
from dataclasses import dataclass

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from .. import models
from ..config import settings
from ..database import SessionLocal, get_db
from ..deps import require_role
from ..security import decode_access_token

router = APIRouter(tags=["consultations"])


@dataclass
class Participant:
    socket: WebSocket
    user_id: int
    role: models.UserRole
    full_name: str


class ConsultationRooms:
    """Single-process signaling rooms; use shared pub/sub for multi-worker deployments."""

    def __init__(self):
        self._rooms: dict[int, list[Participant]] = {}
        self._lock = asyncio.Lock()

    async def join(self, appointment_id: int, participant: Participant) -> bool:
        async with self._lock:
            room = self._rooms.setdefault(appointment_id, [])
            if len(room) >= 2 or any(item.user_id == participant.user_id for item in room):
                if not room:
                    self._rooms.pop(appointment_id, None)
                return False
            room.append(participant)
            try:
                if len(room) == 1:
                    await participant.socket.send_json({"type": "waiting"})
                    return True

                first, second = room
                await first.socket.send_json({
                    "type": "peer_joined",
                    "role": second.role.value,
                    "display_name": second.full_name,
                })
                await second.socket.send_json({
                    "type": "peer_joined",
                    "role": first.role.value,
                    "display_name": first.full_name,
                })
            except (WebSocketDisconnect, RuntimeError):
                room.remove(participant)
                if not room:
                    self._rooms.pop(appointment_id, None)
                else:
                    try:
                        await room[0].socket.send_json({"type": "peer_left"})
                    except (WebSocketDisconnect, RuntimeError):
                        self._rooms.pop(appointment_id, None)
                raise
            return True

    async def relay(self, appointment_id: int, sender_id: int, message: dict) -> None:
        async with self._lock:
            room = self._rooms.get(appointment_id, [])
            for participant in room:
                if participant.user_id != sender_id:
                    try:
                        await participant.socket.send_json(message)
                    except (WebSocketDisconnect, RuntimeError):
                        room.remove(participant)
                        if room:
                            try:
                                await room[0].socket.send_json({"type": "peer_left"})
                            except (WebSocketDisconnect, RuntimeError):
                                self._rooms.pop(appointment_id, None)
                        else:
                            self._rooms.pop(appointment_id, None)
                    return

    async def leave(self, appointment_id: int, user_id: int) -> None:
        async with self._lock:
            room = self._rooms.get(appointment_id, [])
            self._rooms[appointment_id] = [
                participant for participant in room if participant.user_id != user_id
            ]
            remaining = self._rooms[appointment_id]
            for participant in remaining:
                try:
                    await participant.socket.send_json({"type": "peer_left"})
                except (WebSocketDisconnect, RuntimeError):
                    self._rooms.pop(appointment_id, None)
            if not remaining:
                self._rooms.pop(appointment_id, None)


rooms = ConsultationRooms()
MAX_SIGNAL_BYTES = 64 * 1024
JOIN_BEFORE_MINUTES = 15
JOIN_AFTER_MINUTES = 120


def _as_utc(value: dt.datetime) -> dt.datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=dt.timezone.utc)
    return value.astimezone(dt.timezone.utc)


def _appointment_window(appointment: models.Appointment) -> tuple[bool, str]:
    scheduled = _as_utc(appointment.scheduled_time)
    now = dt.datetime.now(dt.timezone.utc)
    opens = scheduled - dt.timedelta(minutes=JOIN_BEFORE_MINUTES)
    closes = scheduled + dt.timedelta(minutes=JOIN_AFTER_MINUTES)
    if now < opens:
        return False, "Consultation room opens 15 minutes before the appointment."
    if now > closes:
        return False, "The appointment consultation window has ended."
    return True, "Join is available."


def _ice_servers() -> list[dict]:
    servers: list[dict] = []
    stun_urls = [url.strip() for url in settings.webrtc_stun_urls.split(",") if url.strip()]
    if stun_urls:
        servers.append({"urls": stun_urls})

    turn_urls = [url.strip() for url in settings.turn_server_urls.split(",") if url.strip()]
    if turn_urls and settings.turn_shared_secret:
        username = f"{int(time.time()) + 3600}:{uuid.uuid4().hex}"
        credential = base64.b64encode(
            hmac.new(
                settings.turn_shared_secret.encode("utf-8"),
                username.encode("utf-8"),
                hashlib.sha1,
            ).digest()
        ).decode("ascii")
        servers.append({
            "urls": turn_urls,
            "username": username,
            "credential": credential,
        })
    return servers


@router.get("/api/consultations/mine")
def list_my_consultations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("patient", "doctor")),
):
    query = db.query(models.Appointment).filter(
        models.Appointment.status == models.AppointmentStatus.confirmed
    )
    if current_user.role == models.UserRole.patient:
        query = query.filter(models.Appointment.patient_id == current_user.id)
    else:
        query = query.filter(models.Appointment.doctor_id == current_user.id)

    result = []
    for appointment in query.order_by(models.Appointment.scheduled_time).all():
        doctor = appointment.doctor
        patient = appointment.patient
        if doctor is None or patient is None or not doctor.is_verified or not doctor.is_active:
            continue
        join_available, join_message = _appointment_window(appointment)
        result.append({
            "id": appointment.id,
            "scheduled_time": _as_utc(appointment.scheduled_time),
            "status": appointment.status.value,
            "reason": appointment.reason,
            "patient_name": patient.full_name,
            "doctor_name": doctor.full_name,
            "doctor_specialization": doctor.specialization,
            "join_available": join_available,
            "join_message": join_message,
        })
    return result


@router.websocket("/api/consultations/{appointment_id}/signal")
async def consultation_signal(websocket: WebSocket, appointment_id: int):
    await websocket.accept()
    participant: Participant | None = None
    registered = False
    try:
        try:
            auth_message = await asyncio.wait_for(websocket.receive_json(), timeout=10)
        except (asyncio.TimeoutError, ValueError):
            await websocket.close(code=4401, reason="Authentication required")
            return

        if (
            not isinstance(auth_message, dict)
            or auth_message.get("type") != "auth"
            or not isinstance(auth_message.get("token"), str)
        ):
            await websocket.close(code=4401, reason="Authentication required")
            return

        token_payload = decode_access_token(auth_message["token"])
        if not token_payload or not token_payload.get("sub"):
            await websocket.close(code=4401, reason="Invalid session")
            return
        try:
            user_id = int(token_payload["sub"])
        except (TypeError, ValueError):
            await websocket.close(code=4401, reason="Invalid session")
            return

        db: Session = SessionLocal()
        try:
            user = db.query(models.User).filter(models.User.id == user_id).first()
            appointment = (
                db.query(models.Appointment)
                .filter(models.Appointment.id == appointment_id)
                .first()
            )
            doctor = appointment.doctor if appointment else None
            if (
                user is None
                or not user.is_active
                or user.role not in (models.UserRole.patient, models.UserRole.doctor)
                or appointment is None
                or appointment.status != models.AppointmentStatus.confirmed
                or appointment.doctor_id is None
                or doctor is None
                or not doctor.is_verified
                or not doctor.is_active
                or user.id not in (appointment.patient_id, appointment.doctor_id)
                or (user.role == models.UserRole.patient and user.id != appointment.patient_id)
                or (user.role == models.UserRole.doctor and user.id != appointment.doctor_id)
            ):
                await websocket.close(code=4403, reason="Not authorized for this consultation")
                return

            join_available, join_message = _appointment_window(appointment)
            if not join_available:
                await websocket.close(code=4409, reason=join_message)
                return
            participant = Participant(
                socket=websocket,
                user_id=user.id,
                role=user.role,
                full_name=user.full_name,
            )
        finally:
            db.close()

        await websocket.send_json({
            "type": "authenticated",
            "ice_servers": _ice_servers(),
            "network_note": (
                "No TURN relay is configured; direct connection may not work on some networks."
                if not settings.turn_server_urls or not settings.turn_shared_secret
                else "TURN relay credentials expire after one hour."
            ),
        })
        if not await rooms.join(appointment_id, participant):
            await websocket.close(code=4409, reason="Consultation already has two participants")
            return
        registered = True

        while True:
            raw_message = await websocket.receive_text()
            if len(raw_message.encode("utf-8")) > MAX_SIGNAL_BYTES:
                await websocket.close(code=4400, reason="Signaling message is too large")
                return
            try:
                message = json.loads(raw_message)
            except json.JSONDecodeError:
                await websocket.close(code=4400, reason="Invalid signaling message")
                return
            if (
                not isinstance(message, dict)
                or message.get("type") not in {"offer", "answer", "ice_candidate"}
                or "data" not in message
            ):
                await websocket.close(code=4400, reason="Unsupported signaling message")
                return
            await rooms.relay(appointment_id, participant.user_id, message)
    except WebSocketDisconnect:
        pass
    finally:
        if registered and participant is not None:
            await rooms.leave(appointment_id, participant.user_id)
