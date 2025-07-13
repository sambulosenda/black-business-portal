import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(request: Request) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build where clause
    const where: Prisma.BookingWhereInput = {
      businessId: business.id,
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    // Get bookings
    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: true,
        service: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    })

    // Convert Decimal fields to numbers for JSON serialization
    const serializedBookings = bookings.map(booking => ({
      ...booking,
      totalPrice: Number(booking.totalPrice),
      stripeFee: booking.stripeFee ? Number(booking.stripeFee) : null,
      platformFee: booking.platformFee ? Number(booking.platformFee) : null,
      businessPayout: booking.businessPayout ? Number(booking.businessPayout) : null,
      service: {
        ...booking.service,
        price: Number(booking.service.price)
      }
    }))

    return NextResponse.json({ bookings: serializedBookings })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}