import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { Breadcrumb, BreadcrumbWrapper } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface BusinessPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function BusinessProfilePage({ params }: BusinessPageProps) {
  const session = await getSession()
  const { slug } = await params
  
  const business = await prisma.business.findUnique({
    where: {
      slug: slug,
      isActive: true,
    },
    include: {
      services: {
        where: { isActive: true },
        orderBy: { name: 'asc' },
      },
      reviews: {
        include: {
          user: true,
        },
        orderBy: { createdAt: 'desc' },
      },
      availabilities: {
        where: { isActive: true },
        orderBy: { dayOfWeek: 'asc' },
      },
    },
  })

  if (!business) {
    notFound()
  }

  // Calculate average rating
  const averageRating =
    business.reviews.length > 0
      ? business.reviews.reduce((acc, review) => acc + review.rating, 0) /
        business.reviews.length
      : 0

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Navigation session={session} />
      <BreadcrumbWrapper>
        <Breadcrumb 
          items={[
            { label: 'Home', href: '/' },
            { label: 'Search', href: '/search' },
            { label: business.businessName }
          ]}
        />
      </BreadcrumbWrapper>

      {/* Business Header */}
      <div className="bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-wrap gap-3">
                <h1 className="text-4xl font-bold">
                  {business.businessName}
                </h1>
                {business.isVerified && (
                  <Badge variant="success" className="bg-green-100/20 text-white border-white/20">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </Badge>
                )}
              </div>
              <div className="mt-3 flex flex-col sm:flex-row sm:flex-wrap gap-4">
                <div className="flex items-center text-sm text-white/90">
                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-white/70" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                    <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                  </svg>
                  {business.category.replace(/_/g, ' ')}
                </div>
                <div className="flex items-center text-sm text-white/90">
                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-white/70" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {business.address}, {business.city}, {business.state} {business.zipCode}
                </div>
                <div className="flex items-center text-sm text-white/90">
                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-white/70" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  {business.phone}
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <div className="flex items-center bg-white/20 rounded-full px-4 py-2">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(averageRating)
                          ? 'text-yellow-300'
                          : 'text-white/30'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-2 text-sm text-white font-medium">
                    {averageRating.toFixed(1)} ({business.reviews.length} reviews)
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-5 flex lg:mt-0 lg:ml-4 gap-3">
              {business.website && (
                <a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="secondary" className="bg-white text-indigo-600 hover:bg-gray-100 transition-colors duration-200">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    Website
                  </Button>
                </a>
              )}
              {business.instagram && (
                <a
                  href={`https://instagram.com/${business.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="secondary" className="bg-white text-indigo-600 hover:bg-gray-100 transition-colors duration-200">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
                    </svg>
                    Instagram
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Services & Booking */}
            <div className="lg:col-span-2">
            {/* Description */}
            {business.description && (
              <Card className="mb-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">{business.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Services */}
            <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <CardTitle>Services</CardTitle>
                <CardDescription>Choose from our range of professional services</CardDescription>
              </CardHeader>
              <CardContent>
              {business.services.length > 0 ? (
                <div className="space-y-4">
                  {business.services.map((service) => (
                    <div
                      key={service.id}
                      className="group border border-gray-200 rounded-lg p-6 hover:border-indigo-300 hover:shadow-md transition-all duration-200 bg-white hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {service.name}
                          </h3>
                          {service.description && (
                            <p className="mt-1 text-sm text-gray-600">
                              {service.description}
                            </p>
                          )}
                          <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {service.duration} min
                            </span>
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              {service.category || 'Service'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4 flex flex-col items-end">
                          <p className="text-2xl font-bold text-indigo-600">
                            ${service.price.toString()}
                          </p>
                            {session ? (
                              <Link
                                href={`/book/${business.slug}?service=${service.id}`}
                              >
                                <Button size="sm" className="mt-2">
                                  Book Now
                                </Button>
                              </Link>
                            ) : (
                              <Link
                                href="/login"
                              >
                                <Button size="sm" variant="outline" className="mt-2">
                                  Sign in to book
                                </Button>
                              </Link>
                            )}
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No services listed yet.</p>
                )}
                </CardContent>
              </Card>

              {/* Reviews */}
              <Card className="mt-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Reviews</CardTitle>
                    {business.reviews.length > 0 && (
                      <div className="flex items-center">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`h-5 w-5 ${
                                i < Math.round(averageRating)
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-2 text-lg font-medium text-gray-900">
                          {averageRating.toFixed(1)}
                        </span>
                        <span className="ml-1 text-sm text-gray-500">
                          ({business.reviews.length} {business.reviews.length === 1 ? 'review' : 'reviews'})
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
              
              {business.reviews.length > 0 ? (
                <div className="space-y-6">
                    {business.reviews.slice(0, 5).map((review) => (
                      <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <p className="font-medium text-gray-900">{review.user.name}</p>
                              <span className="mx-2 text-gray-300">•</span>
                              <span className="text-sm text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString('en-US', {
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? 'text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            {review.comment && (
                              <p className="mt-3 text-gray-700 leading-relaxed">{review.comment}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  
                  {business.reviews.length > 5 && (
                    <p className="text-center text-sm text-gray-500 pt-2">
                      Showing 5 of {business.reviews.length} reviews
                    </p>
                  )}
                </div>
              ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No reviews yet</p>
                    <p className="mt-1 text-sm text-gray-400">Be the first to review this business!</p>
                  </div>
                )}
                </CardContent>
              </Card>
            </div>

            {/* Business Info Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Hours */}
              <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                {business.availabilities.length > 0 ? (
                  <dl className="space-y-2">
                    {business.availabilities.map((availability) => (
                      <div key={availability.id} className="flex justify-between text-sm">
                        <dt className="text-gray-600">{dayNames[availability.dayOfWeek]}</dt>
                        <dd className="text-gray-900 font-medium">
                          {availability.startTime} - {availability.endTime}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="text-gray-500 text-sm">Hours not specified</p>
                )}
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Contact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <a href={`tel:${business.phone}`} className="hover:text-indigo-600 flex items-center">
                        <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {business.phone}
                      </a>
                    </dd>
                  </div>
                  {business.email && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <a href={`mailto:${business.email}`} className="hover:text-indigo-600 flex items-center">
                          <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {business.email}
                        </a>
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Address</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <address className="not-italic flex items-start">
                        <svg className="w-4 h-4 mr-1 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>
                          {business.address}<br />
                          {business.city}, {business.state} {business.zipCode}
                        </span>
                      </address>
                    </dd>
                  </div>
                </dl>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}