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

    const { 
      event, 
      channel, 
      enabled = true, 
      timing = 'IMMEDIATE',
      delayMinutes,
      advanceHours,
      conditions
    } = await request.json()

    // Check if trigger already exists
    const existingTrigger = await prisma.notificationTrigger.findUnique({
      where: {
        settingsId_event_channel: {
          settingsId: settings.id,
          event,
          channel,
        },
      },
    })

    let trigger

    if (existingTrigger) {
      // Update existing trigger
      trigger = await prisma.notificationTrigger.update({
        where: {
          id: existingTrigger.id,
        },
        data: {
          enabled,
          timing,
          delayMinutes: timing === 'DELAYED' ? delayMinutes : null,
          advanceHours: timing === 'ADVANCE' ? advanceHours : null,
          conditions,
        },
      })
    } else {
      // Create new trigger
      trigger = await prisma.notificationTrigger.create({
        data: {
          settingsId: settings.id,
          event,
          channel,
          enabled,
          timing,
          delayMinutes: timing === 'DELAYED' ? delayMinutes : null,
          advanceHours: timing === 'ADVANCE' ? advanceHours : null,
          conditions,
        },
      })
    }

    return NextResponse.json({ trigger })
  } catch (error) {
    console.error('Error managing notification trigger:', error)
    return NextResponse.json(
      { error: 'Failed to manage notification trigger' },
      { status: 500 }
    )
  }
}