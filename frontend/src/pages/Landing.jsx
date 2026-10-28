import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PulseIcon from '../components/PulseIcon'

const features = [
  { to: '/symptom-checker', icon: '✚', title: 'Symptom assessment', detail: 'Review an informational assessment and possible next steps.' },
  { to: '/appointments', icon: '▣', title: 'Appointments', detail: 'Request a visit and check whether it has been confirmed.' },
  { to: '/history', icon: '▤', title: 'Health records', detail: 'Keep your reports and health history in one account.' },
  { to: '/hospitals', icon: '⌖', title: 'Find care', detail: 'Explore hospitals and clinics when you need support.' },
]

export default function Landing() {
  const { user } = useAuth()

  return (
    <div className="overflow-hidden">
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-14 pt-12 md:grid-cols-[1.02fr_0.98fr] md:px-8 md:pb-20 md:pt-16">
        <div className="relative z-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-white px-3 py-2 text-xs font-semibold text-primary shadow-sm">
            <span className="h-2 w-2 rounded-full bg-accent" /> BETTER HEALTH, BRIGHTER TOMORROW
          </div>
          <h1 className="max-w-2xl font-display text-4xl font-semibold leading-[1.12] text-primary-dark md:text-6xl">
            Your health is our priority.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-ink/65 md:text-lg">
            A caring health companion to help you check symptoms, find doctors, book appointments and manage your medical records — all in one place.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {user ? (
              <Link to="/dashboard" className="btn-primary">Go to your dashboard <span>→</span></Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary">Get started <span>→</span></Link>
                <Link to="/login" className="btn-secondary">Log in</Link>
              </>
            )}
          </div>
          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-primary/75">
            <span className="flex items-center gap-2"><span className="text-accent">✓</span> Account-protected care tools</span>
            <span className="flex items-center gap-2"><span className="text-accent">✓</span> Care that stays organized</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div aria-hidden="true" className="absolute inset-6 rounded-[3rem] bg-[#d8f1e8] blur-2xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white bg-gradient-to-br from-[#e5f5ef] via-white to-[#bfe5d5] p-5 shadow-[0_24px_70px_rgba(6,76,63,0.16)] md:p-8">
            <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-accent/10 blur-2xl" />
            <div className="relative flex min-h-[340px] flex-col justify-between md:min-h-[420px]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold tracking-[0.18em] text-primary/55">A LITTLE CARE GOES A LONG WAY</p>
                  <p className="mt-2 font-display text-2xl font-semibold text-primary md:text-3xl">Here for your health.</p>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-2xl text-accent shadow-sm">♡</div>
              </div>
              <div className="relative flex items-end justify-center">
                <div className="absolute bottom-0 h-40 w-[85%] rounded-[50%] bg-gradient-to-t from-[#b5dfce] to-transparent" />
                <div className="relative z-10 flex h-64 w-52 items-center justify-center rounded-t-[7rem] rounded-b-[2rem] border border-white/80 bg-gradient-to-b from-[#fff] via-[#f7fffb] to-[#a8d8c5] shadow-xl md:h-72 md:w-60">
                  <div className="absolute top-10 grid h-24 w-24 place-items-center rounded-full bg-[#f2c7a8] shadow-inner">
                    <div className="absolute -top-2 h-10 w-24 rounded-t-full bg-[#463a32]" />
                    <span className="mt-5 text-sm text-[#514038]">• ᴗ •</span>
                  </div>
                  <div className="absolute top-[132px] h-28 w-40 rounded-t-[3.5rem] bg-white shadow-sm md:top-[145px]">
                    <span className="absolute left-1/2 top-5 h-14 w-8 -translate-x-1/2 rounded-full border-2 border-accent/35" />
                    <span className="absolute left-1/2 top-8 h-6 w-6 -translate-x-1/2 rounded-full bg-accent text-center text-sm font-bold leading-6 text-white">+</span>
                  </div>
                  <span className="absolute bottom-5 left-5 text-4xl text-primary/35">✿</span>
                  <span className="absolute bottom-8 right-5 text-3xl text-primary/30">✿</span>
                </div>
                <div className="absolute bottom-7 left-0 z-20 rounded-2xl border border-line/70 bg-white/95 px-4 py-3 shadow-lg">
                  <p className="text-[10px] font-bold tracking-widest text-accent">PERSONALIZED CARE</p>
                  <p className="mt-1 text-sm font-semibold text-primary">One healthy step at a time</p>
                </div>
                <div className="absolute right-0 top-8 z-20 rounded-2xl border border-line/70 bg-white/95 px-4 py-3 shadow-lg">
                  <span className="flex items-center gap-2 text-xs font-semibold text-primary"><span className="grid h-7 w-7 place-items-center rounded-lg bg-accent/10 text-accent">♡</span> Care that connects</span>
                </div>
              </div>
              <div className="relative z-10 flex items-center justify-between rounded-2xl bg-white/85 px-4 py-3 text-xs text-primary/70">
                <span>Symptom assessment</span><span>Appointments</span><span>Health records</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line/60 bg-white/70 py-11">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="mb-7 max-w-2xl">
            <p className="text-xs font-bold tracking-[0.18em] text-accent">CARE, MADE SIMPLE</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-primary">Support for every step of your health journey.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Link key={feature.title} to={feature.to} className="rounded-2xl border border-line/70 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-raised focus:outline-none focus:ring-2 focus:ring-accent">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent/10 text-lg text-primary" aria-hidden="true">{feature.icon}</span>
                <h3 className="mt-4 font-semibold text-primary">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink/55">{feature.detail}</p>
                <span className="mt-4 block text-sm font-semibold text-accent">Explore →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 md:grid-cols-2 md:px-8 md:py-16">
        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-accent">HOW IT WORKS</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-primary">A clearer next step, in three simple moves.</h2>
        </div>
        <ol className="space-y-4">
          {[
            ['01', 'Tell us how you feel', 'Choose symptoms, write a note or use voice input.'],
            ['02', 'Review your assessment', 'Get an informational result and guidance on next steps.'],
            ['03', 'Connect with care', 'Find a hospital, book an appointment or keep your records together.'],
          ].map(([number, title, description]) => (
            <li key={number} className="flex gap-4 rounded-2xl border border-line/70 bg-white p-4 shadow-card">
              <span className="font-mono text-sm font-semibold text-accent">{number}</span>
              <div><p className="font-semibold text-primary">{title}</p><p className="mt-1 text-sm text-ink/55">{description}</p></div>
            </li>
          ))}
        </ol>
      </section>

      <div className="mx-auto mb-10 max-w-7xl px-5 md:px-8">
        <div className="rounded-2xl border border-warn/30 bg-amber-50 px-5 py-4 text-sm leading-6 text-ink/70">
          <strong className="text-ink">Please note:</strong> MedAssist provides general health information and a preliminary triage assessment only. It is not a substitute for professional medical diagnosis or treatment. If you believe you’re experiencing a medical emergency, contact local emergency services immediately.
        </div>
      </div>
      <footer className="border-t border-line/70 bg-white py-6">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-5 text-primary md:px-8">
          <PulseIcon className="h-7 w-9 text-accent" />
          <span className="font-display font-semibold">MedAssist <span className="text-xs tracking-widest text-accent">GREENCARE</span></span>
          <span className="ml-auto text-xs text-ink/45">Better health. Brighter tomorrow.</span>
        </div>
      </footer>
    </div>
  )
}
