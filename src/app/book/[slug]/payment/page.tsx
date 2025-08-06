'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Shield } from 'lucide-react'
import { ProgressSteps } from '@/components/ui/progress-steps'
import PaymentForm from '../payment-form'

interface PaymentData {
  paymentIntentId: string
  clientSecret: string
  amount: number
  bookingId: string
  businessName: string
  serviceName: string
  date: string
  time: string
  fees: {
    platform: number
    stripe: number
    business: number
  }
}

export default function PaymentPage() {
  const router = useRouter()
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [loading, setLoading] = useState(true)

  const paymentSteps = [
    { id: 'service', name: 'Service Selected' },
    { id: 'datetime', name: 'Date & Time Chosen' },
    { id: 'payment', name: 'Payment' },
    { id: 'confirmation', name: 'Confirmation' },
  ]

  useEffect(() => {
    // Get payment data from sessionStorage
    const data = sessionStorage.getItem('bookingPayment')
    if (!data) {
      router.push('/')
      return
    }

    try {
      const parsed = JSON.parse(data)
      setPaymentData(parsed)
    } catch (error) {
      console.error('Error parsing payment data:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }, [router])

  if (loading || !paymentData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-xl font-bold text-indigo-600">
                BeautyPortal
              </Link>
              <button
                onClick={() => window.history.back()}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to booking
              </button>
            </div>
            <div className="flex items-center">
              <div className="flex items-center text-sm text-gray-600">
                <Shield className="mr-1 h-4 w-4 text-green-600" />
                Secure Checkout
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <ProgressSteps steps={paymentSteps} currentStep={2} />
        </div>

        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Complete Your Booking</h1>
            <p className="mt-2 text-gray-600">
              Enter your payment details to confirm your appointment
            </p>
          </div>

          <div className="rounded-lg bg-white p-8 shadow-xl">
            <PaymentForm
              clientSecret={paymentData.clientSecret}
              bookingId={paymentData.bookingId}
              businessName={paymentData.businessName}
              serviceName={paymentData.serviceName}
              date={new Date(paymentData.date)}
              time={paymentData.time}
              amount={paymentData.amount}
              fees={paymentData.fees}
            />
          </div>

          {/* Fee Breakdown */}
          <div className="mt-6 rounded-lg border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5">
            <h3 className="mb-3 flex items-center text-sm font-semibold text-blue-900">
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Fee Transparency
            </h3>
            <dl className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-gray-600">Service Price:</dt>
                <dd className="font-semibold text-gray-900">${paymentData.amount.toFixed(2)}</dd>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <dt>Platform Fee (15%):</dt>
                <dd>-${paymentData.fees.platform.toFixed(2)}</dd>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <dt>Processing Fee:</dt>
                <dd>-${paymentData.fees.stripe.toFixed(2)}</dd>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-blue-200 pt-3">
                <dt className="font-semibold text-blue-900">Business Receives:</dt>
                <dd className="text-lg font-bold text-blue-900">
                  ${paymentData.fees.business.toFixed(2)}
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-gray-600">
              We believe in transparency. The business receives the full amount minus our platform
              and processing fees.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
