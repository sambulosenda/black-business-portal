import Link from "next/link"
import { getSession } from "@/lib/session"
import { Button } from "@/components/ui/button"
import Footer from "@/components/footer"

export default async function Home() {
  const session = await getSession()

  const valueProps = [
    {
      title: 'Smart prices',
      description: 'Just book last-minute, or off-peak',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-purple-100 text-purple-700'
    },
    {
      title: 'Book 24/7',
      description: 'From bed, or the bus',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-green-100 text-green-700'
    },
    {
      title: 'Choice of top-rated salons',
      description: 'Thousands of venues (and reviews)',
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
      <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2 group">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
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
      <section className="bg-indigo-600 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-5 py-2.5 bg-white/20 text-white rounded-full text-sm font-medium mb-10">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Supporting Black Excellence in Beauty
            </div>
            
            <h1 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl xl:text-7xl mb-8 leading-tight">
              Book with Black-Owned
              <span className="block mt-3">Beauty & Wellness</span>
            </h1>
            
            <p className="text-lg sm:text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto mb-12 leading-relaxed">
              Discover and support talented Black beauty professionals in your community. 
              From hair care to wellness services, find your perfect match.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-16">
              <Link href="/search">
                <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-50 shadow-sm">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Find Services
                </Button>
              </Link>
              {!session?.user && (
                <Link href="/signup/business">
                  <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-indigo-600">
                    List Your Business
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="bg-gray-50 py-16 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-indigo-600 mb-2">1,000+</div>
              <div className="text-gray-600">Black-owned businesses</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-indigo-600 mb-2">50,000+</div>
              <div className="text-gray-600">Happy customers</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-indigo-600 mb-2">4.9 ★</div>
              <div className="text-gray-600">Average rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            The brighter way to book beauty
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {valueProps.map((prop, index) => (
              <div key={index} className="text-center">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl ${prop.color} mb-4`}>
                  {prop.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {prop.title}
                </h3>
                <p className="text-gray-600">
                  {prop.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Supporting made meaningful
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Give the gift of essential self-care and glow-from-within moments to the Black-owned businesses in your community.
              </p>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-indigo-100 text-indigo-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Search & Discover</h3>
                    <p className="mt-1 text-gray-600">Find Black-owned salons and spas near you</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-indigo-100 text-indigo-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Book Instantly</h3>
                    <p className="mt-1 text-gray-600">Choose your service and time, book in seconds</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-indigo-100 text-indigo-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Support & Enjoy</h3>
                    <p className="mt-1 text-gray-600">Get pampered while supporting your community</p>
                  </div>
                </div>
              </div>
              <div className="mt-10">
                <Link href="/search">
                  <Button size="lg" className="shadow-sm hover:shadow-md">
                    Start Booking Now
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="bg-indigo-100 rounded-2xl p-8">
                  <div className="bg-white rounded-xl shadow-xl p-8 text-center">
                    <div className="text-5xl font-bold text-indigo-600 mb-2">5,000+</div>
                    <div className="text-gray-600 mb-6">Black-owned businesses supported</div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-semibold text-gray-900">100K+</div>
                        <div className="text-sm text-gray-500">Bookings made</div>
                      </div>
                      <div>
                        <div className="text-2xl font-semibold text-gray-900">4.9/5</div>
                        <div className="text-sm text-gray-500">Average rating</div>
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
      <section className="bg-indigo-600">
        <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-white">
              Are you a beauty professional?
            </h2>
            <p className="mt-4 text-xl text-white/90 max-w-2xl mx-auto">
              Join our growing community of Black-owned businesses and connect with customers who value your expertise.
            </p>
            <div className="mt-8">
              <Link href="/signup/business">
                <Button size="xl" className="bg-white text-indigo-600 hover:bg-gray-50 font-semibold shadow-sm hover:shadow-md">
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
      </section>
      
      <Footer />
    </div>
  )
}