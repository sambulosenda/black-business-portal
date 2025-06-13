import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const businessId = searchParams.get('businessId')
    const date = searchParams.get('date')
    const serviceId = searchParams.get('serviceId')

    if (!businessId || !date || !serviceId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const selectedDate = new Date(date)
    const startDate = startOfDay(selectedDate)
    const endDate = endOfDay(selectedDate)

    // Get all bookings for this business on this date
    const bookings = await prisma.booking.findMany({
      where: {
        businessId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    })

    // Convert booked times to HH:mm format
    const bookedSlots = bookings.map(booking => {
      const time = new Date(booking.startTime)
      return `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`
    })

    return NextResponse.json({ bookedSlots })
  } catch (error) {
    console.error('Error checking availability:', error)
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    )
  }
}