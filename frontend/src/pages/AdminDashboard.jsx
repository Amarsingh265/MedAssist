import { useEffect, useState } from 'react'
import client from '../api/client'

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [hospitals, setHospitals] = useState([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState({ name: '', city: '', address: '', phone: '', specialties: '', latitude: '', longitude: '', emergency_available: true })

  function loadAll() {
    client.get('/admin/users').then((res) => setUsers(res.data))
    client.get('/admin/hospitals').then((res) => setHospitals(res.data))
  }

  useEffect(() => { loadAll() }, [])

  async function deactivate(id) {
    setError('')
    try {
      await client.patch(`/admin/users/${id}/deactivate`)
      setNotice('Account deactivated.')
      loadAll()
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Could not deactivate account.')
    }
  }

  async function verifyDoctor(id) {
    setError('')
    try {
      await client.patch(`/admin/users/${id}/verify-doctor`)
      setNotice('Doctor account verified and made available for appointment booking.')
      loadAll()
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Could not verify doctor.')
    }
  }

  async function addHospital(e) {
    e.preventDefault()
    await client.post('/admin/hospitals', {
      ...form,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
    })
    setForm({ name: '', city: '', address: '', phone: '', specialties: '', latitude: '', longitude: '', emergency_available: true })
    loadAll()
  }

  return (
    <div className="page-content mx-auto max-w-7xl space-y-8 px-5 py-8 md:px-8 md:py-9">
      <div>
        <p className="text-xs font-bold tracking-[0.18em] text-accent">SYSTEM MANAGEMENT</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-primary">Admin dashboard</h1>
        <p className="mt-2 text-sm text-ink/55">Manage MedAssist users and care locations.</p>
      </div>

      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {notice && <p role="status" className="rounded-xl bg-green-50 p-3 text-sm text-green-900">{notice}</p>}

      <div>
        <div className="mb-4 flex items-end justify-between">
          <div><h2 className="font-display text-xl font-semibold text-primary">Users</h2><p className="mt-1 text-sm text-ink/50">Manage registered accounts</p></div>
          <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-primary">{users.length} accounts</span>
        </div>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="text-left px-4 py-2">Name</th>
                <th className="text-left px-4 py-2">Email</th>
                <th className="text-left px-4 py-2">Role</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="text-left px-4 py-2">Verification</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-line">
                  <td className="px-4 py-3 font-medium text-primary">{u.full_name}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2 capitalize">{u.role}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-3 py-1 text-xs ${u.is_active === false ? 'bg-severity-emergency/10 text-severity-emergency' : 'bg-severity-low/10 text-severity-low'}`}>{u.is_active === false ? 'Inactive' : 'Active'}</span></td>
                  <td className="px-4 py-2">
                    {u.role === 'doctor' ? (u.is_verified ? <span className="text-xs font-semibold text-severity-low">Verified</span> : <span className="text-xs text-amber-800">Not verified</span>) : '—'}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex justify-end gap-3">
                      {u.role === 'doctor' && !u.is_verified && u.is_active !== false && <button onClick={() => verifyDoctor(u.id)} className="text-xs font-semibold text-primary underline">Verify doctor</button>}
                      {u.is_active !== false && <button onClick={() => deactivate(u.id)} className="text-xs text-severity-emergency underline">Deactivate</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <div className="mb-4"><h2 className="font-display text-xl font-semibold text-primary">Hospitals</h2><p className="mt-1 text-sm text-ink/50">Maintain the care locations available to patients.</p></div>
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          {hospitals.map((h) => (
            <div key={h.id} className="card flex gap-3 p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/10 text-primary">✚</span>
              <div><p className="font-semibold text-primary">{h.name} — {h.city}</p>
              <p className="text-sm text-ink/60">{h.address}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={addHospital} className="card grid gap-4 p-5 sm:grid-cols-2 md:p-6">
          <div className="sm:col-span-2"><h3 className="font-display text-lg font-semibold text-primary">Add a hospital</h3><p className="mt-1 text-sm text-ink/50">Add a new location to the directory.</p></div>
          <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="input" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
          <input className="input sm:col-span-2" placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
          <input className="input" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className="input" placeholder="Specialties (comma separated)" value={form.specialties} onChange={(e) => setForm({ ...form, specialties: e.target.value })} />
          <input className="input" placeholder="Latitude" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
          <input className="input" placeholder="Longitude" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
          <button className="btn-primary sm:col-span-2">Add hospital</button>
        </form>
      </div>
    </div>
  )
}
