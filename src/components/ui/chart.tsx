'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ChartContainerProps {
  children: ReactNode
  className?: string
  title?: string
  description?: string
}

export function ChartContainer({ children, className, title, description }: ChartContainerProps) {
  return (
    <div className={cn('rounded-lg bg-white p-6 shadow-sm border border-gray-200', className)}>
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
      )}
      <div className="w-full">{children}</div>
    </div>
  )
}

interface BarChartProps {
  data: { label: string; value: number; color?: string }[]
  height?: number
  showValues?: boolean
  animate?: boolean
}

export function BarChart({ data, height = 200, showValues = true, animate = true }: BarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value))
  
  return (
    <div className="relative" style={{ height }}>
      <div className="flex items-end justify-between h-full gap-2">
        {data.map((item, index) => {
          const heightPercentage = (item.value / maxValue) * 100
          return (
            <div key={index} className="flex-1 flex flex-col items-center justify-end">
              {showValues && (
                <span className="text-sm font-medium text-gray-700 mb-1">
                  ${item.value.toLocaleString()}
                </span>
              )}
              <div
                className={cn(
                  'w-full rounded-t-md transition-all duration-500 hover:opacity-80',
                  item.color || 'bg-indigo-600',
                  animate && 'animate-slide-up'
                )}
                style={{
                  height: `${heightPercentage}%`,
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: 'both'
                }}
              />
              <span className="text-xs text-gray-500 mt-2">{item.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface PieChartProps {
  data: { label: string; value: number; color: string }[]
  size?: number
  showLegend?: boolean
  animate?: boolean
}

export function PieChart({ data, size = 200, showLegend = true, animate = true }: PieChartProps) {
  const total = data.reduce((acc, item) => acc + item.value, 0)
  let cumulativePercentage = 0

  // Map Tailwind class to actual color
  const getColor = (colorClass: string) => {
    const colorMap: { [key: string]: string } = {
      'bg-green-500': '#10b981',
      'bg-yellow-500': '#eab308',
      'bg-red-500': '#ef4444',
      'bg-blue-500': '#3b82f6',
      'bg-indigo-500': '#6366f1',
      'bg-purple-500': '#a855f7',
      'bg-pink-500': '#ec4899',
      'bg-gray-500': '#6b7280'
    }
    return colorMap[colorClass] || '#6366f1'
  }

  return (
    <div className="flex items-center justify-center gap-8">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className={cn('transform -rotate-90', animate && 'animate-fade-in')}>
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100
            const strokeDasharray = `${percentage} ${100 - percentage}`
            const strokeDashoffset = -cumulativePercentage
            cumulativePercentage += percentage

            return (
              <circle
                key={index}
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={getColor(item.color)}
                strokeWidth="20"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500 hover:opacity-80"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              />
            )
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">${total.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Total</p>
          </div>
        </div>
      </div>
      
      {showLegend && (
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className={cn('w-3 h-3 rounded-full', item.color)} />
              <span className="text-sm text-gray-600">{item.label}</span>
              <span className="text-sm font-medium text-gray-900 ml-auto">
                ${item.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface LineChartProps {
  data: { x: string; y: number }[]
  height?: number
  color?: string
  showDots?: boolean
  animate?: boolean
}

export function LineChart({ 
  data, 
  height = 200, 
  color = 'stroke-indigo-600',
  showDots = true,
  animate = true 
}: LineChartProps) {
  const maxY = Math.max(...data.map(d => d.y))
  const minY = Math.min(...data.map(d => d.y))
  const rangeY = maxY - minY || 1

  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = 100 - ((item.y - minY) / rangeY) * 100
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="relative" style={{ height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        <polyline
          points={points}
          fill="none"
          className={cn(color, 'stroke-2', animate && 'animate-draw-line')}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {showDots && data.map((item, index) => {
          const x = (index / (data.length - 1)) * 100
          const y = 100 - ((item.y - minY) / rangeY) * 100
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="1.5"
              className={cn('fill-white', color.replace('stroke', 'stroke'), animate && 'animate-scale-in')}
              style={{ animationDelay: `${index * 50}ms` }}
            />
          )
        })}
      </svg>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 mt-2">
        {data.map((item, index) => (
          <span key={index}>{item.x}</span>
        ))}
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: string
}

export function StatCard({ title, value, description, icon, trend, color = 'bg-indigo-600' }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
          {trend && (
            <div className={cn('flex items-center mt-2 text-sm', trend.isPositive ? 'text-green-600' : 'text-red-600')}>
              <svg
                className={cn('w-4 h-4 mr-1', !trend.isPositive && 'rotate-180')}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>{Math.abs(trend.value)}% from last period</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={cn('p-3 rounded-lg text-white', color)}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}