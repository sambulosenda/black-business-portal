import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import AnalyticsDashboard from './analytics-dashboard'

export default async function AnalyticsPage() {
  const session = await requireAuth()

  if (session.user.role !== 'BUSINESS_OWNER') {
    redirect('/dashboard')
  }

  const business = await prisma.business.findFirst({
    where: {
      userId: session.user.id,
    },
  })

  if (!business) {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">Track performance and revenue</p>
      </div>

      <AnalyticsDashboard />
    </div>
  )
}
