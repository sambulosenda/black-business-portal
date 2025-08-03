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
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-100 rounded w-full mb-2" />
                <div className="h-4 bg-gray-100 rounded w-1/3" />
              </div>
              <div className="h-6 bg-gray-200 rounded w-16 ml-4" />
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
      <div className="w-full max-w-md mx-auto">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="text-center text-gray-400 text-sm">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-9 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    </div>
  )
}

export function TimeSlotSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-10 bg-gray-100 rounded-md" />
        ))}
      </div>
    </div>
  )
}

interface AvailabilityLoaderProps {
  message?: string
}

export function AvailabilityLoader({ message = "Checking availability..." }: AvailabilityLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative">
        <Calendar className="w-12 h-12 text-gray-300" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      </div>
      <p className="mt-4 text-sm text-gray-600 animate-pulse">{message}</p>
    </div>
  )
}

interface TimeCheckLoaderProps {
  message?: string
}

export function TimeCheckLoader({ message = "Loading available times..." }: TimeCheckLoaderProps) {
  return (
    <div className="flex items-center justify-center py-6">
      <Clock className="w-5 h-5 text-gray-400 mr-2" />
      <Loader2 className="w-4 h-4 text-indigo-600 animate-spin mr-2" />
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  )
}