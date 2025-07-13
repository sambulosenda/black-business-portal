'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Phone, Calendar, MapPin, ShoppingCart } from 'lucide-react'
import { Session } from 'next-auth'
import { useCart } from '@/contexts/cart-context'

interface FloatingActionsProps {
  business: {
    slug: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  }
  session: Session | null
}

export default function FloatingActions({ business, session }: FloatingActionsProps) {
  const [isVisible, setIsVisible] = useState(false)
  const { items } = useCart()
  const cartItemsCount = items.reduce((acc, item) => acc + item.quantity, 0)
  
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
        {business.services.length > 0 && (
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
        {cartItemsCount > 0 && (
          <Link href="/cart" className="flex-shrink-0">
            <Button variant="outline" size="lg" className="px-4 relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-2 -right-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center shadow-md">
                {cartItemsCount}
              </span>
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}