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
      code, 
      businessId, 
      subtotal, 
      serviceIds = [], 
      productIds = [],
      itemCount = 1
    } = await request.json()

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 })
    }

    // Find the promotion
    let promotion
    if (code) {
      // Find by code
      promotion = await prisma.promotion.findFirst({
        where: {
          businessId,
          code: code.toUpperCase(),
          isActive: true
        }
      })
    } else {
      // Find automatic promotions (no code required)
      const promotions = await prisma.promotion.findMany({
        where: {
          businessId,
          code: null,
          isActive: true,
          featured: true // Prioritize featured automatic promotions
        },
        orderBy: {
          value: 'desc' // Best discount first
        }
      })
      
      // Find the best applicable promotion
      for (const promo of promotions) {
        const validation = await validatePromotion({
          ...promo,
          value: Number(promo.value),
          minimumAmount: promo.minimumAmount ? Number(promo.minimumAmount) : null,
        }, session.user.id, subtotal, serviceIds, productIds, itemCount)
        if (validation.valid) {
          promotion = promo
          break
        }
      }
    }

    if (!promotion) {
      return NextResponse.json({ 
        valid: false, 
        error: code ? 'Invalid promo code' : 'No promotions available' 
      }, { status: 400 })
    }

    // Validate the promotion
    const validation = await validatePromotion({
      ...promotion,
      value: Number(promotion.value),
      minimumAmount: promotion.minimumAmount ? Number(promotion.minimumAmount) : null,
    }, 
      session.user.id, 
      subtotal, 
      serviceIds, 
      productIds,
      itemCount
    )

    if (!validation.valid) {
      return NextResponse.json({ 
        valid: false, 
        error: validation.error 
      }, { status: 400 })
    }

    // Calculate discount
    const discount = calculateDiscount({
      type: promotion.type,
      value: Number(promotion.value)
    }, subtotal, itemCount)

    return NextResponse.json({
      valid: true,
      promotion: {
        id: promotion.id,
        name: promotion.name,
        description: promotion.description,
        type: promotion.type,
        value: Number(promotion.value),
        code: promotion.code
      },
      discount: discount,
      finalAmount: Math.max(0, subtotal - discount)
    })
  } catch (error) {
    console.error('Error validating promotion:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function validatePromotion(
  promotion: {
    id: string;
    businessId: string;
    name: string;
    description: string | null;
    code: string | null;
    type: string;
    value: number;
    scope: string;
    serviceIds: string[];
    productIds: string[];
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    usageLimit: number | null;
    usageCount: number;
    perCustomerLimit: number | null;
    minimumAmount: number | null;
    minimumItems: number | null;
    firstTimeOnly: boolean;
  },
  userId: string,
  subtotal: number,
  serviceIds: string[],
  productIds: string[],
  itemCount: number
): Promise<{ valid: boolean; error?: string }> {
  const now = new Date()

  // Check if promotion is active and within date range
  if (!promotion.isActive) {
    return { valid: false, error: 'Promotion is not active' }
  }

  if (now < new Date(promotion.startDate)) {
    return { valid: false, error: 'Promotion has not started yet' }
  }

  if (now > new Date(promotion.endDate)) {
    return { valid: false, error: 'Promotion has expired' }
  }

  // Check usage limits
  if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
    return { valid: false, error: 'Promotion usage limit reached' }
  }

  // Check per-customer limit
  if (promotion.perCustomerLimit) {
    const customerUsageCount = await prisma.promotionUsage.count({
      where: {
        promotionId: promotion.id,
        userId
      }
    })

    if (customerUsageCount >= promotion.perCustomerLimit) {
      return { valid: false, error: 'You have already used this promotion the maximum number of times' }
    }
  }

  // Check minimum amount
  if (promotion.minimumAmount && subtotal < Number(promotion.minimumAmount)) {
    return { valid: false, error: `Minimum purchase amount of $${promotion.minimumAmount} required` }
  }

  // Check minimum items
  if (promotion.minimumItems && itemCount < promotion.minimumItems) {
    return { valid: false, error: `Minimum ${promotion.minimumItems} items required` }
  }

  // Check first-time customer requirement
  if (promotion.firstTimeOnly) {
    const previousBookings = await prisma.booking.count({
      where: {
        userId,
        businessId: promotion.businessId,
        status: {
          in: ['COMPLETED', 'CONFIRMED']
        }
      }
    })

    const previousOrders = await prisma.order.count({
      where: {
        userId,
        businessId: promotion.businessId,
        status: {
          in: ['COMPLETED', 'PROCESSING']
        }
      }
    })

    if (previousBookings > 0 || previousOrders > 0) {
      return { valid: false, error: 'This promotion is only for first-time customers' }
    }
  }

  // Check scope
  switch (promotion.scope) {
    case 'SPECIFIC_SERVICES':
      if (!serviceIds.some(id => promotion.serviceIds.includes(id))) {
        return { valid: false, error: 'This promotion does not apply to the selected services' }
      }
      break
    case 'SPECIFIC_PRODUCTS':
      if (!productIds.some(id => promotion.productIds.includes(id))) {
        return { valid: false, error: 'This promotion does not apply to the selected products' }
      }
      break
    case 'ALL_SERVICES':
      if (serviceIds.length === 0) {
        return { valid: false, error: 'This promotion only applies to services' }
      }
      break
    case 'ALL_PRODUCTS':
      if (productIds.length === 0) {
        return { valid: false, error: 'This promotion only applies to products' }
      }
      break
    // ENTIRE_PURCHASE applies to everything
  }

  return { valid: true }
}

function calculateDiscount(
  promotion: {
    type: string;
    value: number;
  },
  subtotal: number,
  itemCount: number
): number {
  switch (promotion.type) {
    case 'PERCENTAGE':
      return (subtotal * Number(promotion.value)) / 100
    
    case 'FIXED_AMOUNT':
      return Math.min(Number(promotion.value), subtotal)
    
    case 'BOGO':
      // For BOGO, we give 50% off (buy one get one free)
      // This is a simplified implementation
      return subtotal * 0.5
    
    case 'BUNDLE':
      // For bundle deals, apply discount if minimum items met
      if (itemCount >= 2) {
        return (subtotal * Number(promotion.value)) / 100
      }
      return 0
    
    default:
      return 0
  }
}