import { useState } from 'react'
import client from '../api/client'

export default function ImageUpload() {
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleUploadImage(e) {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await client.post('/uploads/image', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setMessage(res.data.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddRecord(e) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData()
    form.append('title', title)
    form.append('description', description)
    form.append('record_type', 'note')
    try {
      await client.post('/records', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      setMessage('Record saved to your medical history.')
      setTitle('')
      setDescription('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-content mx-auto max-w-5xl space-y-7 px-5 py-8 md:px-8 md:py-9">
      <div>
        <p className="text-xs font-bold tracking-[0.18em] text-accent">YOUR HEALTH, ORGANIZED</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-primary">Add a medical record</h1>
        <p className="mt-2 text-sm text-ink/55">Keep lab reports, photos and helpful notes in one secure place.</p>
      </div>

      {message && <div className="bg-accent/10 border border-accent/30 text-ink/80 text-sm rounded-md p-3">{message}</div>}

      <div className="grid gap-5 md:grid-cols-2">
      <form onSubmit={handleUploadImage} className="card space-y-4 p-5 md:p-6">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent/10 text-lg text-primary">▧</span>
        <div><h2 className="font-display text-xl font-semibold text-primary">Upload an image</h2><p className="mt-1 text-sm text-ink/50">Add a photo for your care team to review.</p></div>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="input" />
        <button className="btn-primary" disabled={loading || !file}>{loading ? 'Uploading…' : 'Upload image'}</button>
        <p className="text-xs text-ink/40">Images are stored with your record for a doctor to review - this demo does not perform automated image-based diagnosis.</p>
      </form>

      <form onSubmit={handleAddRecord} className="card space-y-4 p-5 md:p-6">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent/10 text-lg text-primary">▤</span>
        <div><h2 className="font-display text-xl font-semibold text-primary">Add a note</h2><p className="mt-1 text-sm text-ink/50">Save a lab report summary or other health note.</p></div>
        <input className="input" placeholder="Title (e.g. Blood test - March)" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea className="input min-h-[80px]" placeholder="Details" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button className="btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Save record'}</button>
      </form>
      </div>
    </div>
  )
}
