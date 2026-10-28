import enum
import datetime as dt

from sqlalchemy import (
    Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text, Enum
)
from sqlalchemy.orm import relationship

from .database import Base


def _utcnow_naive() -> dt.datetime:
    return dt.datetime.now(dt.timezone.utc).replace(tzinfo=None)


class UserRole(str, enum.Enum):
    patient = "patient"
    doctor = "doctor"
    admin = "admin"


class AppointmentStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    completed = "completed"
    cancelled = "cancelled"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.patient, nullable=False)
    phone = Column(String, nullable=True)
    specialization = Column(String, nullable=True)  # for doctors
    created_at = Column(DateTime, default=dt.datetime.utcnow)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False, nullable=False)

    predictions = relationship("Prediction", back_populates="patient")
    appointments_as_patient = relationship(
        "Appointment", foreign_keys="Appointment.patient_id", back_populates="patient"
    )
    appointments_as_doctor = relationship(
        "Appointment", foreign_keys="Appointment.doctor_id", back_populates="doctor"
    )


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    symptoms_text = Column(Text, nullable=False)
    symptoms_list = Column(Text, nullable=False)  # comma separated, normalized
    predicted_disease = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    severity = Column(String, nullable=False)  # low / moderate / high / emergency
    recommendation = Column(Text, nullable=False)
    created_at = Column(DateTime, default=dt.datetime.utcnow)

    patient = relationship("User", back_populates="predictions")


class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    city = Column(String, nullable=False)
    address = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    specialties = Column(String, nullable=True)  # comma separated
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    emergency_available = Column(Boolean, default=True)


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=True)
    prediction_id = Column(Integer, ForeignKey("predictions.id"), nullable=True)
    scheduled_time = Column(DateTime, nullable=False)
    reason = Column(String, nullable=True)
    status = Column(Enum(AppointmentStatus), default=AppointmentStatus.pending)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=dt.datetime.utcnow)

    patient = relationship(
        "User", foreign_keys=[patient_id], back_populates="appointments_as_patient"
    )
    doctor = relationship(
        "User", foreign_keys=[doctor_id], back_populates="appointments_as_doctor"
    )
    hospital = relationship("Hospital")


class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    file_path = Column(String, nullable=True)  # uploaded image / document
    record_type = Column(String, default="note")  # note / image / lab_report
    created_at = Column(DateTime, default=dt.datetime.utcnow)

    patient = relationship("User")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    sender = Column(String, nullable=False)  # user / bot
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=dt.datetime.utcnow)


class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=True, index=True)
    title = Column(String(160), nullable=False)
    instructions = Column(String(500), nullable=True)
    reminder_type = Column(String(20), nullable=False)
    recurrence = Column(String(20), nullable=False, default="none")
    scheduled_at = Column(DateTime(timezone=True), nullable=False, index=True)
    active = Column(Boolean, default=True, nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime, default=_utcnow_naive, nullable=False)

    @property
    def status(self) -> str:
        if self.completed_at is not None:
            return "taken"
        if not self.active:
            return "paused"
        scheduled = self.scheduled_at
        if scheduled.tzinfo is not None:
            scheduled = scheduled.astimezone(dt.timezone.utc).replace(tzinfo=None)
        if scheduled <= _utcnow_naive():
            return "missed"
        return "scheduled"


class FamilyProfile(Base):
    __tablename__ = "family_profiles"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    display_name = Column(String(120), nullable=False)
    relationship = Column(String(40), nullable=False)
    active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=_utcnow_naive, nullable=False)


class HealthMeasurement(Base):
    __tablename__ = "health_measurements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    measurement_type = Column(String(30), nullable=False)
    value = Column(Float, nullable=False)
    unit = Column(String(20), nullable=False)
    source = Column(String(80), nullable=False, default="manual")
    recorded_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime, default=_utcnow_naive, nullable=False)


class GovernmentScheme(Base):
    __tablename__ = "government_schemes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(160), nullable=False)
    state = Column(String(100), nullable=False, default="India")
    category = Column(String(100), nullable=False)
    beneficiaries = Column(String(500), nullable=False)
    purpose = Column(Text, nullable=False)
    benefits = Column(Text, nullable=False)
    application_process = Column(Text, nullable=False)
    required_documents = Column(Text, nullable=True)
    official_url = Column(String(500), nullable=False)
    verification_date = Column(DateTime, nullable=True)
    review_status = Column(String(20), nullable=False, default="pending")
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
