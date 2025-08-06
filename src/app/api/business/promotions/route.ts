import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'BUSINESS_OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the business for this user
    const business = await prisma.business.findUnique({
      where: { userId: session.user.id },
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Fetch all promotions for this business
    const promotions = await prisma.promotion.findMany({
      where: { businessId: business.id },
      orderBy: { createdAt: 'desc' },
    })

    // Convert Decimal to number for JSON serialization
    const serializedPromotions = promotions.map((promo) => ({
      ...promo,
      value: Number(promo.value),
      minimumAmount: promo.minimumAmount ? Number(promo.minimumAmount) : null,
    }))

    return NextResponse.json(serializedPromotions)
  } catch (error) {
    console.error('Error fetching promotions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'BUSINESS_OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const business = await prisma.business.findUnique({
      where: { userId: session.user.id },
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const data = await request.json()

    // Validate required fields
    if (
      !data.name ||
      !data.type ||
      !data.value ||
      !data.scope ||
      !data.startDate ||
      !data.endDate
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if code is unique for this business
    if (data.code) {
      const existingPromo = await prisma.promotion.findFirst({
        where: {
          businessId: business.id,
          code: data.code,
        },
      })

      if (existingPromo) {
        return NextResponse.json({ error: 'Promo code already exists' }, { status: 400 })
      }
    }

    // Create the promotion
    const promotion = await prisma.promotion.create({
      data: {
        businessId: business.id,
        name: data.name,
        description: data.description || null,
        code: data.code || null,
        type: data.type,
        value: data.value,
        scope: data.scope,
        serviceIds: data.serviceIds || [],
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isActive: data.isActive ?? true,
        usageLimit: data.usageLimit || null,
        perCustomerLimit: data.perCustomerLimit || null,
        minimumAmount: data.minimumAmount || null,
        minimumItems: data.minimumItems || null,
        firstTimeOnly: data.firstTimeOnly || false,
        featured: data.featured || false,
      },
    })

    // Convert Decimal to number for JSON serialization
    const serializedPromotion = {
      ...promotion,
      value: Number(promotion.value),
      minimumAmount: promotion.minimumAmount ? Number(promotion.minimumAmount) : null,
    }

    return NextResponse.json(serializedPromotion, { status: 201 })
  } catch (error) {
    console.error('Error creating promotion:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
