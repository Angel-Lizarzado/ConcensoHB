// Badge de departamento — mapea enum a color y label visual
// Server Component

export type DeptKey = 'NOTICIAS' | 'WIREDS' | 'JUZGADO' | 'OFICIAL'

const DEPT_MAP: Record<DeptKey, { label: string; className: string }> = {
  NOTICIAS: { label: 'Noticias',  className: 'news-tag noticias' },
  WIREDS:   { label: 'Wireds',    className: 'news-tag wireds'   },
  JUZGADO:  { label: 'Juzgado',   className: 'news-tag juzgado'  },
  OFICIAL:  { label: 'Oficial',   className: 'news-tag oficial'  },
}

interface DeptBadgeProps {
  dept: DeptKey
  size?: 'sm' | 'md'
  className?: string
}

export default function DeptBadge({ dept, size = 'md', className }: DeptBadgeProps) {
  const { label, className: deptClass } = DEPT_MAP[dept]
  const sizeStyles = size === 'sm'
    ? { fontSize: '0.65rem', padding: '1px 6px', marginBottom: '4px' }
    : undefined

  return (
    <span
      className={`${deptClass}${className ? ` ${className}` : ''}`}
      style={sizeStyles}
    >
      {label}
    </span>
  )
}
