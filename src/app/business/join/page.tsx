'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
// import { useRouter } from 'next/navigation' // Commented out - may be used later
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, TrendingUp, Calendar, Users, DollarSign, Star, Clock, Shield, Smartphone, BarChart3, ArrowRight, Play } from 'lucide-react'
import { motion } from 'framer-motion'

export default function BusinessLandingPage() {
  // const router = useRouter() // Commented out - may be used later
  const [showDemo, setShowDemo] = useState(false)

  const features = [
    {
      icon: <Calendar className="h-6 w-6" />,
      title: 'Smart Scheduling',
      description: 'Automated booking system that works 24/7. No more phone tag or double bookings.'
    },
    {
      icon: <DollarSign className="h-6 w-6" />,
      title: 'Integrated Payments',
      description: 'Get paid instantly with Stripe. Low fees, fast payouts, and no hidden charges.'
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Customer Management',
      description: 'Built-in CRM to track customers, preferences, and booking history.'
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Business Analytics',
      description: 'Real-time insights into revenue, popular services, and customer trends.'
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: 'Mobile First',
      description: 'Manage your business on the go. Works perfectly on all devices.'
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Secure & Reliable',
      description: 'Bank-level security with 99.9% uptime. Your data is always protected.'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      business: 'Glow Beauty Salon',
      image: '/images/testimonial-1.jpg',
      quote: 'Glamfric transformed my business. I\'ve seen a 40% increase in bookings and my clients love the convenience.',
      rating: 5
    },
    {
      name: 'Marcus Williams',
      business: 'Elite Cuts Barbershop',
      image: '/images/testimonial-2.jpg',
      quote: 'The automated scheduling saves me hours every week. I can focus on what I do best - cutting hair.',
      rating: 5
    },
    {
      name: 'Lisa Chen',
      business: 'Zen Spa & Wellness',
      image: '/images/testimonial-3.jpg',
      quote: 'Professional, easy to use, and my customers keep coming back. Best decision for my business.',
      rating: 5
    }
  ]

  const stats = [
    { value: '10,000+', label: 'Active Customers' },
    { value: '1,200+', label: 'Partner Businesses' },
    { value: '$2.4M+', label: 'Processed Monthly' },
    { value: '98%', label: 'Customer Satisfaction' }
  ]

  const pricingPlans = [
    {
      name: 'Free Forever',
      price: '0%',
      period: 'commission',
      features: [
        'List your business for free',
        'Manage your profile',
        'Set services & pricing',
        'Calendar availability',
        'Client messaging',
        'Basic analytics'
      ],
      cta: 'Join Free',
      popular: false
    },
    {
      name: 'Pay As You Earn',
      price: '5%',
      period: 'per booking',
      features: [
        'Everything in Free',
        'Accept online payments',
        'Automated reminders',
        'Advanced analytics',
        'Priority support',
        'Marketing tools',
        'Customer reviews'
      ],
      cta: 'Get Started',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      features: [
        'Everything in Pay As You Earn',
        'Multiple locations',
        'Team management',
        'API access',
        'Dedicated support',
        'Custom integrations',
        'Reduced commission rates'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                  G
                </div>
                <span className="text-xl font-bold font-display text-gray-900">Glamfric</span>
                <Badge variant="outline" className="ml-2">For Business</Badge>
              </Link>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="hidden sm:inline-flex">Sign In</Button>
              </Link>
              <Link href="/signup/business">
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-sm sm:text-base">
                  <span className="hidden sm:inline">Get Started Free</span>
                  <span className="sm:hidden">Get Started</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden">
        <div className="absolute inset-0 bg-grid-gray-100 bg-grid-16 opacity-5"></div>
        
        {/* Animated background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">
                  Trusted by 1,200+ businesses
                </Badge>
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-display text-gray-900 leading-tight">
                  Your salon deserves
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent block sm:inline"> better than pen & paper</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Transform your beauty business with Africa's #1 booking platform. Get paid faster, reduce no-shows by 40%, and give your clients the modern experience they expect.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup/business">
                  <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 hover:bg-white hover:scale-105 transition-all"
                  onClick={() => setShowDemo(true)}
                >
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gray-300 border-2 border-white" />
                  ))}
                </div>
                <div className="text-center sm:text-left">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Rated 4.9/5 by business owners</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl transform rotate-3 opacity-20"></div>
                <Image
                  src="/images/business-dashboard.png"
                  alt="Glamfric Dashboard"
                  width={600}
                  height={400}
                  className="relative rounded-2xl shadow-2xl"
                />
                
                {/* Floating stats */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-4"
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">+40%</p>
                      <p className="text-sm text-gray-600">Revenue Growth</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7 }}
                  className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg p-4"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">5hrs</p>
                      <p className="text-sm text-gray-600">Saved Weekly</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16 border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-gray-600 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 mb-4">
              Everything you need
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-gray-900 mb-4">
              Everything you need to run your beauty business
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From appointment scheduling to payment processing, we handle the tech so you can focus on your craft.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-gray-100 hover:border-indigo-200 group">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold font-display text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-purple-100 text-purple-700 border-purple-200 mb-4">
              How we charge
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-gray-900 mb-4">
              Simple, transparent pricing that grows with you
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              No monthly fees. We only make money when you do.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Free to Join',
                description: 'Sign up and list your business at no cost. Set up your profile, services, and availability for free.'
              },
              {
                step: '2',
                title: 'Pay Per Booking',
                description: 'We charge a small 5% commission only when clients book and pay through Glamfric. No bookings = no fees.'
              },
              {
                step: '3',
                title: 'Get Paid Instantly',
                description: 'Receive payments directly to your account within 24 hours. We handle all payment processing securely.'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="text-center relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold font-display text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-[50%] w-[calc(100%+2rem)] h-[2px]">
                    <div className="relative w-full h-full">
                      <div className="absolute inset-0 bg-gray-200"></div>
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600"
                        initial={{ width: "0%" }}
                        whileInView={{ width: "100%" }}
                        transition={{ delay: 0.5 + index * 0.2, duration: 0.8 }}
                        viewport={{ once: true }}
                      ></motion.div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-green-100 text-green-700 border-green-200 mb-4">
              Success stories
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-gray-900 mb-4">
              Trusted by Africa's top beauty professionals
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-gray-100 group">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-6 italic leading-relaxed">&quot;{testimonial.quote}&quot;</p>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{testimonial.name}</p>
                        <p className="text-sm text-gray-600">{testimonial.business}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 mb-4">
              Transparent pricing
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Choose the perfect plan for your business
            </h2>
            <p className="text-xl text-gray-600">
              Start free, upgrade when you&apos;re ready. No hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className={plan.popular ? 'relative' : ''}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <Card className={`h-full ${plan.popular ? 'ring-2 ring-indigo-600' : ''}`}>
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-600">{plan.period}</span>
                    </div>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href="/signup/business" className="block">
                      <Button 
                        className={`w-full ${
                          plan.popular 
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' 
                            : ''
                        }`}
                        variant={plan.popular ? 'default' : 'outline'}
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to grow your beauty business?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join 1,200+ businesses already earning more with Glamfric. Free to start, pay only when you earn.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup/business">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
                Join Free Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Schedule Demo
            </Button>
          </div>
          <p className="text-white/70 text-sm mt-6">
            No monthly fees • 5% commission per booking • Get paid in 24 hours
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                  G
                </div>
                <span className="text-xl font-bold font-display text-white">Glamfric</span>
              </div>
              <p className="text-sm">
                The all-in-one platform for beauty professionals to manage and grow their business.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white">Features</Link></li>
                <li><Link href="#" className="hover:text-white">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white">Integrations</Link></li>
                <li><Link href="#" className="hover:text-white">API</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white">About</Link></li>
                <li><Link href="#" className="hover:text-white">Blog</Link></li>
                <li><Link href="#" className="hover:text-white">Careers</Link></li>
                <li><Link href="#" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white">Status</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            <p>&copy; 2025 Glamfric. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      {showDemo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-2xl font-bold font-display text-gray-900">See Glamfric in Action</h3>
              <button 
                onClick={() => setShowDemo(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-8 text-center">
              <div className="aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-center">
                  <Play className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
                  <p className="text-gray-600">Demo video coming soon!</p>
                  <p className="text-sm text-gray-500 mt-2">In the meantime, book a personalized demo with our team</p>
                </div>
              </div>
              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={() => setShowDemo(false)}
                  variant="outline"
                >
                  Close
                </Button>
                <Link href="/signup/business">
                  <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                    Join Free Today
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}