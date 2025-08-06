import React from 'react'
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react'

interface FormFeedbackProps {
  type?: 'success' | 'error' | 'warning' | 'info'
  message: string
  className?: string
}

export function FormFeedback({ type = 'info', message, className = '' }: FormFeedbackProps) {
  const styles = {
    success: {
      container: 'bg-green-50 border-green-200 text-green-800',
      icon: <CheckCircle2 className="h-4 w-4 text-green-600" />,
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: <XCircle className="h-4 w-4 text-red-600" />,
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      icon: <AlertCircle className="h-4 w-4 text-yellow-600" />,
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: <Info className="h-4 w-4 text-blue-600" />,
    },
  }

  const style = styles[type]

  return (
    <div className={`flex items-start gap-2 rounded-md border p-3 ${style.container} ${className}`}>
      <span className="mt-0.5 flex-shrink-0">{style.icon}</span>
      <p className="text-sm leading-5">{message}</p>
    </div>
  )
}

interface InlineValidationProps {
  error?: string
  success?: string
  touched?: boolean
  className?: string
}

export function InlineValidation({
  error,
  success,
  touched,
  className = '',
}: InlineValidationProps) {
  if (!touched || (!error && !success)) return null

  return (
    <div className={`mt-1 ${className}`}>
      {error && (
        <p className="flex items-center gap-1 text-sm text-red-600">
          <XCircle className="h-3 w-3" />
          {error}
        </p>
      )}
      {success && !error && (
        <p className="flex items-center gap-1 text-sm text-green-600">
          <CheckCircle2 className="h-3 w-3" />
          {success}
        </p>
      )}
    </div>
  )
}
