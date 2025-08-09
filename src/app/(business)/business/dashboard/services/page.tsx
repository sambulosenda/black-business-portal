'use client'

import { useEffect, useState } from 'react'
import {
  Clock,
  DollarSign,
  Edit,
  Loader2,
  MoreHorizontal,
  Package,
  Plus,
  Power,
  Trash2,
} from 'lucide-react'
// import { useRouter } from 'next/navigation' // Commented out - may be used later
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'

const serviceSchema = z.object({
  name: z.string().min(2, 'Service name must be at least 2 characters'),
  description: z.string().optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format'),
  duration: z.string().regex(/^\d+$/, 'Duration must be a number'),
  category: z.string().min(1, 'Category is required'),
})

type ServiceFormData = z.infer<typeof serviceSchema>

interface Service {
  id: string
  name: string
  description: string | null
  price: string
  duration: number
  category: string
  isActive: boolean
}

export default function ServicesPage() {
  // const router = useRouter() // Commented out - may be used later
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
  })

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/business/services')
      if (response.ok) {
        const data = await response.json()
        setServices(data.services)
      }
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: ServiceFormData) => {
    try {
      const url = editingService
        ? `/api/business/services/${editingService.id}`
        : '/api/business/services'
      const method = editingService ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          price: parseFloat(data.price),
          duration: parseInt(data.duration),
        }),
      })

      if (response.ok) {
        await fetchServices()
        setShowAddForm(false)
        setEditingService(null)
        reset()
      }
    } catch (error) {
      console.error('Error saving service:', error)
    }
  }

  const toggleServiceStatus = async (serviceId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/business/services/${serviceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (response.ok) {
        await fetchServices()
      }
    } catch (error) {
      console.error('Error toggling service status:', error)
    }
  }

  const deleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return

    try {
      const response = await fetch(`/api/business/services/${serviceId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchServices()
      }
    } catch (error) {
      console.error('Error deleting service:', error)
    }
  }

  const startEdit = (service: Service) => {
    setEditingService(service)
    setValue('name', service.name)
    setValue('description', service.description || '')
    setValue('price', service.price)
    setValue('duration', service.duration.toString())
    setValue('category', service.category)
    setShowAddForm(true)
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Services</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your service offerings</p>
        </div>
        {!showAddForm && (
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-gray-900 text-white hover:bg-gray-800"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </Button>
        )}
      </div>

      {/* Add/Edit Service Form */}
      {showAddForm && (
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-base font-medium">
              {editingService ? 'Edit Service' : 'New Service'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm text-gray-600">Name</Label>
                  <Input
                    {...register('name')}
                    id="name"
                    placeholder="Service name"
                    className="border-gray-200"
                  />
                  {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm text-gray-600">Category</Label>
                  <Input
                    {...register('category')}
                    id="category"
                    placeholder="Category"
                    className="border-gray-200"
                  />
                  {errors.category && (
                    <p className="text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm text-gray-600">Price</Label>
                  <div className="relative">
                    <DollarSign className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      {...register('price')}
                      id="price"
                      placeholder="0.00"
                      className="border-gray-200 pl-10"
                    />
                  </div>
                  {errors.price && <p className="text-sm text-red-600">{errors.price.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-sm text-gray-600">Duration (minutes)</Label>
                  <div className="relative">
                    <Clock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      {...register('duration')}
                      id="duration"
                      placeholder="30"
                      className="border-gray-200 pl-10"
                    />
                  </div>
                  {errors.duration && (
                    <p className="text-sm text-red-600">{errors.duration.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm text-gray-600">Description</Label>
                <Textarea
                  {...register('description')}
                  id="description"
                  placeholder="Service description (optional)"
                  rows={3}
                  className="resize-none border-gray-200"
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingService(null)
                    reset()
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gray-900 text-white hover:bg-gray-800"
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingService ? 'Update' : 'Add'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Services Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.length > 0 ? (
          services.map((service) => (
            <Card
              key={service.id}
              className="border border-gray-200"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base font-medium text-gray-900">
                      {service.name}
                    </CardTitle>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs text-gray-500">{service.category}</span>
                      {!service.isActive && (
                        <span className="text-xs text-gray-400">Inactive</span>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4 text-gray-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => startEdit(service)} className="text-sm">
                        <Edit className="mr-2 h-3 w-3" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => toggleServiceStatus(service.id, service.isActive)}
                        className="text-sm"
                      >
                        <Power className="mr-2 h-3 w-3" />
                        {service.isActive ? 'Deactivate' : 'Activate'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => deleteService(service.id)}
                        className="text-sm text-gray-600"
                      >
                        <Trash2 className="mr-2 h-3 w-3" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                {service.description && (
                  <p className="mb-3 text-sm text-gray-600 line-clamp-2">{service.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-gray-900">
                    ${service.price}
                  </span>
                  <span className="text-sm text-gray-500">
                    {service.duration} min
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full border-2 border-dashed border-gray-200">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="mb-3 h-10 w-10 text-gray-300" />
              <h3 className="mb-1 text-base font-medium text-gray-700">No services yet</h3>
              <p className="mb-4 text-sm text-gray-500">
                Add your first service to get started
              </p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-gray-900 text-white hover:bg-gray-800"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Service
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
