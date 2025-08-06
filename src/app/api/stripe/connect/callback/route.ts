import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.redirect(
        new URL('/business/dashboard/settings?error=missing_business', request.url)
      )
    }

    // Get business details
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    })

    if (!business || !business.stripeAccountId) {
      return NextResponse.redirect(
        new URL('/business/dashboard/settings?error=invalid_business', request.url)
      )
    }

    // Check if onboarding is complete
    const account = await stripe.accounts.retrieve(business.stripeAccountId)

    if (account.charges_enabled && account.payouts_enabled) {
      // Mark as onboarded in database
      await prisma.business.update({
        where: { id: businessId },
        data: { stripeOnboarded: true },
      })

      return NextResponse.redirect(
        new URL('/business/dashboard/settings?success=stripe_connected', request.url)
      )
    } else {
      // Onboarding not complete
      return NextResponse.redirect(
        new URL('/business/dashboard/settings?error=onboarding_incomplete', request.url)
      )
    }
  } catch (error) {
    console.error('Error in Stripe Connect callback:', error)
    return NextResponse.redirect(
      new URL('/business/dashboard/settings?error=stripe_error', request.url)
    )
  }
}
