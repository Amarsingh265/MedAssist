import { useEffect, useState } from 'react'
import client from '../api/client'

export default function Hospitals() {
  const [hospitals, setHospitals] = useState([])
  const [city, setCity] = useState('')
  const [coords, setCoords] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [locationError, setLocationError] = useState('')

  async function fetchHospitals(params = {}) {
    setLoading(true)
    setError('')
    try {
      const res = await client.get('/hospitals', { params })
      setHospitals(res.data)
    } catch {
      setError('Could not load the directory. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchHospitals() }, [])

  function useMyLocation() {
    setLocationError('')
    if (!navigator.geolocation) {
      setLocationError('Location is not supported by this browser. Search by village, town, district or PIN code instead.')
      return
    }
    navigator.geolocation.getCurrentPosition((pos) => {
      const c = { lat: pos.coords.latitude, lon: pos.coords.longitude }
      setCoords(c)
      fetchHospitals({ ...c, ...(city.trim() ? { search: city.trim() } : {}) })
    }, () => {
      setLocationError('Location permission was not available. Search by village, town, district or PIN code instead.')
    }, { timeout: 10000 })
  }

  return (
    <div className="page-content mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-9">
      <div className="mb-7">
        <p className="text-xs font-bold tracking-[0.18em] text-accent">CARE NEAR YOU</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-primary">Hospitals & clinics</h1>
        <p className="mt-2 text-sm text-ink/55">Search the MedAssist directory by village, town, district, PIN code or facility. Share your location only if you want distance sorting.</p>
      </div>

      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-line/70 bg-white p-4 shadow-card sm:flex-row">
        <input
          className="input sm:max-w-xs"
          placeholder="Village, town, district, PIN or facility"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchHospitals({ search: city.trim() })}
        />
        <button onClick={() => fetchHospitals({ search: city.trim() })} className="btn-secondary">Search directory</button>
        <button onClick={useMyLocation} className="btn-primary">Use my location</button>
      </div>

      <p className="mb-5 text-xs leading-relaxed text-ink/50">Directory coverage is incomplete and limited to existing MedAssist listings. A search result does not confirm facility hours, services or availability. For emergencies in India call 112.</p>
      {coords && <p className="mb-3 text-xs text-ink/50">Results are sorted by distance using your current location.</p>}
      {locationError && <p className="mb-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900" role="status">{locationError}</p>}
      {loading ? (
        <p className="text-ink/50">Loading…</p>
      ) : error ? (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-800" role="alert">
          <p>{error}</p>
          <button onClick={() => fetchHospitals(city.trim() ? { search: city.trim() } : {})} className="mt-2 font-semibold underline">Retry</button>
        </div>
      ) : hospitals.length === 0 ? (
        <p className="text-ink/50">No hospitals found.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {hospitals.map((h) => (
          <div key={h.id} className="card flex flex-col justify-between gap-5 p-5">
              <div>
              <div className="mb-3 flex items-start justify-between gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-xl text-primary">✚</span>
                <span className={`text-xs px-3 py-1.5 rounded-full ${h.emergency_available ? 'bg-severity-low/10 text-severity-low' : 'bg-line text-ink/50'}`}>
                  {h.emergency_available ? 'Emergency care' : 'No ER'}
                </span>
              </div>
              <p className="font-semibold text-primary">{h.name}</p>
              <p className="text-sm text-ink/60">{h.address}</p>
              <p className="text-sm text-ink/50 mt-1">{h.specialties}</p>
              {h.phone && <p className="text-sm text-accent mt-1">{h.phone}</p>}
            </div>
            {h.phone && <a href={`tel:${h.phone}`} className="btn-secondary w-full text-sm">Call hospital</a>}
          </div>
        ))}
        </div>
      )}
    </div>
  )
}
