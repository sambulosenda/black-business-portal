'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Phone, Calendar } from 'lucide-react'
import { Session } from 'next-auth'
import type { BusinessWithRelations } from '@/types'

interface StickyHeaderProps {
  business: BusinessWithRelations
  session: Session | null
}

export default function StickyHeader({ business, session }: StickyHeaderProps) {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  return (
    <div className={`hidden lg:block fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm transition-transform duration-300 z-30 ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-semibold text-gray-900">{business.businessName}</h2>
            <nav className="flex gap-6">
              <a href="#services" className="text-gray-600 hover:text-purple-600 transition-colors">Services</a>
              <a href="#products" className="text-gray-600 hover:text-purple-600 transition-colors">Products</a>
              <a href="#reviews" className="text-gray-600 hover:text-purple-600 transition-colors">Reviews</a>
              <a href="#about" className="text-gray-600 hover:text-purple-600 transition-colors">About</a>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <a href={`tel:${business.phone}`}>
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4 mr-2" />
                Call
              </Button>
            </a>
            {business.services && business.services.length > 0 && (
              <Link href={session ? `/book/${business.slug}` : '/login'}>
                <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Now
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}