import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import ReviewForm from './review-form'

interface ReviewPageProps {
  params: Promise<{
    bookingId: string
  }>
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const session = await requireAuth()
  const { bookingId } = await params

  // Get booking details with business info
  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
      userId: session.user.id, // Ensure user owns this booking
    },
    include: {
      business: true,
      service: true,
      review: true,
    },
  })

  if (!booking) {
    redirect('/bookings')
  }

  // Check if booking is completed
  if (booking.status !== 'COMPLETED') {
    redirect('/bookings')
  }

  // Check if review already exists
  if (booking.review) {
    redirect('/bookings')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Leave a Review</h1>
          <p className="mt-2 text-gray-600">
            Share your experience at {booking.business.businessName}
          </p>
        </div>

        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">Your Appointment</h2>
          <div className="space-y-1 text-sm text-gray-600">
            <p>Service: {booking.service.name}</p>
            <p>Date: {new Date(booking.date).toLocaleDateString()}</p>
            <p>Price: ${booking.totalPrice.toString()}</p>
          </div>
        </div>

        <ReviewForm
          bookingId={booking.id}
          businessId={booking.businessId}
          businessName={booking.business.businessName}
        />
      </div>
    </div>
  )
}
