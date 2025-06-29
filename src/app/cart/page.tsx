'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/cart-context'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  ShoppingCart, Trash2, Plus, Minus, ArrowRight, 
  Calendar, Clock, Package, AlertCircle 
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

export default function CartPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { 
    items, 
    subtotal, 
    updateQuantity, 
    removeItem, 
    clearCart,
    getBusinessItems 
  } = useCart()

  // Group items by business
  const itemsByBusiness = items.reduce((acc, item) => {
    if (!acc[item.businessId]) {
      acc[item.businessId] = {
        businessName: item.businessName,
        businessSlug: item.businessSlug,
        items: []
      }
    }
    acc[item.businessId].items.push(item)
    return acc
  }, {} as Record<string, { businessName: string; businessSlug: string; items: typeof items }>)

  const handleCheckout = () => {
    if (!session) {
      toast.error('Please sign in to checkout')
      router.push('/login?redirect=/cart')
      return
    }

    // Since cart can only have items from one business, we can proceed
    const businessId = Object.keys(itemsByBusiness)[0]
    const businessData = itemsByBusiness[businessId]
    
    // If cart has services, go to booking flow
    const hasServices = items.some(item => item.type === 'service')
    if (hasServices) {
      router.push(`/book/${businessData.businessSlug}?fromCart=true`)
    } else {
      // Products only - go to checkout
      router.push('/checkout')
    }
  }

  if (items.length === 0) {
    return (
      <>
        <Navigation session={session} />
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-8">
                Browse our businesses and add services or products to your cart
              </p>
              <Link href="/search">
                <Button size="lg">
                  Browse Businesses
                </Button>
              </Link>
            </div>
          </main>
          <Footer />
        </div>
      </>
    )
  }

  return (
    <>
      <Navigation session={session} />
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {Object.entries(itemsByBusiness).map(([businessId, { businessName, businessSlug, items: businessItems }]) => (
                <Card key={businessId}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{businessName}</CardTitle>
                        <Link 
                          href={`/business/${businessSlug}`}
                          className="text-sm text-primary hover:underline"
                        >
                          View business →
                        </Link>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {businessItems.map((item) => (
                      <div key={item.id} className="flex items-start gap-4">
                        {/* Product/Service Image */}
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {item.type === 'product' && item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package className="h-8 w-8 text-gray-400" />
                          )}
                        </div>

                        {/* Item Details */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium">{item.name}</h3>
                              {item.type === 'service' && (
                                <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {item.duration} min
                                  </span>
                                  {item.date && (
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {new Date(item.date).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Quantity and Price */}
                          <div className="flex items-center justify-between mt-3">
                            {item.type === 'product' ? (
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                                  className="w-16 text-center"
                                  min="1"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <Badge variant="secondary">Service</Badge>
                            )}
                            <div className="text-right">
                              <p className="font-semibold">
                                ${(item.price * (item.type === 'product' ? item.quantity : 1)).toFixed(2)}
                              </p>
                              {item.type === 'product' && item.quantity > 1 && (
                                <p className="text-sm text-gray-600">
                                  ${item.price.toFixed(2)} each
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={clearCart}
                >
                  Clear Cart
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>Calculated at checkout</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {items.some(item => item.type === 'service') && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        Service bookings require date and time selection in the next step
                      </p>
                    </div>
                  )}

                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>

                  <p className="text-xs text-center text-gray-600">
                    Secure checkout powered by Stripe
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  )
}