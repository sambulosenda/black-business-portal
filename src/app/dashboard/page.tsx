import { requireAuth } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await requireAuth()
  
  // Redirect business owners to their specific dashboard
  if (session.user.role === "BUSINESS_OWNER") {
    redirect("/business/dashboard")
  }

  // Get user's bookings
  const bookings = await prisma.booking.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      business: true,
      service: true,
    },
    orderBy: {
      date: 'desc',
    },
    take: 5,
  })

  // Get user's reviews
  const reviews = await prisma.review.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      business: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {session.user.name}!
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your appointments and explore beauty services
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link
                href="/"
                className="block w-full text-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Find & Book Services
              </Link>
              <Link
                href="/bookings"
                className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                View All Bookings
              </Link>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Account Information
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{session.user.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{session.user.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Account Type</dt>
                <dd className="mt-1 text-sm text-gray-900">Customer</dd>
              </div>
            </dl>
            <div className="mt-4">
              <Link
                href="/settings"
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Edit Profile →
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Bookings
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <div key={booking.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {booking.service.name} at {booking.business.businessName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(booking.date).toLocaleDateString()} at{' '}
                        {new Date(booking.startTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center">
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
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center">
                <p className="text-gray-500">No bookings yet</p>
                <Link
                  href="/"
                  className="mt-2 inline-block text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Book your first service →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Your Reviews
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="px-6 py-4">
                  <div className="flex items-start">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {review.business.businessName}
                      </p>
                      <div className="flex items-center mt-1">
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
                  Reviews will appear here after your completed appointments
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}