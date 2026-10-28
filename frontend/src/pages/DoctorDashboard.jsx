import { useEffect, useState } from 'react'
import client from '../api/client'
import SeverityBadge from '../components/SeverityBadge'

export default function DoctorDashboard() {
  const [patients, setPatients] = useState([])
  const [selected, setSelected] = useState(null)
  const [predictions, setPredictions] = useState([])
  const [appointments, setAppointments] = useState([])

  useEffect(() => {
    client.get('/doctors/patients').then((res) => setPatients(res.data))
    client.get('/appointments/mine').then((res) => setAppointments(res.data))
  }, [])

  async function selectPatient(p) {
    setSelected(p)
    const res = await client.get(`/doctors/patients/${p.id}/predictions`)
    setPredictions(res.data)
  }

  return (
    <div className="page-content mx-auto max-w-7xl space-y-7 px-5 py-8 md:px-8 md:py-9">
      <div>
        <p className="text-xs font-bold tracking-[0.18em] text-accent">CARE TEAM WORKSPACE</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-primary">Doctor dashboard</h1>
        <p className="mt-2 text-sm text-ink/55">Review your appointments and patient assessment history.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-[300px_1fr]">
        <div className="card p-5">
          <h2 className="mb-1 font-display text-xl font-semibold text-primary">Your patients</h2>
          <p className="mb-4 text-xs text-ink/50">Patients who have booked with you</p>
          <div className="space-y-1">
            {patients.length === 0 && <p className="text-sm text-ink/50">No patients yet — patients appear here once they book an appointment with you.</p>}
            {patients.map((p) => (
              <button
                key={p.id}
                onClick={() => selectPatient(p)}
                className={`block w-full rounded-xl px-3 py-3 text-left text-sm transition ${selected?.id === p.id ? 'bg-primary text-white' : 'text-ink/75 hover:bg-surface'}`}
              >
                {p.full_name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="card p-5">
            <h2 className="mb-4 font-display text-xl font-semibold text-primary">Upcoming appointments</h2>
            <div className="space-y-2">
              {appointments.length === 0 && <p className="text-sm text-ink/50">No appointments scheduled.</p>}
              {appointments.map((a) => (
                <div key={a.id} className="flex flex-wrap justify-between gap-2 border-t border-line pt-3 text-sm first:border-0 first:pt-0">
                  <span className="font-medium text-ink">{new Date(a.scheduled_time).toLocaleString()}</span>
                  <span className="rounded-full bg-accent/10 px-3 py-1 text-xs capitalize text-primary">{a.status}</span>
                </div>
              ))}
            </div>
          </div>

          {selected && (
            <div className="card p-5">
              <h2 className="mb-4 font-display text-xl font-semibold text-primary">{selected.full_name}’s assessment history</h2>
              <div className="space-y-3">
                {predictions.length === 0 && <p className="text-sm text-ink/50">No assessments recorded.</p>}
                {predictions.map((p) => (
                  <div key={p.id} className="flex justify-between items-center border-t border-line pt-3 first:border-0 first:pt-0">
                    <div>
                      <p className="text-sm font-medium text-ink">{p.predicted_disease}</p>
                      <p className="text-xs text-ink/50">{p.symptoms_list}</p>
                    </div>
                    <SeverityBadge level={p.severity} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
