import { useEffect, useRef, useState } from 'react'

const SPEECH_LOCALES = { en: 'en-IN', hi: 'hi-IN', kn: 'kn-IN' }

export default function VoiceInput({ onResult, language = 'en', onError }) {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(true)
  const recognitionRef = useRef(null)
  const onResultRef = useRef(onResult)
  const onErrorRef = useRef(onError)

  useEffect(() => { onResultRef.current = onResult }, [onResult])
  useEffect(() => { onErrorRef.current = onError }, [onError])

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setSupported(false)
      return undefined
    }
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = SPEECH_LOCALES[language] || SPEECH_LOCALES.en
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript
      if (transcript) onResultRef.current?.(transcript)
    }
    recognition.onerror = (event) => {
      setListening(false)
      const messages = {
        'not-allowed': 'Microphone permission was denied. You can type your question instead.',
        'no-speech': 'No speech was heard. Try again or type your question.',
        network: 'Speech recognition needs a network connection in this browser.',
      }
      onErrorRef.current?.(messages[event.error] || 'Speech recognition stopped. Please try again or type your question.')
    }
    recognition.onend = () => setListening(false)
    recognitionRef.current = recognition
    return () => {
      recognition.onend = null
      recognition.onerror = null
      try { recognition.stop() } catch { /* Recognition may not have started. */ }
      recognitionRef.current = null
    }
  }, [language])

  function toggleListening() {
    const recognition = recognitionRef.current
    if (!recognition) return
    if (listening) {
      recognition.stop()
      setListening(false)
      return
    }
    onErrorRef.current?.('')
    try {
      recognition.start()
      setListening(true)
    } catch {
      setListening(false)
      onErrorRef.current?.('Microphone could not start. Check browser permission, or type your question.')
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={toggleListening}
        disabled={!supported}
        aria-pressed={listening}
        className={`btn-secondary !px-3 !py-2 text-xs ${listening ? '!border-accent !bg-accent !text-white animate-pulse' : ''}`}
        title={!supported ? 'Speech recognition is not supported in this browser. Type your question instead.' : 'Speech recognition may be processed by your browser provider.'}
      >
        {!supported ? 'Mic unavailable' : listening ? '■ Stop listening' : '🎙 Speak'}
      </button>
      {!supported && <span className="text-[11px] text-ink/45">Type your question instead.</span>}
    </div>
  )
}
