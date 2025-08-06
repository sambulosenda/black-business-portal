'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import ServicesSection from './services-section'
import ReviewsSection from './reviews-section'
import AboutSection from './about-section'
import GallerySection from './gallery-section'
import { Session } from 'next-auth'
import type { BusinessWithRelations, ReviewWithRelations } from '@/types'

interface TabNavigationProps {
  business: BusinessWithRelations
  session: Session | null
  reviews: ReviewWithRelations[]
  averageRating: number
  totalReviews: number
  availabilities: {
    dayOfWeek: number
    startTime: string
    endTime: string
    isActive: boolean
  }[]
}

export default function TabNavigation({
  business,
  session,
  reviews,
  averageRating,
  totalReviews,
  availabilities
}: TabNavigationProps) {
  const [activeTab, setActiveTab] = useState('overview')
  
  const tabs = [
    { 
      id: 'overview', 
      label: 'Overview',
      show: true
    }
  ]
  
  // Add gallery tab if there are gallery photos
  const galleryPhotos = business.photos?.filter(p => p.type === 'GALLERY') || []
  if (galleryPhotos.length > 0) {
    tabs.push({ 
      id: 'gallery', 
      label: 'Gallery',
      show: true
    })
  }
  
  // Only show tabs if there's more than just the overview
  const showTabs = tabs.length > 1
  
  return (
    <>
      {/* Tab Navigation Bar - Only show if there are multiple tabs */}
      {showTabs && (
        <div className="sticky top-16 z-20 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "py-4 px-1 border-b-2 font-medium text-sm transition-all",
                    activeTab === tab.id
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}
      
      {/* Tab Content */}
      <div className="min-h-screen">
        {activeTab === 'overview' && (
          <>
            {/* Services Section */}
            {business.services && business.services.length > 0 && (
              <section className="bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <ServicesSection 
                    services={business.services}
                    businessSlug={business.slug}
                    session={session}
                    reviews={reviews}
                  />
                </div>
              </section>
            )}
            
            {/* Reviews Section */}
            {(reviews.length > 0 || totalReviews > 0) && (
              <section className="bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <ReviewsSection 
                    reviews={reviews}
                    averageRating={averageRating}
                    totalReviews={totalReviews}
                    businessSlug={business.slug}
                  />
                </div>
              </section>
            )}
            
            {/* About Section */}
            <section className="bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <AboutSection 
                  business={business}
                  availabilities={availabilities}
                />
              </div>
            </section>
          </>
        )}
        
        {activeTab === 'gallery' && galleryPhotos.length > 0 && (
          <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <GallerySection 
                photos={galleryPhotos}
              />
            </div>
          </section>
        )}
      </div>
    </>
  )
}