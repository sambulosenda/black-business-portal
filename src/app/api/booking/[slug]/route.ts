import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{
    slug: string
  }>
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { slug } = await params
    
    const business = await prisma.business.findUnique({
      where: { 
        slug: slug,
        isActive: true 
      },
      select: {
        id: true,
        businessName: true,
        slug: true,
        phone: true,
        availabilities: {
          where: { isActive: true },
          select: {
            dayOfWeek: true,
            startTime: true,
            endTime: true,
          },
          orderBy: { dayOfWeek: 'asc' },
        },
      },
    })

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    const services = await prisma.service.findMany({
      where: {
        businessId: business.id,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        duration: true,
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ business, services })
  } catch (error) {
    console.error('Error fetching booking data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking data' },
      { status: 500 }
    )
  }
}