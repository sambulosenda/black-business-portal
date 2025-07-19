'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mail, ArrowLeft, Loader2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

function VerifyEmailContent() {
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
    } catch (error) {
      setResendError(error instanceof Error ? error.message : 'Failed to send email')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-xl transition-all">
              G
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Glamfric
            </span>
          </Link>
        </div>

        <Card className="shadow-xl">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="h-8 w-8 text-indigo-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Check your email
              </h2>
              
              <p className="text-gray-600 mb-6">
                We&apos;ve sent a verification link to{' '}
                <span className="font-medium text-gray-900">{email || 'your email'}</span>
              </p>

              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Please check your inbox and click the link to verify your account.
                  The link will expire in 24 hours.
                </p>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-3">
                    Didn&apos;t receive the email?
                  </p>
                  
                  {resendSuccess ? (
                    <div className="bg-green-50 text-green-800 px-4 py-3 rounded-lg text-sm">
                      Email sent! Please check your inbox.
                    </div>
                  ) : resendError ? (
                    <div className="bg-red-50 text-red-800 px-4 py-3 rounded-lg text-sm">
                      {resendError}
                    </div>
                  ) : (
                    <Button
                      onClick={handleResendEmail}
                      disabled={isResending || !email}
                      variant="outline"
                      className="w-full"
                    >
                      {isResending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Resend verification email'
                      )}
                    </Button>
                  )}
                </div>

                <div className="pt-4">
                  <Link href="/login">
                    <Button variant="ghost" className="w-full">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to login
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Having trouble?{' '}
            <Link href="/contact" className="text-indigo-600 hover:text-indigo-500">
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}