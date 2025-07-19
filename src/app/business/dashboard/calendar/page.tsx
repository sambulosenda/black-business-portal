'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek, isSameMonth, addMonths, subMonths, startOfDay, endOfDay, addDays } from "date-fns"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, DollarSign, Phone, Loader2, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

interface Booking {
  id: string
  date: Date
  startTime: Date
  endTime: Date
  status: string
  totalPrice: number
  service: {
    id: string
    name: string
  }
  user: {
    id: string
    name: string
    email: string
    phone: string | null
  }
}

type ViewMode = 'month' | 'week' | 'day'

export default function CalendarPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  // Set to July 2025 to see the seeded bookings
  const [currentDate, setCurrentDate] = useState(new Date('2025-07-01'))
  const [selectedDate, setSelectedDate] = useState(new Date('2025-07-01'))
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  // const [viewChanging, setViewChanging] = useState(false) // Commented out - may be used later

  // Calculate date ranges based on view mode
  const getDateRange = React.useCallback(() => {
    switch (viewMode) {
      case 'day':
        return {
          start: startOfDay(currentDate),
          end: endOfDay(currentDate)
        }
      case 'week':
        return {
          start: startOfWeek(currentDate),
          end: endOfWeek(currentDate)
        }
      case 'month':
      default:
        const monthStart = startOfMonth(currentDate)
        const monthEnd = endOfMonth(currentDate)
        return {
          start: startOfWeek(monthStart),
          end: endOfWeek(monthEnd)
        }
    }
  }, [viewMode, currentDate])

  // Fetch bookings for the current view
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const { start, end } = getDateRange()
        const response = await fetch(`/api/business/bookings?startDate=${start.toISOString()}&endDate=${end.toISOString()}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch bookings')
        }
        
        const data = await response.json()
        setBookings(data.bookings || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        console.error('Error fetching bookings:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [currentDate, viewMode, getDateRange])

  // Navigation handlers
  const goToPrevious = () => {
    switch (viewMode) {
      case 'day':
        setCurrentDate(addDays(currentDate, -1))
        break
      case 'week':
        setCurrentDate(addDays(currentDate, -7))
        break
      case 'month':
        setCurrentDate(subMonths(currentDate, 1))
        break
    }
  }

  const goToNext = () => {
    switch (viewMode) {
      case 'day':
        setCurrentDate(addDays(currentDate, 1))
        break
      case 'week':
        setCurrentDate(addDays(currentDate, 7))
        break
      case 'month':
        setCurrentDate(addMonths(currentDate, 1))
        break
    }
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(today)
  }

  // Booking management handlers
  const handleConfirmBooking = async (booking: Booking) => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/business/bookings/${booking.id}/confirm`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to confirm booking')
      }

      // Update local state
      setBookings(bookings.map(b => 
        b.id === booking.id ? { ...b, status: 'CONFIRMED' } : b
      ))
      
      if (selectedBooking?.id === booking.id) {
        setSelectedBooking({ ...selectedBooking, status: 'CONFIRMED' })
      }
    } catch (err) {
      console.error('Error confirming booking:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleCompleteBooking = async (booking: Booking) => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/business/bookings/${booking.id}/complete`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to complete booking')
      }

      // Update local state
      setBookings(bookings.map(b => 
        b.id === booking.id ? { ...b, status: 'COMPLETED' } : b
      ))
      
      if (selectedBooking?.id === booking.id) {
        setSelectedBooking({ ...selectedBooking, status: 'COMPLETED' })
      }
    } catch (err) {
      console.error('Error completing booking:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancelBooking = async () => {
    if (!selectedBooking) return
    
    setActionLoading(true)
    try {
      const response = await fetch(`/api/business/bookings/${selectedBooking.id}/cancel`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to cancel booking')
      }

      // Update local state
      setBookings(bookings.map(b => 
        b.id === selectedBooking.id ? { ...b, status: 'CANCELLED' } : b
      ))
      
      setSelectedBooking({ ...selectedBooking, status: 'CANCELLED' })
      setShowCancelDialog(false)
    } catch (err) {
      console.error('Error cancelling booking:', err)
    } finally {
      setActionLoading(false)
    }
  }

  // Group bookings by date
  const bookingsByDate = bookings.reduce((acc, booking) => {
    const dateKey = format(new Date(booking.date), 'yyyy-MM-dd')
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(booking)
    return acc
  }, {} as Record<string, Booking[]>)

  // Render different views
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    return (
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
            const isToday = isSameDay(day, new Date())
            const isCurrentMonth = isSameMonth(day, monthStart)
            const isSelected = isSameDay(day, selectedDate)
            
            return (
              <div
                key={index}
                onClick={() => setSelectedDate(day)}
                className={`
                  min-h-[120px] p-2 border-r border-b border-gray-200 last:border-r-0
                  ${!isCurrentMonth ? 'bg-gray-50/50' : ''}
                  ${isToday ? 'bg-indigo-50/50' : ''}
                  ${isSelected ? 'ring-2 ring-indigo-600 ring-inset' : ''}
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
                    <Badge variant="default" className="text-xs px-1.5 py-0">
                      {dayBookings.length}
                    </Badge>
                  )}
                </div>
                
                {/* Show up to 3 appointments */}
                <div className="space-y-1">
                  {dayBookings.slice(0, 3).map((booking) => (
                    <div
                      key={booking.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedBooking(booking)
                      }}
                      className={`
                        text-xs p-1 rounded truncate cursor-pointer
                        ${booking.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : ''}
                        ${booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : ''}
                        ${booking.status === 'CANCELLED' ? 'bg-gray-100 text-gray-500 line-through' : ''}
                        ${booking.status === 'COMPLETED' ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}
                      `}
                      title={`${format(new Date(booking.startTime), 'h:mm a')} - ${booking.service.name}`}
                    >
                      <span className="font-medium">{format(new Date(booking.startTime), 'h:mm a')}</span>
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
    )
  }

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate)
    const weekEnd = endOfWeek(currentDate)
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })
    const hours = Array.from({ length: 24 }, (_, i) => i)

    return (
      <div className="border-t border-gray-200">
        {/* Day headers */}
        <div className="grid grid-cols-8 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="p-2 text-center text-sm font-semibold text-gray-700 border-r border-gray-200 bg-gray-50">
            Time
          </div>
          {weekDays.map((day) => {
            const isToday = isSameDay(day, new Date())
            const isSelected = isSameDay(day, selectedDate)
            return (
              <div
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`
                  p-2 text-center text-sm font-medium border-r border-gray-200 last:border-r-0 cursor-pointer
                  ${isToday ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'}
                  ${isSelected ? 'ring-2 ring-indigo-600 ring-inset' : ''}
                  hover:bg-gray-50
                `}
              >
                <div>{format(day, 'EEE')}</div>
                <div className={`text-lg ${isToday ? 'font-bold' : ''}`}>{format(day, 'd')}</div>
              </div>
            )
          })}
        </div>

        {/* Time grid */}
        <ScrollArea className="h-[600px]">
          <div>
            {hours.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b border-gray-200">
                <div className="p-2 text-xs text-gray-500 border-r border-gray-200 bg-gray-50">
                  {format(new Date().setHours(hour, 0), 'h a')}
                </div>
                {weekDays.map((day) => {
                  const dateKey = format(day, 'yyyy-MM-dd')
                  const dayBookings = bookingsByDate[dateKey] || []
                  const hourBookings = dayBookings.filter(booking => {
                    const bookingHour = new Date(booking.startTime).getHours()
                    return bookingHour === hour
                  })

                  return (
                    <div
                      key={`${day.toISOString()}-${hour}`}
                      className="min-h-[60px] p-1 border-r border-gray-200 last:border-r-0 relative"
                    >
                      {hourBookings.map((booking) => (
                        <div
                          key={booking.id}
                          onClick={() => setSelectedBooking(booking)}
                          className={`
                            absolute left-1 right-1 p-1 rounded text-xs cursor-pointer shadow-sm border
                            ${booking.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200' : ''}
                            ${booking.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-200' : ''}
                            ${booking.status === 'CANCELLED' ? 'bg-gray-50 text-gray-500 line-through border-gray-200' : ''}
                            ${booking.status === 'COMPLETED' ? 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200' : ''}
                          `}
                          style={{
                            top: `${(new Date(booking.startTime).getMinutes() / 60) * 100}%`,
                            height: `${((new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / (60 * 60 * 1000)) * 60}px`,
                            minHeight: '30px'
                          }}
                        >
                          <div className="font-medium truncate">{booking.service.name}</div>
                          <div className="truncate">{booking.user.name}</div>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    )
  }

  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i)
    const dateKey = format(currentDate, 'yyyy-MM-dd')
    const dayBookings = bookingsByDate[dateKey] || []

    return (
      <div className="border-t border-gray-200">
        <ScrollArea className="h-[700px]">
          <div className="min-w-[600px]">
            {hours.map((hour) => {
              const hourBookings = dayBookings.filter(booking => {
                const bookingHour = new Date(booking.startTime).getHours()
                return bookingHour === hour
              })

              return (
                <div key={hour} className="flex border-b border-gray-200">
                  <div className="w-20 p-3 text-sm text-gray-500 border-r border-gray-200 bg-gray-50 flex-shrink-0">
                    {format(new Date().setHours(hour, 0), 'h a')}
                  </div>
                  <div className="flex-1 min-h-[80px] p-2 relative">
                    {hourBookings.map((booking) => (
                      <div
                        key={booking.id}
                        onClick={() => setSelectedBooking(booking)}
                        className={`
                          absolute left-2 right-2 p-3 rounded cursor-pointer shadow-sm border
                          ${booking.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200' : ''}
                          ${booking.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-200' : ''}
                          ${booking.status === 'CANCELLED' ? 'bg-gray-50 text-gray-500 line-through border-gray-200' : ''}
                          ${booking.status === 'COMPLETED' ? 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200' : ''}
                        `}
                        style={{
                          top: `${(new Date(booking.startTime).getMinutes() / 60) * 80}px`,
                          minHeight: `${((new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / (60 * 60 * 1000)) * 80}px`
                        }}
                      >
                        <div className="font-medium">{booking.service.name}</div>
                        <div className="text-sm mt-1">{booking.user.name}</div>
                        <div className="text-xs mt-1">
                          {format(new Date(booking.startTime), 'h:mm a')} - {format(new Date(booking.endTime), 'h:mm a')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </div>
    )
  }

  // Remove the early return for loading state to allow the page to render
  // We'll handle loading state within the calendar card instead

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive mb-2">{error}</p>
          <Button onClick={() => router.refresh()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Calendar</h1>
        <p className="text-gray-600 mt-1">View and manage your appointments</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar View - Takes up 2 columns */}
        <Card className="lg:col-span-2 border border-gray-200 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="px-6 py-4 border-b border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <CardTitle className="text-2xl font-semibold text-gray-900">
                {viewMode === 'month' && format(currentDate, 'MMMM yyyy')}
                {viewMode === 'week' && `Week of ${format(startOfWeek(currentDate), 'MMM d, yyyy')}`}
                {viewMode === 'day' && format(currentDate, 'EEEE, MMMM d, yyyy')}
              </CardTitle>
              <div className="flex items-center gap-4">
                {/* View mode toggle */}
                <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
                  <Button
                    variant={viewMode === 'day' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('day')}
                    className={viewMode === 'day' ? 
                      'bg-white text-indigo-600 shadow-sm border border-gray-200 px-4 py-1.5' : 
                      'hover:bg-gray-100 text-gray-600 px-4 py-1.5 border-transparent'
                    }
                  >
                    Day
                  </Button>
                  <Button
                    variant={viewMode === 'week' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('week')}
                    className={viewMode === 'week' ? 
                      'bg-white text-indigo-600 shadow-sm border border-gray-200 px-4 py-1.5 mx-1' : 
                      'hover:bg-gray-100 text-gray-600 px-4 py-1.5 mx-1 border-transparent'
                    }
                  >
                    Week
                  </Button>
                  <Button
                    variant={viewMode === 'month' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('month')}
                    className={viewMode === 'month' ? 
                      'bg-white text-indigo-600 shadow-sm border border-gray-200 px-4 py-1.5' : 
                      'hover:bg-gray-100 text-gray-600 px-4 py-1.5 border-transparent'
                    }
                  >
                    Month
                  </Button>
                </div>
                
                {/* Navigation controls */}
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={goToPrevious}
                    title="Previous"
                    className="border-gray-200 hover:bg-gray-50 hover:border-gray-300 h-9 w-9 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4 text-gray-600" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={goToToday}
                    className="border-gray-200 hover:bg-gray-50 hover:border-gray-300 px-4 h-9 font-medium text-gray-700 transition-colors"
                  >
                    Today
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={goToNext}
                    title="Next"
                    className="border-gray-200 hover:bg-gray-50 hover:border-gray-300 h-9 w-9 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4 text-gray-600" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-[600px]">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
            ) : (
              <>
                {viewMode === 'month' && renderMonthView()}
                {viewMode === 'week' && renderWeekView()}
                {viewMode === 'day' && renderDayView()}
              </>
            )}
          </CardContent>
        </Card>

        {/* Selected Booking Details - Takes up 1 column */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-lg">
              {selectedBooking ? 'Booking Details' : format(selectedDate, 'EEEE, MMMM d')}
            </CardTitle>
            {!selectedBooking && (
              <CardDescription>
                {bookingsByDate[format(selectedDate, 'yyyy-MM-dd')]?.length || 0} appointment{bookingsByDate[format(selectedDate, 'yyyy-MM-dd')]?.length !== 1 ? 's' : ''}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              {selectedBooking ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        selectedBooking.status === 'CONFIRMED' ? 'default' :
                        selectedBooking.status === 'PENDING' ? 'warning' :
                        selectedBooking.status === 'CANCELLED' ? 'destructive' :
                        selectedBooking.status === 'COMPLETED' ? 'success' :
                        'default'
                      }
                      className="text-sm"
                    >
                      {selectedBooking.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedBooking(null)}
                    >
                      Back to day view
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">{selectedBooking.service.name}</h3>
                      <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{format(new Date(selectedBooking.date), 'MMMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{format(new Date(selectedBooking.startTime), 'h:mm a')} - {format(new Date(selectedBooking.endTime), 'h:mm a')}</span>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 space-y-3">
                      <h4 className="font-medium">Customer Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedBooking.user.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedBooking.user.phone || 'No phone provided'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">${selectedBooking.totalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {selectedBooking.status === 'PENDING' && (
                        <>
                          <Button
                            onClick={() => handleConfirmBooking(selectedBooking)}
                            disabled={actionLoading}
                            className="w-full"
                          >
                            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                            Confirm Booking
                          </Button>
                          <Button
                            onClick={() => setShowCancelDialog(true)}
                            disabled={actionLoading}
                            variant="destructive"
                            className="w-full"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancel Booking
                          </Button>
                        </>
                      )}
                      {selectedBooking.status === 'CONFIRMED' && (
                        <>
                          <Button
                            onClick={() => handleCompleteBooking(selectedBooking)}
                            disabled={actionLoading}
                            className="w-full"
                          >
                            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                            Mark as Completed
                          </Button>
                          <Button
                            onClick={() => setShowCancelDialog(true)}
                            disabled={actionLoading}
                            variant="outline"
                            className="w-full"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancel Booking
                          </Button>
                        </>
                      )}
                      <Link href={`/business/dashboard/bookings`} className="w-full">
                        <Button variant="outline" className="w-full">
                          View Full Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookingsByDate[format(selectedDate, 'yyyy-MM-dd')]?.length > 0 ? (
                    bookingsByDate[format(selectedDate, 'yyyy-MM-dd')].map((booking) => (
                      <Card 
                        key={booking.id} 
                        className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => setSelectedBooking(booking)}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{booking.service.name}</h4>
                              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {format(new Date(booking.startTime), 'h:mm a')} - {format(new Date(booking.endTime), 'h:mm a')}
                              </div>
                            </div>
                            <Badge
                              variant={
                                booking.status === 'CONFIRMED' ? 'default' :
                                booking.status === 'PENDING' ? 'warning' :
                                booking.status === 'CANCELLED' ? 'destructive' :
                                booking.status === 'COMPLETED' ? 'success' :
                                'default'
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
                              <DollarSign className="h-3 w-3 text-muted-foreground" />
                              <span className="font-medium">${booking.totalPrice.toFixed(2)}</span>
                            </div>
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
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Legend */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-sm font-semibold text-gray-900">Legend</CardTitle>
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

      {/* Cancel Booking Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <p className="text-sm font-medium">{selectedBooking?.service.name}</p>
            <p className="text-sm text-muted-foreground">{selectedBooking?.user.name}</p>
            <p className="text-sm text-muted-foreground">
              {selectedBooking && format(new Date(selectedBooking.startTime), 'MMM d, yyyy h:mm a')}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Booking
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelBooking}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Cancel Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}