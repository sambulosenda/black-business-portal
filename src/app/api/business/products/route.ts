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

    // Get all products with their categories
    const products = await prisma.product.findMany({
      where: {
        businessId: business.id,
      },
      include: {
        category: true,
      },
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
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

    const data = await request.json()

    // Create the product
    const product = await prisma.product.create({
      data: {
        businessId: business.id,
        name: data.name,
        description: data.description,
        sku: data.sku,
        barcode: data.barcode,
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        cost: data.cost,
        categoryId: data.categoryId || null,
        brand: data.brand,
        trackInventory: data.trackInventory ?? true,
        quantity: data.quantity || 0,
        lowStockAlert: data.lowStockAlert,
        images: data.images || [],
        displayOrder: data.displayOrder || 0,
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
        tags: data.tags || [],
      },
      include: {
        category: true,
      },
    })

    // Create initial inventory log if tracking inventory
    if (product.trackInventory && product.quantity > 0) {
      await prisma.inventoryLog.create({
        data: {
          productId: product.id,
          type: 'INITIAL',
          quantity: product.quantity,
          previousQty: 0,
          newQty: product.quantity,
          reason: 'Initial stock',
          createdBy: session.user.id,
        },
      })
    }

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}