import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'

const EMPTY_STATS = { appointments: 0, records: 0, assessments: 0 }

export default function Profile() {
  const { user, updateProfile } = useAuth()
  const [form, setForm] = useState({ full_name: user?.full_name || '', phone: user?.phone || '' })
  const [stats, setStats] = useState(EMPTY_STATS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true

    async function loadStats() {
      try {
        if (user?.role === 'patient') {
          const [appointments, records, predictions] = await Promise.all([
            client.get('/appointments/mine'),
            client.get('/records'),
            client.get('/predictions/history'),
          ])
          if (active) setStats({
            appointments: appointments.data.length,
            records: records.data.length,
            assessments: predictions.data.length,
          })
        } else if (user?.role === 'doctor') {
          const [appointments, patients] = await Promise.all([
            client.get('/appointments/mine'),
            client.get('/doctors/patients'),
          ])
          if (active) setStats({ appointments: appointments.data.length, records: patients.data.length, assessments: 0 })
        } else {
          const response = await client.get('/reports/summary')
          if (active) setStats({
            appointments: response.data.total_appointments,
            records: response.data.total_doctors,
            assessments: response.data.total_predictions,
          })
        }
      } catch (loadError) {
        if (active) setError(loadError.response?.data?.detail || 'Could not load your profile summary.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadStats()
    return () => { active = false }
  }, [user?.role])

  async function saveProfile(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    setSaving(true)
    try {
      const updated = await updateProfile({
        full_name: form.full_name,
        phone: form.phone,
      })
      setForm({ full_name: updated.full_name, phone: updated.phone || '' })
      setMessage('Your profile has been updated.')
    } catch (saveError) {
      setError(saveError.response?.data?.detail || 'Could not update your profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const statLabels = user?.role === 'patient'
    ? [['Appointments', stats.appointments, '▣'], ['Medical records', stats.records, '▤'], ['Symptom checks', stats.assessments, '✚']]
    : user?.role === 'doctor'
      ? [['Appointments', stats.appointments, '▣'], ['Patients', stats.records, '♙']]
      : [['Appointments', stats.appointments, '▣'], ['Doctors', stats.records, '♙'], ['Assessments', stats.assessments, '✚']]

  return (
    <div className="page-content mx-auto max-w-7xl space-y-7 px-5 py-8 md:px-8 md:py-9">
      <div>
        <p className="text-xs font-bold tracking-[0.18em] text-accent">YOUR ACCOUNT</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-primary">Profile</h1>
        <p className="mt-2 text-sm text-ink/55">Review your account details and update your contact information.</p>
      </div>

      {error && <p role="alert" className="rounded-xl border border-severity-emergency/20 bg-severity-emergency/5 px-4 py-3 text-sm text-severity-emergency">{error}</p>}
      {message && <p role="status" className="rounded-xl border border-severity-low/20 bg-severity-low/5 px-4 py-3 text-sm text-severity-low">{message}</p>}

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-dark via-primary to-[#15977a] p-6 text-white shadow-card md:p-8">
        <div className="relative z-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full border-4 border-white/30 bg-white/15 font-display text-3xl font-semibold">
            {user?.full_name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold">{user?.full_name}</h2>
            <p className="mt-1 text-sm capitalize text-white/75">{user?.role}{user?.specialization ? ` · ${user.specialization}` : ''}</p>
            <p className="mt-3 text-sm text-white/75">{user?.email}</p>
          </div>
          <span className="sm:ml-auto rounded-full bg-white/15 px-4 py-2 text-xs font-semibold text-white">MedAssist member</span>
        </div>
        <div aria-hidden="true" className="absolute -right-10 -top-24 h-64 w-64 rounded-full border-[32px] border-white/10" />
      </section>

      <section className={`grid gap-4 ${statLabels.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
        {statLabels.map(([label, value, icon]) => (
          <div key={label} className="card flex items-center gap-4 p-5">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-xl text-primary">{icon}</span>
            <div>
              <p className="text-sm text-ink/50">{label}</p>
              <p className="mt-1 font-display text-2xl font-semibold text-primary">{loading ? '…' : value}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.72fr]">
        <form onSubmit={saveProfile} className="card space-y-5 p-5 md:p-7">
          <div>
            <h2 className="font-display text-xl font-semibold text-primary">Personal information</h2>
            <p className="mt-1 text-sm text-ink/50">Edit the details associated with your account.</p>
          </div>
          <div>
            <label className="label" htmlFor="profile-name">Full name</label>
            <input id="profile-name" className="input" autoComplete="name" value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} required maxLength={120} />
          </div>
          <div>
            <label className="label" htmlFor="profile-email">Email address</label>
            <input id="profile-email" className="input bg-surface text-ink/55" type="email" value={user?.email || ''} readOnly />
            <p className="mt-1 text-xs text-ink/45">Email address cannot be changed here.</p>
          </div>
          <div>
            <label className="label" htmlFor="profile-phone">Phone number</label>
            <input id="profile-phone" className="input" autoComplete="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="Add a contact number" maxLength={40} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
            <p className="text-xs text-ink/45">Account role: <span className="font-semibold capitalize text-primary">{user?.role}</span></p>
            <button className="btn-primary" disabled={saving || loading}>{saving ? 'Saving…' : 'Save changes'}</button>
          </div>
        </form>

        <aside className="space-y-4">
          <div className="card p-5 md:p-6">
            <h2 className="font-display text-xl font-semibold text-primary">Your health summary</h2>
            <p className="mt-2 text-sm leading-6 text-ink/55">Your activity counts update from records already saved to your account.</p>
            {user?.role === 'patient' && (
              <div className="mt-5 flex flex-col gap-3">
                <Link to="/history" className="btn-secondary w-full">View medical records</Link>
                <Link to="/appointments" className="btn-secondary w-full">Manage appointments</Link>
              </div>
            )}
          </div>
          <Link to="/emergency" className="block rounded-2xl border border-red-200 bg-red-50 p-5 transition hover:bg-red-100">
            <p className="font-semibold text-red-800">Need urgent help?</p>
            <p className="mt-1 text-sm text-red-700/75">Open emergency contacts and nearby emergency-capable hospitals.</p>
            <span className="mt-3 inline-block text-sm font-semibold text-red-800">Emergency help →</span>
          </Link>
        </aside>
      </section>
    </div>
  )
}
