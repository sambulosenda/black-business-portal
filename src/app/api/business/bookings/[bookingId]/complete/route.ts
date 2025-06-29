import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: { bookingId: string } }
) {
  try {
    const session = await getSession()
    
    if (!session || session.user.role !== 'BUSINESS_OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the business for this owner
    const business = await prisma.business.findFirst({
      where: {
        userId: session.user.id,
        isActive: true,
      },
    })

    if (!business) {
      return NextResponse.json({ error: 'No active business found' }, { status: 404 })
    }

    // Verify the booking belongs to this business
    const booking = await prisma.booking.findFirst({
      where: {
        id: params.bookingId,
        businessId: business.id,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: {
        id: params.bookingId,
      },
      data: {
        status: 'COMPLETED',
      },
      include: {
        user: true,
        service: true,
      },
    })

    return NextResponse.json({ booking: updatedBooking })
  } catch (error) {
    console.error('Error completing booking:', error)
    return NextResponse.json(
      { error: 'Failed to complete booking' },
      { status: 500 }
    )
  }
}