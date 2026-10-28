export default function PulseIcon({ className = "w-8 h-8 text-primary" }) {
  return (
    <svg viewBox="0 0 100 30" className={className}>
      <polyline
        className="pulse-line"
        points="0,15 22,15 28,4 36,26 44,15 100,15"
      />
    </svg>
  )
}
