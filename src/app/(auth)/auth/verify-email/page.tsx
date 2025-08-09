'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Loader2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

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
        body: JSON.stringify({ email }),
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="group inline-flex items-center space-x-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-lg font-bold text-white shadow-lg transition-all group-hover:shadow-xl">
              G
            </div>
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent">
              Glamfric
            </span>
          </Link>
        </div>

        <Card className="shadow-xl">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
                <Mail className="h-8 w-8 text-indigo-600" />
              </div>

              <h2 className="mb-2 text-2xl font-bold text-gray-900">Check your email</h2>

              <p className="mb-6 text-gray-600">
                We&apos;ve sent a verification link to{' '}
                <span className="font-medium text-gray-900">{email || 'your email'}</span>
              </p>

              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Please check your inbox and click the link to verify your account. The link will
                  expire in 24 hours.
                </p>

                <div className="border-t border-gray-200 pt-4">
                  <p className="mb-3 text-sm text-gray-600">Didn&apos;t receive the email?</p>

                  {resendSuccess ? (
                    <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
                      Email sent! Please check your inbox.
                    </div>
                  ) : resendError ? (
                    <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
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
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600"></div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}
