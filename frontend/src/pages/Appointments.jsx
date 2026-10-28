import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'

const EMPTY_FORM = { doctor_id: '', hospital_id: '', scheduled_time: '', reason: '' }

function localDateTimeMinimum() {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
}

function statusClass(status) {
  if (status === 'confirmed') return 'bg-emerald-50 text-emerald-800'
  if (status === 'cancelled') return 'bg-red-50 text-red-800'
  if (status === 'completed') return 'bg-surface text-ink/65'
  return 'bg-amber-50 text-amber-900'
}

export default function Appointments() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [hospitals, setHospitals] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [actionId, setActionId] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function loadAll(showLoading = true) {
    if (showLoading) setLoading(true)
    setError('')
    try {
      const [appointmentsResponse, doctorsResponse, hospitalsResponse] = await Promise.all([
        client.get('/appointments/mine'),
        client.get('/doctors'),
        client.get('/hospitals'),
      ])
      setAppointments(appointmentsResponse.data)
      setDoctors(doctorsResponse.data)
      setHospitals(hospitalsResponse.data)
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Could not load appointments. Check your connection and retry.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAll() }, [])

  async function handleBook(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    if (!form.scheduled_time) {
      setError('Please choose a date and time.')
      return
    }
    setSaving(true)
    try {
      await client.post('/appointments', {
        doctor_id: form.doctor_id ? Number(form.doctor_id) : null,
        hospital_id: form.hospital_id ? Number(form.hospital_id) : null,
        scheduled_time: new Date(form.scheduled_time).toISOString(),
        reason: form.reason.trim() || null,
      })
      setForm(EMPTY_FORM)
      setNotice('Your appointment request was sent. It is not confirmed until the clinic confirms it.')
      await loadAll(false)
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Could not book appointment.')
    } finally {
      setSaving(false)
    }
  }

  async function updateStatus(id, status) {
    setActionId(id)
    setError('')
    setNotice('')
    try {
      await client.patch(`/appointments/${id}`, { status })
      setNotice(status === 'cancelled' ? 'Appointment cancelled.' : `Appointment marked ${status}.`)
      await loadAll(false)
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Could not update appointment.')
    } finally {
      setActionId(null)
    }
  }

  return (
    <div className="page-content mx-auto max-w-7xl space-y-7 px-5 py-8 md:px-8 md:py-9">
      <header>
        <p className="text-xs font-bold tracking-[0.18em] text-accent">PLAN YOUR CARE</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-primary">Appointments</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/65">Request a clinic visit and see its status. A request is not confirmed until your care provider confirms it.</p>
      </header>

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">{error}</p>}
      {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">{notice}</p>}

      {user?.role === 'patient' && (
        <form onSubmit={handleBook} className="card grid gap-5 p-5 sm:grid-cols-2 md:p-7">
          <div className="sm:col-span-2">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-accent">NEW REQUEST</p>
            <h2 className="mt-1 font-display text-xl font-bold text-primary">Book an appointment</h2>
            <p className="mt-1 text-sm text-ink/60">Choose an available, verified doctor or leave the provider unspecified.</p>
          </div>
          <div>
            <label className="label" htmlFor="appointment-doctor">Doctor <span className="font-normal text-ink/50">(optional)</span></label>
            <select id="appointment-doctor" className="input" value={form.doctor_id} onChange={(event) => setForm({ ...form, doctor_id: event.target.value })}>
              <option value="">Any / unspecified</option>
              {doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.full_name}{doctor.specialization ? ` — ${doctor.specialization}` : ''}</option>)}
            </select>
            {doctors.length === 0 && <p className="mt-1 text-xs text-ink/55">No verified doctors are available in the directory right now.</p>}
          </div>
          <div>
            <label className="label" htmlFor="appointment-hospital">Hospital <span className="font-normal text-ink/50">(optional)</span></label>
            <select id="appointment-hospital" className="input" value={form.hospital_id} onChange={(event) => setForm({ ...form, hospital_id: event.target.value })}>
              <option value="">Any / unspecified</option>
              {hospitals.map((hospital) => <option key={hospital.id} value={hospital.id}>{hospital.name} · {hospital.city}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="appointment-time">Date and time</label>
            <input id="appointment-time" required type="datetime-local" min={localDateTimeMinimum()} className="input" value={form.scheduled_time} onChange={(event) => setForm({ ...form, scheduled_time: event.target.value })} />
            <p className="mt-1 text-xs text-ink/50">Uses your device’s local time zone.</p>
          </div>
          <div>
            <label className="label" htmlFor="appointment-reason">Reason for visit <span className="font-normal text-ink/50">(optional)</span></label>
            <input id="appointment-reason" maxLength="240" className="input" value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} placeholder="Briefly describe why you need a visit" />
          </div>
          <button className="btn-primary sm:col-span-2 sm:justify-self-start" disabled={saving}>{saving ? 'Sending request…' : 'Request appointment'} <span aria-hidden="true">→</span></button>
        </form>
      )}

      <section aria-labelledby="appointment-list">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-accent">CARE SCHEDULE</p>
          <h2 id="appointment-list" className="mt-1 font-display text-xl font-bold text-primary">{user?.role === 'doctor' ? 'Your appointments' : 'Your appointment requests'}</h2>
        </div>
        {loading ? (
          <div role="status" className="card flex items-center gap-3 p-6"><span className="h-5 w-5 animate-spin rounded-full border-2 border-primary/20 border-t-primary" /><span className="text-sm text-ink/60">Loading appointments…</span></div>
        ) : appointments.length === 0 ? (
          <div className="card p-8 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-xl text-primary" aria-hidden="true">▣</span>
            <h3 className="mt-4 font-semibold text-primary">No appointments to show</h3>
            <p className="mt-1 text-sm text-ink/60">{user?.role === 'doctor' ? 'Assigned appointments will appear here.' : 'Your appointment requests will appear here after booking.'}</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {appointments.map((appointment) => {
              const doctor = doctors.find((item) => item.id === appointment.doctor_id)
              return (
                <article key={appointment.id} className="card flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center">
                  <div className="flex min-w-0 items-start gap-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-lg text-primary" aria-hidden="true">▣</span>
                    <div className="min-w-0">
                      <p className="font-semibold text-primary">{new Date(appointment.scheduled_time).toLocaleString()}</p>
                      {user?.role === 'patient' && <p className="mt-1 text-sm text-ink/60">{doctor ? `Dr. ${doctor.full_name}${doctor.specialization ? ` · ${doctor.specialization}` : ''}` : 'Provider not assigned'}</p>}
                      <p className="mt-1 text-sm text-ink/60">{appointment.reason || 'No reason provided'}</p>
                      <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClass(appointment.status)}`}>{appointment.status}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 md:shrink-0">
                    {user?.role === 'doctor' && (
                      <label className="sr-only" htmlFor={`appointment-status-${appointment.id}`}>Update appointment {appointment.id} status</label>
                    )}
                    {user?.role === 'doctor' && (
                      <select id={`appointment-status-${appointment.id}`} className="input !w-auto text-sm" value={appointment.status} disabled={actionId === appointment.id || appointment.status === 'completed' || appointment.status === 'cancelled'} onChange={(event) => updateStatus(appointment.id, event.target.value)}>
                        {(appointment.status === 'pending'
                          ? ['pending', 'confirmed', 'cancelled']
                          : ['confirmed', 'completed', 'cancelled']
                        ).map((status) => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}
                      </select>
                    )}
                    {user?.role === 'patient' && !['completed', 'cancelled'].includes(appointment.status) && (
                      <button type="button" className="btn-secondary text-sm" disabled={actionId === appointment.id} onClick={() => updateStatus(appointment.id, 'cancelled')}>{actionId === appointment.id ? 'Updating…' : 'Cancel request'}</button>
                    )}
                    {user?.role === 'patient' && appointment.status === 'confirmed' && (
                      <Link to="/consultations" className="btn-primary text-sm">Video consultation</Link>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
