import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'
import VoiceInput from '../components/VoiceInput'

const COMMON_SYMPTOMS = [
  'fever', 'cough', 'headache', 'sore throat', 'fatigue', 'nausea',
  'vomiting', 'diarrhea', 'chest pain', 'shortness of breath',
  'dizziness', 'abdominal pain', 'rash', 'joint pain', 'body ache',
  'runny nose', 'sneezing', 'chills', 'loss of appetite', 'confusion',
]

export default function SymptomChecker() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState([])
  const [freeText, setFreeText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function toggle(symptom) {
    setSelected((s) => (s.includes(symptom) ? s.filter((x) => x !== symptom) : [...s, symptom]))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (selected.length === 0 && !freeText.trim()) {
      setError('Please select at least one symptom or describe how you feel.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await client.post('/predictions', { symptoms: selected, free_text: freeText })
      navigate('/prediction-result', { state: { result: res.data } })
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-content mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-9">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-accent">TAKE A MOMENT FOR YOURSELF</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-primary">Symptom Checker</h1>
          <p className="mt-2 text-sm text-ink/55">Tell us how you’re feeling. We’ll help you think through a next step.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-ink/50">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-white">1</span>
          <span>Symptoms</span><span className="mx-1 h-px w-8 bg-line" />
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-ink/40">2</span>
          <span>Details</span><span className="mx-1 h-px w-8 bg-line" />
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-ink/40">3</span>
          <span>Result</span>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_310px]">
        <form onSubmit={handleSubmit} className="card space-y-7 p-5 md:p-8">
          <div>
            <div className="mb-4">
              <h2 className="font-display text-xl font-semibold text-primary">Describe your symptoms</h2>
              <p className="mt-1 text-sm text-ink/50">Select all that apply. You can also add more detail below.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {COMMON_SYMPTOMS.map((s) => (
                <button
                  type="button"
                  key={s}
                  aria-pressed={selected.includes(s)}
                  onClick={() => toggle(s)}
                  className={`rounded-full border px-3.5 py-2 text-sm capitalize transition ${
                    selected.includes(s)
                      ? 'border-primary bg-primary text-white shadow-sm'
                      : 'border-line bg-white text-ink/65 hover:border-accent hover:bg-accent/5'
                  }`}
                >
                  {selected.includes(s) ? '✓ ' : '+ '}{s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <label className="label !mb-0" htmlFor="symptom-description">Anything else you’d like to share?</label>
              <VoiceInput onResult={(t) => setFreeText((prev) => (prev ? prev + ' ' + t : t))} />
            </div>
            <textarea
              id="symptom-description"
              className="input min-h-[130px] resize-y"
              placeholder="For example: I’ve had a headache since yesterday, and I feel dizzy when I stand up…"
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
            />
          </div>

          {selected.length > 0 && (
            <div className="rounded-xl bg-accent/5 px-4 py-3 text-sm text-primary">
              <span className="font-semibold">{selected.length} symptom{selected.length === 1 ? '' : 's'} selected</span>
              <span className="text-ink/55"> · You can change your selections before continuing.</span>
            </div>
          )}
          {error && <p role="alert" className="rounded-xl bg-severity-emergency/5 px-4 py-3 text-sm text-severity-emergency">{error}</p>}

          <div className="flex flex-col-reverse justify-between gap-3 border-t border-line pt-5 sm:flex-row sm:items-center">
            <p className="max-w-md text-xs leading-5 text-ink/45">This is an informational tool, not a medical diagnosis. For emergencies, contact local emergency services immediately.</p>
            <button className="btn-primary shrink-0" disabled={loading}>
              {loading ? 'Reviewing…' : 'Continue to assessment'} <span aria-hidden="true">→</span>
            </button>
          </div>
        </form>

        <aside className="space-y-4">
          <div className="card overflow-hidden">
            <div className="bg-gradient-to-br from-[#dff5ec] to-white p-5">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-xl text-primary shadow-sm">♡</span>
              <h2 className="mt-4 font-display text-xl font-semibold text-primary">Your health matters</h2>
              <p className="mt-2 text-sm leading-6 text-ink/55">Share only what you feel comfortable sharing. Your answers help create a preliminary assessment.</p>
            </div>
            <div className="space-y-3 p-5 text-xs leading-5 text-ink/55">
              <p><span className="mr-2 font-bold text-accent">✓</span>Choose as many symptoms as you need.</p>
              <p><span className="mr-2 font-bold text-accent">✓</span>Use the microphone to speak your description.</p>
              <p><span className="mr-2 font-bold text-accent">✓</span>Discuss results with a qualified clinician.</p>
            </div>
          </div>
          <div className="rounded-2xl border border-warn/30 bg-amber-50 p-4 text-xs leading-5 text-ink/65">
            <strong className="text-ink">Need urgent help?</strong><br />
            If your symptoms feel severe or life-threatening, contact local emergency services now.
          </div>
        </aside>
      </div>
    </div>
  )
}
