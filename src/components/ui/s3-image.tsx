'use client'

import { useEffect, useState } from 'react'
import Image, { ImageProps } from 'next/image'

interface S3ImageProps extends Omit<ImageProps, 'src'> {
  src: string
  fallback?: string
}

export function S3Image({ src, fallback = '/placeholder-image.png', alt, ...props }: S3ImageProps) {
  const [imageSrc, setImageSrc] = useState<string>(src)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    // Check if this is an S3 URL that needs a presigned URL
    if (src.includes('.amazonaws.com/') && src.includes('glamfric-portal-images-2025')) {
      // Use our API endpoint to get a presigned URL
      const encodedUrl = encodeURIComponent(src)
      setImageSrc(`/api/images/proxy?url=${encodedUrl}`)
    } else {
      setImageSrc(src)
    }
  }, [src])

  return (
    <>
      {isLoading && <div className="absolute inset-0 animate-pulse bg-gray-100" />}
      <Image
        {...props}
        src={error ? fallback : imageSrc}
        alt={alt}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setError(true)
          setIsLoading(false)
        }}
      />
    </>
  )
}
