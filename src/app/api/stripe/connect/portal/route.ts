import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
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
    })

    if (!business || !business.stripeAccountId) {
      return NextResponse.json({ error: 'Stripe account not found' }, { status: 404 })
    }

    // Create login link for Stripe Express dashboard
    const loginLink = await stripe.accounts.createLoginLink(business.stripeAccountId)

    return NextResponse.json({ url: loginLink.url })
  } catch (error) {
    console.error('Error creating Stripe portal link:', error)
    return NextResponse.json({ error: 'Failed to access Stripe dashboard' }, { status: 500 })
  }
}
