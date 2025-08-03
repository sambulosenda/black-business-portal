import React from 'react'
import { Clock } from 'lucide-react'

interface TimeSlot {
  time: string
  available: boolean
}

interface TimeSlotSelectorProps {
  slots: TimeSlot[]
  selectedTime: string
  onSelectTime: (time: string) => void
  loading?: boolean
  className?: string
}

export function TimeSlotSelector({ 
  slots, 
  selectedTime, 
  onSelectTime, 
  loading = false,
  className = '' 
}: TimeSlotSelectorProps) {
  // Group slots by morning, afternoon, evening
  const groupSlotsByPeriod = (slots: TimeSlot[]) => {
    const morning: TimeSlot[] = []
    const afternoon: TimeSlot[] = []
    const evening: TimeSlot[] = []

    slots.forEach(slot => {
      const hour = parseInt(slot.time.split(':')[0])
      if (hour < 12) {
        morning.push(slot)
      } else if (hour < 17) {
        afternoon.push(slot)
      } else {
        evening.push(slot)
      }
    })

    return { morning, afternoon, evening }
  }

  const { morning, afternoon, evening } = groupSlotsByPeriod(slots)

  const renderSlotGroup = (title: string, slots: TimeSlot[], icon: React.ReactNode) => {
    if (slots.length === 0) return null

    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <h3 className="text-sm font-medium text-gray-700">{title}</h3>
          <span className="text-xs text-gray-500">({slots.filter(s => s.available).length} available)</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {slots.map((slot) => (
            <button
              key={slot.time}
              onClick={() => onSelectTime(slot.time)}
              disabled={!slot.available || loading}
              className={`
                relative py-2 px-3 rounded-md text-sm font-medium transition-all duration-200
                ${selectedTime === slot.time
                  ? 'bg-indigo-600 text-white shadow-md transform scale-105'
                  : slot.available
                  ? 'bg-gray-50 text-gray-900 hover:bg-gray-100 hover:shadow-sm border border-gray-200'
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed line-through'
                }
                ${loading ? 'opacity-50' : ''}
              `}
            >
              {slot.time}
              {selectedTime === slot.time && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-600 rounded-full border-2 border-white" />
              )}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {renderSlotGroup(
        'Morning',
        morning,
        <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center">
          <div className="w-3 h-3 bg-yellow-400 rounded-full" />
        </div>
      )}
      {renderSlotGroup(
        'Afternoon',
        afternoon,
        <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
          <div className="w-3 h-3 bg-blue-400 rounded-full" />
        </div>
      )}
      {renderSlotGroup(
        'Evening',
        evening,
        <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
          <div className="w-3 h-3 bg-purple-400 rounded-full" />
        </div>
      )}
    </div>
  )
}

// Mobile-optimized time slot selector with horizontal scroll
export function MobileTimeSlotSelector({
  slots,
  selectedTime,
  onSelectTime,
  loading = false
}: TimeSlotSelectorProps) {
  const { morning, afternoon, evening } = groupSlotsByPeriod(slots)

  const renderMobileGroup = (title: string, slots: TimeSlot[]) => {
    if (slots.length === 0) return null

    return (
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2 px-4">{title}</h3>
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-2 px-4">
            {slots.map((slot) => (
              <button
                key={slot.time}
                onClick={() => onSelectTime(slot.time)}
                disabled={!slot.available || loading}
                className={`
                  flex-shrink-0 py-2 px-4 rounded-md text-sm font-medium transition-all
                  ${selectedTime === slot.time
                    ? 'bg-indigo-600 text-white shadow-md'
                    : slot.available
                    ? 'bg-white text-gray-900 border border-gray-300'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed line-through'
                  }
                `}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="sm:hidden -mx-4">
      {renderMobileGroup('Morning', morning)}
      {renderMobileGroup('Afternoon', afternoon)}
      {renderMobileGroup('Evening', evening)}
    </div>
  )
}

const groupSlotsByPeriod = (slots: TimeSlot[]) => {
  const morning: TimeSlot[] = []
  const afternoon: TimeSlot[] = []
  const evening: TimeSlot[] = []

  slots.forEach(slot => {
    const hour = parseInt(slot.time.split(':')[0])
    if (hour < 12) {
      morning.push(slot)
    } else if (hour < 17) {
      afternoon.push(slot)
    } else {
      evening.push(slot)
    }
  })

  return { morning, afternoon, evening }
}