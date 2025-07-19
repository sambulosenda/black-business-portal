import { requireRole } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { format } from "date-fns"
import { 
  Calendar, 
  DollarSign, 
  Star, 
  Package, 
  Clock,
  ChevronRight,
  BarChart3
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"

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
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
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
      ? business.reviews.reduce((acc, review) => acc + review.rating, 0) /
        business.reviews.length
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
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Welcome back, {business.businessName}!
        </h1>
        <p className="text-gray-600">
          Here&apos;s an overview of your business performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Revenue
            </CardTitle>
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ${thisMonthRevenue._sum.totalPrice?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              <span className="text-green-600 font-medium">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Bookings
            </CardTitle>
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{thisMonthBookings}</div>
            <p className="text-xs text-gray-500 mt-1">
              <span className="text-purple-600 font-medium">{upcomingBookings}</span> upcoming
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Average Rating
            </CardTitle>
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
              <Star className="h-6 w-6 text-yellow-600 fill-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              From <span className="font-medium">{totalReviews}</span> reviews
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Services
            </CardTitle>
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
              <Package className="h-6 w-6 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{business.services.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              Available for booking
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            <CardDescription>
              Manage your business operations
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Link href="/business/dashboard/services">
              <Button className="w-full justify-start bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white">
                <Package className="mr-2 h-4 w-4" />
                Manage Services
              </Button>
            </Link>
            <Link href="/business/dashboard/bookings">
              <Button variant="outline" className="w-full justify-start hover:bg-gray-50">
                <Calendar className="mr-2 h-4 w-4" />
                View All Bookings
              </Button>
            </Link>
            <Link href="/business/dashboard/availability">
              <Button variant="outline" className="w-full justify-start hover:bg-gray-50">
                <Clock className="mr-2 h-4 w-4" />
                Set Availability
              </Button>
            </Link>
            <Link href="/business/dashboard/analytics">
              <Button variant="outline" className="w-full justify-start hover:bg-gray-50">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Business Info */}
        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Business Information</CardTitle>
            <CardDescription>
              Your business details and status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex justify-between items-center">
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd>
                  <Badge variant={business.isVerified ? 'success' : 'warning'} className={business.isVerified ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}>
                    {business.isVerified ? 'Verified' : 'Pending Verification'}
                  </Badge>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Category</dt>
                <dd className="text-sm text-gray-900">{business.category.replace(/_/g, ' ')}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Location</dt>
                <dd className="text-sm text-gray-900">{business.city}, {business.state}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="text-sm text-gray-900">{business.phone}</dd>
              </div>
            </dl>
            <div className="mt-6 pt-6 border-t">
              <Link
                href="/business/dashboard/settings"
                className="text-sm text-indigo-600 hover:text-indigo-700 inline-flex items-center font-medium transition-colors"
              >
                Edit Business Profile
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card className="border border-gray-200 bg-white shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Recent Bookings</CardTitle>
              <CardDescription>
                Your latest customer appointments
              </CardDescription>
            </div>
            <Link href="/business/dashboard/bookings">
              <Button variant="ghost" size="sm">
                View all
                <ChevronRight className="ml-1 h-4 w-4" />
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
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-900">
                      {booking.user.name}
                    </p>
                    <p className="text-sm text-gray-600">{booking.service.name}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(booking.date), 'MMM d, yyyy')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(booking.startTime), 'h:mm a')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={
                        booking.status === 'CONFIRMED' ? 'border-green-200 bg-green-50 text-green-700' :
                        booking.status === 'PENDING' ? 'border-yellow-200 bg-yellow-50 text-yellow-700' :
                        booking.status === 'CANCELLED' ? 'border-red-200 bg-red-50 text-red-700' :
                        'border-gray-200 bg-gray-50 text-gray-700'
                      }
                    >
                      {booking.status.charAt(0) + booking.status.slice(1).toLowerCase()}
                    </Badge>
                    <span className="text-sm font-semibold text-gray-900">
                      ${booking.totalPrice.toString()}
                    </span>
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
      <Card className="border border-gray-200 bg-white shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Recent Reviews</CardTitle>
              <CardDescription>
                Customer feedback and ratings
              </CardDescription>
            </div>
            <Link href="/business/dashboard/reviews">
              <Button variant="ghost" size="sm">
                View all
                <ChevronRight className="ml-1 h-4 w-4" />
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
                  className="space-y-2 p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {review.user.name}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-gray-200 text-gray-200'
                            }`}
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-2">
                          {review.rating}.0
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {format(new Date(review.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {review.comment}
                    </p>
                  )}
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