from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user, require_role

router = APIRouter(prefix="/api/doctors", tags=["doctors"])


@router.get("", response_model=list[schemas.UserOut])
def list_doctors(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return (
        db.query(models.User)
        .filter(
            models.User.role == models.UserRole.doctor,
            models.User.is_verified.is_(True),
            models.User.is_active.is_(True),
        )
        .all()
    )


@router.get("/patients", response_model=list[schemas.UserOut])
def doctor_patients(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("doctor", "admin")),
):
    patient_ids = (
        db.query(models.Appointment.patient_id)
        .filter(models.Appointment.doctor_id == current_user.id)
        .distinct()
    )
    return db.query(models.User).filter(models.User.id.in_(patient_ids)).all()


@router.get("/patients/{patient_id}/predictions", response_model=list[schemas.PredictionOut])
def patient_predictions(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("doctor", "admin")),
):
    return (
        db.query(models.Prediction)
        .filter(models.Prediction.patient_id == patient_id)
        .order_by(models.Prediction.created_at.desc())
        .all()
    )
