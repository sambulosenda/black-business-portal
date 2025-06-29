import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Package, Truck, MapPin, Clock } from 'lucide-react'
import { format } from 'date-fns'

interface OrderConfirmationPageProps {
  params: Promise<{
    orderId: string
  }>
}

export default async function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const session = await getSession()
  const { orderId } = await params

  if (!session) {
    notFound()
  }

  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
      userId: session.user.id,
    },
    include: {
      business: true,
      orderItems: {
        include: {
          product: true,
        },
      },
    },
  })

  if (!order) {
    notFound()
  }

  // Update order status if payment was successful
  if (order.paymentStatus === 'PENDING' && order.stripePaymentIntentId) {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'SUCCEEDED',
        status: 'CONFIRMED',
        paidAt: new Date(),
      },
    })
  }

  return (
    <>
      <Navigation session={session} />
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Order Confirmed!
            </h1>
            <p className="text-lg text-gray-600">
              Thank you for your purchase. Your order has been confirmed.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Order #{order.orderNumber}
            </p>
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-medium">
                    {format(new Date(order.createdAt), 'MMMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Business</p>
                  <p className="font-medium">{order.business.businessName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-medium text-lg">
                    ${Number(order.total).toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {order.fulfillmentType === 'DELIVERY' ? (
                    <Truck className="h-5 w-5" />
                  ) : (
                    <MapPin className="h-5 w-5" />
                  )}
                  {order.fulfillmentType === 'DELIVERY' ? 'Delivery' : 'Pickup'} Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.fulfillmentType === 'DELIVERY' ? (
                  <>
                    <div>
                      <p className="text-sm text-gray-600">Delivery Address</p>
                      <p className="font-medium">
                        {order.deliveryAddress && typeof order.deliveryAddress === 'object' && 
                          `${(order.deliveryAddress as any).address}, ${(order.deliveryAddress as any).city}, ${(order.deliveryAddress as any).state} ${(order.deliveryAddress as any).zipCode}`
                        }
                      </p>
                    </div>
                    {order.deliveryNotes && (
                      <div>
                        <p className="text-sm text-gray-600">Delivery Notes</p>
                        <p className="font-medium">{order.deliveryNotes}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600">Pickup Location</p>
                    <p className="font-medium">
                      {order.business.address}, {order.business.city}, {order.business.state} {order.business.zipCode}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      <Clock className="h-4 w-4 inline mr-1" />
                      You'll receive a notification when your order is ready for pickup
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Items */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                      <div>
                        <h4 className="font-medium">{item.product.name}</h4>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity} × ${Number(item.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <p className="font-medium">
                      ${Number(item.total).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-6 pt-6 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${Number(order.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>${Number(order.tax).toFixed(2)}</span>
                </div>
                {order.deliveryFee && Number(order.deliveryFee) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Delivery Fee</span>
                    <span>${Number(order.deliveryFee).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>${Number(order.total).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/search">
              <Button variant="outline">Continue Shopping</Button>
            </Link>
            <Link href="/orders">
              <Button>View My Orders</Button>
            </Link>
          </div>

          {/* Contact Information */}
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>
              Questions about your order? Contact {order.business.businessName} at{' '}
              <a href={`tel:${order.business.phone}`} className="text-indigo-600 hover:underline">
                {order.business.phone}
              </a>
            </p>
          </div>
        </main>
        <Footer />
      </div>
    </>
  )
}