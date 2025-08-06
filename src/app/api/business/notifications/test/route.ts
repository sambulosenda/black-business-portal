import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

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
      include: {
        user: {
          select: {
            email: true,
            phone: true,
            name: true,
          },
        },
      },
    })

    if (!business) {
      return NextResponse.json({ error: 'No active business found' }, { status: 404 })
    }

    const { type, channel } = await request.json()

    // Get notification settings
    const settings = await prisma.notificationSettings.findUnique({
      where: {
        businessId: business.id,
      },
    })

    if (!settings) {
      return NextResponse.json({ error: 'Notification settings not configured' }, { status: 400 })
    }

    // Check if the channel is enabled
    if (channel === 'EMAIL' && !settings.emailEnabled) {
      return NextResponse.json({ error: 'Email notifications are not enabled' }, { status: 400 })
    }

    if (channel === 'SMS' && !settings.smsEnabled) {
      return NextResponse.json({ error: 'SMS notifications are not enabled' }, { status: 400 })
    }

    // Get the template for this type and channel
    const template = await prisma.notificationTemplate.findUnique({
      where: {
        settingsId_type_channel: {
          settingsId: settings.id,
          type,
          channel,
        },
      },
    })

    // Use default content if no custom template exists
    const content = template?.content || getDefaultTemplate(type, channel)
    const subject = template?.subject || getDefaultSubject(type)

    // Replace variables with test data
    const testData = {
      customerName: business.user.name,
      businessName: business.businessName,
      serviceName: 'Test Service',
      date: new Date().toLocaleDateString(),
      time: '2:00 PM',
      staffName: 'Test Staff',
      price: '$50.00',
      hoursUntil: '24',
      reviewLink: 'https://example.com/review',
      businessUrl: `https://example.com/business/${business.slug}`,
    }

    let processedContent = content
    let processedSubject = subject || ''

    // Replace variables in content and subject
    Object.entries(testData).forEach(([key, value]) => {
      processedContent = processedContent.replace(new RegExp(`{{${key}}}`, 'g'), value)
      processedSubject = processedSubject.replace(new RegExp(`{{${key}}}`, 'g'), value)
    })

    // TODO: Integrate with AWS SES for email or AWS SNS for SMS
    // For now, we'll just log and return success
    console.log('Test notification:', {
      channel,
      type,
      recipient: channel === 'EMAIL' ? business.user.email : business.user.phone,
      subject: processedSubject,
      content: processedContent,
    })

    // Record the test notification
    await prisma.communication.create({
      data: {
        businessId: business.id,
        customerId: business.id, // Use business ID as placeholder for test
        type: channel,
        subject: `TEST: ${processedSubject}`,
        content: `[TEST NOTIFICATION]\n\n${processedContent}`,
        status: 'SENT',
      },
    })

    return NextResponse.json({
      success: true,
      message: `Test ${channel.toLowerCase()} sent to ${channel === 'EMAIL' ? business.user.email : business.user.phone}`,
    })
  } catch (error) {
    console.error('Error sending test notification:', error)
    return NextResponse.json({ error: 'Failed to send test notification' }, { status: 500 })
  }
}

function getDefaultTemplate(type: string, channel: string): string {
  const templates: Record<string, Record<string, string>> = {
    BOOKING_CONFIRMATION: {
      EMAIL: `Hi {{customerName}},

Your booking at {{businessName}} has been confirmed!

Service: {{serviceName}}
Date: {{date}}
Time: {{time}}
Staff: {{staffName}}
Price: {{price}}

We look forward to seeing you!

Best regards,
{{businessName}}`,
      SMS: `{{businessName}}: Your booking for {{serviceName}} on {{date}} at {{time}} is confirmed. See you soon!`,
    },
    BOOKING_REMINDER: {
      EMAIL: `Hi {{customerName}},

This is a reminder about your upcoming appointment at {{businessName}}.

Service: {{serviceName}}
Date: {{date}}
Time: {{time}}
Staff: {{staffName}}

Your appointment is in {{hoursUntil}} hours. See you soon!

Best regards,
{{businessName}}`,
      SMS: `{{businessName}}: Reminder - You have {{serviceName}} tomorrow at {{time}}. Reply CANCEL to cancel.`,
    },
    BOOKING_CANCELLED: {
      EMAIL: `Hi {{customerName}},

Your booking at {{businessName}} has been cancelled.

Service: {{serviceName}}
Original Date: {{date}}
Original Time: {{time}}

We hope to see you again soon. Feel free to book another appointment at your convenience.

Best regards,
{{businessName}}`,
      SMS: `{{businessName}}: Your booking for {{serviceName}} on {{date}} has been cancelled.`,
    },
    REVIEW_REQUEST: {
      EMAIL: `Hi {{customerName}},

Thank you for visiting {{businessName}}! We hope you enjoyed your {{serviceName}} service.

We'd love to hear about your experience. Please take a moment to leave us a review:
{{reviewLink}}

Your feedback helps us improve and helps others discover our services.

Best regards,
{{businessName}}`,
      SMS: `{{businessName}}: Thanks for your visit! We'd love your feedback: {{reviewLink}}`,
    },
  }

  return templates[type]?.[channel] || `Test notification for ${type}`
}

function getDefaultSubject(type: string): string {
  const subjects: Record<string, string> = {
    BOOKING_CONFIRMATION: 'Booking Confirmation - {{businessName}}',
    BOOKING_REMINDER: 'Appointment Reminder - {{businessName}}',
    BOOKING_CANCELLED: 'Booking Cancelled - {{businessName}}',
    BOOKING_RESCHEDULED: 'Booking Rescheduled - {{businessName}}',
    BOOKING_COMPLETED: 'Thank You for Your Visit - {{businessName}}',
    REVIEW_REQUEST: 'How was your experience? - {{businessName}}',
    PROMOTIONAL: 'Special Offer from {{businessName}}',
    BIRTHDAY: 'Happy Birthday from {{businessName}}!',
    RE_ENGAGEMENT: 'We Miss You! - {{businessName}}',
  }

  return subjects[type] || 'Notification from {{businessName}}'
}
