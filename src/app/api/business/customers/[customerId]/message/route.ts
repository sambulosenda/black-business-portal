import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function POST(
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
    const customer = await prisma.customerProfile.findFirst({
      where: {
        id: customerId,
        businessId: business.id,
      },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const { type, subject, content } = await request.json()

    // Create the communication record
    const communication = await prisma.communication.create({
      data: {
        businessId: business.id,
        customerId: customerId,
        type: type || 'NOTE',
        subject,
        content,
        // In the future, we could add staffId if we implement staff authentication
      },
      include: {
        staff: {
          select: {
            name: true,
          },
        },
      },
    })

    // TODO: If type is EMAIL or SMS, send actual message via AWS SES or SNS
    // For now, we just store the communication record

    return NextResponse.json({ communication }, { status: 201 })
  } catch (error) {
    console.error('Error creating communication:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}