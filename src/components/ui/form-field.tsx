import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface FormFieldProps {
  label?: string
  error?: string
  hint?: string
  required?: boolean
  children: ReactNode
  className?: string
}

export function FormField({ label, error, hint, required, children, className }: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 transition-colors hover:text-gray-900">
          {label}
          {required && (
            <span className="ml-1 text-red-500" aria-label="required">
              *
            </span>
          )}
        </label>
      )}
      <div className="relative">
        {children}
        {error && (
          <div className="animate-shake absolute inset-x-0 -bottom-6">
            <p className="flex items-center gap-1 text-sm text-red-600">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {error}
            </p>
          </div>
        )}
      </div>
      {hint && !error && <p className="animate-fade-in text-sm text-gray-500">{hint}</p>}
    </div>
  )
}

interface FormGroupProps {
  children: ReactNode
  className?: string
}

export function FormGroup({ children, className }: FormGroupProps) {
  return <div className={cn('space-y-6', className)}>{children}</div>
}

interface FormSectionProps {
  title?: string
  description?: string
  children: ReactNode
  className?: string
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {(title || description) && (
        <div className="border-b border-gray-200 pb-4">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
        </div>
      )}
      {children}
    </div>
  )
}
