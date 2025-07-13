'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useCart } from '@/contexts/cart-context'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { 
  ShoppingCart, CreditCard, Truck, MapPin, 
  Phone, Mail, Loader2, AlertCircle, Check 
} from 'lucide-react'
import { toast } from 'sonner'
import type { PromotionWithRelations } from '@/types'

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { items, subtotal, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [orderType, setOrderType] = useState<'pickup' | 'delivery'>('pickup')
  const [promoCode, setPromoCode] = useState('')
  const [promoDiscount, setPromoDiscount] = useState<number>(0)
  const [promoValidating, setPromoValidating] = useState(false)
  const [promoError, setPromoError] = useState('')
  const [appliedPromotion, setAppliedPromotion] = useState<PromotionWithRelations | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    email: session?.user?.email || '',
    phone: '',
    // Delivery fields
    address: '',
    city: '',
    state: '',
    zipCode: '',
    deliveryNotes: '',
  })

  useEffect(() => {
    // Redirect if cart is empty or has services
    if (items.length === 0) {
      router.push('/cart')
      return
    }

    const hasServices = items.some(item => item.type === 'service')
    if (hasServices) {
      router.push('/cart')
      return
    }

    // Redirect if not logged in
    if (!session) {
      router.push('/login?redirect=/checkout')
      return
    }
  }, [items, session, router])

  const validatePromoCode = async () => {
    if (!promoCode || items.length === 0) return

    setPromoValidating(true)
    setPromoError('')
    
    try {
      const businessId = items[0]?.businessId
      const productIds = items.filter(item => item.type === 'product').map(item => item.id)
      
      const response = await fetch('/api/promotions/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: promoCode,
          businessId,
          subtotal,
          serviceIds: [],
          productIds,
          itemCount: items.reduce((acc, item) => acc + (item.quantity || 1), 0)
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setPromoError(data.error || 'Invalid promo code')
        setPromoDiscount(0)
        setAppliedPromotion(null)
        return
      }

      setPromoDiscount(data.discount)
      setAppliedPromotion(data.promotion)
      setPromoError('')
      toast.success('Promo code applied!')
    } catch (error) {
      console.error('Error validating promo code:', error)
      setPromoError('Failed to validate promo code')
      setPromoDiscount(0)
      setAppliedPromotion(null)
    } finally {
      setPromoValidating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session) {
      toast.error('Please sign in to complete checkout')
      return
    }

    setLoading(true)

    try {
      // Group items by business (should only be one business in cart)
      const businessId = items[0]?.businessId
      
      const orderData = {
        businessId,
        items: items.map(item => ({
          productId: item.id,
          quantity: item.type === 'product' ? item.quantity : 1,
          price: item.price,
        })),
        orderType,
        customerInfo: {
          email: formData.email,
          phone: formData.phone,
        },
        ...(orderType === 'delivery' && {
          deliveryAddress: {
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
          },
          deliveryNotes: formData.deliveryNotes,
        }),
        subtotal,
        discount: promoDiscount,
        promotionId: appliedPromotion?.id,
        // In a real app, you'd calculate tax and total
        tax: (subtotal - promoDiscount) * 0.08, // 8% tax after discount
        total: (subtotal - promoDiscount) * 1.08,
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Store payment data in sessionStorage
        sessionStorage.setItem('orderPayment', JSON.stringify({
          orderId: data.orderId,
          orderNumber: data.orderNumber,
          clientSecret: data.clientSecret,
          businessName: items[0].businessName,
          amount: data.amount,
          fees: data.fees,
        }))
        
        // Clear cart
        clearCart()
        
        // Redirect to payment page
        router.push('/orders/payment')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create order')
      }
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const discountedSubtotal = subtotal - promoDiscount
  const tax = discountedSubtotal * 0.08
  const deliveryFee = orderType === 'delivery' ? 10 : 0
  const total = discountedSubtotal + tax + deliveryFee

  if (!session || items.length === 0) {
    return null // Will redirect
  }

  return (
    <>
      <Navigation session={session} />
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Checkout Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Order Type */}
                <Card>
                  <CardHeader>
                    <CardTitle>Order Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={orderType} onValueChange={(value) => setOrderType(value as 'pickup' | 'delivery')}>
                      <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value="pickup" id="pickup" />
                        <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <Truck className="h-5 w-5" />
                            <div>
                              <p className="font-medium">Pickup</p>
                              <p className="text-sm text-gray-600">Pick up at the business location</p>
                            </div>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value="delivery" id="delivery" />
                        <Label htmlFor="delivery" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <MapPin className="h-5 w-5" />
                            <div>
                              <p className="font-medium">Delivery</p>
                              <p className="text-sm text-gray-600">Have it delivered to your address (+$10)</p>
                            </div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(123) 456-7890"
                        required
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Delivery Address */}
                {orderType === 'delivery' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Delivery Address</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="address">Street Address</Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          placeholder="123 Main St"
                          required={orderType === 'delivery'}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            required={orderType === 'delivery'}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="state">State</Label>
                            <Input
                              id="state"
                              value={formData.state}
                              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                              placeholder="NY"
                              maxLength={2}
                              required={orderType === 'delivery'}
                            />
                          </div>
                          <div>
                            <Label htmlFor="zipCode">ZIP</Label>
                            <Input
                              id="zipCode"
                              value={formData.zipCode}
                              onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                              placeholder="12345"
                              required={orderType === 'delivery'}
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="deliveryNotes">Delivery Notes (Optional)</Label>
                        <Input
                          id="deliveryNotes"
                          value={formData.deliveryNotes}
                          onChange={(e) => setFormData({ ...formData, deliveryNotes: e.target.value })}
                          placeholder="Apartment number, gate code, etc."
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Payment (Placeholder) */}
                <Card>
                  <CardHeader>
                    <CardTitle>Payment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 border-2 border-dashed rounded-lg text-center">
                      <CreditCard className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        Payment will be processed securely via Stripe
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Items */}
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="flex-1">
                            {item.name} {item.type === 'product' && `x${item.quantity}`}
                          </span>
                          <span>${(item.price * (item.type === 'product' ? item.quantity : 1)).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {/* Promo Code */}
                    <div>
                      <Label htmlFor="checkoutPromoCode" className="text-sm font-medium">
                        Promo Code
                      </Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="checkoutPromoCode"
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          placeholder="Enter code"
                          className="text-sm"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={validatePromoCode}
                          disabled={promoValidating || !promoCode}
                        >
                          {promoValidating ? 'Applying...' : 'Apply'}
                        </Button>
                      </div>
                      {promoError && (
                        <p className="text-xs text-red-600 mt-1">{promoError}</p>
                      )}
                      {appliedPromotion && (
                        <div className="mt-2 p-2 bg-green-50 rounded text-xs">
                          <p className="text-green-800">
                            {appliedPromotion.name} applied!
                          </p>
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Totals */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      {promoDiscount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Discount</span>
                          <span>-${promoDiscount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span>Tax</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                      {orderType === 'delivery' && (
                        <div className="flex justify-between text-sm">
                          <span>Delivery Fee</span>
                          <span>${deliveryFee.toFixed(2)}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>

                    <Button 
                      type="submit"
                      className="w-full" 
                      size="lg"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Complete Order
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-gray-600">
                      By completing this order, you agree to our terms and conditions
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </main>
        <Footer />
      </div>
    </>
  )
}