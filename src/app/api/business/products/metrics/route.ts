import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

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

    // Get product metrics
    const products = await prisma.product.findMany({
      where: {
        businessId: business.id,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        price: true,
        quantity: true,
        cost: true,
        trackInventory: true,
        lowStockAlert: true,
      },
    })

    // Calculate metrics
    const totalProducts = products.length
    let totalValue = 0
    let lowStockCount = 0
    let outOfStockCount = 0

    products.forEach(product => {
      // Calculate inventory value using cost if available, otherwise use price
      const unitValue = product.cost ? Number(product.cost) : Number(product.price)
      totalValue += unitValue * product.quantity

      if (product.trackInventory) {
        if (product.quantity === 0) {
          outOfStockCount++
        } else if (product.lowStockAlert && product.quantity <= product.lowStockAlert) {
          lowStockCount++
        }
      }
    })

    // Get top selling products (for now, just featured products or first 5)
    // In a real app, this would analyze BookingItem data
    const topSellingProducts = await prisma.product.findMany({
      where: {
        businessId: business.id,
        isActive: true,
        isFeatured: true,
      },
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      totalProducts,
      totalValue,
      lowStockCount,
      outOfStockCount,
      topSellingProducts,
    })
  } catch (error) {
    console.error('Error fetching product metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product metrics' },
      { status: 500 }
    )
  }
}