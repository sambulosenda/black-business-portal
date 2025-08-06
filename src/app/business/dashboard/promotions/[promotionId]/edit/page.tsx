'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ArrowLeft, Calendar as CalendarIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface Service {
  id: string
  name: string
  price: number
}

interface Product {
  id: string
  name: string
  price: number
}

export default function EditPromotionPage({
  params,
}: {
  params: Promise<{ promotionId: string }>
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [services, setServices] = useState<Service[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [promotionId, setPromotionId] = useState<string>('')

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    code: '',
    type: 'PERCENTAGE',
    value: '',
    scope: 'ENTIRE_PURCHASE',
    serviceIds: [] as string[],
    productIds: [] as string[],
    startDate: new Date(),
    endDate: new Date(),
    isActive: true,
    usageLimit: '',
    perCustomerLimit: '',
    minimumAmount: '',
    minimumItems: '',
    firstTimeOnly: false,
    featured: false,
  })

  useEffect(() => {
    params.then((p) => setPromotionId(p.promotionId))
  }, [params])

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    if (session.user.role !== 'BUSINESS_OWNER') {
      router.push('/dashboard')
      return
    }
    if (promotionId) {
      fetchPromotionAndData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status, router, promotionId])

  const fetchPromotionAndData = async () => {
    try {
      // Fetch promotion
      const promotionRes = await fetch(`/api/business/promotions/${promotionId}`)
      if (!promotionRes.ok) {
        throw new Error('Failed to fetch promotion')
      }
      const promotion = await promotionRes.json()

      setFormData({
        name: promotion.name,
        description: promotion.description || '',
        code: promotion.code || '',
        type: promotion.type,
        value: promotion.value.toString(),
        scope: promotion.scope,
        serviceIds: promotion.serviceIds || [],
        productIds: promotion.productIds || [],
        startDate: new Date(promotion.startDate),
        endDate: new Date(promotion.endDate),
        isActive: promotion.isActive,
        usageLimit: promotion.usageLimit?.toString() || '',
        perCustomerLimit: promotion.perCustomerLimit?.toString() || '',
        minimumAmount: promotion.minimumAmount?.toString() || '',
        minimumItems: promotion.minimumItems?.toString() || '',
        firstTimeOnly: promotion.firstTimeOnly,
        featured: promotion.featured,
      })

      // Fetch services
      const servicesRes = await fetch('/api/business/services')
      if (servicesRes.ok) {
        const servicesData = await servicesRes.json()
        setServices(servicesData)
      }

      // Fetch products
      const productsRes = await fetch('/api/business/products')
      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProducts(productsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load promotion')
      router.push('/business/dashboard/promotions')
    }
  }

  const generatePromoCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    setFormData({ ...formData, code })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/business/promotions/${promotionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          value: parseFloat(formData.value),
          usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
          perCustomerLimit: formData.perCustomerLimit ? parseInt(formData.perCustomerLimit) : null,
          minimumAmount: formData.minimumAmount ? parseFloat(formData.minimumAmount) : null,
          minimumItems: formData.minimumItems ? parseInt(formData.minimumItems) : null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update promotion')
      }

      toast.success('Promotion updated successfully!')
      router.push('/business/dashboard/promotions')
    } catch (error) {
      console.error('Error updating promotion:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update promotion')
    } finally {
      setLoading(false)
    }
  }

  const toggleServiceId = (serviceId: string) => {
    setFormData({
      ...formData,
      serviceIds: formData.serviceIds.includes(serviceId)
        ? formData.serviceIds.filter((id) => id !== serviceId)
        : [...formData.serviceIds, serviceId],
    })
  }

  const toggleProductId = (productId: string) => {
    setFormData({
      ...formData,
      productIds: formData.productIds.includes(productId)
        ? formData.productIds.filter((id) => id !== productId)
        : [...formData.productIds, productId],
    })
  }

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-8 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/business/dashboard/promotions')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Promotion</h1>
          <p className="mt-1 text-gray-600">Update your promotion details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Enter the basic details of your promotion</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Promotion Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Summer Special, First Time Discount"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this promotion offers"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="code">Promo Code</Label>
              <div className="flex gap-2">
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., SAVE20"
                />
                <Button type="button" variant="outline" onClick={generatePromoCode}>
                  Generate
                </Button>
              </div>
              <p className="mt-1 text-sm text-gray-500">Leave empty for automatic promotions</p>
            </div>
          </CardContent>
        </Card>

        {/* Discount Details */}
        <Card>
          <CardHeader>
            <CardTitle>Discount Details</CardTitle>
            <CardDescription>Configure the discount type and value</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Discount Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage Off</SelectItem>
                    <SelectItem value="FIXED_AMOUNT">Fixed Amount Off</SelectItem>
                    <SelectItem value="BOGO">Buy One Get One</SelectItem>
                    <SelectItem value="BUNDLE">Bundle Deal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="value">
                  {formData.type === 'PERCENTAGE' ? 'Percentage Off' : 'Amount Off'} *
                </Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder={formData.type === 'PERCENTAGE' ? '20' : '10.00'}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="scope">Applies To *</Label>
              <Select
                value={formData.scope}
                onValueChange={(value) => setFormData({ ...formData, scope: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ENTIRE_PURCHASE">Entire Purchase</SelectItem>
                  <SelectItem value="ALL_SERVICES">All Services</SelectItem>
                  <SelectItem value="SPECIFIC_SERVICES">Specific Services</SelectItem>
                  <SelectItem value="ALL_PRODUCTS">All Products</SelectItem>
                  <SelectItem value="SPECIFIC_PRODUCTS">Specific Products</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.scope === 'SPECIFIC_SERVICES' && services.length > 0 && (
              <div>
                <Label>Select Services</Label>
                <div className="mt-2 max-h-40 space-y-2 overflow-y-auto">
                  {services.map((service) => (
                    <div key={service.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={service.id}
                        checked={formData.serviceIds.includes(service.id)}
                        onCheckedChange={() => toggleServiceId(service.id)}
                      />
                      <Label htmlFor={service.id} className="cursor-pointer text-sm font-normal">
                        {service.name} (${service.price})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formData.scope === 'SPECIFIC_PRODUCTS' && products.length > 0 && (
              <div>
                <Label>Select Products</Label>
                <div className="mt-2 max-h-40 space-y-2 overflow-y-auto">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={product.id}
                        checked={formData.productIds.includes(product.id)}
                        onCheckedChange={() => toggleProductId(product.id)}
                      />
                      <Label htmlFor={product.id} className="cursor-pointer text-sm font-normal">
                        {product.name} (${product.price})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Validity Period */}
        <Card>
          <CardHeader>
            <CardTitle>Validity Period</CardTitle>
            <CardDescription>Set when this promotion is active</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !formData.startDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? format(formData.startDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) => date && setFormData({ ...formData, startDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>End Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !formData.endDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate ? format(formData.endDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) => date && setFormData({ ...formData, endDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Limits */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Limits & Requirements</CardTitle>
            <CardDescription>Set restrictions for this promotion</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="usageLimit">Total Usage Limit</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  placeholder="Unlimited"
                />
              </div>

              <div>
                <Label htmlFor="perCustomerLimit">Per Customer Limit</Label>
                <Input
                  id="perCustomerLimit"
                  type="number"
                  value={formData.perCustomerLimit}
                  onChange={(e) => setFormData({ ...formData, perCustomerLimit: e.target.value })}
                  placeholder="Unlimited"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minimumAmount">Minimum Purchase Amount</Label>
                <Input
                  id="minimumAmount"
                  type="number"
                  step="0.01"
                  value={formData.minimumAmount}
                  onChange={(e) => setFormData({ ...formData, minimumAmount: e.target.value })}
                  placeholder="No minimum"
                />
              </div>

              <div>
                <Label htmlFor="minimumItems">Minimum Items</Label>
                <Input
                  id="minimumItems"
                  type="number"
                  value={formData.minimumItems}
                  onChange={(e) => setFormData({ ...formData, minimumItems: e.target.value })}
                  placeholder="No minimum"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>First-time customers only</Label>
                <p className="text-sm text-gray-500">Limit this promotion to new customers</p>
              </div>
              <Switch
                checked={formData.firstTimeOnly}
                onCheckedChange={(checked) => setFormData({ ...formData, firstTimeOnly: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Display Settings</CardTitle>
            <CardDescription>Control how this promotion appears</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Active</Label>
                <p className="text-sm text-gray-500">Enable this promotion immediately</p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Featured</Label>
                <p className="text-sm text-gray-500">Display prominently on your business page</p>
              </div>
              <Switch
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/business/dashboard/promotions')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            {loading ? 'Updating...' : 'Update Promotion'}
          </Button>
        </div>
      </form>
    </div>
  )
}
