import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

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

    // Get notification settings
    const settings = await prisma.notificationSettings.findUnique({
      where: {
        businessId: business.id,
      },
    })

    if (!settings) {
      return NextResponse.json({ error: 'Notification settings not found' }, { status: 404 })
    }

    const { type, channel, name, subject, content, isActive = true } = await request.json()

    // Check if template already exists
    const existingTemplate = await prisma.notificationTemplate.findUnique({
      where: {
        settingsId_type_channel: {
          settingsId: settings.id,
          type,
          channel,
        },
      },
    })

    let template

    if (existingTemplate) {
      // Update existing template
      template = await prisma.notificationTemplate.update({
        where: {
          id: existingTemplate.id,
        },
        data: {
          name: name || `${type} ${channel}`,
          subject,
          content,
          isActive,
          isDefault: false, // Custom templates are never default
        },
      })
    } else {
      // Create new template
      template = await prisma.notificationTemplate.create({
        data: {
          settingsId: settings.id,
          type,
          channel,
          name: name || `${type} ${channel}`,
          subject,
          content,
          variables: getTemplateVariables(type),
          isActive,
          isDefault: false,
        },
      })
    }

    return NextResponse.json({ template })
  } catch (error) {
    console.error('Error managing notification template:', error)
    return NextResponse.json(
      { error: 'Failed to manage notification template' },
      { status: 500 }
    )
  }
}

// Helper function to get available variables for each template type
function getTemplateVariables(type: string): string[] {
  const commonVars = ['customerName', 'businessName']
  
  const typeSpecificVars: Record<string, string[]> = {
    BOOKING_CONFIRMATION: ['serviceName', 'date', 'time', 'staffName', 'price'],
    BOOKING_REMINDER: ['serviceName', 'date', 'time', 'staffName', 'hoursUntil'],
    BOOKING_CANCELLED: ['serviceName', 'date', 'time', 'reason'],
    BOOKING_RESCHEDULED: ['serviceName', 'oldDate', 'oldTime', 'newDate', 'newTime'],
    BOOKING_COMPLETED: ['serviceName', 'date', 'reviewLink'],
    REVIEW_REQUEST: ['serviceName', 'date', 'reviewLink', 'businessUrl'],
    PROMOTIONAL: ['offerDetails', 'expiryDate', 'discountCode'],
    BIRTHDAY: ['birthdayOffer', 'expiryDate'],
    RE_ENGAGEMENT: ['lastVisitDate', 'specialOffer'],
  }
  
  return [...commonVars, ...(typeSpecificVars[type] || [])]
}