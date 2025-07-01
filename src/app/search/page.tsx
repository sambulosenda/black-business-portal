'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SkeletonGrid } from '@/components/ui/skeleton-card'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { EmptyState } from '@/components/ui/empty-state'
import { cn } from '@/lib/utils'
import { 
  Search, MapPin, Star, Filter, X,
  Grid3X3, List, Shield, Sparkles, TrendingUp, DollarSign,
  Heart
} from 'lucide-react'

interface Business {
  id: string
  businessName: string
  slug: string
  category: string
  city: string
  state: string
  address: string
  isVerified: boolean
  reviews: { rating: number }[]
  services: {
    id: string
    name: string
    price: string
  }[]
  availabilities?: {
    dayOfWeek: number
    startTime: string
    endTime: string
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

const sortOptions = [
  { value: 'recommended', label: 'Recommended', icon: Sparkles },
  { value: 'rating', label: 'Top Rated', icon: Star },
  { value: 'reviews', label: 'Most Reviewed', icon: TrendingUp },
  { value: 'price_low', label: 'Price: Low to High', icon: DollarSign },
  { value: 'price_high', label: 'Price: High to Low', icon: DollarSign },
]

function SearchContent() {
  const searchParams = useSearchParams()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [sortBy, setSortBy] = useState('recommended')
  const [savedBusinesses, setSavedBusinesses] = useState<string[]>([])
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

  const toggleSaved = (businessId: string) => {
    setSavedBusinesses(prev => 
      prev.includes(businessId) 
        ? prev.filter(id => id !== businessId)
        : [...prev, businessId]
    )
  }

  // Sort businesses
  const sortedBusinesses = [...businesses].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return calculateAvgRating(b.reviews) - calculateAvgRating(a.reviews)
      case 'reviews':
        return b.reviews.length - a.reviews.length
      case 'price_low':
        const aMinPrice = Math.min(...a.services.map(s => parseFloat(s.price)))
        const bMinPrice = Math.min(...b.services.map(s => parseFloat(s.price)))
        return aMinPrice - bMinPrice
      case 'price_high':
        const aMaxPrice = Math.max(...a.services.map(s => parseFloat(s.price)))
        const bMaxPrice = Math.max(...b.services.map(s => parseFloat(s.price)))
        return bMaxPrice - aMaxPrice
      default:
        return 0
    }
  })

  const activeFiltersCount = Object.values(filters).filter(v => v).length

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation session={null} />
      
      {/* Hero Search Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Search Container */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex flex-col md:flex-row gap-3">
                {/* Service Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                    <Input
                      type="text"
                      value={filters.query}
                      onChange={(e) => handleFilterChange('query', e.target.value)}
                      placeholder="Search services or businesses..."
                      className="pl-10 pr-4 h-11 border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg"
                    />
                  </div>
                </div>
                
                {/* Location Search */}
                <div className="md:w-72">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                    <Input
                      type="text"
                      value={filters.city}
                      onChange={(e) => handleFilterChange('city', e.target.value)}
                      placeholder="Location"
                      className="pl-10 pr-4 h-11 border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg"
                    />
                  </div>
                </div>
                
                {/* Search Button */}
                <Button 
                  size="lg"
                  className="h-11 px-8 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                >
                  Search
                </Button>
              </div>
            </div>

            {/* Popular Categories */}
            <div className="mt-10">
              <div className="flex flex-wrap justify-center gap-3">
                {categories.slice(1, 7).map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => handleFilterChange('category', filters.category === cat.value ? '' : cat.value)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      filters.category === cat.value
                        ? "bg-white text-indigo-600"
                        : "bg-white/10 text-white border border-white/20 hover:bg-white/20"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
                <button
                  onClick={() => handleFilterChange('category', '')}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    filters.category === ''
                      ? "bg-white text-indigo-600"
                      : "bg-white/10 text-white border border-white/20 hover:bg-white/20"
                  )}
                >
                  All Services
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Results Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {filters.category 
                  ? categories.find(c => c.value === filters.category)?.label
                  : 'All Services'}
                {filters.city && ` in ${filters.city}`}
              </h1>
              <p className="text-gray-600 mt-2">
                {loading ? 'Searching...' : `${sortedBusinesses.length} businesses found`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile Filter Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMobileFilters(true)}
                className="md:hidden"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="outline" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* View Mode Toggle */}
              <div className="hidden md:flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "p-2 rounded",
                    viewMode === 'grid' ? "bg-white shadow-sm" : "text-gray-600"
                  )}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "p-2 rounded",
                    viewMode === 'list' ? "bg-white shadow-sm" : "text-gray-600"
                  )}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Desktop Filters Sidebar */}
            <aside className="hidden md:block lg:col-span-3">
              <div className="sticky top-4 space-y-4">
                {/* Categories */}
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
                  <div className="space-y-2">
                    {categories.map(cat => (
                      <button
                        key={cat.value}
                        onClick={() => handleFilterChange('category', cat.value)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                          filters.category === cat.value
                            ? "bg-indigo-600 text-white"
                            : "hover:bg-indigo-50 hover:text-indigo-600"
                        )}
                      >
                        <span className="flex items-center">
                          {cat.label}
                        </span>
                        {filters.category === cat.value && (
                          <X className="h-4 w-4" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rating Filter */}
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <h3 className="font-semibold text-gray-900 mb-3">Minimum Rating</h3>
                  <div className="space-y-2">
                    {['', '4', '3', '2'].map(rating => (
                      <button
                        key={rating}
                        onClick={() => handleFilterChange('minRating', rating)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                          filters.minRating === rating
                            ? "bg-indigo-600 text-white"
                            : "hover:bg-indigo-50 hover:text-indigo-600"
                        )}
                      >
                        <span className="flex items-center">
                          {rating ? (
                            <>
                              {[...Array(parseInt(rating))].map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              ))}
                              <span className="ml-2">{rating}+ stars</span>
                            </>
                          ) : (
                            'Any rating'
                          )}
                        </span>
                        {filters.minRating === rating && rating && (
                          <X className="h-4 w-4" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                {activeFiltersCount > 0 && (
                  <Button
                    onClick={() => setFilters({ query: '', category: '', city: '', minRating: '' })}
                    variant="outline"
                    className="w-full"
                  >
                    Clear all filters
                  </Button>
                )}
              </div>
            </aside>

            {/* Results Grid/List */}
            <div className="lg:col-span-9">
              {loading ? (
                <SkeletonGrid count={6} />
              ) : sortedBusinesses.length > 0 ? (
                <div className={cn(
                  viewMode === 'grid' 
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                )}>
                  {sortedBusinesses.map((business, index) => {
                    const avgRating = calculateAvgRating(business.reviews)
                    const isSaved = savedBusinesses.includes(business.id)
                    
                    return viewMode === 'grid' ? (
                      // Grid View Card
                      <div
                        key={business.id}
                        className="group"
                        style={{
                          animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                        }}
                      >
                        <Card className="h-full overflow-hidden border border-gray-200 hover:border-indigo-300 transition-all duration-200">
                          {/* Image Placeholder */}
                          <div className="relative h-40 bg-gradient-to-br from-gray-50 to-gray-100">
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                toggleSaved(business.id)
                              }}
                              className="absolute top-2 right-2 p-1.5 bg-white rounded-full hover:bg-gray-50 transition-colors"
                            >
                              <Heart className={cn(
                                "h-4 w-4 transition-colors",
                                isSaved ? "fill-red-500 text-red-500" : "text-gray-600"
                              )} />
                            </button>
                            {business.isVerified && (
                              <div className="absolute top-2 left-2 flex items-center gap-1 bg-white px-2 py-1 rounded-md text-xs font-medium border border-gray-200">
                                <Shield className="h-3 w-3 text-green-600" />
                                <span className="text-gray-700">Verified</span>
                              </div>
                            )}
                          </div>

                          <CardContent className="p-4">
                            <Link
                              href={`/business/${business.slug}`}
                              className="block"
                            >
                              <div className="space-y-2">
                                {/* Business Name & Category */}
                                <div>
                                  <h3 className="font-semibold text-base text-gray-900 hover:text-indigo-600 transition-colors line-clamp-1">
                                    {business.businessName}
                                  </h3>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {business.category.replace(/_/g, ' ')}
                                  </p>
                                </div>
                                
                                {/* Location */}
                                <div className="flex items-center text-xs text-gray-600">
                                  <MapPin className="h-3 w-3 mr-1 flex-shrink-0 text-gray-400" />
                                  <span className="line-clamp-1">{business.city}, {business.state}</span>
                                </div>

                                {/* Rating */}
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={cn(
                                          "h-4 w-4",
                                          i < Math.floor(avgRating)
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "fill-gray-100 text-gray-100"
                                        )}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-700 font-medium">
                                    {avgRating.toFixed(1)}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    ({business.reviews.length} reviews)
                                  </span>
                                </div>

                                {/* Price & Services */}
                                {business.services.length > 0 && (
                                  <div className="pt-2 border-t border-gray-100">
                                    <div className="flex items-center justify-between">
                                      <p className="text-xs text-gray-600">
                                        {business.services.length} services
                                      </p>
                                      <p className="text-sm font-semibold text-gray-900">
                                        From ${Math.min(...business.services.map(s => parseFloat(s.price)))}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </Link>
                          </CardContent>
                        </Card>
                      </div>
                    ) : (
                      // List View Card
                      <Card
                        key={business.id}
                        className="overflow-hidden border border-gray-200 hover:border-indigo-300 transition-all duration-200"
                        style={{
                          animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                        }}
                      >
                        <div className="flex">
                          {/* Image */}
                          <div className="w-48 h-full bg-gradient-to-br from-gray-50 to-gray-100 relative">
                          </div>

                          {/* Content */}
                          <CardContent className="flex-1 p-5">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <Link
                                  href={`/business/${business.slug}`}
                                  className="block"
                                >
                                  <h3 className="font-semibold text-lg text-gray-900 hover:text-indigo-600 transition-colors">
                                    {business.businessName}
                                  </h3>
                                </Link>
                                <p className="text-gray-500 mt-1">
                                  {business.category.replace(/_/g, ' ')}
                                </p>

                                <div className="flex items-center gap-4 mt-3">
                                  <div className="flex items-center text-sm text-gray-600">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    {business.city}, {business.state}
                                  </div>
                                  {business.isVerified && (
                                    <Badge variant="success" className="text-xs">
                                      <Shield className="h-3 w-3 mr-1" />
                                      Verified
                                    </Badge>
                                  )}
                                </div>

                                {/* Rating */}
                                <div className="flex items-center mt-3">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={cn(
                                        "h-4 w-4",
                                        i < Math.floor(avgRating)
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-gray-200"
                                      )}
                                    />
                                  ))}
                                  <span className="ml-2 font-medium">
                                    {avgRating.toFixed(1)}
                                  </span>
                                  <span className="text-gray-400 text-sm ml-1">
                                    ({business.reviews.length} reviews)
                                  </span>
                                </div>

                                {/* Services Preview */}
                                {business.services.length > 0 && (
                                  <div className="mt-4 flex flex-wrap gap-2">
                                    {business.services.slice(0, 3).map((service) => (
                                      <Badge key={service.id} variant="outline">
                                        {service.name} • ${service.price}
                                      </Badge>
                                    ))}
                                    {business.services.length > 3 && (
                                      <Badge variant="outline">
                                        +{business.services.length - 3} more
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-col items-end gap-3 ml-4">
                                <button
                                  onClick={(e) => {
                                    e.preventDefault()
                                    toggleSaved(business.id)
                                  }}
                                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                  <Heart className={cn(
                                    "h-5 w-5",
                                    isSaved ? "fill-red-500 text-red-500" : "text-gray-400"
                                  )} />
                                </button>
                                {business.services.length > 0 && (
                                  <p className="text-lg font-semibold">
                                    From ${Math.min(...business.services.map(s => parseFloat(s.price)))}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <Card className="p-12">
                  <EmptyState
                    icon="search"
                    title="No businesses found"
                    description="Try adjusting your filters or search in a different area"
                    action={{
                      label: "Clear filters",
                      onClick: () => setFilters({ query: '', category: '', city: '', minRating: '' })
                    }}
                  />
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowMobileFilters(false)}>
          <div
            className="absolute right-0 top-0 h-full w-full max-w-sm bg-white border-l border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-120px)]">
              {/* Categories */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Categories</h3>
                <div className="space-y-2">
                  {categories.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => handleFilterChange('category', cat.value)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm",
                        filters.category === cat.value
                          ? "bg-indigo-600 text-white"
                          : "hover:bg-indigo-50 hover:text-indigo-600"
                      )}
                    >
                      <span className="flex items-center">
                        {cat.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Minimum Rating</h3>
                <div className="space-y-2">
                  {['', '4', '3', '2'].map(rating => (
                    <button
                      key={rating}
                      onClick={() => handleFilterChange('minRating', rating)}
                      className={cn(
                        "w-full flex items-center px-3 py-2 rounded-lg text-sm",
                        filters.minRating === rating
                          ? "bg-indigo-600 text-white"
                          : "hover:bg-indigo-50 hover:text-indigo-600"
                      )}
                    >
                      {rating ? (
                        <>
                          {[...Array(parseInt(rating))].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                          <span className="ml-2">{rating}+ stars</span>
                        </>
                      ) : (
                        'Any rating'
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
              <Button
                onClick={() => setShowMobileFilters(false)}
                className="w-full"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8"><SkeletonGrid count={6} /></div>}>
      <SearchContent />
    </Suspense>
  )
}