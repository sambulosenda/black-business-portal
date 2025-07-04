'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { 
  Plus, 
  Calendar, 
  Percent, 
  DollarSign, 
  Tag, 
  Users, 
  TrendingUp,
  Copy,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'
import { format } from 'date-fns'

interface Promotion {
  id: string
  name: string
  description: string | null
  code: string | null
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BOGO' | 'BUNDLE'
  value: number
  scope: 'ALL_SERVICES' | 'SPECIFIC_SERVICES' | 'ALL_PRODUCTS' | 'SPECIFIC_PRODUCTS' | 'ENTIRE_PURCHASE'
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

export default function PromotionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('active')

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
        body: JSON.stringify({ isActive: !isActive })
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
        method: 'DELETE'
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

  const getPromotionTypeIcon = (type: string) => {
    switch (type) {
      case 'PERCENTAGE':
        return <Percent className="w-4 h-4" />
      case 'FIXED_AMOUNT':
        return <DollarSign className="w-4 h-4" />
      case 'BOGO':
      case 'BUNDLE':
        return <Tag className="w-4 h-4" />
      default:
        return <Tag className="w-4 h-4" />
    }
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

  const activePromotions = promotions.filter(p => p.isActive && new Date(p.endDate) > new Date())
  const scheduledPromotions = promotions.filter(p => p.isActive && new Date(p.startDate) > new Date())
  const expiredPromotions = promotions.filter(p => !p.isActive || new Date(p.endDate) <= new Date())

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Promotions</h1>
          <p className="text-gray-600 mt-2">Create and manage special offers for your customers</p>
        </div>
        <Button 
          onClick={() => router.push('/business/dashboard/promotions/new')}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Promotion
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Promotions</p>
              <p className="text-2xl font-bold text-gray-900">{activePromotions.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Tag className="w-6 h-6 text-green-600" />
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
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-gray-900">{scheduledPromotions.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">24%</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Promotions Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="active">Active ({activePromotions.length})</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled ({scheduledPromotions.length})</TabsTrigger>
          <TabsTrigger value="expired">Expired ({expiredPromotions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activePromotions.length === 0 ? (
            <Card className="p-12 text-center">
              <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No active promotions</h3>
              <p className="text-gray-600 mb-4">Create your first promotion to attract more customers</p>
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
}

function PromotionCard({ promotion, onToggle, onDelete, onCopyCode }: PromotionCardProps) {
  const isExpired = new Date(promotion.endDate) <= new Date()
  const isScheduled = new Date(promotion.startDate) > new Date()

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{promotion.name}</h3>
            {promotion.featured && (
              <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                Featured
              </Badge>
            )}
            {promotion.firstTimeOnly && (
              <Badge variant="outline">First-time customers</Badge>
            )}
            {isExpired && (
              <Badge variant="secondary">Expired</Badge>
            )}
            {isScheduled && (
              <Badge variant="outline" className="border-purple-500 text-purple-700">
                Scheduled
              </Badge>
            )}
          </div>

          {promotion.description && (
            <p className="text-gray-600 mb-3">{promotion.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              {getPromotionTypeIcon(promotion.type)}
              <span className="font-medium">
                {getPromotionTypeLabel(promotion.type, promotion.value)}
              </span>
            </div>

            {promotion.code && (
              <div className="flex items-center gap-2">
                <code className="bg-gray-100 px-2 py-1 rounded font-mono">
                  {promotion.code}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onCopyCode(promotion.code!)}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            )}

            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>
                {format(new Date(promotion.startDate), 'MMM d, yyyy')} - 
                {format(new Date(promotion.endDate), 'MMM d, yyyy')}
              </span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-4 h-4" />
              <span>
                {promotion.usageCount} used
                {promotion.usageLimit && ` / ${promotion.usageLimit} limit`}
              </span>
            </div>
          </div>

          {promotion.minimumAmount && (
            <p className="text-sm text-gray-600 mt-2">
              Minimum purchase: ${promotion.minimumAmount}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 ml-4">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onToggle(promotion.id, promotion.isActive)}
            disabled={isExpired}
          >
            {promotion.isActive ? (
              <ToggleRight className="w-4 h-4 text-green-600" />
            ) : (
              <ToggleLeft className="w-4 h-4 text-gray-400" />
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => router.push(`/business/dashboard/promotions/${promotion.id}/edit`)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(promotion.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}