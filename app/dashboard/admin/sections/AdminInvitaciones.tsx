'use client'

import InvitacionesPanel from '@/components/ui/InvitacionesPanel'

export default function AdminInvitaciones() {
  return (
    <div>
      <h2 style={sectionTitle}>Códigos de Invitación</h2>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginBottom: 'var(--space-6)' }}>
        Los códigos generados permiten a nuevos usuarios registrarse. Cada código tiene un límite de usos configurado en Ajustes del sitio.
      </p>
      <InvitacionesPanel esAdmin />
    </div>
  )
}

const sectionTitle: React.CSSProperties = {
  fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700,
  color: 'var(--color-gold-bright)', letterSpacing: '0.05em', textTransform: 'uppercase',
  marginBottom: 'var(--space-3)',
}
