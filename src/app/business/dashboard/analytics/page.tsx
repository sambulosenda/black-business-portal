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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Revenue Analytics</h1>
          <p className="mt-2 text-gray-600">
            Track your business performance and revenue
          </p>
        </div>

        <AnalyticsDashboard businessId={business.id} />
      </div>
    </div>
  )
}