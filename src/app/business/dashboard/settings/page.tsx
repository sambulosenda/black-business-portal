import { requireAuth } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import StripeConnectSection from "./stripe-connect-section"
import BusinessProfileForm from "./business-profile-form"

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
      description: true,
      category: true,
      address: true,
      city: true,
      state: true,
      zipCode: true,
      phone: true,
      email: true,
      website: true,
      instagram: true,
      stripeAccountId: true,
      stripeOnboarded: true,
      commissionRate: true,
    },
  })

  if (!business) {
    redirect('/business/dashboard')
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Business Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your business profile and payment information
        </p>
      </div>

      <div className="space-y-8">
        {/* Business Profile Section */}
        <BusinessProfileForm business={business} />

        {/* Stripe Connect Section */}
        <StripeConnectSection 
          businessId={business.id}
          businessName={business.businessName}
          stripeAccountId={business.stripeAccountId}
          stripeOnboarded={business.stripeOnboarded}
          commissionRate={Number(business.commissionRate)}
        />
      </div>
    </div>
  )
}