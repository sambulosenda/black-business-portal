import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const businessId = searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID required' }, { status: 400 })
    }

    // Get all future time off dates for full days
    const timeOffs = await prisma.timeOff.findMany({
      where: {
        businessId,
        date: {
          gte: new Date()
        },
        // Only full day time offs
        startTime: null,
        endTime: null
      },
      select: {
        date: true
      }
    })

    const dates = timeOffs.map(to => to.date.toISOString().split('T')[0])

    return NextResponse.json({ dates })
  } catch (error) {
    console.error('Error fetching time off dates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch time off dates' },
      { status: 500 }
    )
  }
}