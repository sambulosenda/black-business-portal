import Link from 'next/link'
import { format } from 'date-fns'
import { BarChart3, Calendar, ChevronRight, Clock, DollarSign, Package, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/session'

export default async function BusinessDashboardPage() {
  const session = await requireRole('BUSINESS_OWNER')

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
            <Link href="/business/dashboard/settings">
              <Button className="bg-indigo-600 text-white hover:bg-indigo-700">
                Complete Setup
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate stats
  // const totalBookings = await prisma.booking.count({
  //   where: { businessId: business.id },
  // }) // Commented out - may be used later

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
      ? business.reviews.reduce((acc, review) => acc + review.rating, 0) / business.reviews.length
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

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-gray-50 to-white shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 opacity-30"></div>
          <CardHeader className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">Quick Actions</CardTitle>
            </div>
            <p className="mt-2 text-sm text-gray-600">Manage your business with one-click actions</p>
          </CardHeader>
          <CardContent className="grid gap-3 relative">
            <Link href="/business/dashboard/services" className="group/item">
              <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 group-hover/item:bg-indigo-600 group-hover/item:text-white transition-colors">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 group-hover/item:text-indigo-900">Manage Services</p>
                    <p className="text-sm text-gray-500">Add, edit or remove services</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover/item:text-indigo-600 transition-colors" />
              </div>
            </Link>
            <Link href="/business/dashboard/bookings" className="group/item">
              <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600 group-hover/item:bg-purple-600 group-hover/item:text-white transition-colors">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 group-hover/item:text-purple-900">View Bookings</p>
                    <p className="text-sm text-gray-500">Manage appointments and schedule</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover/item:text-purple-600 transition-colors" />
              </div>
            </Link>
            <Link href="/business/dashboard/availability" className="group/item">
              <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-200 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 group-hover/item:bg-emerald-600 group-hover/item:text-white transition-colors">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 group-hover/item:text-emerald-900">Set Availability</p>
                    <p className="text-sm text-gray-500">Configure working hours</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover/item:text-emerald-600 transition-colors" />
              </div>
            </Link>
            <Link href="/business/dashboard/analytics" className="group/item">
              <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md hover:border-amber-200 transition-all duration-200 hover:bg-gradient-to-r hover:from-amber-50 hover:to-yellow-50">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 group-hover/item:bg-amber-600 group-hover/item:text-white transition-colors">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 group-hover/item:text-amber-900">View Analytics</p>
                    <p className="text-sm text-gray-500">Track performance metrics</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover/item:text-amber-600 transition-colors" />
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* Business Info */}
        <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-gray-50 to-white shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 opacity-30"></div>
          <CardHeader className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">Business Information</CardTitle>
            </div>
            <p className="mt-2 text-sm text-gray-600">Your business profile and settings</p>
          </CardHeader>
          <CardContent className="relative">
            <div className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
                      <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Status</span>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                    business.isVerified
                      ? 'bg-green-100 text-green-800 ring-1 ring-green-600/20'
                      : 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-600/20'
                  }`}>
                    {business.isVerified ? (
                      <>
                        <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </>
                    ) : (
                      <>
                        <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Pending
                      </>
                    )}
                  </span>
                </div>
                
                <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
                      <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Category</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 capitalize">{business.category.replace(/_/g, ' ')}</span>
                </div>
                
                <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
                      <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Location</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{business.city}, {business.state}</span>
                </div>
                
                <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
                      <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Phone</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{business.phone}</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <Link
                  href="/business/dashboard/settings"
                  className="group/edit inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 hover:shadow-xl"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                  <ChevronRight className="h-3 w-3 transition-transform group-hover/edit:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
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
            <Link href="/business/dashboard/bookings">
              <Button variant="outline" size="sm" className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200">
                View all
                <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="relative">
          {business.bookings.length > 0 ? (
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
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 mb-4">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-600 max-w-sm mx-auto">
                Share your business profile to start receiving bookings from customers
              </p>
              <Link href="/business/dashboard/services" className="mt-4 inline-block">
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700">
                  Set up Services
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Reviews */}
      <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50 shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 opacity-20"></div>
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg">
                <Star className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">Recent Reviews</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Customer feedback and ratings</p>
              </div>
            </div>
            <Link href="/business/dashboard/reviews">
              <Button variant="outline" size="sm" className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200">
                View all
                <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="relative">
          {business.reviews.length > 0 ? (
            <div className="space-y-4">
              {business.reviews.map((review, index) => (
                <div
                  key={review.id}
                  className="group/review rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-600 font-semibold flex-shrink-0">
                      {review.user.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold text-gray-900 group-hover/review:text-purple-900 transition-colors">{review.user.name}</p>
                        <span className="text-xs text-gray-400">
                          {format(new Date(review.createdAt), 'MMM d')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-gray-200 text-gray-200'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm font-semibold text-gray-700">
                          {review.rating}.0
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-gray-600 leading-relaxed">
                          "{review.comment}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 mb-4">
                <Star className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
              <p className="text-gray-600 max-w-sm mx-auto">
                Reviews will appear here after customers rate their experience with your services
              </p>
              <Link href="/business/dashboard/customers" className="mt-4 inline-block">
                <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700">
                  Manage Customers
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
