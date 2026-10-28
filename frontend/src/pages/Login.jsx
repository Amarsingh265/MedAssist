import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PulseIcon from '../components/PulseIcon'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto grid min-h-[calc(100vh-72px)] max-w-7xl items-center gap-8 px-5 py-8 md:grid-cols-[1fr_0.82fr] md:px-8 md:py-12">
      <section className="relative hidden min-h-[560px] overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary-dark via-primary to-[#27a58a] p-10 text-white md:flex md:flex-col md:justify-between">
        <div>
          <PulseIcon className="mb-8 h-10 w-12 text-white" />
          <p className="text-xs font-bold tracking-[0.2em] text-white/60">WELCOME TO MEDASSIST</p>
          <h1 className="mt-4 max-w-lg font-display text-5xl font-semibold leading-tight">A little more care, every day.</h1>
          <p className="mt-5 max-w-md leading-7 text-white/75">Your health tools, appointments and records — thoughtfully brought together in one place.</p>
        </div>
        <div className="relative z-10 grid grid-cols-2 gap-3">
          {['Symptom checker', 'Find trusted care', 'Book appointments', 'Manage records'].map((item) => (
            <div key={item} className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/85">✓ &nbsp;{item}</div>
          ))}
        </div>
        <div aria-hidden="true" className="absolute -bottom-24 -right-20 h-80 w-80 rounded-full border-[50px] border-white/10" />
        <div aria-hidden="true" className="absolute right-20 top-24 text-8xl text-white/10">✚</div>
      </section>

      <section className="mx-auto w-full max-w-md">
        <div className="mb-7 text-center md:text-left">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
            <PulseIcon className="h-8 w-10 text-accent" />
          </div>
          <p className="text-xs font-bold tracking-[0.18em] text-accent">YOUR HEALTH, ALL IN ONE PLACE</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-primary">Welcome back!</h2>
          <p className="mt-2 text-sm text-ink/55">Sign in to your account to continue.</p>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-5 p-6 md:p-8">
          {error && <p role="alert" className="rounded-xl border border-severity-emergency/20 bg-severity-emergency/5 px-4 py-3 text-sm text-severity-emergency">{error}</p>}
          <div>
            <label className="label" htmlFor="login-email">Email address</label>
            <input id="login-email" className="input" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="label" htmlFor="login-password">Password</label>
            <input id="login-password" className="input" type="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className="btn-primary w-full" disabled={loading}>{loading ? 'Signing in…' : 'Log in'}</button>
          <p className="text-center text-sm text-ink/55">Don’t have an account? <Link to="/register" className="font-semibold text-accent hover:text-primary">Sign up</Link></p>
          <details className="border-t border-line pt-4 text-xs text-ink/50">
            <summary className="cursor-pointer font-medium text-primary">Demo account access</summary>
            <p className="mt-3 leading-5">Admin: admin@medassist.dev / admin123<br />Doctor: dr.sharma@medassist.dev / doctor123</p>
          </details>
        </form>
        <p className="mt-5 text-center text-xs leading-5 text-ink/40">Your health information should be handled with care. Use this demo app for informational purposes only.</p>
      </section>
    </div>
  )
}
