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

    // First, fetch the promotion to check if it has a usage limit
    const promotion = await prisma.promotion.findUnique({
      where: { id: promotionId },
      select: {
        usageLimit: true,
        usageCount: true,
        perCustomerLimit: true
      }
    })

    if (!promotion) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 })
    }

    // Use a transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // If there's a usage limit, atomically increment only if under limit
      if (promotion.usageLimit) {
        const updatedPromotion = await tx.promotion.updateMany({
          where: {
            id: promotionId,
            usageCount: { lt: promotion.usageLimit } // Only update if under limit
          },
          data: {
            usageCount: { increment: 1 }
          }
        })

        // If no rows were updated, the limit was reached
        if (updatedPromotion.count === 0) {
          throw new Error('Promotion usage limit has been reached')
        }
      } else {
        // No limit, just increment
        await tx.promotion.update({
          where: { id: promotionId },
          data: {
            usageCount: { increment: 1 }
          }
        })
      }

      // Check per-customer limit before creating usage record
      if (promotion.perCustomerLimit) {
        const customerUsageCount = await tx.promotionUsage.count({
          where: {
            promotionId,
            userId: session.user.id
          }
        })

        if (customerUsageCount >= promotion.perCustomerLimit) {
          throw new Error('You have already used this promotion the maximum number of times')
        }
      }

      // Create promotion usage record
      const usage = await tx.promotionUsage.create({
        data: {
          promotionId,
          userId: session.user.id,
          discountAmount,
          orderTotal,
          bookingId: bookingId || null,
          orderId: orderId || null
        }
      })

      return usage
    })

    // Return the usage record created in the transaction
    const usage = result

    return NextResponse.json({ 
      success: true, 
      usageId: usage.id 
    })
  } catch (error) {
    console.error('Error recording promotion usage:', error)
    
    // Provide more specific error messages for known errors
    if (error instanceof Error) {
      if (error.message.includes('usage limit')) {
        return NextResponse.json({ error: error.message }, { status: 409 }) // Conflict
      }
      if (error.message.includes('maximum number of times')) {
        return NextResponse.json({ error: error.message }, { status: 409 }) // Conflict
      }
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}