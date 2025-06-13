import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import { format } from 'date-fns'

interface ConfirmationPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function BookingConfirmationPage({ params }: ConfirmationPageProps) {
  const session = await requireAuth()
  const { id } = await params

  const booking = await prisma.booking.findUnique({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      business: true,
      service: true,
    },
  })

  if (!booking) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-indigo-600">
                BeautyPortal
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow rounded-lg p-8">
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Booking Confirmed!</h1>
            <p className="mt-2 text-gray-600">
              Your appointment has been successfully booked
            </p>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <dl className="space-y-6">
              <div>
                <dt className="text-sm font-medium text-gray-500">Booking ID</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{booking.id}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Business</dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900">
                  {booking.business.businessName}
                </dd>
                <dd className="mt-1 text-sm text-gray-600">
                  {booking.business.address}, {booking.business.city}, {booking.business.state} {booking.business.zipCode}
                </dd>
                <dd className="mt-1 text-sm text-gray-600">
                  Phone: {booking.business.phone}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Service</dt>
                <dd className="mt-1 text-sm text-gray-900">{booking.service.name}</dd>
                <dd className="mt-1 text-sm text-gray-600">
                  Duration: {booking.service.duration} minutes
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Date & Time</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {format(new Date(booking.date), 'EEEE, MMMM d, yyyy')}
                </dd>
                <dd className="mt-1 text-sm text-gray-900">
                  {format(new Date(booking.startTime), 'h:mm a')} - {format(new Date(booking.endTime), 'h:mm a')}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Total Price</dt>
                <dd className="mt-1 text-2xl font-bold text-gray-900">
                  ${booking.totalPrice.toString()}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {booking.status}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-8">
            <div className="bg-amber-50 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-amber-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">Important</h3>
                  <div className="mt-2 text-sm text-amber-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Please arrive 5-10 minutes before your appointment</li>
                      <li>If you need to cancel or reschedule, please do so at least 24 hours in advance</li>
                      <li>A confirmation email has been sent to {session.user.email}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link
              href="/dashboard"
              className="flex-1 text-center bg-indigo-600 text-white py-2 px-4 rounded-md font-medium hover:bg-indigo-700"
            >
              Go to Dashboard
            </Link>
            <Link
              href={`/business/${booking.business.slug}`}
              className="flex-1 text-center border border-gray-300 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-50"
            >
              View Business Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}