'use client'

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Footer from "@/components/footer"
import { useSession } from "next-auth/react"

export default function Home() {
  const router = useRouter()
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.append('q', searchQuery)
    if (location) params.append('city', location)
    router.push(`/search?${params.toString()}`)
  }

  const valueProps = [
    {
      title: 'Save up to 30%',
      description: 'Exclusive deals on last-minute bookings and off-peak appointments',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-purple-100 text-purple-700',
      highlight: 'Most Popular'
    },
    {
      title: 'Skip the phone calls',
      description: 'Book anytime from anywhere - no waiting on hold or playing phone tag',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-green-100 text-green-700'
    },
    {
      title: 'Trusted by thousands',
      description: 'Read real reviews from verified customers before you book',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-pink-100 text-pink-700'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2 group transition-transform hover:scale-105">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                  B
                </div>
                <span className="text-xl font-bold text-gray-900">BeautyPortal</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-3">
              {session ? (
                <>
                  <Link href="/search">
                    <Button variant="ghost" className="text-gray-700 hover:text-gray-900 font-medium">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Search
                    </Button>
                  </Link>
                  <Link href={session.user.role === 'BUSINESS_OWNER' ? '/business/dashboard' : '/dashboard'}>
                    <Button variant="ghost" className="text-gray-700 hover:text-gray-900 font-medium">
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/api/auth/signout">
                    <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
                      Sign out
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/search" className="hidden sm:block">
                    <Button variant="ghost" className="text-gray-700 hover:text-gray-900 font-medium">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Browse
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="ghost" className="font-medium">Sign in</Button>
                  </Link>
                  <Link href="/signup/customer">
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all">
                      Get Started
                    </Button>
                  </Link>
                  <div className="hidden sm:block ml-2">
                    <Link href="/signup/business">
                      <Button variant="outline" className="border-2 font-medium">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        For Business
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[600px] lg:min-h-[700px] py-16 lg:py-24">
            
            {/* Left Content */}
            <div className="text-left space-y-8 animate-fade-in lg:pr-8">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Trusted by 10,000+ customers
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Book beauty services in
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> 30 seconds</span>
                </h1>
                
                <p className="text-xl text-gray-700 leading-relaxed max-w-xl">
                  Find and instantly book appointments at top-rated African beauty salons and professionals near you. No calls, no waiting.
                </p>
              </div>
              
              {/* Search Bar */}
              <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-gray-200 max-w-lg">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Try "braids", "nails", or "spa""
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-gray-900 placeholder-gray-500 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl transition-all"
                    />
                  </div>
                  <div className="flex-1 relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="City or neighborhood"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-gray-900 placeholder-gray-500 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl transition-all"
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 rounded-xl transform hover:-translate-y-0.5 transition-all shadow-lg hover:shadow-xl">
                    Find Services
                  </Button>
                </form>
                
                {/* Popular Searches */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-xs text-gray-500">Popular:</span>
                  {['Hair Braiding', 'Nail Art', 'Spa Day', 'Lash Extensions', 'Makeup'].map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        setSearchQuery(term.toLowerCase())
                        router.push(`/search?q=${encodeURIComponent(term.toLowerCase())}`)
                      }}
                      className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Link href="/search">
                  <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-50 border border-gray-200 transform hover:-translate-y-0.5 transition-all shadow-md hover:shadow-lg">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Explore Near You
                  </Button>
                </Link>
                {!session && (
                  <Link href="/signup/business">
                    <Button size="lg" variant="outline" className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-all">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    List Your Business
                  </Button>
                  </Link>
                )}
              </div>
              
              {/* Trust Badges */}
              <div className="pt-8 space-y-4">
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <Image src="/images/client-bg-new.png" alt="Customer" width={32} height={32} className="rounded-full border-2 border-white object-cover" />
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full border-2 border-white"></div>
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full border-2 border-white"></div>
                      <div className="w-8 h-8 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">+10k</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">10,000+ Happy Customers</p>
                      <p className="text-xs text-gray-600">Join our growing community</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-gray-200">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">4.9/5</p>
                      <p className="text-xs text-gray-600">2,847 reviews</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-green-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-sm font-medium">Secure Booking</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Image */}
            <div className="relative h-full flex items-center justify-center lg:justify-end">
              <div className="relative w-full max-w-lg h-[400px] lg:h-[600px]">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl transform rotate-6 opacity-20"></div>
                <div className="relative h-full">
                  <Image 
                    src="/images/client-bg-new.png" 
                    alt="Beauty professional with client" 
                    fill
                    priority
                    className="object-cover rounded-3xl"
                  />
                  {/* Floating elements */}
                  <div className="absolute -top-4 -right-4 bg-white rounded-lg border border-gray-200 p-3 animate-bounce shadow-lg">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center -space-x-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">247 Available Today</p>
                        <p className="text-xs text-gray-600">Book instantly</p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -left-4 bg-white rounded-lg border border-gray-200 p-4 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Average booking time</p>
                        <p className="text-lg font-bold text-indigo-600">28 seconds</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>
   

      {/* Value Props */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              The brighter way to
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> book beauty</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of beauty booking with our modern platform
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {valueProps.map((prop, index) => (
              <div key={index} className="group relative">
                {prop.highlight && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold rounded-full z-10">
                    {prop.highlight}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <div className="relative bg-gray-50 rounded-2xl p-8 border border-gray-200 hover:border-indigo-300 transition-all duration-300 transform hover:-translate-y-1">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${prop.color} mb-6 group-hover:scale-110 transition-transform`}>
                    {prop.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {prop.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {prop.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <p className="text-4xl font-bold text-white">10K+</p>
              <p className="text-white/80">Active Customers</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-bold text-white">1.2K+</p>
              <p className="text-white/80">Partner Salons</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-bold text-white">148K</p>
              <p className="text-white/80">Bookings Made</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-1">
                <p className="text-4xl font-bold text-white">4.9</p>
                <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <p className="text-white/80">Average Rating</p>
            </div>
          </div>
          
          {/* Live Activity Ticker */}
          <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-center gap-4 text-white">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm">Live</span>
              </div>
              <div className="text-sm font-medium">
                <span className="font-bold">Sarah M.</span> just booked a hair appointment in Lagos • 
                <span className="font-bold ml-4">12 people</span> viewing salons near you • 
                <span className="font-bold ml-4">Next available slot:</span> in 45 minutes
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-gradient-to-br from-purple-50 via-indigo-50 to-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-6">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Simple 3-Step Process
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Supporting made
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"> meaningful</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands who are already supporting Black-owned beauty businesses while enjoying premium services
            </p>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Step 1 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity"></div>
              <div className="relative text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl border-2 border-indigo-200 mb-6 group-hover:border-indigo-400 transition-colors">
                  <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">1</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Discover</h3>
                <p className="text-gray-600 leading-relaxed">
                  Browse through our curated list of Black-owned salons, spas, and beauty professionals in your area
                </p>
              </div>
              {/* Connector Line */}
              <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-indigo-200 to-purple-200 -translate-x-1/2"></div>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity"></div>
              <div className="relative text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl border-2 border-purple-200 mb-6 group-hover:border-purple-400 transition-colors">
                  <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">2</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Book</h3>
                <p className="text-gray-600 leading-relaxed">
                  Select your service, pick a convenient time, and book instantly with real-time availability
                </p>
              </div>
              {/* Connector Line */}
              <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-purple-200 to-pink-200 -translate-x-1/2"></div>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-orange-600 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity"></div>
              <div className="relative text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl border-2 border-pink-200 mb-6 group-hover:border-pink-400 transition-colors">
                  <span className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">3</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Enjoy</h3>
                <p className="text-gray-600 leading-relaxed">
                  Experience exceptional service while making a positive impact in your community
                </p>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Feature list */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">
                Why choose BeautyPortal?
              </h3>
              
              {[
                {
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ),
                  title: "Verified Businesses",
                  description: "All businesses are verified to ensure quality and authenticity"
                },
                {
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  title: "Real-time Availability",
                  description: "See live availability and book appointments instantly"
                },
                {
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  ),
                  title: "Community Impact",
                  description: "Every booking supports Black-owned businesses directly"
                },
                {
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  ),
                  title: "Easy Management",
                  description: "Manage all your bookings in one convenient place"
                }
              ].map((feature, index) => (
                <div key={index} className="flex items-start group">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                      {feature.icon}
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">{feature.title}</h4>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
              
              <div className="pt-8">
                <Link href="/search">
                  <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transform hover:-translate-y-0.5 transition-all">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Start Your Journey
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right side - Stats Card */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-3xl transform rotate-3 opacity-10"></div>
              <div className="relative bg-white rounded-3xl border border-gray-200 overflow-hidden">
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Growing Community</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-gray-600">Businesses Onboarded</span>
                        <span className="text-2xl font-bold text-indigo-600">1,247</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full" style={{width: '82%'}}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-gray-600">Monthly Active Users</span>
                        <span className="text-2xl font-bold text-purple-600">52.3K</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full" style={{width: '91%'}}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-gray-600">Total Bookings</span>
                        <span className="text-2xl font-bold text-pink-600">148K+</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-gradient-to-r from-pink-500 to-orange-600 h-2 rounded-full" style={{width: '95%'}}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Average Rating</p>
                        <div className="flex items-center mt-1">
                          <span className="text-2xl font-bold text-gray-900 mr-2">4.9</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Response Time</p>
                        <p className="text-2xl font-bold text-green-600 mt-1">&lt; 2 min</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-r from-indigo-600 to-purple-700 overflow-hidden">
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 1px)', backgroundSize: '32px 32px'}}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium mb-6">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
              </svg>
              Join 1,200+ businesses already on BeautyPortal
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
              Ready to grow your beauty business?
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-10">
              Get discovered by thousands of customers actively looking for services like yours. Start accepting bookings in minutes.
            </p>
            
            <div className="mb-8 space-y-4">
              <Link href="/signup/business">
                <Button size="xl" className="bg-white text-indigo-600 hover:bg-gray-50 font-bold transform hover:-translate-y-0.5 transition-all shadow-xl hover:shadow-2xl px-10 py-6 text-lg">
                  Start Your Free Trial
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </Link>
              <p className="text-white/70 text-sm">No credit card required • Set up in 5 minutes</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <svg className="w-8 h-8 text-white mb-3 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-white font-semibold mb-2">Zero listing fees</h3>
                <p className="text-white/80 text-sm">Only pay when you get bookings</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <svg className="w-8 h-8 text-white mb-3 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <h3 className="text-white font-semibold mb-2">Increase revenue 40%</h3>
                <p className="text-white/80 text-sm">Average growth in first 3 months</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <svg className="w-8 h-8 text-white mb-3 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h3 className="text-white font-semibold mb-2">24/7 Support</h3>
                <p className="text-white/80 text-sm">We're here to help you succeed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Loved by customers &
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> businesses</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what our community has to say about their experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Regular Customer",
                content: "BeautyPortal has made finding and supporting Black-owned salons so easy. I love the instant booking feature!",
                rating: 5
              },
              {
                name: "Michelle Williams",
                role: "Salon Owner",
                content: "Since joining BeautyPortal, my bookings have increased by 40%. The platform is intuitive and my clients love it.",
                rating: 5
              },
              {
                name: "Angela Davis",
                role: "Beauty Enthusiast",
                content: "Finally, a platform that celebrates and supports our community. The quality of services has been exceptional.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 border border-gray-200">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">&ldquo;{testimonial.content}&rdquo;</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Frequently asked
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> questions</span>
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about BeautyPortal
            </p>
          </div>
          
          <div className="space-y-8">
            {[
              {
                question: "How does BeautyPortal work?",
                answer: "Simply search for beauty services in your area, browse available professionals, check real-time availability, and book instantly. You'll receive an immediate confirmation and reminders before your appointment."
              },
              {
                question: "Is it really free to list my business?",
                answer: "Yes! Creating a business profile is completely free. We only charge a small commission on completed bookings, so you only pay when you earn."
              },
              {
                question: "How do I know the businesses are legitimate?",
                answer: "All businesses go through our verification process. We check licenses, insurance, and customer reviews. Look for the verified badge on business profiles for extra peace of mind."
              },
              {
                question: "Can I cancel or reschedule my booking?",
                answer: "Yes, you can cancel or reschedule up to 24 hours before your appointment without any fees. Check the specific cancellation policy for each business as some may vary."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards, debit cards, and digital wallets. Payment is secure and processed through Stripe, and you're only charged after your service is completed."
              },
              {
                question: "How do reviews work?",
                answer: "Only verified customers who have completed a booking can leave reviews. This ensures all feedback is genuine and helps maintain the quality of our platform."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8 hover:bg-gray-100 transition-colors">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-start">
                  <svg className="w-6 h-6 text-indigo-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {faq.question}
                </h3>
                <p className="text-gray-600 leading-relaxed ml-9">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">Still have questions?</p>
            <Link href="/contact">
              <Button variant="outline" size="lg">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  )
}