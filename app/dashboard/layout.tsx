"use client"

import { useUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import Bar from '@/components/Bar'
import { MiningProvider } from '@/context/MiningContext'

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const user = useUser()
  if (!user) redirect('/sign-in')

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-slate-900">
      <Bar />
      <main className="flex-1 overflow-y-auto bg-white dark:bg-slate-900 pb-20 relative z-10">
        <MiningProvider>
          {children}
        </MiningProvider>
      </main>
    </div>
  )
}