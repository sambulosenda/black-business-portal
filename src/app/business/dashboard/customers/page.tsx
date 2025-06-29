'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search, User, Calendar, DollarSign, Star, MessageSquare, 
  Phone, Mail, Loader2, Filter, Download, TrendingUp, Clock,
  ChevronRight, Users, Crown, AlertCircle
} from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

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
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null)

  useEffect(() => {
    fetchCustomers()
    fetchMetrics()
  }, [])

  useEffect(() => {
    filterAndSortCustomers()
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
      filtered = filtered.filter(customer =>
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
        filtered = filtered.filter(c => c.isVip)
        break
      case 'new':
        filtered = filtered.filter(c => 
          c.firstVisit && new Date(c.firstVisit) > thirtyDaysAgo
        )
        break
      case 'at-risk':
        const ninetyDaysAgo = new Date()
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
        filtered = filtered.filter(c => 
          c.lastVisit && new Date(c.lastVisit) < ninetyDaysAgo && c.totalVisits > 2
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
    const rows = filteredCustomers.map(customer => [
      customer.customerName,
      customer.customerEmail,
      customer.customerPhone || '',
      customer.totalVisits.toString(),
      `$${Number(customer.totalSpent).toFixed(2)}`,
      customer.lastVisit ? format(new Date(customer.lastVisit), 'MM/dd/yyyy') : '',
      customer.tags.join(', ')
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
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
    if (customer.isVip) return { label: 'VIP', color: 'bg-purple-100 text-purple-700' }
    if (customer.totalVisits === 1) return { label: 'New', color: 'bg-green-100 text-green-700' }
    if (customer.totalVisits > 10) return { label: 'Regular', color: 'bg-blue-100 text-blue-700' }
    
    const lastVisitDate = customer.lastVisit ? new Date(customer.lastVisit) : null
    const daysSinceLastVisit = lastVisitDate 
      ? Math.floor((new Date().getTime() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24))
      : null
    
    if (daysSinceLastVisit && daysSinceLastVisit > 90) {
      return { label: 'At Risk', color: 'bg-red-100 text-red-700' }
    }
    
    return { label: 'Active', color: 'bg-gray-100 text-gray-700' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customer Management</h1>
          <p className="text-muted-foreground">Track and manage your customer relationships</p>
        </div>
        <Button onClick={handleExportCustomers} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalCustomers}</div>
              <p className="text-xs text-muted-foreground">
                +{metrics.newCustomersThisMonth} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${Number(metrics.totalRevenue).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                From all customers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Customer Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${Number(metrics.averageCustomerValue).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Per customer lifetime
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">At Risk</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.atRiskCustomers.length}</div>
              <p className="text-xs text-muted-foreground">
                Haven't visited in 90+ days
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Customer Database</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="w-32">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="new">New (30d)</SelectItem>
                  <SelectItem value="at-risk">At Risk</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
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
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>
                                  {customer.customerName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold">{customer.customerName}</h4>
                                  {customer.isVip && (
                                    <Crown className="h-4 w-4 text-purple-600" />
                                  )}
                                  <Badge className={segment.color} variant="secondary">
                                    {segment.label}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {customer.customerEmail}
                                  </span>
                                  {customer.customerPhone && (
                                    <span className="flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      {customer.customerPhone}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-6 text-sm">
                              <div className="text-right">
                                <p className="font-semibold">${Number(customer.totalSpent).toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">Total spent</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">{customer.totalVisits}</p>
                                <p className="text-xs text-muted-foreground">Visits</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">
                                  {customer.lastVisit 
                                    ? format(new Date(customer.lastVisit), 'MMM d')
                                    : 'Never'
                                  }
                                </p>
                                <p className="text-xs text-muted-foreground">Last visit</p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                          
                          {customer.tags.length > 0 && (
                            <div className="flex gap-2 mt-3">
                              {customer.tags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
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
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No customers found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || filterType !== 'all' 
                    ? 'Try adjusting your filters'
                    : 'Customers will appear here after their first booking'
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Spenders */}
      {metrics && metrics.topSpenders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Spenders</CardTitle>
            <CardDescription>Your most valuable customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.topSpenders.map((customer, index) => (
                <div key={customer.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{customer.customerName}</p>
                      <p className="text-sm text-muted-foreground">{customer.totalVisits} visits</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${customer.totalSpent.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      ${customer.averageSpent.toFixed(2)} avg
                    </p>
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