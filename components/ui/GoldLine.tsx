// Línea decorativa dorada degradada
// Server Component

interface GoldLineProps {
  className?: string
  style?: React.CSSProperties
}

export default function GoldLine({ className, style }: GoldLineProps) {
  return (
    <span
      className={`gold-line${className ? ` ${className}` : ''}`}
      style={style}
      aria-hidden="true"
    />
  )
}
