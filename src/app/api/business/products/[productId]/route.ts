import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params
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

    // Verify product belongs to this business
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        businessId: business.id,
      },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const data = await request.json()

    // Handle inventory changes
    if (data.trackInventory && data.quantity !== undefined && data.quantity !== existingProduct.quantity) {
      const quantityDiff = data.quantity - existingProduct.quantity

      await prisma.inventoryLog.create({
        data: {
          productId: productId,
          type: 'ADJUSTMENT',
          quantity: quantityDiff,
          previousQty: existingProduct.quantity,
          newQty: data.quantity,
          reason: 'Manual adjustment',
          createdBy: session.user.id,
        },
      })
    }

    // Update the product
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        name: data.name,
        description: data.description,
        sku: data.sku,
        barcode: data.barcode,
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        cost: data.cost,
        categoryId: data.categoryId,
        brand: data.brand,
        trackInventory: data.trackInventory,
        quantity: data.quantity,
        lowStockAlert: data.lowStockAlert,
        images: data.images,
        displayOrder: data.displayOrder,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        tags: data.tags,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params
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

    // Verify product belongs to this business
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        businessId: business.id,
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if product has been used in bookings
    const bookingItemCount = await prisma.bookingItem.count({
      where: { productId: productId },
    })

    if (bookingItemCount > 0) {
      // Soft delete by marking as inactive
      await prisma.product.update({
        where: { id: productId },
        data: { isActive: false },
      })
      
      return NextResponse.json({ message: 'Product deactivated (has booking history)' })
    } else {
      // Hard delete if no booking history
      await prisma.product.delete({
        where: { id: productId },
      })
      
      return NextResponse.json({ message: 'Product deleted successfully' })
    }
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}