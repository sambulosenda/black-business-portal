'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { S3Image } from '@/components/ui/s3-image'
import type { BusinessPhoto } from '@/types'

interface GallerySectionProps {
  photos: BusinessPhoto[]
}

export default function GallerySection({ photos }: GallerySectionProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const openLightbox = (index: number) => {
    setSelectedIndex(index)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setSelectedIndex(null)
    document.body.style.overflow = 'unset'
  }

  const goToPrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1)
    }
  }

  const goToNext = () => {
    if (selectedIndex !== null && selectedIndex < photos.length - 1) {
      setSelectedIndex(selectedIndex + 1)
    }
  }

  return (
    <section id="gallery">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gallery</h2>
          <p className="mt-1 text-gray-600">See our space and work</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            onClick={() => openLightbox(index)}
            className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100 transition-all duration-200 hover:shadow-lg"
          >
            <S3Image
              src={photo.url}
              alt={photo.caption || 'Gallery image'}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/20" />
          </button>
        ))}
      </div>

      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 rounded-full p-2 text-white transition-colors hover:bg-white/10"
            onClick={closeLightbox}
            aria-label="Close gallery"
          >
            <X className="h-8 w-8" />
          </button>

          {selectedIndex > 0 && (
            <button
              className="absolute left-4 rounded-full p-2 text-white transition-colors hover:bg-white/10"
              onClick={(e) => {
                e.stopPropagation()
                goToPrevious()
              }}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
          )}

          {selectedIndex < photos.length - 1 && (
            <button
              className="absolute right-4 rounded-full p-2 text-white transition-colors hover:bg-white/10"
              onClick={(e) => {
                e.stopPropagation()
                goToNext()
              }}
              aria-label="Next image"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          )}

          <div
            className="relative flex h-full max-h-[90vh] w-full max-w-5xl items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-full w-full">
              <S3Image
                src={photos[selectedIndex].url}
                alt={photos[selectedIndex].caption || 'Gallery image'}
                fill
                className="object-contain"
                sizes="(max-width: 1280px) 100vw, 1280px"
              />
            </div>
            {photos[selectedIndex].caption && (
              <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                <p className="text-center text-white">{photos[selectedIndex].caption}</p>
              </div>
            )}
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 transform text-sm text-white">
            {selectedIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </section>
  )
}
