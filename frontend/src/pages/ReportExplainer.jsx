import { useState } from 'react'
import client from '../api/client'

export default function ReportExplainer() {
  const [form, setForm] = useState({ test_name: '', value: '', unit: '', reference_low: '', reference_high: '', reference_unit: '' })
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  async function explain(event) {
    event.preventDefault()
    setError('')
    setResult(null)
    try {
      const response = await client.post('/report-explainer', {
        test_name: form.test_name,
        value: Number(form.value),
        unit: form.unit || null,
        reference_low: form.reference_low === '' ? null : Number(form.reference_low),
        reference_high: form.reference_high === '' ? null : Number(form.reference_high),
        reference_unit: form.reference_unit || null,
      })
      setResult(response.data)
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Could not explain these values.')
    }
  }

  return (
    <div className="page-content mx-auto max-w-3xl space-y-6 px-5 py-8 md:px-8">
      <header><p className="text-xs font-bold tracking-[0.18em] text-accent">REPORT EDUCATION</p><h1 className="mt-2 font-display text-3xl font-semibold text-primary">Lab result explainer</h1><p className="mt-2 text-sm text-ink/60">Enter a result and its range printed by the laboratory to compare them arithmetically and read limited general information.</p></header>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">This is not an AI diagnosis tool and does not upload or read report files. Enter the values manually. No report is sent to an external service. Check every value against the original report.</div>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      <form onSubmit={explain} className="card grid gap-4 p-5 sm:grid-cols-2">
        <label className="text-sm font-medium">Test name<input required maxLength="120" className="input mt-1" value={form.test_name} onChange={(e) => setForm({ ...form, test_name: e.target.value })} /></label>
        <label className="text-sm font-medium">Your result<input required type="number" step="any" className="input mt-1" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /></label>
        <label className="text-sm font-medium">Unit (if shown)<input maxLength="30" className="input mt-1" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm font-medium">Range low<input type="number" step="any" className="input mt-1" value={form.reference_low} onChange={(e) => setForm({ ...form, reference_low: e.target.value })} /></label>
          <label className="text-sm font-medium">Range high<input type="number" step="any" className="input mt-1" value={form.reference_high} onChange={(e) => setForm({ ...form, reference_high: e.target.value })} /></label>
        </div>
        <label className="text-sm font-medium">Unit printed for reference range<input maxLength="30" className="input mt-1" value={form.reference_unit} onChange={(e) => setForm({ ...form, reference_unit: e.target.value })} /></label>
        <button className="btn-primary sm:col-span-2 sm:justify-self-start">Explain entered result</button>
      </form>
      {result && <section className="card space-y-4 p-5" aria-live="polite">
        <div><h2 className="font-display text-xl font-semibold text-primary">{result.test_name}</h2><p className="mt-1 text-sm text-ink/70">Entered value: {result.source_value}{result.source_unit ? ` ${result.source_unit}` : ''}</p><p className="mt-1 text-sm font-semibold">{result.comparison.replaceAll('_', ' ')}</p></div>
        <p className="text-sm leading-relaxed text-ink/75">{result.general_information}</p>
        <div><h3 className="font-semibold text-primary">Questions you can ask your clinician</h3><ul className="mt-2 list-inside list-disc text-sm text-ink/70">{result.questions_for_clinician.map((question) => <li key={question}>{question}</li>)}</ul></div>
        <p className="border-t border-line pt-3 text-xs leading-relaxed text-ink/55">{result.notice}</p>
      </section>}
    </div>
  )
}
