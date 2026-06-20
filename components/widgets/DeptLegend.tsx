// DeptLegend — Server Component
// Leyenda de colores por departamento

export default function DeptLegend() {
  const depts = [
    { key: 'noticias', label: 'Noticias', desc: 'Cobertura general',     color: 'var(--color-noticias)' },
    { key: 'wireds',   label: 'Wireds',   desc: 'Eventos / Torneos',     color: 'var(--color-wireds)'   },
    { key: 'juzgado',  label: 'Juzgado',  desc: 'Resoluciones oficiales', color: 'var(--color-juzgado)'  },
  ]

  return (
    <div className="widget">
      <div className="widget-header">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <h3 className="widget-title">Departamentos</h3>
      </div>
      <div className="widget-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {depts.map(d => (
            <div key={d.key} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div style={{
                width: 10, height: 10, borderRadius: 2, flexShrink: 0,
                background: d.color,
                boxShadow: `0 0 6px ${d.color}`,
              }} />
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--color-text-muted)' }}>
                {d.label}
              </span>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginLeft: 'auto' }}>
                {d.desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
