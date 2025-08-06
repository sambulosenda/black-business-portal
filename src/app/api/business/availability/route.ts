import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'BUSINESS_OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      businessId,
      availabilities,
    }: {
      businessId: string
      availabilities: Array<{
        dayOfWeek: number
        startTime: string
        endTime: string
        isActive: boolean
      }>
    } = await request.json()

    // Verify business ownership
    const business = await prisma.business.findUnique({
      where: {
        id: businessId,
        userId: session.user.id,
      },
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Delete existing availabilities
    await prisma.availability.deleteMany({
      where: { businessId },
    })

    // Create new availabilities
    const created = await prisma.availability.createMany({
      data: availabilities.map((availability) => ({
        businessId,
        dayOfWeek: availability.dayOfWeek,
        startTime: availability.startTime,
        endTime: availability.endTime,
        isActive: availability.isActive,
      })),
    })

    return NextResponse.json({ success: true, count: created.count })
  } catch (error) {
    console.error('Error updating availability:', error)
    return NextResponse.json({ error: 'Failed to update availability' }, { status: 500 })
  }
}
