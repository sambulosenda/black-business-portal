'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import {
  Calendar,
  Copy,
  DollarSign,
  Edit,
  Gift,
  Package,
  Percent,
  Plus,
  Tag,
  ToggleLeft,
  ToggleRight,
  Trash2,
  TrendingUp,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Promotion {
  id: string
  name: string
  description: string | null
  code: string | null
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BOGO' | 'BUNDLE'
  value: number
  scope:
    | 'ALL_SERVICES'
    | 'SPECIFIC_SERVICES'
    | 'ALL_PRODUCTS'
    | 'SPECIFIC_PRODUCTS'
    | 'ENTIRE_PURCHASE'
  serviceIds: string[]
  productIds: string[]
  startDate: string
  endDate: string
  isActive: boolean
  usageLimit: number | null
  usageCount: number
  perCustomerLimit: number | null
  minimumAmount: number | null
  minimumItems: number | null
  firstTimeOnly: boolean
  featured: boolean
  createdAt: string
  updatedAt: string
}

const getPromotionTypeLabel = (type: string, value: number) => {
  switch (type) {
    case 'PERCENTAGE':
      return `${value}% off`
    case 'FIXED_AMOUNT':
      return `$${value} off`
    case 'BOGO':
      return 'Buy One Get One'
    case 'BUNDLE':
      return 'Bundle Deal'
    default:
      return type
  }
}

const getPromotionTypeIcon = (type: string) => {
  switch (type) {
    case 'PERCENTAGE':
      return <Percent className="h-4 w-4" />
    case 'FIXED_AMOUNT':
      return <DollarSign className="h-4 w-4" />
    case 'BOGO':
      return <Gift className="h-4 w-4" />
    case 'BUNDLE':
      return <Package className="h-4 w-4" />
    default:
      return <Tag className="h-4 w-4" />
  }
}

export default function PromotionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)

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
    fetchPromotions()
  }, [session, status, router])

  const fetchPromotions = async () => {
    try {
      const response = await fetch('/api/business/promotions')
      if (!response.ok) throw new Error('Failed to fetch promotions')
      const data = await response.json()
      setPromotions(data)
    } catch (error) {
      console.error('Error fetching promotions:', error)
      toast.error('Failed to load promotions')
    } finally {
      setLoading(false)
    }
  }

  const togglePromotion = async (promotionId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/business/promotions/${promotionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (!response.ok) throw new Error('Failed to update promotion')

      toast.success(`Promotion ${!isActive ? 'activated' : 'deactivated'}`)
      fetchPromotions()
    } catch (error) {
      console.error('Error updating promotion:', error)
      toast.error('Failed to update promotion')
    }
  }

  const deletePromotion = async (promotionId: string) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return

    try {
      const response = await fetch(`/api/business/promotions/${promotionId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete promotion')

      toast.success('Promotion deleted successfully')
      fetchPromotions()
    } catch (error) {
      console.error('Error deleting promotion:', error)
      toast.error('Failed to delete promotion')
    }
  }

  const copyPromoCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Promo code copied to clipboard')
  }

  // const getPromotionTypeIcon = (type: string) => {
  //   switch (type) {
  //     case 'PERCENTAGE':
  //       return <Percent className="w-4 h-4" />
  //     case 'FIXED_AMOUNT':
  //       return <DollarSign className="w-4 h-4" />
  //     case 'BOGO':
  //     case 'BUNDLE':
  //       return <Tag className="w-4 h-4" />
  //     default:
  //       return <Tag className="w-4 h-4" />
  //   }
  // }

  const activePromotions = promotions.filter((p) => p.isActive && new Date(p.endDate) > new Date())
  const scheduledPromotions = promotions.filter(
    (p) => p.isActive && new Date(p.startDate) > new Date()
  )
  const expiredPromotions = promotions.filter(
    (p) => !p.isActive || new Date(p.endDate) <= new Date()
  )

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/4 rounded bg-gray-200"></div>
          <div className="h-64 rounded bg-gray-200"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Promotions</h1>
          <p className="mt-2 text-gray-600">Create and manage special offers for your customers</p>
        </div>
        <Button
          onClick={() => router.push('/business/dashboard/promotions/new')}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Promotion
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Promotions</p>
              <p className="text-2xl font-bold text-gray-900">{activePromotions.length}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Tag className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Usage</p>
              <p className="text-2xl font-bold text-gray-900">
                {promotions.reduce((sum, p) => sum + p.usageCount, 0)}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-gray-900">{scheduledPromotions.length}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">24%</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
              <TrendingUp className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Promotions Tabs */}
      <Tabs defaultValue="active">
        <TabsList className="mb-6">
          <TabsTrigger value="active">Active ({activePromotions.length})</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled ({scheduledPromotions.length})</TabsTrigger>
          <TabsTrigger value="expired">Expired ({expiredPromotions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activePromotions.length === 0 ? (
            <Card className="p-12 text-center">
              <Tag className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">No active promotions</h3>
              <p className="mb-4 text-gray-600">
                Create your first promotion to attract more customers
              </p>
              <Button onClick={() => router.push('/business/dashboard/promotions/new')}>
                Create Promotion
              </Button>
            </Card>
          ) : (
            activePromotions.map((promotion) => (
              <PromotionCard
                key={promotion.id}
                promotion={promotion}
                onToggle={togglePromotion}
                onDelete={deletePromotion}
                onCopyCode={copyPromoCode}
                router={router}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          {scheduledPromotions.map((promotion) => (
            <PromotionCard
              key={promotion.id}
              promotion={promotion}
              onToggle={togglePromotion}
              onDelete={deletePromotion}
              onCopyCode={copyPromoCode}
              router={router}
            />
          ))}
        </TabsContent>

        <TabsContent value="expired" className="space-y-4">
          {expiredPromotions.map((promotion) => (
            <PromotionCard
              key={promotion.id}
              promotion={promotion}
              onToggle={togglePromotion}
              onDelete={deletePromotion}
              onCopyCode={copyPromoCode}
              router={router}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface PromotionCardProps {
  promotion: Promotion
  onToggle: (id: string, isActive: boolean) => void
  onDelete: (id: string) => void
  onCopyCode: (code: string) => void
  router: ReturnType<typeof useRouter>
}

function PromotionCard({ promotion, onToggle, onDelete, onCopyCode, router }: PromotionCardProps) {
  const isExpired = new Date(promotion.endDate) <= new Date()
  const isScheduled = new Date(promotion.startDate) > new Date()

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900">{promotion.name}</h3>
            {promotion.featured && (
              <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                Featured
              </Badge>
            )}
            {promotion.firstTimeOnly && <Badge variant="outline">First-time customers</Badge>}
            {isExpired && <Badge variant="outline">Expired</Badge>}
            {isScheduled && (
              <Badge variant="outline" className="border-purple-500 text-purple-700">
                Scheduled
              </Badge>
            )}
          </div>

          {promotion.description && <p className="mb-3 text-gray-600">{promotion.description}</p>}

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              {getPromotionTypeIcon(promotion.type)}
              <span className="font-medium">
                {getPromotionTypeLabel(promotion.type, promotion.value)}
              </span>
            </div>

            {promotion.code && (
              <div className="flex items-center gap-2">
                <code className="rounded bg-gray-100 px-2 py-1 font-mono">{promotion.code}</code>
                <Button size="sm" variant="ghost" onClick={() => onCopyCode(promotion.code!)}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}

            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>
                {format(new Date(promotion.startDate), 'MMM d, yyyy')} -
                {format(new Date(promotion.endDate), 'MMM d, yyyy')}
              </span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <Users className="h-4 w-4" />
              <span>
                {promotion.usageCount} used
                {promotion.usageLimit && ` / ${promotion.usageLimit} limit`}
              </span>
            </div>
          </div>

          {promotion.minimumAmount && (
            <p className="mt-2 text-sm text-gray-600">
              Minimum purchase: ${promotion.minimumAmount}
            </p>
          )}
        </div>

        <div className="ml-4 flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onToggle(promotion.id, promotion.isActive)}
            disabled={isExpired}
          >
            {promotion.isActive ? (
              <ToggleRight className="h-4 w-4 text-green-600" />
            ) : (
              <ToggleLeft className="h-4 w-4 text-gray-400" />
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => router.push(`/business/dashboard/promotions/${promotion.id}/edit`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(promotion.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
