import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { getSession } from "@/lib/session"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Footer from "@/components/footer"

export default async function Home() {
  const session = await getSession()

  // Get featured businesses
  const businesses = await prisma.business.findMany({
    where: {
      isActive: true,
    },
    include: {
      reviews: true,
      services: {
        where: { isActive: true },
        take: 3,
      },
    },
    take: 12,
  })

  // Calculate average ratings
  const businessesWithRatings = businesses.map((business) => {
    const avgRating =
      business.reviews.length > 0
        ? business.reviews.reduce((acc, review) => acc + review.rating, 0) /
          business.reviews.length
        : 0
    return { ...business, avgRating }
  })

  const categories = [
    { id: 'HAIR_SALON', name: 'Hair Salons', icon: '💇‍♀️' },
    { id: 'BARBER_SHOP', name: 'Barber Shops', icon: '💈' },
    { id: 'NAIL_SALON', name: 'Nail Salons', icon: '💅' },
    { id: 'SPA', name: 'Spas', icon: '🧖‍♀️' },
    { id: 'MASSAGE', name: 'Massage', icon: '💆‍♀️' },
    { id: 'MAKEUP', name: 'Makeup', icon: '💄' },
    { id: 'SKINCARE', name: 'Skincare', icon: '✨' },
    { id: 'WELLNESS', name: 'Wellness', icon: '🧘‍♀️' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2 group">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md group-hover:shadow-lg transition-shadow">
                  B
                </div>
                <span className="text-xl font-bold text-gray-900">BeautyPortal</span>
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              {session ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
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
                  <Link href="/login">
                    <Button variant="ghost">Sign in</Button>
                  </Link>
                  <Link href="/signup/customer">
                    <Button variant="primary">Sign up</Button>
                  </Link>
                  <Link href="/signup/business">
                    <Button variant="outline">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="hidden sm:inline">List your business</span>
                      <span className="sm:hidden">List business</span>
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 opacity-90" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20" />
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-white/10 text-white mb-6 backdrop-blur-sm">
              <span className="animate-pulse mr-2">🌟</span>
              Supporting Black Excellence in Beauty
            </div>
            <h1 className="text-5xl font-extrabold text-white sm:text-6xl md:text-7xl tracking-tight">
              <span className="block">Discover Black-Owned</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-pink-200">
                Beauty & Wellness
              </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-white/90 leading-relaxed">
              Book appointments with talented Black beauty professionals in your area.
              Support local businesses while looking and feeling your best.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/search">
                <Button size="xl" className="bg-white text-indigo-600 hover:bg-gray-100 font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-200">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Find Services Near You
                </Button>
              </Link>
              {!session?.user && (
                <Link href="/signup/business">
                  <Button size="xl" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-indigo-600 font-semibold">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    List Your Business
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">
            Browse by Category
          </h2>
          <p className="mt-2 text-gray-600">Find the perfect service for your needs</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/search?category=${category.id}`}
              className="group flex flex-col items-center p-6 bg-white rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
            >
              <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-200">
                {category.icon}
              </div>
              <span className="text-sm font-medium text-center text-gray-700 group-hover:text-indigo-600">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Business Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">
            Featured Businesses
          </h2>
          <p className="mt-2 text-gray-600">Discover top-rated beauty and wellness services</p>
        </div>
        {businessesWithRatings.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {businessesWithRatings.map((business) => (
              <Link
                key={business.id}
                href={`/business/${business.slug}`}
                className="block"
              >
                <Card className="h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer">
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
                            i < Math.floor(business.avgRating)
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
                        ({business.reviews.length} reviews)
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
                        {business.services.map((service) => (
                          <div
                            key={service.id}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-gray-600">{service.name}</span>
                            <span className="font-medium text-gray-900">
                              ${service.price.toString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No businesses listed yet.
            </p>
            <Link
              href="/signup/business"
              className="mt-4 inline-block text-indigo-600 hover:text-indigo-500"
            >
              Be the first to list your business →
            </Link>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black opacity-10" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M0%2040L40%200H20L0%2020M40%2040V20L20%2040%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E')]" />
        </div>
        <div className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-white">
              Are you a beauty professional?
            </h2>
            <p className="mt-4 text-xl text-white/90 max-w-2xl mx-auto">
              Join our growing community of Black-owned businesses and connect with customers who value your expertise.
            </p>
            <div className="mt-8">
              <Link href="/signup/business">
                <Button size="xl" className="bg-white text-indigo-600 hover:bg-gray-100 font-semibold shadow-xl">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  List your business for free
                </Button>
              </Link>
            </div>
            <div className="mt-6 flex items-center justify-center space-x-8 text-white/80">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>No listing fees</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>Grow your business</span>
              </div>
              <div className="flex items-center hidden sm:flex">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Join our community</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}