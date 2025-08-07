'use client'

import { Clock, Globe, Instagram, MapPin, Phone, Shield, Sparkles, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { S3Image } from '@/components/ui/s3-image'
import type { BusinessPhoto, BusinessWithRelations } from '@/types'

interface BusinessHeroProps {
  business: BusinessWithRelations
  averageRating: number
  totalReviews: number
  isOpenNow: boolean
}

export default function BusinessHero({
  business,
  averageRating,
  totalReviews,
  isOpenNow,
}: BusinessHeroProps) {
  const heroImage = business.photos?.find((p: BusinessPhoto) => p.type === 'HERO')

  return (
    <div className="relative">
      {/* Hero Image Section */}
      {heroImage ? (
        <div className="relative h-[300px] lg:h-[400px]">
          <S3Image
            src={heroImage.url}
            alt={business.businessName}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
      ) : (
        <div className="relative h-[200px] overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 lg:h-[280px]">
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 h-32 w-32 animate-pulse rounded-full bg-white/10 blur-2xl" />
            <div className="animation-delay-2000 absolute right-10 bottom-10 h-40 w-40 animate-pulse rounded-full bg-white/10 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-white/5 blur-3xl" />
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className={`relative ${heroImage ? '-mt-24' : '-mt-12'} z-10`}>
        <div className="rounded-t-3xl bg-white shadow-xl">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Top Section with Badges */}
            <div className="border-b border-gray-100 pt-8 pb-6">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  {/* Business Name and Badges */}
                  <div className="mb-4 flex flex-wrap items-start gap-4">
                    <h1 className="text-3xl font-bold text-gray-900 lg:text-4xl">
                      {business.businessName}
                    </h1>
                    <div className="flex flex-wrap gap-2">
                      {business.isVerified && (
                        <Badge className="border-blue-200 bg-blue-50 px-3 py-1 text-blue-700">
                          <Shield className="mr-1.5 h-4 w-4" />
                          Verified
                        </Badge>
                      )}
                      {isOpenNow && (
                        <Badge className="border-green-200 bg-green-50 px-3 py-1 text-green-700">
                          <Clock className="mr-1.5 h-4 w-4" />
                          Open Now
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Rating and Category */}
                  <div className="mb-4 flex flex-wrap items-center gap-4">
                    <div className="flex items-center rounded-full bg-purple-50 px-4 py-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < Math.floor(averageRating)
                                ? 'fill-current text-purple-500'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 font-semibold text-gray-900">
                        {averageRating.toFixed(1)}
                      </span>
                      <span className="ml-1 text-gray-600">({totalReviews} reviews)</span>
                    </div>
                    <div className="flex items-center rounded-full bg-gray-50 px-4 py-2 text-gray-600">
                      <Sparkles className="mr-2 h-4 w-4 text-purple-500" />
                      {business.category.replace(/_/g, ' ')}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400" />
                      <span>
                        {business.address}, {business.city}, {business.state} {business.zipCode}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400" />
                      <a
                        href={`tel:${business.phone}`}
                        className="transition-colors hover:text-purple-600"
                      >
                        {business.phone}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex gap-3">
                  {business.website && (
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 transition-colors hover:bg-gray-100"
                      aria-label="Visit website"
                    >
                      <Globe className="h-5 w-5 text-gray-600 transition-colors group-hover:text-purple-600" />
                    </a>
                  )}
                  {business.instagram && (
                    <a
                      href={`https://instagram.com/${business.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 transition-colors hover:bg-gray-100"
                      aria-label="Visit Instagram"
                    >
                      <Instagram className="h-5 w-5 text-gray-600 transition-colors group-hover:text-purple-600" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Description Section */}
            {business.description && (
              <div className="py-6">
                <p className="max-w-4xl leading-relaxed text-gray-600">{business.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
