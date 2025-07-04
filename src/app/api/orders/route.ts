import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { stripe, calculateFees, formatAmountForStripe } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const {
      businessId,
      items,
      orderType,
      customerInfo,
      deliveryAddress,
      deliveryNotes,
      subtotal,
      tax,
      total,
      discount,
      promotionId,
    } = data

    // Verify business exists
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Create the order
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        businessId,
        type: 'PRODUCT_ONLY',
        status: 'PENDING',
        subtotal,
        tax,
        deliveryFee: orderType === 'delivery' ? 10 : 0,
        total,
        fulfillmentType: orderType === 'delivery' ? 'DELIVERY' : 'PICKUP',
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        deliveryAddress: deliveryAddress || null,
        deliveryNotes: deliveryNotes || null,
        orderItems: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity,
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    })

    // Update inventory for each product
    for (const item of order.orderItems) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      })

      if (product && product.trackInventory) {
        const newQuantity = product.quantity - item.quantity

        await prisma.product.update({
          where: { id: item.productId },
          data: { quantity: newQuantity },
        })

        // Create inventory log
        await prisma.inventoryLog.create({
          data: {
            productId: item.productId,
            type: 'SALE',
            quantity: -item.quantity,
            previousQty: product.quantity,
            newQty: newQuantity,
            reference: order.orderNumber,
            reason: `Order #${order.orderNumber}`,
            createdBy: session.user.id,
          },
        })
      }
    }

    // Get or create Stripe customer
    let stripeCustomerId = session.user.stripeCustomerId

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: session.user.email || customerInfo.email,
        name: session.user.name,
        metadata: {
          userId: session.user.id,
        },
      })

      stripeCustomerId = customer.id

      // Save customer ID to database
      await prisma.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId },
      })
    }

    // Check if business has Stripe account
    if (!business.stripeAccountId || !business.stripeOnboarded) {
      return NextResponse.json(
        { error: 'Business is not set up to accept payments' },
        { status: 400 }
      )
    }

    // Calculate fees
    const fees = calculateFees(total)

    // Create payment intent with automatic transfer
    const paymentIntent = await stripe.paymentIntents.create({
      amount: formatAmountForStripe(total),
      currency: 'usd',
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      application_fee_amount: fees.platformFee,
      transfer_data: {
        destination: business.stripeAccountId,
      },
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        businessId: business.id,
        businessName: business.businessName,
        userId: session.user.id,
        orderType: 'PRODUCT_ONLY',
        fulfillmentType: orderType,
        promotionId: promotionId || '',
        discountAmount: (discount || 0).toString(),
      },
    })

    // Update order with payment intent ID
    await prisma.order.update({
      where: { id: order.id },
      data: {
        stripePaymentIntentId: paymentIntent.id,
      },
    })

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      clientSecret: paymentIntent.client_secret,
      amount: total,
      fees: {
        platform: fees.platformFeeDollars,
        stripe: fees.stripeFeeDollars,
        business: fees.businessPayoutDollars,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}