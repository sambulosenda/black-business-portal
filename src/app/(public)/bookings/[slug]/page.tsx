'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { format, isBefore, setHours, setMinutes } from 'date-fns'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'
import { useIsMobile } from '@/components/hooks/use-mobile'
import { Breadcrumb, BreadcrumbWrapper } from '@/components/ui/breadcrumb'
import { FormFeedback, InlineValidation } from '@/components/ui/form-feedback'
import { ServiceLoadingSkeleton, TimeCheckLoader } from '@/components/ui/loading-states'
import { MobileProgressSteps, ProgressSteps } from '@/components/ui/progress-steps'
import { SuccessAnimation } from '@/components/ui/success-animation'
import { MobileTimeSlotSelector, TimeSlotSelector } from '@/components/ui/time-slot-selector'
import type { PromotionWithRelations } from '@/types'

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
  const isMobile = useIsMobile()

  const [slug, setSlug] = useState<string>('')
  const [business, setBusiness] = useState<Business | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<string>(serviceId || '')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [servicesLoading, setServicesLoading] = useState(false)
  const [timeSlotsLoading, setTimeSlotsLoading] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [error, setError] = useState('')
  const [timeOffDates, setTimeOffDates] = useState<Date[]>([])
  const [promoCode, setPromoCode] = useState('')
  const [promoDiscount, setPromoDiscount] = useState<number>(0)
  const [promoValidating, setPromoValidating] = useState(false)
  const [promoError, setPromoError] = useState('')
  const [appliedPromotion, setAppliedPromotion] = useState<PromotionWithRelations | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [formTouched, setFormTouched] = useState({
    service: false,
    date: false,
    time: false,
  })

  // Calculate current step for progress indicator
  const getCurrentStep = useCallback(() => {
    if (!selectedService) return 0
    if (!selectedDate) return 1
    if (!selectedTime) return 2
    return 3
  }, [selectedService, selectedDate, selectedTime])

  // Smooth scroll to section when step changes
  useEffect(() => {
    const step = getCurrentStep()
    const sections = ['service-section', 'date-section', 'time-section', 'summary-section']
    const targetSection = sections[step]

    if (targetSection && step > 0) {
      setTimeout(() => {
        const element = document.getElementById(targetSection)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    }
  }, [selectedService, selectedDate, selectedTime, getCurrentStep])

  const bookingSteps = [
    { id: 'service', name: 'Select Service', description: 'Choose your treatment' },
    { id: 'date', name: 'Pick Date', description: 'Select appointment date' },
    { id: 'time', name: 'Choose Time', description: 'Pick available slot' },
    { id: 'confirm', name: 'Confirm', description: 'Review and book' },
  ]

  useEffect(() => {
    params.then((p) => setSlug(p.slug))
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
      setServicesLoading(true)
      const response = await fetch(`/api/bookingss/${slug}`)
      if (!response.ok) throw new Error('Failed to fetch business data')

      const data = await response.json()
      setBusiness(data.business)
      setServices(data.services)

      if (!selectedService && data.services.length > 0) {
        setSelectedService(serviceId || data.services[0].id)
      }

      // Fetch time off dates
      const timeOffResponse = await fetch(
        `/api/business/timeoff/dates?businessId=${data.business.id}`
      )
      if (timeOffResponse.ok) {
        const { dates } = await timeOffResponse.json()
        setTimeOffDates(dates.map((d: string) => new Date(d)))
      }
    } catch (error) {
      console.error('Error fetching business:', error)
      setError('Failed to load business information. Please try refreshing the page.')
    } finally {
      setLoading(false)
      setServicesLoading(false)
    }
  }

  const validatePromoCode = async () => {
    if (!promoCode || !business || !selectedService) return

    setPromoValidating(true)
    setPromoError('')

    try {
      const service = services.find((s) => s.id === selectedService)
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
          itemCount: 1,
        }),
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

    setTimeSlotsLoading(true)
    setError('')

    const service = services.find((s) => s.id === selectedService)
    if (!service) {
      setTimeSlotsLoading(false)
      return
    }

    const dayOfWeek = selectedDate.getDay()
    const availability = business.availabilities.find((a) => a.dayOfWeek === dayOfWeek)

    if (!availability) {
      setTimeSlots([])
      setTimeSlotsLoading(false)
      setError('No availability on this day. Please select another date.')
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
          available: true, // In a real app, check existing bookings
        })
      }

      currentTime = new Date(currentTime.getTime() + 30 * 60000) // 30-minute intervals
    }

    // Check availability against existing bookings and time off
    try {
      const response = await fetch(
        `/api/bookingss/availability?businessId=${business.id}&date=${format(selectedDate, 'yyyy-MM-dd')}&serviceId=${selectedService}`
      )
      if (response.ok) {
        const { bookedSlots, isClosedDay, reason } = await response.json()

        if (isClosedDay) {
          setTimeSlots([])
          setError(reason || 'Business is closed on this day. Please select another date.')
          setTimeSlotsLoading(false)
          return
        }

        slots.forEach((slot) => {
          slot.available = !bookedSlots.includes(slot.time)
        })
      }
    } catch (error) {
      console.error('Error checking availability:', error)
      setError('Unable to check availability. Please try again.')
    } finally {
      setTimeSlotsLoading(false)
    }

    setTimeSlots(slots)
  }

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !selectedService) {
      setError('Please complete all booking steps before confirming')
      return
    }

    setBookingLoading(true)
    setError('')

    try {
      const response = await fetch('/api/bookingss/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business?.id,
          serviceId: selectedService,
          date: format(selectedDate, 'yyyy-MM-dd'),
          time: selectedTime,
          promotionId: appliedPromotion?.id,
          promoDiscount: promoDiscount,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create booking')
      }

      const paymentData = await response.json()

      // Show success animation
      setShowSuccess(true)

      // Store payment data in sessionStorage for the payment page
      sessionStorage.setItem(
        'bookingPayment',
        JSON.stringify({
          ...paymentData,
          businessName: business?.businessName,
          serviceName: selectedServiceData?.name,
          date: selectedDate.toISOString(),
          time: selectedTime,
        })
      )

      // Delay navigation to show success animation
      setTimeout(() => {
        router.push(`/bookings/${slug}/payment`)
      }, 1500)
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Unable to create booking. Please try again.'
      )
    } finally {
      setBookingLoading(false)
    }
  }

  // Auto-save form data to localStorage
  useEffect(() => {
    if (business && selectedService) {
      const bookingData = {
        businessId: business.id,
        serviceId: selectedService,
        date: selectedDate?.toISOString(),
        time: selectedTime,
        promoCode,
      }
      localStorage.setItem(`booking_${business.id}`, JSON.stringify(bookingData))
    }
  }, [business, selectedService, selectedDate, selectedTime, promoCode])

  // Restore saved form data
  useEffect(() => {
    if (business) {
      const saved = localStorage.getItem(`booking_${business.id}`)
      if (saved) {
        try {
          const data = JSON.parse(saved)
          if (data.serviceId && services.find((s) => s.id === data.serviceId)) {
            setSelectedService(data.serviceId)
          }
          if (data.date) {
            setSelectedDate(new Date(data.date))
          }
          if (data.time) {
            setSelectedTime(data.time)
          }
          if (data.promoCode) {
            setPromoCode(data.promoCode)
          }
        } catch (e) {
          console.error('Error restoring booking data:', e)
        }
      }
    }
  }, [business, services])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!business) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Business not found</h2>
          <Link href="/" className="mt-4 inline-block text-indigo-600 hover:text-indigo-500">
            Return to home
          </Link>
        </div>
      </div>
    )
  }

  const selectedServiceData = services.find((s) => s.id === selectedService)
  const disabledDays = [0, 1, 2, 3, 4, 5, 6].filter(
    (day) => !business.availabilities.some((a) => a.dayOfWeek === day)
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
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
            { label: 'Book Appointment' },
          ]}
        />
      </BreadcrumbWrapper>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Book an Appointment</h1>
          <p className="mt-2 text-gray-600">at {business.businessName}</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          {isMobile ? (
            <MobileProgressSteps steps={bookingSteps} currentStep={getCurrentStep()} />
          ) : (
            <ProgressSteps steps={bookingSteps} currentStep={getCurrentStep()} />
          )}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {/* Service Selection */}
            <div id="service-section" className="mb-6 rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">Select a Service</h2>
              {servicesLoading ? (
                <ServiceLoadingSkeleton />
              ) : (
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
                        onChange={(e) => {
                          setSelectedService(e.target.value)
                          setFormTouched({ ...formTouched, service: true })
                          setSelectedTime('') // Reset time when service changes
                        }}
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
              )}
              {formTouched.service && selectedService && (
                <InlineValidation success="Service selected" touched={true} className="mt-3" />
              )}
            </div>

            {/* Date Selection */}
            <div id="date-section" className="mb-6 rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">Select a Date</h2>
              {!selectedService && (
                <FormFeedback
                  type="info"
                  message="Please select a service first to see available dates"
                  className="mb-4"
                />
              )}
              <div className="flex justify-center">
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date)
                    setFormTouched({ ...formTouched, date: true })
                    setSelectedTime('') // Reset time when date changes
                  }}
                  disabled={[
                    !selectedService,
                    { before: new Date() },
                    ...disabledDays.map((day) => ({ dayOfWeek: [day] })),
                    ...timeOffDates,
                  ]}
                  className="rdp-custom"
                  classNames={{
                    months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                    month: 'space-y-4',
                    caption: 'flex justify-center pt-1 relative items-center',
                    caption_label: 'text-sm font-medium',
                    nav: 'space-x-1 flex items-center',
                    nav_button: 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
                    nav_button_previous: 'absolute left-1',
                    nav_button_next: 'absolute right-1',
                    table: 'w-full border-collapse space-y-1',
                    head_row: 'flex',
                    head_cell: 'text-gray-500 rounded-md w-9 font-normal text-[0.8rem]',
                    row: 'flex w-full mt-2',
                    cell: 'text-center text-sm p-0 relative [&:has([aria-selected])]:bg-indigo-50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                    day: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded-md',
                    day_selected:
                      'bg-indigo-600 text-white hover:bg-indigo-600 hover:text-white focus:bg-indigo-600 focus:text-white',
                    day_today: 'bg-gray-100 text-gray-900',
                    day_outside: 'text-gray-400 opacity-50',
                    day_disabled: 'text-gray-400 opacity-50',
                    day_range_middle: 'aria-selected:bg-gray-100 aria-selected:text-gray-900',
                    day_hidden: 'invisible',
                  }}
                />
              </div>
              {formTouched.date && selectedDate && (
                <InlineValidation
                  success={`Date selected: ${format(selectedDate, 'MMMM d, yyyy')}`}
                  touched={true}
                  className="mt-3 text-center"
                />
              )}
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div id="time-section" className="rounded-lg bg-white p-6 shadow">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">Select a Time</h2>
                {timeSlotsLoading ? (
                  <TimeCheckLoader message="Loading available times..." />
                ) : timeSlots.length > 0 ? (
                  <>
                    {isMobile ? (
                      <MobileTimeSlotSelector
                        slots={timeSlots}
                        selectedTime={selectedTime}
                        onSelectTime={(time) => {
                          setSelectedTime(time)
                          setFormTouched({ ...formTouched, time: true })
                        }}
                        loading={timeSlotsLoading}
                      />
                    ) : (
                      <TimeSlotSelector
                        slots={timeSlots}
                        selectedTime={selectedTime}
                        onSelectTime={(time) => {
                          setSelectedTime(time)
                          setFormTouched({ ...formTouched, time: true })
                        }}
                        loading={timeSlotsLoading}
                      />
                    )}
                  </>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-gray-500">No available time slots for this date</p>
                    <p className="mt-2 text-sm text-gray-400">
                      Please try selecting a different date
                    </p>
                  </div>
                )}
                {formTouched.time && selectedTime && (
                  <InlineValidation
                    success={`Time selected: ${selectedTime}`}
                    touched={true}
                    className="mt-3"
                  />
                )}
              </div>
            )}
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div
              id="summary-section"
              className="sticky top-4 overflow-hidden rounded-lg bg-white shadow-lg"
            >
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                <h2 className="text-xl font-semibold text-white">Booking Summary</h2>
              </div>
              <div className="p-6">
                <dl className="space-y-4">
                  <div className="border-b border-gray-100 pb-4">
                    <dt className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Business
                    </dt>
                    <dd className="mt-1 text-base font-medium text-gray-900">
                      {business.businessName}
                    </dd>
                  </div>
                  {selectedServiceData && (
                    <>
                      <div className="-mx-3 rounded-lg bg-gray-50 p-3">
                        <dt className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                          Service
                        </dt>
                        <dd className="mt-1 text-base font-medium text-gray-900">
                          {selectedServiceData.name}
                        </dd>
                        <div className="mt-2 flex items-center text-sm text-gray-600">
                          <svg
                            className="mr-1 h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {selectedServiceData.duration} minutes
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                          Price
                        </dt>
                        <dd className="text-2xl font-bold text-gray-900">
                          ${selectedServiceData.price}
                        </dd>
                      </div>
                    </>
                  )}

                  {/* Promo Code Section */}
                  {selectedServiceData && (
                    <div className="border-t pt-4">
                      <label
                        htmlFor="promoCode"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Promo Code
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          id="promoCode"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          placeholder="Enter code"
                          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={validatePromoCode}
                          disabled={promoValidating || !promoCode}
                          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {promoValidating ? 'Validating...' : 'Apply'}
                        </button>
                      </div>
                      {promoError && <p className="mt-2 text-sm text-red-600">{promoError}</p>}
                      {appliedPromotion && (
                        <div className="mt-2 rounded-md bg-green-50 p-2">
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
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Subtotal</span>
                          <span className="text-gray-900">${selectedServiceData.price}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Discount</span>
                          <span className="font-medium text-green-600">
                            -${promoDiscount.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-gray-200 pt-2 text-lg font-bold">
                          <span>Total</span>
                          <span className="text-indigo-600">
                            ${(parseFloat(selectedServiceData.price) - promoDiscount).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  {(selectedDate || selectedTime) && (
                    <div className="-mx-3 rounded-lg bg-indigo-50 p-3">
                      {selectedDate && (
                        <div className="mb-2">
                          <dt className="text-xs font-medium tracking-wider text-indigo-700 uppercase">
                            Date
                          </dt>
                          <dd className="mt-1 flex items-center text-base font-medium text-gray-900">
                            <svg
                              className="mr-2 h-4 w-4 text-indigo-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                          </dd>
                        </div>
                      )}
                      {selectedTime && (
                        <div>
                          <dt className="text-xs font-medium tracking-wider text-indigo-700 uppercase">
                            Time
                          </dt>
                          <dd className="mt-1 flex items-center text-base font-medium text-gray-900">
                            <svg
                              className="mr-2 h-4 w-4 text-indigo-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {selectedTime}
                          </dd>
                        </div>
                      )}
                    </div>
                  )}
                </dl>

                {error && <FormFeedback type="error" message={error} className="mt-4" />}

                <button
                  onClick={handleBooking}
                  disabled={!selectedDate || !selectedTime || !selectedService || bookingLoading}
                  className="mt-6 w-full transform rounded-md bg-indigo-600 px-4 py-3 font-medium text-white transition-all duration-200 hover:scale-105 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                >
                  {bookingLoading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating booking...
                    </span>
                  ) : (
                    'Confirm Booking'
                  )}
                </button>

                <p className="mt-6 text-center text-xs text-gray-500">
                  By booking, you agree to our terms and conditions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Animation */}
      <SuccessAnimation
        show={showSuccess}
        message="Booking Created!"
        subMessage="Redirecting to payment..."
      />
    </div>
  )
}
