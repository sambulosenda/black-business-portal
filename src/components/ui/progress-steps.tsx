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
                <span className="relative flex items-center">
                  <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 transition-colors group-hover:bg-indigo-800">
                    <Check className="h-5 w-5 text-white" aria-hidden="true" />
                  </span>
                </span>
                <div className="ml-4 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900">{step.name}</h3>
                  {step.description && <p className="text-sm text-gray-500">{step.description}</p>}
                </div>
                {stepIdx !== steps.length - 1 && (
                  <div
                    className="absolute top-5 left-10 hidden h-0.5 w-full bg-indigo-600 sm:block"
                    aria-hidden="true"
                  />
                )}
              </div>
            ) : stepIdx === currentStep ? (
              // Current step
              <div className="flex items-center" aria-current="step">
                <span className="relative flex items-center">
                  <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-indigo-600 bg-white">
                    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-indigo-600" />
                  </span>
                </span>
                <div className="ml-4 min-w-0">
                  <h3 className="text-sm font-medium text-indigo-600">{step.name}</h3>
                  {step.description && <p className="text-sm text-gray-500">{step.description}</p>}
                </div>
                {stepIdx !== steps.length - 1 && (
                  <div
                    className="absolute top-5 left-10 hidden h-0.5 w-full bg-gray-200 sm:block"
                    aria-hidden="true"
                  />
                )}
              </div>
            ) : (
              // Future step
              <div className="group flex items-center">
                <span className="relative flex items-center">
                  <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300 bg-white transition-colors group-hover:border-gray-400">
                    <span className="h-2.5 w-2.5 rounded-full bg-transparent transition-colors group-hover:bg-gray-300" />
                  </span>
                </span>
                <div className="ml-4 min-w-0">
                  <h3 className="text-sm font-medium text-gray-500">{step.name}</h3>
                  {step.description && <p className="text-sm text-gray-400">{step.description}</p>}
                </div>
                {stepIdx !== steps.length - 1 && (
                  <div
                    className="absolute top-5 left-10 hidden h-0.5 w-full bg-gray-200 sm:block"
                    aria-hidden="true"
                  />
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
          <span>
            Step {currentStep + 1} of {steps.length}
          </span>
          <span>{steps[currentStep].name}</span>
        </div>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        >
          <div className="h-full animate-pulse bg-white/20" />
        </div>
      </div>
    </div>
  )
}
