'use client'

import { useState, useCallback } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ImageUploadProps {
  businessId: string
  onUploadComplete?: (url: string) => void
  onError?: (error: Error) => void
  className?: string
  accept?: string
  maxSizeMB?: number
}

export function ImageUpload({
  businessId,
  onUploadComplete,
  onError,
  className,
  accept = 'image/*',
  maxSizeMB = 4,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleFile = useCallback(async (file: File) => {
    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      const error = new Error(`File too large. Maximum size is ${maxSizeMB}MB.`)
      toast.error(error.message)
      onError?.(error)
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      const error = new Error('Only image files are allowed.')
      toast.error(error.message)
      onError?.(error)
      return
    }

    setIsUploading(true)

    try {
      // Step 1: Get presigned URL
      const presignedResponse = await fetch('/api/upload/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          filename: file.name,
          contentType: file.type,
          fileSize: file.size,
        }),
      })

      if (!presignedResponse.ok) {
        const error = await presignedResponse.json()
        throw new Error(error.error || 'Failed to get upload URL')
      }

      const { uploadUrl, publicUrl } = await presignedResponse.json()

      // Step 2: Upload to S3
      console.log('Uploading to S3 with URL:', uploadUrl)
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
        mode: 'cors',
      })

      console.log('S3 upload response status:', uploadResponse.status)
      console.log('S3 upload response headers:', uploadResponse.headers)

      if (!uploadResponse.ok) {
        const responseText = await uploadResponse.text()
        console.error('S3 upload failed:', responseText)
        throw new Error(`Failed to upload file to S3: ${uploadResponse.status} ${uploadResponse.statusText}`)
      }

      // Step 3: Save to database
      const saveResponse = await fetch('/api/upload/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          url: publicUrl,
        }),
      })

      if (!saveResponse.ok) {
        const error = await saveResponse.json()
        throw new Error(error.error || 'Failed to save photo')
      }

      toast.success('Photo uploaded successfully!')
      onUploadComplete?.(publicUrl)
    } catch (error) {
      console.error('Upload error:', error)
      const uploadError = error instanceof Error ? error : new Error('Upload failed')
      toast.error(uploadError.message)
      onError?.(uploadError)
    } finally {
      setIsUploading(false)
    }
  }, [businessId, maxSizeMB, onUploadComplete, onError])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)
  }, [])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }, [handleFile])

  return (
    <div
      className={cn(
        'relative rounded-lg border-2 border-dashed transition-colors',
        dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300',
        isUploading && 'pointer-events-none opacity-60',
        className
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleChange}
        disabled={isUploading}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      
      <div className="p-8 text-center">
        {isUploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            <p className="mt-2 text-sm text-gray-600">Uploading...</p>
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-10 w-10 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Drag and drop your image here, or click to browse
            </p>
            <p className="mt-1 text-xs text-gray-500">
              PNG, JPG, GIF, WebP up to {maxSizeMB}MB
            </p>
          </>
        )}
      </div>
    </div>
  )
}