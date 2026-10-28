import { useEffect, useRef, useState } from 'react'
import client from '../api/client'

const EMPTY_FORM = {
  title: '',
  instructions: '',
  reminder_type: 'medicine',
  recurrence: 'none',
  scheduled_at: '',
  appointment_id: '',
}

function toLocalInput(value) {
  const date = new Date(value)
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 16)
}

function statusLabel(reminder) {
  if (reminder.completed_at) return 'Taken'
  if (!reminder.active) return 'Paused'
  if (new Date(reminder.scheduled_at) <= new Date()) return 'Missed'
  return 'Scheduled'
}

function statusStyle(status) {
  if (status === 'Taken') return 'bg-emerald-50 text-emerald-800'
  if (status === 'Missed') return 'bg-amber-50 text-amber-900'
  if (status === 'Paused') return 'bg-surface text-ink/70'
  return 'bg-primary/10 text-primary'
}

export default function Reminders() {
  const [items, setItems] = useState([])
  const [appointments, setAppointments] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [permission, setPermission] = useState(
    () => ('Notification' in window ? Notification.permission : 'unsupported'),
  )
  const notifiedIds = useRef(new Set())

  async function load(showLoading = true) {
    if (showLoading) setLoading(true)
    setError('')
    try {
      const [remindersResponse, appointmentsResponse] = await Promise.all([
        client.get('/reminders'),
        client.get('/appointments/mine'),
      ])
      setItems(remindersResponse.data)
      setAppointments(appointmentsResponse.data)
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Could not load reminders. Check your connection and retry.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const timer = window.setInterval(() => load(false), 60_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (permission !== 'granted') return undefined
    const timer = window.setInterval(() => {
      const now = Date.now()
      for (const item of items) {
        if (
          item.active &&
          !item.completed_at &&
          new Date(item.scheduled_at).getTime() <= now &&
          new Date(item.scheduled_at).getTime() >= now - 120_000 &&
          !notifiedIds.current.has(item.id)
        ) {
          notifiedIds.current.add(item.id)
          try {
            new Notification('MedAssist reminder', {
              body: 'A saved reminder is due. Open MedAssist to view the details.',
              tag: `medassist-reminder-${item.id}`,
            })
          } catch {
            setError('The browser could not display an alert. Your saved reminder remains available in this list.')
            return
          }
        }
      }
    }, 30_000)
    return () => window.clearInterval(timer)
  }, [items, permission])

  async function enableNotifications() {
    if (!('Notification' in window)) {
      setPermission('unsupported')
      return
    }
    setError('')
    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      setNotice(
        result === 'granted'
          ? 'Notifications are enabled while this MedAssist page is open.'
          : 'Notifications were not enabled. You can still view reminders here.',
      )
    } catch {
      setError('The browser did not allow notification permission to be requested.')
    }
  }

  function resetForm() {
    setForm(EMPTY_FORM)
    setEditingId(null)
  }

  async function saveReminder(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    setSaving(true)
    try {
      const payload = {
        ...form,
        scheduled_at: new Date(form.scheduled_at).toISOString(),
        recurrence: form.reminder_type === 'appointment' ? 'none' : form.recurrence,
        appointment_id:
          form.reminder_type === 'appointment' && form.appointment_id
            ? Number(form.appointment_id)
            : null,
        instructions: form.instructions.trim() || null,
      }
      if (editingId) {
        await client.patch(`/reminders/${editingId}`, {
          title: payload.title,
          instructions: payload.instructions,
          scheduled_at: payload.scheduled_at,
          recurrence: payload.recurrence,
        })
        setNotice('Reminder updated.')
      } else {
        await client.post('/reminders', payload)
        setNotice('Reminder saved.')
      }
      resetForm()
      await load(false)
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Could not save reminder.')
    } finally {
      setSaving(false)
    }
  }

  function startEdit(item) {
    setEditingId(item.id)
    setForm({
      title: item.title,
      instructions: item.instructions || '',
      reminder_type: item.reminder_type,
      recurrence: item.recurrence || 'none',
      scheduled_at: toLocalInput(item.scheduled_at),
      appointment_id: item.appointment_id ? String(item.appointment_id) : '',
    })
    setNotice('')
    setError('')
  }

  async function updateReminder(id, values, successMessage) {
    setError('')
    setNotice('')
    try {
      await client.patch(`/reminders/${id}`, values)
      setNotice(successMessage)
      await load(false)
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Could not update reminder.')
    }
  }

  async function markTaken(item) {
    setError('')
    setNotice('')
    try {
      await client.post(`/reminders/${item.id}/complete`)
      setNotice(item.recurrence !== 'none' ? 'Marked taken. The next scheduled reminder has been created.' : 'Marked taken.')
      await load(false)
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Could not update reminder status.')
    }
  }

  async function deleteReminder(id) {
    setError('')
    setNotice('')
    try {
      await client.delete(`/reminders/${id}`)
      if (editingId === id) resetForm()
      setNotice('Reminder deleted.')
      await load(false)
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Could not delete reminder.')
    }
  }

  return (
    <div className="page-content mx-auto max-w-5xl space-y-7 px-5 py-8 md:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-accent">CARE PLANNING</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-primary">Reminders</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/65">A simple way to keep track of your care schedule. Medicine names and instructions should match your clinician’s prescription exactly.</p>
        </div>
        <button
          type="button"
          className="btn-secondary text-sm"
          onClick={enableNotifications}
          disabled={permission === 'unsupported' || permission === 'denied'}
        >
          {permission === 'granted' ? '✓ Alerts enabled' : permission === 'denied' ? 'Alerts blocked in browser' : permission === 'unsupported' ? 'Alerts unavailable' : 'Enable browser alerts'}
        </button>
      </header>

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">{error}</p>}
      {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">{notice}</p>}

      <form onSubmit={saveReminder} className="card grid gap-5 p-5 md:grid-cols-2 md:p-7">
        <div className="md:col-span-2">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-accent">{editingId ? 'Edit reminder' : 'New reminder'}</p>
          <h2 className="mt-1 font-display text-xl font-bold text-primary">{editingId ? 'Update details' : 'Add to your schedule'}</h2>
        </div>
        <div>
          <label className="label" htmlFor="reminder-title">Reminder title</label>
          <input id="reminder-title" required maxLength="160" className="input" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Use the name from your prescription" />
        </div>
        <div>
          <label className="label" htmlFor="reminder-type">Type</label>
          <select id="reminder-type" className="input" value={form.reminder_type} onChange={(event) => setForm({ ...form, reminder_type: event.target.value, recurrence: 'none', appointment_id: '' })} disabled={Boolean(editingId)}>
            <option value="medicine">Medicine</option>
            <option value="appointment">Appointment</option>
            <option value="follow_up">Follow-up</option>
          </select>
          {editingId && <p className="mt-1 text-xs text-ink/50">Type cannot be changed after saving.</p>}
        </div>
        <div>
          <label className="label" htmlFor="reminder-time">Date and time</label>
          <input id="reminder-time" required type="datetime-local" className="input" value={form.scheduled_at} onChange={(event) => setForm({ ...form, scheduled_at: event.target.value })} />
          <p className="mt-1 text-xs text-ink/50">Uses your device’s local time zone.</p>
        </div>
        {form.reminder_type === 'appointment' && !editingId && (
          <div>
            <label className="label" htmlFor="reminder-appointment">Link to appointment (optional)</label>
            <select id="reminder-appointment" className="input" value={form.appointment_id} onChange={(event) => setForm({ ...form, appointment_id: event.target.value })}>
              <option value="">No linked appointment</option>
              {appointments.filter((appointment) => appointment.status !== 'cancelled').map((appointment) => (
                <option key={appointment.id} value={appointment.id}>#{appointment.id} · {new Date(appointment.scheduled_time).toLocaleString()}</option>
              ))}
            </select>
          </div>
        )}
        {form.reminder_type !== 'appointment' && (
          <div>
            <label className="label" htmlFor="reminder-recurrence">Repeat</label>
            <select id="reminder-recurrence" className="input" value={form.recurrence} onChange={(event) => setForm({ ...form, recurrence: event.target.value })}>
              <option value="none">Does not repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        )}
        <div className="md:col-span-2">
          <label className="label" htmlFor="reminder-instructions">Clinician-provided instructions <span className="font-normal text-ink/55">(optional)</span></label>
          <textarea id="reminder-instructions" maxLength="500" rows="2" className="input resize-y" value={form.instructions} onChange={(event) => setForm({ ...form, instructions: event.target.value })} placeholder="Enter exactly what your clinician or prescription says; MedAssist will not change it." />
        </div>
        <div className="flex flex-wrap gap-3 md:col-span-2">
          <button className="btn-primary" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Save changes' : 'Save reminder'}</button>
          {editingId && <button type="button" onClick={resetForm} className="btn-secondary">Cancel edit</button>}
        </div>
      </form>

      <section className="space-y-4" aria-labelledby="saved-reminders">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-accent">YOUR SCHEDULE</p>
            <h2 id="saved-reminders" className="mt-1 font-display text-xl font-bold text-primary">Saved reminders</h2>
          </div>
          {!loading && <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink/65">{items.length} {items.length === 1 ? 'reminder' : 'reminders'}</span>}
        </div>
        {loading ? (
          <div className="card flex items-center gap-3 p-6" role="status"><span className="h-5 w-5 animate-spin rounded-full border-2 border-primary/20 border-t-primary" /><p className="text-sm text-ink/65">Loading your reminders…</p></div>
        ) : items.length === 0 ? (
          <div className="card p-8 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-xl text-primary" aria-hidden="true">◷</span>
            <h3 className="mt-4 font-semibold text-primary">No reminders yet</h3>
            <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-ink/60">Add a reminder above to keep a note of an appointment, medicine, or follow-up.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const status = statusLabel(item)
              return (
                <article key={item.id} className="card flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-primary">{item.title}</h3>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(status)}`}>{status}</span>
                    </div>
                    <p className="mt-1 text-sm capitalize text-ink/65">
                      {item.reminder_type.replace('_', ' ')}
                      {item.recurrence !== 'none' && ` · Repeats ${item.recurrence}`}
                      {' · '}{new Date(item.scheduled_at).toLocaleString()}
                    </p>
                    {item.instructions && <p className="mt-2 max-w-2xl whitespace-pre-wrap text-sm leading-6 text-ink/70">{item.instructions}</p>}
                  </div>
                  <div className="flex flex-wrap gap-2 lg:shrink-0">
                    {status !== 'Taken' && (
                      <button type="button" onClick={() => startEdit(item)} className="btn-secondary px-4 text-sm">Edit</button>
                    )}
                    {status === 'Scheduled' && (
                      <button type="button" onClick={() => updateReminder(item.id, { active: false }, 'Reminder paused.')} className="btn-secondary px-4 text-sm">Pause</button>
                    )}
                    {status === 'Paused' && (
                      <button type="button" onClick={() => updateReminder(item.id, { active: true }, 'Reminder resumed.')} className="btn-secondary px-4 text-sm">Resume</button>
                    )}
                    {(status === 'Scheduled' || status === 'Missed') && (
                      <button type="button" onClick={() => markTaken(item)} className="btn-primary px-4 text-sm">{item.reminder_type === 'medicine' ? 'Mark taken' : 'Mark done'}</button>
                    )}
                    <button type="button" onClick={() => deleteReminder(item.id)} className="min-h-12 rounded-xl px-3 text-sm font-semibold text-red-700 transition hover:bg-red-50">Delete</button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
      <aside className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        <strong>Important:</strong> Reminders do not replace prescription labels or advice from your clinician. Browser alerts only work while this page is open; no email, SMS, or background push service is configured. A “Missed” label is based on the scheduled time and does not confirm whether a dose was taken.
      </aside>
    </div>
  )
}
