import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'BUSINESS_OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { businessId } = await request.json()

    // Get business details
    const business = await prisma.business.findUnique({
      where: {
        id: businessId,
        userId: session.user.id,
      },
      include: {
        user: true,
      },
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    let accountId = business.stripeAccountId

    // Create new Stripe Connect account if doesn't exist
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'GB', // Changed to UK - update this based on your country
        email: business.user.email || undefined,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        business_profile: {
          name: business.businessName,
          product_description: `Beauty and wellness services at ${business.businessName}`,
        },
        settings: {
          payouts: {
            schedule: {
              interval: 'daily',
            },
          },
        },
      })

      accountId = account.id

      // Save Stripe account ID to database
      await prisma.business.update({
        where: { id: businessId },
        data: { stripeAccountId: accountId },
      })
    }

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXTAUTH_URL}/business/dashboard/settings`,
      return_url: `${process.env.NEXTAUTH_URL}/api/stripe/connect/callback?businessId=${businessId}`,
      type: 'account_onboarding',
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (error) {
    console.error('Error creating Stripe Connect account:', error)
    
    // Return more specific error message
    const errorMessage = error instanceof Error ? error.message : 'Failed to create Stripe account'
    const isStripeError = error instanceof Error && 'type' in error && error.type === 'StripeError'
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: isStripeError && 'raw' in error ? (error.raw as Record<string, unknown>)?.message : undefined 
      },
      { status: 500 }
    )
  }
}