'use client'

import { DataTable, Column } from '@/components/ui/data-table'
import { format } from 'date-fns'
import Link from 'next/link'
import CancelButton from './cancel-button'
import RefundButton from './refund-button'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Booking {
  id: string
  date: Date
  startTime: Date
  endTime: Date
  status: string
  paymentStatus: string | null
  totalPrice: any
  business: {
    businessName: string
    slug: string
    address: string
    city: string
    state: string
  }
  service: {
    name: string
  }
  review: any
}

interface BookingsTableProps {
  title: string
  bookings: Booking[]
  emptyState: React.ReactNode
  showActions?: boolean
  isPast?: boolean
}

export default function BookingsTable({ 
  title, 
  bookings, 
  emptyState, 
  showActions = false, 
  isPast = false 
}: BookingsTableProps) {
  const columns: Column<Booking>[] = [
    {
      key: 'business.businessName',
      header: 'Business',
      cell: (booking) => (
        <div>
          <Link 
            href={`/business/${booking.business.slug}`}
            className="font-medium text-gray-900 hover:text-indigo-600"
          >
            {booking.business.businessName}
          </Link>
          <p className="text-sm text-gray-500">{booking.service.name}</p>
        </div>
      ),
      sortable: true
    },
    {
      key: 'date',
      header: 'Date & Time',
      cell: (booking) => (
        <div>
          <p className="font-medium text-gray-900">
            {format(new Date(booking.date), 'MMM d, yyyy')}
          </p>
          <p className="text-sm text-gray-500">
            {format(new Date(booking.startTime), 'h:mm a')} - {format(new Date(booking.endTime), 'h:mm a')}
          </p>
        </div>
      ),
      sortable: true
    },
    {
      key: 'business.address',
      header: 'Location',
      cell: (booking) => (
        <div className="text-sm text-gray-600">
          <p>{booking.business.address}</p>
          <p>{booking.business.city}, {booking.business.state}</p>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      cell: (booking) => (
        <div className="flex gap-2">
          <Badge
            variant={
              booking.status === 'CONFIRMED' ? 'success' :
              booking.status === 'COMPLETED' ? 'success' :
              booking.status === 'PENDING' ? 'warning' :
              booking.status === 'CANCELLED' ? 'destructive' :
              'secondary'
            }
          >
            {booking.status}
          </Badge>
          {booking.paymentStatus && (
            <Badge
              variant={
                booking.paymentStatus === 'SUCCEEDED' ? 'success' :
                booking.paymentStatus === 'REFUNDED' ? 'secondary' :
                booking.paymentStatus === 'FAILED' ? 'destructive' :
                'warning'
              }
            >
              {booking.paymentStatus === 'SUCCEEDED' ? 'Paid' : 
               booking.paymentStatus === 'REFUNDED' ? 'Refunded' :
               booking.paymentStatus === 'FAILED' ? 'Payment Failed' :
               'Payment Pending'}
            </Badge>
          )}
        </div>
      ),
      sortable: true
    },
    {
      key: 'totalPrice',
      header: 'Price',
      cell: (booking) => (
        <p className="font-semibold text-gray-900">
          ${booking.totalPrice.toString()}
        </p>
      ),
      sortable: true,
      className: 'text-right'
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (booking) => {
        if (isPast) {
          return booking.status === 'COMPLETED' && !booking.review ? (
            <Link href={`/review/${booking.id}`}>
              <Button size="sm" variant="outline">
                Leave Review
              </Button>
            </Link>
          ) : null
        }
        
        return (
          <div className="flex gap-2">
            <CancelButton
              bookingId={booking.id}
              bookingDate={booking.startTime}
              bookingStatus={booking.status}
            />
            <RefundButton
              bookingId={booking.id}
              bookingDate={booking.startTime}
              paymentStatus={booking.paymentStatus}
            />
          </div>
        )
      }
    }
  ]

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
      <DataTable
        data={bookings}
        columns={columns}
        searchable
        searchPlaceholder="Search bookings..."
        emptyState={emptyState}
        className={isPast ? 'opacity-90' : ''}
      />
    </div>
  )
}