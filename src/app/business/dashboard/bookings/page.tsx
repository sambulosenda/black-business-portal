'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
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
  const [activeTab, setActiveTab] = useState('upcoming')

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

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = (booking.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (booking.service?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    
    const bookingDate = new Date(booking.date)
    const now = new Date()
    
    switch (activeTab) {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'COMPLETED':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
      case 'CANCELLED':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
      case 'NO_SHOW':
        return <Badge className="bg-gray-100 text-gray-800">No Show</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600 mt-2">Manage your customer appointments</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming">
            Upcoming ({bookings.filter(b => new Date(b.date) >= new Date() && !['CANCELLED', 'COMPLETED'].includes(b.status)).length})
          </TabsTrigger>
          <TabsTrigger value="today">
            Today ({bookings.filter(b => new Date(b.date).toDateString() === new Date().toDateString() && b.status !== 'CANCELLED').length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({bookings.filter(b => new Date(b.date) < new Date() || b.status === 'COMPLETED').length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({bookings.filter(b => b.status === 'CANCELLED').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {filteredBookings.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <EmptyState
                  icon="calendar"
                  title={`No ${activeTab} bookings`}
                  description={`You don't have any ${activeTab} bookings at the moment`}
                />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <h3 className="text-lg font-semibold">{booking.service?.name || 'Unknown Service'}</h3>
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
                          <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-600">
                            <p className="font-medium mb-1">Notes:</p>
                            <p>{booking.notes}</p>
                          </div>
                        )}
                      </div>
                      
                      {booking.status === 'PENDING' && new Date(booking.date) >= new Date() && (
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateBookingStatus(booking.id, 'CONFIRMED')}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateBookingStatus(booking.id, 'CANCELLED')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      )}
                      
                      {booking.status === 'CONFIRMED' && new Date(booking.date) < new Date() && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateBookingStatus(booking.id, 'COMPLETED')}
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
      </Tabs>
    </div>
  )
}