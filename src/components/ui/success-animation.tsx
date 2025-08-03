import React, { useEffect, useState } from 'react'
import { Check } from 'lucide-react'

interface SuccessAnimationProps {
  show: boolean
  onComplete?: () => void
  message?: string
  subMessage?: string
}

export function SuccessAnimation({ show, onComplete, message = "Success!", subMessage }: SuccessAnimationProps) {
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
      <div className={`
        bg-white rounded-lg shadow-xl p-8 text-center transform transition-all duration-500
        ${animate ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
      `}>
        <div className={`
          w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center
          transform transition-all duration-700 delay-100
          ${animate ? 'scale-100 rotate-0' : 'scale-0 rotate-180'}
        `}>
          <div className={`
            transform transition-all duration-500 delay-300
            ${animate ? 'scale-100' : 'scale-0'}
          `}>
            <Check className="w-10 h-10 text-green-600" />
          </div>
        </div>
        <h3 className={`
          text-xl font-semibold text-gray-900 mb-2
          transform transition-all duration-500 delay-400
          ${animate ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}
        `}>
          {message}
        </h3>
        {subMessage && (
          <p className={`
            text-gray-600
            transform transition-all duration-500 delay-500
            ${animate ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}
          `}>
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
    <div className={`
      inline-flex items-center justify-center w-5 h-5 bg-green-600 rounded-full
      transform transition-all duration-300
      ${animate ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
    `}>
      <Check className="w-3 h-3 text-white" />
    </div>
  )
}