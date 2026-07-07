import GoldLine from '@/components/ui/GoldLine'
import CalendarioClient from './CalendarioClient'

export const revalidate = 0

export default function CalendarioPage() {
  return (
    <div style={{ maxWidth: 'var(--content)', margin: '0 auto', padding: 'var(--space-12) var(--space-6)' }}>
      <div style={{ marginBottom: 'var(--space-10)', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-gold)', opacity: 0.75, marginBottom: 'var(--space-3)' }}>
          Agenda General
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-gold-bright)', marginBottom: 'var(--space-4)' }}>
          Calendario del Concilio
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontStyle: 'italic', color: 'var(--color-text-muted)', maxWidth: '60ch', margin: '0 auto var(--space-4)' }}>
          Próximas actividades, reuniones y eventos oficiales de los ejércitos.
        </p>
        <GoldLine />
      </div>

      <CalendarioClient />
    </div>
  )
}
