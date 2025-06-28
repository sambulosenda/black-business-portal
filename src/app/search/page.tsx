'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SkeletonGrid } from '@/components/ui/skeleton-card'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { Breadcrumb, BreadcrumbWrapper } from '@/components/ui/breadcrumb'

interface Business {
  id: string
  businessName: string
  slug: string
  category: string
  city: string
  state: string
  isVerified: boolean
  reviews: { rating: number }[]
  services: {
    id: string
    name: string
    price: string
  }[]
}

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'HAIR_SALON', label: 'Hair Salon' },
  { value: 'BARBER_SHOP', label: 'Barber Shop' },
  { value: 'NAIL_SALON', label: 'Nail Salon' },
  { value: 'SPA', label: 'Spa' },
  { value: 'MASSAGE', label: 'Massage' },
  { value: 'MAKEUP', label: 'Makeup' },
  { value: 'SKINCARE', label: 'Skincare' },
  { value: 'WELLNESS', label: 'Wellness' },
  { value: 'OTHER', label: 'Other' },
]

function SearchContent() {
  const searchParams = useSearchParams()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    query: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
    minRating: searchParams.get('minRating') || '',
  })

  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (filters.query) params.append('q', filters.query)
        if (filters.category) params.append('category', filters.category)
        if (filters.city) params.append('city', filters.city)
        if (filters.minRating) params.append('minRating', filters.minRating)

        const response = await fetch(`/api/search?${params.toString()}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        setBusinesses(data.businesses || [])
      } catch (error) {
        console.error('Error fetching businesses:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchBusinesses()
  }, [filters])


  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const calculateAvgRating = (reviews: { rating: number }[]) => {
    if (reviews.length === 0) return 0
    return reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Navigation session={null} />
      <BreadcrumbWrapper>
        <Breadcrumb 
          items={[
            { label: 'Home', href: '/' },
            { label: 'Search Services' }
          ]}
        />
      </BreadcrumbWrapper>
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-3">
              <Card className="p-6 animate-slide-in-left">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
            
            {/* Search */}
            <div className="mb-6">
              <Label htmlFor="search">Search</Label>
              <Input
                type="text"
                id="search"
                value={filters.query}
                onChange={(e) => handleFilterChange('query', e.target.value)}
                placeholder="Business name or service..."
                className="mt-1"
              />
            </div>

            {/* Category */}
            <div className="mb-6">
              <Label htmlFor="category">Category</Label>
              <Select
                id="category"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="mt-1"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </Select>
            </div>

            {/* City */}
            <div className="mb-6">
              <Label htmlFor="city">City</Label>
              <Input
                type="text"
                id="city"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                placeholder="Enter city..."
                className="mt-1"
              />
            </div>

            {/* Minimum Rating */}
            <div className="mb-6">
              <Label htmlFor="minRating">Minimum Rating</Label>
              <Select
                id="minRating"
                value={filters.minRating}
                onChange={(e) => handleFilterChange('minRating', e.target.value)}
                className="mt-1"
              >
                <option value="">Any rating</option>
                <option value="4">4+ stars</option>
                <option value="3">3+ stars</option>
                <option value="2">2+ stars</option>
              </Select>
            </div>

            {/* Clear Filters */}
            <Button
              onClick={() => setFilters({ query: '', category: '', city: '', minRating: '' })}
              variant="outline"
              fullWidth
            >
              Clear all filters
            </Button>
          </Card>
        </div>

        {/* Results */}
        <div className="mt-8 lg:mt-0 lg:col-span-9 animate-slide-in-right">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {filters.category 
                ? `${categories.find(c => c.value === filters.category)?.label} Services`
                : 'All Services'}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {loading ? 'Loading...' : `${businesses.length} businesses found`}
            </p>
          </div>

          {loading ? (
            <SkeletonGrid count={6} />
          ) : businesses.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 stagger">
              {businesses.map((business) => {
                const avgRating = calculateAvgRating(business.reviews)
                return (
                  <Link
                    key={business.id}
                    href={`/business/${business.slug}`}
                    className="block"
                  >
                    <Card className="h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer hover-lift">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {business.businessName}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {business.category.replace(/_/g, ' ')}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {business.city}, {business.state}
                            </p>
                          </div>
                        {business.isVerified && (
                          <Badge variant="success">Verified</Badge>
                        )}
                        </div>
                        
                        {/* Rating */}
                        <div className="mt-3 flex items-center">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(avgRating)
                                    ? 'text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                            <span className="ml-2 text-sm text-gray-500">
                              {avgRating.toFixed(1)} ({business.reviews.length} reviews)
                            </span>
                          </div>
                        </div>

                        {/* Services Preview */}
                        {business.services.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              Popular Services:
                            </p>
                            <div className="space-y-1">
                              {business.services.slice(0, 3).map((service) => (
                                <div
                                  key={service.id}
                                  className="flex justify-between text-sm"
                                >
                                  <span className="text-gray-600">{service.name}</span>
                                  <span className="font-medium text-gray-900">
                                    ${service.price}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </Card>
                  </Link>
                )
              })}
            </div>
          ) : (
            <Card className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your filters or search terms
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
      </main>
      <Footer />
    </div>
  )
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8"><SkeletonGrid count={6} /></div>}>
        <SearchContent />
      </Suspense>
    </div>
  )
}