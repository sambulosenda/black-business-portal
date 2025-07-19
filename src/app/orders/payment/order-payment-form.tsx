'use client'

import { useState } from 'react'
// import { useRouter } from 'next/navigation' // Commented out - may be used later
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe-client'

interface OrderPaymentFormProps {
  clientSecret: string
  orderId: string
  orderNumber: string
  businessName: string
  amount: number
  fees: {
    platform: number
    stripe: number
    business: number
  }
}

function CheckoutForm({
  orderId,
  orderNumber,
  businessName,
  amount,
}: Omit<OrderPaymentFormProps, 'clientSecret' | 'fees'>) {
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
          return_url: `${window.location.origin}/orders/confirmation/${orderId}`,
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
      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-3">Order Summary</h3>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-600">Business:</dt>
            <dd className="font-medium">{businessName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Order Number:</dt>
            <dd className="font-medium">#{orderNumber}</dd>
          </div>
          <div className="pt-2 border-t flex justify-between">
            <dt className="text-gray-900 font-medium">Total:</dt>
            <dd className="font-bold text-lg">${amount.toFixed(2)}</dd>
          </div>
        </dl>
      </div>

      {/* Payment Element */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">Payment Details</h3>
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
        className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Your payment is processed securely by Stripe. The business will receive your payment minus platform fees.
      </p>
    </form>
  )
}

export default function OrderPaymentForm({ 
  clientSecret, 
  orderId,
  orderNumber,
  businessName,
  amount
  // fees // Commented out - may be used later 
}: OrderPaymentFormProps) {
  const stripe = getStripe()

  return (
    <Elements stripe={stripe} options={{ clientSecret }}>
      <CheckoutForm
        orderId={orderId}
        orderNumber={orderNumber}
        businessName={businessName}
        amount={amount}
      />
    </Elements>
  )
}