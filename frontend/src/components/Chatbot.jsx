import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import VoiceInput from './VoiceInput'
import { emergencyReplyFor, getOfflineReply, HOMECARE_COPY, HOMECARE_TOPICS, isEmergencyMessage } from '../data/homecareOfflineGuide'

const LANGUAGES = [
  { value: 'en', label: 'English', voice: 'en-IN' },
  { value: 'hi', label: 'हिन्दी', voice: 'hi-IN' },
  { value: 'kn', label: 'ಕನ್ನಡ', voice: 'kn-IN' },
]

function welcomeMessage(copy) {
  return {
    sender: 'bot',
    message: copy.intro,
    safety_notices: [copy.disclaimer],
    content_status: 'educational_draft_needs_clinical_review',
  }
}

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('homecare-language')
    return ['en', 'hi', 'kn'].includes(saved) ? saved : 'en'
  })
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [topicSearch, setTopicSearch] = useState('')
  const [sending, setSending] = useState(false)
  const [notice, setNotice] = useState('')
  const bottomRef = useRef(null)
  const copy = HOMECARE_COPY[language]
  const topics = HOMECARE_TOPICS[language]
  const filteredTopics = topics.filter((topic) => `${topic.label} ${topic.question}`.toLocaleLowerCase().includes(topicSearch.toLocaleLowerCase()))

  useEffect(() => {
    localStorage.setItem('homecare-language', language)
  }, [language])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  async function send(rawMessage = input, { appendUser = true } = {}) {
    const userMessage = rawMessage.trim()
    if (!userMessage || sending) return
    if (appendUser) {
      setMessages((previous) => [...previous, { sender: 'user', message: userMessage }])
    }
    setInput('')
    setNotice('')

    if (isEmergencyMessage(userMessage)) {
      setMessages((previous) => [...previous, {
        sender: 'bot',
        message: emergencyReplyFor(userMessage, language),
        escalated: true,
        safety_notices: [copy.disclaimer],
        content_status: 'emergency_escalation',
      }])
      return
    }

    setSending(true)
    try {
      const response = await client.post('/chatbot', { message: userMessage, language })
      setMessages((previous) => [...previous, { sender: 'bot', ...response.data }])
    } catch (error) {
      const status = error?.response?.status
      if (status === 401) {
        setMessages((previous) => [...previous, {
          sender: 'bot',
          message: copy.signIn,
          authRequired: true,
        }])
      } else if (status === 429) {
        setMessages((previous) => [...previous, {
          sender: 'bot',
          message: error.response.data?.detail || 'Too many messages. Please wait before trying again.',
        }])
      } else {
        const offlineReply = getOfflineReply(userMessage, language)
        if (offlineReply) {
          const sensitiveAudience = /child|children|baby|infant|pregnan|elderly|older adult|allerg|chronic condition|बच्च|शिशु|गर्भ|बुज़ुर्ग|एलर्जी|ಮಗು|ಮಕ್ಕಳು|ಶಿಶು|ಗರ್ಭ|ವಯೋವೃದ್ಧ|ಅಲರ್ಜಿ/i.test(userMessage)
          setMessages((previous) => [...previous, {
            sender: 'bot',
            message: offlineReply.reply,
            offline: true,
            content_status: 'static_educational_draft_needs_clinical_review',
            safety_notices: [copy.disclaimer, ...(sensitiveAudience ? [copy.sensitiveAudience] : [])],
          }])
        } else {
          setMessages((previous) => [...previous, {
            sender: 'bot',
            message: copy.unavailable,
            failed: true,
            retryMessage: userMessage,
          }])
        }
      }
    } finally {
      setSending(false)
    }
  }

  function speak(message) {
    if (!('speechSynthesis' in window) || !window.SpeechSynthesisUtterance) {
      setNotice('Speech playback is not supported in this browser.')
      return
    }
    window.speechSynthesis.cancel()
    const utterance = new window.SpeechSynthesisUtterance(message)
    utterance.lang = LANGUAGES.find((item) => item.value === language)?.voice || 'en-IN'
    window.speechSynthesis.speak(utterance)
  }

  function stopSpeaking() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
  }

  return (
    <div className="fixed bottom-20 right-3 z-30 flex flex-col items-end gap-3 sm:bottom-5 sm:right-5">
      <Link
        to="/emergency"
        className="rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-700 shadow-md transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400"
      >
        {copy.emergency} · 112
      </Link>
      {open && (
        <section
          aria-label={copy.title}
          className="mb-1 flex h-[min(43rem,calc(100dvh-8rem))] w-[min(27rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-2xl"
        >
          <header className="bg-primary px-4 py-3 text-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold">{copy.title}</h2>
                <p className="mt-0.5 text-xs text-white/75">General education · Not a diagnosis</p>
              </div>
              <label className="sr-only" htmlFor="homecare-language">{copy.language}</label>
              <select
                id="homecare-language"
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="max-w-32 rounded-lg border border-white/30 bg-white/10 px-2 py-1.5 text-xs text-white outline-none focus:ring-2 focus:ring-white/60 [&>option]:text-ink"
              >
                {LANGUAGES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </div>
          </header>

          <div className="border-b border-line bg-surface/80 px-4 py-3">
            <p className="text-xs leading-relaxed text-ink/70">{copy.intro}</p>
            <p className="mt-2 text-[11px] leading-relaxed text-ink/55">{copy.service}</p>
            <Link to="/emergency" className="mt-2 inline-flex text-xs font-semibold text-red-700 hover:underline">
              {copy.emergency} · 112 →
            </Link>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm" aria-live="polite">
            {messages.length === 0 && (
              <div className="rounded-2xl bg-surface px-3 py-2.5 text-sm leading-relaxed text-ink">
                {welcomeMessage(copy).message}
              </div>
            )}
            {messages.map((message, index) => (
              <article
                key={`${index}-${message.sender}`}
                className={`max-w-[94%] rounded-2xl px-3 py-2.5 ${message.sender === 'user' ? 'ml-auto bg-primary text-white' : 'bg-surface text-ink'}`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{message.message}</p>
                {message.sender === 'bot' && message.offline && (
                  <p className="mt-2 text-[11px] font-semibold text-amber-800">{copy.offline} · {copy.draft}</p>
                )}
                {message.sender === 'bot' && message.content_status === 'educational_draft_needs_clinical_review' && (
                  <p className="mt-2 text-[11px] font-semibold text-amber-800">{copy.draft}</p>
                )}
                {message.sources?.length > 0 && (
                  <div className="mt-2 border-t border-line pt-2">
                    <p className="mb-1 text-[11px] text-ink/60">{copy.sourceNote}</p>
                    {message.sources.map((source) => (
                      <a
                        key={source.url}
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-xs font-semibold text-accent underline"
                      >
                        {source.title}
                      </a>
                    ))}
                    {message.sources.map((source) => (
                      <p key={`${source.url}-status`} className="mt-1 text-[10px] leading-relaxed text-ink/55">
                        {source.applicable_audience} {source.precautions}
                      </p>
                    ))}
                  </div>
                )}
                {message.safety_notices?.length > 0 && (
                  <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs leading-relaxed text-amber-950">
                    <strong>{copy.notices}: </strong>{message.safety_notices.join(' ')}
                  </div>
                )}
                {message.sender === 'bot' && (
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <button type="button" onClick={() => speak(message.message)} className="text-[11px] font-semibold text-accent hover:underline">
                      🔊 Read aloud
                    </button>
                    {message.failed && (
                      <button type="button" onClick={() => send(message.retryMessage, { appendUser: false })} disabled={sending} className="text-[11px] font-semibold text-accent hover:underline">
                        {copy.retry}
                      </button>
                    )}
                    {message.authRequired && <Link to="/login" className="text-[11px] font-semibold text-accent underline">Log in →</Link>}
                    {message.escalated && <Link to="/emergency" className="text-[11px] font-bold text-red-700 underline">{copy.emergency} →</Link>}
                  </div>
                )}
              </article>
            ))}
            {sending && <p className="text-xs text-ink/50" role="status">…</p>}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-line bg-white p-3">
            <label className="sr-only" htmlFor="homecare-topic-search">{copy.search}</label>
            <input
              id="homecare-topic-search"
              className="input !py-2 text-xs"
              placeholder={copy.search}
              value={topicSearch}
              onChange={(event) => setTopicSearch(event.target.value)}
            />
            <details className="mt-2" open={topicSearch.length > 0}>
              <summary className="cursor-pointer py-1 text-xs font-semibold text-primary">{copy.guide} · {topics.length}</summary>
              <p className="mb-2 text-[10px] leading-relaxed text-ink/55">{copy.guideNotice}</p>
              <div className="flex max-h-24 flex-wrap gap-1.5 overflow-y-auto">
                {filteredTopics.map((topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    disabled={sending}
                    onClick={() => send(topic.question)}
                    className="rounded-full border border-line px-2.5 py-1.5 text-[11px] text-ink transition hover:border-accent hover:text-accent disabled:opacity-50"
                  >
                    {topic.label}
                  </button>
                ))}
                {filteredTopics.length === 0 && <span className="text-xs text-ink/50">No matching topic.</span>}
              </div>
            </details>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <VoiceInput
                language={language}
                onResult={(transcript) => setInput((current) => current ? `${current} ${transcript}` : transcript)}
                onError={setNotice}
              />
              <button type="button" onClick={stopSpeaking} className="text-[11px] text-ink/55 hover:text-ink">Stop audio</button>
            </div>
            <p className="mt-1 text-[10px] leading-relaxed text-ink/45">{copy.mic}</p>
            {notice && <p className="mt-1 text-xs text-amber-800" role="status">{notice}</p>}
            <form
              className="mt-2 flex gap-2"
              onSubmit={(event) => {
                event.preventDefault()
                send()
              }}
            >
              <label className="sr-only" htmlFor="homecare-message">{copy.placeholder}</label>
              <input
                id="homecare-message"
                className="input min-w-0 !py-2 text-sm"
                placeholder={copy.placeholder}
                maxLength={1000}
                value={input}
                onChange={(event) => setInput(event.target.value)}
              />
              <button type="submit" className="btn-primary !px-3 !py-2 text-sm" disabled={sending || !input.trim()}>{copy.send}</button>
            </form>
          </div>
        </section>
      )}
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl text-white shadow-lg transition-colors hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
        aria-label={open ? 'Close HomeCare assistant' : `Open ${copy.title}`}
        aria-expanded={open}
      >
        {open ? '×' : '💬'}
      </button>
    </div>
  )
}
