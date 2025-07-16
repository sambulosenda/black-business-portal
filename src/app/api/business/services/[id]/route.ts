import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  duration: z.number().positive().optional(),
  category: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
})

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'BUSINESS_OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const business = await prisma.business.findUnique({
      where: { userId: session.user.id },
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const service = await prisma.service.findFirst({
      where: {
        id: id,
        businessId: business.id,
      },
    })

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    const body = await req.json()
    const validatedData = updateSchema.parse(body)

    const updatedService = await prisma.service.update({
      where: { id: id },
      data: validatedData,
    })

    return NextResponse.json({ service: updatedService })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      )
    }

    console.error('Error updating service:', error)
    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'BUSINESS_OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const business = await prisma.business.findUnique({
      where: { userId: session.user.id },
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const service = await prisma.service.findFirst({
      where: {
        id: id,
        businessId: business.id,
      },
    })

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    const body = await req.json()
    const { isActive } = body

    const updatedService = await prisma.service.update({
      where: { id: id },
      data: { isActive },
    })

    return NextResponse.json({ service: updatedService })
  } catch (error) {
    console.error('Error updating service status:', error)
    return NextResponse.json(
      { error: 'Failed to update service status' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'BUSINESS_OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const business = await prisma.business.findUnique({
      where: { userId: session.user.id },
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const service = await prisma.service.findFirst({
      where: {
        id: id,
        businessId: business.id,
      },
    })

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Check if there are any bookings for this service
    const bookingCount = await prisma.booking.count({
      where: { serviceId: id },
    })

    if (bookingCount > 0) {
      // Soft delete by marking as inactive
      await prisma.service.update({
        where: { id: id },
        data: { isActive: false },
      })
    } else {
      // Hard delete if no bookings
      await prisma.service.delete({
        where: { id: id },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    )
  }
}