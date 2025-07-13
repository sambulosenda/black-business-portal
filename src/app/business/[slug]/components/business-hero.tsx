'use client'

import { Badge } from '@/components/ui/badge'
import { S3Image } from '@/components/ui/s3-image'
import { MapPin, Phone, Globe, Instagram, Star, Clock, Shield, Sparkles } from 'lucide-react'

interface BusinessHeroProps {
  business: {
    businessName: string;
    category: string;
    address: string;
    city: string;
    state: string;
    instagram: string | null;
    website: string | null;
    phone: string;
    verifiedAt: Date | null;
    featured: boolean;
    photos: Array<{
      id: string;
      type: string;
      imageUrl: string;
    }>;
  }
  averageRating: number
  totalReviews: number
  isOpenNow: boolean
}

export default function BusinessHero({ business, averageRating, totalReviews, isOpenNow }: BusinessHeroProps) {
  const heroImage = business.photos.find((p) => p.type === 'HERO')
  
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
        <div className="h-[200px] lg:h-[280px] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse" />
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse animation-delay-2000" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          </div>
        </div>
      )}
      
      {/* Content Section */}
      <div className={`relative ${heroImage ? '-mt-24' : '-mt-12'} z-10`}>
        <div className="bg-white rounded-t-3xl shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Top Section with Badges */}
            <div className="pt-8 pb-6 border-b border-gray-100">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1">
                  {/* Business Name and Badges */}
                  <div className="flex items-start gap-4 flex-wrap mb-4">
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                      {business.businessName}
                    </h1>
                    <div className="flex gap-2 flex-wrap">
                      {business.isVerified && (
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                          <Shield className="w-4 h-4 mr-1.5" />
                          Verified
                        </Badge>
                      )}
                      {isOpenNow && (
                        <Badge className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
                          <Clock className="w-4 h-4 mr-1.5" />
                          Open Now
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Rating and Category */}
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="flex items-center bg-purple-50 rounded-full px-4 py-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < Math.floor(averageRating)
                                ? 'text-purple-500 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 font-semibold text-gray-900">{averageRating.toFixed(1)}</span>
                      <span className="ml-1 text-gray-600">({totalReviews} reviews)</span>
                    </div>
                    <div className="flex items-center text-gray-600 bg-gray-50 rounded-full px-4 py-2">
                      <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
                      {business.category.replace(/_/g, ' ')}
                    </div>
                  </div>
                  
                  {/* Contact Info */}
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-5 w-5 mr-3 text-gray-400 flex-shrink-0" />
                      <span>{business.address}, {business.city}, {business.state} {business.zipCode}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-5 w-5 mr-3 text-gray-400 flex-shrink-0" />
                      <a href={`tel:${business.phone}`} className="hover:text-purple-600 transition-colors">
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
                      className="inline-flex items-center justify-center w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors group"
                      aria-label="Visit website"
                    >
                      <Globe className="h-5 w-5 text-gray-600 group-hover:text-purple-600 transition-colors" />
                    </a>
                  )}
                  {business.instagram && (
                    <a
                      href={`https://instagram.com/${business.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors group"
                      aria-label="Visit Instagram"
                    >
                      <Instagram className="h-5 w-5 text-gray-600 group-hover:text-purple-600 transition-colors" />
                    </a>
                  )}
                </div>
              </div>
            </div>
            
            {/* Description Section */}
            {business.description && (
              <div className="py-6">
                <p className="text-gray-600 leading-relaxed max-w-4xl">
                  {business.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}