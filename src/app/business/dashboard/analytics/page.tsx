import { requireAuth } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import AnalyticsDashboard from "./analytics-dashboard"

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
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">
          Track your business performance and revenue
        </p>
      </div>

      <AnalyticsDashboard />
    </div>
  )
}