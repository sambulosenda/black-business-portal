import React, { useEffect, useState } from 'react'
import { Check } from 'lucide-react'

interface SuccessAnimationProps {
  show: boolean
  onComplete?: () => void
  message?: string
  subMessage?: string
}

export function SuccessAnimation({
  show,
  onComplete,
  message = 'Success!',
  subMessage,
}: SuccessAnimationProps) {
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    if (show) {
      setAnimate(true)
      const timer = setTimeout(() => {
        if (onComplete) onComplete()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div
        className={`transform rounded-lg bg-white p-8 text-center shadow-xl transition-all duration-500 ${animate ? 'scale-100 opacity-100' : 'scale-95 opacity-0'} `}
      >
        <div
          className={`mx-auto mb-4 flex h-20 w-20 transform items-center justify-center rounded-full bg-green-100 transition-all delay-100 duration-700 ${animate ? 'scale-100 rotate-0' : 'scale-0 rotate-180'} `}
        >
          <div
            className={`transform transition-all delay-300 duration-500 ${animate ? 'scale-100' : 'scale-0'} `}
          >
            <Check className="h-10 w-10 text-green-600" />
          </div>
        </div>
        <h3
          className={`mb-2 transform text-xl font-semibold text-gray-900 transition-all delay-400 duration-500 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'} `}
        >
          {message}
        </h3>
        {subMessage && (
          <p
            className={`transform text-gray-600 transition-all delay-500 duration-500 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'} `}
          >
            {subMessage}
          </p>
        )}
      </div>
    </div>
  )
}

// Inline success checkmark animation for form fields
export function InlineSuccess({ show }: { show: boolean }) {
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    if (show) {
      setAnimate(true)
    } else {
      setAnimate(false)
    }
  }, [show])

  if (!show) return null

  return (
    <div
      className={`inline-flex h-5 w-5 transform items-center justify-center rounded-full bg-green-600 transition-all duration-300 ${animate ? 'scale-100 opacity-100' : 'scale-0 opacity-0'} `}
    >
      <Check className="h-3 w-3 text-white" />
    </div>
  )
}
