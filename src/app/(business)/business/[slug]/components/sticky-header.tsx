'use client'

import { useEffect, useState } from 'react'
import { Session } from 'next-auth'
import Link from 'next/link'
import { Calendar, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
    <div
      className={`fixed top-0 right-0 left-0 z-30 hidden border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-md transition-transform duration-300 lg:block ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-semibold text-gray-900">{business.businessName}</h2>
            <nav className="flex gap-6">
              <a href="#services" className="text-gray-600 transition-colors hover:text-purple-600">
                Services
              </a>
              <a href="#products" className="text-gray-600 transition-colors hover:text-purple-600">
                Products
              </a>
              <a href="#reviews" className="text-gray-600 transition-colors hover:text-purple-600">
                Reviews
              </a>
              <a href="#about" className="text-gray-600 transition-colors hover:text-purple-600">
                About
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <a href={`tel:${business.phone}`}>
              <Button variant="outline" size="sm">
                <Phone className="mr-2 h-4 w-4" />
                Call
              </Button>
            </a>
            {business.services && business.services.length > 0 && (
              <Link href={session ? `/bookings/${business.slug}` : '/login'}>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
                >
                  <Calendar className="mr-2 h-4 w-4" />
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
