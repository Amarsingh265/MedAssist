"""Authenticated care-planning tools that do not send data to third parties."""
import datetime as dt

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import require_role

router = APIRouter(tags=["care tools"])


def _utc_naive(value: dt.datetime) -> dt.datetime:
    if value.tzinfo is None or value.utcoffset() is None:
        return value
    return value.astimezone(dt.timezone.utc).replace(tzinfo=None)


@router.get("/api/reminders", response_model=list[schemas.ReminderOut])
def list_reminders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("patient")),
):
    return (
        db.query(models.Reminder)
        .filter(models.Reminder.user_id == current_user.id)
        .order_by(models.Reminder.scheduled_at)
        .all()
    )


@router.post(
    "/api/reminders",
    response_model=schemas.ReminderOut,
    status_code=status.HTTP_201_CREATED,
)
def create_reminder(
    payload: schemas.ReminderCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("patient")),
):
    if payload.appointment_id is not None:
        appointment = (
            db.query(models.Appointment)
            .filter(
                models.Appointment.id == payload.appointment_id,
                models.Appointment.patient_id == current_user.id,
            )
            .first()
        )
        if appointment is None:
            raise HTTPException(status_code=404, detail="Appointment not found")
        if appointment.status == models.AppointmentStatus.cancelled:
            raise HTTPException(status_code=409, detail="Cancelled appointments cannot have reminders")
        if payload.reminder_type != "appointment":
            raise HTTPException(
                status_code=422,
                detail="Only appointment reminders can be linked to an appointment",
            )

    reminder = models.Reminder(
        user_id=current_user.id,
        appointment_id=payload.appointment_id,
        title=payload.title,
        instructions=payload.instructions,
        reminder_type=payload.reminder_type,
        recurrence=payload.recurrence,
        scheduled_at=_utc_naive(payload.scheduled_at),
    )
    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    return reminder


@router.patch("/api/reminders/{reminder_id}", response_model=schemas.ReminderOut)
def update_reminder(
    reminder_id: int,
    payload: schemas.ReminderUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("patient")),
):
    reminder = (
        db.query(models.Reminder)
        .filter(
            models.Reminder.id == reminder_id,
            models.Reminder.user_id == current_user.id,
        )
        .first()
    )
    if reminder is None:
        raise HTTPException(status_code=404, detail="Reminder not found")

    values = payload.model_dump(exclude_unset=True)
    if (
        reminder.reminder_type == "appointment"
        and values.get("recurrence", "none") not in (None, "none")
    ):
        raise HTTPException(
            status_code=422,
            detail="Appointment reminders cannot recur",
        )
    if reminder.completed_at is not None and values.get("active") is True:
        raise HTTPException(status_code=409, detail="Completed reminders cannot be resumed")
    if "scheduled_at" in values and values["scheduled_at"] is not None:
        values["scheduled_at"] = _utc_naive(values["scheduled_at"])
    for field, value in values.items():
        setattr(reminder, field, value)
    db.commit()
    db.refresh(reminder)
    return reminder


@router.post("/api/reminders/{reminder_id}/complete", response_model=schemas.ReminderOut)
def complete_reminder(
    reminder_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("patient")),
):
    reminder = (
        db.query(models.Reminder)
        .filter(
            models.Reminder.id == reminder_id,
            models.Reminder.user_id == current_user.id,
        )
        .first()
    )
    if reminder is None:
        raise HTTPException(status_code=404, detail="Reminder not found")
    if reminder.completed_at is not None:
        raise HTTPException(status_code=409, detail="This reminder has already been marked taken")
    next_reminder = None
    if reminder.recurrence in ("daily", "weekly"):
        interval = dt.timedelta(days=1 if reminder.recurrence == "daily" else 7)
        now = dt.datetime.now(dt.timezone.utc).replace(tzinfo=None)
        scheduled_at = _utc_naive(reminder.scheduled_at)
        occurrences = max(1, (now - scheduled_at) // interval + 1)
        next_reminder = models.Reminder(
            user_id=reminder.user_id,
            title=reminder.title,
            instructions=reminder.instructions,
            reminder_type=reminder.reminder_type,
            recurrence=reminder.recurrence,
            scheduled_at=scheduled_at + interval * occurrences,
            active=True,
        )
    reminder.active = False
    reminder.completed_at = dt.datetime.now(dt.timezone.utc).replace(tzinfo=None)
    if next_reminder is not None:
        db.add(next_reminder)
    db.commit()
    db.refresh(reminder)
    return reminder


@router.delete("/api/reminders/{reminder_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reminder(
    reminder_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("patient")),
):
    reminder = (
        db.query(models.Reminder)
        .filter(
            models.Reminder.id == reminder_id,
            models.Reminder.user_id == current_user.id,
        )
        .first()
    )
    if reminder is None:
        raise HTTPException(status_code=404, detail="Reminder not found")
    db.delete(reminder)
    db.commit()


@router.get("/api/family-profiles", response_model=list[schemas.FamilyProfileOut])
def list_family_profiles(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("patient")),
):
    return (
        db.query(models.FamilyProfile)
        .filter(models.FamilyProfile.owner_id == current_user.id)
        .order_by(models.FamilyProfile.created_at.desc())
        .all()
    )


@router.post(
    "/api/family-profiles",
    response_model=schemas.FamilyProfileOut,
    status_code=status.HTTP_201_CREATED,
)
def create_family_profile(
    payload: schemas.FamilyProfileCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("patient")),
):
    profile = models.FamilyProfile(
        owner_id=current_user.id,
        display_name=payload.display_name,
        relationship=payload.relationship,
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.patch("/api/family-profiles/{profile_id}", response_model=schemas.FamilyProfileOut)
def update_family_profile(
    profile_id: int,
    payload: schemas.FamilyProfileUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("patient")),
):
    profile = (
        db.query(models.FamilyProfile)
        .filter(
            models.FamilyProfile.id == profile_id,
            models.FamilyProfile.owner_id == current_user.id,
            models.FamilyProfile.active.is_(True),
        )
        .first()
    )
    if profile is None:
        raise HTTPException(status_code=404, detail="Family profile not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile


@router.patch("/api/family-profiles/{profile_id}/deactivate", response_model=schemas.FamilyProfileOut)
def deactivate_family_profile(
    profile_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("patient")),
):
    profile = (
        db.query(models.FamilyProfile)
        .filter(
            models.FamilyProfile.id == profile_id,
            models.FamilyProfile.owner_id == current_user.id,
        )
        .first()
    )
    if profile is None:
        raise HTTPException(status_code=404, detail="Family profile not found")
    profile.active = False
    db.commit()
    db.refresh(profile)
    return profile


@router.get("/api/measurements", response_model=list[schemas.MeasurementOut])
def list_measurements(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("patient")),
):
    return (
        db.query(models.HealthMeasurement)
        .filter(models.HealthMeasurement.user_id == current_user.id)
        .order_by(models.HealthMeasurement.recorded_at.desc())
        .limit(200)
        .all()
    )


@router.post(
    "/api/measurements",
    response_model=schemas.MeasurementOut,
    status_code=status.HTTP_201_CREATED,
)
def create_measurement(
    payload: schemas.MeasurementCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("patient")),
):
    recorded_at = _utc_naive(payload.recorded_at)
    measurement = models.HealthMeasurement(
        user_id=current_user.id,
        measurement_type=payload.measurement_type,
        value=payload.value,
        unit=payload.unit,
        source="manual",
        recorded_at=recorded_at,
    )
    db.add(measurement)
    db.commit()
    db.refresh(measurement)
    return measurement


@router.delete("/api/measurements/{measurement_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_measurement(
    measurement_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("patient")),
):
    measurement = (
        db.query(models.HealthMeasurement)
        .filter(
            models.HealthMeasurement.id == measurement_id,
            models.HealthMeasurement.user_id == current_user.id,
        )
        .first()
    )
    if measurement is None:
        raise HTTPException(status_code=404, detail="Measurement not found")
    db.delete(measurement)
    db.commit()


_TEST_DESCRIPTIONS = {
    "glucose": "Glucose is a form of sugar in the blood. The meaning depends on the test type, timing, and clinical context.",
    "hba1c": "HbA1c reflects average blood glucose over roughly the previous few months. A clinician interprets it using the laboratory range and your context.",
    "hemoglobin": "Hemoglobin is a protein in red blood cells that carries oxygen. A clinician interprets it with other results and your context.",
    "creatinine": "Creatinine is a waste product measured to help assess kidney function alongside other tests and clinical information.",
    "cholesterol": "Cholesterol tests measure blood lipids. Clinicians interpret them together with other health factors.",
    "tsh": "TSH is a hormone test used in evaluating thyroid function. Interpretation may depend on other thyroid tests and clinical context.",
}


@router.post("/api/report-explainer")
def explain_report_value(
    payload: schemas.ReportValueInput,
    current_user: models.User = Depends(require_role("patient")),
):
    if payload.reference_low is None or payload.reference_high is None:
        comparison = "reference_range_not_provided"
    elif not payload.unit or not payload.reference_unit:
        comparison = "reference_unit_missing_not_compared"
    elif payload.unit.casefold() != payload.reference_unit.casefold():
        comparison = "unit_mismatch_not_compared"
    elif payload.value < payload.reference_low:
        comparison = "below_user_provided_range"
    elif payload.value > payload.reference_high:
        comparison = "above_user_provided_range"
    else:
        comparison = "within_user_provided_range"

    normalized_name = payload.test_name.casefold()
    description = next(
        (
            text
            for test, text in _TEST_DESCRIPTIONS.items()
            if test in normalized_name
        ),
        "This test name is not in the limited educational guide. Ask a qualified clinician or the laboratory to explain it.",
    )
    return {
        "test_name": payload.test_name,
        "source_value": payload.value,
        "source_unit": payload.unit,
        "source_reference_low": payload.reference_low,
        "source_reference_high": payload.reference_high,
        "source_reference_unit": payload.reference_unit,
        "comparison": comparison,
        "general_information": description,
        "questions_for_clinician": [
            "How should this result be interpreted with my symptoms and medical history?",
            "Do I need repeat testing or any follow-up?",
        ],
        "notice": (
            "Educational information only, not a diagnosis. The comparison uses only "
            "the values and reference limits you entered; ranges vary by laboratory "
            "and clinical context. Normal results do not rule out disease, and an "
            "out-of-range result does not prove disease. Seek urgent care for emergencies."
        ),
        "content_status": "limited_educational_content_not_clinically_reviewed",
    }


@router.get("/api/government-schemes", response_model=list[schemas.GovernmentSchemeOut])
def list_verified_schemes(
    state: str | None = None,
    category: str | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.GovernmentScheme).filter(
        models.GovernmentScheme.review_status == "verified"
    )
    if state:
        query = query.filter(models.GovernmentScheme.state.ilike(f"%{state.strip()}%"))
    if category:
        query = query.filter(models.GovernmentScheme.category.ilike(f"%{category.strip()}%"))
    if search:
        term = f"%{search.strip()}%"
        query = query.filter(
            models.GovernmentScheme.name.ilike(term)
            | models.GovernmentScheme.beneficiaries.ilike(term)
        )
    return query.order_by(models.GovernmentScheme.name).limit(100).all()


@router.get("/api/admin/government-schemes", response_model=list[schemas.GovernmentSchemeOut])
def list_all_schemes(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("admin")),
):
    return db.query(models.GovernmentScheme).order_by(models.GovernmentScheme.name).all()


@router.post(
    "/api/admin/government-schemes",
    response_model=schemas.GovernmentSchemeOut,
    status_code=status.HTTP_201_CREATED,
)
def create_scheme(
    payload: schemas.GovernmentSchemeCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("admin")),
):
    scheme = models.GovernmentScheme(
        **payload.model_dump(),
        review_status="pending",
        created_by=current_user.id,
    )
    db.add(scheme)
    db.commit()
    db.refresh(scheme)
    return scheme


@router.patch(
    "/api/admin/government-schemes/{scheme_id}/review",
    response_model=schemas.GovernmentSchemeOut,
)
def review_scheme(
    scheme_id: int,
    payload: schemas.GovernmentSchemeReview,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("admin")),
):
    scheme = db.query(models.GovernmentScheme).filter(
        models.GovernmentScheme.id == scheme_id
    ).first()
    if scheme is None:
        raise HTTPException(status_code=404, detail="Scheme not found")
    if payload.review_status == "verified" and scheme.verification_date is None:
        raise HTTPException(
            status_code=422,
            detail="Set a verification date before publishing this scheme",
        )
    scheme.review_status = payload.review_status
    db.commit()
    db.refresh(scheme)
    return scheme
