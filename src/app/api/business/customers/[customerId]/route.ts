import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params
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

    // Get the customer profile with related data
    const customer = await prisma.customerProfile.findFirst({
      where: {
        id: customerId,
        businessId: business.id,
      },
      include: {
        communications: {
          include: {
            staff: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            sentAt: 'desc',
          },
        },
      },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Get bookings for this customer
    const bookings = await prisma.booking.findMany({
      where: {
        userId: customer.userId,
        businessId: business.id,
      },
      include: {
        service: {
          select: {
            name: true,
          },
        },
        staff: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    })

    return NextResponse.json({
      customer: {
        ...customer,
        totalSpent: Number(customer.totalSpent),
        averageSpent: Number(customer.averageSpent),
        bookings: bookings.map((booking) => ({
          ...booking,
          totalPrice: Number(booking.totalPrice),
        })),
      },
    })
  } catch (error) {
    console.error('Error fetching customer:', error)
    return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params
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

    // Verify customer belongs to this business
    const existingCustomer = await prisma.customerProfile.findFirst({
      where: {
        id: customerId,
        businessId: business.id,
      },
    })

    if (!existingCustomer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const updates = await request.json()

    // Update the customer profile
    const updatedCustomer = await prisma.customerProfile.update({
      where: { id: customerId },
      data: updates,
      include: {
        communications: {
          include: {
            staff: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            sentAt: 'desc',
          },
        },
      },
    })

    // Get bookings for response
    const bookings = await prisma.booking.findMany({
      where: {
        userId: updatedCustomer.userId,
        businessId: business.id,
      },
      include: {
        service: {
          select: {
            name: true,
          },
        },
        staff: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    })

    return NextResponse.json({
      customer: {
        ...updatedCustomer,
        totalSpent: Number(updatedCustomer.totalSpent),
        averageSpent: Number(updatedCustomer.averageSpent),
        bookings: bookings.map((booking) => ({
          ...booking,
          totalPrice: Number(booking.totalPrice),
        })),
      },
    })
  } catch (error) {
    console.error('Error updating customer:', error)
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 })
  }
}
