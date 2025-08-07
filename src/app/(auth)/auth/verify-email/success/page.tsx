'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function VerifyEmailSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="px-8 pt-8 pb-8">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Email Verified!</h1>

            <p className="text-gray-600">
              Your email has been successfully verified. You can now log in to your account and
              start booking beauty services.
            </p>

            {/* Actions */}
            <div className="space-y-3 pt-6">
              <Link href="/login" className="block">
                <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700">
                  Continue to Login
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>

              <Link href="/" className="block">
                <Button variant="ghost" className="w-full">
                  Go to Homepage
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
