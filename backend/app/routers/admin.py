from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import require_role

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/users", response_model=list[schemas.UserOut])
def list_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("admin")),
):
    return db.query(models.User).order_by(models.User.created_at.desc()).all()


@router.patch("/users/{user_id}/deactivate", response_model=schemas.UserOut)
def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("admin")),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    db.commit()
    db.refresh(user)
    return user


@router.patch("/users/{user_id}/verify-doctor", response_model=schemas.UserOut)
def verify_doctor(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("admin")),
):
    doctor = db.query(models.User).filter(models.User.id == user_id).first()
    if doctor is None or doctor.role != models.UserRole.doctor:
        raise HTTPException(status_code=404, detail="Doctor account not found")
    if not doctor.is_active:
        raise HTTPException(status_code=409, detail="Inactive doctor accounts cannot be verified")
    doctor.is_verified = True
    db.commit()
    db.refresh(doctor)
    return doctor


@router.get("/hospitals", response_model=list[schemas.HospitalOut])
def list_hospitals_admin(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("admin")),
):
    return db.query(models.Hospital).all()


@router.post("/hospitals", response_model=schemas.HospitalOut)
def create_hospital(
    payload: schemas.HospitalOut,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("admin")),
):
    hospital = models.Hospital(**payload.model_dump(exclude={"id"}))
    db.add(hospital)
    db.commit()
    db.refresh(hospital)
    return hospital
