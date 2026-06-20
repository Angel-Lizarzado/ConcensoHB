import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import InvitacionesPanel from '@/components/ui/InvitacionesPanel'

export const dynamic = 'force-dynamic'

export default async function ComandanteInvitaciones() {
  const session = await auth()
  if (!session || session.user.role !== 'COMANDANTE') redirect('/dashboard')

  return (
    <div style={{ padding: 'var(--space-8)', maxWidth: 720 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 900, color: 'var(--color-gold-bright)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 'var(--space-3)' }}>
        Códigos de Invitación
      </h1>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginBottom: 'var(--space-8)' }}>
        Generá códigos para invitar miembros a tu ejército. El límite de usos por código lo configura el Concilio.
      </p>
      <InvitacionesPanel ejercitoId={session.user.ejercitoId} />
    </div>
  )
}
