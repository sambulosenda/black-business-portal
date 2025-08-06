import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

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

    // Get notification settings with templates and triggers
    const settings = await prisma.notificationSettings.findUnique({
      where: {
        businessId: business.id,
      },
      include: {
        templates: true,
        triggers: true,
      },
    })

    if (!settings) {
      return NextResponse.json({ settings: null, templates: [], triggers: [] }, { status: 404 })
    }

    return NextResponse.json({
      settings: {
        id: settings.id,
        emailEnabled: settings.emailEnabled,
        emailFrom: settings.emailFrom,
        emailReplyTo: settings.emailReplyTo,
        smsEnabled: settings.smsEnabled,
        smsFrom: settings.smsFrom,
        timezone: settings.timezone,
        quietHoursStart: settings.quietHoursStart,
        quietHoursEnd: settings.quietHoursEnd,
      },
      templates: settings.templates,
      triggers: settings.triggers,
    })
  } catch (error) {
    console.error('Error fetching notification settings:', error)
    return NextResponse.json({ error: 'Failed to fetch notification settings' }, { status: 500 })
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

    // Check if settings already exist
    const existingSettings = await prisma.notificationSettings.findUnique({
      where: {
        businessId: business.id,
      },
    })

    if (existingSettings) {
      return NextResponse.json({ error: 'Settings already exist' }, { status: 400 })
    }

    const data = await request.json()

    // Create new notification settings
    const settings = await prisma.notificationSettings.create({
      data: {
        businessId: business.id,
        emailEnabled: data.emailEnabled ?? true,
        emailFrom: data.emailFrom,
        emailReplyTo: data.emailReplyTo,
        smsEnabled: data.smsEnabled ?? false,
        smsFrom: data.smsFrom,
        timezone: data.timezone || 'America/New_York',
        quietHoursStart: data.quietHoursStart || '21:00',
        quietHoursEnd: data.quietHoursEnd || '09:00',
      },
    })

    return NextResponse.json({ settings }, { status: 201 })
  } catch (error) {
    console.error('Error creating notification settings:', error)
    return NextResponse.json({ error: 'Failed to create notification settings' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
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

    // Update notification settings
    const settings = await prisma.notificationSettings.update({
      where: {
        businessId: business.id,
      },
      data: {
        emailEnabled: data.emailEnabled,
        emailFrom: data.emailFrom,
        emailReplyTo: data.emailReplyTo,
        smsEnabled: data.smsEnabled,
        smsFrom: data.smsFrom,
        timezone: data.timezone,
        quietHoursStart: data.quietHoursStart,
        quietHoursEnd: data.quietHoursEnd,
      },
    })

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error updating notification settings:', error)
    return NextResponse.json({ error: 'Failed to update notification settings' }, { status: 500 })
  }
}
