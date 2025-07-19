import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe, calculateFees, formatAmountForStripe } from '@/lib/stripe'
import { addMinutes, parseISO, startOfDay } from 'date-fns'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { businessId, serviceId, date, time, promotionId, promoDiscount } = await request.json()

    // Get business with Stripe account
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: {
        id: true,
        businessName: true,
        stripeAccountId: true,
        stripeOnboarded: true,
        commissionRate: true,
      },
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    if (!business.stripeAccountId || !business.stripeOnboarded) {
      return NextResponse.json(
        { error: 'Business is not set up to accept payments' },
        { status: 400 }
      )
    }

    // Get service details
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    })

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Calculate booking times
    const bookingDate = parseISO(date)
    const [hours, minutes] = time.split(':').map(Number)
    const startTime = new Date(bookingDate)
    startTime.setHours(hours, minutes, 0, 0)
    const endTime = addMinutes(startTime, service.duration)

    // Check availability
    const existingBooking = await prisma.booking.findFirst({
      where: {
        businessId,
        date: startOfDay(bookingDate),
        status: { in: ['PENDING', 'CONFIRMED'] },
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
        ],
      },
    })

    if (existingBooking) {
      return NextResponse.json(
        { error: 'This time slot is no longer available' },
        { status: 400 }
      )
    }

    // Get user with stripeCustomerId
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true }
    })

    // Get or create Stripe customer
    let stripeCustomerId = user?.stripeCustomerId

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: session.user.email || undefined,
        name: session.user.name || undefined,
        metadata: {
          userId: session.user.id,
        },
      })

      stripeCustomerId = customer.id

      // Save customer ID to database
      await prisma.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId },
      })
    }

    // Calculate fees
    const originalAmount = Number(service.price)
    const discount = promoDiscount || 0
    const amount = Math.max(0, originalAmount - discount)
    const fees = calculateFees(amount)

    // Create payment intent with automatic transfer
    const paymentIntent = await stripe.paymentIntents.create({
      amount: formatAmountForStripe(amount),
      currency: 'usd',
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      application_fee_amount: fees.platformFee,
      transfer_data: {
        destination: business.stripeAccountId,
      },
      metadata: {
        businessId: business.id,
        serviceId: service.id,
        userId: session.user.id,
        date: date,
        time: time,
        serviceName: service.name,
        businessName: business.businessName,
        promotionId: promotionId || '',
        discountAmount: discount.toString(),
      },
    })

    // Create booking with pending payment status
    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        businessId,
        serviceId,
        date: startOfDay(bookingDate),
        startTime,
        endTime,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        stripePaymentIntentId: paymentIntent.id,
        totalPrice: amount,
        stripeFee: fees.stripeFeeDollars,
        platformFee: fees.platformFeeDollars,
        businessPayout: fees.businessPayoutDollars,
      },
    })

    return NextResponse.json({
      bookingId: booking.id,
      clientSecret: paymentIntent.client_secret,
      amount: amount,
      fees: {
        platform: fees.platformFeeDollars,
        stripe: fees.stripeFeeDollars,
        business: fees.businessPayoutDollars,
      },
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    
    // Provide specific error messages
    let errorMessage = 'Failed to create payment'
    let statusCode = 500
    
    if (error instanceof Error) {
      if ('type' in error && error.type === 'StripeInvalidRequestError') {
        if ('code' in error && error.code === 'account_invalid') {
          errorMessage = 'Business payment account is not properly configured'
        } else if ('code' in error && error.code === 'parameter_invalid_integer') {
          errorMessage = 'Invalid price amount'
        }
        statusCode = 400
      } else if (error.message?.includes('Customer')) {
        errorMessage = 'Failed to create customer profile'
      } else if (error.message?.includes('connected account')) {
        errorMessage = 'Business is not set up to receive payments'
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    )
  }
}