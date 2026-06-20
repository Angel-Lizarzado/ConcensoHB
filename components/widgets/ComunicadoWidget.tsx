// ComunicadoWidget — Server Component
// Comunicado oficial del Concilio — texto configurable desde SiteConfig

interface ComunicadoWidgetProps {
  texto?: string
  firma?: string
}

export default function ComunicadoWidget({
  texto = 'Este organismo no pertenece a ningún ejército. Somos garantes de la paz, el orden y la hermandad entre todas las fuerzas militares hispanas en Habbo.',
  firma = 'El Concilio General',
}: ComunicadoWidgetProps) {
  return (
    <div className="widget">
      <div className="widget-header">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        <h3 className="widget-title">Comunicado</h3>
      </div>
      <div className="widget-body">
        <div style={{
          background: 'oklch(0.75 0.12 75 / 0.04)',
          border: '1px solid var(--color-border-gold)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-5)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          fontStyle: 'italic',
          color: 'var(--color-text-muted)',
          lineHeight: 1.65,
          position: 'relative',
        }}>
          {/* Comilla decorativa */}
          <span aria-hidden="true" style={{
            position: 'absolute', top: 2, left: 'var(--space-3)',
            fontSize: '2.5rem', fontFamily: 'var(--font-display)',
            color: 'var(--color-gold)', opacity: 0.25, lineHeight: 1,
            userSelect: 'none',
          }}>
            &ldquo;
          </span>
          <p style={{ paddingLeft: 'var(--space-4)' }}>{texto}</p>
          <p style={{
            marginTop: 'var(--space-4)',
            fontFamily: 'var(--font-ui)',
            fontSize: 'var(--text-xs)',
            fontStyle: 'normal',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--color-gold)',
            opacity: 0.75,
          }}>
            — {firma}
          </p>
        </div>
      </div>
    </div>
  )
}
