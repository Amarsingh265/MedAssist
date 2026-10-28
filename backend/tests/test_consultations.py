import asyncio
import datetime as dt
import unittest

from app import models
from app.routers.consultations import (
    ConsultationRooms,
    Participant,
    _appointment_window,
)


class FakeSocket:
    def __init__(self):
        self.messages = []

    async def send_json(self, message):
        self.messages.append(message)


class ConsultationTests(unittest.TestCase):
    def test_room_limits_participants_relays_messages_and_cleans_up(self):
        async def exercise_room():
            rooms = ConsultationRooms()
            patient_socket = FakeSocket()
            doctor_socket = FakeSocket()
            third_socket = FakeSocket()
            patient = Participant(
                patient_socket, 1, models.UserRole.patient, "Patient"
            )
            doctor = Participant(
                doctor_socket, 2, models.UserRole.doctor, "Doctor"
            )
            third = Participant(
                third_socket, 3, models.UserRole.patient, "Third user"
            )

            self.assertTrue(await rooms.join(25, patient))
            self.assertEqual(patient_socket.messages, [{"type": "waiting"}])
            self.assertTrue(await rooms.join(25, doctor))
            self.assertEqual(patient_socket.messages[-1]["type"], "peer_joined")
            self.assertEqual(doctor_socket.messages[-1]["type"], "peer_joined")
            self.assertFalse(await rooms.join(25, third))
            self.assertFalse(await rooms.join(25, patient))

            offer = {"type": "offer", "data": {"sdp": "test"}}
            await rooms.relay(25, patient.user_id, offer)
            self.assertEqual(doctor_socket.messages[-1], offer)

            await rooms.leave(25, patient.user_id)
            self.assertEqual(doctor_socket.messages[-1], {"type": "peer_left"})
            await rooms.leave(25, doctor.user_id)
            self.assertNotIn(25, rooms._rooms)

        asyncio.run(exercise_room())

    def test_room_removes_disconnected_peer_during_relay(self):
        async def exercise_room():
            rooms = ConsultationRooms()
            patient_socket = FakeSocket()

            class DisconnectedSocket(FakeSocket):
                async def send_json(self, message):
                    if message.get("type") == "offer":
                        raise RuntimeError("socket is disconnected")
                    self.messages.append(message)

            patient = Participant(
                patient_socket, 1, models.UserRole.patient, "Patient"
            )
            doctor = Participant(
                DisconnectedSocket(), 2, models.UserRole.doctor, "Doctor"
            )
            await rooms.join(31, patient)
            await rooms.join(31, doctor)

            await rooms.relay(31, patient.user_id, {"type": "offer", "data": {}})
            self.assertEqual(patient_socket.messages[-1], {"type": "peer_left"})
            self.assertEqual([p.user_id for p in rooms._rooms[31]], [patient.user_id])

        asyncio.run(exercise_room())

    def test_appointment_window_opens_fifteen_minutes_before_start(self):
        soon = models.Appointment(
            scheduled_time=dt.datetime.now(dt.timezone.utc) + dt.timedelta(minutes=14)
        )
        later = models.Appointment(
            scheduled_time=dt.datetime.now(dt.timezone.utc) + dt.timedelta(minutes=16)
        )
        self.assertTrue(_appointment_window(soon)[0])
        self.assertFalse(_appointment_window(later)[0])


if __name__ == "__main__":
    unittest.main()
