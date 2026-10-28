import { useEffect, useState } from 'react'
import client from '../api/client'

export default function FamilyProfiles() {
  const [profiles, setProfiles] = useState([])
  const [form, setForm] = useState({ display_name: '', relationship: '' })
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function load() {
    try {
      const response = await client.get('/family-profiles')
      setProfiles(response.data)
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Could not load family profiles.')
    }
  }

  useEffect(() => { load() }, [])

  async function createProfile(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    try {
      await client.post('/family-profiles', form)
      setForm({ display_name: '', relationship: '' })
      setNotice('Dependent profile created.')
      await load()
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Could not create profile.')
    }
  }

  async function deactivate(id) {
    try {
      await client.patch(`/family-profiles/${id}/deactivate`)
      await load()
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Could not deactivate profile.')
    }
  }

  async function saveEdit(event) {
    event.preventDefault()
    try {
      await client.patch(`/family-profiles/${editing.id}`, {
        display_name: editing.display_name,
        relationship: editing.relationship,
      })
      setEditing(null)
      await load()
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Could not update profile.')
    }
  }

  return (
    <div className="page-content mx-auto max-w-3xl space-y-6 px-5 py-8 md:px-8">
      <header>
        <p className="text-xs font-bold tracking-[0.18em] text-accent">FAMILY CARE</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-primary">Dependent profiles</h1>
        <p className="mt-2 text-sm text-ink/60">Create and manage profiles for dependants under your care.</p>
      </header>
      <div role="note" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
        These are basic dependent contact profiles only. They are not linked to medical records, appointments, reports, or reminders. Adult family members need their own account and explicit consent; this page does not grant access to another adult’s health information.
      </div>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {notice && <p role="status" className="rounded-xl bg-green-50 p-3 text-sm text-green-900">{notice}</p>}
      <form onSubmit={createProfile} className="card grid gap-4 p-5 sm:grid-cols-2">
        <label className="text-sm font-medium text-ink">Name
          <input required maxLength="120" className="input mt-1" value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} />
        </label>
        <label className="text-sm font-medium text-ink">Relationship
          <input required maxLength="40" className="input mt-1" value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })} placeholder="For example, child or ward" />
        </label>
        <button className="btn-primary sm:col-span-2 sm:justify-self-start">Add dependent</button>
      </form>
      <section className="space-y-3" aria-label="Your dependent profiles">
        {profiles.length === 0 ? <p className="card p-5 text-sm text-ink/55">No dependent profiles have been added.</p> : profiles.map((profile) => (
          <article key={profile.id} className="card p-4">
            {editing?.id === profile.id ? (
              <form onSubmit={saveEdit} className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-medium">Name<input className="input mt-1" maxLength="120" required value={editing.display_name} onChange={(e) => setEditing({ ...editing, display_name: e.target.value })} /></label>
                <label className="text-sm font-medium">Relationship<input className="input mt-1" maxLength="40" required value={editing.relationship} onChange={(e) => setEditing({ ...editing, relationship: e.target.value })} /></label>
                <div className="flex gap-2 sm:col-span-2"><button className="btn-primary text-xs">Save</button><button type="button" onClick={() => setEditing(null)} className="btn-secondary text-xs">Cancel</button></div>
              </form>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div><p className="font-semibold text-primary">{profile.display_name}</p><p className="text-xs text-ink/55">{profile.relationship} · {profile.active ? 'Active' : 'Inactive'}</p></div>
                {profile.active && <div className="flex gap-2"><button onClick={() => setEditing({ ...profile })} className="btn-secondary text-xs">Edit</button><button onClick={() => deactivate(profile.id)} className="rounded-xl px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50">Deactivate</button></div>}
              </div>
            )}
          </article>
        ))}
      </section>
    </div>
  )
}
