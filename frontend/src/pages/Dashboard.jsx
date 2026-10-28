import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import SeverityBadge from '../components/SeverityBadge'

function formatDate(value) {
  return new Date(value).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function Dashboard() {
  const { user } = useAuth()
  const [summary, setSummary] = useState({ appointments: [], predictions: [], records: [], patients: [], analytics: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadDashboard() {
      setLoading(true)
      setError('')
      try {
        if (user?.role === 'patient') {
          const [appointments, predictions, records] = await Promise.all([
            client.get('/appointments/mine'),
            client.get('/predictions/history'),
            client.get('/records'),
          ])
          if (active) {
            setSummary({
              appointments: appointments.data,
              predictions: predictions.data,
              records: records.data,
              patients: [],
              analytics: null,
            })
          }
        } else if (user?.role === 'doctor') {
          const [appointments, patients] = await Promise.all([
            client.get('/appointments/mine'),
            client.get('/doctors/patients'),
          ])
          if (active) setSummary({ appointments: appointments.data, predictions: [], records: [], patients: patients.data, analytics: null })
        } else {
          const analytics = await client.get('/reports/summary')
          if (active) setSummary({ appointments: [], predictions: [], records: [], patients: [], analytics: analytics.data })
        }
      } catch (loadError) {
        if (active) setError(loadError.response?.data?.detail || 'Could not load your dashboard. Please refresh and try again.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadDashboard()
    return () => { active = false }
  }, [user?.role])

  const upcoming = summary.appointments
    .filter((appointment) => new Date(appointment.scheduled_time) >= new Date() && appointment.status !== 'cancelled')
    .sort((a, b) => new Date(a.scheduled_time) - new Date(b.scheduled_time))
    .slice(0, 3)
  const recentPredictions = summary.predictions.slice(0, 3)
  const greetingName = user?.role === 'admin' ? 'Admin' : user?.full_name?.split(' ')[0]
  const dashboardCopy = user?.role === 'patient'
    ? ['YOUR HEALTH, YOUR WAY', 'Your health journey starts with a small step. Check in with how you feel, keep your records together, and find care when you need it.']
    : user?.role === 'doctor'
      ? ['CARE TEAM WORKSPACE', 'Review your patients, manage appointments and keep up with the care you provide.']
      : ['SYSTEM OVERVIEW', 'Monitor platform activity and manage the people and care locations that make MedAssist work.']

  const shortcuts = [
    { to: '/symptom-checker', icon: '✚', title: 'Check symptoms', detail: 'Get a preliminary assessment' },
    { to: '/appointments', icon: '▣', title: 'Book appointment', detail: 'Connect with a doctor' },
    { to: '/history', icon: '▤', title: 'View records', detail: 'Your health history in one place' },
    { to: '/care-tools', icon: '◇', title: 'Care tools', detail: 'Reminders, family profiles and more' },
  ]

  return (
    <div className="page-content mx-auto max-w-7xl space-y-7 px-5 py-8 md:px-8 md:py-9">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-dark via-primary to-[#15977a] p-7 text-white shadow-card md:p-9">
        <div className="relative z-10 max-w-2xl">
          <p className="mb-2 text-sm font-medium text-white/70">{dashboardCopy[0]}</p>
          <h1 className="font-display text-3xl font-semibold leading-tight md:text-4xl">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {greetingName}.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/75 md:text-base">{dashboardCopy[1]}</p>
          {user?.role === 'patient' && <Link to="/symptom-checker" className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-primary transition hover:bg-white/90">Start a symptom check <span className="ml-2">→</span></Link>}
        </div>
        <div aria-hidden="true" className="absolute -right-10 -top-16 h-72 w-72 rounded-full border-[35px] border-white/10" />
        <div aria-hidden="true" className="absolute -bottom-28 right-20 h-64 w-64 rounded-full border-[28px] border-white/10" />
        <div aria-hidden="true" className="absolute bottom-7 right-[15%] hidden text-7xl text-white/30 lg:block">✚</div>
      </section>

      {error && <div role="alert" className="rounded-xl border border-severity-emergency/20 bg-severity-emergency/5 px-4 py-3 text-sm text-severity-emergency">{error}</div>}

      {user?.role === 'patient' ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {shortcuts.map((item) => (
              <Link key={item.to} to={item.to} className="card flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent/10 text-xl text-primary">{item.icon}</span>
                <span>
                  <span className="block font-semibold text-primary">{item.title}</span>
                  <span className="mt-1 block text-xs leading-5 text-ink/55">{item.detail}</span>
                </span>
                <span className="ml-auto text-lg text-accent">→</span>
              </Link>
            ))}
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="card p-5 md:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl font-semibold text-primary">Recent assessments</h2>
                  <p className="mt-1 text-sm text-ink/50">A quick look at your recent symptom checks.</p>
                </div>
                <Link to="/history" className="text-sm font-semibold text-accent hover:text-primary">View all</Link>
              </div>
              {loading ? <p className="py-5 text-sm text-ink/45">Loading your health summary…</p> : recentPredictions.length === 0 ? (
                <div className="rounded-2xl bg-surface px-5 py-8 text-center">
                  <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-white text-xl text-primary shadow-card">♡</span>
                  <p className="font-semibold text-primary">No assessments yet</p>
                  <p className="mt-1 text-sm text-ink/50">When you check your symptoms, your reports will appear here.</p>
                </div>
              ) : (
                <div className="divide-y divide-line/70">
                  {recentPredictions.map((item) => (
                    <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0">
                      <div>
                        <p className="font-semibold text-ink">{item.predicted_disease}</p>
                        <p className="mt-1 text-xs text-ink/50">{formatDate(item.created_at)} · {item.symptoms_list}</p>
                      </div>
                      <SeverityBadge level={item.severity} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card p-5 md:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl font-semibold text-primary">Upcoming appointments</h2>
                  <p className="mt-1 text-sm text-ink/50">Stay on top of your care.</p>
                </div>
                <Link to="/appointments" className="text-sm font-semibold text-accent hover:text-primary">Manage</Link>
              </div>
              {loading ? <p className="py-5 text-sm text-ink/45">Loading appointments…</p> : upcoming.length === 0 ? (
                <div className="rounded-2xl bg-surface px-5 py-8 text-center">
                  <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-white text-xl text-primary shadow-card">▣</span>
                  <p className="font-semibold text-primary">Nothing scheduled</p>
                  <p className="mt-1 text-sm text-ink/50">Book a visit whenever you need support.</p>
                  <Link to="/appointments" className="mt-4 inline-block text-sm font-semibold text-accent">Book a visit →</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcoming.map((item) => (
                    <div key={item.id} className="flex gap-3 rounded-2xl bg-surface p-4">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-primary shadow-sm">▣</span>
                      <div>
                        <p className="font-semibold text-ink">{formatDate(item.scheduled_time)}</p>
                        <p className="mt-1 text-xs text-ink/50">{item.reason || 'Appointment'} · <span className="capitalize">{item.status}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
          <p className="text-center text-xs leading-5 text-ink/45">MedAssist provides preliminary information, not a medical diagnosis. If you may be experiencing an emergency, contact your local emergency services.</p>
        </>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(user?.role === 'doctor'
            ? [['Patients', summary.patients.length, '/doctor'], ['Appointments', summary.appointments.length, '/appointments'], ['Reports', 'View', '/reports']]
            : [['Patients', summary.analytics?.total_patients ?? '—', '/admin'], ['Doctors', summary.analytics?.total_doctors ?? '—', '/admin'], ['Assessments', summary.analytics?.total_predictions ?? '—', '/reports'], ['Appointments', summary.analytics?.total_appointments ?? '—', '/reports']]
          ).map(([label, value, to]) => (
            <Link key={label} to={to} className="card p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
              <p className="text-sm text-ink/55">{label}</p>
              <p className="mt-2 font-display text-3xl font-semibold text-primary">{loading ? '…' : value}</p>
              <p className="mt-3 text-xs font-semibold text-accent">Open {label.toLowerCase()} →</p>
            </Link>
          ))}
        </section>
      )}
    </div>
  )
}
