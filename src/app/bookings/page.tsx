import Link from 'next/link'
import { Breadcrumb, BreadcrumbWrapper } from '@/components/ui/breadcrumb'
import { EmptyState } from '@/components/ui/empty-state'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import BookingsTable from './bookings-table'

export default async function BookingsPage() {
  const session = await requireAuth()

  const bookings = await prisma.booking.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      business: true,
      service: true,
      review: true,
    },
    orderBy: {
      date: 'desc',
    },
  })

  const upcomingBookings = bookings
    .filter((booking) => new Date(booking.date) >= new Date() && booking.status !== 'CANCELLED')
    .map((booking) => ({
      ...booking,
      totalPrice: Number(booking.totalPrice),
    }))
  const pastBookings = bookings
    .filter((booking) => new Date(booking.date) < new Date() || booking.status === 'CANCELLED')
    .map((booking) => ({
      ...booking,
      totalPrice: Number(booking.totalPrice),
    }))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-indigo-600">
                Glamfric
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Dashboard
              </Link>
              <Link
                href="/"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Find Services
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <BreadcrumbWrapper>
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'My Bookings' },
          ]}
        />
      </BreadcrumbWrapper>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="mt-2 text-gray-600">View and manage your appointments</p>
        </div>

        {/* Upcoming Bookings */}
        <div className="mb-12">
          <BookingsTable
            title="Upcoming Appointments"
            bookings={upcomingBookings}
            emptyState={
              <EmptyState
                icon="calendar"
                title="No upcoming appointments"
                description="Book a service with one of our talented professionals"
                action={{
                  label: 'Find Services',
                  href: '/search',
                }}
              />
            }
            showActions
          />
        </div>

        {/* Past Bookings */}
        <div>
          <BookingsTable
            title="Past Appointments"
            bookings={pastBookings}
            emptyState={
              <EmptyState
                icon="bookings"
                title="No past appointments"
                description="Your booking history will appear here"
              />
            }
            isPast
          />
        </div>
      </div>
    </div>
  )
}
