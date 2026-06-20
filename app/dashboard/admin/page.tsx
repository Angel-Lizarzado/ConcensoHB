import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminDashboardClient from './AdminDashboardClient'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/dashboard')
  return <AdminDashboardClient username={session.user.username} />
}
