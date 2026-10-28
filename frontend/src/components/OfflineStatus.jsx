import { useEffect, useState } from 'react'

export default function OfflineStatus() {
  const [online, setOnline] = useState(() => navigator.onLine)

  useEffect(() => {
    const update = () => setOnline(navigator.onLine)
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])

  if (online) return null
  return (
    <div role="status" className="fixed inset-x-0 top-0 z-40 flex items-center justify-center gap-3 bg-amber-100 px-4 py-2 text-center text-xs font-semibold text-amber-950">
      <span>Offline: only the static health guide and already loaded pages may be available. Live services and private data are not cached.</span>
      <button onClick={() => window.location.reload()} className="underline focus:outline-none focus:ring-2 focus:ring-amber-700">Retry</button>
    </div>
  )
}
