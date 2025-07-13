'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DayPicker } from 'react-day-picker'
import { format, setHours, setMinutes, isBefore } from 'date-fns'
import Link from 'next/link'
import 'react-day-picker/style.css'
import { Breadcrumb, BreadcrumbWrapper } from '@/components/ui/breadcrumb'
import type { BusinessWithRelations, ServiceWithRelations, PromotionWithRelations } from '@/types'

interface Service {
  id: string
  name: string
  price: string
  duration: number
  description: string | null
}

interface Business {
  id: string
  businessName: string
  slug: string
  phone: string
  availabilities: {
    dayOfWeek: number
    startTime: string
    endTime: string
  }[]
}

interface TimeSlot {
  time: string
  available: boolean
}

export default function BookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const serviceId = searchParams.get('service')
  
  const [slug, setSlug] = useState<string>('')
  const [business, setBusiness] = useState<Business | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<string>(serviceId || '')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [error, setError] = useState('')
  const [timeOffDates, setTimeOffDates] = useState<Date[]>([])
  const [promoCode, setPromoCode] = useState('')
  const [promoDiscount, setPromoDiscount] = useState<number>(0)
  const [promoValidating, setPromoValidating] = useState(false)
  const [promoError, setPromoError] = useState('')
  const [appliedPromotion, setAppliedPromotion] = useState<PromotionWithRelations | null>(null)

  useEffect(() => {
    params.then(p => setSlug(p.slug))
  }, [params])

  useEffect(() => {
    if (slug) {
      fetchBusinessData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  useEffect(() => {
    if (selectedDate && selectedService && business) {
      generateTimeSlots()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, selectedService, business])

  const fetchBusinessData = async () => {
    try {
      const response = await fetch(`/api/booking/${slug}`)
      if (!response.ok) throw new Error('Failed to fetch business data')
      
      const data = await response.json()
      setBusiness(data.business)
      setServices(data.services)
      
      if (!selectedService && data.services.length > 0) {
        setSelectedService(serviceId || data.services[0].id)
      }
      
      // Fetch time off dates
      const timeOffResponse = await fetch(`/api/business/timeoff/dates?businessId=${data.business.id}`)
      if (timeOffResponse.ok) {
        const { dates } = await timeOffResponse.json()
        setTimeOffDates(dates.map((d: string) => new Date(d)))
      }
    } catch (error) {
      console.error('Error fetching business:', error)
      setError('Failed to load business information')
    } finally {
      setLoading(false)
    }
  }

  const validatePromoCode = async () => {
    if (!promoCode || !business || !selectedService) return

    setPromoValidating(true)
    setPromoError('')
    
    try {
      const service = services.find(s => s.id === selectedService)
      if (!service) return

      const response = await fetch('/api/promotions/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: promoCode,
          businessId: business.id,
          subtotal: parseFloat(service.price),
          serviceIds: [selectedService],
          productIds: [],
          itemCount: 1
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setPromoError(data.error || 'Invalid promo code')
        setPromoDiscount(0)
        setAppliedPromotion(null)
        return
      }

      setPromoDiscount(data.discount)
      setAppliedPromotion(data.promotion)
      setPromoError('')
    } catch (error) {
      console.error('Error validating promo code:', error)
      setPromoError('Failed to validate promo code')
      setPromoDiscount(0)
      setAppliedPromotion(null)
    } finally {
      setPromoValidating(false)
    }
  }

  const generateTimeSlots = async () => {
    if (!selectedDate || !business || !selectedService) return

    const service = services.find(s => s.id === selectedService)
    if (!service) return

    const dayOfWeek = selectedDate.getDay()
    const availability = business.availabilities.find(a => a.dayOfWeek === dayOfWeek)
    
    if (!availability) {
      setTimeSlots([])
      return
    }

    // Generate time slots based on business hours and service duration
    const slots: TimeSlot[] = []
    const [startHour, startMin] = availability.startTime.split(':').map(Number)
    const [endHour, endMin] = availability.endTime.split(':').map(Number)
    
    let currentTime = setMinutes(setHours(selectedDate, startHour), startMin)
    const endTime = setMinutes(setHours(selectedDate, endHour), endMin)
    const serviceDuration = service.duration

    while (isBefore(currentTime, endTime)) {
      const slotEndTime = new Date(currentTime.getTime() + serviceDuration * 60000)
      
      if (isBefore(slotEndTime, endTime) || slotEndTime.getTime() === endTime.getTime()) {
        slots.push({
          time: format(currentTime, 'HH:mm'),
          available: true // In a real app, check existing bookings
        })
      }
      
      currentTime = new Date(currentTime.getTime() + 30 * 60000) // 30-minute intervals
    }

    // Check availability against existing bookings and time off
    try {
      const response = await fetch(
        `/api/booking/availability?businessId=${business.id}&date=${format(selectedDate, 'yyyy-MM-dd')}&serviceId=${selectedService}`
      )
      if (response.ok) {
        const { bookedSlots, isClosedDay, reason } = await response.json()
        
        if (isClosedDay) {
          setTimeSlots([])
          setError(reason || 'Business is closed on this day')
          return
        }
        
        slots.forEach(slot => {
          slot.available = !bookedSlots.includes(slot.time)
        })
      }
    } catch (error) {
      console.error('Error checking availability:', error)
    }

    setTimeSlots(slots)
  }

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !selectedService) return

    setBookingLoading(true)
    setError('')

    try {
      const response = await fetch('/api/booking/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business?.id,
          serviceId: selectedService,
          date: format(selectedDate, 'yyyy-MM-dd'),
          time: selectedTime,
          promotionId: appliedPromotion?.id,
          promoDiscount: promoDiscount
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create booking')
      }

      const paymentData = await response.json()
      
      // Store payment data in sessionStorage for the payment page
      sessionStorage.setItem('bookingPayment', JSON.stringify({
        ...paymentData,
        businessName: business?.businessName,
        serviceName: selectedServiceData?.name,
        date: selectedDate.toISOString(),
        time: selectedTime,
      }))
      
      router.push(`/book/${slug}/payment`)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create booking')
    } finally {
      setBookingLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Business not found</h2>
          <Link href="/" className="mt-4 inline-block text-indigo-600 hover:text-indigo-500">
            Return to home
          </Link>
        </div>
      </div>
    )
  }

  const selectedServiceData = services.find(s => s.id === selectedService)
  const disabledDays = [0, 1, 2, 3, 4, 5, 6].filter(
    day => !business.availabilities.some(a => a.dayOfWeek === day)
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-indigo-600">
                BeautyPortal
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <BreadcrumbWrapper>
        <Breadcrumb 
          items={[
            { label: 'Home', href: '/' },
            { label: 'Search', href: '/search' },
            { label: business.businessName, href: `/business/${business.slug}` },
            { label: 'Book Appointment' }
          ]}
        />
      </BreadcrumbWrapper>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Book an Appointment</h1>
          <p className="mt-2 text-gray-600">at {business.businessName}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Service Selection */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select a Service</h2>
              <div className="space-y-3">
                {services.map((service) => (
                  <label
                    key={service.id}
                    className={`block cursor-pointer rounded-lg border p-4 hover:border-indigo-500 ${
                      selectedService === service.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="service"
                      value={service.id}
                      checked={selectedService === service.id}
                      onChange={(e) => setSelectedService(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{service.name}</p>
                        {service.description && (
                          <p className="mt-1 text-sm text-gray-600">{service.description}</p>
                        )}
                        <p className="mt-1 text-sm text-gray-500">
                          Duration: {service.duration} minutes
                        </p>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">${service.price}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Date Selection */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select a Date</h2>
              <div className="flex justify-center">
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={[
                    { before: new Date() },
                    ...disabledDays.map(day => ({ dayOfWeek: [day] })),
                    ...timeOffDates
                  ]}
                  className="rdp-custom"
                  classNames={{
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-4",
                    caption: "flex justify-center pt-1 relative items-center",
                    caption_label: "text-sm font-medium",
                    nav: "space-x-1 flex items-center",
                    nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell: "text-gray-500 rounded-md w-9 font-normal text-[0.8rem]",
                    row: "flex w-full mt-2",
                    cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-indigo-50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded-md",
                    day_selected: "bg-indigo-600 text-white hover:bg-indigo-600 hover:text-white focus:bg-indigo-600 focus:text-white",
                    day_today: "bg-gray-100 text-gray-900",
                    day_outside: "text-gray-400 opacity-50",
                    day_disabled: "text-gray-400 opacity-50",
                    day_range_middle: "aria-selected:bg-gray-100 aria-selected:text-gray-900",
                    day_hidden: "invisible",
                  }}
                />
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Select a Time</h2>
                {timeSlots.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => setSelectedTime(slot.time)}
                        disabled={!slot.available}
                        className={`py-2 px-3 rounded-md text-sm font-medium ${
                          selectedTime === slot.time
                            ? 'bg-indigo-600 text-white'
                            : slot.available
                            ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No available time slots for this date</p>
                )}
              </div>
            )}
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Summary</h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Business</dt>
                  <dd className="mt-1 text-sm text-gray-900">{business.businessName}</dd>
                </div>
                {selectedServiceData && (
                  <>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Service</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedServiceData.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Duration</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {selectedServiceData.duration} minutes
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Price</dt>
                      <dd className="mt-1 text-lg font-semibold text-gray-900">
                        ${selectedServiceData.price}
                      </dd>
                    </div>
                  </>
                )}
                
                {/* Promo Code Section */}
                {selectedServiceData && (
                  <div className="pt-4 border-t">
                    <label htmlFor="promoCode" className="block text-sm font-medium text-gray-700 mb-2">
                      Promo Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="promoCode"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="Enter code"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                      <button
                        type="button"
                        onClick={validatePromoCode}
                        disabled={promoValidating || !promoCode}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {promoValidating ? 'Validating...' : 'Apply'}
                      </button>
                    </div>
                    {promoError && (
                      <p className="mt-2 text-sm text-red-600">{promoError}</p>
                    )}
                    {appliedPromotion && (
                      <div className="mt-2 p-2 bg-green-50 rounded-md">
                        <p className="text-sm text-green-800">
                          {appliedPromotion.name} applied! 
                          <span className="font-medium"> -${promoDiscount.toFixed(2)}</span>
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Total with discount */}
                {selectedServiceData && promoDiscount > 0 && (
                  <div className="pt-4 border-t">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="text-gray-900">${selectedServiceData.price}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Discount</span>
                        <span className="text-green-600">-${promoDiscount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-base font-semibold pt-2 border-t">
                        <span>Total</span>
                        <span>${(parseFloat(selectedServiceData.price) - promoDiscount).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
                {selectedDate && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </dd>
                  </div>
                )}
                {selectedTime && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Time</dt>
                    <dd className="mt-1 text-sm text-gray-900">{selectedTime}</dd>
                  </div>
                )}
              </dl>

              {error && (
                <div className="mt-4 rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <button
                onClick={handleBooking}
                disabled={!selectedDate || !selectedTime || !selectedService || bookingLoading}
                className="mt-6 w-full bg-indigo-600 text-white py-2 px-4 rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bookingLoading ? 'Booking...' : 'Confirm Booking'}
              </button>

              <p className="mt-4 text-xs text-gray-500 text-center">
                By booking, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}