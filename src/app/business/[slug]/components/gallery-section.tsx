'use client'

import { useState } from 'react'
import { S3Image } from '@/components/ui/s3-image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface GallerySectionProps {
  photos: Array<{
    id: string;
    imageUrl: string;
    caption: string | null;
  }>
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gallery</h2>
          <p className="text-gray-600 mt-1">See our space and work</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            onClick={() => openLightbox(index)}
            className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 hover:shadow-lg transition-all duration-200"
          >
            <S3Image
              src={photo.url}
              alt={photo.caption || 'Gallery image'}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
          </button>
        ))}
      </div>
      
      {selectedIndex !== null && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 text-white hover:bg-white/10 rounded-full p-2 transition-colors"
            onClick={closeLightbox}
            aria-label="Close gallery"
          >
            <X className="h-8 w-8" />
          </button>
          
          {selectedIndex > 0 && (
            <button
              className="absolute left-4 text-white hover:bg-white/10 rounded-full p-2 transition-colors"
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
              className="absolute right-4 text-white hover:bg-white/10 rounded-full p-2 transition-colors"
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
            className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full">
              <S3Image
                src={photos[selectedIndex].url}
                alt={photos[selectedIndex].caption || 'Gallery image'}
                fill
                className="object-contain"
                sizes="(max-width: 1280px) 100vw, 1280px"
              />
            </div>
            {photos[selectedIndex].caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                <p className="text-white text-center">{photos[selectedIndex].caption}</p>
              </div>
            )}
          </div>
          
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
            {selectedIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </section>
  )
}