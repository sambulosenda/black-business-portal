'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  DollarSign,
  Filter,
  Grid3X3,
  Heart,
  List,
  Loader2,
  Map,
  MapPin,
  Search,
  Star,
  X,
} from 'lucide-react'
import Footer from '@/components/footer'
import Navigation from '@/components/navigation'
import { SkeletonGrid } from '@/components/ui/skeleton-card'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/lib/utils'

// Dynamically import the map component to avoid SSR issues
const BusinessMap = dynamic(
  () => import('@/components/search/business-map').then((mod) => mod.BusinessMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-gray-50 text-gray-500">
        Loading map...
      </div>
    ),
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
  }, [
    debouncedQuery,
    debouncedCity,
    filters.category,
    filters.minRating,
    filters.priceMin,
    filters.priceMax,
    isTyping,
  ])

  const handleFilterChange = (key: string, value: string) => {
    // Set typing state for search and location fields
    if (key === 'query' || key === 'city') {
      setIsTyping(true)
    }
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const calculateAvgRating = (reviews: { rating: number }[]) => {
    if (reviews.length === 0) return 0
    return reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
  }

  const toggleSaved = (businessId: string) => {
    setSavedBusinesses((prev) =>
      prev.includes(businessId) ? prev.filter((id) => id !== businessId) : [...prev, businessId]
    )
  }

  // Sort businesses
  const sortedBusinesses = [...businesses].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return calculateAvgRating(b.reviews) - calculateAvgRating(a.reviews)
      case 'price_low':
        const aMinPrice = Math.min(...a.services.map((s) => parseFloat(s.price)))
        const bMinPrice = Math.min(...b.services.map((s) => parseFloat(s.price)))
        return aMinPrice - bMinPrice
      case 'price_high':
        const aMaxPrice = Math.max(...a.services.map((s) => parseFloat(s.price)))
        const bMaxPrice = Math.max(...b.services.map((s) => parseFloat(s.price)))
        return bMaxPrice - aMaxPrice
      default:
        return 0
    }
  })

  const activeFiltersCount = Object.values(filters).filter((v) => v).length

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navigation session={null} />

      {/* Search Header - 8px grid system */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Title Section */}
          <div className="mb-6">
            <h1 className="mb-2 text-3xl font-semibold text-gray-900">Find Services</h1>
            <p className="text-lg text-gray-600">
              Search from thousands of beauty and wellness professionals
            </p>
          </div>

          {/* Search Controls */}
          <div className="flex flex-col gap-4 sm:flex-row">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={filters.query}
                onChange={(e) => handleFilterChange('query', e.target.value)}
                placeholder="Search services or businesses"
                className="h-12 w-full rounded-lg border border-gray-300 pr-12 pl-12 text-base transition-colors focus:border-transparent focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              {isTyping && filters.query && (
                <div className="absolute top-1/2 right-4 -translate-y-1/2 transform">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              )}
            </div>

            {/* Location Input */}
            <div className="relative sm:w-72">
              <MapPin className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                placeholder="Location"
                className="h-12 w-full rounded-lg border border-gray-300 pr-4 pl-12 text-base transition-colors focus:border-transparent focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Search Button - 48px height for touch targets */}
            <button className="h-12 rounded-lg bg-indigo-600 px-8 font-medium text-white transition-colors hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout Container */}
      <div className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {/* Desktop Filters Sidebar - aligned with content */}
            <div className="hidden w-64 flex-shrink-0 py-8 lg:block">
              <div className="sticky top-8">
                <div className="rounded-lg border border-gray-200 bg-white p-6">
                  <h2 className="mb-6 text-lg font-semibold text-gray-900">Filters</h2>

                  {/* Categories */}
                  <div className="mb-8">
                    <h3 className="mb-4 text-sm font-medium text-gray-900">Category</h3>
                    <div className="space-y-3">
                      {categories.map((cat) => (
                        <label key={cat.value} className="group flex cursor-pointer items-center">
                          <input
                            type="radio"
                            name="category"
                            value={cat.value}
                            checked={filters.category === cat.value}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                            className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                          />
                          <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">
                            {cat.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="mb-8">
                    <h3 className="mb-4 text-sm font-medium text-gray-900">Minimum Rating</h3>
                    <select
                      value={filters.minRating}
                      onChange={(e) => handleFilterChange('minRating', e.target.value)}
                      className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-transparent focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="">Any Rating</option>
                      <option value="4">4+ Stars</option>
                      <option value="3">3+ Stars</option>
                      <option value="2">2+ Stars</option>
                    </select>
                  </div>

                  {/* Price Range */}
                  <div className="mb-8">
                    <h3 className="mb-4 text-sm font-medium text-gray-900">Price Range</h3>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.priceMin}
                        onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                        className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-transparent focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                      <span className="text-gray-400">–</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.priceMax}
                        onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                        className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-transparent focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Clear Filters */}
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={() =>
                        setFilters({
                          query: '',
                          category: '',
                          city: '',
                          minRating: '',
                          priceMin: '',
                          priceMax: '',
                        })
                      }
                      className="h-10 w-full rounded-lg text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content - 8px grid system */}
            <div className="flex-1 py-8">
              <div className="rounded-lg border border-gray-200 bg-white p-8">
                {/* Results Header */}
                <div className="mb-8 flex items-center justify-between border-b border-gray-100 pb-8">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {sortedBusinesses.length}{' '}
                      {sortedBusinesses.length === 1 ? 'Result' : 'Results'}
                    </h2>
                    {filters.query && (
                      <p className="mt-1 text-base text-gray-600">
                        Showing results for &quot;{filters.query}&quot;
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Mobile Filter Button */}
                    <button
                      onClick={() => setShowFilters(true)}
                      className="flex h-10 items-center gap-2 rounded-lg border border-gray-300 px-4 text-sm font-medium transition-colors hover:bg-gray-50 lg:hidden"
                    >
                      <Filter className="h-4 w-4" />
                      Filters
                      {activeFiltersCount > 0 && (
                        <span className="ml-1 rounded-full bg-indigo-600 px-2 py-1 text-xs text-white">
                          {activeFiltersCount}
                        </span>
                      )}
                    </button>

                    {/* Sort Dropdown */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="h-10 rounded-lg border border-gray-300 px-4 text-sm focus:border-transparent focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    {/* View Toggle */}
                    <div className="hidden h-10 items-center overflow-hidden rounded-lg border border-gray-300 sm:flex">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={cn(
                          'h-full px-4 transition-colors',
                          viewMode === 'grid'
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        )}
                        aria-label="Grid view"
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={cn(
                          'h-full border-x border-gray-300 px-4 transition-colors',
                          viewMode === 'list'
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        )}
                        aria-label="List view"
                      >
                        <List className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('map')}
                        className={cn(
                          'h-full px-4 transition-colors',
                          viewMode === 'map'
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm font-medium text-gray-700">Active filters:</span>

                      {filters.query && (
                        <div className="animate-in fade-in slide-in-from-left inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 duration-300">
                          <Search className="h-3.5 w-3.5" />
                          {filters.query}
                          <button
                            onClick={() => handleFilterChange('query', '')}
                            className="ml-1 rounded-full p-0.5 transition-colors hover:bg-indigo-200"
                            aria-label="Remove search filter"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}

                      {filters.category && (
                        <div className="animate-in fade-in slide-in-from-left inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5 text-sm font-medium text-purple-700 duration-300">
                          {categories.find((c) => c.value === filters.category)?.label}
                          <button
                            onClick={() => handleFilterChange('category', '')}
                            className="ml-1 rounded-full p-0.5 transition-colors hover:bg-purple-200"
                            aria-label="Remove category filter"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}

                      {filters.city && (
                        <div className="animate-in fade-in slide-in-from-left inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 duration-300">
                          <MapPin className="h-3.5 w-3.5" />
                          {filters.city}
                          <button
                            onClick={() => handleFilterChange('city', '')}
                            className="ml-1 rounded-full p-0.5 transition-colors hover:bg-green-200"
                            aria-label="Remove location filter"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}

                      {filters.minRating && (
                        <div className="animate-in fade-in slide-in-from-left inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1.5 text-sm font-medium text-yellow-700 duration-300">
                          <Star className="h-3.5 w-3.5" />
                          {filters.minRating}+ Stars
                          <button
                            onClick={() => handleFilterChange('minRating', '')}
                            className="ml-1 rounded-full p-0.5 transition-colors hover:bg-yellow-200"
                            aria-label="Remove rating filter"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}

                      {(filters.priceMin || filters.priceMax) && (
                        <div className="animate-in fade-in slide-in-from-left inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 duration-300">
                          <DollarSign className="h-3.5 w-3.5" />${filters.priceMin || '0'} - $
                          {filters.priceMax || '∞'}
                          <button
                            onClick={() => {
                              handleFilterChange('priceMin', '')
                              handleFilterChange('priceMax', '')
                            }}
                            className="ml-1 rounded-full p-0.5 transition-colors hover:bg-emerald-200"
                            aria-label="Remove price filter"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}

                      <button
                        onClick={() =>
                          setFilters({
                            query: '',
                            category: '',
                            city: '',
                            minRating: '',
                            priceMin: '',
                            priceMax: '',
                          })
                        }
                        className="text-sm text-gray-600 underline underline-offset-2 transition-colors hover:text-gray-800"
                      >
                        Clear all
                      </button>
                    </div>
                  </div>
                )}

                {/* Results */}
                {loading ? (
                  <div
                    className={cn(
                      viewMode === 'grid'
                        ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'
                        : 'space-y-4'
                    )}
                  >
                    {[...Array(6)].map((_, index) => (
                      <div key={index} className="animate-pulse">
                        {viewMode === 'grid' ? (
                          // Enhanced Grid Skeleton
                          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                            <div className="relative h-56 overflow-hidden bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200">
                              <div className="animate-shimmer absolute inset-0 -translate-x-full">
                                <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                              </div>
                            </div>
                            <div className="p-6">
                              <div className="mb-3 h-5 w-3/4 rounded bg-gray-200" />
                              <div className="mb-4 h-4 w-1/2 rounded bg-gray-100" />
                              <div className="mb-4 h-4 w-2/3 rounded bg-gray-100" />
                              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-16 rounded bg-gray-100" />
                                  <div className="h-4 w-12 rounded bg-gray-100" />
                                </div>
                                <div className="text-right">
                                  <div className="mb-1 h-3 w-12 rounded bg-gray-100" />
                                  <div className="h-5 w-16 rounded bg-gray-200" />
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // Enhanced List Skeleton
                          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                            <div className="flex">
                              <div className="relative h-48 w-64 overflow-hidden bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200">
                                <div className="animate-shimmer absolute inset-0 -translate-x-full">
                                  <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                </div>
                              </div>
                              <div className="flex-1 p-8">
                                <div className="mb-4 flex justify-between">
                                  <div className="mr-8 flex-1">
                                    <div className="mb-3 h-6 w-2/3 rounded bg-gray-200" />
                                    <div className="h-4 w-1/3 rounded bg-gray-100" />
                                  </div>
                                  <div>
                                    <div className="mb-2 h-4 w-20 rounded bg-gray-100" />
                                    <div className="h-7 w-24 rounded bg-gray-200" />
                                  </div>
                                </div>
                                <div className="mb-6 flex gap-6">
                                  <div className="h-4 w-32 rounded bg-gray-100" />
                                  <div className="h-4 w-24 rounded bg-gray-100" />
                                  <div className="h-4 w-28 rounded bg-gray-100" />
                                </div>
                                <div className="flex gap-2">
                                  <div className="h-8 w-32 rounded bg-gray-100" />
                                  <div className="h-8 w-28 rounded bg-gray-100" />
                                  <div className="h-8 w-24 rounded bg-gray-100" />
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
                    <div className="h-[600px] overflow-hidden rounded-lg border border-gray-200">
                      <BusinessMap
                        businesses={sortedBusinesses.map((b) => ({
                          ...b,
                          latitude: b.latitude ?? null,
                          longitude: b.longitude ?? null,
                          images: b.images || [],
                          services: b.services.map((s) => ({
                            ...s,
                            price: parseFloat(s.price),
                          })),
                        }))}
                        onBoundsChange={(_bounds) => {
                          // Map bounds changed - feature to be implemented
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      className={cn(
                        viewMode === 'grid'
                          ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'
                          : 'space-y-4'
                      )}
                    >
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
                            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white transition-all duration-200 hover:border-gray-300 hover:shadow-md">
                              {/* Image */}
                              <div className="relative h-56 bg-gray-100">
                                <button
                                  onClick={(e) => {
                                    e.preventDefault()
                                    toggleSaved(business.id)
                                  }}
                                  className="absolute top-4 right-4 rounded-full bg-white p-2.5 shadow-sm transition-shadow hover:shadow-md"
                                  aria-label={isSaved ? 'Remove from saved' : 'Save'}
                                >
                                  <Heart
                                    className={cn(
                                      'h-5 w-5',
                                      isSaved
                                        ? 'fill-red-500 text-red-500'
                                        : 'text-gray-400 hover:text-gray-600'
                                    )}
                                  />
                                </button>
                              </div>

                              {/* Content - 24px padding */}
                              <div className="p-6">
                                <h3 className="mb-2 line-clamp-1 text-lg font-semibold text-gray-900">
                                  {business.businessName}
                                </h3>
                                <p className="mb-4 text-sm text-gray-600">
                                  {business.category.replace(/_/g, ' ')}
                                </p>

                                <div className="mb-4 flex items-center text-sm text-gray-600">
                                  <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
                                  <span className="line-clamp-1">
                                    {business.city}, {business.state}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
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
                                      <p className="mb-1 text-xs text-gray-500">From</p>
                                      <p className="text-lg font-semibold text-gray-900">
                                        $
                                        {Math.min(
                                          ...business.services.map((s) => parseFloat(s.price))
                                        )}
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
                            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white transition-all duration-200 hover:border-gray-300 hover:shadow-md">
                              <div className="flex">
                                {/* Image */}
                                <div className="relative h-48 w-64 flex-shrink-0 bg-gray-100">
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault()
                                      toggleSaved(business.id)
                                    }}
                                    className="absolute top-4 right-4 rounded-full bg-white p-2.5 shadow-sm transition-shadow hover:shadow-md"
                                    aria-label={isSaved ? 'Remove from saved' : 'Save'}
                                  >
                                    <Heart
                                      className={cn(
                                        'h-5 w-5',
                                        isSaved
                                          ? 'fill-red-500 text-red-500'
                                          : 'text-gray-400 hover:text-gray-600'
                                      )}
                                    />
                                  </button>
                                </div>

                                {/* Content - 32px padding */}
                                <div className="flex-1 p-8">
                                  <div className="mb-4 flex items-start justify-between">
                                    <div className="mr-8 flex-1">
                                      <h3 className="mb-2 text-xl font-semibold text-gray-900">
                                        {business.businessName}
                                      </h3>
                                      <p className="text-base text-gray-600">
                                        {business.category.replace(/_/g, ' ')}
                                      </p>
                                    </div>

                                    {business.services.length > 0 && (
                                      <div className="flex-shrink-0 text-right">
                                        <p className="mb-1 text-sm text-gray-500">Starting from</p>
                                        <p className="text-2xl font-semibold text-gray-900">
                                          $
                                          {Math.min(
                                            ...business.services.map((s) => parseFloat(s.price))
                                          )}
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  <div className="mb-6 flex items-center gap-6 text-sm text-gray-600">
                                    <div className="flex items-center">
                                      <MapPin className="mr-2 h-4 w-4" />
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
                                      <span>{business.services.length} services available</span>
                                    )}
                                  </div>

                                  {/* Services Preview */}
                                  {business.services.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                      {business.services.slice(0, 3).map((service) => (
                                        <span
                                          key={service.id}
                                          className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700"
                                        >
                                          {service.name} • ${service.price}
                                        </span>
                                      ))}
                                      {business.services.length > 3 && (
                                        <span className="px-3 py-1.5 text-sm font-medium text-indigo-600">
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
                  <div className="py-16 text-center">
                    <div className="mx-auto max-w-md">
                      <div className="mb-6">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                          <Search className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="mb-2 text-xl font-semibold text-gray-900">
                          No results found
                        </h3>
                        <p className="text-base text-gray-600">
                          Try adjusting your filters or searching in a different area.
                        </p>
                      </div>
                      {activeFiltersCount > 0 && (
                        <button
                          onClick={() =>
                            setFilters({
                              query: '',
                              category: '',
                              city: '',
                              minRating: '',
                              priceMin: '',
                              priceMax: '',
                            })
                          }
                          className="h-10 rounded-lg bg-indigo-600 px-6 font-medium text-white transition-colors hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
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
            className="bg-opacity-50 absolute inset-0 bg-black"
            onClick={() => setShowFilters(false)}
          />
          <div className="absolute top-0 right-0 bottom-0 w-80 bg-white shadow-xl">
            <div className="border-b border-gray-200 p-6">
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

            <div className="max-h-[calc(100vh-5rem)] overflow-y-auto p-6">
              {/* Mobile filter content - same as desktop */}
              {/* Categories */}
              <div className="mb-8">
                <h4 className="mb-3 text-sm font-medium text-gray-700">Category</h4>
                <div className="space-y-2">
                  {categories.map((cat) => (
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
                <h4 className="mb-3 text-sm font-medium text-gray-700">Minimum Rating</h4>
                <select
                  value={filters.minRating}
                  onChange={(e) => handleFilterChange('minRating', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
                className="w-full rounded-lg bg-indigo-600 py-3 text-white hover:bg-indigo-700"
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
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-8">
          <SkeletonGrid count={6} />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  )
}
