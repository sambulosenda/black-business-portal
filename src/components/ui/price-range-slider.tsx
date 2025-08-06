'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface PriceRangeSliderProps {
  min: number
  max: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  step?: number
  className?: string
}

export function PriceRangeSlider({
  min,
  max,
  value,
  onChange,
  step = 1,
  className,
}: PriceRangeSliderProps) {
  const [localValue, setLocalValue] = useState(value)
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null)
  const sliderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const getPercentage = (val: number) => {
    return ((val - min) / (max - min)) * 100
  }

  const handleMouseDown = (type: 'min' | 'max') => {
    setIsDragging(type)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !sliderRef.current) return

    const rect = sliderRef.current.getBoundingClientRect()
    const percentage = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
    const newValue = Math.round((percentage / 100) * (max - min) + min)

    const [currentMin, currentMax] = localValue

    if (isDragging === 'min') {
      const newMin = Math.min(newValue, currentMax - step)
      setLocalValue([newMin, currentMax])
    } else {
      const newMax = Math.max(newValue, currentMin + step)
      setLocalValue([currentMin, newMax])
    }
  }

  const handleMouseUp = () => {
    if (isDragging) {
      onChange(localValue)
      setIsDragging(null)
    }
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, localValue])

  const leftPercentage = getPercentage(localValue[0])
  const rightPercentage = 100 - getPercentage(localValue[1])

  return (
    <div className={cn('relative w-full', className)}>
      <div className="mb-2 flex justify-between text-sm text-gray-600">
        <span>${localValue[0]}</span>
        <span>${localValue[1]}</span>
      </div>

      <div ref={sliderRef} className="relative h-2 rounded-full bg-gray-200">
        {/* Active range */}
        <div
          className="absolute h-full rounded-full bg-gradient-to-r from-indigo-600 to-purple-600"
          style={{
            left: `${leftPercentage}%`,
            right: `${rightPercentage}%`,
          }}
        />

        {/* Min handle */}
        <div
          className={cn(
            'absolute top-1/2 h-5 w-5 -translate-y-1/2 cursor-grab rounded-full border-2 border-indigo-600 bg-white shadow-lg transition-transform',
            isDragging === 'min' && 'scale-125 cursor-grabbing'
          )}
          style={{ left: `${leftPercentage}%`, transform: 'translate(-50%, -50%)' }}
          onMouseDown={() => handleMouseDown('min')}
        >
          <div className="absolute inset-0 scale-0 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-transform group-hover:scale-100" />
        </div>

        {/* Max handle */}
        <div
          className={cn(
            'absolute top-1/2 h-5 w-5 -translate-y-1/2 cursor-grab rounded-full border-2 border-purple-600 bg-white shadow-lg transition-transform',
            isDragging === 'max' && 'scale-125 cursor-grabbing'
          )}
          style={{ left: `${100 - rightPercentage}%`, transform: 'translate(-50%, -50%)' }}
          onMouseDown={() => handleMouseDown('max')}
        >
          <div className="absolute inset-0 scale-0 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-transform group-hover:scale-100" />
        </div>
      </div>
    </div>
  )
}
