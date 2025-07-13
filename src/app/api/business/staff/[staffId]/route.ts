import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { staffId: string } }
) {
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

    // Get the staff member
    const staff = await prisma.staff.findFirst({
      where: {
        id: params.staffId,
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
        schedules: true,
        bookings: {
          take: 10,
          orderBy: {
            date: 'desc',
          },
          include: {
            service: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    if (!staff) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }

    return NextResponse.json({ staff })
  } catch (error) {
    console.error('Error fetching staff:', error)
    return NextResponse.json(
      { error: 'Failed to fetch staff member' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { staffId: string } }
) {
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

    // Verify staff belongs to this business
    const existingStaff = await prisma.staff.findFirst({
      where: {
        id: params.staffId,
        businessId: business.id,
      },
    })

    if (!existingStaff) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }

    const data = await request.json()
    const { name, email, phone, role, canManageBookings, canManageStaff, services } = data

    // Check if email is being changed and already exists
    if (email !== existingStaff.email) {
      const emailExists = await prisma.staff.findFirst({
        where: {
          businessId: business.id,
          email: email,
          id: {
            not: params.staffId,
          },
        },
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'A staff member with this email already exists' },
          { status: 400 }
        )
      }
    }

    // Update the staff member
    await prisma.staff.update({
      where: { id: params.staffId },
      data: {
        name,
        email,
        phone,
        role,
        canManageBookings,
        canManageStaff,
      },
    })

    // Update service assignments
    if (services !== undefined) {
      // Delete existing assignments
      await prisma.staffService.deleteMany({
        where: { staffId: params.staffId },
      })

      // Create new assignments
      if (services.length > 0) {
        await prisma.staffService.createMany({
          data: services.map((serviceId: string) => ({
            staffId: params.staffId,
            serviceId,
          })),
        })
      }
    }

    // Fetch the updated staff with relations
    const staff = await prisma.staff.findUnique({
      where: { id: params.staffId },
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

    return NextResponse.json({ staff })
  } catch (error) {
    console.error('Error updating staff:', error)
    return NextResponse.json(
      { error: 'Failed to update staff member' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { staffId: string } }
) {
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

    // Verify staff belongs to this business
    const existingStaff = await prisma.staff.findFirst({
      where: {
        id: params.staffId,
        businessId: business.id,
      },
    })

    if (!existingStaff) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }

    const { isActive } = await request.json()

    // Update the staff member's active status
    const updatedStaff = await prisma.staff.update({
      where: { id: params.staffId },
      data: { isActive },
    })

    return NextResponse.json({ staff: updatedStaff })
  } catch (error) {
    console.error('Error updating staff status:', error)
    return NextResponse.json(
      { error: 'Failed to update staff status' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { staffId: string } }
) {
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

    // Verify staff belongs to this business
    const existingStaff = await prisma.staff.findFirst({
      where: {
        id: params.staffId,
        businessId: business.id,
      },
    })

    if (!existingStaff) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }

    // Check if staff has any upcoming bookings
    const upcomingBookings = await prisma.booking.count({
      where: {
        staffId: params.staffId,
        date: {
          gte: new Date(),
        },
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
    })

    if (upcomingBookings > 0) {
      return NextResponse.json(
        { error: 'Cannot delete staff member with upcoming bookings' },
        { status: 400 }
      )
    }

    // Delete the staff member (cascade will handle related records)
    await prisma.staff.delete({
      where: { id: params.staffId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting staff:', error)
    return NextResponse.json(
      { error: 'Failed to delete staff member' },
      { status: 500 }
    )
  }
}