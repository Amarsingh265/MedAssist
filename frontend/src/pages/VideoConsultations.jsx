import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'

const SIGNAL_TIMEOUT_MS = 12_000

export default function VideoConsultations() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [networkNote, setNetworkNote] = useState('')
  const [cameraOn, setCameraOn] = useState(true)
  const [microphoneOn, setMicrophoneOn] = useState(true)
  const [consented, setConsented] = useState(false)
  const [inCall, setInCall] = useState(false)
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const socketRef = useRef(null)
  const peerRef = useRef(null)
  const mediaRef = useRef(null)
  const pendingIceRef = useRef([])
  const iceServersRef = useRef([])
  const leavingRef = useRef(false)

  const loadAppointments = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await client.get('/consultations/mine')
      setAppointments(response.data)
      setSelectedId((current) =>
        response.data.some((item) => String(item.id) === current)
          ? current
          : response.data.find((item) => item.join_available)?.id?.toString() || '',
      )
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Could not load consultation appointments.')
    } finally {
      setLoading(false)
    }
  }, [])

  const closePeer = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.onicecandidate = null
      peerRef.current.ontrack = null
      peerRef.current.onconnectionstatechange = null
      peerRef.current.close()
      peerRef.current = null
    }
    pendingIceRef.current = []
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
  }, [])

  const stopMedia = useCallback(() => {
    mediaRef.current?.getTracks().forEach((track) => track.stop())
    mediaRef.current = null
    if (localVideoRef.current) localVideoRef.current.srcObject = null
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
  }, [])

  const endCall = useCallback((message = 'Call ended.') => {
    leavingRef.current = true
    const socket = socketRef.current
    socketRef.current = null
    if (socket && socket.readyState < WebSocket.CLOSING) socket.close(1000, 'Participant left')
    closePeer()
    stopMedia()
    setInCall(false)
    setStarting(false)
    setStatus(message)
    setCameraOn(true)
    setMicrophoneOn(true)
  }, [closePeer, stopMedia])

  useEffect(() => {
    loadAppointments()
    return () => {
      leavingRef.current = true
      socketRef.current?.close(1000, 'Page closed')
      closePeer()
      stopMedia()
    }
  }, [loadAppointments, closePeer, stopMedia])

  const sendSignal = useCallback((type, data) => {
    const socket = socketRef.current
    if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type, data }))
  }, [])

  const flushIceCandidates = useCallback(async (peer) => {
    const queued = pendingIceRef.current
    pendingIceRef.current = []
    for (const candidate of queued) await peer.addIceCandidate(candidate)
  }, [])

  const handleSignal = useCallback(async (message) => {
    if (message.type === 'authenticated') {
      setNetworkNote(message.network_note || '')
      setStatus('Secure signaling connected. Waiting for the other participant…')
      return
    }
    if (message.type === 'waiting') {
      setStatus('You are in the consultation room. Waiting for the other participant…')
      return
    }
    if (message.type === 'peer_joined') {
      setStatus(`${message.display_name || 'The other participant'} joined. Establishing a secure media connection…`)
      const currentPeer = peerRef.current
      if (currentPeer && currentPeer.connectionState !== 'closed') return
      const signaling = socketRef.current
      if (!signaling || signaling.readyState !== WebSocket.OPEN) return
      const peer = new RTCPeerConnection({ iceServers: iceServersRef.current })
      peerRef.current = peer
      mediaRef.current?.getTracks().forEach((track) => peer.addTrack(track, mediaRef.current))
      peer.onicecandidate = (event) => {
        if (event.candidate) sendSignal('ice_candidate', event.candidate.toJSON())
      }
      peer.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0]
          setStatus('Media connection established.')
        }
      }
      peer.onconnectionstatechange = () => {
        if (peer.connectionState === 'connected') setStatus('Media connection established.')
        if (peer.connectionState === 'connecting') setStatus('Connecting media…')
        if (peer.connectionState === 'failed') setError('Could not establish a media connection. This network may require a TURN relay; contact the clinic to arrange another consultation method.')
        if (peer.connectionState === 'disconnected') setStatus('Connection interrupted. Waiting for the network to recover…')
      }
      if (user?.role === 'patient') {
        try {
          const offer = await peer.createOffer()
          await peer.setLocalDescription(offer)
          sendSignal('offer', peer.localDescription.toJSON())
          setStatus('Calling the doctor…')
        } catch {
          setError('Could not start the video call. Check browser permissions and try again.')
        }
      } else {
        setStatus('Doctor joined. Waiting for the patient to initiate the call…')
      }
      return
    }
    if (message.type === 'offer' && peerRef.current) {
      const peer = peerRef.current
      await peer.setRemoteDescription(message.data)
      await flushIceCandidates(peer)
      const answer = await peer.createAnswer()
      await peer.setLocalDescription(answer)
      sendSignal('answer', peer.localDescription.toJSON())
      setStatus('Answer sent. Connecting media…')
      return
    }
    if (message.type === 'answer' && peerRef.current) {
      const peer = peerRef.current
      await peer.setRemoteDescription(message.data)
      await flushIceCandidates(peer)
      setStatus('Connecting media…')
      return
    }
    if (message.type === 'ice_candidate' && message.data && peerRef.current) {
      const candidate = new RTCIceCandidate(message.data)
      if (peerRef.current.remoteDescription) {
        await peerRef.current.addIceCandidate(candidate)
      } else {
        pendingIceRef.current.push(candidate)
      }
      return
    }
    if (message.type === 'peer_left') {
      closePeer()
      setStatus('The other participant left the consultation.')
    }
  }, [closePeer, flushIceCandidates, sendSignal, user?.role])

  async function startCall(event) {
    event.preventDefault()
    const appointment = appointments.find((item) => String(item.id) === selectedId)
    if (!appointment || !appointment.join_available || !consented) return
    setError('')
    setStatus('')
    setNetworkNote('')
    setStarting(true)
    leavingRef.current = false
    try {
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera and microphone access requires HTTPS or localhost in a supported browser.')
      }
      const media = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      mediaRef.current = media
      if (localVideoRef.current) localVideoRef.current.srcObject = media

      const token = localStorage.getItem('medassist_token')
      if (!token) throw new Error('Your session has expired. Sign in again before joining.')
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const socket = new WebSocket(`${protocol}//${window.location.host}/api/consultations/${appointment.id}/signal`)
      socketRef.current = socket

      await new Promise((resolve, reject) => {
        let settled = false
        const timeout = window.setTimeout(() => {
          if (!settled) {
            settled = true
            reject(new Error('The consultation server did not respond. Please try again.'))
          }
        }, SIGNAL_TIMEOUT_MS)

        socket.onopen = () => socket.send(JSON.stringify({ type: 'auth', token }))
        socket.onmessage = async (eventMessage) => {
          let message
          try {
            message = JSON.parse(eventMessage.data)
          } catch {
            if (!settled) {
              settled = true
              window.clearTimeout(timeout)
              reject(new Error('Received an invalid response from the consultation server.'))
            } else {
              setError('Received an invalid response from the consultation server.')
            }
            return
          }
          if (message.type === 'authenticated') {
            iceServersRef.current = message.ice_servers || []
          }
          try {
            await handleSignal(message)
            if (!settled && ['waiting', 'peer_joined'].includes(message.type)) {
              settled = true
              window.clearTimeout(timeout)
              resolve()
            }
          } catch {
            const failure = new Error('A secure media connection could not be established. Please leave the call and try again.')
            if (!settled) {
              settled = true
              window.clearTimeout(timeout)
              reject(failure)
            } else {
              setError(failure.message)
            }
          }
        }
        socket.onerror = () => {
          if (!settled) {
            settled = true
            window.clearTimeout(timeout)
            reject(new Error('Unable to reach the consultation signaling service.'))
          }
        }
        socket.onclose = (closeEvent) => {
          if (!settled) {
            settled = true
            window.clearTimeout(timeout)
            reject(new Error(closeEvent.reason || 'The consultation could not be joined.'))
          } else if (!leavingRef.current) {
            closePeer()
            stopMedia()
            setInCall(false)
            setStarting(false)
            setError(closeEvent.reason || 'The consultation connection ended.')
          }
        }
      })
      setInCall(true)
    } catch (startError) {
      setError(startError.message || 'Could not start the consultation.')
      socketRef.current?.close()
      socketRef.current = null
      closePeer()
      stopMedia()
      setStarting(false)
    }
  }

  function toggleTrack(kind) {
    const track = mediaRef.current?.getTracks().find((item) => item.kind === kind)
    if (!track) return
    track.enabled = !track.enabled
    if (kind === 'audio') setMicrophoneOn(track.enabled)
    else setCameraOn(track.enabled)
  }

  const selectedAppointment = appointments.find((item) => String(item.id) === selectedId)

  return (
    <div className="page-content mx-auto max-w-6xl space-y-7 px-5 py-8 md:px-8">
      <header>
        <p className="text-xs font-bold tracking-[0.18em] text-accent">PRIVATE VIDEO VISIT</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-primary">Video consultation</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/65">Join a confirmed appointment with its assigned care provider. Your camera and microphone are requested only after you choose to join.</p>
      </header>

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-900">{error}</p>}
      {status && <p role="status" className="rounded-xl border border-primary/15 bg-white p-4 text-sm text-primary">{status}</p>}

      {inCall || starting ? (
        <section className="overflow-hidden rounded-3xl bg-primary-dark p-4 text-white shadow-card md:p-6" aria-label="Video consultation room">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Consultation room</p>
              <p className="mt-1 text-lg font-semibold">{user?.role === 'doctor' ? selectedAppointment?.patient_name : selectedAppointment?.doctor_name}</p>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold">{starting ? 'Joining…' : 'Room open'}</span>
          </div>
          <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
            <div className="relative grid min-h-[260px] place-items-center overflow-hidden rounded-2xl bg-[#10231f] md:min-h-[420px]">
              <video ref={remoteVideoRef} autoPlay controls playsInline className="h-full max-h-[65vh] min-h-[260px] w-full object-contain" aria-label="Other participant video" />
              {!peerRef.current && <p className="absolute rounded-xl bg-black/40 px-4 py-3 text-sm text-white/85">Waiting for the other participant to join…</p>}
            </div>
            <div className="relative min-h-[160px] overflow-hidden rounded-2xl bg-[#10231f] lg:min-h-0">
              <video ref={localVideoRef} autoPlay playsInline muted className="h-full min-h-[160px] w-full object-cover" aria-label="Your camera preview" />
              {!cameraOn && <p className="absolute inset-0 grid place-items-center bg-[#10231f] text-sm text-white/75">Camera is off</p>}
              <span className="absolute bottom-2 left-2 rounded-md bg-black/45 px-2 py-1 text-xs text-white">You</span>
            </div>
          </div>
          {networkNote && <p className="mt-3 text-xs leading-5 text-white/70">{networkNote}</p>}
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => toggleTrack('audio')} aria-pressed={!microphoneOn} className={`min-h-12 rounded-full px-5 text-sm font-semibold ${microphoneOn ? 'bg-white/15 hover:bg-white/20' : 'bg-amber-500 text-[#18332D]'}`}>{microphoneOn ? 'Mute microphone' : 'Turn microphone on'}</button>
            <button type="button" onClick={() => toggleTrack('video')} aria-pressed={!cameraOn} className={`min-h-12 rounded-full px-5 text-sm font-semibold ${cameraOn ? 'bg-white/15 hover:bg-white/20' : 'bg-amber-500 text-[#18332D]'}`}>{cameraOn ? 'Turn camera off' : 'Turn camera on'}</button>
            <button type="button" onClick={() => endCall()} className="min-h-12 rounded-full bg-red-600 px-6 text-sm font-bold text-white hover:bg-red-700">Leave consultation</button>
          </div>
        </section>
      ) : (
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_0.85fr]">
          <div className="card p-5 md:p-7">
            <h2 className="font-display text-xl font-bold text-primary">Your confirmed appointments</h2>
            {loading ? (
              <p role="status" className="mt-4 text-sm text-ink/60">Loading appointments…</p>
            ) : appointments.length === 0 ? (
              <div className="mt-4 rounded-2xl bg-surface p-5">
                <p className="font-semibold text-primary">No video appointments available</p>
                <p className="mt-1 text-sm leading-6 text-ink/65">A confirmed appointment with an assigned, verified doctor is required. Pending, cancelled, or unassigned appointments cannot join a video room.</p>
                <Link to="/appointments" className="btn-secondary mt-4 inline-flex">View appointments</Link>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {appointments.map((appointment) => (
                  <label key={appointment.id} className={`block cursor-pointer rounded-2xl border p-4 transition ${String(appointment.id) === selectedId ? 'border-primary bg-primary/5' : 'border-line hover:border-primary/35'}`}>
                    <span className="flex items-start gap-3">
                      <input type="radio" name="consultation" value={appointment.id} checked={String(appointment.id) === selectedId} onChange={(event) => setSelectedId(event.target.value)} className="mt-1 accent-primary" disabled={!appointment.join_available} />
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-primary">{user?.role === 'doctor' ? appointment.patient_name : appointment.doctor_name}</span>
                        {appointment.doctor_specialization && user?.role === 'patient' && <span className="mt-0.5 block text-sm text-ink/60">{appointment.doctor_specialization}</span>}
                        <span className="mt-1 block text-sm text-ink/65">{new Date(appointment.scheduled_time).toLocaleString()}</span>
                        <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${appointment.join_available ? 'bg-emerald-50 text-emerald-800' : 'bg-surface text-ink/60'}`}>{appointment.join_available ? 'Ready to join' : appointment.join_message}</span>
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="card flex flex-col p-5 md:p-7">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-accent">BEFORE YOU JOIN</p>
              <h2 className="mt-2 font-display text-xl font-bold text-primary">A private, direct video call</h2>
              <p className="mt-3 text-sm leading-6 text-ink/65">The call uses browser WebRTC between you and the other appointment participant. MedAssist does not record the call. Your browser will ask for camera and microphone access.</p>
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                If the connection fails, a relay (TURN) service may be required for your network. Use your clinic’s other contact method if the call cannot connect. Do not use this call for emergencies.
              </div>
            </div>
            {selectedAppointment?.join_available && (
              <form onSubmit={startCall} className="mt-6 border-t border-line pt-5">
                <label className="flex items-start gap-3 text-sm leading-6 text-ink/75">
                  <input type="checkbox" checked={consented} onChange={(event) => setConsented(event.target.checked)} className="mt-1 h-4 w-4 accent-primary" />
                  <span>I understand the browser will request camera and microphone access when I join, and I consent to starting this video connection.</span>
                </label>
                <button type="submit" disabled={!consented || starting} className="btn-primary mt-4 w-full justify-center">
                  {starting ? 'Starting secure connection…' : 'Allow camera & microphone and join'}
                </button>
              </form>
            )}
          </div>
        </section>
      )}
      <p className="text-xs leading-5 text-ink/50">Calls are not recorded. Availability requires HTTPS (or localhost), a supported browser, confirmed appointment, active accounts, and successful network connectivity.</p>
    </div>
  )
}
