import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'

export default function EmergencyHelp() {
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [locationMessage, setLocationMessage] = useState('')

  async function loadHospitals(params = {}) {
    setLoading(true)
    setError('')
    try {
      const response = await client.get('/hospitals', { params })
      setHospitals(response.data.filter((hospital) => hospital.emergency_available))
    } catch (loadError) {
      setError(loadError.response?.data?.detail || 'Could not load nearby hospitals. Call emergency services directly if this is urgent.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadHospitals() }, [])

  function sortByLocation() {
    if (!navigator.geolocation) {
      setLocationMessage('Location services are not available in this browser. Showing the hospitals in the directory.')
      return
    }
    setLocationMessage('Requesting your location…')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocationMessage('Hospitals are sorted using your current location.')
        loadHospitals({ lat: coords.latitude, lon: coords.longitude })
      },
      () => setLocationMessage('Location permission was not granted. Showing the hospitals in the directory.'),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    )
  }

  return (
    <div className="page-content mx-auto max-w-7xl space-y-7 px-5 py-8 md:px-8 md:py-9">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#b4232c] to-[#e34d4d] p-6 text-white shadow-card md:p-9">
        <div className="grid gap-7 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-white/70">IMMEDIATE SUPPORT</p>
            <h1 className="mt-2 font-display text-3xl font-semibold md:text-4xl">Emergency help</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85 md:text-base">
              If someone may be in immediate danger or needs urgent medical attention, call emergency services now. Do not wait for this app.
            </p>
          </div>
          <a href="tel:112" className="inline-flex min-h-16 items-center justify-center gap-3 rounded-2xl bg-white px-7 py-4 text-lg font-bold text-red-700 shadow-lg transition hover:bg-red-50">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-red-100 text-xl" aria-hidden="true">☎</span>
            Call 112
          </a>
        </div>
        <p className="mt-5 border-t border-white/20 pt-4 text-xs leading-5 text-white/75">112 is India’s national emergency number. If you are elsewhere, call your local emergency number.</p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
        <div className="space-y-4">
          <div className="card p-5 md:p-6">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-2xl text-red-600">☎</span>
            <h2 className="mt-4 font-display text-xl font-semibold text-primary">Call for urgent help</h2>
            <p className="mt-2 text-sm leading-6 text-ink/55">Call 112 for emergency response in India. Follow the operator’s instructions and share your location.</p>
            <a href="tel:112" className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700">Call 112 now</a>
          </div>
          <div className="rounded-2xl border border-warn/30 bg-amber-50 p-5 text-sm leading-6 text-ink/70">
            <strong className="text-ink">While waiting for help</strong>
            <p className="mt-2">Stay with the person if it is safe. Keep the phone line available and do what the emergency operator advises.</p>
          </div>
        </div>

        <div className="card p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-accent">IN-PERSON CARE</p>
              <h2 className="mt-2 font-display text-xl font-semibold text-primary">Emergency-capable hospitals</h2>
              <p className="mt-1 text-sm text-ink/50">Call ahead if possible. For immediate danger, call 112 first.</p>
            </div>
            <button onClick={sortByLocation} className="btn-secondary text-sm" disabled={loading}>Use my location</button>
          </div>
          {locationMessage && <p role="status" className="mt-4 rounded-xl bg-accent/5 px-4 py-3 text-xs text-primary">{locationMessage}</p>}
          {error && <p role="alert" className="mt-4 rounded-xl bg-severity-emergency/5 px-4 py-3 text-sm text-severity-emergency">{error}</p>}
          {loading ? (
            <p className="py-8 text-sm text-ink/50">Loading hospitals…</p>
          ) : hospitals.length === 0 ? (
            <div className="mt-5 rounded-2xl bg-surface p-5">
              <p className="font-semibold text-primary">No emergency-capable hospital is listed.</p>
              <p className="mt-2 text-sm leading-6 text-ink/55">Call 112 for assistance or check the full care directory.</p>
              <Link to="/hospitals" className="mt-3 inline-block text-sm font-semibold text-accent">View all hospitals →</Link>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {hospitals.map((hospital) => (
                <article key={hospital.id} className="flex flex-col justify-between gap-4 rounded-2xl border border-line/70 bg-white p-4 sm:flex-row sm:items-center">
                  <div className="flex gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-red-50 text-lg text-red-600">✚</span>
                    <div>
                      <h3 className="font-semibold text-primary">{hospital.name}</h3>
                      <p className="mt-1 text-sm text-ink/55">{hospital.address}</p>
                      {hospital.phone && <p className="mt-1 text-xs text-ink/50">{hospital.phone}</p>}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2 sm:flex-col">
                    {hospital.phone && <a href={`tel:${hospital.phone}`} className="btn-primary !px-4 !py-2 text-xs">Call</a>}
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${hospital.name} ${hospital.address}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-secondary !px-4 !py-2 text-xs"
                    >
                      Directions
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
      <p className="text-center text-xs text-ink/45">MedAssist is not an emergency service and cannot dispatch assistance. If there is immediate danger, call 112 in India or your local emergency number.</p>
    </div>
  )
}
