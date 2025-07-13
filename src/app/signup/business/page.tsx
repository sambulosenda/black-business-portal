'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const businessSignupSchema = z.object({
  // Personal info
  ownerName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  
  // Business info
  businessName: z.string().min(2, 'Business name is required'),
  category: z.string().min(1, 'Please select a category'),
  businessPhone: z.string().min(10, 'Valid phone number required'),
  businessEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  
  // Address
  address: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'Valid ZIP code required'),
  
  // Optional
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  instagram: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type BusinessSignupFormData = z.infer<typeof businessSignupSchema>

const businessCategories = [
  { value: 'HAIR_SALON', label: 'Hair Salon' },
  { value: 'BARBER_SHOP', label: 'Barber Shop' },
  { value: 'NAIL_SALON', label: 'Nail Salon' },
  { value: 'SPA', label: 'Spa' },
  { value: 'MASSAGE', label: 'Massage Therapy' },
  { value: 'MAKEUP', label: 'Makeup Artist' },
  { value: 'SKINCARE', label: 'Skincare' },
  { value: 'WELLNESS', label: 'Wellness Center' },
  { value: 'OTHER', label: 'Other' },
]

export default function BusinessSignupPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm<BusinessSignupFormData>({
    resolver: zodResolver(businessSignupSchema),
  })

  const nextStep = async () => {
    const fieldsToValidate = step === 1 
      ? ['ownerName', 'email', 'password', 'confirmPassword'] as const
      : ['businessName', 'category', 'businessPhone', 'address', 'city', 'state', 'zipCode'] as const

    const isValid = await trigger(fieldsToValidate)
    if (isValid) {
      setStep(2)
    }
  }

  const onSubmit = async (data: BusinessSignupFormData) => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/signup/business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Something went wrong')
      } else {
        // Redirect to verify email page
        router.push(`/auth/verify-email?email=${encodeURIComponent(data.email)}`)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-lg w-full space-y-8">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-xl transition-all">
                B
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                BeautyPortal
              </span>
            </Link>
            <h2 className="mt-8 text-3xl font-bold text-gray-900">
              List your business
            </h2>
            <p className="mt-2 text-gray-600">
              Join our network of beauty & wellness professionals
            </p>
            
            <div className="mt-6 flex justify-center">
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${step >= 1 ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg' : 'bg-gray-200 text-gray-600'}`}>
                  1
                </div>
                <div className={`w-20 h-1 transition-all ${step >= 2 ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-gray-200'}`} />
                <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${step >= 2 ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg' : 'bg-gray-200 text-gray-600'}`}>
                  2
                </div>
              </div>
            </div>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {step === 1 ? (
              <div className="space-y-5">
                <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                
                <div>
                  <Label htmlFor="ownerName" className="block text-sm font-medium text-gray-700">
                    Your full name
                  </Label>
                  <div className="mt-1">
                    <Input
                      {...register('ownerName')}
                      id="ownerName"
                      type="text"
                      autoComplete="name"
                      placeholder="John Doe"
                      className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    />
                    {errors.ownerName && (
                      <p className="mt-1 text-sm text-red-600">{errors.ownerName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Your email address
                  </Label>
                  <div className="mt-1">
                    <Input
                      {...register('email')}
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="john@example.com"
                      className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </Label>
                    <div className="mt-1">
                      <Input
                        {...register('password')}
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Min 6 characters"
                        className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      />
                      {errors.password && (
                        <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirm password
                    </Label>
                    <div className="mt-1">
                      <Input
                        {...register('confirmPassword')}
                        id="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Confirm password"
                        className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      />
                      {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={nextStep}
                  className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-lg hover:shadow-xl"
                >
                  Next: Business Information
                </Button>
              </div>
            ) : (
              <div className="space-y-5">
                <h3 className="text-lg font-medium text-gray-900">Business Information</h3>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                      Business name
                    </Label>
                    <div className="mt-1">
                      <Input
                        {...register('businessName')}
                        id="businessName"
                        type="text"
                        placeholder="Your Business Name"
                        className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      />
                      {errors.businessName && (
                        <p className="mt-1 text-sm text-red-600">{errors.businessName.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="category" className="block text-sm font-medium text-gray-700">
                      Business category
                    </Label>
                    <div className="mt-1">
                      <select
                        {...register('category')}
                        id="category"
                        className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      >
                        <option value="">Select a category</option>
                        {businessCategories.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                      {errors.category && (
                        <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="businessPhone" className="block text-sm font-medium text-gray-700">
                      Business phone
                    </Label>
                    <div className="mt-1">
                      <Input
                        {...register('businessPhone')}
                        id="businessPhone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      />
                      {errors.businessPhone && (
                        <p className="mt-1 text-sm text-red-600">{errors.businessPhone.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="businessEmail" className="block text-sm font-medium text-gray-700">
                      Business email (optional)
                    </Label>
                    <div className="mt-1">
                      <Input
                        {...register('businessEmail')}
                        id="businessEmail"
                        type="email"
                        placeholder="info@yourbusiness.com"
                        className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      />
                      {errors.businessEmail && (
                        <p className="mt-1 text-sm text-red-600">{errors.businessEmail.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Street address
                  </Label>
                  <div className="mt-1">
                    <Input
                      {...register('address')}
                      id="address"
                      type="text"
                      placeholder="123 Main Street"
                      className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div>
                    <Label htmlFor="city" className="block text-sm font-medium text-gray-700">
                      City
                    </Label>
                    <div className="mt-1">
                      <Input
                        {...register('city')}
                        id="city"
                        type="text"
                        placeholder="New York"
                        className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      />
                      {errors.city && (
                        <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="state" className="block text-sm font-medium text-gray-700">
                      State
                    </Label>
                    <div className="mt-1">
                      <Input
                        {...register('state')}
                        id="state"
                        type="text"
                        placeholder="NY"
                        className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      />
                      {errors.state && (
                        <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                      ZIP code
                    </Label>
                    <div className="mt-1">
                      <Input
                        {...register('zipCode')}
                        id="zipCode"
                        type="text"
                        placeholder="10001"
                        className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      />
                      {errors.zipCode && (
                        <p className="mt-1 text-sm text-red-600">{errors.zipCode.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="website" className="block text-sm font-medium text-gray-700">
                      Website (optional)
                    </Label>
                    <div className="mt-1">
                      <Input
                        {...register('website')}
                        id="website"
                        type="url"
                        placeholder="https://example.com"
                        className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      />
                      {errors.website && (
                        <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="instagram" className="block text-sm font-medium text-gray-700">
                      Instagram handle (optional)
                    </Label>
                    <div className="mt-1">
                      <Input
                        {...register('instagram')}
                        id="instagram"
                        type="text"
                        placeholder="@yourbusiness"
                        className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-800">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    isLoading={isLoading}
                    className="flex-1 flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-lg hover:shadow-xl"
                  >
                    {isLoading ? 'Creating account...' : 'Create business account'}
                  </Button>
                </div>
              </div>
            )}
          </form>

          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign in
              </Link>
            </p>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-600">
              Looking to book services?{' '}
              <Link href="/signup/customer" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign up as a customer
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Background */}
      <div className="hidden lg:block relative flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.1}}></div>
        </div>
        
        <div className="relative h-full flex items-center justify-center p-12">
          <div className="max-w-lg">
            <h1 className="text-5xl font-bold text-white mb-6">
              Grow your beauty business
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of successful beauty professionals who use BeautyPortal to manage their business and connect with new clients.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Easy Management</h3>
                  <p className="text-white/80">Manage appointments, staff, and services all in one place</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Reach New Clients</h3>
                  <p className="text-white/80">Get discovered by customers actively looking for your services</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Grow Revenue</h3>
                  <p className="text-white/80">Increase bookings and optimize your schedule for maximum profit</p>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-white mb-1">24/7</div>
                <div className="text-white/80 text-sm">Online Booking</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-white mb-1">0%</div>
                <div className="text-white/80 text-sm">Setup Fees</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}