import { requireRole } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, DollarSign } from "lucide-react"
import Link from "next/link"

export default async function CalendarPage() {
  const session = await requireRole("BUSINESS_OWNER")
  
  // Get the business for this owner
  const business = await prisma.business.findFirst({
    where: {
      ownerId: session.user.id,
      isActive: true,
    },
  })

  if (!business) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">No active business found</p>
      </div>
    )
  }

  // Get current month dates
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  // Get all bookings for the current month
  const bookings = await prisma.booking.findMany({
    where: {
      businessId: business.id,
      date: {
        gte: monthStart,
        lte: monthEnd,
      },
    },
    include: {
      user: true,
      service: true,
    },
    orderBy: {
      startTime: 'asc',
    },
  })

  // Group bookings by date
  const bookingsByDate = bookings.reduce((acc, booking) => {
    const dateKey = format(booking.date, 'yyyy-MM-dd')
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(booking)
    return acc
  }, {} as Record<string, typeof bookings>)

  // Get dates with bookings for the calendar
  const datesWithBookings = Object.keys(bookingsByDate).map(dateStr => new Date(dateStr))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground">View and manage your appointments</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,400px]">
        {/* Calendar View */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {format(now, 'MMMM yyyy')}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={now}
              className="rounded-md border"
              modifiers={{
                booked: datesWithBookings,
              }}
              modifiersStyles={{
                booked: { 
                  fontWeight: 'bold',
                  backgroundColor: 'hsl(var(--primary) / 0.1)',
                  color: 'hsl(var(--primary))',
                },
              }}
            />
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>
              {format(now, 'EEEE, MMMM d')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bookingsByDate[format(now, 'yyyy-MM-dd')]?.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col space-y-2 p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{booking.service.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(booking.startTime, 'h:mm a')} - {format(booking.endTime, 'h:mm a')}
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
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <User className="h-3 w-3" />
                      {booking.user.name}
                    </div>
                    <div className="flex items-center gap-1 font-medium">
                      <DollarSign className="h-3 w-3" />
                      ${booking.totalPrice.toFixed(2)}
                    </div>
                  </div>
                </div>
              )) || (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No appointments scheduled for today
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Overview</CardTitle>
          <CardDescription>
            All appointments for {format(now, 'MMMM yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(bookingsByDate)
              .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
              .map(([dateStr, dateBookings]) => (
                <div key={dateStr} className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {format(new Date(dateStr), 'EEEE, MMMM d')}
                  </h3>
                  <div className="grid gap-2">
                    {dateBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-sm">
                            <span className="font-medium">
                              {format(booking.startTime, 'h:mm a')}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{booking.service.name}</p>
                            <p className="text-xs text-muted-foreground">{booking.user.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
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
                          <Link href={`/business/bookings/${booking.id}`}>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}