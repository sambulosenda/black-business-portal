'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import OrderPaymentForm from './order-payment-form'

interface PaymentData {
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

export default function OrderPaymentPage() {
  const router = useRouter()
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get payment data from sessionStorage
    const data = sessionStorage.getItem('orderPayment')
    if (!data) {
      router.push('/cart')
      return
    }

    try {
      const parsed = JSON.parse(data)
      setPaymentData(parsed)
    } catch (error) {
      console.error('Error parsing payment data:', error)
      router.push('/cart')
    } finally {
      setLoading(false)
    }
  }, [router])

  if (loading || !paymentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-indigo-600">
                Glamfric
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Order</h1>
          <p className="mt-2 text-gray-600">
            Enter your payment details to confirm your purchase
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <OrderPaymentForm
            clientSecret={paymentData.clientSecret}
            orderId={paymentData.orderId}
            orderNumber={paymentData.orderNumber}
            businessName={paymentData.businessName}
            amount={paymentData.amount}
            fees={paymentData.fees}
          />
        </div>

        {/* Fee Breakdown */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Payment Breakdown</h3>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-blue-700">Order Total:</dt>
              <dd className="font-medium text-blue-900">${paymentData.amount.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-blue-700">Platform Fee (15%):</dt>
              <dd className="text-blue-900">-${paymentData.fees.platform.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-blue-700">Processing Fee:</dt>
              <dd className="text-blue-900">-${paymentData.fees.stripe.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between pt-2 border-t border-blue-200">
              <dt className="text-blue-900 font-medium">Business Receives:</dt>
              <dd className="font-bold text-blue-900">${paymentData.fees.business.toFixed(2)}</dd>
            </div>
          </dl>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          Order #{paymentData.orderNumber}
        </p>
      </div>
    </div>
  )
}