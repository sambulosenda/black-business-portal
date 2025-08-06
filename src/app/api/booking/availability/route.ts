import { NextRequest, NextResponse } from 'next/server'
import { endOfDay, format, startOfDay } from 'date-fns'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const businessId = searchParams.get('businessId')
    const date = searchParams.get('date')
    const serviceId = searchParams.get('serviceId')

    if (!businessId || !date || !serviceId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    const selectedDate = new Date(date)
    const startDate = startOfDay(selectedDate)
    const endDate = endOfDay(selectedDate)
    const dayOfWeek = selectedDate.getDay()

    // Check if business has time off on this date
    const timeOff = await prisma.timeOff.findFirst({
      where: {
        businessId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    // If full day off, return that no slots are available
    if (timeOff && !timeOff.startTime && !timeOff.endTime) {
      return NextResponse.json({
        bookedSlots: [],
        isClosedDay: true,
        reason: timeOff.reason || 'Business is closed',
      })
    }

    // Get business availability for this day of week
    const availability = await prisma.availability.findFirst({
      where: {
        businessId,
        dayOfWeek,
        isActive: true,
      },
    })

    if (!availability) {
      return NextResponse.json({
        bookedSlots: [],
        isClosedDay: true,
        reason: 'Business is closed on this day',
      })
    }

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
    const bookedSlots = bookings.map((booking) => {
      const time = new Date(booking.startTime)
      return `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`
    })

    // If there's partial time off, add those slots to booked slots
    if (timeOff && timeOff.startTime && timeOff.endTime) {
      const [startHour, startMin] = timeOff.startTime.split(':').map(Number)
      const [endHour, endMin] = timeOff.endTime.split(':').map(Number)

      let currentTime = new Date(selectedDate)
      currentTime.setHours(startHour, startMin, 0, 0)

      const endTime = new Date(selectedDate)
      endTime.setHours(endHour, endMin, 0, 0)

      while (currentTime < endTime) {
        bookedSlots.push(format(currentTime, 'HH:mm'))
        currentTime = new Date(currentTime.getTime() + 30 * 60000) // 30-minute intervals
      }
    }

    return NextResponse.json({
      bookedSlots,
      availability: {
        startTime: availability.startTime,
        endTime: availability.endTime,
      },
    })
  } catch (error) {
    console.error('Error checking availability:', error)
    return NextResponse.json({ error: 'Failed to check availability' }, { status: 500 })
  }
}
