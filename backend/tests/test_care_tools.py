import datetime as dt
import unittest

from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from pydantic import ValidationError

from app import models, schemas
from app.database import Base
from app.deps import require_role
from app.routers import care_tools


class CareToolsTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        Base.metadata.create_all(bind=self.engine)
        self.session_factory = sessionmaker(bind=self.engine)
        self.db = self.session_factory()
        self.patient = models.User(
            full_name="Test Patient",
            email="patient@example.test",
            hashed_password="not-a-real-password",
            role=models.UserRole.patient,
        )
        self.other_patient = models.User(
            full_name="Other Patient",
            email="other@example.test",
            hashed_password="not-a-real-password",
            role=models.UserRole.patient,
        )
        self.admin = models.User(
            full_name="Test Admin",
            email="admin@example.test",
            hashed_password="not-a-real-password",
            role=models.UserRole.admin,
        )
        self.db.add_all([self.patient, self.other_patient, self.admin])
        self.db.commit()

    def tearDown(self):
        self.db.close()
        self.engine.dispose()

    def test_reminders_require_timezone_and_are_scoped_to_owner(self):
        with self.assertRaises(ValidationError):
            schemas.ReminderCreate(
                title="Medicine",
                reminder_type="medicine",
                scheduled_at=dt.datetime(2026, 10, 16, 9),
            )
        payload = schemas.ReminderCreate(
            title=" Medicine ",
            reminder_type="medicine",
            scheduled_at=dt.datetime.fromisoformat("2026-10-16T09:00:00+05:30"),
        )
        self.assertEqual(payload.title, "Medicine")
        self.assertEqual(payload.scheduled_at.utcoffset(), dt.timedelta(0))

        created = care_tools.create_reminder(payload, self.db, self.patient)
        response = schemas.ReminderOut.model_validate(created)
        self.assertEqual(response.scheduled_at.utcoffset(), dt.timedelta(0))
        care_tools.create_reminder(payload, self.db, self.other_patient)
        self.assertEqual(len(care_tools.list_reminders(self.db, self.patient)), 1)
        foreign_id = (
            self.db.query(models.Reminder)
            .filter(models.Reminder.user_id == self.other_patient.id)
            .one()
            .id
        )
        with self.assertRaises(HTTPException) as error:
            care_tools.delete_reminder(foreign_id, self.db, self.patient)
        self.assertEqual(error.exception.status_code, 404)

    def test_appointment_reminder_cannot_reference_another_users_appointment(self):
        appointment = models.Appointment(
            patient_id=self.other_patient.id,
            scheduled_time=dt.datetime(2026, 10, 17, 10),
        )
        self.db.add(appointment)
        self.db.commit()
        payload = schemas.ReminderCreate(
            title="Visit",
            reminder_type="appointment",
            appointment_id=appointment.id,
            scheduled_at=dt.datetime.fromisoformat("2026-10-17T10:00:00+00:00"),
        )
        with self.assertRaises(HTTPException) as error:
            care_tools.create_reminder(payload, self.db, self.patient)
        self.assertEqual(error.exception.status_code, 404)

    def test_reminder_recurrence_creates_next_occurrence_when_marked_taken(self):
        scheduled_at = dt.datetime.now(dt.timezone.utc).replace(microsecond=0)
        payload = schemas.ReminderCreate(
            title="Medicine",
            reminder_type="medicine",
            recurrence="daily",
            scheduled_at=scheduled_at,
        )
        created = care_tools.create_reminder(payload, self.db, self.patient)

        completed = care_tools.complete_reminder(created.id, self.db, self.patient)
        self.assertEqual(completed.status, "taken")
        reminders = care_tools.list_reminders(self.db, self.patient)
        self.assertEqual(len(reminders), 2)
        next_occurrence = next(item for item in reminders if item.id != created.id)
        self.assertEqual(next_occurrence.recurrence, "daily")
        self.assertEqual(
            next_occurrence.scheduled_at,
            created.scheduled_at + dt.timedelta(days=1),
        )

        with self.assertRaises(HTTPException) as error:
            care_tools.complete_reminder(created.id, self.db, self.patient)
        self.assertEqual(error.exception.status_code, 409)

    def test_appointment_reminders_cannot_repeat_or_clear_recurrence(self):
        with self.assertRaises(ValidationError):
            schemas.ReminderCreate(
                title="Visit",
                reminder_type="appointment",
                recurrence="weekly",
                scheduled_at=dt.datetime.now(dt.timezone.utc),
            )
        with self.assertRaises(ValidationError):
            schemas.ReminderUpdate(recurrence=None)

        payload = schemas.ReminderCreate(
            title="Visit",
            reminder_type="appointment",
            scheduled_at=dt.datetime.now(dt.timezone.utc),
        )
        reminder = care_tools.create_reminder(payload, self.db, self.patient)
        with self.assertRaises(HTTPException) as error:
            care_tools.update_reminder(
                reminder.id,
                schemas.ReminderUpdate(recurrence="weekly"),
                self.db,
                self.patient,
            )
        self.assertEqual(error.exception.status_code, 422)

    def test_family_profiles_are_limited_to_the_owning_account(self):
        profile = care_tools.create_family_profile(
            schemas.FamilyProfileCreate(display_name="Dependent", relationship="child"),
            self.db,
            self.patient,
        )
        self.assertEqual(len(care_tools.list_family_profiles(self.db, self.patient)), 1)
        self.assertEqual(care_tools.list_family_profiles(self.db, self.other_patient), [])
        with self.assertRaises(HTTPException) as error:
            care_tools.deactivate_family_profile(profile.id, self.db, self.other_patient)
        self.assertEqual(error.exception.status_code, 404)

    def test_role_guard_rejects_non_patient_care_tool_access(self):
        patient_guard = require_role("patient")
        self.assertIs(patient_guard(self.patient), self.patient)
        with self.assertRaises(HTTPException) as error:
            patient_guard(self.admin)
        self.assertEqual(error.exception.status_code, 403)

    def test_measurements_validate_units_and_are_marked_manual(self):
        with self.assertRaises(ValidationError):
            schemas.MeasurementCreate(
                measurement_type="heart_rate",
                value=74,
                unit="kg",
                recorded_at=dt.datetime.fromisoformat("2026-10-16T09:00:00+05:30"),
            )
        payload = schemas.MeasurementCreate(
            measurement_type="heart_rate",
            value=74,
            unit="bpm",
            recorded_at=dt.datetime.fromisoformat("2026-10-16T09:00:00+05:30"),
        )
        measurement = care_tools.create_measurement(payload, self.db, self.patient)
        self.assertEqual(measurement.source, "manual")
        self.assertEqual(measurement.user_id, self.patient.id)
        response = schemas.MeasurementOut.model_validate(measurement)
        self.assertEqual(response.recorded_at.utcoffset(), dt.timedelta(0))

    def test_report_explainer_only_compares_values_to_submitted_range(self):
        payload = schemas.ReportValueInput(
            test_name="Glucose",
            value=140,
            unit="mg/dL",
            reference_low=70,
            reference_high=99,
            reference_unit="mg/dL",
        )
        result = care_tools.explain_report_value(payload, self.patient)
        self.assertEqual(result["comparison"], "above_user_provided_range")
        self.assertEqual(result["source_value"], 140)
        self.assertIn("not a diagnosis", result["notice"])
        self.assertEqual(result["content_status"], "limited_educational_content_not_clinically_reviewed")

    def test_report_explainer_does_not_compare_mismatched_units(self):
        payload = schemas.ReportValueInput(
            test_name="Glucose",
            value=7,
            unit="mmol/L",
            reference_low=70,
            reference_high=99,
            reference_unit="mg/dL",
        )
        result = care_tools.explain_report_value(payload, self.patient)
        self.assertEqual(result["comparison"], "unit_mismatch_not_compared")

    def test_schemes_are_hidden_until_admin_marks_them_verified(self):
        scheme = models.GovernmentScheme(
            name="Example scheme for tests",
            state="Karnataka",
            category="Health",
            beneficiaries="Test beneficiaries",
            purpose="Test purpose",
            benefits="Test benefits",
            application_process="Test process",
            official_url="https://health.example.gov.in/scheme",
            review_status="pending",
            created_by=self.admin.id,
        )
        self.db.add(scheme)
        self.db.commit()
        self.assertEqual(care_tools.list_verified_schemes(None, None, None, self.db), [])

        with self.assertRaises(HTTPException):
            care_tools.review_scheme(
                scheme.id,
                schemas.GovernmentSchemeReview(review_status="verified"),
                self.db,
                self.admin,
            )

        scheme.verification_date = dt.datetime(2026, 10, 16)
        self.db.commit()
        care_tools.review_scheme(
            scheme.id,
            schemas.GovernmentSchemeReview(review_status="verified"),
            self.db,
            self.admin,
        )
        self.assertEqual(len(care_tools.list_verified_schemes(None, None, None, self.db)), 1)

    def test_scheme_source_requires_https_government_domain(self):
        with self.assertRaises(ValidationError):
            schemas.GovernmentSchemeCreate(
                name="Test",
                state="India",
                category="Health",
                beneficiaries="People",
                purpose="Purpose",
                benefits="Benefits",
                application_process="Apply",
                official_url="http://example.com",
            )


if __name__ == "__main__":
    unittest.main()
