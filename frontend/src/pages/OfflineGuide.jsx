import { useState } from 'react'
import { getOfflineReply, HOMECARE_COPY, HOMECARE_TOPICS } from '../data/homecareOfflineGuide'

export default function OfflineGuide() {
  const [language, setLanguage] = useState('en')
  const [selected, setSelected] = useState(null)
  const copy = HOMECARE_COPY[language]
  const topics = HOMECARE_TOPICS[language]

  function choose(topic) {
    setSelected({ topic, response: getOfflineReply(topic.question, language) })
  }

  return (
    <div className="page-content mx-auto max-w-3xl space-y-6 px-5 py-8 md:px-8">
      <header><p className="text-xs font-bold tracking-[0.18em] text-accent">OFFLINE HEALTH GUIDE</p><h1 className="mt-2 font-display text-3xl font-semibold text-primary">{copy.guide}</h1><p className="mt-2 text-sm text-ink/60">{copy.guideNotice}</p></header>
      <div className="rounded-xl bg-green-50 p-3 text-sm text-green-900" role="status">This guide is static educational content. It does not connect to live services.</div>
      <label className="block text-sm font-medium">Language
        <select className="input mt-1 max-w-xs" value={language} onChange={(e) => { setLanguage(e.target.value); setSelected(null) }}>
          <option value="en">English</option><option value="hi">हिन्दी</option><option value="kn">ಕನ್ನಡ</option>
        </select>
      </label>
      <section className="grid gap-3 sm:grid-cols-2" aria-label="Available guide topics">
        {topics.map((topic) => <button key={topic.id} onClick={() => choose(topic)} className="card p-4 text-left font-semibold text-primary transition hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent">{topic.label}<span className="mt-1 block text-xs font-normal text-ink/55">{topic.question}</span></button>)}
      </section>
      {selected && <article className="card space-y-3 p-5" aria-live="polite">
        <h2 className="font-display text-xl font-semibold text-primary">{selected.topic.label}</h2>
        <p className="text-sm leading-relaxed text-ink/75">{selected.response?.reply || copy.unavailable}</p>
        <p className="text-xs leading-relaxed text-ink/55">{copy.disclaimer} {copy.draft}</p>
      </article>}
      <p className="text-xs text-ink/50">Content is a draft and needs clinical review; no clinical review date is available. Offline mode does not provide live AI, video, hospital lookup, device sync, or emergency-service connectivity.</p>
    </div>
  )
}
