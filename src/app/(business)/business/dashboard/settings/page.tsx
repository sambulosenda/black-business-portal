import { redirect } from 'next/navigation'
import PhotoManager from '@/components/features/business/photo-manager'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import BusinessProfileForm from './business-profile-form'
import StripeConnectSection from './stripe-connect-section'

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

  // Separate commissionRate from the rest of the business data
  const { commissionRate, stripeAccountId, stripeOnboarded, ...businessProfile } = business

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Business Settings</h1>
        <p className="mt-1 text-gray-600">Manage your business profile and payment information</p>
      </div>

      <div className="space-y-8">
        {/* Business Profile Section */}
        <BusinessProfileForm business={businessProfile} />

        {/* Business Photos Section */}
        <PhotoManager businessId={business.id} />

        {/* Stripe Connect Section */}
        <StripeConnectSection
          businessId={business.id}
          businessName={business.businessName}
          stripeAccountId={stripeAccountId}
          stripeOnboarded={stripeOnboarded}
          commissionRate={Number(commissionRate)}
        />
      </div>
    </div>
  )
}
