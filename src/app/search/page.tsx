'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
// import { Card, CardContent } from '@/components/ui/card' // Commented out - may be used later
// import { Badge } from '@/components/ui/badge' // Commented out - may be used later
import { SkeletonGrid } from '@/components/ui/skeleton-card'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { cn } from '@/lib/utils'
import { 
  Search, MapPin, Star, X,
  Grid3X3, List, Shield, Sparkles, TrendingUp, DollarSign,
  Heart, Map
} from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import the map component to avoid SSR issues
const BusinessMap = dynamic(
  () => import('@/components/search/business-map').then(mod => mod.BusinessMap),
  { 
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center">Loading map...</div>
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
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid')
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
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
      <div className="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 border-b border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/50"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Search Container */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                Find Beauty Services
              </h1>
              <p className="text-xl text-gray-600">
                Book appointments with top-rated professionals near you
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2">
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Service Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
                  <Input
                    type="text"
                    value={filters.query}
                    onChange={(e) => handleFilterChange('query', e.target.value)}
                    placeholder='Search services, salons, or treatments'
                    className="w-full pl-12 pr-4 py-4 text-gray-900 placeholder-gray-500 bg-transparent hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 rounded-xl transition-colors text-base border-0"
                  />
                </div>
                
                <div className="h-px sm:h-auto sm:w-px bg-gray-200"></div>
                
                {/* Location Search */}
                <div className="relative flex-1 sm:max-w-xs">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
                  <Input
                    type="text"
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    placeholder="Location"
                    className="w-full pl-12 pr-4 py-4 text-gray-900 placeholder-gray-500 bg-transparent hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 rounded-xl transition-colors text-base border-0"
                  />
                </div>
                
                {/* Search Button */}
                <Button 
                  size="lg"
                  className="sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-colors shadow-sm hover:shadow-md px-8 py-4 text-base font-medium"
                >
                  Search
                </Button>
              </div>
            </div>

            {/* Quick Category Selection */}
            <div className="mt-8">
              <p className="text-sm text-gray-500 mb-4 text-center">Popular categories</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {categories.slice(1, 7).map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => handleFilterChange('category', filters.category === cat.value ? '' : cat.value)}
                    className={cn(
                      "px-5 py-2.5 rounded-full text-sm font-medium transition-colors duration-200",
                      filters.category === cat.value
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Results Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {sortedBusinesses.length} {sortedBusinesses.length === 1 ? 'Result' : 'Results'}
              </h2>
              {filters.query && (
                <p className="text-gray-600 mt-1">for &quot;{filters.query}&quot;</p>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors cursor-pointer"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* View Toggle */}
              <div className="hidden sm:flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                    viewMode === 'grid' 
                      ? "bg-white text-gray-900 shadow-sm" 
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                    viewMode === 'list' 
                      ? "bg-white text-gray-900 shadow-sm" 
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                    viewMode === 'map' 
                      ? "bg-white text-gray-900 shadow-sm" 
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  <Map className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Filters Row */}
          <div className="flex items-center gap-2 mb-8 pb-6 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-500 mr-2">Filter by:</span>
            
            {/* Category Filter */}
            <div className="relative">
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                  filters.category 
                    ? "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border border-indigo-200"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300"
                )}
              >
                <span>{filters.category ? categories.find(c => c.value === filters.category)?.label : 'All Categories'}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showCategoryDropdown && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  {categories.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => {
                        handleFilterChange('category', cat.value)
                        setShowCategoryDropdown(false)
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2.5 text-sm transition-colors",
                        filters.category === cat.value
                          ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Rating Filter */}
            <select
              value={filters.minRating}
              onChange={(e) => handleFilterChange('minRating', e.target.value)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium appearance-none cursor-pointer transition-colors",
                filters.minRating
                  ? "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border border-indigo-200"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300"
              )}
            >
              <option value="">Any Rating</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
            </select>
            
            {/* Active Filters */}
            {filters.city && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                <MapPin className="w-3.5 h-3.5" />
                {filters.city}
                <button 
                  onClick={() => handleFilterChange('city', '')} 
                  className="ml-1 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            
            {filters.query && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                <Search className="w-3.5 h-3.5" />
                {filters.query}
                <button 
                  onClick={() => handleFilterChange('query', '')} 
                  className="ml-1 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {/* Clear all */}
            {activeFiltersCount > 0 && (
              <button
                onClick={() => setFilters({ query: '', category: '', city: '', minRating: '' })}
                className="text-sm text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 font-medium ml-2"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Results */}
          {loading ? (
            <SkeletonGrid count={8} />
          ) : sortedBusinesses.length > 0 ? (
            viewMode === 'map' ? (
              // Map View
              <div className="h-[calc(100vh-16rem)] rounded-xl overflow-hidden border border-gray-200">
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
                    // TODO: Implement search within map bounds
                    console.log('Map bounds changed:', bounds);
                  }}
                />
              </div>
            ) : (
              <div className={cn(
                viewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "max-w-4xl mx-auto space-y-4"
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
                    <div className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-indigo-200 hover:shadow-xl transition-shadow duration-200 h-full">
                      {/* Image */}
                      <div className="relative h-56 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 overflow-hidden">
                        {/* Placeholder pattern */}
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 1px)', backgroundSize: '32px 32px'}}></div>
                        </div>
                        
                        {/* Save Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            toggleSaved(business.id)
                          }}
                          className="absolute top-4 right-4 p-2.5 bg-white rounded-full hover:bg-gray-50 transition-colors shadow-sm border border-gray-200"
                        >
                          <Heart className={cn(
                            "h-4 w-4 transition-colors",
                            isSaved ? "fill-red-500 text-red-500" : "text-gray-600"
                          )} />
                        </button>
                        
                        {/* Badges */}
                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                          {business.isVerified && (
                            <div className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200">
                              <Shield className="h-3.5 w-3.5 text-green-600" />
                              <span className="text-gray-700">Verified</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        {/* Name & Category */}
                        <div className="mb-4">
                          <h3 className="font-semibold text-lg text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 transition-colors line-clamp-1 mb-1">
                            {business.businessName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {business.category.replace(/_/g, ' ')}
                          </p>
                        </div>
                        
                        {/* Location */}
                        <div className="flex items-center text-sm text-gray-600 mb-4">
                          <MapPin className="h-4 w-4 mr-1.5 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{business.city}, {business.state}</span>
                        </div>

                        {/* Rating & Price */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center bg-gray-50 px-2.5 py-1 rounded-lg">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="ml-1 font-semibold text-sm text-gray-900">
                                {avgRating.toFixed(1)}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">
                              ({business.reviews.length})
                            </span>
                          </div>
                          
                          {business.services.length > 0 && (
                            <div className="text-right">
                              <p className="text-xs text-gray-500">From</p>
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
                  // List View Card
                  <Link
                    key={business.id}
                    href={`/business/${business.slug}`}
                    className="block group"
                  >
                    <div className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-indigo-200 hover:shadow-xl transition-shadow duration-200">
                      <div className="flex">
                        {/* Image */}
                        <div className="w-48 sm:w-64 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative flex-shrink-0">
                          {/* Placeholder pattern */}
                          <div className="absolute inset-0 opacity-10">
                            <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 1px)', backgroundSize: '32px 32px'}}></div>
                          </div>
                          
                          {/* Save Button */}
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              toggleSaved(business.id)
                            }}
                            className="absolute top-4 right-4 p-2.5 bg-white rounded-full hover:bg-gray-50 transition-colors shadow-sm border border-gray-200"
                          >
                            <Heart className={cn(
                              "h-4 w-4 transition-colors",
                              isSaved ? "fill-red-500 text-red-500" : "text-gray-600"
                            )} />
                          </button>
                          
                          {/* Badge */}
                          {business.isVerified && (
                            <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200">
                              <Shield className="h-3.5 w-3.5 text-green-600" />
                              <span className="text-gray-700">Verified</span>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-xl text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 transition-colors mb-1">
                                {business.businessName}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {business.category.replace(/_/g, ' ')}
                              </p>
                            </div>
                            
                            {/* Price Desktop */}
                            {business.services.length > 0 && (
                              <div className="hidden sm:block ml-6 text-right">
                                <p className="text-sm text-gray-500">From</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                  ${Math.min(...business.services.map(s => parseFloat(s.price)))}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1.5 text-gray-400" />
                              {business.city}, {business.state}
                            </div>
                            
                            <div className="flex items-center gap-1.5">
                              <div className="flex items-center bg-gray-50 px-2.5 py-1 rounded-lg">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="ml-1 font-semibold text-gray-900">
                                  {avgRating.toFixed(1)}
                                </span>
                              </div>
                              <span className="text-gray-500">
                                ({business.reviews.length} reviews)
                              </span>
                            </div>
                            
                            {business.services.length > 0 && (
                              <span className="text-gray-500">
                                {business.services.length} services available
                              </span>
                            )}
                          </div>

                          {/* Services Preview */}
                          {business.services.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {business.services.slice(0, 3).map((service) => (
                                <span key={service.id} className="inline-flex items-center px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-sm border border-gray-200">
                                  {service.name} <span className="text-gray-400 ml-1.5">$</span>
                                  {service.price}
                                </span>
                              ))}
                              {business.services.length > 3 && (
                                <button className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-lg text-sm font-medium hover:from-indigo-100 hover:to-purple-100 transition-colors">
                                  View all {business.services.length} services
                                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          )}
                          
                          {/* Mobile Price */}
                          {business.services.length > 0 && (
                            <div className="sm:hidden mt-4 pt-4 border-t border-gray-100">
                              <div className="flex items-baseline">
                                <span className="text-sm text-gray-500 mr-2">Starting from</span>
                                <span className="text-xl font-semibold text-gray-900">
                                  ${Math.min(...business.services.map(s => parseFloat(s.price)))}
                                </span>
                              </div>
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
            <div className="flex flex-col items-center justify-center py-24 px-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600 text-center max-w-md mb-8">
                We couldn&apos;t find any businesses matching your search. Try adjusting your filters or search in a different area.
              </p>
              {activeFiltersCount > 0 && (
                <button
                  onClick={() => setFilters({ query: '', category: '', city: '', minRating: '' })}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium transition-colors shadow-lg"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      
      <Footer />
      
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
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