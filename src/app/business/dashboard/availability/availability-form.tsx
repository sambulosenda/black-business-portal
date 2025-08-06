'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Calendar, CheckCircle, Clock, Loader2, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Availability, TimeOff } from '@prisma/client'

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
    label: `${displayHour}:${minute} ${ampm}`,
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
  timeOffs,
}: AvailabilityFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [businessHours, setBusinessHours] = useState(() => {
    const hours: Record<number, { isActive: boolean; startTime: string; endTime: string }> = {}

    // Initialize with existing data or defaults
    DAYS_OF_WEEK.forEach((day) => {
      const existing = availabilities.find((a) => a.dayOfWeek === day.value)
      hours[day.value] = {
        isActive: existing?.isActive ?? (day.value >= 1 && day.value <= 5), // Mon-Fri default
        startTime: existing?.startTime ?? '09:00',
        endTime: existing?.endTime ?? '18:00',
      }
    })

    return hours
  })

  const [newTimeOff, setNewTimeOff] = useState({
    date: '',
    allDay: true,
    startTime: '09:00',
    endTime: '18:00',
    reason: '',
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
            ...hours,
          })),
        }),
      })

      if (!response.ok) throw new Error('Failed to update availability')

      toast.success('Business hours updated successfully')
      router.refresh()
    } catch (error) {
      console.error('Error saving availability:', error)
      toast.error('Failed to save availability settings')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTimeOff = async () => {
    if (!newTimeOff.date) {
      toast.error('Please select a date')
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
          reason: newTimeOff.reason || null,
        }),
      })

      if (!response.ok) throw new Error('Failed to add time off')

      setNewTimeOff({
        date: '',
        allDay: true,
        startTime: '09:00',
        endTime: '18:00',
        reason: '',
      })
      toast.success('Time off added successfully')
      router.refresh()
    } catch (error) {
      console.error('Error adding time off:', error)
      toast.error('Failed to add time off')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTimeOff = async (id: string) => {
    if (!confirm('Are you sure you want to delete this time off?')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/business/timeoff?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete time off')

      toast.success('Time off deleted successfully')
      router.refresh()
    } catch (error) {
      console.error('Error deleting time off:', error)
      toast.error('Failed to delete time off')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="hours">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100">
          <TabsTrigger
            value="hours"
            className="data-[state=active]:bg-white data-[state=active]:text-indigo-600"
          >
            <Clock className="mr-2 h-4 w-4" />
            Business Hours
          </TabsTrigger>
          <TabsTrigger
            value="timeoff"
            className="data-[state=active]:bg-white data-[state=active]:text-indigo-600"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Time Off
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hours" className="mt-6 space-y-4">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Business Hours</CardTitle>
              <CardDescription className="text-gray-600">
                Set your regular business hours. Customers will only be able to book appointments
                during these times.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {DAYS_OF_WEEK.map((day) => (
                    <Card
                      key={day.value}
                      className={`border ${businessHours[day.value].isActive ? 'border-gray-200' : 'border-gray-100 bg-gray-50/50'}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={businessHours[day.value].isActive}
                              onCheckedChange={(checked) =>
                                setBusinessHours((prev) => ({
                                  ...prev,
                                  [day.value]: { ...prev[day.value], isActive: checked },
                                }))
                              }
                              className="data-[state=checked]:bg-indigo-600"
                            />
                            <Label
                              className={`font-semibold ${businessHours[day.value].isActive ? 'text-gray-900' : 'text-gray-500'}`}
                            >
                              {day.label}
                            </Label>
                          </div>

                          {businessHours[day.value].isActive ? (
                            <div className="flex items-center gap-3">
                              <Select
                                value={businessHours[day.value].startTime}
                                onValueChange={(value) =>
                                  setBusinessHours((prev) => ({
                                    ...prev,
                                    [day.value]: { ...prev[day.value], startTime: value },
                                  }))
                                }
                              >
                                <SelectTrigger className="w-32 border-gray-300">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {TIME_SLOTS.map((slot) => (
                                    <SelectItem key={slot.value} value={slot.value}>
                                      {slot.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              <span className="text-gray-500">to</span>

                              <Select
                                value={businessHours[day.value].endTime}
                                onValueChange={(value) =>
                                  setBusinessHours((prev) => ({
                                    ...prev,
                                    [day.value]: { ...prev[day.value], endTime: value },
                                  }))
                                }
                              >
                                <SelectTrigger className="w-32 border-gray-300">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {TIME_SLOTS.map((slot) => (
                                    <SelectItem key={slot.value} value={slot.value}>
                                      {slot.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          ) : (
                            <Badge variant="outline" className="border-gray-300 text-gray-500">
                              Closed
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>

              <Separator className="my-6" />

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveHours}
                  disabled={loading}
                  className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Save Business Hours
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="timeoff" className="mt-6 space-y-6">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Add Time Off</CardTitle>
              <CardDescription className="text-gray-600">
                Block dates when you&apos;re not available for bookings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date" className="text-gray-900">
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={newTimeOff.date}
                    onChange={(e) => setNewTimeOff((prev) => ({ ...prev, date: e.target.value }))}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="border-gray-300"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="allDay"
                    checked={newTimeOff.allDay}
                    onCheckedChange={(checked) =>
                      setNewTimeOff((prev) => ({ ...prev, allDay: checked }))
                    }
                    className="data-[state=checked]:bg-indigo-600"
                  />
                  <Label htmlFor="allDay" className="text-gray-700">
                    All day
                  </Label>
                </div>

                {!newTimeOff.allDay && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="startTime" className="text-gray-900">
                        Start Time
                      </Label>
                      <Select
                        value={newTimeOff.startTime}
                        onValueChange={(value) =>
                          setNewTimeOff((prev) => ({ ...prev, startTime: value }))
                        }
                      >
                        <SelectTrigger id="startTime" className="border-gray-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_SLOTS.map((slot) => (
                            <SelectItem key={slot.value} value={slot.value}>
                              {slot.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="endTime" className="text-gray-900">
                        End Time
                      </Label>
                      <Select
                        value={newTimeOff.endTime}
                        onValueChange={(value) =>
                          setNewTimeOff((prev) => ({ ...prev, endTime: value }))
                        }
                      >
                        <SelectTrigger id="endTime" className="border-gray-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_SLOTS.map((slot) => (
                            <SelectItem key={slot.value} value={slot.value}>
                              {slot.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="reason" className="text-gray-900">
                    Reason (optional)
                  </Label>
                  <Input
                    id="reason"
                    type="text"
                    value={newTimeOff.reason}
                    onChange={(e) => setNewTimeOff((prev) => ({ ...prev, reason: e.target.value }))}
                    placeholder="e.g., Holiday, Training, Personal"
                    className="border-gray-300"
                  />
                </div>

                <Button
                  onClick={handleAddTimeOff}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Time Off
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Scheduled Time Off</CardTitle>
              <CardDescription className="text-gray-600">
                Manage your upcoming time off and holidays
              </CardDescription>
            </CardHeader>
            <CardContent>
              {timeOffs.length > 0 ? (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {timeOffs.map((timeOff) => (
                      <div
                        key={timeOff.id}
                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-red-50 to-red-100">
                            <Calendar className="h-5 w-5 text-red-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {format(new Date(timeOff.date), 'EEEE, MMMM d, yyyy')}
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              <Badge variant="outline" className="border-gray-300 text-xs">
                                {timeOff.startTime && timeOff.endTime
                                  ? `${timeOff.startTime} - ${timeOff.endTime}`
                                  : 'All day'}
                              </Badge>
                              {timeOff.reason && (
                                <span className="text-sm text-gray-600">{timeOff.reason}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTimeOff(timeOff.id)}
                          disabled={loading}
                          className="hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="py-12 text-center">
                  <Calendar className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                  <p className="text-gray-600">No time off scheduled</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Add time off above to block booking availability
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
