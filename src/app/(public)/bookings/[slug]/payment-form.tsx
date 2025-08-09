'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { getStripe } from '@/lib/stripe-client'
// import { useRouter } from 'next/navigation' // Commented out - may be used later
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'

interface PaymentFormProps {
  clientSecret: string
  bookingId: string
  businessName: string
  serviceName: string
  date: Date
  time: string
  amount: number
  fees: {
    platform: number
    stripe: number
    business: number
  }
}

function CheckoutForm({
  bookingId,
  businessName,
  serviceName,
  date,
  time,
  amount,
}: Omit<PaymentFormProps, 'clientSecret' | 'fees'>) {
  const stripe = useStripe()
  const elements = useElements()
  // const router = useRouter() // Commented out - may be used later
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setProcessing(true)
    setError(null)

    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/bookings/confirmation/${bookingId}`,
        },
      })

      if (submitError) {
        // Provide user-friendly error messages
        let errorMessage = 'Payment failed. Please try again.'

        if (submitError.type === 'card_error') {
          errorMessage = submitError.message || 'Your card was declined.'
        } else if (submitError.type === 'validation_error') {
          errorMessage = 'Please check your payment details and try again.'
        } else if (submitError.code === 'payment_intent_authentication_failure') {
          errorMessage = 'Authentication failed. Please try again.'
        } else if (submitError.message) {
          errorMessage = submitError.message
        }

        setError(errorMessage)
        setProcessing(false)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      setProcessing(false)
      console.error('Payment error:', err)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Booking Summary */}
      <div className="rounded-lg bg-gray-50 p-4">
        <h3 className="mb-3 font-medium text-gray-900">Booking Summary</h3>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-600">Business:</dt>
            <dd className="font-medium">{businessName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Service:</dt>
            <dd className="font-medium">{serviceName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Date:</dt>
            <dd className="font-medium">{format(date, 'MMMM d, yyyy')}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Time:</dt>
            <dd className="font-medium">{time}</dd>
          </div>
          <div className="flex justify-between border-t pt-2">
            <dt className="font-medium text-gray-900">Total:</dt>
            <dd className="text-lg font-bold">${amount.toFixed(2)}</dd>
          </div>
        </dl>
      </div>

      {/* Payment Element */}
      <div>
        <h3 className="mb-3 font-medium text-gray-900">Payment Details</h3>
        <PaymentElement />
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full rounded-md bg-indigo-600 px-4 py-3 font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        {processing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
      </button>

      <p className="text-center text-xs text-gray-500">
        Your payment is processed securely by Stripe. The business will receive your payment minus
        platform fees.
      </p>
    </form>
  )
}

export default function PaymentForm({
  clientSecret,
  bookingId,
  businessName,
  serviceName,
  date,
  time,
  amount,
}: PaymentFormProps) {
  const stripePromise = getStripe()

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#4f46e5',
            colorBackground: '#ffffff',
            colorText: '#1f2937',
            colorDanger: '#ef4444',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            borderRadius: '8px',
            spacingUnit: '4px',
          },
          rules: {
            '.Tab': {
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            },
            '.Tab:hover': {
              borderColor: '#d1d5db',
            },
            '.Tab--selected': {
              borderColor: '#4f46e5',
              boxShadow: '0 0 0 2px rgba(79, 70, 229, 0.2)',
            },
            '.Input': {
              borderColor: '#e5e7eb',
            },
            '.Input:focus': {
              borderColor: '#4f46e5',
              boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.1)',
            },
          },
        },
      }}
    >
      <CheckoutForm
        bookingId={bookingId}
        businessName={businessName}
        serviceName={serviceName}
        date={date}
        time={time}
        amount={amount}
      />
    </Elements>
  )
}
