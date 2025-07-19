'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/empty-state'
import { 
  Calendar, 
  Clock, 
  User, 
  Search,
  CheckCircle,
  XCircle,
  DollarSign,
  Phone,
  Mail
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

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
        body: JSON.stringify({ status })
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
    return bookings.filter(booking => {
      const matchesSearch = (booking.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                           (booking.service?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
      
      const bookingDate = new Date(booking.date)
      const now = new Date()
      
      switch (filterType) {
        case 'upcoming':
          return matchesSearch && bookingDate >= now && !['CANCELLED', 'COMPLETED'].includes(booking.status)
        case 'today':
          return matchesSearch && 
                 bookingDate.toDateString() === now.toDateString() && 
                 !['CANCELLED'].includes(booking.status)
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
    switch (status) {
      case 'CONFIRMED':
        return <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">Confirmed</Badge>
      case 'PENDING':
        return <Badge variant="outline" className="border-yellow-200 bg-yellow-50 text-yellow-700">Pending</Badge>
      case 'COMPLETED':
        return <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">Completed</Badge>
      case 'CANCELLED':
        return <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">Cancelled</Badge>
      case 'NO_SHOW':
        return <Badge variant="outline" className="border-gray-200 bg-gray-50 text-gray-700">No Show</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Bookings</h1>
          <p className="text-gray-600 mt-1">Manage your customer appointments</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64 border-gray-300"
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100">
          <TabsTrigger value="upcoming" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600">
            Upcoming ({bookings.filter(b => new Date(b.date) >= new Date() && !['CANCELLED', 'COMPLETED'].includes(b.status)).length})
          </TabsTrigger>
          <TabsTrigger value="today" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600">
            Today ({bookings.filter(b => new Date(b.date).toDateString() === new Date().toDateString() && b.status !== 'CANCELLED').length})
          </TabsTrigger>
          <TabsTrigger value="past" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600">
            Past ({bookings.filter(b => new Date(b.date) < new Date() || b.status === 'COMPLETED').length})
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600">
            Cancelled ({bookings.filter(b => b.status === 'CANCELLED').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {filterBookings('upcoming').length === 0 ? (
            <Card className="border-2 border-dashed border-gray-300">
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
                <Card key={booking.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">{booking.service?.name || 'Unknown Service'}</h3>
                          {getStatusBadge(booking.status)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Notes</p>
                            <p className="text-sm text-gray-700">{booking.notes}</p>
                          </div>
                        )}
                      </div>
                      
                      {booking.status === 'PENDING' && new Date(booking.date) >= new Date() && (
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            onClick={() => updateBookingStatus(booking.id, 'CONFIRMED')}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateBookingStatus(booking.id, 'CANCELLED')}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      )}
                      
                      {booking.status === 'CONFIRMED' && new Date(booking.date) < new Date() && (
                        <Button
                          size="sm"
                          onClick={() => updateBookingStatus(booking.id, 'COMPLETED')}
                          className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
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
            <Card className="border-2 border-dashed border-gray-300">
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
                <Card key={booking.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">{booking.service?.name || 'Unknown Service'}</h3>
                          {getStatusBadge(booking.status)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Notes</p>
                            <p className="text-sm text-gray-700">{booking.notes}</p>
                          </div>
                        )}
                      </div>
                      
                      {booking.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => updateBookingStatus(booking.id, 'CONFIRMED')}
                            className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateBookingStatus(booking.id, 'CANCELLED')}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      )}
                      
                      {booking.status === 'CONFIRMED' && new Date(booking.date) < new Date() && (
                        <Button
                          size="sm"
                          onClick={() => updateBookingStatus(booking.id, 'COMPLETED')}
                          className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
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
            <Card className="border-2 border-dashed border-gray-300">
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
                <Card key={booking.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">{booking.service?.name || 'Unknown Service'}</h3>
                          {getStatusBadge(booking.status)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Notes</p>
                            <p className="text-sm text-gray-700">{booking.notes}</p>
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
            <Card className="border-2 border-dashed border-gray-300">
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
                <Card key={booking.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">{booking.service?.name || 'Unknown Service'}</h3>
                          {getStatusBadge(booking.status)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Notes</p>
                            <p className="text-sm text-gray-700">{booking.notes}</p>
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