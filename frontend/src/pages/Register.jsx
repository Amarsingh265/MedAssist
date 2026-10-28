import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PulseIcon from '../components/PulseIcon'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'patient', phone: '', specialization: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto grid min-h-[calc(100vh-72px)] max-w-7xl items-center gap-8 px-5 py-8 md:grid-cols-[0.85fr_1fr] md:px-8 md:py-12">
      <section className="hidden rounded-[2rem] bg-gradient-to-br from-primary-dark to-primary p-10 text-white md:block">
        <PulseIcon className="mb-10 h-10 w-12 text-white" />
        <p className="text-xs font-bold tracking-[0.2em] text-white/60">A HEALTHIER TOMORROW STARTS HERE</p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-tight">Let’s take care of your health together.</h1>
        <p className="mt-5 leading-7 text-white/75">Create your account to check symptoms, organize medical records and connect with care.</p>
        <div className="mt-10 rounded-2xl border border-white/15 bg-white/10 p-5">
          <p className="font-semibold">Your journey, made easier</p>
          <p className="mt-2 text-sm leading-6 text-white/70">A simple place to manage health information and explore your next steps.</p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-xl">
        <div className="mb-6 text-center md:text-left">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 md:hidden"><PulseIcon className="h-7 w-9 text-accent" /></div>
          <p className="text-xs font-bold tracking-[0.18em] text-accent">JOIN MEDASSIST</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-primary">Create your account</h1>
          <p className="mt-2 text-sm text-ink/55">A few details and you’ll be ready to get started.</p>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-4 p-6 md:p-8">
          {error && <p role="alert" className="rounded-xl border border-severity-emergency/20 bg-severity-emergency/5 px-4 py-3 text-sm text-severity-emergency">{error}</p>}
          <div>
            <label className="label" htmlFor="register-name">Full name</label>
            <input id="register-name" className="input" autoComplete="name" placeholder="Your full name" value={form.full_name} onChange={(e) => update('full_name', e.target.value)} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="register-email">Email address</label>
              <input id="register-email" className="input" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={(e) => update('email', e.target.value)} required />
            </div>
            <div>
              <label className="label" htmlFor="register-phone">Phone <span className="font-normal text-ink/40">(optional)</span></label>
              <input id="register-phone" className="input" autoComplete="tel" placeholder="Phone number" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="register-password">Password</label>
            <input id="register-password" className="input" type="password" autoComplete="new-password" placeholder="At least 6 characters" value={form.password} onChange={(e) => update('password', e.target.value)} required minLength={6} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="register-role">I am a</label>
              <select id="register-role" className="input" value={form.role} onChange={(e) => update('role', e.target.value)}>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>
            {form.role === 'doctor' && (
              <div>
                <label className="label" htmlFor="register-specialty">Specialization</label>
                <input id="register-specialty" className="input" value={form.specialization} onChange={(e) => update('specialization', e.target.value)} placeholder="e.g. Cardiologist" />
              </div>
            )}
          </div>
          <button className="btn-primary w-full" disabled={loading}>{loading ? 'Creating account…' : 'Create account'}</button>
          <p className="text-center text-sm text-ink/55">Already have an account? <Link to="/login" className="font-semibold text-accent hover:text-primary">Log in</Link></p>
        </form>
      </section>
    </div>
  )
}
