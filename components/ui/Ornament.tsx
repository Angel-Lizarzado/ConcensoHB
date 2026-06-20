// Ornamento con líneas expandibles y contenido central
// Server Component

interface OrnamentProps {
  children?: React.ReactNode
  className?: string
}

export default function Ornament({ children, className }: OrnamentProps) {
  return (
    <div
      className={`ornament${className ? ` ${className}` : ''}`}
      aria-hidden="true"
    >
      {children}
    </div>
  )
}
