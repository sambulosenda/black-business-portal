import { requireRole } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek, isSameMonth, addMonths, subMonths } from "date-fns"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, DollarSign, MapPin, Phone } from "lucide-react"
import Link from "next/link"

export default async function CalendarPage() {
  const session = await requireRole("BUSINESS_OWNER")
  
  // Get the business for this owner
  const business = await prisma.business.findFirst({
    where: {
      userId: session.user.id,
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
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  // Get all bookings for the current month view
  const bookings = await prisma.booking.findMany({
    where: {
      businessId: business.id,
      date: {
        gte: calendarStart,
        lte: calendarEnd,
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

  // Get all days to display in calendar
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Selected date for detail view (default to today)
  const selectedDate = now
  const selectedDateKey = format(selectedDate, 'yyyy-MM-dd')
  const selectedDateBookings = bookingsByDate[selectedDateKey] || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground">View and manage your appointments</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Large Calendar View - Takes up 2 columns */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">
                {format(monthStart, 'MMMM yyyy')}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" disabled>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  Today
                </Button>
                <Button variant="outline" size="icon" disabled>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border-t">
              {/* Week day headers */}
              <div className="grid grid-cols-7 border-b">
                {weekDays.map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground border-r last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar grid */}
              <div className="grid grid-cols-7">
                {calendarDays.map((day, index) => {
                  const dateKey = format(day, 'yyyy-MM-dd')
                  const dayBookings = bookingsByDate[dateKey] || []
                  const isToday = isSameDay(day, now)
                  const isCurrentMonth = isSameMonth(day, monthStart)
                  const isSelected = isSameDay(day, selectedDate)
                  
                  return (
                    <div
                      key={index}
                      className={`
                        min-h-[120px] p-2 border-r border-b last:border-r-0
                        ${!isCurrentMonth ? 'bg-gray-50/50' : ''}
                        ${isToday ? 'bg-blue-50/50' : ''}
                        ${isSelected ? 'ring-2 ring-primary ring-inset' : ''}
                        hover:bg-gray-50 cursor-pointer transition-colors
                      `}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`
                          text-sm font-medium
                          ${!isCurrentMonth ? 'text-muted-foreground' : ''}
                          ${isToday ? 'text-primary font-bold' : ''}
                        `}>
                          {format(day, 'd')}
                        </span>
                        {dayBookings.length > 0 && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0">
                            {dayBookings.length}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Show up to 3 appointments */}
                      <div className="space-y-1">
                        {dayBookings.slice(0, 3).map((booking, bookingIndex) => (
                          <div
                            key={booking.id}
                            className={`
                              text-xs p-1 rounded truncate
                              ${booking.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' : ''}
                              ${booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : ''}
                              ${booking.status === 'CANCELLED' ? 'bg-gray-100 text-gray-500 line-through' : ''}
                              ${booking.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : ''}
                            `}
                            title={`${format(booking.startTime, 'h:mm a')} - ${booking.service.name}`}
                          >
                            <span className="font-medium">{format(booking.startTime, 'h:mm a')}</span>
                            <span className="ml-1">{booking.service.name}</span>
                          </div>
                        ))}
                        {dayBookings.length > 3 && (
                          <div className="text-xs text-muted-foreground text-center">
                            +{dayBookings.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Day Details - Takes up 1 column */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {format(selectedDate, 'EEEE, MMMM d')}
            </CardTitle>
            <CardDescription>
              {selectedDateBookings.length} appointment{selectedDateBookings.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-3">
                {selectedDateBookings.length > 0 ? (
                  selectedDateBookings.map((booking) => (
                    <Card key={booking.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{booking.service.name}</h4>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {format(booking.startTime, 'h:mm a')} - {format(booking.endTime, 'h:mm a')}
                            </div>
                          </div>
                          <Badge
                            variant={
                              booking.status === 'CONFIRMED' ? 'default' :
                              booking.status === 'PENDING' ? 'warning' :
                              booking.status === 'CANCELLED' ? 'destructive' :
                              booking.status === 'COMPLETED' ? 'success' :
                              'secondary'
                            }
                          >
                            {booking.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span>{booking.user.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span>{booking.user.phone || 'No phone'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium">${booking.totalPrice.toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Link href={`/business/bookings/${booking.id}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              View Details
                            </Button>
                          </Link>
                          {booking.status === 'PENDING' && (
                            <Button variant="default" size="sm" className="flex-1">
                              Confirm
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No appointments scheduled for this day
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-100 rounded" />
              <span>Confirmed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-100 rounded" />
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-100 rounded" />
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-100 rounded" />
              <span>Cancelled</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}