'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import {
  AlertCircle,
  ChevronRight,
  Crown,
  DollarSign,
  Download,
  Filter,
  Loader2,
  Mail,
  Phone,
  Search,
  TrendingUp,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CustomerProfile {
  id: string
  userId: string
  customerName: string
  customerEmail: string
  customerPhone: string | null
  firstVisit: string | null
  lastVisit: string | null
  totalVisits: number
  totalSpent: number
  averageSpent: number
  favoriteService: string | null
  notes: string | null
  tags: string[]
  birthday: string | null
  isVip: boolean
  isBlocked: boolean
  createdAt: string
  updatedAt: string
}

interface CustomerMetrics {
  totalCustomers: number
  newCustomersThisMonth: number
  totalRevenue: number
  averageCustomerValue: number
  topSpenders: CustomerProfile[]
  atRiskCustomers: CustomerProfile[]
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerProfile[]>([])
  const [metrics, setMetrics] = useState<CustomerMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'vip' | 'new' | 'at-risk'>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'spent' | 'visits'>('recent')
  // const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null) // Commented out - may be used later

  useEffect(() => {
    fetchCustomers()
    fetchMetrics()
  }, [])

  useEffect(() => {
    filterAndSortCustomers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customers, searchQuery, filterType, sortBy])

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/business/customers')
      if (response.ok) {
        const data = await response.json()
        setCustomers(data.customers)
      } else {
        toast.error('Failed to fetch customers')
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/business/customers/metrics')
      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
      }
    } catch (error) {
      console.error('Error fetching metrics:', error)
    }
  }

  const filterAndSortCustomers = () => {
    let filtered = [...customers]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (customer) =>
          customer.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (customer.customerPhone && customer.customerPhone.includes(searchQuery))
      )
    }

    // Type filter
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    switch (filterType) {
      case 'vip':
        filtered = filtered.filter((c) => c.isVip)
        break
      case 'new':
        filtered = filtered.filter((c) => c.firstVisit && new Date(c.firstVisit) > thirtyDaysAgo)
        break
      case 'at-risk':
        const ninetyDaysAgo = new Date()
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
        filtered = filtered.filter(
          (c) => c.lastVisit && new Date(c.lastVisit) < ninetyDaysAgo && c.totalVisits > 2
        )
        break
    }

    // Sort
    switch (sortBy) {
      case 'spent':
        filtered.sort((a, b) => Number(b.totalSpent) - Number(a.totalSpent))
        break
      case 'visits':
        filtered.sort((a, b) => b.totalVisits - a.totalVisits)
        break
      case 'recent':
      default:
        filtered.sort((a, b) => {
          const dateA = a.lastVisit ? new Date(a.lastVisit).getTime() : 0
          const dateB = b.lastVisit ? new Date(b.lastVisit).getTime() : 0
          return dateB - dateA
        })
    }

    setFilteredCustomers(filtered)
  }

  const handleExportCustomers = () => {
    // Create CSV content
    const headers = ['Name', 'Email', 'Phone', 'Total Visits', 'Total Spent', 'Last Visit', 'Tags']
    const rows = filteredCustomers.map((customer) => [
      customer.customerName,
      customer.customerEmail,
      customer.customerPhone || '',
      customer.totalVisits.toString(),
      `$${Number(customer.totalSpent).toFixed(2)}`,
      customer.lastVisit ? format(new Date(customer.lastVisit), 'MM/dd/yyyy') : '',
      customer.tags.join(', '),
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `customers-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast.success('Customer data exported')
  }

  const getCustomerSegment = (customer: CustomerProfile) => {
    if (customer.isVip)
      return { label: 'VIP', color: 'bg-gray-100 text-gray-700' }
    if (customer.totalVisits === 1)
      return { label: 'New', color: 'bg-gray-100 text-gray-700' }
    if (customer.totalVisits > 10)
      return { label: 'Regular', color: 'bg-gray-100 text-gray-700' }

    const lastVisitDate = customer.lastVisit ? new Date(customer.lastVisit) : null
    const daysSinceLastVisit = lastVisitDate
      ? Math.floor((new Date().getTime() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24))
      : null

    if (daysSinceLastVisit && daysSinceLastVisit > 90) {
      return { label: 'At Risk', color: 'bg-gray-100 text-gray-700' }
    }

    return { label: 'Active', color: 'bg-gray-100 text-gray-700' }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Customer Management</h1>
          <p className="mt-1 text-sm text-gray-500">Track and manage your customer relationships</p>
        </div>
        <Button onClick={handleExportCustomers} variant="outline" className="hover:bg-gray-50">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="border border-gray-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Customers</CardTitle>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <Users className="h-6 w-6 text-gray-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{metrics.totalCustomers}</div>
              <p className="mt-1 text-xs text-gray-500">
                <span className="font-medium text-gray-700">+{metrics.newCustomersThisMonth}</span>{' '}
                this month
              </p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <DollarSign className="h-6 w-6 text-gray-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                ${Number(metrics.totalRevenue).toFixed(2)}
              </div>
              <p className="mt-1 text-xs text-gray-500">From all customers</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Avg Customer Value
              </CardTitle>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <TrendingUp className="h-6 w-6 text-gray-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                ${Number(metrics.averageCustomerValue).toFixed(2)}
              </div>
              <p className="mt-1 text-xs text-gray-500">Per customer lifetime</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">At Risk</CardTitle>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <AlertCircle className="h-6 w-6 text-gray-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {metrics.atRiskCustomers.length}
              </div>
              <p className="mt-1 text-xs text-gray-500">Haven&apos;t visited in 90+ days</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card className="border border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Customer Database</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute top-2.5 left-2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-gray-200 pl-8"
                />
              </div>
              <Select
                value={filterType}
                onValueChange={(value) => setFilterType(value as 'all' | 'vip' | 'new' | 'at-risk')}
              >
                <SelectTrigger className="w-32">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="new">New (30d)</SelectItem>
                  <SelectItem value="at-risk">At Risk</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as 'recent' | 'spent' | 'visits')}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recent Visit</SelectItem>
                  <SelectItem value="spent">Total Spent</SelectItem>
                  <SelectItem value="visits">Visit Count</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCustomers.length > 0 ? (
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-3">
                  {filteredCustomers.map((customer) => {
                    const segment = getCustomerSegment(customer)
                    return (
                      <Card
                        key={customer.id}
                        className="cursor-pointer border border-gray-200"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>
                                  {customer.customerName
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-gray-900">
                                    {customer.customerName}
                                  </h4>
                                  {customer.isVip && <Crown className="h-4 w-4 text-gray-700" />}
                                  <Badge className={segment.color}>
                                    {segment.label}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Mail className="h-3 w-3 text-gray-400" />
                                    {customer.customerEmail}
                                  </span>
                                  {customer.customerPhone && (
                                    <span className="flex items-center gap-1">
                                      <Phone className="h-3 w-3 text-gray-400" />
                                      {customer.customerPhone}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-6 text-sm">
                              <div className="text-right">
                                <p className="font-semibold text-gray-900">
                                  ${Number(customer.totalSpent).toFixed(2)}
                                </p>
                                <p className="text-xs text-gray-500">Total spent</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-gray-900">
                                  {customer.totalVisits}
                                </p>
                                <p className="text-xs text-gray-500">Visits</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-gray-900">
                                  {customer.lastVisit
                                    ? format(new Date(customer.lastVisit), 'MMM d')
                                    : 'Never'}
                                </p>
                                <p className="text-xs text-gray-500">Last visit</p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                            </div>
                          </div>

                          {customer.tags.length > 0 && (
                            <div className="mt-3 flex gap-2">
                              {customer.tags.map((tag, index) => (
                                <Badge
                                  key={index}
                                  className="bg-gray-100 text-gray-700 text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </ScrollArea>
            ) : (
              <div className="py-12 text-center">
                <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">No customers found</h3>
                <p className="text-sm text-gray-500">
                  {searchQuery || filterType !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Customers will appear here after their first booking'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Spenders */}
      {metrics && metrics.topSpenders.length > 0 && (
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Top Spenders</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Your most valuable customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.topSpenders.map((customer, index) => (
                <div key={customer.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{customer.customerName}</p>
                      <p className="text-sm text-gray-500">{customer.totalVisits} visits</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${customer.totalSpent.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">${customer.averageSpent.toFixed(2)} avg</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
