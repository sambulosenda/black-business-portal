'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Clock, TrendingUp } from 'lucide-react'
import { Session } from 'next-auth'
import type { ServiceWithRelations, ReviewWithRelations } from '@/types'

interface ServicesSectionProps {
  services: ServiceWithRelations[]
  businessSlug: string
  session: Session | null
  reviews: ReviewWithRelations[]
}

export default function ServicesSection({ services, businessSlug, session, reviews }: ServicesSectionProps) {
  // Get popular services based on mentions in reviews
  const servicePopularity = services.map(service => {
    const mentions = reviews.filter(review => 
      review.comment?.toLowerCase().includes(service.name.toLowerCase())
    ).length
    return { ...service, mentions }
  }).sort((a, b) => b.mentions - a.mentions)
  
  const popularServices = servicePopularity.slice(0, 3).filter(s => s.mentions > 0)
  
  return (
    <section id="services">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Services</h2>
          <p className="text-gray-600 mt-1">Professional treatments by expert stylists</p>
        </div>
        {services.length > 6 && (
          <Button variant="outline" size="sm">
            View All ({services.length})
          </Button>
        )}
      </div>
      
      {popularServices.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-6 border border-indigo-100">
          <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-medium mb-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            Most Popular Services
          </div>
          <div className="flex flex-wrap gap-2">
            {popularServices.map(service => (
              <span key={service.id} className="bg-white px-3 py-1 rounded-full text-sm text-gray-700 border border-gray-200">
                {service.name}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.slice(0, 6).map((service) => (
          <div
            key={service.id}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:border-purple-300 hover:shadow-lg transition-all duration-200 group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                  {service.name}
                </h3>
                {service.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {service.description}
                  </p>
                )}
              </div>
              <div className="text-right ml-4">
                <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  ${service.price.toFixed(0)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {service.duration} min
              </span>
              {service.category && (
                <span className="text-gray-400">•</span>
              )}
              {service.category && (
                <span>{service.category}</span>
              )}
            </div>
            
            {session ? (
              <Link href={`/book/${businessSlug}?service=${service.id}`} className="block">
                <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white group-hover:shadow-lg transition-all">
                  Book Now
                </Button>
              </Link>
            ) : (
              <Link href="/login" className="block">
                <Button variant="outline" className="w-full">
                  Sign in to Book
                </Button>
              </Link>
            )}
          </div>
        ))}
      </div>
      
      {services.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-500">No services available at this time</p>
        </div>
      )}
    </section>
  )
}