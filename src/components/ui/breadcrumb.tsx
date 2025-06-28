import Link from 'next/link'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex', className)}>
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          
          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <svg 
                  className="h-4 w-4 text-gray-400 mx-2 flex-shrink-0" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
              
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors duration-200 hover:underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    'text-sm font-medium',
                    isLast ? 'text-gray-900' : 'text-gray-500'
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

interface BreadcrumbWrapperProps {
  children: React.ReactNode
  className?: string
}

export function BreadcrumbWrapper({ children, className }: BreadcrumbWrapperProps) {
  return (
    <div className={cn(
      'bg-white border-b border-gray-200 px-4 py-3 sm:px-6 lg:px-8 animate-fade-in',
      className
    )}>
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  )
}