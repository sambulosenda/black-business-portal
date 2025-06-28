import { requireRole } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function BusinessDashboardPage() {
  const session = await requireRole("BUSINESS_OWNER")

  // Get business details
  const business = await prisma.business.findUnique({
    where: {
      userId: session.user.id,
    },
    include: {
      services: {
        where: { isActive: true },
      },
      bookings: {
        orderBy: { date: 'desc' },
        take: 5,
        include: {
          user: true,
          service: true,
        },
      },
      reviews: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          user: true,
        },
      },
    },
  })

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Complete Your Business Profile
          </h2>
          <p className="text-gray-600 mb-6">
            You need to complete your business setup to access the dashboard.
          </p>
          <Link
            href="/business/setup"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Complete Setup
          </Link>
        </div>
      </div>
    )
  }

  // Calculate stats
  const totalBookings = await prisma.booking.count({
    where: { businessId: business.id },
  })

  const upcomingBookings = await prisma.booking.count({
    where: {
      businessId: business.id,
      date: { gte: new Date() },
      status: 'CONFIRMED',
    },
  })

  const averageRating =
    business.reviews.length > 0
      ? business.reviews.reduce((acc, review) => acc + review.rating, 0) /
        business.reviews.length
      : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {business.businessName} Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your business, services, and bookings
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Total Bookings
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {totalBookings}
              </dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Upcoming Bookings
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {upcomingBookings}
              </dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Average Rating
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {averageRating.toFixed(1)} ★
              </dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Active Services
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {business.services.length}
              </dd>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link
                href="/business/services"
                className="block w-full text-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Manage Services
              </Link>
              <Link
                href="/business/bookings"
                className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                View All Bookings
              </Link>
              <Link
                href="/business/dashboard/availability"
                className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Set Availability
              </Link>
              <Link
                href="/business/dashboard/analytics"
                className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                View Analytics
              </Link>
            </div>
          </div>

          {/* Business Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Business Information
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      business.isVerified
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {business.isVerified ? 'Verified' : 'Pending Verification'}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Category</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {business.category.replace(/_/g, ' ')}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Location</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {business.city}, {business.state}
                </dd>
              </div>
            </dl>
            <div className="mt-4">
              <Link
                href="/business/profile"
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Edit Business Profile →
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Bookings
              </h2>
              <Link
                href="/business/bookings"
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                View all →
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {business.bookings.length > 0 ? (
              business.bookings.map((booking) => (
                <div key={booking.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {booking.user.name} - {booking.service.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(booking.date).toLocaleDateString()} at{' '}
                        {new Date(booking.startTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          booking.status === 'CONFIRMED'
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : booking.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {booking.status.toLowerCase()}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        ${booking.totalPrice.toString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center">
                <p className="text-gray-500">No bookings yet</p>
                <p className="mt-1 text-sm text-gray-400">
                  Share your business profile to start receiving bookings
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Reviews
              </h2>
              <Link
                href="/business/dashboard/reviews"
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                View all →
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {business.reviews.length > 0 ? (
              business.reviews.map((review) => (
                <div key={review.id} className="px-6 py-4">
                  <div className="flex items-start">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">
                          {review.user.name}
                        </p>
                        <div className="ml-2 flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="mt-2 text-sm text-gray-600">
                          {review.comment}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center">
                <p className="text-gray-500">No reviews yet</p>
                <p className="mt-1 text-sm text-gray-400">
                  Reviews will appear here after customers rate their experience
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}