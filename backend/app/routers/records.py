import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user

router = APIRouter(prefix="/api/records", tags=["medical records"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("", response_model=list[schemas.MedicalRecordOut])
def list_records(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.MedicalRecord)
        .filter(models.MedicalRecord.patient_id == current_user.id)
        .order_by(models.MedicalRecord.created_at.desc())
        .all()
    )


@router.post("", response_model=schemas.MedicalRecordOut)
def create_record(
    title: str = Form(...),
    description: str = Form(""),
    record_type: str = Form("note"),
    file: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    file_path = None
    if file is not None:
        ext = os.path.splitext(file.filename)[1]
        filename = f"{uuid.uuid4().hex}{ext}"
        dest = os.path.join(UPLOAD_DIR, filename)
        with open(dest, "wb") as f:
            f.write(file.file.read())
        file_path = f"/uploads/{filename}"

    record = models.MedicalRecord(
        patient_id=current_user.id,
        title=title,
        description=description,
        record_type=record_type,
        file_path=file_path,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record
