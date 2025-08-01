import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import BusinessHero from './components/business-hero'
import StickyHeader from './components/sticky-header'
import FloatingActions from './components/floating-actions'
import ServicesSection from './components/services-section'
import ProductsSection from './components/products-section'
import ReviewsSection from './components/reviews-section'
import AboutSection from './components/about-section'
import GallerySection from './components/gallery-section'
import { LocalBusinessSchema, BreadcrumbSchema } from '@/components/seo/structured-data'
import type { Metadata } from 'next'

interface BusinessPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: BusinessPageProps): Promise<Metadata> {
  const { slug } = await params
  
  const business = await prisma.business.findUnique({
    where: { slug },
    select: {
      businessName: true,
      description: true,
      address: true,
      city: true,
      zipCode: true,
      phone: true,
      email: true,
      services: {
        where: { isActive: true },
        select: { name: true },
        take: 5,
      },
      reviews: {
        where: { rating: { gte: 1 } },
        select: { rating: true },
      },
    },
  })

  if (!business) {
    return {
      title: 'Business Not Found',
      description: 'The business you are looking for does not exist.',
    }
  }

  // Calculate average rating and total reviews
  const totalReviews = business.reviews.length
  const averageRating = totalReviews > 0
    ? business.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
    : 0

  const serviceNames = business.services.map(s => s.name).join(', ')
  const ratingText = averageRating && totalReviews > 0 
    ? `${averageRating.toFixed(1)}★ (${totalReviews} reviews)` 
    : ''

  return {
    title: `${business.businessName} - Beauty Services in ${business.city}`,
    description: `${business.description || `Book appointments at ${business.businessName}`}. ${serviceNames ? `Services: ${serviceNames}.` : ''} ${ratingText}`,
    keywords: [business.businessName, business.city, 'beauty salon', 'book appointment', ...business.services.map(s => s.name)],
    openGraph: {
      title: `${business.businessName} | Glamfric`,
      description: business.description || `Book appointments at ${business.businessName} in ${business.city}`,
      url: `/business/${slug}`,
      type: 'website',
      images: [
        {
          url: '/business-default-og.jpg',
          width: 1200,
          height: 630,
          alt: business.businessName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${business.businessName} | Glamfric`,
      description: business.description || `Book appointments at ${business.businessName} in ${business.city}`,
    },
  }
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
      products: {
        where: { isActive: true },
        include: {
          category: true,
        },
        orderBy: [
          { isFeatured: 'desc' },
          { displayOrder: 'asc' },
          { name: 'asc' },
        ],
      },
      productCategories: {
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
      },
      reviews: {
        include: {
          user: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 6,
      },
      availabilities: {
        where: { isActive: true },
        orderBy: { dayOfWeek: 'asc' },
      },
      photos: {
        where: { 
          isActive: true,
        },
        orderBy: [
          { type: 'asc' },
          { order: 'asc' },
        ],
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

  // Get total review count
  const totalReviews = await prisma.review.count({
    where: { businessId: business.id }
  })

  // Check if open now
  const now = new Date()
  const currentDay = now.getDay()
  const currentTime = now.toTimeString().slice(0, 5)
  
  const todayAvailability = business.availabilities.find(a => a.dayOfWeek === currentDay)
  const isOpenNow = todayAvailability ? 
    currentTime >= todayAvailability.startTime && currentTime <= todayAvailability.endTime : 
    false

  // Serialize business data for client components
  const serializedBusiness = {
    ...business,
    commissionRate: Number(business.commissionRate),
    openingHours: (business.openingHours as Record<string, unknown>) || {},
    services: business.services.map(service => ({
      ...service,
      price: Number(service.price)
    })),
    products: business.products.map(product => ({
      ...product,
      price: Number(product.price),
      compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
      cost: product.cost ? Number(product.cost) : null,
      inventoryCount: product.quantity || 0,
      lowStockAlert: product.lowStockAlert || 0,
      category: product.category || undefined
    })),
    photos: business.photos.map(photo => ({
      ...photo,
      key: photo.url, // Using URL as key since key field is missing
      type: photo.type as 'HERO' | 'GALLERY' | 'LOGO' | 'BANNER'
    }))
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <LocalBusinessSchema
        name={business.businessName}
        description={business.description || undefined}
        address={business.address}
        city={business.city}
        postalCode={business.zipCode}
        telephone={business.phone}
        email={business.email || undefined}
        priceRange="$$"
        ratingValue={averageRating || undefined}
        ratingCount={totalReviews || undefined}
        url={`${process.env.NEXT_PUBLIC_URL || 'https://glamfric.com'}/business/${business.slug}`}
        services={business.services.map(s => s.name)}
      />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: process.env.NEXT_PUBLIC_URL || 'https://glamfric.com' },
          { name: 'Find Services', url: `${process.env.NEXT_PUBLIC_URL || 'https://glamfric.com'}/search` },
          { name: business.businessName, url: `${process.env.NEXT_PUBLIC_URL || 'https://glamfric.com'}/business/${business.slug}` },
        ]}
      />
      <Navigation session={session} />
      
      <BusinessHero 
        business={serializedBusiness} 
        averageRating={averageRating}
        totalReviews={totalReviews}
        isOpenNow={isOpenNow}
      />

      <StickyHeader 
        business={serializedBusiness}
        session={session}
      />

      <FloatingActions 
        business={serializedBusiness}
        session={session}
      />

      <main className="flex-1 relative">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
        <div className="absolute top-40 right-0 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 py-12">
          {business.services.length > 0 && (
            <ServicesSection 
              services={serializedBusiness.services}
              businessSlug={business.slug}
              session={session}
              reviews={business.reviews}
            />
          )}

          {business.products.length > 0 && (
            <ProductsSection 
              products={serializedBusiness.products}
              productCategories={business.productCategories}
              businessId={business.id}
              businessName={business.businessName}
              businessSlug={business.slug}
            />
          )}

          {(business.reviews.length > 0 || totalReviews > 0) && (
            <ReviewsSection 
              reviews={business.reviews}
              averageRating={averageRating}
              totalReviews={totalReviews}
              businessSlug={business.slug}
            />
          )}

          <AboutSection 
            business={serializedBusiness}
            availabilities={business.availabilities}
          />

          {serializedBusiness.photos.filter(p => p.type === 'GALLERY').length > 0 && (
            <GallerySection 
              photos={serializedBusiness.photos.filter(p => p.type === 'GALLERY')}
            />
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  )
}