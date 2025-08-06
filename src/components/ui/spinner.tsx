import { cn } from '@/lib/utils'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div className="flex items-center justify-center">
      <svg
        className={cn('animate-spin text-indigo-600', sizeClasses[size], className)}
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
    </div>
  )
}

export function LoadingOverlay() {
  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="text-center">
        <Spinner size="lg" className="mx-auto mb-4" />
        <p className="animate-pulse text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

export function LoadingDots() {
  return (
    <div className="flex items-center justify-center space-x-1">
      <div
        className="h-2 w-2 animate-bounce rounded-full bg-indigo-600"
        style={{ animationDelay: '0ms' }}
      ></div>
      <div
        className="h-2 w-2 animate-bounce rounded-full bg-indigo-600"
        style={{ animationDelay: '150ms' }}
      ></div>
      <div
        className="h-2 w-2 animate-bounce rounded-full bg-indigo-600"
        style={{ animationDelay: '300ms' }}
      ></div>
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-gray-200', className)} />
}
