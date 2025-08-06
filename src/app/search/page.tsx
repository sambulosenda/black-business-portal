'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { SkeletonGrid } from '@/components/ui/skeleton-card'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/useDebounce'
import { 
  Search, MapPin, Star, Filter, Grid3X3, List, Map,
  Heart, X, DollarSign, Loader2
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
  const router = useRouter()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid')
  const [sortBy, setSortBy] = useState('recommended')
  const [savedBusinesses, setSavedBusinesses] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [isTyping, setIsTyping] = useState(false)
  
  const [filters, setFilters] = useState({
    query: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
    minRating: searchParams.get('minRating') || '',
    priceMin: '',
    priceMax: '',
  })
  
  // Debounce search query for search-as-you-type
  const debouncedQuery = useDebounce(filters.query, 500)
  const debouncedCity = useDebounce(filters.city, 500)

  useEffect(() => {
    // Auto-focus search input
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [])

  // Update URL with search params
  useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedQuery) params.set('q', debouncedQuery)
    if (filters.category) params.set('category', filters.category)
    if (debouncedCity) params.set('city', debouncedCity)
    if (filters.minRating) params.set('minRating', filters.minRating)
    
    const newUrl = params.toString() ? `?${params.toString()}` : '/search'
    router.push(newUrl, { scroll: false })
  }, [debouncedQuery, debouncedCity, filters.category, filters.minRating, router])

  // Fetch businesses when filters change
  useEffect(() => {
    const fetchBusinesses = async () => {
      // Show loading only if not typing
      if (!isTyping) {
        setLoading(true)
      }
      
      try {
        const params = new URLSearchParams()
        if (debouncedQuery) params.append('q', debouncedQuery)
        if (filters.category) params.append('category', filters.category)
        if (debouncedCity) params.append('city', debouncedCity)
        if (filters.minRating) params.append('minRating', filters.minRating)
        if (filters.priceMin) params.append('priceMin', filters.priceMin)
        if (filters.priceMax) params.append('priceMax', filters.priceMax)

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
        setIsTyping(false)
      }
    }
    
    fetchBusinesses()
  }, [debouncedQuery, debouncedCity, filters.category, filters.minRating, filters.priceMin, filters.priceMax, isTyping])

  const handleFilterChange = (key: string, value: string) => {
    // Set typing state for search and location fields
    if (key === 'query' || key === 'city') {
      setIsTyping(true)
    }
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
      
      {/* Search Header - 8px grid system */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Title Section */}
          <div className="mb-6">
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">Find Services</h1>
            <p className="text-lg text-gray-600">Search from thousands of beauty and wellness professionals</p>
          </div>
          
          {/* Search Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={filters.query}
                onChange={(e) => handleFilterChange('query', e.target.value)}
                placeholder="Search services or businesses"
                className="w-full h-12 pl-12 pr-12 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
              {isTyping && filters.query && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                </div>
              )}
            </div>
            
            {/* Location Input */}
            <div className="sm:w-72 relative">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
              <input
                type="text"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                placeholder="Location"
                className="w-full h-12 pl-12 pr-4 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
            </div>
            
            {/* Search Button - 48px height for touch targets */}
            <button 
              className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout Container */}
      <div className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {/* Desktop Filters Sidebar - aligned with content */}
            <div className="hidden lg:block w-64 flex-shrink-0 py-8">
              <div className="sticky top-8">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Filters</h2>
              
              {/* Categories */}
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Category</h3>
                <div className="space-y-3">
                  {categories.map(cat => (
                    <label key={cat.value} className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="category"
                        value={cat.value}
                        checked={filters.category === cat.value}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">{cat.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Rating */}
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Minimum Rating</h3>
                <select
                  value={filters.minRating}
                  onChange={(e) => handleFilterChange('minRating', e.target.value)}
                  className="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                </select>
              </div>
              
              {/* Price Range */}
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Price Range</h3>
                <div className="flex gap-3 items-center">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.priceMin}
                    onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                    className="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="text-gray-400">–</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.priceMax}
                    onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                    className="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                  className="w-full h-10 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  Clear all filters
                </button>
              )}
              </div>
            </div>
          </div>

            {/* Main Content - 8px grid system */}
            <div className="flex-1 py-8">
              <div className="bg-white rounded-lg border border-gray-200 p-8">
                {/* Results Header */}
                <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {sortedBusinesses.length} {sortedBusinesses.length === 1 ? 'Result' : 'Results'}
                </h2>
                {filters.query && (
                  <p className="text-base text-gray-600 mt-1">Showing results for &quot;{filters.query}&quot;</p>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setShowFilters(true)}
                  className="lg:hidden flex items-center gap-2 h-10 px-4 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="ml-1 bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
                
                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-10 px-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                
                {/* View Toggle */}
                <div className="hidden sm:flex items-center h-10 border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      "px-4 h-full transition-colors",
                      viewMode === 'grid' 
                        ? "bg-gray-100 text-gray-900" 
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                    aria-label="Grid view"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      "px-4 h-full transition-colors border-x border-gray-300",
                      viewMode === 'list' 
                        ? "bg-gray-100 text-gray-900" 
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                    aria-label="List view"
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={cn(
                      "px-4 h-full transition-colors",
                      viewMode === 'map' 
                        ? "bg-gray-100 text-gray-900" 
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                    aria-label="Map view"
                  >
                    <Map className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Active Filters Pills */}
            {activeFiltersCount > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-medium text-gray-700">Active filters:</span>
                  
                  {filters.query && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-200 animate-in fade-in slide-in-from-left duration-300">
                      <Search className="h-3.5 w-3.5" />
                      {filters.query}
                      <button
                        onClick={() => handleFilterChange('query', '')}
                        className="ml-1 hover:bg-indigo-200 rounded-full p-0.5 transition-colors"
                        aria-label="Remove search filter"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  
                  {filters.category && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm font-medium border border-purple-200 animate-in fade-in slide-in-from-left duration-300">
                      {categories.find(c => c.value === filters.category)?.label}
                      <button
                        onClick={() => handleFilterChange('category', '')}
                        className="ml-1 hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                        aria-label="Remove category filter"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  
                  {filters.city && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200 animate-in fade-in slide-in-from-left duration-300">
                      <MapPin className="h-3.5 w-3.5" />
                      {filters.city}
                      <button
                        onClick={() => handleFilterChange('city', '')}
                        className="ml-1 hover:bg-green-200 rounded-full p-0.5 transition-colors"
                        aria-label="Remove location filter"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  
                  {filters.minRating && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-full text-sm font-medium border border-yellow-200 animate-in fade-in slide-in-from-left duration-300">
                      <Star className="h-3.5 w-3.5" />
                      {filters.minRating}+ Stars
                      <button
                        onClick={() => handleFilterChange('minRating', '')}
                        className="ml-1 hover:bg-yellow-200 rounded-full p-0.5 transition-colors"
                        aria-label="Remove rating filter"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  
                  {(filters.priceMin || filters.priceMax) && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-200 animate-in fade-in slide-in-from-left duration-300">
                      <DollarSign className="h-3.5 w-3.5" />
                      ${filters.priceMin || '0'} - ${filters.priceMax || '∞'}
                      <button
                        onClick={() => {
                          handleFilterChange('priceMin', '')
                          handleFilterChange('priceMax', '')
                        }}
                        className="ml-1 hover:bg-emerald-200 rounded-full p-0.5 transition-colors"
                        aria-label="Remove price filter"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  
                  <button
                    onClick={() => setFilters({
                      query: '',
                      category: '',
                      city: '',
                      minRating: '',
                      priceMin: '',
                      priceMax: '',
                    })}
                    className="text-sm text-gray-600 hover:text-gray-800 underline underline-offset-2 transition-colors"
                  >
                    Clear all
                  </button>
                </div>
              </div>
            )}
            
            {/* Results */}
            {loading ? (
              <div className={cn(
                viewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              )}>
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    {viewMode === 'grid' ? (
                      // Enhanced Grid Skeleton
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="h-56 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 relative overflow-hidden">
                          <div className="absolute inset-0 -translate-x-full animate-shimmer">
                            <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
                          <div className="h-4 bg-gray-100 rounded w-1/2 mb-4" />
                          <div className="h-4 bg-gray-100 rounded w-2/3 mb-4" />
                          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-16 bg-gray-100 rounded" />
                              <div className="h-4 w-12 bg-gray-100 rounded" />
                            </div>
                            <div className="text-right">
                              <div className="h-3 w-12 bg-gray-100 rounded mb-1" />
                              <div className="h-5 w-16 bg-gray-200 rounded" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Enhanced List Skeleton
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="flex">
                          <div className="w-64 h-48 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 relative overflow-hidden">
                            <div className="absolute inset-0 -translate-x-full animate-shimmer">
                              <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            </div>
                          </div>
                          <div className="flex-1 p-8">
                            <div className="flex justify-between mb-4">
                              <div className="flex-1 mr-8">
                                <div className="h-6 bg-gray-200 rounded w-2/3 mb-3" />
                                <div className="h-4 bg-gray-100 rounded w-1/3" />
                              </div>
                              <div>
                                <div className="h-4 bg-gray-100 rounded w-20 mb-2" />
                                <div className="h-7 bg-gray-200 rounded w-24" />
                              </div>
                            </div>
                            <div className="flex gap-6 mb-6">
                              <div className="h-4 bg-gray-100 rounded w-32" />
                              <div className="h-4 bg-gray-100 rounded w-24" />
                              <div className="h-4 bg-gray-100 rounded w-28" />
                            </div>
                            <div className="flex gap-2">
                              <div className="h-8 bg-gray-100 rounded w-32" />
                              <div className="h-8 bg-gray-100 rounded w-28" />
                              <div className="h-8 bg-gray-100 rounded w-24" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
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
                      // Grid View Card - 8px grid system
                      <Link
                        key={business.id}
                        href={`/business/${business.slug}`}
                        className="group block"
                      >
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-200 hover:border-gray-300">
                          {/* Image */}
                          <div className="relative h-56 bg-gray-100">
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                toggleSaved(business.id)
                              }}
                              className="absolute top-4 right-4 p-2.5 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
                              aria-label={isSaved ? "Remove from saved" : "Save"}
                            >
                              <Heart className={cn(
                                "h-5 w-5",
                                isSaved ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-gray-600"
                              )} />
                            </button>
                          </div>

                          {/* Content - 24px padding */}
                          <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                              {business.businessName}
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                              {business.category.replace(/_/g, ' ')}
                            </p>
                            
                            <div className="flex items-center text-sm text-gray-600 mb-4">
                              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                              <span className="line-clamp-1">{business.city}, {business.state}</span>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span className="ml-1.5 font-medium text-gray-900">
                                    {avgRating.toFixed(1)}
                                  </span>
                                </div>
                                <span className="text-sm text-gray-500">
                                  ({business.reviews.length})
                                </span>
                              </div>
                              
                              {business.services.length > 0 && (
                                <div className="text-right">
                                  <p className="text-xs text-gray-500 mb-1">From</p>
                                  <p className="text-lg font-semibold text-gray-900">
                                    ${Math.min(...business.services.map(s => parseFloat(s.price)))}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ) : (
                      // List View Card - 8px grid system
                      <Link
                        key={business.id}
                        href={`/business/${business.slug}`}
                        className="block"
                      >
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-200 hover:border-gray-300">
                          <div className="flex">
                            {/* Image */}
                            <div className="relative w-64 h-48 bg-gray-100 flex-shrink-0">
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  toggleSaved(business.id)
                                }}
                                className="absolute top-4 right-4 p-2.5 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
                                aria-label={isSaved ? "Remove from saved" : "Save"}
                              >
                                <Heart className={cn(
                                  "h-5 w-5",
                                  isSaved ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-gray-600"
                                )} />
                              </button>
                            </div>

                            {/* Content - 32px padding */}
                            <div className="flex-1 p-8">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1 mr-8">
                                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    {business.businessName}
                                  </h3>
                                  <p className="text-base text-gray-600">
                                    {business.category.replace(/_/g, ' ')}
                                  </p>
                                </div>
                                
                                {business.services.length > 0 && (
                                  <div className="text-right flex-shrink-0">
                                    <p className="text-sm text-gray-500 mb-1">Starting from</p>
                                    <p className="text-2xl font-semibold text-gray-900">
                                      ${Math.min(...business.services.map(s => parseFloat(s.price)))}
                                    </p>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-2" />
                                  {business.city}, {business.state}
                                </div>
                                
                                <div className="flex items-center">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span className="ml-1.5 font-medium text-gray-900">
                                    {avgRating.toFixed(1)}
                                  </span>
                                  <span className="ml-1">
                                    ({business.reviews.length} reviews)
                                  </span>
                                </div>
                                
                                {business.services.length > 0 && (
                                  <span>
                                    {business.services.length} services available
                                  </span>
                                )}
                              </div>

                              {/* Services Preview */}
                              {business.services.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {business.services.slice(0, 3).map((service) => (
                                    <span 
                                      key={service.id} 
                                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm"
                                    >
                                      {service.name} • ${service.price}
                                    </span>
                                  ))}
                                  {business.services.length > 3 && (
                                    <span className="px-3 py-1.5 text-indigo-600 text-sm font-medium">
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
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                    <p className="text-base text-gray-600">
                      Try adjusting your filters or searching in a different area.
                    </p>
                  </div>
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
                      className="h-10 px-6 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              </div>
            )}
              </div>
            </div>
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