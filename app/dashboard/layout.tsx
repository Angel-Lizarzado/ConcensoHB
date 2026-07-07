// Dashboard layout — sidebar + contenido, SIN Header/Footer del sitio
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { prisma } from '@/lib/prisma'
import LogoCGE from '@/components/ui/LogoCGE'

export default async function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  if (session.user.ejercitoId) {
    const army = await prisma.ejercito.findUnique({ where: { id: session.user.ejercitoId }, select: { activo: true } })
    if (army && !army.activo) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', padding: 'var(--space-6)' }}>
          <div style={{ maxWidth: 440, width: '100%', background: 'var(--color-surface)', border: '1px solid var(--color-border-gold)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-10)', textAlign: 'center' }}>
            <LogoCGE size={56} />
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--color-gold-bright)', marginTop: 'var(--space-6)', marginBottom: 'var(--space-4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Acceso Restringido
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: 'var(--space-6)' }}>
              Tu ejército se encuentra en suspensión temporal o esperando aprobación. Contacta a un administrador del Concilio para más información.
            </p>
            <form action="/api/auth/signout" method="POST">
              <input type="hidden" name="callbackUrl" value="/" />
              <button type="submit" className="btn-secondary" style={{ width: '100%' }}>
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      )
    }
  }

  return (
    <DashboardLayout username={session.user.username} role={session.user.role}>
      {children}
    </DashboardLayout>
  )
}
