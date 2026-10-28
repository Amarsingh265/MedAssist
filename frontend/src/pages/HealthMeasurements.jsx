import { useEffect, useState } from 'react'
import client from '../api/client'

const TYPES = {
  heart_rate: ['Heart rate', 'bpm'],
  blood_pressure_systolic: ['Blood pressure (systolic)', 'mmHg'],
  blood_pressure_diastolic: ['Blood pressure (diastolic)', 'mmHg'],
  blood_glucose: ['Blood glucose', 'mg/dL'],
  weight: ['Weight', 'kg'],
  oxygen_saturation: ['Oxygen saturation', '%'],
  steps: ['Steps', 'count'],
}

function localNow() {
  const date = new Date()
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 16)
}

export default function HealthMeasurements() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ measurement_type: 'heart_rate', value: '', unit: 'bpm', recorded_at: localNow() })
  const [error, setError] = useState('')

  async function load() {
    try {
      const response = await client.get('/measurements')
      setItems(response.data)
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Could not load measurements.')
    }
  }

  useEffect(() => { load() }, [])

  function selectType(type) {
    setForm({ ...form, measurement_type: type, unit: TYPES[type][1] })
  }

  async function save(event) {
    event.preventDefault()
    setError('')
    try {
      await client.post('/measurements', {
        ...form,
        value: Number(form.value),
        recorded_at: new Date(form.recorded_at).toISOString(),
      })
      setForm({ ...form, value: '', recorded_at: localNow() })
      await load()
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Could not save measurement.')
    }
  }

  async function remove(id) {
    try {
      await client.delete(`/measurements/${id}`)
      await load()
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Could not delete measurement.')
    }
  }

  return (
    <div className="page-content mx-auto max-w-4xl space-y-6 px-5 py-8 md:px-8">
      <header><p className="text-xs font-bold tracking-[0.18em] text-accent">HEALTH DATA</p><h1 className="mt-2 font-display text-3xl font-semibold text-primary">Measurements</h1><p className="mt-2 text-sm text-ink/60">Record measurements yourself. Values are not used to diagnose, change treatment, or rule out emergencies.</p></header>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">This web app does not connect to Apple Health, Health Connect, Bluetooth devices, or wearables. Every entry below is labelled as manually entered.</div>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      <form onSubmit={save} className="card grid gap-4 p-5 sm:grid-cols-2">
        <label className="text-sm font-medium">Measurement
          <select className="input mt-1" value={form.measurement_type} onChange={(e) => selectType(e.target.value)}>{Object.entries(TYPES).map(([key, [label]]) => <option key={key} value={key}>{label}</option>)}</select>
        </label>
        <label className="text-sm font-medium">Value
          <div className="mt-1 flex gap-2"><input required type="number" step="any" className="input" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /><span className="self-center text-sm text-ink/60">{form.unit}</span></div>
        </label>
        {form.measurement_type === 'blood_glucose' && <label className="text-sm font-medium">Unit
          <select className="input mt-1" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}><option>mg/dL</option><option>mmol/L</option></select>
        </label>}
        <label className="text-sm font-medium">Recorded at (your local time)
          <input required type="datetime-local" className="input mt-1" value={form.recorded_at} onChange={(e) => setForm({ ...form, recorded_at: e.target.value })} />
        </label>
        <button className="btn-primary sm:col-span-2 sm:justify-self-start">Save measurement</button>
      </form>
      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold text-primary">Recent entries</h2>
        {items.length === 0 ? <p className="card p-5 text-sm text-ink/55">No measurements recorded.</p> : items.map((item) => (
          <article key={item.id} className="card flex items-center justify-between gap-4 p-4">
            <div><p className="font-semibold text-primary">{TYPES[item.measurement_type]?.[0] || item.measurement_type}: {item.value} {item.unit}</p><p className="text-xs text-ink/55">Manual entry · {new Date(item.recorded_at).toLocaleString()}</p></div>
            <button onClick={() => remove(item.id)} className="rounded-xl px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50">Delete</button>
          </article>
        ))}
      </section>
    </div>
  )
}
