import { ReactNode } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from './button'

interface EmptyStateProps {
  icon?: 'search' | 'bookings' | 'services' | 'reviews' | 'calendar' | 'chart' | 'users' | 'error'
  title: string
  description?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  className?: string
  children?: ReactNode
}

const illustrations = {
  search: (
    <svg className="h-48 w-48" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="85" cy="85" r="55" stroke="#e5e7eb" strokeWidth="8" fill="#f9fafb" />
      <path d="M125 125L155 155" stroke="#e5e7eb" strokeWidth="8" strokeLinecap="round" />
      <circle
        cx="85"
        cy="85"
        r="35"
        stroke="#6366f1"
        strokeWidth="4"
        strokeDasharray="5 5"
        className="animate-pulse"
      />
      <path
        d="M65 85C65 74 74 65 85 65"
        stroke="#6366f1"
        strokeWidth="4"
        strokeLinecap="round"
        className="animate-pulse"
      />
    </svg>
  ),
  bookings: (
    <svg className="h-48 w-48" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect
        x="40"
        y="50"
        width="120"
        height="130"
        rx="8"
        fill="#f9fafb"
        stroke="#e5e7eb"
        strokeWidth="4"
      />
      <rect x="40" y="50" width="120" height="30" rx="8" fill="#e5e7eb" />
      <circle cx="60" cy="65" r="4" fill="#6366f1" />
      <circle cx="75" cy="65" r="4" fill="#6366f1" />
      <circle cx="90" cy="65" r="4" fill="#6366f1" />
      <rect
        x="55"
        y="100"
        width="30"
        height="25"
        rx="4"
        fill="#f3f4f6"
        stroke="#e5e7eb"
        strokeWidth="2"
      />
      <rect
        x="95"
        y="100"
        width="30"
        height="25"
        rx="4"
        fill="#f3f4f6"
        stroke="#e5e7eb"
        strokeWidth="2"
      />
      <rect
        x="55"
        y="135"
        width="30"
        height="25"
        rx="4"
        fill="#f3f4f6"
        stroke="#e5e7eb"
        strokeWidth="2"
      />
      <path
        d="M75 110L85 110M85 110L85 120M85 120L75 120M85 120L95 120"
        stroke="#6366f1"
        strokeWidth="3"
        strokeLinecap="round"
        className="animate-pulse"
      />
    </svg>
  ),
  services: (
    <svg className="h-48 w-48" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect
        x="30"
        y="40"
        width="60"
        height="60"
        rx="8"
        fill="#f9fafb"
        stroke="#e5e7eb"
        strokeWidth="4"
      />
      <rect
        x="110"
        y="40"
        width="60"
        height="60"
        rx="8"
        fill="#f9fafb"
        stroke="#e5e7eb"
        strokeWidth="4"
      />
      <rect
        x="30"
        y="120"
        width="60"
        height="60"
        rx="8"
        fill="#f9fafb"
        stroke="#e5e7eb"
        strokeWidth="4"
      />
      <rect
        x="110"
        y="120"
        width="60"
        height="60"
        rx="8"
        fill="#f9fafb"
        stroke="#e5e7eb"
        strokeWidth="4"
      />
      <path
        d="M50 70L70 70M60 60L60 80"
        stroke="#6366f1"
        strokeWidth="4"
        strokeLinecap="round"
        className="animate-pulse"
      />
      <circle cx="140" cy="70" r="15" stroke="#e5e7eb" strokeWidth="3" fill="none" />
      <rect x="50" y="140" width="20" height="20" fill="#e5e7eb" rx="4" />
      <path
        d="M130 150L150 150M140 140L140 160"
        stroke="#e5e7eb"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  ),
  reviews: (
    <svg className="h-48 w-48" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M100 40L115 70L150 75L125 100L130 135L100 120L70 135L75 100L50 75L85 70L100 40Z"
        fill="#f9fafb"
        stroke="#e5e7eb"
        strokeWidth="4"
      />
      <path
        d="M100 60L108 75L125 77L112 90L115 107L100 99L85 107L88 90L75 77L92 75L100 60Z"
        fill="#6366f1"
        className="animate-pulse"
      />
      <rect x="40" y="150" width="120" height="10" rx="5" fill="#e5e7eb" />
      <rect x="50" y="170" width="100" height="8" rx="4" fill="#f3f4f6" />
    </svg>
  ),
  calendar: (
    <svg className="h-48 w-48" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect
        x="40"
        y="60"
        width="120"
        height="100"
        rx="8"
        fill="#f9fafb"
        stroke="#e5e7eb"
        strokeWidth="4"
      />
      <rect x="40" y="60" width="120" height="25" rx="8" fill="#e5e7eb" />
      <rect x="60" y="45" width="8" height="30" rx="4" fill="#6366f1" />
      <rect x="132" y="45" width="8" height="30" rx="4" fill="#6366f1" />
      <circle cx="70" cy="110" r="4" fill="#e5e7eb" />
      <circle cx="100" cy="110" r="4" fill="#e5e7eb" />
      <circle cx="130" cy="110" r="4" fill="#e5e7eb" />
      <circle cx="70" cy="130" r="4" fill="#e5e7eb" />
      <circle cx="100" cy="130" r="4" fill="#6366f1" className="animate-pulse" />
      <circle cx="130" cy="130" r="4" fill="#e5e7eb" />
    </svg>
  ),
  chart: (
    <svg className="h-48 w-48" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="140" width="30" height="40" rx="4" fill="#e5e7eb" />
      <rect x="75" y="100" width="30" height="80" rx="4" fill="#f3f4f6" />
      <rect
        x="110"
        y="80"
        width="30"
        height="100"
        rx="4"
        fill="#6366f1"
        className="animate-pulse"
      />
      <rect x="145" y="120" width="30" height="60" rx="4" fill="#e5e7eb" />
      <path d="M30 30L30 180L180 180" stroke="#d1d5db" strokeWidth="4" strokeLinecap="round" />
    </svg>
  ),
  users: (
    <svg className="h-48 w-48" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="60" r="25" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="4" />
      <path
        d="M60 130C60 110 78 95 100 95C122 95 140 110 140 130L140 150L60 150L60 130Z"
        fill="#f9fafb"
        stroke="#e5e7eb"
        strokeWidth="4"
      />
      <circle cx="70" cy="90" r="20" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="3" />
      <path
        d="M40 140C40 125 52 113 70 113C88 113 100 125 100 140L100 150L40 150L40 140Z"
        fill="#f3f4f6"
        stroke="#e5e7eb"
        strokeWidth="3"
      />
      <circle cx="130" cy="90" r="20" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="3" />
      <path
        d="M100 140C100 125 112 113 130 113C148 113 160 125 160 140L160 150L100 150L100 140Z"
        fill="#f3f4f6"
        stroke="#e5e7eb"
        strokeWidth="3"
      />
      <circle cx="100" cy="60" r="15" fill="#6366f1" className="animate-pulse" />
    </svg>
  ),
  error: (
    <svg className="h-48 w-48" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M100 40L140 120L60 120L100 40Z" fill="#fef2f2" stroke="#fecaca" strokeWidth="4" />
      <path
        d="M95 80L95 100M105 80L105 100"
        stroke="#ef4444"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="100" cy="110" r="4" fill="#ef4444" />
      <circle cx="100" cy="150" r="30" fill="#fef2f2" stroke="#fecaca" strokeWidth="4" />
      <path
        d="M85 140L100 155L115 140"
        stroke="#ef4444"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-bounce"
      />
    </svg>
  ),
}

export function EmptyState({
  icon = 'search',
  title,
  description,
  action,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center px-4 py-12 text-center', className)}
    >
      <div className="animate-fade-in mb-6">{illustrations[icon]}</div>

      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>

      {description && <p className="mb-6 max-w-sm text-sm text-gray-500">{description}</p>}

      {action && (
        <div className="animate-slide-up">
          {action.href ? (
            <Link href={action.href}>
              <Button size="sm">{action.label}</Button>
            </Link>
          ) : (
            <Button size="sm" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      )}

      {children}
    </div>
  )
}
