const STYLES = {
  low: 'bg-severity-low/10 text-severity-low border-severity-low/30',
  moderate: 'bg-severity-moderate/10 text-severity-moderate border-severity-moderate/30',
  high: 'bg-severity-high/10 text-severity-high border-severity-high/30',
  emergency: 'bg-severity-emergency/10 text-severity-emergency border-severity-emergency/30',
}

export default function SeverityBadge({ level }) {
  const style = STYLES[level] || STYLES.low
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border ${style}`}>
      {level}
    </span>
  )
}
