from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database import Base, engine
from .config import settings
from .routers import (
    auth, predictions, hospitals, appointments, records,
    doctors, admin, reports, chatbot, uploads, care_tools, consultations,
)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="MedAssist API", version="1.0.0")

origins = [o.strip() for o in settings.cors_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router)
app.include_router(predictions.router)
app.include_router(hospitals.router)
app.include_router(appointments.router)
app.include_router(records.router)
app.include_router(doctors.router)
app.include_router(admin.router)
app.include_router(reports.router)
app.include_router(chatbot.router)
app.include_router(uploads.router)
app.include_router(care_tools.router)
app.include_router(consultations.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "MedAssist API"}


@app.get("/health")
def health():
    return {"status": "healthy"}
