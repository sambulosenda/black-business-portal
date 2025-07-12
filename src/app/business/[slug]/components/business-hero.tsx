'use client'

import { Badge } from '@/components/ui/badge'
import { S3Image } from '@/components/ui/s3-image'
import { MapPin, Phone, Globe, Instagram, Star, Clock } from 'lucide-react'

interface BusinessHeroProps {
  business: any
  averageRating: number
  totalReviews: number
  isOpenNow: boolean
}

export default function BusinessHero({ business, averageRating, totalReviews, isOpenNow }: BusinessHeroProps) {
  const heroImage = business.photos.find((p: any) => p.type === 'HERO')
  
  return (
    <div className="relative">
      {heroImage && (
        <div className="absolute inset-0 h-[400px] lg:h-[500px]">
          <S3Image
            src={heroImage.url}
            alt={business.businessName}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}
      
      <div className={`relative ${heroImage ? 'pt-[300px] lg:pt-[400px]' : 'pt-20'}`}>
        <div className="bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 rounded-t-3xl shadow-xl relative border-t border-indigo-100/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-start gap-3 flex-wrap">
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {business.businessName}
                  </h1>
                  <div className="flex gap-2">
                    {business.isVerified && (
                      <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </Badge>
                    )}
                    {isOpenNow && (
                      <Badge className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-100">
                        <Clock className="w-4 h-4 mr-1" />
                        Open Now
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mt-3">
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
                    <span className="ml-2 font-semibold text-lg">{averageRating.toFixed(1)}</span>
                    <span className="ml-1 text-gray-600">({totalReviews} reviews)</span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-600">{business.category.replace(/_/g, ' ')}</span>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-5 w-5 mr-2 text-gray-400" />
                    {business.address}, {business.city}, {business.state} {business.zipCode}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-5 w-5 mr-2 text-gray-400" />
                    <a href={`tel:${business.phone}`} className="hover:text-purple-600 transition-colors">
                      {business.phone}
                    </a>
                  </div>
                </div>
                
                {business.description && (
                  <p className="mt-4 text-gray-600 leading-relaxed max-w-3xl">
                    {business.description}
                  </p>
                )}
              </div>
              
              <div className="flex gap-3">
                {business.website && (
                  <a
                    href={business.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    aria-label="Visit website"
                  >
                    <Globe className="h-5 w-5 text-gray-600" />
                  </a>
                )}
                {business.instagram && (
                  <a
                    href={`https://instagram.com/${business.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    aria-label="Visit Instagram"
                  >
                    <Instagram className="h-5 w-5 text-gray-600" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}