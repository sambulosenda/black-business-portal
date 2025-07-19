'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle2, CreditCard, ExternalLink, Loader2 } from 'lucide-react'
interface StripeConnectSectionProps {
  businessId: string
  businessName: string
  stripeAccountId: string | null
  stripeOnboarded: boolean
  commissionRate: number
}

export default function StripeConnectSection({
  businessId,
  // businessName, // Commented out - may be used later
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

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create Stripe account')
      }

      const { url } = data
      
      // Redirect to Stripe Connect onboarding
      window.location.href = url
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to connect Stripe account')
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
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to access Stripe dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Payment Settings</CardTitle>
        <CardDescription className="text-gray-600">
          Connect your Stripe account to receive payments from customers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Platform Fee Information */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm">
              <CreditCard className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Platform Fee Structure</h3>
              <p className="text-sm text-gray-700">
                {process.env.NEXT_PUBLIC_PLATFORM_NAME || 'Glamfric'} charges a {commissionRate.toString()}% commission on all bookings.
              </p>
              <p className="text-sm text-gray-700 mt-1">
                You&apos;ll receive <span className="font-semibold text-green-700">{(100 - Number(commissionRate)).toFixed(0)}%</span> of each booking after platform fees.
              </p>
              <p className="text-xs text-gray-600 mt-2">
                Note: Additional Stripe processing fees apply (2.9% + $0.30 per transaction)
              </p>
            </div>
          </div>
        </div>

        {/* Stripe Connect Status */}
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-4">Stripe Account Status</h3>
          
          {!stripeAccountId ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  Connect your Stripe account to start accepting payments. You&apos;ll be redirected to Stripe to complete the setup.
                </p>
              </div>
              <Button
                onClick={handleConnectStripe}
                disabled={loading}
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Connecting...' : 'Connect Stripe Account'}
              </Button>
            </div>
          ) : !stripeOnboarded ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="h-3 w-3 bg-yellow-400 rounded-full animate-pulse flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  Your Stripe account setup is incomplete. Please complete the onboarding process.
                </p>
              </div>
              <Button
                onClick={handleConnectStripe}
                disabled={loading}
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Loading...' : 'Complete Stripe Setup'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Your Stripe account is connected and ready to accept payments
                  </p>
                  <Badge variant="outline" className="mt-1 border-green-200 bg-green-50 text-green-700">
                    Active
                  </Badge>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleStripePortal}
                  disabled={loading}
                  variant="outline"
                  className="hover:bg-gray-50"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {loading ? 'Loading...' : 'Manage Stripe Account'}
                </Button>
                <Button
                  onClick={() => router.push('/business/dashboard/payouts')}
                  variant="outline"
                  className="hover:bg-gray-50"
                >
                  View Payouts
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Additional Information */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">How it works:</h4>
          <ol className="space-y-2">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-semibold">1</span>
              <span className="text-sm text-gray-600">Connect your Stripe account to start accepting payments</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-semibold">2</span>
              <span className="text-sm text-gray-600">Customers pay securely through our platform</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-semibold">3</span>
              <span className="text-sm text-gray-600">Funds are automatically split and deposited to your account</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-semibold">4</span>
              <span className="text-sm text-gray-600">Track your earnings and payouts in your dashboard</span>
            </li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}