import { requireAuth } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import StripeConnectSection from "./stripe-connect-section"

export default async function BusinessSettingsPage() {
  const session = await requireAuth()

  if (session.user.role !== 'BUSINESS_OWNER') {
    redirect('/dashboard')
  }

  const business = await prisma.business.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      businessName: true,
      stripeAccountId: true,
      stripeOnboarded: true,
      commissionRate: true,
    },
  })

  if (!business) {
    redirect('/business/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Business Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your business settings and payment information
          </p>
        </div>

        {/* Stripe Connect Section */}
        <StripeConnectSection 
          businessId={business.id}
          businessName={business.businessName}
          stripeAccountId={business.stripeAccountId}
          stripeOnboarded={business.stripeOnboarded}
          commissionRate={business.commissionRate}
        />

        {/* Other settings sections can be added here */}
      </div>
    </div>
  )
}