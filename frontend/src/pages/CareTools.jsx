import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const FEATURES = [
  { to: '/consultations', title: 'Video consultations', detail: 'Join an eligible, confirmed appointment using browser video and audio.', roles: ['patient', 'doctor'] },
  { to: '/reminders', title: 'Reminders', detail: 'Keep personal medicine, appointment, and follow-up reminders.', roles: ['patient'] },
  { to: '/family-profiles', title: 'Dependent profiles', detail: 'Manage basic profiles for dependants under your care.', roles: ['patient'] },
  { to: '/report-explainer', title: 'Lab result education', detail: 'Compare a manually entered result with the range printed by the lab.', roles: ['patient'] },
  { to: '/measurements', title: 'Measurements', detail: 'Record health measurements manually with source and time.', roles: ['patient'] },
  { to: '/government-schemes', title: 'Government schemes', detail: 'Browse entries that an administrator has source-checked.', roles: ['patient', 'admin'] },
  { to: '/offline-guide', title: 'Offline health guide', detail: 'Open the limited static guide in English, Hindi, or Kannada.', roles: ['patient', 'doctor', 'admin'] },
]

export default function CareTools() {
  const { user } = useAuth()
  const features = FEATURES.filter((item) => item.roles.includes(user?.role))

  return (
    <div className="page-content mx-auto max-w-5xl space-y-6 px-5 py-8 md:px-8">
      <header><p className="text-xs font-bold tracking-[0.18em] text-accent">MEDASSIST</p><h1 className="mt-2 font-display text-3xl font-semibold text-primary">Care tools</h1><p className="mt-2 text-sm text-ink/60">Choose a tool. Each page explains what is available and what still needs a configured service or further review.</p></header>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => <Link key={feature.to} to={feature.to} className="card p-5 transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-accent">
          <h2 className="font-display text-lg font-semibold text-primary">{feature.title}</h2><p className="mt-2 text-sm leading-relaxed text-ink/60">{feature.detail}</p><span className="mt-4 block text-sm font-semibold text-accent">Open tool →</span>
        </Link>)}
      </section>
    </div>
  )
}
