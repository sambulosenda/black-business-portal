'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Availability, TimeOff } from '@prisma/client'
import { format } from 'date-fns'

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
]

const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2)
  const minute = i % 2 === 0 ? '00' : '30'
  const time = `${hour.toString().padStart(2, '0')}:${minute}`
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  const ampm = hour < 12 ? 'AM' : 'PM'
  return {
    value: time,
    label: `${displayHour}:${minute} ${ampm}`
  }
})

interface AvailabilityFormProps {
  businessId: string
  availabilities: Availability[]
  timeOffs: TimeOff[]
}

export default function AvailabilityForm({
  businessId,
  availabilities,
  timeOffs
}: AvailabilityFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'hours' | 'timeoff'>('hours')
  const [businessHours, setBusinessHours] = useState(() => {
    const hours: Record<number, { isActive: boolean; startTime: string; endTime: string }> = {}
    
    // Initialize with existing data or defaults
    DAYS_OF_WEEK.forEach(day => {
      const existing = availabilities.find(a => a.dayOfWeek === day.value)
      hours[day.value] = {
        isActive: existing?.isActive ?? (day.value >= 1 && day.value <= 5), // Mon-Fri default
        startTime: existing?.startTime ?? '09:00',
        endTime: existing?.endTime ?? '18:00'
      }
    })
    
    return hours
  })

  const [newTimeOff, setNewTimeOff] = useState({
    date: '',
    allDay: true,
    startTime: '09:00',
    endTime: '18:00',
    reason: ''
  })

  const handleSaveHours = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/business/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          availabilities: Object.entries(businessHours).map(([day, hours]) => ({
            dayOfWeek: parseInt(day),
            ...hours
          }))
        })
      })

      if (!response.ok) throw new Error('Failed to update availability')
      
      router.refresh()
    } catch (error) {
      console.error('Error saving availability:', error)
      alert('Failed to save availability settings')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTimeOff = async () => {
    if (!newTimeOff.date) {
      alert('Please select a date')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/business/timeoff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          date: newTimeOff.date,
          startTime: newTimeOff.allDay ? null : newTimeOff.startTime,
          endTime: newTimeOff.allDay ? null : newTimeOff.endTime,
          reason: newTimeOff.reason || null
        })
      })

      if (!response.ok) throw new Error('Failed to add time off')
      
      setNewTimeOff({
        date: '',
        allDay: true,
        startTime: '09:00',
        endTime: '18:00',
        reason: ''
      })
      router.refresh()
    } catch (error) {
      console.error('Error adding time off:', error)
      alert('Failed to add time off')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTimeOff = async (id: string) => {
    if (!confirm('Are you sure you want to delete this time off?')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/business/timeoff?id=${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete time off')
      
      router.refresh()
    } catch (error) {
      console.error('Error deleting time off:', error)
      alert('Failed to delete time off')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex">
          <button
            onClick={() => setSelectedTab('hours')}
            className={`py-4 px-6 text-sm font-medium ${
              selectedTab === 'hours'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Business Hours
          </button>
          <button
            onClick={() => setSelectedTab('timeoff')}
            className={`py-4 px-6 text-sm font-medium ${
              selectedTab === 'timeoff'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Time Off
          </button>
        </nav>
      </div>

      <div className="p-6">
        {selectedTab === 'hours' ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Set your regular business hours. Customers will only be able to book appointments during these times.
            </p>
            
            {DAYS_OF_WEEK.map(day => (
              <div key={day.value} className="flex items-center space-x-4">
                <div className="w-32">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={businessHours[day.value].isActive}
                      onChange={(e) => setBusinessHours(prev => ({
                        ...prev,
                        [day.value]: { ...prev[day.value], isActive: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      {day.label}
                    </span>
                  </label>
                </div>
                
                {businessHours[day.value].isActive && (
                  <>
                    <select
                      value={businessHours[day.value].startTime}
                      onChange={(e) => setBusinessHours(prev => ({
                        ...prev,
                        [day.value]: { ...prev[day.value], startTime: e.target.value }
                      }))}
                      className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      {TIME_SLOTS.map(slot => (
                        <option key={slot.value} value={slot.value}>
                          {slot.label}
                        </option>
                      ))}
                    </select>
                    
                    <span className="text-gray-500">to</span>
                    
                    <select
                      value={businessHours[day.value].endTime}
                      onChange={(e) => setBusinessHours(prev => ({
                        ...prev,
                        [day.value]: { ...prev[day.value], endTime: e.target.value }
                      }))}
                      className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      {TIME_SLOTS.map(slot => (
                        <option key={slot.value} value={slot.value}>
                          {slot.label}
                        </option>
                      ))}
                    </select>
                  </>
                )}
              </div>
            ))}
            
            <div className="pt-4">
              <button
                onClick={handleSaveHours}
                disabled={loading}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Business Hours'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Add Time Off Form */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Add Time Off</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newTimeOff.date}
                    onChange={(e) => setNewTimeOff(prev => ({ ...prev, date: e.target.value }))}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newTimeOff.allDay}
                      onChange={(e) => setNewTimeOff(prev => ({ ...prev, allDay: e.target.checked }))}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">All day</span>
                  </label>
                </div>
                
                {!newTimeOff.allDay && (
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Start Time
                      </label>
                      <select
                        value={newTimeOff.startTime}
                        onChange={(e) => setNewTimeOff(prev => ({ ...prev, startTime: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        {TIME_SLOTS.map(slot => (
                          <option key={slot.value} value={slot.value}>
                            {slot.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">
                        End Time
                      </label>
                      <select
                        value={newTimeOff.endTime}
                        onChange={(e) => setNewTimeOff(prev => ({ ...prev, endTime: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        {TIME_SLOTS.map(slot => (
                          <option key={slot.value} value={slot.value}>
                            {slot.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Reason (optional)
                  </label>
                  <input
                    type="text"
                    value={newTimeOff.reason}
                    onChange={(e) => setNewTimeOff(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="e.g., Holiday, Training, Personal"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                
                <button
                  onClick={handleAddTimeOff}
                  disabled={loading}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Time Off'}
                </button>
              </div>
            </div>
            
            {/* Time Off List */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">Scheduled Time Off</h3>
              
              {timeOffs.length > 0 ? (
                <div className="space-y-2">
                  {timeOffs.map((timeOff) => (
                    <div
                      key={timeOff.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {format(new Date(timeOff.date), 'EEEE, MMMM d, yyyy')}
                        </p>
                        <p className="text-sm text-gray-600">
                          {timeOff.startTime && timeOff.endTime
                            ? `${timeOff.startTime} - ${timeOff.endTime}`
                            : 'All day'}
                          {timeOff.reason && ` • ${timeOff.reason}`}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteTimeOff(timeOff.id)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No time off scheduled</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}