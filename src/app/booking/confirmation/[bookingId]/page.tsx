import { requireAuth } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"

interface ConfirmationPageProps {
  params: Promise<{
    bookingId: string
  }>
  searchParams: Promise<{
    payment_intent?: string
    payment_intent_client_secret?: string
    redirect_status?: string
  }>
}

export default async function BookingConfirmationPage({ 
  params,
  searchParams 
}: ConfirmationPageProps) {
  const session = await requireAuth()
  const { bookingId } = await params
  const { redirect_status } = await searchParams

  // Get booking details
  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
      userId: session.user.id,
    },
    include: {
      business: true,
      service: true,
    },
  })

  if (!booking) {
    redirect('/bookings')
  }

  // Check payment status from Stripe redirect
  const paymentSuccessful = redirect_status === 'succeeded' || booking.paymentStatus === 'SUCCEEDED'

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
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow rounded-lg p-8 text-center">
          {paymentSuccessful ? (
            <>
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
              <p className="text-gray-600 mb-8">
                Your appointment has been successfully booked and paid for.
              </p>
            </>
          ) : (
            <>
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
                <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Processing</h1>
              <p className="text-gray-600 mb-8">
                Your payment is being processed. You'll receive a confirmation email once complete.
              </p>
            </>
          )}

          {/* Booking Details */}
          <div className="bg-gray-50 rounded-lg p-6 text-left mb-8">
            <h2 className="font-semibold text-gray-900 mb-4">Appointment Details</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Business:</dt>
                <dd className="font-medium text-gray-900">{booking.business.businessName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Service:</dt>
                <dd className="font-medium text-gray-900">{booking.service.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Date:</dt>
                <dd className="font-medium text-gray-900">
                  {format(new Date(booking.date), 'EEEE, MMMM d, yyyy')}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Time:</dt>
                <dd className="font-medium text-gray-900">
                  {format(new Date(booking.startTime), 'h:mm a')} - {format(new Date(booking.endTime), 'h:mm a')}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Location:</dt>
                <dd className="font-medium text-gray-900">
                  {booking.business.address}, {booking.business.city}, {booking.business.state}
                </dd>
              </div>
              <div className="pt-3 border-t flex justify-between">
                <dt className="text-gray-900 font-medium">Total Paid:</dt>
                <dd className="font-bold text-lg text-gray-900">${booking.totalPrice.toString()}</dd>
              </div>
            </dl>
          </div>

          {/* Confirmation Number */}
          <div className="bg-indigo-50 rounded-lg p-4 mb-8">
            <p className="text-sm text-indigo-900 font-medium">Confirmation Number</p>
            <p className="text-lg font-mono font-bold text-indigo-600">{booking.id.toUpperCase()}</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/bookings"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              View My Bookings
            </Link>
            <Link
              href={`/business/${booking.business.slug}`}
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Book Another Service
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-sm text-gray-500">
            <p>A confirmation email has been sent to {session.user.email}</p>
            <p className="mt-2">
              Need to cancel or reschedule? Visit your{' '}
              <Link href="/bookings" className="text-indigo-600 hover:text-indigo-500">
                bookings page
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}