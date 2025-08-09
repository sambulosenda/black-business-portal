import Link from 'next/link'
import { format } from 'date-fns'
import { BarChart3, Calendar, ChevronRight, Clock, DollarSign, Package, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/session'

export default async function BusinessDashboardPage() {
  const session = await requireRole('BUSINESS_OWNER')

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
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Complete Your Business Profile</CardTitle>
            <CardDescription>
              You need to complete your business setup to access the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/business/dashboard/settings">
              <Button className="bg-indigo-600 text-white hover:bg-indigo-700">
                Complete Setup
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate stats
  // const totalBookings = await prisma.booking.count({
  //   where: { businessId: business.id },
  // }) // Commented out - may be used later

  const upcomingBookings = await prisma.booking.count({
    where: {
      businessId: business.id,
      date: { gte: new Date() },
      status: 'CONFIRMED',
    },
  })

  const thisMonthBookings = await prisma.booking.count({
    where: {
      businessId: business.id,
      date: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
      },
    },
  })

  const totalReviews = await prisma.review.count({
    where: { businessId: business.id },
  })

  const averageRating =
    business.reviews.length > 0
      ? business.reviews.reduce((acc, review) => acc + review.rating, 0) / business.reviews.length
      : 0

  // Calculate revenue (simplified - you might want to add actual payment data)
  const thisMonthRevenue = await prisma.booking.aggregate({
    where: {
      businessId: business.id,
      date: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
      },
      status: { in: ['CONFIRMED', 'COMPLETED'] },
    },
    _sum: {
      totalPrice: true,
    },
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500">Overview of your business performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-gray-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-900">
              ${thisMonthRevenue._sum.totalPrice?.toFixed(2) || '0.00'}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              This month
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-900">{thisMonthBookings}</div>
            <p className="mt-1 text-xs text-gray-500">
              {upcomingBookings} upcoming
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Rating</CardTitle>
            <Star className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-900">
              {averageRating > 0 ? averageRating.toFixed(1) : '—'}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {totalReviews} reviews
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Services</CardTitle>
            <Package className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-900">{business.services.length}</div>
            <p className="mt-1 text-xs text-gray-500">Active services</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card className="border border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="text-base font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Link href="/business/dashboard/services">
              <Button variant="ghost" className="w-full justify-start h-auto py-3 px-3 hover:bg-gray-50">
                <Package className="mr-3 h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">Manage Services</span>
              </Button>
            </Link>
            <Link href="/business/dashboard/bookings">
              <Button variant="ghost" className="w-full justify-start h-auto py-3 px-3 hover:bg-gray-50">
                <Calendar className="mr-3 h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">View Bookings</span>
              </Button>
            </Link>
            <Link href="/business/dashboard/availability">
              <Button variant="ghost" className="w-full justify-start h-auto py-3 px-3 hover:bg-gray-50">
                <Clock className="mr-3 h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">Set Availability</span>
              </Button>
            </Link>
            <Link href="/business/dashboard/analytics">
              <Button variant="ghost" className="w-full justify-start h-auto py-3 px-3 hover:bg-gray-50">
                <BarChart3 className="mr-3 h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">View Analytics</span>
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Business Info */}
        <Card className="border border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="text-base font-medium">Business Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-500">Status</dt>
                <dd>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    business.isVerified
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {business.isVerified ? 'Verified' : 'Pending'}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Category</dt>
                <dd className="text-sm text-gray-700">{business.category.replace(/_/g, ' ')}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Location</dt>
                <dd className="text-sm text-gray-700">
                  {business.city}, {business.state}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Phone</dt>
                <dd className="text-sm text-gray-700">{business.phone}</dd>
              </div>
            </dl>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Link
                href="/business/dashboard/settings"
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                Edit Profile
                <ChevronRight className="ml-1 h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card className="border border-gray-200 bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Recent Bookings</CardTitle>
            <Link href="/business/dashboard/bookings">
              <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-gray-700">
                View all
                <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {business.bookings.length > 0 ? (
            <div className="space-y-3">
              {business.bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-900">{booking.user.name}</p>
                    <p className="text-xs text-gray-500">{booking.service.name}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{format(new Date(booking.date), 'MMM d')}</span>
                      <span>{format(new Date(booking.startTime), 'h:mm a')}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      ${booking.totalPrice.toString()}
                    </div>
                    <div className="mt-1">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                        booking.status === 'CONFIRMED'
                          ? 'bg-gray-100 text-gray-700'
                          : booking.status === 'PENDING'
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-gray-50 text-gray-500'
                      }`}>
                        {booking.status.charAt(0) + booking.status.slice(1).toLowerCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="calendar"
              title="No bookings yet"
              description="Share your business profile to start receiving bookings"
            />
          )}
        </CardContent>
      </Card>

      {/* Recent Reviews */}
      <Card className="border border-gray-200 bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Recent Reviews</CardTitle>
            <Link href="/business/dashboard/reviews">
              <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-gray-700">
                View all
                <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {business.reviews.length > 0 ? (
            <div className="space-y-3">
              {business.reviews.map((review) => (
                <div
                  key={review.id}
                  className="border-b border-gray-100 py-3 last:border-0"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">{review.user.name}</p>
                        <span className="text-xs text-gray-400">
                          {format(new Date(review.createdAt), 'MMM d')}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < review.rating
                                ? 'fill-gray-900 text-gray-900'
                                : 'fill-gray-200 text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      {review.comment && (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{review.comment}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="reviews"
              title="No reviews yet"
              description="Reviews will appear here after customers rate their experience"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
