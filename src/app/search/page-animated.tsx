'use client'

import { useState, useEffect, Suspense, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
// import { Card, CardContent } from '@/components/ui/card' // Commented out - may be used later
// import { Badge } from '@/components/ui/badge' // Commented out - may be used later
import { SkeletonGrid } from '@/components/ui/skeleton-card'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { cn } from '@/lib/utils'
import { 
  Search, MapPin, Star, X, Filter,
  Grid3X3, List, Shield, Sparkles, TrendingUp, DollarSign,
  Heart, Map, ArrowUpDown, ChevronDown, Lightbulb, Mic, Clock,
  CheckCircle, ChevronRight, Calendar
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { PriceRangeSlider } from '@/components/ui/price-range-slider'

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
  const [prevViewMode, setPrevViewMode] = useState<'grid' | 'list' | 'map'>('grid')
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [sortBy, setSortBy] = useState('recommended')
  const [savedBusinesses, setSavedBusinesses] = useState<string[]>([])
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [animateResults, setAnimateResults] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [locationFocused, setLocationFocused] = useState(false)
  const [filterAnimations, setFilterAnimations] = useState(false)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500])
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [filters, setFilters] = useState({
    query: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
    minRating: searchParams.get('minRating') || '',
    priceMin: searchParams.get('priceMin') || '',
    priceMax: searchParams.get('priceMax') || '',
  })

  // Load search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('searchHistory')
    if (saved) {
      setSearchHistory(JSON.parse(saved))
    }
    
    // Auto-focus search input on mount
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
    
    // Enable filter animations after mount
    setTimeout(() => {
      setFilterAnimations(true)
    }, 100)
  }, [])

  // Save search to history
  const saveToHistory = useCallback((query: string) => {
    if (!query.trim()) return
    
    setSearchHistory(prev => {
      const updated = [query, ...prev.filter(q => q !== query)].slice(0, 5)
      localStorage.setItem('searchHistory', JSON.stringify(updated))
      return updated
    })
  }, [])

  // Voice search functionality
  const handleVoiceSearch = useCallback(() => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice search is not supported in your browser')
      return
    }

    interface ISpeechRecognition {
      continuous: boolean
      interimResults: boolean
      lang: string
      onstart: () => void
      onresult: (event: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => void
      onerror: () => void
      onend: () => void
      start: () => void
    }
    const recognition = new (window as unknown as { webkitSpeechRecognition: new() => ISpeechRecognition }).webkitSpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => {
      const transcript = event.results[0][0].transcript
      setFilters(prev => ({ ...prev, query: transcript }))
      saveToHistory(transcript)
      setIsListening(false)
    }

    recognition.onerror = () => {
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }, [saveToHistory])

  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true)
      setAnimateResults(false)
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
        
        // Save successful search query to history
        if (filters.query) {
          saveToHistory(filters.query)
        }
        
        // Trigger animations after a short delay
        setTimeout(() => {
          setAnimateResults(true)
        }, 100)
      } catch (error) {
        console.error('Error fetching businesses:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchBusinesses()
  }, [filters, saveToHistory])

  // Handle view mode transitions
  useEffect(() => {
    if (viewMode !== prevViewMode) {
      setAnimateResults(false)
      setPrevViewMode(viewMode)
      setTimeout(() => {
        setAnimateResults(true)
      }, 50)
    }
  }, [viewMode, prevViewMode])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.category-dropdown')) {
        setShowCategoryDropdown(false)
      }
      if (!target.closest('.sort-dropdown')) {
        setShowSortDropdown(false)
      }
    }
    
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const calculateAvgRating = (reviews: { rating: number }[]) => {
    if (reviews.length === 0) return 0
    return reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
  }

  const toggleSaved = (businessId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      
      // Create heart particle effect
      const button = e.currentTarget as HTMLButtonElement
      const rect = button.getBoundingClientRect()
      const heart = document.createElement('div')
      heart.innerHTML = '❤️'
      heart.style.position = 'fixed'
      heart.style.left = `${rect.left + rect.width / 2}px`
      heart.style.top = `${rect.top + rect.height / 2}px`
      heart.style.pointerEvents = 'none'
      heart.style.zIndex = '9999'
      heart.style.fontSize = '20px'
      heart.style.transform = 'translate(-50%, -50%)'
      heart.style.animation = 'heartFloat 1s ease-out forwards'
      document.body.appendChild(heart)
      
      setTimeout(() => heart.remove(), 1000)
    }
    
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

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2 relative">
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Service Search */}
                <div className="relative flex-1">
                  <Search className={cn(
                    "absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 pointer-events-none transition-colors duration-200",
                    searchFocused ? "text-indigo-600" : "text-gray-400"
                  )} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={filters.query}
                    onChange={(e) => handleFilterChange('query', e.target.value)}
                    onFocus={() => {
                      setSearchFocused(true)
                      setShowSearchSuggestions(true)
                    }}
                    onBlur={() => {
                      setSearchFocused(false)
                      setTimeout(() => setShowSearchSuggestions(false), 200)
                    }}
                    placeholder='Search services, salons, or treatments'
                    className="w-full pl-12 pr-24 py-4 text-gray-900 placeholder-gray-500 bg-transparent hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 rounded-xl transition-all duration-200 text-base border-0"
                  />
                  
                  {/* Clear & Voice buttons */}
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    {filters.query && (
                      <button
                        onClick={() => handleFilterChange('query', '')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 group"
                      >
                        <X className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                      </button>
                    )}
                    <button
                      onClick={handleVoiceSearch}
                      className={cn(
                        "p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 group",
                        isListening && "bg-red-50 animate-pulse"
                      )}
                    >
                      <Mic className={cn(
                        "h-4 w-4 transition-colors duration-200",
                        isListening ? "text-red-600" : "text-gray-400 group-hover:text-gray-600"
                      )} />
                    </button>
                  </div>
                  
                  {/* Search Suggestions Dropdown */}
                  {showSearchSuggestions && (filters.query || searchHistory.length > 0) && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                      {searchHistory.length > 0 && !filters.query && (
                        <>
                          <div className="px-4 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
                            Recent searches
                          </div>
                          {searchHistory.map((query, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                handleFilterChange('query', query)
                                setShowSearchSuggestions(false)
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors duration-150 text-left group"
                            >
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-700 group-hover:text-gray-900">{query}</span>
                              <ChevronRight className="h-4 w-4 text-gray-300 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
                            </button>
                          ))}
                        </>
                      )}
                      
                      {/* Popular services suggestions when typing */}
                      {filters.query && (
                        <>
                          <div className="px-4 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
                            Popular services
                          </div>
                          {['Haircut', 'Manicure', 'Massage', 'Facial'].filter(s => 
                            s.toLowerCase().includes(filters.query.toLowerCase())
                          ).map((service, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                handleFilterChange('query', service)
                                setShowSearchSuggestions(false)
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors duration-150 text-left group"
                            >
                              <Sparkles className="h-4 w-4 text-indigo-500" />
                              <span className="text-gray-700 group-hover:text-gray-900">{service}</span>
                              <ChevronRight className="h-4 w-4 text-gray-300 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="h-px sm:h-auto sm:w-px bg-gray-200"></div>
                
                {/* Location Search */}
                <div className="relative flex-1 sm:max-w-xs">
                  <MapPin className={cn(
                    "absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 pointer-events-none transition-colors duration-200",
                    locationFocused ? "text-indigo-600" : "text-gray-400"
                  )} />
                  <input
                    type="text"
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    onFocus={() => setLocationFocused(true)}
                    onBlur={() => setLocationFocused(false)}
                    placeholder="Location"
                    className="w-full pl-12 pr-4 py-4 text-gray-900 placeholder-gray-500 bg-transparent hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 rounded-xl transition-all duration-200 text-base border-0"
                  />
                  {filters.city && (
                    <button
                      onClick={() => handleFilterChange('city', '')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 group"
                    >
                      <X className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                    </button>
                  )}
                </div>
                
                {/* Search Button */}
                <Button 
                  size="lg"
                  className="sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-lg transform hover:scale-105 px-8 py-4 text-base font-medium"
                >
                  Search
                </Button>
              </div>
            </div>

            {/* Quick Category Selection */}
            <div className="mt-8">
              <p className="text-sm text-gray-500 mb-4 text-center">Popular categories</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {categories.slice(1, 7).map((cat, idx) => (
                  <button
                    key={cat.value}
                    onClick={() => handleFilterChange('category', filters.category === cat.value ? '' : cat.value)}
                    className={cn(
                      "px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 relative overflow-hidden",
                      filters.category === cat.value
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm hover:shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm",
                      filterAnimations && "animate-in fade-in slide-in-from-bottom-2"
                    )}
                    style={{
                      animationDelay: filterAnimations ? `${idx * 50}ms` : '0ms',
                      animationFillMode: 'both'
                    }}
                  >
                    <span className="relative z-10">{cat.label}</span>
                    {filters.category === cat.value && (
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 animate-in fade-in duration-300" />
                    )}
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
              <div className="relative sort-dropdown">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-2 bg-white px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 cursor-pointer hover:shadow-sm"
                >
                  <ArrowUpDown className="h-4 w-4" />
                  <span>{sortOptions.find(opt => opt.value === sortBy)?.label}</span>
                  <ChevronDown className={cn(
                    "h-4 w-4 text-gray-400 transition-transform duration-200",
                    showSortDropdown && "rotate-180"
                  )} />
                </button>
                {showSortDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                    {sortOptions.map(option => {
                      const Icon = option.icon
                      return (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value)
                            setShowSortDropdown(false)
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                            sortBy === option.value
                              ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 font-medium"
                              : "text-gray-700 hover:bg-gray-50"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{option.label}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* View Toggle */}
              <div className="hidden sm:flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => {
                    setPrevViewMode(viewMode)
                    setViewMode('grid')
                    setAnimateResults(true)
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
                    viewMode === 'grid' 
                      ? "bg-white text-gray-900 shadow-sm transform scale-105" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setPrevViewMode(viewMode)
                    setViewMode('list')
                    setAnimateResults(true)
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
                    viewMode === 'list' 
                      ? "bg-white text-gray-900 shadow-sm transform scale-105" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setPrevViewMode(viewMode)
                    setViewMode('map')
                    setAnimateResults(true)
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
                    viewMode === 'map' 
                      ? "bg-white text-gray-900 shadow-sm transform scale-105" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  <Map className="h-4 w-4" />
                </button>
              </div>

              {/* Mobile View Toggle and Filter Button */}
              <div className="flex sm:hidden items-center gap-2">
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-indigo-600 text-white text-xs rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      "p-2 rounded-md text-sm font-medium transition-all duration-200",
                      viewMode === 'grid' 
                        ? "bg-white text-gray-900 shadow-sm" 
                        : "text-gray-600"
                    )}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      "p-2 rounded-md text-sm font-medium transition-all duration-200",
                      viewMode === 'list' 
                        ? "bg-white text-gray-900 shadow-sm" 
                        : "text-gray-600"
                    )}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Filters Row */}
          <div className="mb-8 pb-6 border-b border-gray-100">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-500 mr-2">Filter by:</span>
                
                {/* Category Filter */}
                <div className="relative category-dropdown">
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap",
                  filters.category 
                    ? "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border border-indigo-200 shadow-sm"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:shadow-sm"
                )}
              >
                <span>{filters.category ? categories.find(c => c.value === filters.category)?.label : 'All Categories'}</span>
                <ChevronDown className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  showCategoryDropdown && "rotate-180"
                )} />
              </button>
              
              {showCategoryDropdown && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                  {categories.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => {
                        handleFilterChange('category', cat.value)
                        setShowCategoryDropdown(false)
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2.5 text-sm transition-all duration-200",
                        filters.category === cat.value
                          ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 font-medium"
                          : "text-gray-700 hover:bg-gray-50 hover:translate-x-1"
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
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-left-1 duration-200">
                <MapPin className="w-3.5 h-3.5" />
                {filters.city}
                <button 
                  onClick={() => handleFilterChange('city', '')} 
                  className="ml-1 text-gray-500 hover:text-gray-700 transition-all duration-200 hover:scale-110"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            
            {filters.query && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-left-1 duration-200">
                <Search className="w-3.5 h-3.5" />
                {filters.query}
                <button 
                  onClick={() => handleFilterChange('query', '')} 
                  className="ml-1 text-gray-500 hover:text-gray-700 transition-all duration-200 hover:scale-110"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

                {/* Clear all */}
                {activeFiltersCount > 0 && (
                  <button
                    onClick={() => setFilters({ query: '', category: '', city: '', minRating: '', priceMin: '', priceMax: '' })}
                    className="text-sm text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 font-medium ml-2"
                  >
                    Clear all
                  </button>
                )}
              </div>
              
              {/* Advanced Filters Button */}
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  showAdvancedFilters
                    ? "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border border-indigo-200"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300"
                )}
              >
                <Filter className="h-4 w-4" />
                Advanced Filters
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  showAdvancedFilters && "rotate-180"
                )} />
              </button>
            </div>
            
            {/* Advanced Filters Panel */}
            {showAdvancedFilters && (
              <div className="bg-gray-50 rounded-xl p-6 animate-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Price Range */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-3 block">Price Range</label>
                    <PriceRangeSlider
                      min={0}
                      max={500}
                      value={priceRange}
                      onChange={(value) => {
                        setPriceRange(value)
                        handleFilterChange('priceMin', value[0].toString())
                        handleFilterChange('priceMax', value[1].toString())
                      }}
                      className="mb-4"
                    />
                    
                    {/* Quick Price Presets */}
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => {
                          setPriceRange([0, 50])
                          handleFilterChange('priceMin', '0')
                          handleFilterChange('priceMax', '50')
                        }}
                        className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:border-gray-300 transition-colors"
                      >
                        Under $50
                      </button>
                      <button
                        onClick={() => {
                          setPriceRange([50, 150])
                          handleFilterChange('priceMin', '50')
                          handleFilterChange('priceMax', '150')
                        }}
                        className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:border-gray-300 transition-colors"
                      >
                        $50-$150
                      </button>
                      <button
                        onClick={() => {
                          setPriceRange([150, 500])
                          handleFilterChange('priceMin', '150')
                          handleFilterChange('priceMax', '500')
                        }}
                        className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:border-gray-300 transition-colors"
                      >
                        $150+
                      </button>
                    </div>
                  </div>
                  
                  {/* Availability */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-3 block">Availability</label>
                    <div className="space-y-2">
                      <button className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm hover:border-gray-300 transition-colors">
                        <span className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          Today
                        </span>
                        <CheckCircle className="h-4 w-4 text-green-500 opacity-0" />
                      </button>
                      <button className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm hover:border-gray-300 transition-colors">
                        <span className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          This Week
                        </span>
                        <CheckCircle className="h-4 w-4 text-green-500 opacity-0" />
                      </button>
                      <button className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm hover:border-gray-300 transition-colors">
                        <span className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          Weekends
                        </span>
                        <CheckCircle className="h-4 w-4 text-green-500 opacity-0" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Special Features */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-3 block">Special Features</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors cursor-pointer">
                        <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" />
                        <span className="text-sm text-gray-700">Online Booking</span>
                      </label>
                      <label className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors cursor-pointer">
                        <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" />
                        <span className="text-sm text-gray-700">Home Service</span>
                      </label>
                      <label className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors cursor-pointer">
                        <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" />
                        <span className="text-sm text-gray-700">Parking Available</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Smart Filter Suggestions */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-3">Quick Filters</p>
                  <div className="flex flex-wrap gap-2">
                    <button className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-lg text-sm font-medium hover:from-indigo-100 hover:to-purple-100 transition-colors">
                      💆‍♀️ Spa Day Under $100
                    </button>
                    <button className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-lg text-sm font-medium hover:from-indigo-100 hover:to-purple-100 transition-colors">
                      💇‍♀️ Hair Salon Near Me
                    </button>
                    <button className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-lg text-sm font-medium hover:from-indigo-100 hover:to-purple-100 transition-colors">
                      💅 Nail Salon Open Now
                    </button>
                    <button className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-lg text-sm font-medium hover:from-indigo-100 hover:to-purple-100 transition-colors">
                      ⭐ Top Rated This Month
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          {loading ? (
            <div className={cn(
              viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "max-w-4xl mx-auto space-y-4"
            )}>
              {[...Array(8)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  {viewMode === 'grid' ? (
                    // Grid skeleton
                    <div className="bg-white rounded-xl overflow-hidden border border-gray-200 h-full">
                      <div className="h-56 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" />
                      <div className="p-5">
                        <div className="h-6 bg-gray-200 rounded-md mb-2 w-3/4" />
                        <div className="h-4 bg-gray-100 rounded-md mb-4 w-1/2" />
                        <div className="h-4 bg-gray-100 rounded-md mb-4 w-2/3" />
                        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                          <div className="h-8 bg-gray-100 rounded-lg w-20" />
                          <div className="h-6 bg-gray-200 rounded-md w-16" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    // List skeleton
                    <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                      <div className="flex">
                        <div className="w-48 sm:w-64 h-48 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" />
                        <div className="flex-1 p-6">
                          <div className="h-6 bg-gray-200 rounded-md mb-2 w-1/3" />
                          <div className="h-4 bg-gray-100 rounded-md mb-4 w-1/4" />
                          <div className="flex gap-4 mb-4">
                            <div className="h-4 bg-gray-100 rounded-md w-24" />
                            <div className="h-4 bg-gray-100 rounded-md w-20" />
                            <div className="h-4 bg-gray-100 rounded-md w-28" />
                          </div>
                          <div className="flex gap-2">
                            <div className="h-8 bg-gray-100 rounded-lg w-32" />
                            <div className="h-8 bg-gray-100 rounded-lg w-28" />
                            <div className="h-8 bg-gray-100 rounded-lg w-36" />
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
              <div 
                ref={resultsRef}
                className={cn(
                  viewMode === 'grid' 
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "max-w-4xl mx-auto space-y-4",
                  "transition-all duration-300 ease-in-out"
                )}
              >
              {sortedBusinesses.map((business, index) => {
                const avgRating = calculateAvgRating(business.reviews)
                const isSaved = savedBusinesses.includes(business.id)
                
                return viewMode === 'grid' ? (
                  // Grid View Card
                  <Link
                    key={business.id}
                    href={`/business/${business.slug}`}
                    className={cn(
                      "group block",
                      animateResults && "animate-in fade-in slide-in-from-bottom-2"
                    )}
                    style={{
                      animationDelay: animateResults ? `${index * 50}ms` : '0ms',
                      animationFillMode: 'both'
                    }}
                  >
                    <div className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-indigo-200 hover:shadow-xl transition-all duration-300 h-full transform hover:-translate-y-1">
                      {/* Image */}
                      <div className="relative h-56 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 overflow-hidden group">
                        {/* Placeholder pattern */}
                        <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                          <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 1px)', backgroundSize: '32px 32px'}}></div>
                        </div>
                        
                        {/* Overlay gradient on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Save Button */}
                        <button
                          onClick={(e) => toggleSaved(business.id, e)}
                          className="absolute top-4 right-4 p-2.5 bg-white rounded-full hover:bg-gray-50 transition-all duration-200 shadow-sm border border-gray-200 hover:shadow-md transform hover:scale-110 active:scale-95"
                        >
                          <Heart className={cn(
                            "h-4 w-4 transition-all duration-200",
                            isSaved ? "fill-red-500 text-red-500 animate-in zoom-in" : "text-gray-600 hover:text-red-500"
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
                          <h3 className="font-semibold text-lg text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 transition-all duration-300 line-clamp-1 mb-1">
                            {business.businessName}
                          </h3>
                          <p className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-200">
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
                    className={cn(
                      "block group",
                      animateResults && "animate-in fade-in slide-in-from-right-2"
                    )}
                    style={{
                      animationDelay: animateResults ? `${index * 50}ms` : '0ms',
                      animationFillMode: 'both'
                    }}
                  >
                    <div className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-indigo-200 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                      <div className="flex">
                        {/* Image */}
                        <div className="w-48 sm:w-64 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative flex-shrink-0 group">
                          {/* Placeholder pattern */}
                          <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                            <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 1px)', backgroundSize: '32px 32px'}}></div>
                          </div>
                          
                          {/* Overlay gradient on hover */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          {/* Save Button */}
                          <button
                            onClick={(e) => toggleSaved(business.id, e)}
                            className="absolute top-4 right-4 p-2.5 bg-white rounded-full hover:bg-gray-50 transition-all duration-200 shadow-sm border border-gray-200 hover:shadow-md transform hover:scale-110 active:scale-95"
                          >
                            <Heart className={cn(
                              "h-4 w-4 transition-all duration-200",
                              isSaved ? "fill-red-500 text-red-500" : "text-gray-600 hover:text-red-500"
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
                              {business.services.slice(0, 3).map((service, idx) => (
                                <span 
                                  key={service.id} 
                                  className="inline-flex items-center px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-sm border border-gray-200 hover:bg-gray-100 transition-all duration-200 group cursor-default"
                                  style={{
                                    animationDelay: animateResults ? `${(index * 50) + (idx * 20)}ms` : '0ms'
                                  }}
                                >
                                  {service.name} <span className="text-gray-400 ml-1.5 group-hover:text-gray-500">$</span>
                                  {service.price}
                                </span>
                              ))}
                              {business.services.length > 3 && (
                                <button className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-lg text-sm font-medium hover:from-indigo-100 hover:to-purple-100 transition-all duration-200 hover:shadow-sm transform hover:scale-105">
                                  View all {business.services.length} services
                                  <svg className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="flex flex-col items-center justify-center py-24 px-4 animate-in fade-in duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <Search className="w-10 h-10 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">No results found</h3>
              <p className="text-gray-600 text-center max-w-md mb-8 text-lg">
                We couldn&apos;t find any businesses matching your search. Try adjusting your filters or search in a different area.
              </p>
              
              {/* Suggestions */}
              <div className="mb-8">
                <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Suggestions:
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => handleFilterChange('category', '')}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 hover:shadow-sm"
                  >
                    Try all categories
                  </button>
                  {filters.city && (
                    <button
                      onClick={() => handleFilterChange('city', '')}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 hover:shadow-sm"
                    >
                      Search all locations
                    </button>
                  )}
                  {filters.minRating && (
                    <button
                      onClick={() => handleFilterChange('minRating', '')}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 hover:shadow-sm"
                    >
                      Show all ratings
                    </button>
                  )}
                </div>
              </div>
              
              {activeFiltersCount > 0 && (
                <button
                  onClick={() => setFilters({ query: '', category: '', city: '', minRating: '', priceMin: '', priceMax: '' })}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Clear all filters
                </button>
              )}
              
              {/* Popular searches */}
              <div className="mt-12 w-full max-w-2xl">
                <p className="text-sm text-gray-500 mb-4 text-center">Popular searches near you</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['Hair Salon', 'Nail Salon', 'Spa', 'Barber Shop'].map(term => (
                    <button
                      key={term}
                      onClick={() => {
                        setFilters({ ...filters, query: term, category: '' })
                      }}
                      className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-all duration-200 hover:shadow-sm"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      
      <Footer />
      
      {/* Mobile Filter Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div 
            className="absolute inset-0 bg-black/50 animate-in fade-in duration-200"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-hidden">
            {/* Drag Handle */}
            <div className="sticky top-0 bg-white z-10 py-3">
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-3" />
            </div>
            
            <div className="px-6 pb-8 overflow-y-auto max-h-[calc(90vh-2rem)]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              
              {/* Category */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 mb-3 block">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => handleFilterChange('category', cat.value)}
                      className={cn(
                        "px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                        filters.category === cat.value
                          ? "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border border-indigo-200"
                          : "bg-gray-50 text-gray-700 border border-gray-200"
                      )}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Rating */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 mb-3 block">Minimum Rating</label>
                <div className="flex gap-2">
                  {['', '4', '3', '2'].map(rating => (
                    <button
                      key={rating}
                      onClick={() => handleFilterChange('minRating', rating)}
                      className={cn(
                        "flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                        filters.minRating === rating
                          ? "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border border-indigo-200"
                          : "bg-gray-50 text-gray-700 border border-gray-200"
                      )}
                    >
                      {rating ? `${rating}+ ⭐` : 'Any'}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Sort */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 mb-3 block">Sort By</label>
                <div className="space-y-2">
                  {sortOptions.map(option => {
                    const Icon = option.icon
                    return (
                      <button
                        key={option.value}
                        onClick={() => setSortBy(option.value)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                          sortBy === option.value
                            ? "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border border-indigo-200"
                            : "bg-gray-50 text-gray-700 border border-gray-200"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{option.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setFilters({ query: '', category: '', city: '', minRating: '', priceMin: '', priceMax: '' })
                    setShowMobileFilters(false)
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-colors shadow-lg"
                >
                  Show Results
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        
        .animate-shimmer {
          background-size: 200% 100%;
          animation: shimmer 1.5s ease-in-out infinite;
        }
        
        @keyframes heartFloat {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -150%) scale(1.5);
            opacity: 0;
          }
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .animate-in {
            animation: none !important;
          }
          .transition-all {
            transition: none !important;
          }
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