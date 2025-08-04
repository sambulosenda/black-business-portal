'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SkeletonGrid } from '@/components/ui/skeleton-card'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { cn } from '@/lib/utils'
import { 
  Search, MapPin, Star, Filter, Grid3X3, List, Map,
  ChevronDown, Heart, Clock, DollarSign
} from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import the map component to avoid SSR issues
const BusinessMap = dynamic(
  () => import('@/components/search/business-map').then(mod => mod.BusinessMap),
  { 
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-50 flex items-center justify-center text-gray-500">Loading map...</div>
  }
)

interface Business {
  id: string
  businessName: string
  slug: string
  category: string
  city: string
  state: string
  address: string
  latitude?: number | null
  longitude?: number | null
  images?: string[]
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

const sortOptions = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'distance', label: 'Distance' },
]

function SearchContent() {
  const searchParams = useSearchParams()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid')
  const [sortBy, setSortBy] = useState('recommended')
  const [savedBusinesses, setSavedBusinesses] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  const [filters, setFilters] = useState({
    query: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
    minRating: searchParams.get('minRating') || '',
    priceMin: '',
    priceMax: '',
  })

  useEffect(() => {
    // Auto-focus search input
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [])

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
    <div className="min-h-screen flex flex-col bg-white">
      <Navigation session={null} />
      
      {/* Search Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                ref={searchInputRef}
                type="text"
                value={filters.query}
                onChange={(e) => handleFilterChange('query', e.target.value)}
                placeholder="Search services or businesses"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            {/* Location Input */}
            <div className="sm:w-64 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                placeholder="Location"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            {/* Search Button */}
            <Button 
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8"
            >
              Search
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Desktop Filters Sidebar */}
        <div className="hidden lg:block w-64 bg-gray-50 border-r border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-6">Filters</h3>
          
          {/* Categories */}
          <div className="mb-8">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Category</h4>
            <div className="space-y-2">
              {categories.map(cat => (
                <label key={cat.value} className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    value={cat.value}
                    checked={filters.category === cat.value}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{cat.label}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Rating */}
          <div className="mb-8">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Minimum Rating</h4>
            <select
              value={filters.minRating}
              onChange={(e) => handleFilterChange('minRating', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Any Rating</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
            </select>
          </div>
          
          {/* Price Range */}
          <div className="mb-8">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Price Range</h4>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.priceMin}
                onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.priceMax}
                onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <button
              onClick={() => setFilters({
                query: '',
                category: '',
                city: '',
                minRating: '',
                priceMin: '',
                priceMax: '',
              })}
              className="w-full py-2 text-sm text-indigo-600 hover:text-indigo-700"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {sortedBusinesses.length} Results
                </h2>
                {filters.query && (
                  <p className="text-gray-600 mt-1">for "{filters.query}"</p>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setShowFilters(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
                
                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                
                {/* View Toggle */}
                <div className="hidden sm:flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      "px-3 py-2 transition-colors",
                      viewMode === 'grid' 
                        ? "bg-gray-100 text-gray-900" 
                        : "text-gray-600 hover:text-gray-900"
                    )}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      "px-3 py-2 transition-colors border-x border-gray-300",
                      viewMode === 'list' 
                        ? "bg-gray-100 text-gray-900" 
                        : "text-gray-600 hover:text-gray-900"
                    )}
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={cn(
                      "px-3 py-2 transition-colors",
                      viewMode === 'map' 
                        ? "bg-gray-100 text-gray-900" 
                        : "text-gray-600 hover:text-gray-900"
                    )}
                  >
                    <Map className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Results */}
            {loading ? (
              <div className={cn(
                viewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              )}>
                <SkeletonGrid count={6} />
              </div>
            ) : sortedBusinesses.length > 0 ? (
              viewMode === 'map' ? (
                <div className="h-[600px] rounded-lg overflow-hidden border border-gray-200">
                  <BusinessMap
                    businesses={sortedBusinesses.map(b => ({
                      ...b,
                      latitude: b.latitude ?? null,
                      longitude: b.longitude ?? null,
                      images: b.images || [],
                      services: b.services.map(s => ({
                        ...s,
                        price: parseFloat(s.price)
                      }))
                    }))}
                    onBoundsChange={(bounds) => {
                      console.log('Map bounds changed:', bounds);
                    }}
                  />
                </div>
              ) : (
                <div className={cn(
                  viewMode === 'grid' 
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                )}>
                  {sortedBusinesses.map((business) => {
                    const avgRating = calculateAvgRating(business.reviews)
                    const isSaved = savedBusinesses.includes(business.id)
                    
                    return viewMode === 'grid' ? (
                      // Grid View Card
                      <Link
                        key={business.id}
                        href={`/business/${business.slug}`}
                        className="group block"
                      >
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200">
                          {/* Image */}
                          <div className="relative h-48 bg-gray-100">
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                toggleSaved(business.id)
                              }}
                              className="absolute top-3 right-3 p-2 bg-white rounded-full shadow hover:shadow-md transition-shadow"
                            >
                              <Heart className={cn(
                                "h-4 w-4",
                                isSaved ? "fill-red-500 text-red-500" : "text-gray-400"
                              )} />
                            </button>
                          </div>

                          {/* Content */}
                          <div className="p-4">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {business.businessName}
                            </h3>
                            <p className="text-sm text-gray-600 mb-3">
                              {business.category.replace(/_/g, ' ')}
                            </p>
                            
                            <div className="flex items-center text-sm text-gray-600 mb-3">
                              <MapPin className="h-4 w-4 mr-1" />
                              {business.city}, {business.state}
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="ml-1 font-medium">
                                  {avgRating.toFixed(1)}
                                </span>
                                <span className="ml-1 text-gray-500">
                                  ({business.reviews.length})
                                </span>
                              </div>
                              
                              {business.services.length > 0 && (
                                <div className="text-right">
                                  <p className="text-sm text-gray-500">From</p>
                                  <p className="font-semibold">
                                    ${Math.min(...business.services.map(s => parseFloat(s.price)))}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ) : (
                      // List View Card
                      <Link
                        key={business.id}
                        href={`/business/${business.slug}`}
                        className="block"
                      >
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200">
                          <div className="flex">
                            {/* Image */}
                            <div className="relative w-48 h-48 bg-gray-100 flex-shrink-0">
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  toggleSaved(business.id)
                                }}
                                className="absolute top-3 right-3 p-2 bg-white rounded-full shadow hover:shadow-md transition-shadow"
                              >
                                <Heart className={cn(
                                  "h-4 w-4",
                                  isSaved ? "fill-red-500 text-red-500" : "text-gray-400"
                                )} />
                              </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                    {business.businessName}
                                  </h3>
                                  <p className="text-gray-600">
                                    {business.category.replace(/_/g, ' ')}
                                  </p>
                                </div>
                                
                                {business.services.length > 0 && (
                                  <div className="text-right">
                                    <p className="text-sm text-gray-500">Starting from</p>
                                    <p className="text-2xl font-semibold">
                                      ${Math.min(...business.services.map(s => parseFloat(s.price)))}
                                    </p>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  {business.city}, {business.state}
                                </div>
                                
                                <div className="flex items-center">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span className="ml-1 font-medium text-gray-900">
                                    {avgRating.toFixed(1)}
                                  </span>
                                  <span className="ml-1">
                                    ({business.reviews.length} reviews)
                                  </span>
                                </div>
                                
                                {business.services.length > 0 && (
                                  <span>
                                    {business.services.length} services
                                  </span>
                                )}
                              </div>

                              {/* Services Preview */}
                              {business.services.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {business.services.slice(0, 3).map((service) => (
                                    <span 
                                      key={service.id} 
                                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                                    >
                                      {service.name} - ${service.price}
                                    </span>
                                  ))}
                                  {business.services.length > 3 && (
                                    <span className="px-3 py-1 text-indigo-600 text-sm">
                                      +{business.services.length - 3} more
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search in a different area.
                </p>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={() => setFilters({
                      query: '',
                      category: '',
                      city: '',
                      minRating: '',
                      priceMin: '',
                      priceMax: '',
                    })}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
      
      {/* Mobile Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowFilters(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(100vh-5rem)]">
              {/* Mobile filter content - same as desktop */}
              {/* Categories */}
              <div className="mb-8">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Category</h4>
                <div className="space-y-2">
                  {categories.map(cat => (
                    <label key={cat.value} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={cat.value}
                        checked={filters.category === cat.value}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{cat.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Rating */}
              <div className="mb-8">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Minimum Rating</h4>
                <select
                  value={filters.minRating}
                  onChange={(e) => handleFilterChange('minRating', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                </select>
              </div>
              
              {/* Apply Filters Button */}
              <button
                onClick={() => setShowFilters(false)}
                className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
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