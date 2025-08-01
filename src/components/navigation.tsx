'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CartButton } from '@/components/cart-button'
import { Session } from 'next-auth'
import { useState } from 'react'

interface NavigationProps {
  session: Session | null
}

export default function Navigation({ session }: NavigationProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActive = (path: string) => pathname === path

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold group-hover:shadow-lg transition-shadow">
                G
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Glamfric</span>
            </Link>
            
            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center ml-8 space-x-1">
              <Link href="/search">
                <Button 
                  variant="ghost" 
                  className={isActive('/search') ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700' : 'hover:bg-gray-50'}
                >
                  Find Services
                </Button>
              </Link>
              {session?.user.role === 'CUSTOMER' && (
                <Link href="/bookings">
                  <Button 
                    variant="ghost"
                    className={isActive('/bookings') ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700' : 'hover:bg-gray-50'}
                  >
                    My Bookings
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            <CartButton />
            {session ? (
              <>
                <Link href={session.user.role === 'BUSINESS_OWNER' ? '/business/dashboard' : '/dashboard'}>
                  <Button variant="ghost" className={isActive('/dashboard') || isActive('/business/dashboard') ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700' : 'hover:bg-gray-50'}>
                    Dashboard
                  </Button>
                </Link>
                <Link href="/api/auth/signout">
                  <Button variant="ghost">Sign out</Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Sign in</Button>
                </Link>
                <Link href="/signup/customer">
                  <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-sm">Sign up</Button>
                </Link>
                <Link href="/signup/business">
                  <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:border-indigo-300 transition-colors">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="hidden sm:inline">List your business</span>
                    <span className="sm:hidden">List business</span>
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-100 stagger">
            <Link href="/search" className="block">
              <Button variant="ghost" fullWidth className="justify-start">
                Find Services
              </Button>
            </Link>
            {session?.user.role === 'CUSTOMER' && (
              <Link href="/bookings" className="block">
                <Button variant="ghost" fullWidth className="justify-start">
                  My Bookings
                </Button>
              </Link>
            )}
            {session ? (
              <>
                <Link href={session.user.role === 'BUSINESS_OWNER' ? '/business/dashboard' : '/dashboard'} className="block">
                  <Button variant="ghost" fullWidth className="justify-start">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/api/auth/signout" className="block">
                  <Button variant="ghost" fullWidth className="justify-start">
                    Sign out
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="block">
                  <Button variant="ghost" fullWidth className="justify-start">
                    Sign in
                  </Button>
                </Link>
                <Link href="/signup/customer" className="block">
                  <Button fullWidth className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-sm">Sign up</Button>
                </Link>
                <Link href="/signup/business" className="block">
                  <Button variant="outline" fullWidth>
                    List your business
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}