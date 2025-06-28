import { requireAuth } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { format } from "date-fns"
import RefundButton from "./refund-button"
import CancelButton from "./cancel-button"
import { Breadcrumb, BreadcrumbWrapper } from '@/components/ui/breadcrumb'

export default async function BookingsPage() {
  const session = await requireAuth()

  const bookings = await prisma.booking.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      business: true,
      service: true,
      review: true,
    },
    orderBy: {
      date: 'desc',
    },
  })

  const upcomingBookings = bookings.filter(
    booking => new Date(booking.date) >= new Date() && booking.status !== 'CANCELLED'
  )
  const pastBookings = bookings.filter(
    booking => new Date(booking.date) < new Date() || booking.status === 'CANCELLED'
  )

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
              <Link
                href="/"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Find Services
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <BreadcrumbWrapper>
        <Breadcrumb 
          items={[
            { label: 'Home', href: '/' },
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'My Bookings' }
          ]}
        />
      </BreadcrumbWrapper>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="mt-2 text-gray-600">
            View and manage your appointments
          </p>
        </div>

        {/* Upcoming Bookings */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Upcoming Appointments
          </h2>
          {upcomingBookings.length > 0 ? (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white shadow rounded-lg p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.business.businessName}
                        </h3>
                        <span
                          className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            booking.status === 'CONFIRMED'
                              ? 'bg-green-100 text-green-800'
                              : booking.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {booking.status}
                        </span>
                        {booking.paymentStatus && (
                          <span
                            className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              booking.paymentStatus === 'SUCCEEDED'
                                ? 'bg-green-100 text-green-800'
                                : booking.paymentStatus === 'REFUNDED'
                                ? 'bg-gray-100 text-gray-800'
                                : booking.paymentStatus === 'FAILED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {booking.paymentStatus === 'SUCCEEDED' ? 'Paid' : 
                             booking.paymentStatus === 'REFUNDED' ? 'Refunded' :
                             booking.paymentStatus === 'FAILED' ? 'Payment Failed' :
                             'Payment Pending'}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600">{booking.service.name}</p>
                      <div className="mt-2 text-sm text-gray-500">
                        <p>
                          {format(new Date(booking.date), 'EEEE, MMMM d, yyyy')}
                        </p>
                        <p>
                          {format(new Date(booking.startTime), 'h:mm a')} -{' '}
                          {format(new Date(booking.endTime), 'h:mm a')}
                        </p>
                        <p className="mt-1">
                          {booking.business.address}, {booking.business.city},{' '}
                          {booking.business.state}
                        </p>
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col items-end">
                      <p className="text-lg font-semibold text-gray-900">
                        ${booking.totalPrice.toString()}
                      </p>
                      <div className="mt-2 space-y-2">
                        <Link
                          href={`/business/${booking.business.slug}`}
                          className="text-sm text-indigo-600 hover:text-indigo-500 block"
                        >
                          View Business
                        </Link>
                        <div className="flex flex-col gap-1">
                          <CancelButton
                            bookingId={booking.id}
                            bookingDate={booking.startTime}
                            bookingStatus={booking.status}
                          />
                          <RefundButton
                            bookingId={booking.id}
                            bookingDate={booking.startTime}
                            paymentStatus={booking.paymentStatus}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <p className="text-gray-500">No upcoming appointments</p>
              <Link
                href="/"
                className="mt-4 inline-block text-indigo-600 hover:text-indigo-500"
              >
                Book a service →
              </Link>
            </div>
          )}
        </div>

        {/* Past Bookings */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Past Appointments
          </h2>
          {pastBookings.length > 0 ? (
            <div className="space-y-4">
              {pastBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white shadow rounded-lg p-6 opacity-75"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.business.businessName}
                        </h3>
                        <span
                          className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            booking.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-800'
                              : booking.status === 'CANCELLED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {booking.status}
                        </span>
                        {booking.paymentStatus && (
                          <span
                            className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              booking.paymentStatus === 'SUCCEEDED'
                                ? 'bg-green-100 text-green-800'
                                : booking.paymentStatus === 'REFUNDED'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {booking.paymentStatus === 'SUCCEEDED' ? 'Paid' : 
                             booking.paymentStatus === 'REFUNDED' ? 'Refunded' :
                             'Payment Failed'}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600">{booking.service.name}</p>
                      <p className="mt-1 text-sm text-gray-500">
                        {format(new Date(booking.date), 'MMMM d, yyyy')} at{' '}
                        {format(new Date(booking.startTime), 'h:mm a')}
                      </p>
                    </div>
                    <div className="ml-4">
                      <p className="text-lg font-semibold text-gray-900">
                        ${booking.totalPrice.toString()}
                      </p>
                      {booking.status === 'COMPLETED' && !booking.review && (
                        <Link
                          href={`/review/${booking.id}`}
                          className="mt-2 inline-block text-sm text-indigo-600 hover:text-indigo-500"
                        >
                          Leave a review
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <p className="text-gray-500">No past appointments</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}