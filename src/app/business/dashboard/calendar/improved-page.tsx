'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek, isSameMonth, addMonths, subMonths, startOfDay, endOfDay, addDays, isToday } from "date-fns"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, DollarSign, Phone, Loader2, CheckCircle, XCircle, AlertCircle, TrendingUp, Calendar, Scissors, Palette, Sparkles, Heart, Activity } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

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
    category?: string
  }
  user: {
    id: string
    name: string
    email: string
    phone: string | null
  }
}

type ViewMode = 'month' | 'week' | 'day'

// Service category icons
const serviceIcons: Record<string, React.ReactNode> = {
  'hair': <Scissors className="w-4 h-4" />,
  'nails': <Palette className="w-4 h-4" />,
  'makeup': <Sparkles className="w-4 h-4" />,
  'spa': <Heart className="w-4 h-4" />,
  'wellness': <Activity className="w-4 h-4" />,
  'default': <Calendar className="w-4 h-4" />
}

// Status color schemes with gradients
const statusStyles = {
  'CONFIRMED': {
    bg: 'bg-gradient-to-r from-blue-500/10 to-blue-600/10',
    border: 'border-blue-500/20',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: <CheckCircle className="w-3 h-3" />
  },
  'PENDING': {
    bg: 'bg-gradient-to-r from-amber-500/10 to-yellow-600/10',
    border: 'border-amber-500/20',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: <AlertCircle className="w-3 h-3" />
  },
  'COMPLETED': {
    bg: 'bg-gradient-to-r from-green-500/10 to-emerald-600/10',
    border: 'border-green-500/20',
    text: 'text-green-700',
    badge: 'bg-green-100 text-green-700 border-green-200',
    icon: <CheckCircle className="w-3 h-3" />
  },
  'CANCELLED': {
    bg: 'bg-gradient-to-r from-gray-300/10 to-gray-400/10',
    border: 'border-gray-300/20',
    text: 'text-gray-500 line-through',
    badge: 'bg-gray-100 text-gray-500 border-gray-200',
    icon: <XCircle className="w-3 h-3" />
  }
}

export default function ImprovedCalendarPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // Calculate stats for the header
  const calculateStats = () => {
    const today = new Date()
    const todayBookings = bookings.filter(b => isSameDay(new Date(b.date), today))
    const confirmedToday = todayBookings.filter(b => b.status === 'CONFIRMED').length
    const pendingToday = todayBookings.filter(b => b.status === 'PENDING').length
    const revenue = todayBookings
      .filter(b => b.status !== 'CANCELLED')
      .reduce((sum, b) => sum + b.totalPrice, 0)

    return { confirmedToday, pendingToday, revenue, totalToday: todayBookings.length }
  }

  const stats = calculateStats()

  // Calculate date ranges based on view mode
  const getDateRange = () => {
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
  }

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
        setBookings(data.bookings)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        console.error('Error fetching bookings:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [currentDate, viewMode]) // eslint-disable-line react-hooks/exhaustive-deps

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

  // Render appointment card
  const AppointmentCard = ({ booking, compact = false }: { booking: Booking; compact?: boolean }) => {
    const status = statusStyles[booking.status as keyof typeof statusStyles] || statusStyles.PENDING
    const serviceCategory = booking.service.category?.toLowerCase() || 'default'
    const icon = serviceIcons[serviceCategory] || serviceIcons.default

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ scale: 1.02 }}
        className={cn(
          "relative group cursor-pointer rounded-lg border p-3 transition-all",
          status.bg,
          status.border,
          "hover:shadow-md hover:border-opacity-40"
        )}
        onClick={(e) => {
          e.stopPropagation()
          setSelectedBooking(booking)
        }}
      >
        {compact ? (
          <div className="flex items-center gap-2">
            <div className={cn("p-1 rounded", status.badge)}>
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn("text-sm font-medium truncate", status.text)}>
                {format(new Date(booking.startTime), 'h:mm a')}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {booking.service.name}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className={cn("p-1.5 rounded-md", status.badge)}>
                  {icon}
                </div>
                <div>
                  <p className={cn("font-medium", status.text)}>
                    {booking.service.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(booking.startTime), 'h:mm a')} - {format(new Date(booking.endTime), 'h:mm a')}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className={cn("text-xs", status.badge)}>
                {status.icon}
                <span className="ml-1">{booking.status}</span>
              </Badge>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <User className="w-3 h-3" />
                <span>{booking.user.name}</span>
              </div>
              <span className="font-medium">${booking.totalPrice.toFixed(2)}</span>
            </div>

            {/* Quick actions on hover */}
            <div className="absolute inset-x-3 -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-white rounded-md shadow-lg border p-1 flex gap-1">
                {booking.status === 'PENDING' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleConfirmBooking(booking)
                    }}
                  >
                    Confirm
                  </Button>
                )}
                {booking.status === 'CONFIRMED' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCompleteBooking(booking)
                    }}
                  >
                    Complete
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedBooking(booking)
                    setShowCancelDialog(true)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    )
  }

  // Render month view with improved design
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    return (
      <div>
        {/* Week day headers */}
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            const dateKey = format(day, 'yyyy-MM-dd')
            const dayBookings = bookingsByDate[dateKey] || []
            const isCurrentMonth = isSameMonth(day, monthStart)
            const isSelected = isSameDay(day, selectedDate)
            const hasBookings = dayBookings.length > 0
            
            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  "relative min-h-[120px] p-2 rounded-lg border cursor-pointer transition-all",
                  !isCurrentMonth && "opacity-50 bg-gray-50/50",
                  isToday(day) && "bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200",
                  isSelected && "ring-2 ring-indigo-500 ring-offset-2",
                  hasBookings && "border-gray-300",
                  !hasBookings && "border-gray-200",
                  "hover:shadow-md hover:border-gray-300"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={cn(
                    "text-sm font-medium",
                    !isCurrentMonth && "text-muted-foreground",
                    isToday(day) && "text-indigo-600 font-bold"
                  )}>
                    {format(day, 'd')}
                  </span>
                  {dayBookings.length > 0 && (
                    <Badge variant="secondary" className="text-xs h-5 px-1.5">
                      {dayBookings.length}
                    </Badge>
                  )}
                </div>
                
                {/* Show appointments */}
                <div className="space-y-1">
                  <AnimatePresence>
                    {dayBookings.slice(0, 2).map((booking) => (
                      <AppointmentCard key={booking.id} booking={booking} compact />
                    ))}
                  </AnimatePresence>
                  {dayBookings.length > 2 && (
                    <p className="text-xs text-center text-muted-foreground mt-1">
                      +{dayBookings.length - 2} more
                    </p>
                  )}
                </div>

                {/* Revenue indicator */}
                {dayBookings.length > 0 && (
                  <div className="absolute bottom-1 right-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      ${dayBookings
                        .filter(b => b.status !== 'CANCELLED')
                        .reduce((sum, b) => sum + b.totalPrice, 0)
                        .toFixed(0)}
                    </p>
                  </div>
                )}
              </motion.div>
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
    const hours = Array.from({ length: 13 }, (_, i) => i + 7) // 7 AM to 7 PM

    return (
      <div>
        {/* Day headers */}
        <div className="grid grid-cols-8 gap-1 mb-2 sticky top-0 bg-background z-10">
          <div className="text-center text-sm font-medium text-muted-foreground p-2">
            Time
          </div>
          {weekDays.map((day) => {
            const isSelected = isSameDay(day, selectedDate)
            return (
              <div
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  "text-center p-2 rounded-lg cursor-pointer transition-all",
                  isToday(day) && "bg-gradient-to-br from-indigo-50 to-purple-50",
                  isSelected && "ring-2 ring-indigo-500",
                  "hover:bg-gray-50"
                )}
              >
                <div className="text-sm font-medium text-muted-foreground">
                  {format(day, 'EEE')}
                </div>
                <div className={cn(
                  "text-lg font-semibold",
                  isToday(day) && "text-indigo-600"
                )}>
                  {format(day, 'd')}
                </div>
              </div>
            )
          })}
        </div>

        {/* Time grid */}
        <ScrollArea className="h-[600px]">
          <div className="min-w-[800px]">
            {hours.map((hour) => (
              <div key={hour} className="grid grid-cols-8 gap-1">
                <div className="text-right text-xs text-muted-foreground p-2 pr-4">
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
                      className="relative min-h-[80px] border rounded-lg p-1"
                    >
                      <AnimatePresence>
                        {hourBookings.map((booking) => (
                          <AppointmentCard key={booking.id} booking={booking} />
                        ))}
                      </AnimatePresence>
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
    const hours = Array.from({ length: 13 }, (_, i) => i + 7) // 7 AM to 7 PM
    const dateKey = format(currentDate, 'yyyy-MM-dd')
    const dayBookings = bookingsByDate[dateKey] || []

    return (
      <ScrollArea className="h-[700px]">
        <div className="min-w-[600px] space-y-1">
          {hours.map((hour) => {
            const hourBookings = dayBookings.filter(booking => {
              const bookingHour = new Date(booking.startTime).getHours()
              return bookingHour === hour
            })

            return (
              <div key={hour} className="flex gap-4">
                <div className="w-20 text-right text-sm text-muted-foreground py-3">
                  {format(new Date().setHours(hour, 0), 'h a')}
                </div>
                <div className="flex-1 min-h-[100px] border rounded-lg p-2 relative">
                  <AnimatePresence>
                    {hourBookings.map((booking) => (
                      <AppointmentCard key={booking.id} booking={booking} />
                    ))}
                  </AnimatePresence>
                  {hourBookings.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-xs text-muted-foreground">Available</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 h-[600px] bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-[600px] bg-gray-100 rounded-lg animate-pulse" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-2">{error}</p>
          <Button onClick={() => router.refresh()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Calendar</h1>
            <p className="text-indigo-100 mt-1">Manage your appointments and schedule</p>
          </div>
          <Button
            variant="secondary"
            size="lg"
            className="bg-white/20 hover:bg-white/30 text-white border-0"
          >
            <Calendar className="mr-2 h-5 w-5" />
            Add Booking
          </Button>
        </div>
        
        {/* Today's stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm">Today's Bookings</p>
                <p className="text-2xl font-bold">{stats.totalToday}</p>
              </div>
              <Calendar className="h-8 w-8 text-indigo-200" />
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm">Confirmed</p>
                <p className="text-2xl font-bold">{stats.confirmedToday}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-300" />
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm">Pending</p>
                <p className="text-2xl font-bold">{stats.pendingToday}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-300" />
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm">Today&apos;s Revenue</p>
                <p className="text-2xl font-bold">${stats.revenue.toFixed(0)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-indigo-200" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar View - Takes up 2 columns */}
        <Card className="lg:col-span-2 shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={goToPrevious}
                  className="hover:bg-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-xl font-semibold">
                  {viewMode === 'month' && format(currentDate, 'MMMM yyyy')}
                  {viewMode === 'week' && `Week of ${format(startOfWeek(currentDate), 'MMM d')}`}
                  {viewMode === 'day' && format(currentDate, 'EEEE, MMMM d')}
                </h2>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={goToNext}
                  className="hover:bg-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={goToToday}
                  className="hidden sm:flex"
                >
                  Today
                </Button>
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                  <TabsList className="bg-white">
                    <TabsTrigger value="day">Day</TabsTrigger>
                    <TabsTrigger value="week">Week</TabsTrigger>
                    <TabsTrigger value="month">Month</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={viewMode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {viewMode === 'month' && renderMonthView()}
                {viewMode === 'week' && renderWeekView()}
                {viewMode === 'day' && renderDayView()}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Selected Date/Booking Details */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100/50">
            <CardTitle className="text-lg">
              {selectedBooking ? 'Booking Details' : format(selectedDate, 'EEEE, MMMM d')}
            </CardTitle>
            {!selectedBooking && (
              <CardDescription>
                {bookingsByDate[format(selectedDate, 'yyyy-MM-dd')]?.length || 0} appointment{bookingsByDate[format(selectedDate, 'yyyy-MM-dd')]?.length !== 1 ? 's' : ''}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="p-4">
            <ScrollArea className="h-[500px] pr-4">
              <AnimatePresence mode="wait">
                {selectedBooking ? (
                  <motion.div
                    key="booking-details"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-sm",
                          statusStyles[selectedBooking.status as keyof typeof statusStyles]?.badge
                        )}
                      >
                        {statusStyles[selectedBooking.status as keyof typeof statusStyles]?.icon}
                        <span className="ml-1">{selectedBooking.status}</span>
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedBooking(null)}
                      >
                        Back
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4">
                        <h3 className="font-semibold text-lg mb-2">{selectedBooking.service.name}</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-indigo-600" />
                            <span>{format(new Date(selectedBooking.date), 'MMMM d, yyyy')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-indigo-600" />
                            <span>
                              {format(new Date(selectedBooking.startTime), 'h:mm a')} - 
                              {format(new Date(selectedBooking.endTime), 'h:mm a')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-indigo-600" />
                            <span className="font-semibold">${selectedBooking.totalPrice.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4 space-y-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Customer Information
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p className="font-medium">{selectedBooking.user.name}</p>
                          <p className="text-muted-foreground">{selectedBooking.user.email}</p>
                          {selectedBooking.user.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3" />
                              <span>{selectedBooking.user.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        {selectedBooking.status === 'PENDING' && (
                          <>
                            <Button
                              onClick={() => handleConfirmBooking(selectedBooking)}
                              disabled={actionLoading}
                              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                            >
                              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                              Confirm Booking
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
                        {selectedBooking.status === 'CONFIRMED' && (
                          <>
                            <Button
                              onClick={() => handleCompleteBooking(selectedBooking)}
                              disabled={actionLoading}
                              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
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
                            View All Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="day-bookings"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-3"
                  >
                    {bookingsByDate[format(selectedDate, 'yyyy-MM-dd')]?.length > 0 ? (
                      bookingsByDate[format(selectedDate, 'yyyy-MM-dd')]
                        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                        .map((booking) => (
                          <div key={booking.id} className="cursor-pointer">
                            <AppointmentCard booking={booking} />
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-12">
                        <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">
                          No appointments scheduled
                        </p>
                        <Button variant="outline" className="mt-4">
                          Add Appointment
                        </Button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

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
            <p className="font-medium">{selectedBooking?.service.name}</p>
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