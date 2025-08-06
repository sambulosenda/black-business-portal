'use client'

import { useEffect, useState } from 'react'
import { Session } from 'next-auth'
import Link from 'next/link'
import { Calendar, MapPin, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
    <div
      className={`fixed right-0 bottom-0 left-0 z-40 border-t border-gray-200 bg-white p-4 shadow-lg transition-transform duration-300 lg:hidden ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="flex gap-2">
        {business.services && business.services.length > 0 && (
          <Link href={session ? `/book/${business.slug}` : '/login'} className="flex-1">
            <Button
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transition-all hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl"
              size="lg"
            >
              <Calendar className="mr-2 h-5 w-5" />
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
