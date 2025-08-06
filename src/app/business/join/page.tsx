'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Play,
  Shield,
  Smartphone,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
// import { useRouter } from 'next/navigation' // Commented out - may be used later
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function BusinessLandingPage() {
  // const router = useRouter() // Commented out - may be used later
  const [showDemo, setShowDemo] = useState(false)

  const features = [
    {
      icon: <Calendar className="h-6 w-6" />,
      title: 'Smart Scheduling',
      description:
        'Automated booking system that works 24/7. No more phone tag or double bookings.',
    },
    {
      icon: <DollarSign className="h-6 w-6" />,
      title: 'Integrated Payments',
      description: 'Get paid instantly with Stripe. Low fees, fast payouts, and no hidden charges.',
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Customer Management',
      description: 'Built-in CRM to track customers, preferences, and booking history.',
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Business Analytics',
      description: 'Real-time insights into revenue, popular services, and customer trends.',
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: 'Mobile First',
      description: 'Manage your business on the go. Works perfectly on all devices.',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Secure & Reliable',
      description: 'Bank-level security with 99.9% uptime. Your data is always protected.',
    },
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      business: 'Glow Beauty Salon',
      image: '/images/testimonial-1.jpg',
      quote:
        "Glamfric transformed my business. I've seen a 40% increase in bookings and my clients love the convenience.",
      rating: 5,
    },
    {
      name: 'Marcus Williams',
      business: 'Elite Cuts Barbershop',
      image: '/images/testimonial-2.jpg',
      quote:
        'The automated scheduling saves me hours every week. I can focus on what I do best - cutting hair.',
      rating: 5,
    },
    {
      name: 'Lisa Chen',
      business: 'Zen Spa & Wellness',
      image: '/images/testimonial-3.jpg',
      quote:
        'Professional, easy to use, and my customers keep coming back. Best decision for my business.',
      rating: 5,
    },
  ]

  const stats = [
    { value: '10,000+', label: 'Active Customers' },
    { value: '1,200+', label: 'Partner Businesses' },
    { value: '$2.4M+', label: 'Processed Monthly' },
    { value: '98%', label: 'Customer Satisfaction' },
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
        'Basic analytics',
      ],
      cta: 'Join Free',
      popular: false,
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
        'Customer reviews',
      ],
      cta: 'Get Started',
      popular: true,
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
        'Reduced commission rates',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 font-bold text-white">
                  G
                </div>
                <span className="font-display text-xl font-bold text-gray-900">Glamfric</span>
                <Badge variant="outline" className="ml-2">
                  For Business
                </Badge>
              </Link>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="hidden sm:inline-flex">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup/business">
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-sm hover:from-indigo-700 hover:to-purple-700 sm:text-base">
                  <span className="hidden sm:inline">Get Started Free</span>
                  <span className="sm:hidden">Get Started</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="bg-grid-gray-100 bg-grid-16 absolute inset-0 opacity-5"></div>

        {/* Animated background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="animate-blob absolute -top-40 -right-40 h-80 w-80 rounded-full bg-purple-200 opacity-70 mix-blend-multiply blur-xl filter"></div>
          <div className="animate-blob animation-delay-2000 absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-indigo-200 opacity-70 mix-blend-multiply blur-xl filter"></div>
          <div className="animate-blob animation-delay-4000 absolute top-40 left-1/2 h-80 w-80 rounded-full bg-pink-200 opacity-70 mix-blend-multiply blur-xl filter"></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-24 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <Badge className="border-indigo-200 bg-indigo-100 text-indigo-700">
                  Trusted by 1,200+ businesses
                </Badge>
                <h1 className="font-display text-3xl leading-tight font-bold text-gray-900 sm:text-5xl lg:text-6xl">
                  Your salon deserves
                  <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent sm:inline">
                    {' '}
                    better than pen & paper
                  </span>
                </h1>
                <p className="text-xl leading-relaxed text-gray-600">
                  Transform your beauty business with Africa&apos;s #1 booking platform. Get paid
                  faster, reduce no-shows by 40%, and give your clients the modern experience they
                  expect.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Link href="/signup/business">
                  <Button
                    size="lg"
                    className="transform bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transition-all hover:-translate-y-0.5 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 transition-all hover:scale-105 hover:bg-white"
                  onClick={() => setShowDemo(true)}
                >
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </div>

              <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-10 w-10 rounded-full border-2 border-white bg-gray-300"
                    />
                  ))}
                </div>
                <div className="text-center sm:text-left">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="mt-1 text-sm text-gray-600">Rated 4.9/5 by business owners</p>
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
                <div className="absolute inset-0 rotate-3 transform rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 opacity-20"></div>
                <Image
                  src="/images/business-dashboard-hero.png"
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
                  className="absolute -top-4 -right-4 rounded-lg bg-white p-4 shadow-lg"
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
                  className="absolute -bottom-4 -left-4 rounded-lg bg-white p-4 shadow-lg"
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
      <section className="border-y bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
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
                <p className="mt-1 text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <Badge className="mb-4 border-indigo-200 bg-indigo-100 text-indigo-700">
              Everything you need
            </Badge>
            <h2 className="font-display mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              Everything you need to run your beauty business
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-gray-600">
              From appointment scheduling to payment processing, we handle the tech so you can focus
              on your craft.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="group h-full border-gray-100 transition-all duration-300 hover:border-indigo-200 hover:shadow-xl">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white transition-transform group-hover:scale-110">
                      {feature.icon}
                    </div>
                    <h3 className="font-display mb-2 text-xl font-semibold text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="leading-relaxed text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <Badge className="mb-4 border-purple-200 bg-purple-100 text-purple-700">
              How we charge
            </Badge>
            <h2 className="font-display mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              Simple, transparent pricing that grows with you
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-gray-600">
              No monthly fees. We only make money when you do.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                step: '1',
                title: 'Free to Join',
                description:
                  'Sign up and list your business at no cost. Set up your profile, services, and availability for free.',
              },
              {
                step: '2',
                title: 'Pay Per Booking',
                description:
                  'We charge a small 5% commission only when clients book and pay through Glamfric. No bookings = no fees.',
              },
              {
                step: '3',
                title: 'Get Paid Instantly',
                description:
                  'Receive payments directly to your account within 24 hours. We handle all payment processing securely.',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="relative z-10 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-2xl font-bold text-white shadow-lg">
                    {item.step}
                  </div>
                  <h3 className="font-display mb-2 text-xl font-semibold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
                {index < 2 && (
                  <div className="absolute top-8 left-[50%] hidden h-[2px] w-[calc(100%+2rem)] md:block">
                    <div className="relative h-full w-full">
                      <div className="absolute inset-0 bg-gray-200"></div>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600"
                        initial={{ width: '0%' }}
                        whileInView={{ width: '100%' }}
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
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <Badge className="mb-4 border-green-200 bg-green-100 text-green-700">
              Success stories
            </Badge>
            <h2 className="font-display mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              Trusted by Africa&apos;s top beauty professionals
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="group h-full border-gray-100 transition-all duration-300 hover:shadow-xl">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-gray-700 italic">
                      &quot;{testimonial.quote}&quot;
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 font-bold text-white">
                        {testimonial.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
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
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <Badge className="mb-4 border-indigo-200 bg-indigo-100 text-indigo-700">
              Transparent pricing
            </Badge>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              Choose the perfect plan for your business
            </h2>
            <p className="text-xl text-gray-600">
              Start free, upgrade when you&apos;re ready. No hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
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
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                    <Badge className="border-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <Card className={`h-full ${plan.popular ? 'ring-2 ring-indigo-600' : ''}`}>
                  <CardContent className="p-8">
                    <h3 className="mb-2 text-2xl font-bold text-gray-900">{plan.name}</h3>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-600">{plan.period}</span>
                    </div>
                    <ul className="mb-8 space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <CheckCircle className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
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
      <section className="bg-gradient-to-r from-indigo-600 to-purple-700 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl">
            Ready to grow your beauty business?
          </h2>
          <p className="mb-8 text-xl text-white/90">
            Join 1,200+ businesses already earning more with Glamfric. Free to start, pay only when
            you earn.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/signup/business">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
                Join Free Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              Schedule Demo
            </Button>
          </div>
          <p className="mt-6 text-sm text-white/70">
            No monthly fees • 5% commission per booking • Get paid in 24 hours
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 text-gray-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center space-x-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 font-bold text-white">
                  G
                </div>
                <span className="font-display text-xl font-bold text-white">Glamfric</span>
              </div>
              <p className="text-sm">
                The all-in-one platform for beauty professionals to manage and grow their business.
              </p>
            </div>

            <div>
              <h3 className="mb-4 font-semibold text-white">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Integrations
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    API
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-semibold text-white">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-semibold text-white">Support</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Status
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 Glamfric. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      {showDemo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-gray-200 p-6">
              <h3 className="font-display text-2xl font-bold text-gray-900">
                See Glamfric in Action
              </h3>
              <button
                onClick={() => setShowDemo(false)}
                className="text-gray-400 transition-colors hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-8 text-center">
              <div className="mb-6 flex aspect-video items-center justify-center rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100">
                <div className="text-center">
                  <Play className="mx-auto mb-4 h-16 w-16 text-indigo-600" />
                  <p className="text-gray-600">Demo video coming soon!</p>
                  <p className="mt-2 text-sm text-gray-500">
                    In the meantime, book a personalized demo with our team
                  </p>
                </div>
              </div>
              <div className="flex justify-center gap-4">
                <Button onClick={() => setShowDemo(false)} variant="outline">
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
