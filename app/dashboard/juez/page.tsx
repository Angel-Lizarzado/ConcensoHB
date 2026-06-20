import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminIncidencias from '@/app/dashboard/admin/sections/AdminIncidencias'

export const dynamic = 'force-dynamic'

export default async function JuezDashboard() {
  const session = await auth()
  if (!session || session.user.role !== 'JUEZ') redirect('/dashboard')

  return (
    <div style={{ padding: 'var(--space-8)' }}>
      <AdminIncidencias />
    </div>
  )
}
