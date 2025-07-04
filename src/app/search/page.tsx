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
      <div className="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Search Container */}
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Find your perfect beauty match
              </h1>
              <p className="text-lg text-gray-600">
                Discover top-rated beauty services near you
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Service Search */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
                  <Input
                    type="text"
                    value={filters.query}
                    onChange={(e) => handleFilterChange('query', e.target.value)}
                    placeholder='Try "braids", "nails", or "spa"'
                    className="w-full pl-12 pr-4 py-4 text-gray-900 placeholder-gray-500 bg-gray-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl transition-all text-base"
                  />
                </div>
                
                {/* Location Search */}
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
                  <Input
                    type="text"
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    placeholder="City or neighborhood"
                    className="w-full pl-12 pr-4 py-4 text-gray-900 placeholder-gray-500 bg-gray-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl transition-all text-base"
                  />
                </div>
              </div>
              
              {/* Search Button */}
              <Button 
                size="lg"
                className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transform hover:-translate-y-0.5 transition-all shadow-lg hover:shadow-xl py-4 text-lg font-semibold"
              >
                Search Services
              </Button>
            </div>

            {/* Category Pills - Horizontal Scrollable */}
            <div className="mt-8">
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                <button
                  onClick={() => handleFilterChange('category', '')}
                  className={cn(
                    "flex-shrink-0 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap",
                    filters.category === ''
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                      : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300"
                  )}
                >
                  All Services
                </button>
                {categories.slice(1).map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => handleFilterChange('category', filters.category === cat.value ? '' : cat.value)}
                    className={cn(
                      "flex-shrink-0 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap",
                      filters.category === cat.value
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                        : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300"
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters Bar */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Left side - Active filters */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-medium text-gray-700">Filters:</span>
                
                {/* Category Filter Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    className={cn(
                      "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                      filters.category 
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}
                  >
                    <span>{filters.category ? categories.find(c => c.value === filters.category)?.label : 'All Categories'}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Category dropdown menu */}
                  {showCategoryDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-20">
                      {categories.map(cat => (
                        <button
                          key={cat.value}
                          onClick={() => {
                            handleFilterChange('category', cat.value)
                            setShowCategoryDropdown(false)
                          }}
                          className={cn(
                            "w-full text-left px-4 py-2 rounded-lg text-sm transition-all",
                            filters.category === cat.value
                              ? "bg-indigo-50 text-indigo-600 font-medium"
                              : "hover:bg-gray-50"
                          )}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Rating Filter */}
                <div className="relative">
                  <select
                    value={filters.minRating}
                    onChange={(e) => handleFilterChange('minRating', e.target.value)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-medium appearance-none cursor-pointer transition-all",
                      filters.minRating
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}
                  >
                    <option value="">Any Rating</option>
                    <option value="4">4+ Stars</option>
                    <option value="3">3+ Stars</option>
                    <option value="2">2+ Stars</option>
                  </select>
                </div>

                {/* Location tag */}
                {filters.city && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm">
                    <MapPin className="w-3 h-3" />
                    {filters.city}
                    <button onClick={() => handleFilterChange('city', '')} className="ml-1 hover:text-purple-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {/* Clear all */}
                {activeFiltersCount > 0 && (
                  <button
                    onClick={() => setFilters({ query: '', category: '', city: '', minRating: '' })}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Right side - Sort and View */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">{sortedBusinesses.length} results</span>
                
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {/* View Toggle */}
                <div className="hidden sm:flex items-center bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      "p-2 rounded-lg transition-all",
                      viewMode === 'grid' ? "bg-white shadow-sm text-indigo-600" : "text-gray-600"
                    )}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      "p-2 rounded-lg transition-all",
                      viewMode === 'list' ? "bg-white shadow-sm text-indigo-600" : "text-gray-600"
                    )}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          {loading ? (
            <SkeletonGrid count={8} />
          ) : sortedBusinesses.length > 0 ? (
            <div className={cn(
              viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "max-w-4xl mx-auto space-y-4"
            )}>
              {sortedBusinesses.map((business, index) => {
                const avgRating = calculateAvgRating(business.reviews)
                const isSaved = savedBusinesses.includes(business.id)
                
                return viewMode === 'grid' ? (
                  // Grid View Card
                  <Link
                    key={business.id}
                    href={`/business/${business.slug}`}
                    className="group block animate-fadeIn"
                    style={{
                      animationDelay: `${index * 50}ms`
                    }}
                  >
                    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-indigo-200 hover:shadow-2xl transition-all duration-300 h-full">
                      {/* Image */}
                      <div className="relative h-48 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        
                        {/* Save Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            toggleSaved(business.id)
                          }}
                          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all shadow-md"
                        >
                          <Heart className={cn(
                            "h-4 w-4 transition-colors",
                            isSaved ? "fill-red-500 text-red-500" : "text-gray-700"
                          )} />
                        </button>
                        
                        {/* Badge */}
                        {business.isVerified && (
                          <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium">
                            <Shield className="h-3.5 w-3.5 text-green-600" />
                            <span className="text-gray-800">Verified</span>
                          </div>
                        )}
                        
                        {/* Price Tag */}
                        {business.services.length > 0 && (
                          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                            <p className="text-sm font-bold text-gray-900">
                              From ${Math.min(...business.services.map(s => parseFloat(s.price)))}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <div className="space-y-3">
                          {/* Name & Category */}
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                              {business.businessName}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {business.category.replace(/_/g, ' ')}
                            </p>
                          </div>
                          
                          {/* Location */}
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-1.5 text-gray-400" />
                            <span>{business.city}, {business.state}</span>
                          </div>

                          {/* Rating & Reviews */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center">
                                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                <span className="ml-1 font-semibold text-gray-900">
                                  {avgRating.toFixed(1)}
                                </span>
                              </div>
                              <span className="text-sm text-gray-500">
                                ({business.reviews.length})
                              </span>
                            </div>
                            
                            {business.services.length > 0 && (
                              <span className="text-sm text-gray-500">
                                {business.services.length} services
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  // List View Card
                  <Link
                    key={business.id}
                    href={`/business/${business.slug}`}
                    className="block animate-fadeIn"
                    style={{
                      animationDelay: `${index * 50}ms`
                    }}
                  >
                    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-indigo-200 hover:shadow-2xl transition-all duration-300">
                      <div className="flex">
                        {/* Image */}
                        <div className="w-64 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                          
                          {/* Save Button */}
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              toggleSaved(business.id)
                            }}
                            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all shadow-md z-10"
                          >
                            <Heart className={cn(
                              "h-4 w-4 transition-colors",
                              isSaved ? "fill-red-500 text-red-500" : "text-gray-700"
                            )} />
                          </button>
                          
                          {/* Badge */}
                          {business.isVerified && (
                            <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium">
                              <Shield className="h-3.5 w-3.5 text-green-600" />
                              <span className="text-gray-800">Verified</span>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-semibold text-xl text-gray-900 group-hover:text-indigo-600 transition-colors">
                                    {business.businessName}
                                  </h3>
                                  <p className="text-sm text-gray-500 mt-1">
                                    {business.category.replace(/_/g, ' ')}
                                  </p>
                                </div>
                                
                                {/* Price Tag Desktop */}
                                {business.services.length > 0 && (
                                  <div className="hidden sm:block ml-4">
                                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-2 rounded-xl">
                                      <p className="text-sm text-gray-600">From</p>
                                      <p className="text-xl font-bold text-gray-900">
                                        ${Math.min(...business.services.map(s => parseFloat(s.price)))}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-4 mt-3">
                                <div className="flex items-center text-sm text-gray-600">
                                  <MapPin className="h-4 w-4 mr-1.5 text-gray-400" />
                                  {business.city}, {business.state}
                                </div>
                                
                                {/* Rating */}
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span className="ml-1 font-semibold text-gray-900">
                                      {avgRating.toFixed(1)}
                                    </span>
                                  </div>
                                  <span className="text-sm text-gray-500">
                                    ({business.reviews.length} reviews)
                                  </span>
                                </div>
                                
                                {business.services.length > 0 && (
                                  <span className="text-sm text-gray-500">
                                    {business.services.length} services
                                  </span>
                                )}
                              </div>

                              {/* Services Preview */}
                              {business.services.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                  {business.services.slice(0, 4).map((service) => (
                                    <span key={service.id} className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">
                                      {service.name} <span className="text-gray-500 ml-1">• ${service.price}</span>
                                    </span>
                                  ))}
                                  {business.services.length > 4 && (
                                    <span className="inline-flex items-center px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium">
                                      +{business.services.length - 4} more
                                    </span>
                                  )}
                                </div>
                              )}
                              
                              {/* Mobile Price */}
                              {business.services.length > 0 && (
                                <div className="sm:hidden mt-4">
                                  <p className="text-lg font-semibold text-gray-900">
                                    From ${Math.min(...business.services.map(s => parseFloat(s.price)))}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
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
      </main>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)}>
          <div
            className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-8 overflow-y-auto max-h-[calc(100vh-140px)]">
              {/* Categories */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => handleFilterChange('category', cat.value)}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                        filters.category === cat.value
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                          : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                      )}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Minimum Rating</h3>
                <div className="space-y-2">
                  {['', '4', '3', '2'].map(rating => (
                    <button
                      key={rating}
                      onClick={() => handleFilterChange('minRating', rating)}
                      className={cn(
                        "w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                        filters.minRating === rating
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                          : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                      )}
                    >
                      {rating ? (
                        <>
                          <div className="flex items-center mr-2">
                            {[...Array(parseInt(rating))].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <span>{rating}+ stars</span>
                        </>
                      ) : (
                        'Any rating'
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100">
              <Button
                onClick={() => setShowMobileFilters(false)}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg py-3 text-base font-semibold rounded-xl"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
      
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        @keyframes blob {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
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