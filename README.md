# MedAssist — AI-Powered Symptom Checker & Care Navigator

A full-stack demo app: React + Tailwind frontend, FastAPI backend, SQLite by
default (PostgreSQL is available for local development), and a small scikit-learn model for preliminary symptom→condition
triage.

**This is a portfolio/demo project.** The prediction model is trained on a
tiny synthetic dataset (`backend/app/ml/disease_data.csv`) for illustration
only — it is not medically validated and must not be used for real diagnosis.
Swap in a proper clinical dataset and validation process before any real use.

## What's included

- **Auth** — patient / doctor / admin roles, JWT login
- **Symptom analysis** — checkbox list + free text + voice input (Web Speech API)
- **Patient dashboard** — quick access to symptom checks, recent assessments, records, and upcoming appointments
- **Profile & emergency help** — update contact details, review health activity, call local emergency services, and find nearby emergency-capable hospitals
- **Disease prediction** — Naive Bayes model over symptom text, with a
  differential (ranked list of other possible conditions)
- **Severity analysis** — rule layer on top of the model (red-flag symptoms
  escalate to "high"/"emergency" regardless of model confidence)
- **Hospital recommendations** — directory search + distance sort from geolocation
- **Appointment booking** — patients book, doctors manage status
- **Medical records** — notes + file/image uploads
- **Patient history** — past assessments, downloadable PDF report
- **Admin dashboard** — manage users, manage hospitals
- **Doctor dashboard** — view patients, their assessment history, appointments
- **Reports & analytics** — charts (severity breakdown, top conditions)
- **HomeCare assistant** — controlled English/Hindi/Kannada educational replies,
  emergency escalation, safety notices, source links, voice input/playback, and
  a small static offline guide; it does not diagnose or call an external AI
- **PDF report generation** — via reportlab

## Project structure

```
medassist/
  backend/     FastAPI app, SQLAlchemy models, ML model, seed script
  frontend/    React (Vite) + Tailwind CSS
  docker-compose.yml   Optional Postgres for local dev
```

## Running it locally

### 1. Database

The backend uses local SQLite by default and creates `backend/medassist.db`
automatically. Docker/PostgreSQL is optional; set `DATABASE_URL` in
`backend/.env` if you want to use another database.

### 2. Backend (Windows PowerShell)
```bash
Set-Location .\backend
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt

# SQLite is the default and needs no .env file. For a custom setup, create
# backend\.env and set DATABASE_URL, SECRET_KEY, ACCESS_TOKEN_EXPIRE_MINUTES,
# ALGORITHM, and CORS_ORIGINS. Never commit real secrets.

python -m app.ml.train_model
python seed.py

python -m uvicorn app.main:app --reload --port 8000
```
API docs available at `http://localhost:8000/docs`.

### 3. Frontend (open a second PowerShell terminal)
```bash
Set-Location .\frontend
npm install
npm run dev
```
App runs at `http://localhost:5173` and proxies `/api` and `/uploads` to the
backend on port 8000.

### 4. Tests and production build
```powershell
# From the backend folder, with its virtual environment active:
python -m unittest discover -s tests -v

# From the frontend folder:
npm run build
```
The frontend package currently has no test-runner script; `npm run build` is
the available frontend validation.

### Database initialization

There are currently no Alembic revision files in this project. The backend
creates missing tables with SQLAlchemy `Base.metadata.create_all()` at startup;
this does not alter existing tables. Before starting the GreenCare version
against an existing database, run the additive migration from the backend
folder:

```powershell
Set-Location .\backend
python migrate_greencare.py
```

It adds the doctor-verification and reminder-recurrence columns without
dropping or resetting existing data. Back up the database before upgrading.
This is not a substitute for a reviewed migration strategy for production.

## Additional care tools and limitations

- The patient dashboard links to **Care tools**: reminders, basic dependent
  profiles, manual health measurements, a manual lab-value explainer, a
  government-scheme catalogue, an offline guide, and appointment information.
- **Reminders** are stored per patient and support editing, daily/weekly
  recurrence, appointment linkage, pause/resume, taken/missed status, and
  deletion. Marking a recurring reminder taken schedules its next occurrence.
  Optional browser alerts are in-page only: they require permission and work
  only while MedAssist is open. There is no background scheduler, email, SMS,
  or push service; the missed label does not establish whether a dose was taken.
- Care-tool APIs are under `/api`: reminders (`GET/POST /reminders`,
  `PATCH /reminders/{id}`, `POST /reminders/{id}/complete`,
  `DELETE /reminders/{id}`); dependent profiles (`GET/POST /family-profiles`,
  `PATCH /family-profiles/{id}`, `PATCH /family-profiles/{id}/deactivate`);
  measurements (`GET/POST /measurements`, `DELETE /measurements/{id}`);
  manual report values (`POST /report-explainer`); and verified public schemes
  (`GET /government-schemes`). Admin scheme maintenance is under
  `/admin/government-schemes`.
- **Dependent profiles** store only a display name and relationship under the
  owner's account. They are not linked to records or appointments. They do not
  provide access to an adult's account or implement consent-based sharing.
- **Lab result explainer** compares manually entered numeric values only with
  the reference limits and units the user enters. A missing or mismatched unit
  prevents comparison. It is not generative AI, does not read uploaded
  PDFs/images, has limited English educational descriptions, and is not
  clinically reviewed.
- **Offline health guide** reuses the limited static English/Hindi/Kannada
  guide. The service worker caches the public app shell and same-origin static
  assets only; it explicitly does not cache `/api` responses or `/uploads`.
  Live chat, appointments, hospital search, and emergency connectivity require
  a network. The guide still requires clinical review.
- **Health measurements** currently support manual entry only, with source and
  timestamp displayed. Apple Health, Health Connect, Bluetooth, and wearable
  integrations are not configured.
- **Government schemes** are not pre-populated with unverified claims. Admins
  can add catalogue entries using HTTPS `.gov.in`/`.nic.in` source URLs and a
  date checked; entries remain hidden until an administrator marks them
  verified. The catalogue does not submit applications or make eligibility
  decisions.
- **Video consultation** uses appointment-authorized WebRTC signaling and
  browser camera/microphone access for confirmed appointments assigned to an
  active, admin-verified doctor. Calls are peer-to-peer and are not recorded.
  Browser calls require HTTPS (localhost is suitable for development). Without
  a configured TURN relay, calls may fail behind some NATs or firewalls. The
  signaling room manager is single-process; multi-worker deployments require
  shared signaling/pub-sub. There is no recording, report-sharing flow, or
  emergency-call functionality.

Optional WebRTC networking settings can be added to `backend\.env`:

```dotenv
WEBRTC_STUN_URLS=stun:your-stun-host.example:3478
TURN_SERVER_URLS=turn:your-turn-host.example:3478,turns:your-turn-host.example:5349
TURN_SHARED_SECRET=replace-with-the-provider-shared-secret
```

The TURN shared secret remains on the backend; temporary credentials are
issued to an authenticated caller. Obtain and review these values with your
provider rather than using the example values. Do not add patient reports or
health data to third-party services without a reviewed privacy and security
design. Doctor accounts require manual administrator verification before they
appear in the directory or can be assigned to new appointments.

### Demo accounts (after `seed.py`)
| Role   | Email                        | Password  |
|--------|------------------------------|-----------|
| Admin  | admin@medassist.dev          | admin123  |
| Doctor | dr.sharma@medassist.dev      | doctor123 |
| Doctor | dr.rao@medassist.dev         | doctor123 |

Sign up as a new **patient** through the app UI.

## HomeCare assistant safety, privacy, and limitations

- The authenticated `POST /api/chatbot` endpoint accepts a message (up to
  1,000 characters) and a response language (`en`, `hi`, or `kn`). Replies are
  selected from a small deterministic catalogue; no generative AI provider or
  third-party AI API is configured.
- Emergency cues are handled before routine topics and direct the user to call
  112 in India or the local emergency number elsewhere. The chat cannot assess
  or rule out an emergency.
- Catalogue replies include source links, audience/precaution metadata, and an
  explicit `educational_draft_needs_clinical_review` status. Linking a source
  does not mean that the text has been checked against it or reviewed by a
  clinician. The material is not approved for clinical use.
- The frontend includes a limited static guide for mild sore throat, cough,
  indigestion, hydration, medicine safety, and prevention. It works while the
  page is loaded without a network connection; live replies and directory
  searches do not. Unsupported offline questions show an error instead of
  inventing an answer.
- Chat messages are kept only in the current page's memory and are not saved
  to the MedAssist chat-history database. The selected language preference is
  stored in browser local storage. Do not enter identifying or sensitive
  medical information.
- Voice recognition and speech playback depend on browser support and
  installed language voices. Speech recognition may be processed by the
  browser or its provider; typed input remains available. The assistant uses
  English, Hindi, and Kannada response templates, not general-purpose
  translation.
- Hospital search checks only existing directory name, city, address, and
  specialty fields. A village, town, district, or PIN search can only find a
  match if that text exists in those fields. Coverage may be incomplete; the
  app does not verify PHC/CHC status, facility hours, services, or availability.
- The chatbot allows 30 requests per user per minute per backend process. This
  in-memory limiter is not shared across multiple workers or servers.
- Before public or clinical use, have every response and translation reviewed
  by qualified clinicians, verify and maintain source links, add appropriate
  privacy/security controls, and validate emergency and accessibility behavior.

## Notes on the advanced features

- **Voice input** uses the browser's native `SpeechRecognition` API (Chrome/Edge).
  No extra backend work needed; it just fills the free-text symptom field.
- **Medical image upload** stores the file and attaches it to the patient's
  record for a doctor to review — it does **not** run automated image
  diagnosis in this demo. Wire in a vision model in
  `backend/app/routers/uploads.py` if you want to extend this.
- **PDF reports** are generated per-assessment via `/api/predictions/{id}/pdf`.

## Extending toward production

- Replace the toy CSV dataset with a real, clinically-reviewed symptom-disease
  dataset, and re-evaluate the model properly (train/test split, confusion
  matrix, clinician review) before trusting its output.
- Add Alembic migrations instead of `create_all`.
- Move file uploads to S3/Azure Blob instead of local disk.
- Add rate limiting and audit logging (this handles health data).
- Add HTTPS, proper secrets management, and CORS lockdown for production.
