import { requireAuth } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { Calendar, Search, Clock, Star, ChevronRight, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"

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

  // Calculate stats
  const upcomingBookings = bookings.filter(
    booking => new Date(booking.date) >= new Date() && booking.status !== 'CANCELLED'
  ).length

  const totalReviews = await prisma.review.count({
    where: { userId: session.user.id }
  })

  const totalBookings = await prisma.booking.count({
    where: { userId: session.user.id }
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {session.user.name}!
        </h1>
        <p className="text-muted-foreground">
          Manage your appointments and explore beauty services
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Bookings
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingBookings}</div>
            <p className="text-xs text-muted-foreground">
              {upcomingBookings === 1 ? 'appointment' : 'appointments'} scheduled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bookings
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              all time bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Reviews Written
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReviews}</div>
            <p className="text-xs text-muted-foreground">
              helping others decide
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Start exploring and booking services
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/search" className="w-full">
              <Button className="w-full">
                <Search className="mr-2 h-4 w-4" />
                Find & Book Services
              </Button>
            </Link>
            <Link href="/bookings" className="w-full">
              <Button variant="outline" className="w-full">
                <Calendar className="mr-2 h-4 w-4" />
                View All Bookings
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Your profile details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                <dd className="text-sm">{session.user.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                <dd className="text-sm">{session.user.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-muted-foreground">Account Type</dt>
                <dd className="text-sm">Customer</dd>
              </div>
            </dl>
            <div className="mt-4 pt-4 border-t">
              <Link
                href="/profile"
                className="text-sm text-primary hover:underline inline-flex items-center"
              >
                Edit Profile
                <ChevronRight className="ml-1 h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>
                Your latest appointments
              </CardDescription>
            </div>
            <Link href="/bookings">
              <Button variant="ghost" size="sm">
                View all
                <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {booking.service.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {booking.business.businessName}
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
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="calendar"
              title="No bookings yet"
              description="Start exploring and book your first appointment"
              action={{
                label: "Find Services",
                href: "/search"
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Recent Reviews */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Reviews</CardTitle>
              <CardDescription>
                Reviews you&apos;ve written for businesses
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="space-y-2 p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {review.business.businessName}
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
              description="Reviews will appear here after your completed appointments"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}