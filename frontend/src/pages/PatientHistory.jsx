import { useEffect, useState } from 'react'
import client from '../api/client'
import SeverityBadge from '../components/SeverityBadge'
import { Link } from 'react-router-dom'

export default function PatientHistory() {
  const [predictions, setPredictions] = useState([])
  const [records, setRecords] = useState([])

  useEffect(() => {
    client.get('/predictions/history').then((res) => setPredictions(res.data))
    client.get('/records').then((res) => setRecords(res.data))
  }, [])

  async function downloadPdf(id) {
    const res = await client.get(`/predictions/${id}/pdf`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const a = document.createElement('a')
    a.href = url
    a.download = `medassist_report_${id}.pdf`
    a.click()
  }

  return (
    <div className="page-content mx-auto max-w-7xl space-y-8 px-5 py-8 md:px-8 md:py-9">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-accent">YOUR HEALTH, ORGANIZED</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-primary">Medical records</h1>
          <p className="mt-2 text-sm text-ink/55">Review your previous assessments and saved records.</p>
        </div>
        <Link to="/upload" className="btn-primary">Add a record <span>＋</span></Link>
      </div>

      <section>
      <h2 className="mb-4 font-display text-xl font-semibold text-primary">Past assessments</h2>
      <div className="grid gap-3 mb-10">
        {predictions.length === 0 && <p className="card p-6 text-sm text-ink/50">No assessments yet. Your symptom checker results will appear here.</p>}
        {predictions.map((p) => (
          <div key={p.id} className="card flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center">
            <div>
              <p className="font-medium text-ink">{p.predicted_disease}</p>
              <p className="text-sm text-ink/50">{new Date(p.created_at).toLocaleString()}</p>
              <p className="text-sm text-ink/60 mt-1">{p.symptoms_list}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <SeverityBadge level={p.severity} />
              <button onClick={() => downloadPdf(p.id)} className="text-xs text-accent underline">Download PDF</button>
            </div>
          </div>
        ))}
      </div>
      </section>

      <section>
      <h2 className="mb-4 font-display text-xl font-semibold text-primary">Medical records & uploads</h2>
      <div className="grid gap-3">
        {records.length === 0 && <p className="card p-6 text-sm text-ink/50">No records uploaded yet.</p>}
        {records.map((r) => (
          <div key={r.id} className="card flex gap-4 p-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-lg text-primary">▤</span>
            <div>
            <p className="font-medium text-ink">{r.title}</p>
            <p className="text-sm text-ink/60">{r.description}</p>
            {r.file_path && (
              <a href={r.file_path} target="_blank" rel="noreferrer" className="text-sm text-accent underline">View file</a>
            )}
            </div>
          </div>
        ))}
      </div>
      </section>
    </div>
  )
}
