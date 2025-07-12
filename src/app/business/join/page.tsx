'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, TrendingUp, Calendar, Users, DollarSign, Star, Clock, Shield, Smartphone, BarChart3, ArrowRight, Play } from 'lucide-react'
import { motion } from 'framer-motion'

export default function BusinessLandingPage() {
  const router = useRouter()
  const [videoPlaying, setVideoPlaying] = useState(false)

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
      quote: 'BeautyPortal transformed my business. I\'ve seen a 40% increase in bookings and my clients love the convenience.',
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
      name: 'Starter',
      price: 'Free',
      period: 'forever',
      features: [
        'Up to 50 bookings/month',
        'Basic scheduling',
        'Customer management',
        'Email notifications',
        'Mobile app access'
      ],
      cta: 'Start Free',
      popular: false
    },
    {
      name: 'Professional',
      price: '$29',
      period: '/month',
      features: [
        'Unlimited bookings',
        'Advanced scheduling',
        'Full CRM features',
        'SMS & Email reminders',
        'Analytics dashboard',
        'Priority support',
        'Custom branding'
      ],
      cta: 'Start 14-Day Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      features: [
        'Everything in Pro',
        'Multiple locations',
        'Team management',
        'API access',
        'Dedicated support',
        'Custom integrations'
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
                  B
                </div>
                <span className="text-xl font-bold text-gray-900">BeautyPortal</span>
                <Badge variant="secondary" className="ml-2">For Business</Badge>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup/business">
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden">
        <div className="absolute inset-0 bg-grid-gray-100 bg-grid-16 opacity-5"></div>
        
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
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Grow your beauty business with
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> smart booking</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Join thousands of salons, spas, and beauty professionals who use BeautyPortal to manage bookings, payments, and grow their business.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup/business">
                  <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => setVideoPlaying(true)}
                  className="border-2"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center gap-8">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gray-300 border-2 border-white" />
                  ))}
                </div>
                <div>
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
                  alt="BeautyPortal Dashboard"
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
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Built for modern beauty businesses
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
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
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
              Simple setup
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Get started in 3 easy steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Create Your Profile',
                description: 'Sign up and add your business details, services, and pricing in minutes.'
              },
              {
                step: '2',
                title: 'Customize Settings',
                description: 'Set your availability, booking rules, and payment preferences.'
              },
              {
                step: '3',
                title: 'Start Taking Bookings',
                description: 'Share your booking link and watch appointments roll in automatically.'
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
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gray-200">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 w-1/2"></div>
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
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Loved by beauty professionals
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
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-300 rounded-full" />
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
              Start free, upgrade when you're ready. No hidden fees.
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
            Ready to transform your beauty business?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join 1,200+ businesses already growing with BeautyPortal. Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup/business">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Schedule Demo
            </Button>
          </div>
          <p className="text-white/70 text-sm mt-6">
            No credit card required • Setup in 5 minutes • Cancel anytime
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
                  B
                </div>
                <span className="text-xl font-bold text-white">BeautyPortal</span>
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
            <p>&copy; 2025 BeautyPortal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}