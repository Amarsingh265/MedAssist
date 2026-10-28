"""
Seed the database with an admin user, a couple of doctors, and sample
hospitals so the app is usable immediately after setup.

Run with:  python seed.py
"""
from app.database import SessionLocal, Base, engine
from app import models
from app.security import hash_password

Base.metadata.create_all(bind=engine)
db = SessionLocal()

if not db.query(models.User).filter(models.User.email == "admin@medassist.dev").first():
    db.add(models.User(
        full_name="System Admin",
        email="admin@medassist.dev",
        hashed_password=hash_password("admin123"),
        role=models.UserRole.admin,
    ))

if not db.query(models.User).filter(models.User.email == "dr.sharma@medassist.dev").first():
    db.add(models.User(
        full_name="Dr. Anjali Sharma",
        email="dr.sharma@medassist.dev",
        hashed_password=hash_password("doctor123"),
        role=models.UserRole.doctor,
        specialization="General Physician",
    ))

if not db.query(models.User).filter(models.User.email == "dr.rao@medassist.dev").first():
    db.add(models.User(
        full_name="Dr. Vikram Rao",
        email="dr.rao@medassist.dev",
        hashed_password=hash_password("doctor123"),
        role=models.UserRole.doctor,
        specialization="Cardiologist",
    ))

db.commit()

if db.query(models.Hospital).count() == 0:
    db.add_all([
        models.Hospital(
            name="City General Hospital", city="Davangere",
            address="MG Road, Davangere, Karnataka",
            phone="+91-8192-000111", specialties="General Medicine, Emergency",
            latitude=14.4644, longitude=75.9218, emergency_available=True,
        ),
        models.Hospital(
            name="Sunrise Multispecialty Hospital", city="Davangere",
            address="Church Road, Davangere, Karnataka",
            phone="+91-8192-000222", specialties="Cardiology, Orthopedics",
            latitude=14.4700, longitude=75.9150, emergency_available=True,
        ),
        models.Hospital(
            name="Green Valley Clinic", city="Davangere",
            address="P.J. Extension, Davangere, Karnataka",
            phone="+91-8192-000333", specialties="Family Medicine",
            latitude=14.4600, longitude=75.9300, emergency_available=False,
        ),
    ])
    db.commit()

print("Seed complete:")
print("  Admin login:  admin@medassist.dev / admin123")
print("  Doctor login: dr.sharma@medassist.dev / doctor123")
print("  Doctor login: dr.rao@medassist.dev / doctor123")

db.close()
