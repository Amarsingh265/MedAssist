"""Medical image upload endpoint (e.g. skin photos, scan images, lab reports).

Note: this demo does not perform real image-based diagnosis. It stores the
image and attaches it to the patient's medical record, and returns a
placeholder analysis message. Wire in a real vision model here if desired.
"""
import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session

from .. import models
from ..database import get_db
from ..deps import get_current_user

router = APIRouter(prefix="/api/uploads", tags=["uploads"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/image")
def upload_medical_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4().hex}{ext}"
    dest = os.path.join(UPLOAD_DIR, filename)
    with open(dest, "wb") as f:
        f.write(file.file.read())

    record = models.MedicalRecord(
        patient_id=current_user.id,
        title=f"Uploaded image: {file.filename}",
        description="Medical image uploaded by patient for doctor review.",
        record_type="image",
        file_path=f"/uploads/{filename}",
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "record_id": record.id,
        "file_path": record.file_path,
        "message": (
            "Image received and attached to your medical record. "
            "A doctor will need to review it - automated image analysis "
            "is not enabled in this demo."
        ),
    }
