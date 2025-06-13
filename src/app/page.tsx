import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { getSession } from "@/lib/session"

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
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-indigo-600">
                BeautyPortal
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {session ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/api/auth/signout"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign out
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup/customer"
                    className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Sign up
                  </Link>
                  <Link
                    href="/signup/business"
                    className="border border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    List your business
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-indigo-600">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl">
              Discover Black-Owned
              <span className="block">Beauty & Wellness</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-indigo-200 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Book appointments with talented Black beauty professionals in your area.
              Support local businesses while looking and feeling your best.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link
                  href="/search"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                >
                  Find Services
                </Link>
              </div>
              {!session?.user && (
                <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                  <Link
                    href="/signup/business"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-400 md:py-4 md:text-lg md:px-10"
                  >
                    List Your Business
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Browse by Category
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/search?category=${category.id}`}
              className="flex flex-col items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <span className="text-3xl mb-2">{category.icon}</span>
              <span className="text-sm text-center text-gray-700">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Business Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Featured Businesses
        </h2>
        {businessesWithRatings.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {businessesWithRatings.map((business) => (
              <Link
                key={business.id}
                href={`/business/${business.slug}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
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
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Verified
                      </span>
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
                </div>
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
      <div className="bg-gray-100">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Are you a beauty professional?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Join our platform and connect with customers looking for your services.
            </p>
            <div className="mt-8">
              <Link
                href="/signup/business"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                List your business for free
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}