import { useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PulseIcon from './PulseIcon'

const LINKS = [
  { to: '/dashboard', label: 'Overview', icon: '⌂', roles: ['patient', 'doctor', 'admin'] },
  { to: '/symptom-checker', label: 'Symptom check', icon: '✚', roles: ['patient'] },
  { to: '/appointments', label: 'Appointments', icon: '▣', roles: ['patient', 'doctor'] },
  { to: '/consultations', label: 'Video visits', icon: '◉', roles: ['patient', 'doctor'] },
  { to: '/hospitals', label: 'Find care', icon: '⌖', roles: ['patient'] },
  { to: '/care-tools', label: 'Care tools', icon: '◇', roles: ['patient', 'doctor', 'admin'] },
  { to: '/history', label: 'Health records', icon: '▤', roles: ['patient'] },
  { to: '/upload', label: 'Upload records', icon: '＋', roles: ['patient'] },
  { to: '/profile', label: 'My profile', icon: '♙', roles: ['patient', 'doctor', 'admin'] },
  { to: '/emergency', label: 'Emergency help', icon: '!', roles: ['patient', 'doctor', 'admin'], urgent: true },
  { to: '/reports', label: 'Reports & insights', icon: '▥', roles: ['doctor', 'admin'] },
  { to: '/doctor', label: 'Patients', icon: '♙', roles: ['doctor'] },
  { to: '/admin', label: 'Administration', icon: '⚙', roles: ['admin'] },
]

const MOBILE_DESTINATIONS = {
  patient: ['/dashboard', '/appointments', '/history'],
  doctor: ['/dashboard', '/appointments', '/doctor'],
  admin: ['/dashboard', '/admin', '/reports'],
}

function navigationClass(isActive, urgent = false) {
  if (urgent) {
    return isActive
      ? 'bg-red-600 text-white shadow-sm'
      : 'text-red-100 hover:bg-red-500/15 hover:text-white'
  }
  return isActive
    ? 'bg-white text-primary shadow-sm'
    : 'text-white/75 hover:bg-white/10 hover:text-white'
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [moreOpen, setMoreOpen] = useState(false)
  const publicPage = !user || ['/login', '/register'].includes(location.pathname)
  const visibleLinks = user ? LINKS.filter((link) => link.roles.includes(user.role)) : []
  const destinations = MOBILE_DESTINATIONS[user?.role] || []
  const primaryLinks = destinations.map((path) => visibleLinks.find((link) => link.to === path)).filter(Boolean)
  const remainingLinks = visibleLinks.filter((link) => !destinations.includes(link.to))

  function logoutAndNavigate() {
    logout()
    navigate('/login')
  }

  if (publicPage) {
    return (
      <header className="sticky top-0 z-20 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 md:px-8">
          <Link to="/" className="flex items-center gap-2.5" aria-label="MedAssist home">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-white">
              <PulseIcon className="h-7 w-8" />
            </span>
            <span className="font-display text-xl font-bold tracking-tight text-primary">MedAssist<span className="ml-1.5 text-xs font-semibold text-accent">GREENCARE</span></span>
          </Link>
          {user ? (
            <button onClick={logoutAndNavigate} className="btn-secondary text-sm">Log out</button>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="min-h-11 px-3 py-3 text-sm font-semibold text-primary hover:text-accent">Log in</Link>
              <Link to="/register" className="btn-primary text-sm">Create account</Link>
            </div>
          )}
        </div>
      </header>
    )
  }

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col bg-primary-dark px-4 py-6 text-white md:flex">
        <Link to="/dashboard" className="mb-8 flex items-center gap-3 px-2" aria-label="MedAssist dashboard">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10">
            <PulseIcon className="h-7 w-8 text-white" />
          </span>
          <span>
            <span className="block font-display text-lg font-bold leading-5">MedAssist</span>
            <span className="mt-1 block text-[10px] font-semibold tracking-[0.18em] text-white/55">GREENCARE</span>
          </span>
        </Link>

        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">Care workspace</p>
        <nav className="flex-1 space-y-1 overflow-y-auto" aria-label="Main navigation">
          {visibleLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/dashboard'}
              className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${navigationClass(isActive, link.urgent)}`}
            >
              <span className="w-5 text-center text-base" aria-hidden="true">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-5 border-t border-white/10 pt-4">
          <Link to="/profile" className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-white/10">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/15 text-sm font-bold">
              {user?.full_name?.charAt(0)?.toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{user?.full_name}</span>
              <span className="block text-xs capitalize text-white/50">{user?.role}</span>
            </span>
          </Link>
          <button onClick={logoutAndNavigate} className="mt-2 min-h-11 w-full rounded-xl px-3 text-left text-sm font-medium text-white/65 transition hover:bg-white/10 hover:text-white">
            <span className="mr-3" aria-hidden="true">↪</span>Sign out
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-line bg-primary-dark px-4 py-3 text-white md:hidden">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10"><PulseIcon className="h-6 w-7 text-white" /></span>
            <span className="font-display text-base font-bold">MedAssist <span className="text-[9px] tracking-widest text-white/60">GREENCARE</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/profile" aria-label="Open your profile" className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-sm font-semibold">
              {user?.full_name?.charAt(0)?.toUpperCase()}
            </Link>
            <button onClick={logoutAndNavigate} className="min-h-10 rounded-lg px-2 text-xs font-semibold text-white/80 hover:bg-white/10">Sign out</button>
          </div>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-1 shadow-[0_-8px_30px_rgba(24,51,45,0.08)] backdrop-blur md:hidden" aria-label="Mobile navigation">
        <div className="mx-auto grid max-w-xl grid-cols-4 gap-1">
          {primaryLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/dashboard'}
              onClick={() => setMoreOpen(false)}
              className={({ isActive }) => `flex min-h-[58px] flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[11px] font-semibold transition ${isActive ? 'text-primary' : 'text-ink/60'}`}
            >
              {({ isActive }) => <><span className={`grid h-7 w-9 place-items-center rounded-full text-lg ${isActive ? 'bg-primary/10' : ''}`} aria-hidden="true">{link.icon}</span><span className="max-w-full truncate">{link.label}</span></>}
            </NavLink>
          ))}
          <button
            type="button"
            aria-expanded={moreOpen}
            aria-controls="mobile-more-menu"
            onClick={() => setMoreOpen((value) => !value)}
            className={`flex min-h-[58px] flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[11px] font-semibold ${moreOpen ? 'text-primary' : 'text-ink/60'}`}
          >
            <span className={`grid h-7 w-9 place-items-center rounded-full text-lg ${moreOpen ? 'bg-primary/10' : ''}`} aria-hidden="true">•••</span>
            <span>More</span>
          </button>
        </div>
      </nav>

      {moreOpen && (
        <>
          <button type="button" aria-label="Close navigation menu" className="fixed inset-0 z-20 bg-primary-dark/20 md:hidden" onClick={() => setMoreOpen(false)} />
          <div id="mobile-more-menu" className="fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-30 grid max-h-[60vh] grid-cols-2 gap-2 overflow-auto rounded-2xl border border-line bg-white p-3 shadow-raised md:hidden">
            {remainingLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMoreOpen(false)}
                className={({ isActive }) => `flex min-h-12 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${link.urgent ? 'text-red-700' : isActive ? 'bg-primary/10 text-primary' : 'text-ink/75 hover:bg-surface'}`}
              >
                <span aria-hidden="true">{link.icon}</span>{link.label}
              </NavLink>
            ))}
          </div>
        </>
      )}
    </>
  )
}
