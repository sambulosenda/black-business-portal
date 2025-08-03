import React from 'react'
import { Check } from 'lucide-react'

interface Step {
  id: string
  name: string
  description?: string
}

interface ProgressStepsProps {
  steps: Step[]
  currentStep: number
  className?: string
}

export function ProgressSteps({ steps, currentStep, className = '' }: ProgressStepsProps) {
  return (
    <nav aria-label="Progress" className={className}>
      <ol role="list" className="flex items-center justify-between">
        {steps.map((step, stepIdx) => (
          <li key={step.id} className={`${stepIdx !== steps.length - 1 ? 'flex-1' : ''} relative`}>
            {stepIdx < currentStep ? (
              // Completed step
              <div className="group flex items-center">
                <span className="flex items-center relative">
                  <span className="relative z-10 w-10 h-10 flex items-center justify-center bg-indigo-600 rounded-full group-hover:bg-indigo-800 transition-colors">
                    <Check className="w-5 h-5 text-white" aria-hidden="true" />
                  </span>
                </span>
                <div className="ml-4 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900">{step.name}</h3>
                  {step.description && (
                    <p className="text-sm text-gray-500">{step.description}</p>
                  )}
                </div>
                {stepIdx !== steps.length - 1 && (
                  <div className="hidden sm:block absolute top-5 left-10 w-full h-0.5 bg-indigo-600" aria-hidden="true" />
                )}
              </div>
            ) : stepIdx === currentStep ? (
              // Current step
              <div className="flex items-center" aria-current="step">
                <span className="flex items-center relative">
                  <span className="relative z-10 w-10 h-10 flex items-center justify-center bg-white border-2 border-indigo-600 rounded-full">
                    <span className="h-2.5 w-2.5 bg-indigo-600 rounded-full animate-pulse" />
                  </span>
                </span>
                <div className="ml-4 min-w-0">
                  <h3 className="text-sm font-medium text-indigo-600">{step.name}</h3>
                  {step.description && (
                    <p className="text-sm text-gray-500">{step.description}</p>
                  )}
                </div>
                {stepIdx !== steps.length - 1 && (
                  <div className="hidden sm:block absolute top-5 left-10 w-full h-0.5 bg-gray-200" aria-hidden="true" />
                )}
              </div>
            ) : (
              // Future step
              <div className="group flex items-center">
                <span className="flex items-center relative">
                  <span className="relative z-10 w-10 h-10 flex items-center justify-center bg-white border-2 border-gray-300 rounded-full group-hover:border-gray-400 transition-colors">
                    <span className="h-2.5 w-2.5 bg-transparent rounded-full group-hover:bg-gray-300 transition-colors" />
                  </span>
                </span>
                <div className="ml-4 min-w-0">
                  <h3 className="text-sm font-medium text-gray-500">{step.name}</h3>
                  {step.description && (
                    <p className="text-sm text-gray-400">{step.description}</p>
                  )}
                </div>
                {stepIdx !== steps.length - 1 && (
                  <div className="hidden sm:block absolute top-5 left-10 w-full h-0.5 bg-gray-200" aria-hidden="true" />
                )}
              </div>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

// Mobile-optimized version
export function MobileProgressSteps({ steps, currentStep }: ProgressStepsProps) {
  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="sm:hidden">
      <div className="mb-2">
        <div className="flex justify-between text-xs text-gray-600">
          <span>Step {currentStep + 1} of {steps.length}</span>
          <span>{steps[currentStep].name}</span>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-indigo-600 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        >
          <div className="h-full bg-white/20 animate-pulse" />
        </div>
      </div>
    </div>
  )
}