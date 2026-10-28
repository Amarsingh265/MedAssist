import datetime as dt
import unittest

from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app import models, schemas
from app.database import Base
from app.routers.appointments import update_appointment


class AppointmentAuthorizationTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        Base.metadata.create_all(bind=self.engine)
        self.db = sessionmaker(bind=self.engine)()
        self.patient = models.User(
            full_name="Patient",
            email="patient@test.local",
            hashed_password="test",
            role=models.UserRole.patient,
        )
        self.other_patient = models.User(
            full_name="Other patient",
            email="other@test.local",
            hashed_password="test",
            role=models.UserRole.patient,
        )
        self.doctor = models.User(
            full_name="Verified doctor",
            email="doctor@test.local",
            hashed_password="test",
            role=models.UserRole.doctor,
            is_verified=True,
        )
        self.other_doctor = models.User(
            full_name="Other doctor",
            email="other-doctor@test.local",
            hashed_password="test",
            role=models.UserRole.doctor,
            is_verified=True,
        )
        self.admin = models.User(
            full_name="Admin",
            email="admin@test.local",
            hashed_password="test",
            role=models.UserRole.admin,
        )
        self.db.add_all([
            self.patient,
            self.other_patient,
            self.doctor,
            self.other_doctor,
            self.admin,
        ])
        self.db.commit()
        self.appointment = models.Appointment(
            patient_id=self.patient.id,
            doctor_id=self.doctor.id,
            scheduled_time=dt.datetime.now(dt.timezone.utc).replace(tzinfo=None),
            status=models.AppointmentStatus.pending,
        )
        self.db.add(self.appointment)
        self.db.commit()

    def tearDown(self):
        self.db.close()
        self.engine.dispose()

    def test_only_assigned_verified_doctor_can_confirm_appointment(self):
        with self.assertRaises(HTTPException) as error:
            update_appointment(
                self.appointment.id,
                schemas.AppointmentUpdate(status="confirmed"),
                self.db,
                self.other_doctor,
            )
        self.assertEqual(error.exception.status_code, 403)

        with self.assertRaises(HTTPException) as error:
            update_appointment(
                self.appointment.id,
                schemas.AppointmentUpdate(status="completed"),
                self.db,
                self.doctor,
            )
        self.assertEqual(error.exception.status_code, 409)

        updated = update_appointment(
            self.appointment.id,
            schemas.AppointmentUpdate(status="confirmed"),
            self.db,
            self.doctor,
        )
        self.assertEqual(updated.status, models.AppointmentStatus.confirmed)

    def test_patient_can_only_cancel_their_own_noncompleted_appointment(self):
        with self.assertRaises(HTTPException) as error:
            update_appointment(
                self.appointment.id,
                schemas.AppointmentUpdate(status="confirmed"),
                self.db,
                self.patient,
            )
        self.assertEqual(error.exception.status_code, 403)

        with self.assertRaises(HTTPException) as error:
            update_appointment(
                self.appointment.id,
                schemas.AppointmentUpdate(status="cancelled"),
                self.db,
                self.other_patient,
            )
        self.assertEqual(error.exception.status_code, 403)

        updated = update_appointment(
            self.appointment.id,
            schemas.AppointmentUpdate(status="cancelled"),
            self.db,
            self.patient,
        )
        self.assertEqual(updated.status, models.AppointmentStatus.cancelled)

        with self.assertRaises(HTTPException) as error:
            update_appointment(
                self.appointment.id,
                schemas.AppointmentUpdate(status="cancelled"),
                self.db,
                self.patient,
            )
        self.assertEqual(error.exception.status_code, 409)


if __name__ == "__main__":
    unittest.main()
