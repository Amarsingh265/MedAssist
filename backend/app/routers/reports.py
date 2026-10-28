from collections import Counter
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import require_role

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/summary", response_model=schemas.AnalyticsSummary)
def analytics_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("admin", "doctor")),
):
    total_patients = db.query(models.User).filter(models.User.role == models.UserRole.patient).count()
    total_doctors = db.query(models.User).filter(models.User.role == models.UserRole.doctor).count()
    total_predictions = db.query(models.Prediction).count()
    total_appointments = db.query(models.Appointment).count()

    severities = [p.severity for p in db.query(models.Prediction.severity).all()]
    severity_counts = dict(Counter(severities))

    diseases = [p.predicted_disease for p in db.query(models.Prediction.predicted_disease).all()]
    top_diseases = Counter(diseases).most_common(5)

    return schemas.AnalyticsSummary(
        total_patients=total_patients,
        total_doctors=total_doctors,
        total_predictions=total_predictions,
        total_appointments=total_appointments,
        predictions_by_severity=severity_counts,
        top_predicted_diseases=[{"disease": d, "count": c} for d, c in top_diseases],
    )
