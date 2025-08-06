import { TextareaHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full resize-none rounded-lg border bg-white px-3 py-2 text-sm ring-offset-white transition-all duration-200',
          'placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
          'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-50',
          error
            ? 'border-red-300 bg-red-50/50 text-red-900 placeholder:text-red-300 focus-visible:ring-red-500'
            : 'border-gray-300 focus:border-indigo-300 focus-visible:ring-indigo-500',
          'hover:border-gray-400 focus:placeholder:text-gray-500',
          'transform focus:scale-[1.01]',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }
