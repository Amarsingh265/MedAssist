import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'

const emptyScheme = { name: '', state: 'India', category: '', beneficiaries: '', purpose: '', benefits: '', application_process: '', required_documents: '', official_url: '', verification_date: '' }

export default function GovernmentSchemes() {
  const { user } = useAuth()
  const [schemes, setSchemes] = useState([])
  const [filters, setFilters] = useState({ search: '', state: '', category: '' })
  const [form, setForm] = useState(emptyScheme)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function load() {
    setError('')
    try {
      const response = await client.get(user?.role === 'admin' ? '/admin/government-schemes' : '/government-schemes', { params: filters })
      setSchemes(response.data)
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Could not load the scheme catalogue.')
    }
  }

  useEffect(() => { load() }, [user?.role])

  async function addScheme(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    try {
      await client.post('/admin/government-schemes', {
        ...form,
        verification_date: form.verification_date ? new Date(`${form.verification_date}T00:00:00Z`).toISOString() : null,
        required_documents: form.required_documents || null,
      })
      setForm(emptyScheme)
      setNotice('Scheme saved as pending review; it is not visible in the public catalogue yet.')
      await load()
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Could not save scheme. Use an official HTTPS .gov.in or .nic.in source.')
    }
  }

  async function review(id, review_status) {
    try {
      await client.patch(`/admin/government-schemes/${id}/review`, { review_status })
      await load()
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Could not update scheme review status.')
    }
  }

  return (
    <div className="page-content mx-auto max-w-5xl space-y-6 px-5 py-8 md:px-8">
      <header><p className="text-xs font-bold tracking-[0.18em] text-accent">PUBLIC SERVICES</p><h1 className="mt-2 font-display text-3xl font-semibold text-primary">Government health schemes</h1><p className="mt-2 text-sm text-ink/60">Browse only catalogue entries reviewed and published by a MedAssist administrator. Confirm current rules on the official source.</p></header>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {notice && <p role="status" className="rounded-xl bg-green-50 p-3 text-sm text-green-900">{notice}</p>}
      {user?.role !== 'admin' && <form onSubmit={(e) => { e.preventDefault(); load() }} className="card grid gap-3 p-4 sm:grid-cols-4">
        <input className="input" placeholder="Search name or beneficiaries" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        <input className="input" placeholder="State" value={filters.state} onChange={(e) => setFilters({ ...filters, state: e.target.value })} />
        <input className="input" placeholder="Category" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} />
        <button className="btn-secondary">Search</button>
      </form>}
      {user?.role === 'admin' && <form onSubmit={addScheme} className="card grid gap-3 p-5 md:grid-cols-2">
        <h2 className="font-display text-lg font-semibold text-primary md:col-span-2">Add a catalogue entry (pending review)</h2>
        {[
          ['name', 'Scheme name'], ['state', 'State'], ['category', 'Category'], ['beneficiaries', 'Intended beneficiaries'],
          ['official_url', 'Official HTTPS .gov.in/.nic.in URL'], ['verification_date', 'Date checked'],
        ].map(([key, label]) => <label key={key} className="text-sm font-medium">{label}<input required={key !== 'verification_date'} type={key === 'verification_date' ? 'date' : 'text'} className="input mt-1" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /></label>)}
        {[
          ['purpose', 'Purpose'], ['benefits', 'Benefits'], ['application_process', 'Application process'], ['required_documents', 'Required documents'],
        ].map(([key, label]) => <label key={key} className="text-sm font-medium md:col-span-2">{label}<textarea required={key !== 'required_documents'} rows="2" className="input mt-1" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /></label>)}
        <button className="btn-primary md:col-span-2 md:justify-self-start">Save pending entry</button>
      </form>}
      <section className="grid gap-4 md:grid-cols-2">
        {schemes.length === 0 ? <p className="card p-5 text-sm leading-relaxed text-ink/60 md:col-span-2">No {user?.role === 'admin' ? 'catalogue entries' : 'verified schemes'} found. The app does not invent scheme information. Administrators must verify details against official sources before publishing.</p> : schemes.map((scheme) => (
          <article key={scheme.id} className="card space-y-3 p-5">
            <div className="flex items-start justify-between gap-3"><h2 className="font-display text-lg font-semibold text-primary">{scheme.name}</h2><span className="rounded-full bg-surface px-2 py-1 text-xs text-ink/60">{scheme.review_status}</span></div>
            <p className="text-xs text-ink/55">{scheme.state} · {scheme.category} · Checked {scheme.verification_date ? new Date(scheme.verification_date).toLocaleDateString() : 'date not recorded'}</p>
            <p className="text-sm"><strong>Beneficiaries:</strong> {scheme.beneficiaries}</p><p className="text-sm">{scheme.purpose}</p><p className="text-sm"><strong>Benefits:</strong> {scheme.benefits}</p><p className="text-sm"><strong>Apply:</strong> {scheme.application_process}</p>
            {scheme.required_documents && <p className="text-sm"><strong>Documents:</strong> {scheme.required_documents}</p>}
            <a className="inline-flex text-sm font-semibold text-accent underline" href={scheme.official_url} target="_blank" rel="noreferrer">Open official source</a>
            {user?.role === 'admin' && scheme.review_status === 'pending' && <button onClick={() => review(scheme.id, 'verified')} className="btn-secondary block">Mark verified and publish</button>}
          </article>
        ))}
      </section>
      <p className="text-xs text-ink/50">Eligibility guidance here is informational only. MedAssist does not determine official eligibility or submit applications.</p>
    </div>
  )
}
