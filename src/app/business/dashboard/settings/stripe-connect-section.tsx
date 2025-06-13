'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Decimal } from '@prisma/client/runtime/library'

interface StripeConnectSectionProps {
  businessId: string
  businessName: string
  stripeAccountId: string | null
  stripeOnboarded: boolean
  commissionRate: Decimal
}

export default function StripeConnectSection({
  businessId,
  businessName,
  stripeAccountId,
  stripeOnboarded,
  commissionRate,
}: StripeConnectSectionProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleConnectStripe = async () => {
    setLoading(true)
    setError('')

    try {
      // Create or retrieve Stripe Connect account
      const response = await fetch('/api/stripe/connect/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId }),
      })

      if (!response.ok) {
        throw new Error('Failed to create Stripe account')
      }

      const { url } = await response.json()
      
      // Redirect to Stripe Connect onboarding
      window.location.href = url
    } catch (err: any) {
      setError(err.message || 'Failed to connect Stripe account')
    } finally {
      setLoading(false)
    }
  }

  const handleStripePortal = async () => {
    setLoading(true)
    setError('')

    try {
      // Get Stripe Express dashboard link
      const response = await fetch('/api/stripe/connect/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId }),
      })

      if (!response.ok) {
        throw new Error('Failed to access Stripe dashboard')
      }

      const { url } = await response.json()
      
      // Redirect to Stripe Express dashboard
      window.location.href = url
    } catch (err: any) {
      setError(err.message || 'Failed to access Stripe dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Settings</h2>
      
      <div className="space-y-6">
        {/* Platform Fee Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Platform Fee Structure</h3>
          <p className="text-sm text-blue-700">
            {process.env.NEXT_PUBLIC_PLATFORM_NAME || 'BeautyPortal'} charges a {commissionRate.toString()}% commission on all bookings.
          </p>
          <p className="text-sm text-blue-700 mt-1">
            You'll receive {(100 - Number(commissionRate)).toFixed(0)}% of each booking after platform fees.
          </p>
          <p className="text-xs text-blue-600 mt-2">
            Note: Additional Stripe processing fees apply (2.9% + $0.30 per transaction)
          </p>
        </div>

        {/* Stripe Connect Status */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Stripe Account</h3>
          
          {!stripeAccountId ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Connect your Stripe account to start accepting payments. You'll be redirected to Stripe to complete the setup.
              </p>
              <button
                onClick={handleConnectStripe}
                disabled={loading}
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 font-medium transition-colors"
              >
                {loading ? 'Connecting...' : 'Connect Stripe Account'}
              </button>
            </div>
          ) : !stripeOnboarded ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-yellow-400 rounded-full animate-pulse" />
                <p className="text-sm text-gray-600">
                  Your Stripe account setup is incomplete. Please complete the onboarding process.
                </p>
              </div>
              <button
                onClick={handleConnectStripe}
                disabled={loading}
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 font-medium transition-colors"
              >
                {loading ? 'Loading...' : 'Complete Stripe Setup'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-medium text-green-800">
                  Your Stripe account is connected and ready to accept payments
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleStripePortal}
                  disabled={loading}
                  className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50 font-medium transition-colors"
                >
                  {loading ? 'Loading...' : 'Manage Stripe Account'}
                </button>
                <button
                  onClick={() => router.push('/business/dashboard/payouts')}
                  className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50 font-medium transition-colors"
                >
                  View Payouts
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Additional Information */}
        <div className="border-t pt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-2">How it works:</h4>
          <ol className="text-sm text-gray-600 space-y-2">
            <li>1. Connect your Stripe account to start accepting payments</li>
            <li>2. Customers pay securely through our platform</li>
            <li>3. Funds are automatically split and deposited to your account</li>
            <li>4. Track your earnings and payouts in your dashboard</li>
          </ol>
        </div>
      </div>
    </div>
  )
}