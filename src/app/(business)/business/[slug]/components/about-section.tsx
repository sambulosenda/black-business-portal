'use client'

import { Clock, Globe, Instagram, Mail, MapPin, Phone } from 'lucide-react'
import type { BusinessWithRelations } from '@/types'

interface Availability {
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
}

interface AboutSectionProps {
  business: BusinessWithRelations
  availabilities: Availability[]
}

export default function AboutSection({ business, availabilities }: AboutSectionProps) {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  // Group consecutive days with same hours
  const groupedHours = availabilities.reduce(
    (acc: Array<{ startDay: number; endDay: number; hours: string }>, curr) => {
      const lastGroup = acc[acc.length - 1]
      const currentHours = `${curr.startTime} - ${curr.endTime}`

      if (
        lastGroup &&
        lastGroup.hours === currentHours &&
        lastGroup.endDay === curr.dayOfWeek - 1
      ) {
        lastGroup.endDay = curr.dayOfWeek
      } else {
        acc.push({
          startDay: curr.dayOfWeek,
          endDay: curr.dayOfWeek,
          hours: currentHours,
        })
      }
      return acc
    },
    []
  )

  return (
    <section id="about">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">Location & Hours</h2>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 transition-shadow duration-200 hover:shadow-lg">
          <h3 className="mb-4 flex items-center font-semibold text-gray-900">
            <Clock className="mr-2 h-5 w-5 text-purple-600" />
            Business Hours
          </h3>

          {groupedHours.length > 0 ? (
            <div className="space-y-2">
              {groupedHours.map((group, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {group.startDay === group.endDay
                      ? dayNames[group.startDay]
                      : `${dayNames[group.startDay]} - ${dayNames[group.endDay]}`}
                  </span>
                  <span className="font-medium text-gray-900">{group.hours}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Hours not specified</p>
          )}

          <div className="mt-6 border-t border-gray-100 pt-6">
            <h3 className="mb-4 flex items-center font-semibold text-gray-900">
              <MapPin className="mr-2 h-5 w-5 text-purple-600" />
              Contact Information
            </h3>

            <div className="space-y-3">
              <div>
                <p className="mb-1 text-sm text-gray-600">Address</p>
                <address className="text-gray-900 not-italic">
                  {business.address}
                  <br />
                  {business.city}, {business.state} {business.zipCode}
                </address>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(`${business.address}, ${business.city}, ${business.state} ${business.zipCode}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-sm text-transparent transition-all hover:from-indigo-700 hover:to-purple-700"
                >
                  Get Directions
                  <svg
                    className="ml-1 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <a
                  href={`tel:${business.phone}`}
                  className="text-gray-900 transition-colors hover:text-purple-600"
                >
                  {business.phone}
                </a>
              </div>

              {business.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <a
                    href={`mailto:${business.email}`}
                    className="text-gray-900 transition-colors hover:text-purple-600"
                  >
                    {business.email}
                  </a>
                </div>
              )}

              {business.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <a
                    href={business.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-900 transition-colors hover:text-purple-600"
                  >
                    Visit Website
                  </a>
                </div>
              )}

              {business.instagram && (
                <div className="flex items-center gap-2">
                  <Instagram className="h-4 w-4 text-gray-400" />
                  <a
                    href={`https://instagram.com/${business.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-900 transition-colors hover:text-purple-600"
                  >
                    @{business.instagram.replace('@', '')}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="relative h-[400px] overflow-hidden rounded-xl bg-gray-100">
          <iframe
            src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&q=${encodeURIComponent(`${business.address}, ${business.city}, ${business.state} ${business.zipCode}`)}`}
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Business Location"
          />
        </div>
      </div>
    </section>
  )
}
