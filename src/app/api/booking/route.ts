import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { addMinutes, parse } from 'date-fns'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const bookingSchema = z.object({
  businessId: z.string(),
  serviceId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = bookingSchema.parse(body)

    // Get service details to calculate end time
    const service = await prisma.service.findUnique({
      where: { id: validatedData.serviceId },
      include: { business: true },
    })

    if (!service || service.business.id !== validatedData.businessId) {
      return NextResponse.json({ error: 'Invalid service' }, { status: 400 })
    }

    // Parse date and time
    const bookingDate = parse(validatedData.date, 'yyyy-MM-dd', new Date())
    const [hours, minutes] = validatedData.time.split(':').map(Number)
    const startTime = new Date(bookingDate)
    startTime.setHours(hours, minutes, 0, 0)
    const endTime = addMinutes(startTime, service.duration)

    // Check if slot is available
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        businessId: validatedData.businessId,
        date: bookingDate,
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
        OR: [
          {
            AND: [{ startTime: { lte: startTime } }, { endTime: { gt: startTime } }],
          },
          {
            AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }],
          },
          {
            AND: [{ startTime: { gte: startTime } }, { endTime: { lte: endTime } }],
          },
        ],
      },
    })

    if (conflictingBooking) {
      return NextResponse.json({ error: 'This time slot is no longer available' }, { status: 400 })
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        businessId: validatedData.businessId,
        serviceId: validatedData.serviceId,
        date: bookingDate,
        startTime,
        endTime,
        status: 'CONFIRMED',
        totalPrice: service.price,
      },
    })

    return NextResponse.json({ bookingId: booking.id })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
    }

    console.error('Booking error:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
