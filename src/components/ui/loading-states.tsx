import React from 'react'
import { Calendar, Clock, Loader2 } from 'lucide-react'

export function ServiceLoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="block rounded-lg border border-gray-200 p-4">
            <div className="flex justify-between">
              <div className="flex-1">
                <div className="mb-2 h-5 w-3/4 rounded bg-gray-200" />
                <div className="mb-2 h-4 w-full rounded bg-gray-100" />
                <div className="h-4 w-1/3 rounded bg-gray-100" />
              </div>
              <div className="ml-4 h-6 w-16 rounded bg-gray-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function DatePickerSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-4 grid grid-cols-7 gap-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="text-center text-sm text-gray-400">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-9 rounded bg-gray-100" />
          ))}
        </div>
      </div>
    </div>
  )
}

export function TimeSlotSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-10 rounded-md bg-gray-100" />
        ))}
      </div>
    </div>
  )
}

interface AvailabilityLoaderProps {
  message?: string
}

export function AvailabilityLoader({
  message = 'Checking availability...',
}: AvailabilityLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative">
        <Calendar className="h-12 w-12 text-gray-300" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </div>
      <p className="mt-4 animate-pulse text-sm text-gray-600">{message}</p>
    </div>
  )
}

interface TimeCheckLoaderProps {
  message?: string
}

export function TimeCheckLoader({ message = 'Loading available times...' }: TimeCheckLoaderProps) {
  return (
    <div className="flex items-center justify-center py-6">
      <Clock className="mr-2 h-5 w-5 text-gray-400" />
      <Loader2 className="mr-2 h-4 w-4 animate-spin text-indigo-600" />
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  )
}
