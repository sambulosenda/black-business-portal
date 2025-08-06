'use client'

import { Session } from 'next-auth'
import Link from 'next/link'
import { Clock, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ReviewWithRelations, ServiceWithRelations } from '@/types'

interface ServicesSectionProps {
  services: ServiceWithRelations[]
  businessSlug: string
  session: Session | null
  reviews: ReviewWithRelations[]
}

export default function ServicesSection({
  services,
  businessSlug,
  session,
  reviews,
}: ServicesSectionProps) {
  // Get popular services based on mentions in reviews
  const servicePopularity = services
    .map((service) => {
      const mentions = reviews.filter((review) =>
        review.comment?.toLowerCase().includes(service.name.toLowerCase())
      ).length
      return { ...service, mentions }
    })
    .sort((a, b) => b.mentions - a.mentions)

  const popularServices = servicePopularity.slice(0, 3).filter((s) => s.mentions > 0)

  return (
    <section id="services">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Services</h2>
          <p className="mt-1 text-gray-600">Professional treatments by expert stylists</p>
        </div>
        {services.length > 6 && (
          <Button variant="outline" size="sm">
            View All ({services.length})
          </Button>
        )}
      </div>

      {popularServices.length > 0 && (
        <div className="mb-6 rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50 p-4">
          <div className="mb-2 flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text font-medium text-transparent">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            Most Popular Services
          </div>
          <div className="flex flex-wrap gap-2">
            {popularServices.map((service) => (
              <span
                key={service.id}
                className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-700"
              >
                {service.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {services.slice(0, 6).map((service) => (
          <div
            key={service.id}
            className="group rounded-xl border border-gray-200 bg-white p-6 transition-all duration-200 hover:border-purple-300 hover:shadow-lg"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-purple-600">
                  {service.name}
                </h3>
                {service.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-gray-600">{service.description}</p>
                )}
              </div>
              <div className="ml-4 text-right">
                <p className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent">
                  ${service.price.toFixed(0)}
                </p>
              </div>
            </div>

            <div className="mb-4 flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                {service.duration} min
              </span>
              {service.category && <span className="text-gray-400">•</span>}
              {service.category && <span>{service.category}</span>}
            </div>

            {session ? (
              <Link href={`/book/${businessSlug}?service=${service.id}`} className="block">
                <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white transition-all group-hover:shadow-lg hover:from-indigo-700 hover:to-purple-700">
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
        <div className="rounded-xl bg-gray-50 py-12 text-center">
          <p className="text-gray-500">No services available at this time</p>
        </div>
      )}
    </section>
  )
}
