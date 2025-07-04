import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { promotionId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'BUSINESS_OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const business = await prisma.business.findUnique({
      where: { userId: session.user.id }
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const promotion = await prisma.promotion.findFirst({
      where: {
        id: params.promotionId,
        businessId: business.id
      }
    })

    if (!promotion) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 })
    }

    // Convert Decimal to number for JSON serialization
    const serializedPromotion = {
      ...promotion,
      value: Number(promotion.value),
      minimumAmount: promotion.minimumAmount ? Number(promotion.minimumAmount) : null
    }

    return NextResponse.json(serializedPromotion)
  } catch (error) {
    console.error('Error fetching promotion:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { promotionId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'BUSINESS_OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const business = await prisma.business.findUnique({
      where: { userId: session.user.id }
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const data = await request.json()

    // Check if promotion belongs to this business
    const existingPromotion = await prisma.promotion.findFirst({
      where: {
        id: params.promotionId,
        businessId: business.id
      }
    })

    if (!existingPromotion) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 })
    }

    // If updating code, check uniqueness
    if (data.code && data.code !== existingPromotion.code) {
      const duplicateCode = await prisma.promotion.findFirst({
        where: {
          businessId: business.id,
          code: data.code,
          NOT: { id: params.promotionId }
        }
      })

      if (duplicateCode) {
        return NextResponse.json({ error: 'Promo code already exists' }, { status: 400 })
      }
    }

    // Update the promotion
    const updatedPromotion = await prisma.promotion.update({
      where: { id: params.promotionId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.code !== undefined && { code: data.code }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.value !== undefined && { value: data.value }),
        ...(data.scope !== undefined && { scope: data.scope }),
        ...(data.serviceIds !== undefined && { serviceIds: data.serviceIds }),
        ...(data.productIds !== undefined && { productIds: data.productIds }),
        ...(data.startDate !== undefined && { startDate: new Date(data.startDate) }),
        ...(data.endDate !== undefined && { endDate: new Date(data.endDate) }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.usageLimit !== undefined && { usageLimit: data.usageLimit }),
        ...(data.perCustomerLimit !== undefined && { perCustomerLimit: data.perCustomerLimit }),
        ...(data.minimumAmount !== undefined && { minimumAmount: data.minimumAmount }),
        ...(data.minimumItems !== undefined && { minimumItems: data.minimumItems }),
        ...(data.firstTimeOnly !== undefined && { firstTimeOnly: data.firstTimeOnly }),
        ...(data.featured !== undefined && { featured: data.featured })
      }
    })

    // Convert Decimal to number for JSON serialization
    const serializedPromotion = {
      ...updatedPromotion,
      value: Number(updatedPromotion.value),
      minimumAmount: updatedPromotion.minimumAmount ? Number(updatedPromotion.minimumAmount) : null
    }

    return NextResponse.json(serializedPromotion)
  } catch (error) {
    console.error('Error updating promotion:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { promotionId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'BUSINESS_OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const business = await prisma.business.findUnique({
      where: { userId: session.user.id }
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Check if promotion belongs to this business
    const promotion = await prisma.promotion.findFirst({
      where: {
        id: params.promotionId,
        businessId: business.id
      }
    })

    if (!promotion) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 })
    }

    // Delete the promotion (this will cascade delete usage records)
    await prisma.promotion.delete({
      where: { id: params.promotionId }
    })

    return NextResponse.json({ message: 'Promotion deleted successfully' })
  } catch (error) {
    console.error('Error deleting promotion:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}