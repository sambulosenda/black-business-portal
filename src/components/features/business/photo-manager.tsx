'use client'

import { useCallback, useEffect, useState } from 'react'
import { Edit2, ImageIcon, Loader2, Star, Trash2 } from 'lucide-react'
// import { Badge } from '@/components/ui/badge' // Commented out - may be used later
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ImageUpload } from '@/components/ui/image-upload'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { S3Image } from '@/components/ui/s3-image'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PhotoType } from '@prisma/client'

// import { cn } from '@/lib/utils' // Commented out - may be used later

interface Photo {
  id: string
  url: string
  type: PhotoType
  caption: string | null
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface PhotoManagerProps {
  businessId: string
}

export default function PhotoManager({ businessId }: PhotoManagerProps) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null)
  const [editForm, setEditForm] = useState<{
    type: PhotoType
    caption: string
    order: number
  }>({
    type: PhotoType.GALLERY,
    caption: '',
    order: 0,
  })

  const fetchPhotos = useCallback(async () => {
    try {
      const response = await fetch(`/api/business/photos?businessId=${businessId}`)
      if (!response.ok) throw new Error('Failed to fetch photos')
      const data = await response.json()
      setPhotos(data.photos)
    } catch {
      toast.error('Failed to load photos')
    } finally {
      setLoading(false)
    }
  }, [businessId])

  useEffect(() => {
    fetchPhotos()
  }, [fetchPhotos])

  const handleUploadComplete = () => {
    fetchPhotos()
  }

  const handleSetAsHero = async (photo: Photo) => {
    try {
      const response = await fetch('/api/business/photos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoId: photo.id,
          type: PhotoType.HERO,
        }),
      })

      if (!response.ok) throw new Error('Failed to update photo')

      await fetchPhotos()
      toast.success('Hero image updated')
    } catch {
      toast.error('Failed to update photo')
    }
  }

  const handleEditPhoto = async () => {
    if (!editingPhoto) return

    try {
      const response = await fetch('/api/business/photos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoId: editingPhoto.id,
          ...editForm,
        }),
      })

      if (!response.ok) throw new Error('Failed to update photo')

      await fetchPhotos()
      setEditingPhoto(null)
      toast.success('Photo updated')
    } catch {
      toast.error('Failed to update photo')
    }
  }

  const handleDeletePhoto = async (photo: Photo) => {
    if (!confirm('Are you sure you want to delete this photo?')) return

    try {
      // Delete photo (API will handle S3 deletion)
      const response = await fetch(`/api/business/photos?photoId=${photo.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete photo')

      await fetchPhotos()
      toast.success('Photo deleted')
    } catch {
      toast.error('Failed to delete photo')
    }
  }

  const heroPhoto = photos.find((p) => p.type === PhotoType.HERO)
  const galleryPhotos = photos.filter((p) => p.type === PhotoType.GALLERY)
  const logoPhoto = photos.find((p) => p.type === PhotoType.LOGO)

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Business Photos</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="hero" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="hero">Hero Image</TabsTrigger>
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
              <TabsTrigger value="logo">Logo</TabsTrigger>
            </TabsList>

            <TabsContent value="hero" className="space-y-4">
              <div className="mb-4 text-sm text-gray-600">
                The hero image is the main image displayed on your business profile page.
              </div>

              {heroPhoto ? (
                <div className="group relative">
                  <div className="relative aspect-[16/9] overflow-hidden rounded-lg border border-gray-200">
                    <S3Image src={heroPhoto.url} alt="Hero image" fill className="object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingPhoto(heroPhoto)
                          setEditForm({
                            type: heroPhoto.type,
                            caption: heroPhoto.caption || '',
                            order: heroPhoto.order,
                          })
                        }}
                      >
                        <Edit2 className="mr-1 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeletePhoto(heroPhoto)}
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                  {heroPhoto.caption && (
                    <p className="mt-2 text-sm text-gray-600">{heroPhoto.caption}</p>
                  )}
                </div>
              ) : (
                <ImageUpload
                  businessId={businessId}
                  onUploadComplete={handleUploadComplete}
                  className="h-64"
                />
              )}

              {galleryPhotos.length > 0 && !heroPhoto && (
                <div className="mt-6">
                  <h4 className="mb-3 text-sm font-medium text-gray-700">
                    Or choose from your gallery:
                  </h4>
                  <div className="grid grid-cols-4 gap-3">
                    {galleryPhotos.slice(0, 8).map((photo) => (
                      <div
                        key={photo.id}
                        className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg border-2 border-gray-200 transition-colors hover:border-indigo-500"
                        onClick={() => handleSetAsHero(photo)}
                      >
                        <S3Image
                          src={photo.url}
                          alt="Gallery image"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                          <Star className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="gallery" className="space-y-4">
              <div className="mb-4 text-sm text-gray-600">
                Gallery photos showcase your business, services, and atmosphere.
              </div>

              <ImageUpload
                businessId={businessId}
                onUploadComplete={handleUploadComplete}
                className="mb-6 h-48"
              />

              {galleryPhotos.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {galleryPhotos.map((photo) => (
                    <div key={photo.id} className="group relative">
                      <div className="relative aspect-square overflow-hidden rounded-lg border border-gray-200">
                        <S3Image
                          src={photo.url}
                          alt="Gallery image"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => handleSetAsHero(photo)}
                            title="Set as hero image"
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => {
                              setEditingPhoto(photo)
                              setEditForm({
                                type: photo.type,
                                caption: photo.caption || '',
                                order: photo.order,
                              })
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            className="h-8 w-8"
                            onClick={() => handleDeletePhoto(photo)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <ImageIcon className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                  <p>No gallery photos yet</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="logo" className="space-y-4">
              <div className="mb-4 text-sm text-gray-600">
                Your business logo will be displayed alongside your business name.
              </div>

              {logoPhoto ? (
                <div className="flex items-center gap-6">
                  <div className="group relative h-32 w-32 overflow-hidden rounded-lg border border-gray-200">
                    <S3Image
                      src={logoPhoto.url}
                      alt="Business logo"
                      fill
                      className="object-contain p-2"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeletePhoto(logoPhoto)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">
                      Recommended: Square image, at least 400x400px
                    </p>
                  </div>
                </div>
              ) : (
                <ImageUpload
                  businessId={businessId}
                  onUploadComplete={handleUploadComplete}
                  className="h-48 max-w-md"
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Edit Photo Dialog */}
      <Dialog open={!!editingPhoto} onOpenChange={() => setEditingPhoto(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Photo</DialogTitle>
            <DialogDescription>Update photo details and settings</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="type">Photo Type</Label>
              <Select
                value={editForm.type}
                onValueChange={(value) => setEditForm({ ...editForm, type: value as PhotoType })}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PhotoType.HERO}>Hero Image</SelectItem>
                  <SelectItem value={PhotoType.GALLERY}>Gallery</SelectItem>
                  <SelectItem value={PhotoType.LOGO}>Logo</SelectItem>
                  <SelectItem value={PhotoType.BANNER}>Banner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="caption">Caption (optional)</Label>
              <Input
                id="caption"
                value={editForm.caption}
                onChange={(e) => setEditForm({ ...editForm, caption: e.target.value })}
                placeholder="Add a caption to this photo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                value={editForm.order}
                onChange={(e) => setEditForm({ ...editForm, order: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPhoto(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditPhoto}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
