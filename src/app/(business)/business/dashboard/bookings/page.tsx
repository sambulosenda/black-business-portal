'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import {
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Mail,
  Phone,
  Search,
  User,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Booking {
  id: string
  date: string
  startTime: string
  endTime: string
  status: string
  totalPrice: number
  notes: string | null
  user: {
    name: string
    email: string
    phone: string | null
  }
  service: {
    name: string
    duration: number
  }
}

export default function BusinessBookingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    if (session.user.role !== 'BUSINESS_OWNER') {
      router.push('/dashboard')
      return
    }
    fetchBookings()
  }, [session, status, router])

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/business/bookings')
      if (!response.ok) throw new Error('Failed to fetch bookings')
      const data = await response.json()
      setBookings(data.bookings || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const response = await fetch(`/api/business/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) throw new Error('Failed to update booking')

      toast.success(`Booking ${status.toLowerCase()}`)
      fetchBookings()
    } catch (error) {
      console.error('Error updating booking:', error)
      toast.error('Failed to update booking')
    }
  }

  const filterBookings = (filterType: 'upcoming' | 'today' | 'past' | 'cancelled') => {
    return bookings.filter((booking) => {
      const matchesSearch =
        booking.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        false ||
        booking.service?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        false

      const bookingDate = new Date(booking.date)
      const now = new Date()

      switch (filterType) {
        case 'upcoming':
          return (
            matchesSearch &&
            bookingDate >= now &&
            !['CANCELLED', 'COMPLETED'].includes(booking.status)
          )
        case 'today':
          return (
            matchesSearch &&
            bookingDate.toDateString() === now.toDateString() &&
            !['CANCELLED'].includes(booking.status)
          )
        case 'past':
          return matchesSearch && (bookingDate < now || booking.status === 'COMPLETED')
        case 'cancelled':
          return matchesSearch && booking.status === 'CANCELLED'
        default:
          return matchesSearch
      }
    })
  }

  const getStatusBadge = (status: string) => {
    const statusText = status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ')
    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
        {statusText}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Bookings</h1>
          <p className="mt-1 text-sm text-gray-500">Manage customer appointments</p>
        </div>
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 border-gray-200 pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList className="grid w-full grid-cols-4 bg-gray-50">
          <TabsTrigger
            value="upcoming"
            className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:font-medium"
          >
            Upcoming (
            {
              bookings.filter(
                (b) =>
                  new Date(b.date) >= new Date() && !['CANCELLED', 'COMPLETED'].includes(b.status)
              ).length
            }
            )
          </TabsTrigger>
          <TabsTrigger
            value="today"
            className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:font-medium"
          >
            Today (
            {
              bookings.filter(
                (b) =>
                  new Date(b.date).toDateString() === new Date().toDateString() &&
                  b.status !== 'CANCELLED'
              ).length
            }
            )
          </TabsTrigger>
          <TabsTrigger
            value="past"
            className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:font-medium"
          >
            Past (
            {
              bookings.filter((b) => new Date(b.date) < new Date() || b.status === 'COMPLETED')
                .length
            }
            )
          </TabsTrigger>
          <TabsTrigger
            value="cancelled"
            className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:font-medium"
          >
            Cancelled ({bookings.filter((b) => b.status === 'CANCELLED').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {filterBookings('upcoming').length === 0 ? (
            <Card className="border-2 border-dashed border-gray-200">
              <CardContent className="py-12">
                <EmptyState
                  icon="calendar"
                  title="No upcoming bookings"
                  description="You don't have any upcoming bookings at the moment"
                />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filterBookings('upcoming').map((booking) => (
                <Card
                  key={booking.id}
                  className="border border-gray-200"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-3 flex items-center gap-3">
                          <h3 className="text-base font-medium text-gray-900">
                            {booking.service?.name || 'Service'}
                          </h3>
                          {getStatusBadge(booking.status)}
                        </div>

                        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-600">
                              <User className="h-4 w-4" />
                              <span>{booking.user?.name || 'Unknown Customer'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Mail className="h-4 w-4" />
                              <span>{booking.user?.email || 'No email'}</span>
                            </div>
                            {booking.user?.phone && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Phone className="h-4 w-4" />
                                <span>{booking.user.phone}</span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>{format(new Date(booking.date), 'EEEE, MMMM d, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Clock className="h-4 w-4" />
                              <span>
                                {format(new Date(booking.startTime), 'h:mm a')} -
                                {format(new Date(booking.endTime), 'h:mm a')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <DollarSign className="h-4 w-4" />
                              <span className="font-medium">${booking.totalPrice}</span>
                            </div>
                          </div>
                        </div>

                        {booking.notes && (
                          <div className="mt-3 rounded-md border border-gray-100 bg-gray-50/50 p-3">
                            <p className="text-xs text-gray-500 mb-1">Notes</p>
                            <p className="text-sm text-gray-600">{booking.notes}</p>
                          </div>
                        )}
                      </div>

                      {booking.status === 'PENDING' && new Date(booking.date) >= new Date() && (
                        <div className="ml-4 flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => updateBookingStatus(booking.id, 'CONFIRMED')}
                            className="bg-gray-900 text-white hover:bg-gray-800"
                          >
                            <CheckCircle className="mr-1 h-4 w-4" />
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateBookingStatus(booking.id, 'CANCELLED')}
                            className="border-gray-200 text-gray-600 hover:bg-gray-50"
                          >
                            <XCircle className="mr-1 h-4 w-4" />
                            Cancel
                          </Button>
                        </div>
                      )}

                      {booking.status === 'CONFIRMED' && new Date(booking.date) < new Date() && (
                        <Button
                          size="sm"
                          onClick={() => updateBookingStatus(booking.id, 'COMPLETED')}
                          className="bg-gray-900 text-white hover:bg-gray-800"
                        >
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="today">
          {filterBookings('today').length === 0 ? (
            <Card className="border-2 border-dashed border-gray-200">
              <CardContent className="py-12">
                <EmptyState
                  icon="calendar"
                  title="No bookings today"
                  description="You don't have any bookings scheduled for today"
                />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filterBookings('today').map((booking) => (
                <Card
                  key={booking.id}
                  className="border border-gray-200"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-3 flex items-center gap-3">
                          <h3 className="text-base font-medium text-gray-900">
                            {booking.service?.name || 'Service'}
                          </h3>
                          {getStatusBadge(booking.status)}
                        </div>

                        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-600">
                              <User className="h-4 w-4" />
                              <span>{booking.user?.name || 'Unknown Customer'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Mail className="h-4 w-4" />
                              <span>{booking.user?.email || 'No email'}</span>
                            </div>
                            {booking.user?.phone && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Phone className="h-4 w-4" />
                                <span>{booking.user.phone}</span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>{format(new Date(booking.date), 'EEEE, MMMM d, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Clock className="h-4 w-4" />
                              <span>
                                {format(new Date(booking.startTime), 'h:mm a')} -
                                {format(new Date(booking.endTime), 'h:mm a')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <DollarSign className="h-4 w-4" />
                              <span className="font-medium">${booking.totalPrice}</span>
                            </div>
                          </div>
                        </div>

                        {booking.notes && (
                          <div className="mt-3 rounded-md border border-gray-100 bg-gray-50/50 p-3">
                            <p className="text-xs text-gray-500 mb-1">Notes</p>
                            <p className="text-sm text-gray-600">{booking.notes}</p>
                          </div>
                        )}
                      </div>

                      {booking.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => updateBookingStatus(booking.id, 'CONFIRMED')}
                            className="bg-gray-900 text-white hover:bg-gray-800"
                          >
                            <CheckCircle className="mr-1 h-4 w-4" />
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateBookingStatus(booking.id, 'CANCELLED')}
                            className="border-gray-200 text-gray-600 hover:bg-gray-50"
                          >
                            <XCircle className="mr-1 h-4 w-4" />
                            Cancel
                          </Button>
                        </div>
                      )}

                      {booking.status === 'CONFIRMED' && new Date(booking.date) < new Date() && (
                        <Button
                          size="sm"
                          onClick={() => updateBookingStatus(booking.id, 'COMPLETED')}
                          className="bg-gray-900 text-white hover:bg-gray-800"
                        >
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {filterBookings('past').length === 0 ? (
            <Card className="border-2 border-dashed border-gray-200">
              <CardContent className="py-12">
                <EmptyState
                  icon="calendar"
                  title="No past bookings"
                  description="Past bookings will appear here"
                />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filterBookings('past').map((booking) => (
                <Card
                  key={booking.id}
                  className="border border-gray-200"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-3 flex items-center gap-3">
                          <h3 className="text-base font-medium text-gray-900">
                            {booking.service?.name || 'Service'}
                          </h3>
                          {getStatusBadge(booking.status)}
                        </div>

                        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-600">
                              <User className="h-4 w-4" />
                              <span>{booking.user?.name || 'Unknown Customer'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Mail className="h-4 w-4" />
                              <span>{booking.user?.email || 'No email'}</span>
                            </div>
                            {booking.user?.phone && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Phone className="h-4 w-4" />
                                <span>{booking.user.phone}</span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>{format(new Date(booking.date), 'EEEE, MMMM d, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Clock className="h-4 w-4" />
                              <span>
                                {format(new Date(booking.startTime), 'h:mm a')} -
                                {format(new Date(booking.endTime), 'h:mm a')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <DollarSign className="h-4 w-4" />
                              <span className="font-medium">${booking.totalPrice}</span>
                            </div>
                          </div>
                        </div>

                        {booking.notes && (
                          <div className="mt-3 rounded-md border border-gray-100 bg-gray-50/50 p-3">
                            <p className="text-xs text-gray-500 mb-1">Notes</p>
                            <p className="text-sm text-gray-600">{booking.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cancelled">
          {filterBookings('cancelled').length === 0 ? (
            <Card className="border-2 border-dashed border-gray-200">
              <CardContent className="py-12">
                <EmptyState
                  icon="calendar"
                  title="No cancelled bookings"
                  description="Cancelled bookings will appear here"
                />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filterBookings('cancelled').map((booking) => (
                <Card
                  key={booking.id}
                  className="border border-gray-200"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-3 flex items-center gap-3">
                          <h3 className="text-base font-medium text-gray-900">
                            {booking.service?.name || 'Service'}
                          </h3>
                          {getStatusBadge(booking.status)}
                        </div>

                        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-600">
                              <User className="h-4 w-4" />
                              <span>{booking.user?.name || 'Unknown Customer'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Mail className="h-4 w-4" />
                              <span>{booking.user?.email || 'No email'}</span>
                            </div>
                            {booking.user?.phone && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Phone className="h-4 w-4" />
                                <span>{booking.user.phone}</span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>{format(new Date(booking.date), 'EEEE, MMMM d, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Clock className="h-4 w-4" />
                              <span>
                                {format(new Date(booking.startTime), 'h:mm a')} -
                                {format(new Date(booking.endTime), 'h:mm a')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <DollarSign className="h-4 w-4" />
                              <span className="font-medium">${booking.totalPrice}</span>
                            </div>
                          </div>
                        </div>

                        {booking.notes && (
                          <div className="mt-3 rounded-md border border-gray-100 bg-gray-50/50 p-3">
                            <p className="text-xs text-gray-500 mb-1">Notes</p>
                            <p className="text-sm text-gray-600">{booking.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
