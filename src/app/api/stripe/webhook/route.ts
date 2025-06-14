import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import type Stripe from 'stripe'
import { sendEmail, emailTemplates } from '@/lib/email'
import { format } from 'date-fns'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event: Stripe.Event

  try {
    // Always verify signature if webhook secret is configured
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      )
    } else if (process.env.NODE_ENV === 'development') {
      // In development without webhook secret, parse body directly
      console.warn('⚠️  Webhook signature verification skipped in development')
      event = JSON.parse(body) as Stripe.Event
    } else {
      // In production, signature is required
      throw new Error('Webhook signature verification is required in production')
    }
  } catch (err: any) {
    console.error('Webhook error:', err)
    
    if (err.type === 'StripeSignatureVerificationError') {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
    
    return NextResponse.json({ error: err.message || 'Invalid request' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        // Update booking status and get booking details
        const booking = await prisma.booking.update({
          where: {
            stripePaymentIntentId: paymentIntent.id,
          },
          data: {
            status: 'CONFIRMED',
            paymentStatus: 'SUCCEEDED',
          },
          include: {
            user: true,
            business: true,
            service: true,
          },
        })
        
        // Send confirmation email
        if (booking && booking.user.email) {
          const emailData = emailTemplates.bookingConfirmation({
            customerName: booking.user.name || 'Customer',
            businessName: booking.business.businessName,
            serviceName: booking.service.name,
            date: format(new Date(booking.date), 'EEEE, MMMM d, yyyy'),
            time: format(new Date(booking.startTime), 'h:mm a'),
            totalPrice: booking.totalPrice.toNumber(),
            bookingId: booking.id,
          })
          
          await sendEmail({
            to: booking.user.email,
            ...emailData,
          })
          
          // Also send payment receipt
          const receiptData = emailTemplates.paymentReceipt({
            customerName: booking.user.name || 'Customer',
            businessName: booking.business.businessName,
            serviceName: booking.service.name,
            amount: booking.totalPrice.toNumber(),
            paymentId: paymentIntent.id,
            date: format(new Date(), 'MMMM d, yyyy'),
          })
          
          await sendEmail({
            to: booking.user.email,
            ...receiptData,
          })
        }
        
        console.log('Payment succeeded for booking:', paymentIntent.metadata)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        // Update booking status
        await prisma.booking.update({
          where: {
            stripePaymentIntentId: paymentIntent.id,
          },
          data: {
            paymentStatus: 'FAILED',
          },
        })
        
        console.log('Payment failed for booking:', paymentIntent.metadata)
        break
      }

      case 'account.updated': {
        const account = event.data.object as Stripe.Account
        
        // Update business onboarding status
        if (account.charges_enabled && account.payouts_enabled) {
          await prisma.business.update({
            where: {
              stripeAccountId: account.id,
            },
            data: {
              stripeOnboarded: true,
            },
          })
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}