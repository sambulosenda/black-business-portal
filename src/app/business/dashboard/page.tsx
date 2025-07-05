import { requireRole } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { format } from "date-fns"
import { 
  Calendar, 
  DollarSign, 
  Star, 
  Package, 
  TrendingUp,
  Clock,
  ChevronRight,
  Settings,
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
            <Link href="/business/setup">
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
    <div className="container mx-auto max-w-7xl p-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Welcome back, {business.businessName}!
        </h1>
        <p className="text-gray-600">
          Here's an overview of your business performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 bg-indigo-600 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">
              Total Revenue
            </CardTitle>
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              ${thisMonthRevenue._sum.totalPrice?.toFixed(2) || '0.00'}
            </div>
            <p className="text-sm text-white/80 mt-1">
              This month
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-purple-600 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">
              Bookings
            </CardTitle>
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Calendar className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{thisMonthBookings}</div>
            <p className="text-sm text-white/80 mt-1">
              This month ({upcomingBookings} upcoming)
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-pink-600 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">
              Average Rating
            </CardTitle>
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Star className="h-5 w-5 text-white fill-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
            </div>
            <p className="text-sm text-white/80 mt-1">
              Based on {totalReviews} reviews
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-emerald-600 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">
              Active Services
            </CardTitle>
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Package className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{business.services.length}</div>
            <p className="text-sm text-white/80 mt-1">
              Available for booking
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader className="bg-indigo-50 rounded-t-lg">
            <CardTitle className="text-xl">Quick Actions</CardTitle>
            <CardDescription className="text-gray-600">
              Manage your business operations
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 p-6">
            <Link href="/business/dashboard/services">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all">
                <Package className="mr-2 h-4 w-4" />
                Manage Services
              </Button>
            </Link>
            <Link href="/business/dashboard/bookings">
              <Button variant="outline" className="w-full border-2 hover:bg-indigo-50 hover:border-indigo-300 transition-all">
                <Calendar className="mr-2 h-4 w-4" />
                View All Bookings
              </Button>
            </Link>
            <Link href="/business/dashboard/availability">
              <Button variant="outline" className="w-full border-2 hover:bg-purple-50 hover:border-purple-300 transition-all">
                <Clock className="mr-2 h-4 w-4" />
                Set Availability
              </Button>
            </Link>
            <Link href="/business/dashboard/analytics">
              <Button variant="outline" className="w-full border-2 hover:bg-pink-50 hover:border-pink-300 transition-all">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Business Info */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader className="bg-purple-50 rounded-t-lg">
            <CardTitle className="text-xl">Business Information</CardTitle>
            <CardDescription className="text-gray-600">
              Your business details and status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between items-center">
                <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                <dd>
                  <Badge className={business.isVerified ? 'bg-green-600 text-white border-0' : 'bg-yellow-600 text-white border-0'}>
                    {business.isVerified ? 'Verified' : 'Pending Verification'}
                  </Badge>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-muted-foreground">Category</dt>
                <dd className="text-sm">{business.category.replace(/_/g, ' ')}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-muted-foreground">Location</dt>
                <dd className="text-sm">{business.city}, {business.state}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
                <dd className="text-sm">{business.phone}</dd>
              </div>
            </dl>
            <div className="mt-4 pt-4 border-t">
              <Link
                href="/business/dashboard/settings"
                className="text-sm text-indigo-600 hover:text-indigo-700 inline-flex items-center font-medium transition-colors"
              >
                Edit Business Profile
                <ChevronRight className="ml-1 h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card className="border-0 shadow-lg bg-white">
        <CardHeader className="bg-indigo-50 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Recent Bookings</CardTitle>
              <CardDescription className="text-gray-600">
                Your latest customer appointments
              </CardDescription>
            </div>
            <Link href="/business/dashboard/bookings">
              <Button variant="ghost" size="sm" className="hover:bg-white/50">
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
                  className="flex items-center justify-between p-3 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {booking.user.name} - {booking.service.name}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
                      variant={
                        booking.status === 'CONFIRMED' ? 'success' :
                        booking.status === 'PENDING' ? 'warning' :
                        booking.status === 'CANCELLED' ? 'destructive' :
                        'default'
                      }
                    >
                      {booking.status}
                    </Badge>
                    <span className="text-sm font-medium">
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
      <Card className="border-0 shadow-lg bg-white">
        <CardHeader className="bg-purple-50 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Recent Reviews</CardTitle>
              <CardDescription className="text-gray-600">
                Customer feedback and ratings
              </CardDescription>
            </div>
            <Link href="/business/dashboard/reviews">
              <Button variant="ghost" size="sm" className="hover:bg-white/50">
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
                  className="space-y-2 p-3 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {review.user.name}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-muted text-muted'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(review.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-muted-foreground">
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