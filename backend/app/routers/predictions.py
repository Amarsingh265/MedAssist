from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user
from ..ml.model import predict_disease
from ..utils.severity import assess_severity
from ..utils.pdf_generator import generate_prediction_pdf

router = APIRouter(prefix="/api/predictions", tags=["predictions"])


@router.post("", response_model=schemas.PredictionResponse)
def create_prediction(
    payload: schemas.SymptomInput,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    result = predict_disease(payload.symptoms, payload.free_text or "")
    severity, recommendation = assess_severity(
        payload.symptoms, result["confidence"], result["is_emergency_flag"]
    )

    record = models.Prediction(
        patient_id=current_user.id,
        symptoms_text=payload.free_text or "",
        symptoms_list=", ".join(payload.symptoms),
        predicted_disease=result["top_disease"],
        confidence=result["confidence"],
        severity=severity,
        recommendation=recommendation,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return schemas.PredictionResponse(
        top_prediction=record,
        differential=result["differential"],
    )


@router.get("/history", response_model=list[schemas.PredictionOut])
def get_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.Prediction)
        .filter(models.Prediction.patient_id == current_user.id)
        .order_by(models.Prediction.created_at.desc())
        .all()
    )


@router.get("/{prediction_id}/pdf")
def download_pdf(
    prediction_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    record = (
        db.query(models.Prediction)
        .filter(
            models.Prediction.id == prediction_id,
            models.Prediction.patient_id == current_user.id,
        )
        .first()
    )
    if not record:
        return {"error": "Prediction not found"}

    pdf_bytes = generate_prediction_pdf(
        current_user.full_name,
        {
            "symptoms_list": record.symptoms_list,
            "predicted_disease": record.predicted_disease,
            "confidence": record.confidence,
            "severity": record.severity,
            "recommendation": record.recommendation,
        },
    )
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=report_{prediction_id}.pdf"},
    )
