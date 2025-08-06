import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'BUSINESS_OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { businessId, date, startTime, endTime, reason } = await request.json()

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

    // Create time off
    const timeOff = await prisma.timeOff.create({
      data: {
        businessId,
        date: new Date(date),
        startTime,
        endTime,
        reason,
      },
    })

    return NextResponse.json(timeOff)
  } catch (error) {
    console.error('Error creating time off:', error)
    return NextResponse.json({ error: 'Failed to create time off' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'BUSINESS_OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Time off ID required' }, { status: 400 })
    }

    // Get time off to verify ownership
    const timeOff = await prisma.timeOff.findUnique({
      where: { id },
      include: { business: true },
    })

    if (!timeOff || timeOff.business.userId !== session.user.id) {
      return NextResponse.json({ error: 'Time off not found' }, { status: 404 })
    }

    // Delete time off
    await prisma.timeOff.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting time off:', error)
    return NextResponse.json({ error: 'Failed to delete time off' }, { status: 500 })
  }
}
