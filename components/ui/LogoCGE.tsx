// Logo SVG del Concilio General de Ejércitos
// Estilo Assassin's Creed — triángulo con muesca y línea central
// Server Component — puro SVG, sin estado

interface LogoCGEProps {
  size?: number
  className?: string
}

export default function LogoCGE({ size = 44, className }: LogoCGEProps) {
  const height = Math.round(size * (96 / 88))

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 88 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      {/* Forma exterior sutil */}
      <path
        d="M44 2 L84 88 L44 74 L4 88 Z"
        fill="#C9A84C"
        opacity="0.15"
        stroke="#C9A84C"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Forma principal con muesca superior */}
      <path
        d="M44 2 L84 88 L68 82 L44 28 L20 82 L4 88 Z"
        fill="#C9A84C"
        opacity="0.9"
      />
      {/* Recorte interior */}
      <path
        d="M44 22 L72 84 L54 78 L44 52 L34 78 L16 84 Z"
        fill="#080807"
      />
      {/* Raya central horizontal */}
      <line
        x1="28"
        y1="62"
        x2="60"
        y2="62"
        stroke="#C9A84C"
        strokeWidth="2.5"
        opacity="0.85"
      />
      {/* Punto central brillante */}
      <circle cx="44" cy="62" r="3.5" fill="#E4C060" opacity="0.95" />
      {/* Halo decorativo */}
      <circle
        cx="44"
        cy="62"
        r="6"
        fill="none"
        stroke="#E4C060"
        strokeWidth="0.5"
        opacity="0.4"
      />
    </svg>
  )
}
