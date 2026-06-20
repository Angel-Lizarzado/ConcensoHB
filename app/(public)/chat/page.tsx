import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import GoldLine from '@/components/ui/GoldLine'

export const dynamic = 'force-dynamic'

export default async function ChatPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const canales = await prisma.canalChat.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      _count: { select: { mensajes: { where: { eliminado: false } } } },
      mensajes: {
        where:   { eliminado: false },
        orderBy: { createdAt: 'desc' },
        take:    1,
        select:  { contenido: true, createdAt: true, autor: { select: { username: true } } },
      },
    },
  })

  // Filtrar por acceso de rol
  const role       = session.user.role
  const accesibles = canales.filter(c => {
    if (!c.privado) return true
    if (c.rolesPermitidos.length === 0) return true
    return c.rolesPermitidos.includes(role as any)
  })

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 'var(--space-12) var(--space-6)' }}>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-gold)', opacity: 0.75, marginBottom: 'var(--space-3)' }}>
          Comunicación interna
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-gold-bright)', marginBottom: 'var(--space-4)' }}>
          Chat
        </h1>
        <GoldLine />
      </div>

      {accesibles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-16) 0' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>💬</div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontStyle: 'italic', color: 'var(--color-text-muted)' }}>
            No hay canales disponibles aún.
          </p>
          {role === 'ADMIN' && (
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-sm)', color: 'var(--color-text-faint)', marginTop: 'var(--space-3)' }}>
              Creá el primer canal desde el Dashboard Admin → Radio (pendiente: agregar gestión de canales).
            </p>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {accesibles.map(canal => {
            const ultimo = canal.mensajes[0]
            return (
              <Link
                key={canal.id}
                href={`/chat/${canal.id}`}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr auto',
                  gap: 'var(--space-4)', alignItems: 'center',
                  padding: 'var(--space-5) var(--space-6)',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  textDecoration: 'none',
                  transition: 'border-color var(--transition), box-shadow var(--transition)',
                }}
                className="chat-canal-row"
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-gold)', opacity: 0.7 }}>#</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-text)', letterSpacing: '0.04em' }}>
                      {canal.nombre}
                    </span>
                    {canal.privado && (
                      <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--color-text-faint)', background: 'var(--color-surface-offset)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '1px 6px' }}>
                        privado
                      </span>
                    )}
                  </div>
                  {canal.descripcion && (
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginBottom: 'var(--space-2)' }}>
                      {canal.descripcion}
                    </p>
                  )}
                  {ultimo && (
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontStyle: 'italic', color: 'var(--color-text-muted)' }}>
                      <span style={{ fontWeight: 600, fontStyle: 'normal', color: 'var(--color-gold)', fontSize: 'var(--text-xs)' }}>{ultimo.autor.username}:</span>{' '}
                      {ultimo.contenido.length > 80 ? ultimo.contenido.slice(0, 80) + '…' : ultimo.contenido}
                    </p>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 900, color: 'var(--color-gold)' }}>
                    {canal._count.mensajes}
                  </div>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    mensajes
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
