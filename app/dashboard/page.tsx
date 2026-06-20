// /dashboard — Redirect por rol
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const role = session.user.role
  if (role === 'ADMIN')      redirect('/dashboard/admin')
  if (role === 'REPORTERO')  redirect('/dashboard/reportero')
  if (role === 'COMANDANTE') redirect('/dashboard/comandante')
  if (role === 'JUEZ')       redirect('/dashboard/juez')

  // VISITANTE — no tiene dashboard
  redirect('/')
}
