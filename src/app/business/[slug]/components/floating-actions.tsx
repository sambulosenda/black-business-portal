'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Phone, Calendar, MapPin } from 'lucide-react'
import { Session } from 'next-auth'
import type { BusinessWithRelations } from '@/types'

interface FloatingActionsProps {
  business: BusinessWithRelations
  session: Session | null
}

export default function FloatingActions({ business, session }: FloatingActionsProps) {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg transition-transform duration-300 z-40 lg:hidden ${
      isVisible ? 'translate-y-0' : 'translate-y-full'
    }`}>
      <div className="flex gap-2">
        {business.services && business.services.length > 0 && (
          <Link href={session ? `/book/${business.slug}` : '/login'} className="flex-1">
            <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all" size="lg">
              <Calendar className="h-5 w-5 mr-2" />
              Book Now
            </Button>
          </Link>
        )}
        <a href={`tel:${business.phone}`} className="flex-shrink-0">
          <Button variant="outline" size="lg" className="px-4">
            <Phone className="h-5 w-5" />
          </Button>
        </a>
        <a 
          href={`https://maps.google.com/?q=${encodeURIComponent(`${business.address}, ${business.city}, ${business.state} ${business.zipCode}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0"
        >
          <Button variant="outline" size="lg" className="px-4">
            <MapPin className="h-5 w-5" />
          </Button>
        </a>
      </div>
    </div>
  )
}