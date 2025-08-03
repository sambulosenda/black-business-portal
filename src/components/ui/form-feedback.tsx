import React from 'react'
import { CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react'

interface FormFeedbackProps {
  type?: 'success' | 'error' | 'warning' | 'info'
  message: string
  className?: string
}

export function FormFeedback({ type = 'info', message, className = '' }: FormFeedbackProps) {
  const styles = {
    success: {
      container: 'bg-green-50 border-green-200 text-green-800',
      icon: <CheckCircle2 className="w-4 h-4 text-green-600" />
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: <XCircle className="w-4 h-4 text-red-600" />
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      icon: <AlertCircle className="w-4 h-4 text-yellow-600" />
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: <Info className="w-4 h-4 text-blue-600" />
    }
  }

  const style = styles[type]

  return (
    <div className={`flex items-start gap-2 p-3 rounded-md border ${style.container} ${className}`}>
      <span className="flex-shrink-0 mt-0.5">{style.icon}</span>
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

export function InlineValidation({ error, success, touched, className = '' }: InlineValidationProps) {
  if (!touched || (!error && !success)) return null

  return (
    <div className={`mt-1 ${className}`}>
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          {error}
        </p>
      )}
      {success && !error && (
        <p className="text-sm text-green-600 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          {success}
        </p>
      )}
    </div>
  )
}