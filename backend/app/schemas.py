import datetime as dt
from typing import Optional, List, Literal
from urllib.parse import urlparse

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator

from .models import UserRole, AppointmentStatus


# ---------- Auth / Users ----------

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.patient
    phone: Optional[str] = None
    specialization: Optional[str] = None


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None


class UserOut(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: UserRole
    phone: Optional[str] = None
    specialization: Optional[str] = None
    is_verified: bool = False
    created_at: dt.datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ---------- Symptoms / Predictions ----------

class SymptomInput(BaseModel):
    symptoms: List[str] = []
    free_text: Optional[str] = None
    age: Optional[int] = None
    sex: Optional[str] = None


class PredictionOut(BaseModel):
    id: int
    predicted_disease: str
    confidence: float
    severity: str
    recommendation: str
    symptoms_list: str
    created_at: dt.datetime

    class Config:
        from_attributes = True


class PredictionResponse(BaseModel):
    top_prediction: PredictionOut
    differential: List[dict]  # other candidate diseases with probabilities


# ---------- Hospitals ----------

class HospitalOut(BaseModel):
    id: int
    name: str
    city: str
    address: str
    phone: Optional[str] = None
    specialties: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    emergency_available: bool

    class Config:
        from_attributes = True


# ---------- Appointments ----------

class AppointmentCreate(BaseModel):
    doctor_id: Optional[int] = None
    hospital_id: Optional[int] = None
    prediction_id: Optional[int] = None
    scheduled_time: dt.datetime
    reason: Optional[str] = None


class AppointmentUpdate(BaseModel):
    status: Optional[AppointmentStatus] = None
    notes: Optional[str] = None
    scheduled_time: Optional[dt.datetime] = None


class AppointmentOut(BaseModel):
    id: int
    patient_id: int
    doctor_id: Optional[int]
    hospital_id: Optional[int]
    scheduled_time: dt.datetime
    reason: Optional[str]
    status: AppointmentStatus
    notes: Optional[str]
    created_at: dt.datetime

    class Config:
        from_attributes = True


# ---------- Medical Records ----------

class MedicalRecordCreate(BaseModel):
    title: str
    description: Optional[str] = None
    record_type: str = "note"


class MedicalRecordOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    file_path: Optional[str]
    record_type: str
    created_at: dt.datetime

    class Config:
        from_attributes = True


# ---------- Chatbot ----------

class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1000)
    language: Literal["en", "hi", "kn"] = "en"

    @field_validator("message")
    @classmethod
    def strip_message(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Message cannot be blank")
        return value


class ChatSource(BaseModel):
    title: str
    url: str
    applicable_audience: str
    precautions: str
    review_status: str


class ChatResponse(BaseModel):
    reply: str
    language: Literal["en", "hi", "kn"] = "en"
    sources: List[ChatSource] = Field(default_factory=list)
    safety_notices: List[str] = Field(default_factory=list)
    escalated: bool = False
    content_status: str


# ---------- Reports / Analytics ----------

class AnalyticsSummary(BaseModel):
    total_patients: int
    total_doctors: int
    total_predictions: int
    total_appointments: int
    predictions_by_severity: dict
    top_predicted_diseases: List[dict]


# ---------- Reminders ----------

class ReminderCreate(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    instructions: Optional[str] = Field(default=None, max_length=500)
    reminder_type: Literal["medicine", "appointment", "follow_up"]
    recurrence: Literal["none", "daily", "weekly"] = "none"
    scheduled_at: dt.datetime
    appointment_id: Optional[int] = None

    @field_validator("title")
    @classmethod
    def strip_title(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Title cannot be blank")
        return value

    @field_validator("scheduled_at")
    @classmethod
    def require_timezone(cls, value: dt.datetime) -> dt.datetime:
        if value.tzinfo is None or value.utcoffset() is None:
            raise ValueError("A timezone offset is required")
        return value.astimezone(dt.timezone.utc)

    @model_validator(mode="after")
    def validate_recurrence(self):
        if self.reminder_type == "appointment" and self.recurrence != "none":
            raise ValueError("Appointment reminders cannot recur")
        return self


class ReminderUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=160)
    instructions: Optional[str] = Field(default=None, max_length=500)
    scheduled_at: Optional[dt.datetime] = None
    active: Optional[bool] = None
    recurrence: Optional[Literal["none", "daily", "weekly"]] = None

    @field_validator("title")
    @classmethod
    def strip_update_title(cls, value: Optional[str]) -> Optional[str]:
        if value is not None:
            value = value.strip()
            if not value:
                raise ValueError("Title cannot be blank")
        return value

    @field_validator("recurrence")
    @classmethod
    def recurrence_cannot_be_null(
        cls, value: Optional[Literal["none", "daily", "weekly"]]
    ) -> Optional[Literal["none", "daily", "weekly"]]:
        if value is None:
            raise ValueError("Recurrence cannot be null")
        return value

    @field_validator("scheduled_at")
    @classmethod
    def require_timezone(cls, value: Optional[dt.datetime]) -> Optional[dt.datetime]:
        if value is not None:
            if value.tzinfo is None or value.utcoffset() is None:
                raise ValueError("A timezone offset is required")
            return value.astimezone(dt.timezone.utc)
        return value


class ReminderOut(BaseModel):
    id: int
    title: str
    instructions: Optional[str]
    reminder_type: str
    recurrence: str
    scheduled_at: dt.datetime
    appointment_id: Optional[int]
    active: bool
    completed_at: Optional[dt.datetime]
    status: Literal["scheduled", "missed", "paused", "taken"]

    @field_validator("scheduled_at", "completed_at", mode="before")
    @classmethod
    def mark_database_utc(cls, value):
        if value is not None and value.tzinfo is None:
            return value.replace(tzinfo=dt.timezone.utc)
        return value

    class Config:
        from_attributes = True


# ---------- Family profiles ----------

class FamilyProfileCreate(BaseModel):
    display_name: str = Field(min_length=1, max_length=120)
    relationship: str = Field(min_length=1, max_length=40)

    @field_validator("display_name", "relationship")
    @classmethod
    def strip_profile_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field cannot be blank")
        return value


class FamilyProfileUpdate(BaseModel):
    display_name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    relationship: Optional[str] = Field(default=None, min_length=1, max_length=40)

    @field_validator("display_name", "relationship")
    @classmethod
    def strip_profile_text(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        value = value.strip()
        if not value:
            raise ValueError("This field cannot be blank")
        return value


class FamilyProfileOut(BaseModel):
    id: int
    display_name: str
    relationship: str
    active: bool
    created_at: dt.datetime

    class Config:
        from_attributes = True


# ---------- Manually entered health measurements ----------

MEASUREMENT_UNITS = {
    "heart_rate": {"bpm": (20, 300)},
    "blood_pressure_systolic": {"mmHg": (40, 300)},
    "blood_pressure_diastolic": {"mmHg": (20, 200)},
    "blood_glucose": {"mg/dL": (10, 2000), "mmol/L": (0.5, 110)},
    "weight": {"kg": (0.1, 500)},
    "oxygen_saturation": {"%": (0, 100)},
    "steps": {"count": (0, 1_000_000)},
}


class MeasurementCreate(BaseModel):
    measurement_type: Literal[
        "heart_rate", "blood_pressure_systolic", "blood_pressure_diastolic",
        "blood_glucose", "weight", "oxygen_saturation", "steps",
    ]
    value: float = Field(allow_inf_nan=False)
    unit: str = Field(min_length=1, max_length=20)
    recorded_at: dt.datetime

    @model_validator(mode="after")
    def validate_measurement(self):
        limits = MEASUREMENT_UNITS[self.measurement_type].get(self.unit)
        if limits is None:
            raise ValueError("Unit does not match the selected measurement type")
        if not limits[0] <= self.value <= limits[1]:
            raise ValueError("Measurement is outside accepted input limits")
        if self.recorded_at.tzinfo is None or self.recorded_at.utcoffset() is None:
            raise ValueError("A timezone offset is required")
        self.recorded_at = self.recorded_at.astimezone(dt.timezone.utc)
        return self


class MeasurementOut(BaseModel):
    id: int
    measurement_type: str
    value: float
    unit: str
    source: str
    recorded_at: dt.datetime

    @field_validator("recorded_at", mode="before")
    @classmethod
    def mark_database_utc(cls, value):
        if value.tzinfo is None:
            return value.replace(tzinfo=dt.timezone.utc)
        return value

    class Config:
        from_attributes = True


# ---------- Educational report-value explanation ----------

class ReportValueInput(BaseModel):
    test_name: str = Field(min_length=1, max_length=120)
    value: float = Field(allow_inf_nan=False)
    unit: Optional[str] = Field(default=None, max_length=30)
    reference_low: Optional[float] = Field(default=None, allow_inf_nan=False)
    reference_high: Optional[float] = Field(default=None, allow_inf_nan=False)
    reference_unit: Optional[str] = Field(default=None, max_length=30)

    @field_validator("test_name")
    @classmethod
    def strip_test_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Test name cannot be blank")
        return value

    @model_validator(mode="after")
    def validate_reference_range(self):
        if self.reference_low is not None and self.reference_high is not None:
            if self.reference_low > self.reference_high:
                raise ValueError("Reference range lower bound must not exceed upper bound")
        return self


# ---------- Government health schemes ----------

class GovernmentSchemeCreate(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    state: str = Field(min_length=1, max_length=100)
    category: str = Field(min_length=1, max_length=100)
    beneficiaries: str = Field(min_length=1, max_length=500)
    purpose: str = Field(min_length=1, max_length=3000)
    benefits: str = Field(min_length=1, max_length=3000)
    application_process: str = Field(min_length=1, max_length=3000)
    required_documents: Optional[str] = Field(default=None, max_length=2000)
    official_url: str = Field(min_length=1, max_length=500)
    verification_date: Optional[dt.datetime] = None

    @field_validator("official_url")
    @classmethod
    def require_https_government_source(cls, value: str) -> str:
        parsed = urlparse(value)
        host = (parsed.hostname or "").lower()
        if parsed.scheme != "https" or not (host.endswith(".gov.in") or host.endswith(".nic.in")):
            raise ValueError("Use a verified HTTPS government .gov.in or .nic.in source")
        return value


class GovernmentSchemeReview(BaseModel):
    review_status: Literal["pending", "verified"]


class GovernmentSchemeOut(BaseModel):
    id: int
    name: str
    state: str
    category: str
    beneficiaries: str
    purpose: str
    benefits: str
    application_process: str
    required_documents: Optional[str]
    official_url: str
    verification_date: Optional[dt.datetime]
    review_status: str

    class Config:
        from_attributes = True
