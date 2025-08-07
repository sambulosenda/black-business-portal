'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Footer from '@/components/layouts/footer'
import { WebsiteSchema } from '@/components/shared/seo/structured-data'
import { Button } from '@/components/ui/button'

export default function Home() {
  const router = useRouter()
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [locationFocused, setLocationFocused] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery && !location) return

    setIsSearching(true)
    const params = new URLSearchParams()
    if (searchQuery) params.append('q', searchQuery)
    if (location) params.append('city', location)

    // Add slight delay for better UX feedback
    await new Promise((resolve) => setTimeout(resolve, 300))
    router.push(`/search?${params.toString()}`)
  }

  // Add smooth scroll behavior
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth'
    return () => {
      document.documentElement.style.scrollBehavior = 'auto'
    }
  }, [])

  const valueProps = [
    {
      title: 'Save up to 30%',
      description: 'Exclusive deals on last-minute bookings and off-peak appointments',
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: 'bg-purple-100 text-purple-700',
      highlight: 'Most Popular',
    },
    {
      title: 'Skip the phone calls',
      description: 'Book anytime from anywhere - no waiting on hold or playing phone tag',
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: 'bg-green-100 text-green-700',
    },
    {
      title: 'Trusted by thousands',
      description: 'Read real reviews from verified customers before you book',
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: 'bg-pink-100 text-pink-700',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <WebsiteSchema />
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex items-center">
              <Link href="/" className="group flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 font-bold text-white shadow-lg transition-shadow group-hover:shadow-xl">
                  G
                </div>
                <span className="font-display text-xl font-medium text-gray-900">Glamfric</span>
              </Link>
            </div>

            <div className="flex items-center space-x-3">
              {session ? (
                <>
                  <Link href="/search">
                    <Button
                      variant="ghost"
                      className="font-medium text-gray-700 hover:text-gray-900"
                    >
                      <svg
                        className="mr-2 h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      Search
                    </Button>
                  </Link>
                  <Link
                    href={
                      session.user.role === 'BUSINESS_OWNER' ? '/business/dashboard' : '/dashboard'
                    }
                  >
                    <Button
                      variant="ghost"
                      className="font-medium text-gray-700 hover:text-gray-900"
                    >
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
                    <Button
                      variant="ghost"
                      className="font-medium text-gray-700 hover:text-gray-900"
                    >
                      <svg
                        className="mr-2 h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      Browse
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="ghost" className="font-medium hover:bg-gray-50">
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/signup/customer">
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg">
                      Get Started
                    </Button>
                  </Link>
                  <div className="ml-2 hidden sm:block">
                    <Link href="/business/join">
                      <Button
                        variant="outline"
                        className="border-gray-300 font-medium hover:bg-gray-50"
                      >
                        <svg
                          className="mr-2 h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
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
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        {/* Decorative elements with animation */}
        <div className="animate-pulse-slow absolute top-0 left-0 h-72 w-72 rounded-full bg-purple-300 opacity-20 mix-blend-multiply blur-xl filter"></div>
        <div
          className="animate-pulse-slow absolute top-0 right-0 h-72 w-72 rounded-full bg-indigo-300 opacity-20 mix-blend-multiply blur-xl filter"
          style={{ animationDelay: '1s' }}
        ></div>
        <div
          className="animate-pulse-slow absolute -bottom-8 left-20 h-72 w-72 rounded-full bg-pink-300 opacity-20 mix-blend-multiply blur-xl filter"
          style={{ animationDelay: '2s' }}
        ></div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid min-h-[600px] grid-cols-1 items-center gap-12 py-16 lg:min-h-[700px] lg:grid-cols-2 lg:py-24">
            {/* Left Content */}
            <div className="space-y-8 text-left lg:pr-8">
              <div className="space-y-6">
                <div className="animate-fade-in-up stagger-1 inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700">
                  <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Trusted by 10,000+ customers
                </div>

                <h1 className="animate-fade-in-up stagger-2 text-4xl leading-tight font-bold text-gray-900 sm:text-5xl lg:text-6xl">
                  Book beauty services in
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {' '}
                    30 seconds
                  </span>
                </h1>

                <p className="animate-fade-in-up stagger-3 max-w-xl text-xl leading-relaxed text-gray-600">
                  Find and instantly book appointments at top-rated African beauty salons and
                  professionals near you. No calls, no waiting.
                </p>
              </div>

              {/* Search Bar */}
              <div className="max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl">
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="group relative">
                      <svg
                        className={`absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform transition-colors duration-200 ${searchFocused ? 'text-indigo-600' : 'text-gray-400'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      <input
                        type="text"
                        placeholder='Try "braids", "nails", or "spa"'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-4 pr-4 pl-12 text-base text-gray-900 placeholder-gray-500 transition-all duration-200 hover:bg-gray-100 focus:border-transparent focus:bg-white focus:shadow-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div className="group relative">
                      <svg
                        className={`absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform transition-colors duration-200 ${locationFocused ? 'text-indigo-600' : 'text-gray-400'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <input
                        type="text"
                        placeholder="City or neighborhood"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        onFocus={() => setLocationFocused(true)}
                        onBlur={() => setLocationFocused(false)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-4 pr-4 pl-12 text-base text-gray-900 placeholder-gray-500 transition-all duration-200 hover:bg-gray-100 focus:border-transparent focus:bg-white focus:shadow-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSearching}
                    className="w-full transform rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSearching ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Searching...
                      </span>
                    ) : (
                      'Find Services'
                    )}
                  </Button>
                </form>

                {/* Popular Searches */}
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <p className="mb-3 text-sm font-medium text-gray-600">Popular searches:</p>
                  <div className="flex flex-wrap gap-2">
                    {['Hair Braiding', 'Nail Art', 'Spa Day', 'Lash Extensions', 'Makeup'].map(
                      (term) => (
                        <button
                          key={term}
                          onClick={() => {
                            setSearchQuery(term.toLowerCase())
                            router.push(`/search?q=${encodeURIComponent(term.toLowerCase())}`)
                          }}
                          className="transform rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:scale-105 hover:border-gray-300 hover:bg-gray-100 hover:shadow-sm active:scale-95"
                        >
                          {term}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="animate-fade-in stagger-4 relative flex h-full items-center justify-center lg:justify-end">
              <div className="relative h-[400px] w-full max-w-lg lg:h-[600px]">
                <div className="absolute inset-0 rotate-6 transform rounded-3xl bg-gradient-to-r from-indigo-500 to-purple-600 opacity-20 transition-transform duration-700 hover:rotate-12"></div>
                <div className="group relative h-full">
                  <Image
                    src="/images/client-bg-new.png"
                    alt="Beauty professional with client"
                    fill
                    priority
                    className="rounded-3xl object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  {/* Floating elements */}
                  <div
                    className="animate-float absolute -top-4 -right-4 rounded-xl border border-gray-200 bg-white p-4 shadow-lg"
                    style={{ animation: 'float 3s ease-in-out infinite' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center -space-x-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-sm">
                          <svg
                            className="h-5 w-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">247 Available Today</p>
                        <p className="text-xs text-gray-600">Book instantly</p>
                      </div>
                    </div>
                  </div>
                  <div
                    className="animate-float absolute -bottom-4 -left-4 rounded-xl border border-gray-200 bg-white p-4 shadow-lg"
                    style={{ animation: 'float 3s ease-in-out infinite', animationDelay: '1.5s' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100">
                        <svg
                          className="h-6 w-6 text-indigo-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Average booking time</p>
                        <p className="text-lg font-semibold text-indigo-600">28 seconds</p>
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
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50 py-24">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, #6366F1 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          ></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-20 text-center">
            <div className="mb-6 inline-flex items-center rounded-full border border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-2 text-sm font-medium text-indigo-700">
              <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z"
                  clipRule="evenodd"
                />
              </svg>
              Why choose Glamfric
            </div>
            <h2 className="mb-6 text-4xl font-bold text-gray-900 sm:text-5xl">
              The brighter way to
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {' '}
                book beauty
              </span>
            </h2>
            <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-600">
              Join thousands who&apos;ve discovered the easiest way to book beauty services. Save
              time, save money, and get pampered.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-10">
            {valueProps.map((prop, index) => (
              <div key={index} className="group relative">
                {prop.highlight && (
                  <div className="absolute -top-4 left-1/2 z-10 -translate-x-1/2 transform animate-pulse rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-1.5 text-xs font-medium text-white shadow-lg">
                    <div className="flex items-center gap-1">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {prop.highlight}
                    </div>
                  </div>
                )}

                {/* Card with enhanced design */}
                <div className="relative h-full">
                  {/* Gradient border effect */}
                  <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 blur transition duration-300 group-hover:opacity-100"></div>

                  {/* Main card */}
                  <div className="relative flex h-full flex-col rounded-3xl border border-gray-200 bg-white p-8 transition-colors duration-300 group-hover:shadow-2xl hover:border-transparent lg:p-10">
                    {/* Icon container with animation */}
                    <div className="relative mb-8">
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-600/20 to-purple-600/20 blur-xl"></div>
                      <div
                        className={`relative inline-flex h-20 w-20 items-center justify-center rounded-2xl ${prop.color} shadow-lg`}
                      >
                        {prop.icon}
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="mb-4 text-2xl font-bold text-gray-900 transition-colors group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent">
                      {prop.title}
                    </h3>
                    <p className="flex-grow leading-relaxed text-gray-600">{prop.description}</p>

                    {/* Learn more link */}
                    <div className="mt-6 flex items-center font-medium text-indigo-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <span className="text-sm">Learn more</span>
                      <svg
                        className="ml-1 h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center">
            <Link href="/search">
              <Button
                size="lg"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl"
              >
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                Start Browsing Services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-700">
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          ></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            {/* Left side - Text content */}
            <div className="text-center lg:text-left">
              <div className="mb-8 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm">
                <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Join 1,200+ businesses already on Glamfric
              </div>

              <h2 className="mb-6 text-4xl leading-tight font-extrabold text-white sm:text-5xl lg:text-6xl">
                Own a hair & beauty business? Bring it online.
              </h2>
              <h3 className="mb-8 text-2xl font-semibold text-white/90 sm:text-3xl">
                Ready to grow your beauty business?
              </h3>
              <p className="mx-auto mb-12 max-w-xl text-xl leading-relaxed text-white/80 lg:mx-0">
                We&apos;ll help you build your business (and client base) with Treatwell, our
                easy-to-use salon software.
              </p>

              <div>
                <Link href="/business/join">
                  <Button
                    size="xl"
                    className="border border-white/20 bg-white px-12 py-7 text-lg font-semibold text-indigo-600 shadow-xl hover:bg-gray-50 hover:shadow-2xl"
                  >
                    Partner with us
                    <svg
                      className="ml-3 h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </Button>
                </Link>
                <p className="mt-8 text-base text-white/70">
                  No credit card required • Set up in 5 minutes
                </p>
              </div>
            </div>

            {/* Right side - Dashboard preview image */}
            <div className="relative lg:pl-8">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 shadow-2xl backdrop-blur-sm">
                <div className="overflow-hidden rounded-xl bg-white shadow-xl">
                  <div className="flex items-center justify-between border-b border-gray-200 bg-gray-100 px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="rounded-md bg-gray-200 px-4 py-1.5 text-xs font-medium text-gray-600">
                      glamfric.com/dashboard
                    </div>
                  </div>
                  <div className="bg-gray-50 p-8">
                    {/* Dashboard header */}
                    <div className="mb-8">
                      <h4 className="mb-1 text-xl font-medium text-gray-900">
                        Good morning, Sarah
                      </h4>
                      <p className="text-sm text-gray-600">Here&apos;s your business overview</p>
                    </div>

                    {/* Dashboard metrics */}
                    <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                            Bookings
                          </p>
                          <svg
                            className="h-4 w-4 text-indigo-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <p className="text-2xl font-semibold text-gray-900">12</p>
                        <p className="mt-1 text-xs font-medium text-green-600">↑ 20% today</p>
                      </div>
                      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                            Revenue
                          </p>
                          <svg
                            className="h-4 w-4 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <p className="text-2xl font-semibold text-gray-900">£850</p>
                        <p className="mt-1 text-xs font-medium text-green-600">↑ 15% week</p>
                      </div>
                      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                            Clients
                          </p>
                          <svg
                            className="h-4 w-4 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                        </div>
                        <p className="text-2xl font-semibold text-gray-900">256</p>
                        <p className="mt-1 text-xs font-medium text-blue-600">+8 new</p>
                      </div>
                      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                            Rating
                          </p>
                          <svg
                            className="h-4 w-4 text-yellow-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                        <p className="text-2xl font-semibold text-gray-900">4.9</p>
                        <p className="mt-1 text-xs font-medium text-yellow-600">★★★★★</p>
                      </div>
                    </div>

                    {/* Appointments section */}
                    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                      <div className="mb-6 flex items-center justify-between">
                        <h5 className="text-base font-semibold text-gray-900">
                          Today&apos;s Schedule
                        </h5>
                        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                          View all →
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50">
                          <div className="flex items-center space-x-4">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Sarah Johnson</p>
                              <p className="text-xs text-gray-500">Hair Cut & Color • 2 hours</p>
                            </div>
                          </div>
                          <p className="text-sm font-medium text-gray-700">10:00 AM</p>
                        </div>
                        <div className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50">
                          <div className="flex items-center space-x-4">
                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Emma Wilson</p>
                              <p className="text-xs text-gray-500">
                                Manicure & Pedicure • 1.5 hours
                              </p>
                            </div>
                          </div>
                          <p className="text-sm font-medium text-gray-700">12:30 PM</p>
                        </div>
                        <div className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50">
                          <div className="flex items-center space-x-4">
                            <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Michael Chen</p>
                              <p className="text-xs text-gray-500">Men&apos;s Haircut • 45 mins</p>
                            </div>
                          </div>
                          <p className="text-sm font-medium text-gray-700">3:00 PM</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-yellow-400 opacity-10 blur-2xl"></div>
              <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-purple-400 opacity-10 blur-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900 sm:text-5xl">
              Loved by customers &
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {' '}
                businesses
              </span>
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-gray-600">
              See what our community has to say about their experience
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Regular Customer',
                content:
                  'Glamfric has made finding and supporting Black-owned salons so easy. I love the instant booking feature!',
                rating: 5,
              },
              {
                name: 'Michelle Williams',
                role: 'Salon Owner',
                content:
                  'Since joining Glamfric, my bookings have increased by 40%. The platform is intuitive and my clients love it.',
                rating: 5,
              },
              {
                name: 'Angela Davis',
                role: 'Beauty Enthusiast',
                content:
                  'Finally, a platform that celebrates and supports our community. The quality of services has been exceptional.',
                rating: 5,
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="h-5 w-5 fill-current text-yellow-400"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="mb-6 leading-relaxed text-gray-700 italic">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
