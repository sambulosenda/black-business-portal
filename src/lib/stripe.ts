import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-28.basil',
  typescript: true,
})

// Platform configuration
export const PLATFORM_FEE_PERCENTAGE = 15 // 15% platform fee
export const STRIPE_FEE_PERCENTAGE = 2.9 // Stripe's fee
export const STRIPE_FEE_FIXED = 0.3 // Stripe's fixed fee in dollars

/**
 * Calculate fee breakdown for a given amount
 */
export function calculateFees(amount: number) {
  // All amounts in cents
  const amountInCents = Math.round(amount * 100)

  // Stripe fee (2.9% + $0.30)
  const stripeFee = Math.round(
    amountInCents * (STRIPE_FEE_PERCENTAGE / 100) + STRIPE_FEE_FIXED * 100
  )

  // Platform fee (15% of the total)
  const platformFee = Math.round(amountInCents * (PLATFORM_FEE_PERCENTAGE / 100))

  // Business receives the remainder
  const businessPayout = amountInCents - stripeFee - platformFee

  return {
    total: amountInCents,
    stripeFee,
    platformFee,
    businessPayout,
    // Return dollar amounts too for display
    totalDollars: amount,
    stripeFeeDollars: stripeFee / 100,
    platformFeeDollars: platformFee / 100,
    businessPayoutDollars: businessPayout / 100,
  }
}

/**
 * Format amount for Stripe (convert dollars to cents)
 */
export function formatAmountForStripe(amount: number): number {
  return Math.round(amount * 100)
}

/**
 * Format amount from Stripe (convert cents to dollars)
 */
export function formatAmountFromStripe(amount: number): number {
  return amount / 100
}
