// Dashboard layout — sidebar + contenido, SIN Header/Footer del sitio
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default async function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <DashboardLayout username={session.user.username} role={session.user.role}>
      {children}
    </DashboardLayout>
  )
}
