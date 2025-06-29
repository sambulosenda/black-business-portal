import { requireAuth } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import AnalyticsDashboard from "./analytics-dashboard"
import { Breadcrumb, BreadcrumbWrapper } from '@/components/ui/breadcrumb'

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Track your business performance and revenue
        </p>
      </div>

      <AnalyticsDashboard businessId={business.id} />
    </div>
  )
}