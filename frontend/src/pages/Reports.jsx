import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import client from '../api/client'

const SEVERITY_COLORS = { low: '#3E8E5A', moderate: '#D9A441', high: '#DB7A3B', emergency: '#B23A3A' }

export default function Reports() {
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    client.get('/reports/summary').then((res) => setSummary(res.data))
  }, [])

  if (!summary) return <div className="p-8 text-center text-ink/50">Loading reports…</div>

  const severityData = Object.entries(summary.predictions_by_severity).map(([k, v]) => ({ name: k, value: v }))

  return (
    <div className="page-content mx-auto max-w-7xl space-y-7 px-5 py-8 md:px-8 md:py-9">
      <div>
        <p className="text-xs font-bold tracking-[0.18em] text-accent">CARE AT A GLANCE</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-primary">Reports & analytics</h1>
        <p className="mt-2 text-sm text-ink/55">A summary of activity across MedAssist.</p>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        {[
          ['Total patients', summary.total_patients],
          ['Total doctors', summary.total_doctors],
          ['Assessments run', summary.total_predictions],
          ['Appointments', summary.total_appointments],
        ].map(([label, value]) => (
          <div key={label} className="card p-5">
            <p className="text-sm text-ink/50">{label}</p>
            <p className="mt-2 font-display text-3xl font-semibold text-primary">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="mb-1 font-display text-xl font-semibold text-primary">Assessments by severity</h2>
          <p className="mb-4 text-sm text-ink/50">Distribution of reported urgency levels</p>
          {severityData.length === 0 ? <p className="text-sm text-ink/50">No data yet.</p> : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={severityData} dataKey="value" nameKey="name" outerRadius={90} label>
                  {severityData.map((entry, i) => (
                    <Cell key={i} fill={SEVERITY_COLORS[entry.name] || '#999'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-5">
          <h2 className="mb-1 font-display text-xl font-semibold text-primary">Top predicted conditions</h2>
          <p className="mb-4 text-sm text-ink/50">Most common preliminary assessment results</p>
          {summary.top_predicted_diseases.length === 0 ? <p className="text-sm text-ink/50">No data yet.</p> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={summary.top_predicted_diseases}>
                <XAxis dataKey="disease" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={70} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#2F9C8F" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
