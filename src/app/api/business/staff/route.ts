import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET() {
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

    // Get all staff for this business
    const staff = await prisma.staff.findMany({
      where: {
        businessId: business.id,
      },
      include: {
        services: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        schedules: {
          orderBy: {
            dayOfWeek: 'asc',
          },
        },
      },
      orderBy: [
        { role: 'desc' }, // Owner first, then Manager, then Staff
        { createdAt: 'asc' },
      ],
    })

    return NextResponse.json({ staff })
  } catch (error) {
    console.error('Error fetching staff:', error)
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
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

    const data = await request.json()
    const { name, email, phone, role, canManageBookings, canManageStaff, services } = data

    // Check if email already exists for this business
    const existingStaff = await prisma.staff.findUnique({
      where: {
        businessId_email: {
          businessId: business.id,
          email: email,
        },
      },
    })

    if (existingStaff) {
      return NextResponse.json(
        { error: 'A staff member with this email already exists' },
        { status: 400 }
      )
    }

    // Create the staff member
    const staff = await prisma.staff.create({
      data: {
        businessId: business.id,
        name,
        email,
        phone,
        role,
        canManageBookings,
        canManageStaff,
      },
    })

    // Add service assignments if provided
    if (services && services.length > 0) {
      await prisma.staffService.createMany({
        data: services.map((serviceId: string) => ({
          staffId: staff.id,
          serviceId,
        })),
      })
    }

    // Fetch the created staff with relations
    const createdStaff = await prisma.staff.findUnique({
      where: { id: staff.id },
      include: {
        services: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        schedules: true,
      },
    })

    return NextResponse.json({ staff: createdStaff }, { status: 201 })
  } catch (error) {
    console.error('Error creating staff:', error)
    return NextResponse.json(
      { error: 'Failed to create staff member' },
      { status: 500 }
    )
  }
}