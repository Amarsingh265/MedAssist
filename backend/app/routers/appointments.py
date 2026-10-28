from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user, require_role

router = APIRouter(prefix="/api/appointments", tags=["appointments"])


@router.post("", response_model=schemas.AppointmentOut)
def book_appointment(
    payload: schemas.AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("patient")),
):
    if payload.doctor_id is not None:
        doctor = (
            db.query(models.User)
            .filter(
                models.User.id == payload.doctor_id,
                models.User.role == models.UserRole.doctor,
                models.User.is_verified.is_(True),
                models.User.is_active.is_(True),
            )
            .first()
        )
        if doctor is None:
            raise HTTPException(status_code=422, detail="Choose an active, verified doctor")

    appt = models.Appointment(
        patient_id=current_user.id,
        doctor_id=payload.doctor_id,
        hospital_id=payload.hospital_id,
        prediction_id=payload.prediction_id,
        scheduled_time=payload.scheduled_time,
        reason=payload.reason,
    )
    db.add(appt)
    db.commit()
    db.refresh(appt)
    return appt


@router.get("/mine", response_model=list[schemas.AppointmentOut])
def my_appointments(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role == models.UserRole.doctor:
        return (
            db.query(models.Appointment)
            .filter(models.Appointment.doctor_id == current_user.id)
            .order_by(models.Appointment.scheduled_time)
            .all()
        )
    return (
        db.query(models.Appointment)
        .filter(models.Appointment.patient_id == current_user.id)
        .order_by(models.Appointment.scheduled_time)
        .all()
    )


@router.patch("/{appointment_id}", response_model=schemas.AppointmentOut)
def update_appointment(
    appointment_id: int,
    payload: schemas.AppointmentUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    appt = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    updates = payload.model_dump(exclude_unset=True)
    if current_user.role == models.UserRole.admin:
        pass
    elif current_user.role == models.UserRole.doctor:
        if not current_user.is_verified:
            raise HTTPException(status_code=403, detail="Verified doctor account required")
        if appt.doctor_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not allowed")
        if set(updates) - {"status", "notes"}:
            raise HTTPException(status_code=403, detail="Doctors cannot change appointment details")
        if "status" in updates:
            transitions = {
                models.AppointmentStatus.pending: {
                    models.AppointmentStatus.confirmed,
                    models.AppointmentStatus.cancelled,
                },
                models.AppointmentStatus.confirmed: {
                    models.AppointmentStatus.completed,
                    models.AppointmentStatus.cancelled,
                },
            }
            if (
                updates["status"] != appt.status
                and updates["status"] not in transitions.get(appt.status, set())
            ):
                raise HTTPException(status_code=409, detail="Invalid appointment status transition")
    elif current_user.role == models.UserRole.patient:
        if appt.patient_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not allowed")
        if set(updates) != {"status"} or updates["status"] != models.AppointmentStatus.cancelled:
            raise HTTPException(status_code=403, detail="Patients may only cancel their own appointments")
        if appt.status in (models.AppointmentStatus.completed, models.AppointmentStatus.cancelled):
            raise HTTPException(status_code=409, detail="This appointment can no longer be cancelled")
    else:
        raise HTTPException(status_code=403, detail="Not allowed")

    for field, value in updates.items():
        setattr(appt, field, value)

    db.commit()
    db.refresh(appt)
    return appt
