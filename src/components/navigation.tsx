'use client'

import { useState } from 'react'
import { Session } from 'next-auth'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface NavigationProps {
  session: Session | null
}

export default function Navigation({ session }: NavigationProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActive = (path: string) => pathname === path

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex items-center">
            <Link href="/" className="group flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 font-bold text-white transition-shadow group-hover:shadow-lg">
                G
              </div>
              <span className="font-display bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent">
                Glamfric
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="ml-8 hidden items-center space-x-1 md:flex">
              <Link href="/search">
                <Button
                  variant="ghost"
                  className={
                    isActive('/search')
                      ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700'
                      : 'hover:bg-gray-50'
                  }
                >
                  Find Services
                </Button>
              </Link>
              {session?.user.role === 'CUSTOMER' && (
                <Link href="/bookings">
                  <Button
                    variant="ghost"
                    className={
                      isActive('/bookings')
                        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700'
                        : 'hover:bg-gray-50'
                    }
                  >
                    My Bookings
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden items-center space-x-2 md:flex">
            {session ? (
              <>
                <Link
                  href={
                    session.user.role === 'BUSINESS_OWNER' ? '/business/dashboard' : '/dashboard'
                  }
                >
                  <Button
                    variant="ghost"
                    className={
                      isActive('/dashboard') || isActive('/business/dashboard')
                        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700'
                        : 'hover:bg-gray-50'
                    }
                  >
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
                  <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm hover:from-indigo-700 hover:to-purple-700">
                    Sign up
                  </Button>
                </Link>
                <Link href="/signup/business">
                  <Button
                    variant="outline"
                    className="border-indigo-200 text-indigo-700 transition-colors hover:border-indigo-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50"
                  >
                    <svg
                      className="mr-2 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span className="hidden sm:inline">List your business</span>
                    <span className="sm:hidden">List business</span>
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 transition-colors hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:ring-inset"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="stagger space-y-1 border-t border-gray-100 bg-white px-2 pt-2 pb-3">
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
                <Link
                  href={
                    session.user.role === 'BUSINESS_OWNER' ? '/business/dashboard' : '/dashboard'
                  }
                  className="block"
                >
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
                  <Button
                    fullWidth
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm hover:from-indigo-700 hover:to-purple-700"
                  >
                    Sign up
                  </Button>
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
