'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState } from '@/components/ui/empty-state'
import { Session } from 'next-auth'
import { useCart } from '@/contexts/cart-context'
import { ShoppingCart } from 'lucide-react'

interface Business {
  id: string
  businessName: string
  slug: string
  category: string
  city: string
  state: string
  address: string
  zipCode: string
  phone: string
  email: string | null
  website: string | null
  instagram: string | null
  description: string | null
  isVerified: boolean
  services: {
    id: string
    name: string
    description: string | null
    price: any
    duration: number
    category: string | null
  }[]
  products: {
    id: string
    name: string
    description: string | null
    price: any
    compareAtPrice: any | null
    images: string[]
    brand: string | null
    isFeatured: boolean
    category: {
      id: string
      name: string
    } | null
  }[]
  productCategories: {
    id: string
    name: string
  }[]
  reviews: {
    id: string
    rating: number
    comment: string | null
    createdAt: Date
    user: {
      id: string
      name: string | null
    }
  }[]
  availabilities: {
    id: string
    dayOfWeek: number
    startTime: string
    endTime: string
  }[]
}

interface BusinessProfileTabsProps {
  business: Business
  averageRating: number
  session: Session | null
}

export default function BusinessProfileTabs({ business, averageRating, session }: BusinessProfileTabsProps) {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const { addProduct } = useCart()

  const handleAddToCart = (product: any) => {
    addProduct({
      id: product.id,
      businessId: business.id,
      businessName: business.businessName,
      businessSlug: business.slug,
      name: product.name,
      price: Number(product.price),
      quantity: 1,
      image: product.images?.[0],
    })
  }


  return (
    <Tabs defaultValue="services" className="w-full">
      <TabsList className="grid w-full grid-cols-5 mb-8">
        <TabsTrigger value="services" className="gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <span className="hidden sm:inline">Services</span>
          <span className="sm:hidden">Services</span>
        </TabsTrigger>
        <TabsTrigger value="products" className="gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span className="hidden sm:inline">Products</span>
          <span className="sm:hidden">{business.products.length}</span>
        </TabsTrigger>
        <TabsTrigger value="about" className="gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="hidden sm:inline">About</span>
          <span className="sm:hidden">About</span>
        </TabsTrigger>
        <TabsTrigger value="reviews" className="gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <span className="hidden sm:inline">Reviews</span>
          <span className="sm:hidden">{business.reviews.length}</span>
        </TabsTrigger>
        <TabsTrigger value="hours" className="gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="hidden sm:inline">Hours</span>
          <span className="sm:hidden">Hours</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="services" className="space-y-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader>
            <CardTitle>Our Services</CardTitle>
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
                          ${service.price.toFixed(2)}
                        </p>
                        <div className="mt-2">
                          {session ? (
                            <Link
                              href={`/book/${business.slug}?service=${service.id}`}
                            >
                              <Button size="sm">
                                Book Now
                              </Button>
                            </Link>
                          ) : (
                            <Link
                              href="/login"
                            >
                              <Button size="sm" variant="outline">
                                Sign in to Book
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon="services"
                title="No services available"
                description="This business hasn't added any services yet"
              />
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="products" className="space-y-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader>
            <CardTitle>Our Products</CardTitle>
            <CardDescription>Browse our selection of quality products</CardDescription>
          </CardHeader>
          <CardContent>
            {business.products.length > 0 ? (
              <div className="space-y-6">
                {/* Featured Products */}
                {business.products.filter(p => p.isFeatured).length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Featured Products</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {business.products
                        .filter(p => p.isFeatured)
                        .map((product) => (
                          <div
                            key={product.id}
                            className="group border border-gray-200 rounded-lg overflow-hidden hover:border-indigo-300 hover:shadow-lg transition-all duration-200"
                          >
                            <div className="aspect-square bg-gray-100 relative">
                              {product.images.length > 0 ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                  </svg>
                                </div>
                              )}
                              {product.compareAtPrice && (
                                <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                                  Sale
                                </Badge>
                              )}
                            </div>
                            <div className="p-4">
                              <h4 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                {product.name}
                              </h4>
                              {product.brand && (
                                <p className="text-sm text-gray-500 mt-1">{product.brand}</p>
                              )}
                              {product.description && (
                                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                  {product.description}
                                </p>
                              )}
                              <div className="mt-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-bold text-indigo-600">
                                    ${Number(product.price).toFixed(2)}
                                  </span>
                                  {product.compareAtPrice && (
                                    <span className="text-sm text-gray-500 line-through">
                                      ${Number(product.compareAtPrice).toFixed(2)}
                                    </span>
                                  )}
                                </div>
                                {product.category && (
                                  <Badge variant="secondary" className="text-xs">
                                    {product.category.name}
                                  </Badge>
                                )}
                              </div>
                              <Button
                                size="sm"
                                className="w-full mt-3"
                                onClick={() => handleAddToCart(product)}
                              >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Add to Cart
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* All Products by Category */}
                {business.productCategories.map((category) => {
                  const categoryProducts = business.products.filter(
                    p => p.category?.id === category.id && !p.isFeatured
                  )
                  
                  if (categoryProducts.length === 0) return null

                  return (
                    <div key={category.id}>
                      <h3 className="text-lg font-semibold mb-4">{category.name}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categoryProducts.map((product) => (
                          <div
                            key={product.id}
                            className="group border border-gray-200 rounded-lg overflow-hidden hover:border-indigo-300 hover:shadow-lg transition-all duration-200"
                          >
                            <div className="aspect-square bg-gray-100 relative">
                              {product.images.length > 0 ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                  </svg>
                                </div>
                              )}
                              {product.compareAtPrice && (
                                <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                                  Sale
                                </Badge>
                              )}
                            </div>
                            <div className="p-4">
                              <h4 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                {product.name}
                              </h4>
                              {product.brand && (
                                <p className="text-sm text-gray-500 mt-1">{product.brand}</p>
                              )}
                              {product.description && (
                                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                  {product.description}
                                </p>
                              )}
                              <div className="mt-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-bold text-indigo-600">
                                    ${Number(product.price).toFixed(2)}
                                  </span>
                                  {product.compareAtPrice && (
                                    <span className="text-sm text-gray-500 line-through">
                                      ${Number(product.compareAtPrice).toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                className="w-full mt-3"
                                onClick={() => handleAddToCart(product)}
                              >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Add to Cart
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}

                {/* Uncategorized Products */}
                {business.products.filter(p => !p.category && !p.isFeatured).length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Other Products</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {business.products
                        .filter(p => !p.category && !p.isFeatured)
                        .map((product) => (
                          <div
                            key={product.id}
                            className="group border border-gray-200 rounded-lg overflow-hidden hover:border-indigo-300 hover:shadow-lg transition-all duration-200"
                          >
                            <div className="aspect-square bg-gray-100 relative">
                              {product.images.length > 0 ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                  </svg>
                                </div>
                              )}
                              {product.compareAtPrice && (
                                <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                                  Sale
                                </Badge>
                              )}
                            </div>
                            <div className="p-4">
                              <h4 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                {product.name}
                              </h4>
                              {product.brand && (
                                <p className="text-sm text-gray-500 mt-1">{product.brand}</p>
                              )}
                              {product.description && (
                                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                  {product.description}
                                </p>
                              )}
                              <div className="mt-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-bold text-indigo-600">
                                    ${Number(product.price).toFixed(2)}
                                  </span>
                                  {product.compareAtPrice && (
                                    <span className="text-sm text-gray-500 line-through">
                                      ${Number(product.compareAtPrice).toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                className="w-full mt-3"
                                onClick={() => handleAddToCart(product)}
                              >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Add to Cart
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                icon="products"
                title="No products available"
                description="This business hasn't added any products yet"
              />
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="about" className="space-y-6">
        {business.description && (
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <CardTitle>About Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">{business.description}</p>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Category</h4>
              <p className="mt-1 text-gray-900">{business.category.replace(/_/g, ' ')}</p>
            </div>
            {business.website && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">Website</h4>
                <a 
                  href={business.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-1 text-indigo-600 hover:text-indigo-500"
                >
                  Visit our website
                </a>
              </div>
            )}
            {business.instagram && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">Social Media</h4>
                <a 
                  href={`https://instagram.com/${business.instagram.replace('@', '')}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-1 text-indigo-600 hover:text-indigo-500"
                >
                  @{business.instagram.replace('@', '')}
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="reviews" className="space-y-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Customer Reviews</CardTitle>
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
                {business.reviews.map((review) => (
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
              </div>
            ) : (
              <EmptyState
                icon="reviews"
                title="No reviews yet"
                description="Be the first to review this business!"
              />
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="hours" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Business Hours
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

          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Location & Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <address className="not-italic">
                      {business.address}<br />
                      {business.city}, {business.state} {business.zipCode}
                    </address>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <a href={`tel:${business.phone}`} className="hover:text-indigo-600 flex items-center">
                      {business.phone}
                    </a>
                  </dd>
                </div>
                {business.email && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <a href={`mailto:${business.email}`} className="hover:text-indigo-600">
                        {business.email}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  )
}