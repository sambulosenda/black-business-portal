import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { 
      promotionId, 
      discountAmount, 
      orderTotal,
      bookingId,
      orderId
    } = await request.json()

    if (!promotionId || !discountAmount || !orderTotal) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!bookingId && !orderId) {
      return NextResponse.json({ error: 'Either bookingId or orderId is required' }, { status: 400 })
    }

    // Create promotion usage record
    const usage = await prisma.promotionUsage.create({
      data: {
        promotionId,
        userId: session.user.id,
        discountAmount,
        orderTotal,
        bookingId: bookingId || null,
        orderId: orderId || null
      }
    })

    // Increment usage count on the promotion
    await prisma.promotion.update({
      where: { id: promotionId },
      data: {
        usageCount: {
          increment: 1
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      usageId: usage.id 
    })
  } catch (error) {
    console.error('Error recording promotion usage:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}