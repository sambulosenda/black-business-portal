'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mail, ArrowLeft, Loader2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [resendError, setResendError] = useState('')

  const handleResendEmail = async () => {
    if (!email) return

    setIsResending(true)
    setResendError('')
    setResendSuccess(false)

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend email')
      }

      setResendSuccess(true)
    } catch (error: any) {
      setResendError(error.message)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8 px-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-indigo-600" />
            </div>
          </div>

          {/* Content */}
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Check your email
            </h1>
            
            <p className="text-gray-600">
              We've sent a verification link to{' '}
              {email && (
                <span className="font-semibold text-gray-900">{email}</span>
              )}
            </p>

            <p className="text-sm text-gray-500">
              Click the link in the email to verify your account. The link will expire in 24 hours.
            </p>

            {/* Resend Section */}
            <div className="pt-4">
              <p className="text-sm text-gray-600 mb-3">
                Didn't receive the email?
              </p>
              
              {resendSuccess ? (
                <p className="text-sm text-green-600">
                  ✓ Verification email sent successfully!
                </p>
              ) : (
                <Button
                  onClick={handleResendEmail}
                  disabled={isResending || !email}
                  variant="outline"
                  className="w-full"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Resend verification email'
                  )}
                </Button>
              )}

              {resendError && (
                <p className="text-sm text-red-600 mt-2">{resendError}</p>
              )}
            </div>

            {/* Tips */}
            <div className="bg-gray-50 rounded-lg p-4 text-left mt-6">
              <p className="text-sm font-medium text-gray-900 mb-2">
                Can't find the email?
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Check your spam or junk folder</li>
                <li>• Make sure you entered the correct email</li>
                <li>• Add noreply@beautyportal.com to your contacts</li>
              </ul>
            </div>

            {/* Back to login */}
            <div className="pt-6">
              <Link href="/login">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to login
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}