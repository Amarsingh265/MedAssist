import { useLocation, useNavigate, Link } from 'react-router-dom'
import client from '../api/client'
import SeverityBadge from '../components/SeverityBadge'

export default function PredictionResult() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const result = state?.result

  if (!result) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16 text-center">
        <p className="text-ink/60 mb-4">No assessment to show yet.</p>
        <Link to="/symptom-checker" className="btn-primary">Go to Symptom Checker</Link>
      </div>
    )
  }

  const { top_prediction, differential } = result

  async function downloadPdf() {
    const res = await client.get(`/predictions/${top_prediction.id}/pdf`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const a = document.createElement('a')
    a.href = url
    a.download = `medassist_report_${top_prediction.id}.pdf`
    a.click()
  }

  return (
    <div className="page-content mx-auto max-w-4xl space-y-6 px-5 py-8 md:px-8 md:py-9">
      <div>
        <p className="text-xs font-bold tracking-[0.18em] text-accent">YOUR SYMPTOM CHECK</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-primary">Assessment summary</h1>
        <p className="mt-2 text-sm text-ink/55">Review your preliminary result and possible next steps.</p>
      </div>

      <div className="card space-y-5 p-5 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-ink/50">Preliminary assessment</p>
            <p className="font-display text-2xl font-semibold text-primary">{top_prediction.predicted_disease}</p>
          </div>
          <SeverityBadge level={top_prediction.severity} />
        </div>

        <div>
          <p className="text-sm text-ink/50 mb-1">Model confidence</p>
          <div className="w-full bg-surface rounded-full h-2">
            <div className="bg-accent h-2 rounded-full" style={{ width: `${Math.round(top_prediction.confidence * 100)}%` }} />
          </div>
          <p className="text-xs text-ink/40 mt-1">{Math.round(top_prediction.confidence * 100)}%</p>
        </div>

        <div className="bg-surface rounded-md p-4">
          <p className="text-sm font-medium text-ink mb-1">Recommendation</p>
          <p className="text-sm text-ink/70">{top_prediction.recommendation}</p>
        </div>

        {differential?.length > 0 && (
          <div>
            <p className="text-sm font-medium text-ink mb-2">Other possibilities considered</p>
            <ul className="space-y-1">
              {differential.map((d, i) => (
                <li key={i} className="flex justify-between text-sm text-ink/60">
                  <span>{d.disease}</span>
                  <span className="font-mono">{Math.round(d.probability * 100)}%</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          <button onClick={downloadPdf} className="btn-secondary text-sm">Download PDF report</button>
          <Link to="/appointments" className="btn-primary text-sm">Book an appointment</Link>
          <Link to="/hospitals" className="btn-secondary text-sm">Find nearby hospitals</Link>
        </div>
      </div>

      <p className="text-xs text-ink/40 mt-6">
        This is an automated, preliminary assessment based on the symptoms you
        reported. It is not a medical diagnosis - please consult a licensed
        healthcare professional for confirmation and treatment.
      </p>
    </div>
  )
}
