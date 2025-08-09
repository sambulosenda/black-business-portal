import Link from 'next/link'
import { format } from 'date-fns'
import { BarChart3, Calendar, ChevronRight, Clock, DollarSign, Package, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function DemoDashboardPage() {
  // Mock data for demonstration
  const business = {
    isVerified: true,
    category: 'HAIR_SALON',
    city: 'Atlanta',
    state: 'GA',
    phone: '+1 (404) 555-0123',
    services: [{id: 1, name: 'Haircut'}, {id: 2, name: 'Hair Color'}, {id: 3, name: 'Braids'}],
    bookings: [
      {
        id: 1,
        user: { name: 'Sarah Johnson' },
        service: { name: 'Hair Cut & Style' },
        date: new Date('2024-01-15'),
        startTime: new Date('2024-01-15T10:00:00'),
        totalPrice: 85,
        status: 'CONFIRMED'
      },
      {
        id: 2,
        user: { name: 'Michelle Davis' },
        service: { name: 'Braids' },
        date: new Date('2024-01-15'),
        startTime: new Date('2024-01-15T14:30:00'),
        totalPrice: 120,
        status: 'PENDING'
      },
      {
        id: 3,
        user: { name: 'Angela Wilson' },
        service: { name: 'Hair Color' },
        date: new Date('2024-01-14'),
        startTime: new Date('2024-01-14T16:00:00'),
        totalPrice: 150,
        status: 'COMPLETED'
      }
    ],
    reviews: [
      {
        id: 1,
        user: { name: 'Keisha Brown' },
        rating: 5,
        comment: 'Amazing service! Love my new hairstyle. The salon is clean and professional.',
        createdAt: new Date('2024-01-10')
      },
      {
        id: 2,
        user: { name: 'Jasmine Taylor' },
        rating: 5,
        comment: 'Best braids in the city! Will definitely be back.',
        createdAt: new Date('2024-01-08')
      }
    ]
  }

  const session = {
    user: {
      name: 'Samantha Williams',
      email: 'sam@glamstudio.com'
    }
  }

  const upcomingBookings = 8
  const thisMonthBookings = 24
  const totalReviews = 47
  const averageRating = 4.8
  const thisMonthRevenue = { _sum: { totalPrice: 3450 } }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Navigation */}
      <div className="sticky top-0 z-10 flex h-16 items-center border-b border-gray-200 bg-white/95 backdrop-blur-md px-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 font-bold text-white text-sm shadow-lg">
            G
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Glamfric</h1>
            <p className="text-xs text-gray-500 font-medium">Business Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-4 ml-auto">
          {/* Search */}
          <div className="relative hidden sm:block">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              className="w-64 rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20 focus:outline-none"
            />
          </div>
          
          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 font-semibold text-white text-xs">
              {session.user.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">{session.user.name}</p>
              <p className="text-xs text-gray-500">{session.user.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8 border border-gray-100">
            {/* Decorative background elements */}
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-indigo-100 opacity-30 blur-2xl"></div>
            <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-purple-100 opacity-30 blur-2xl"></div>
            
            <div className="relative">
              <div className="mb-4 inline-flex items-center rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 px-4 py-2 text-sm font-medium text-indigo-700">
                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                </svg>
                Welcome back, {session.user.name?.split(' ')[0]}
              </div>
              <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
                Business Dashboard
              </h1>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl">
                Track your performance, manage bookings, and grow your beauty business with comprehensive insights and tools.
              </p>
              
              {/* Quick stats inline */}
              <div className="mt-8 flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-gray-600">
                    <span className="font-semibold text-gray-900">{upcomingBookings}</span> upcoming appointments
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  <span className="text-gray-600">
                    <span className="font-semibold text-gray-900">{business.services.length}</span> active services
                  </span>
                </div>
                {business.isVerified && (
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-indigo-600 font-medium">Verified Business</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-indigo-50 to-indigo-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-indigo-200 opacity-50 transition-opacity group-hover:opacity-70"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-indigo-700 uppercase tracking-wide">Revenue</CardTitle>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 shadow-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-indigo-900 mb-1">
                  ${thisMonthRevenue._sum.totalPrice?.toFixed(2) || '0.00'}
                </div>
                <p className="text-sm text-indigo-600 font-medium">
                  This month
                </p>
                <div className="mt-3 flex items-center gap-1 text-xs">
                  <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04L10.75 5.612V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
                    </svg>
                    +12% from last month
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-purple-200 opacity-50 transition-opacity group-hover:opacity-70"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-purple-700 uppercase tracking-wide">Bookings</CardTitle>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600 shadow-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-900 mb-1">{thisMonthBookings}</div>
                <p className="text-sm text-purple-600 font-medium">
                  {upcomingBookings} upcoming
                </p>
                <div className="mt-3 flex items-center gap-1 text-xs">
                  <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04L10.75 5.612V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
                    </svg>
                    +8% from last week
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-emerald-200 opacity-50 transition-opacity group-hover:opacity-70"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">Rating</CardTitle>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 shadow-lg">
                  <Star className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-900 mb-1">
                  {averageRating > 0 ? averageRating.toFixed(1) : '—'}
                </div>
                <p className="text-sm text-emerald-600 font-medium">
                  {totalReviews} reviews
                </p>
                <div className="mt-3 flex items-center gap-1">
                  {averageRating > 0 && (
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < Math.floor(averageRating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'fill-gray-200 text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-amber-50 to-amber-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-amber-200 opacity-50 transition-opacity group-hover:opacity-70"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-amber-700 uppercase tracking-wide">Services</CardTitle>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-600 shadow-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-900 mb-1">{business.services.length}</div>
                <p className="text-sm text-amber-600 font-medium">Active services</p>
                <div className="mt-3 flex items-center gap-1 text-xs">
                  <span className="inline-flex items-center gap-1 text-blue-600 font-medium">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75V9l3.47-3.47a.75.75 0 111.06 1.06L10.75 11l4.38 4.38a.75.75 0 11-1.06 1.06L10.75 12v5.25a.75.75 0 01-1.5 0V12L5.78 16.44a.75.75 0 11-1.06-1.06L9.25 11 4.87 6.56a.75.75 0 111.06-1.06L9.25 9V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
                    </svg>
                    Manage
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Bookings Sample */}
          <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 opacity-20"></div>
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">Recent Bookings</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">Latest appointment requests</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200">
                  View all
                  <ChevronRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="space-y-4">
                {business.bookings.map((booking, index) => (
                  <div
                    key={booking.id}
                    className="group/booking flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 font-semibold">
                          {booking.user.name?.charAt(0) || 'U'}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${
                          booking.status === 'CONFIRMED' ? 'bg-green-500' :
                          booking.status === 'PENDING' ? 'bg-yellow-500' : 'bg-gray-400'
                        }`}></div>
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-gray-900 group-hover/booking:text-indigo-900 transition-colors">{booking.user.name}</p>
                        <p className="text-sm text-gray-600 font-medium">{booking.service.name}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {format(new Date(booking.date), 'MMM d')}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {format(new Date(booking.startTime), 'h:mm a')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900 mb-1">
                        ${booking.totalPrice.toString()}
                      </div>
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        booking.status === 'CONFIRMED'
                          ? 'bg-green-100 text-green-800 ring-1 ring-green-600/20'
                          : booking.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-600/20'
                            : 'bg-gray-100 text-gray-800 ring-1 ring-gray-600/20'
                      }`}>
                        {booking.status.charAt(0) + booking.status.slice(1).toLowerCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}