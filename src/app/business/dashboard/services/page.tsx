'use client'

import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation' // Commented out - may be used later
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, Clock, DollarSign, Package, MoreHorizontal, Edit, Trash2, Power } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

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
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Services</h1>
          <p className="text-gray-600 mt-1">
            Manage the services you offer to customers
          </p>
        </div>
        {!showAddForm && (
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        )}
      </div>

      {/* Add/Edit Service Form */}
      {showAddForm && (
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              {editingService ? 'Edit Service' : 'Add New Service'}
            </CardTitle>
            <CardDescription>
              Fill in the details for your service
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Service Name</Label>
                  <Input
                    {...register('name')}
                    id="name"
                    placeholder="e.g., Classic Haircut"
                    className="border-gray-300"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    {...register('category')}
                    id="category"
                    placeholder="e.g., Hair, Nails, Spa"
                    className="border-gray-300"
                  />
                  {errors.category && (
                    <p className="text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      {...register('price')}
                      id="price"
                      placeholder="50.00"
                      className="pl-10 border-gray-300"
                    />
                  </div>
                  {errors.price && (
                    <p className="text-sm text-red-600">{errors.price.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      {...register('duration')}
                      id="duration"
                      placeholder="60"
                      className="pl-10 border-gray-300"
                    />
                  </div>
                  {errors.duration && (
                    <p className="text-sm text-red-600">{errors.duration.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  {...register('description')}
                  id="description"
                  placeholder="Describe what this service includes..."
                  rows={3}
                  className="border-gray-300 resize-none"
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
                  className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingService ? 'Update Service' : 'Add Service'}
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
            <Card key={service.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-all">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {service.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {service.category}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={
                          service.isActive
                            ? 'border-green-200 bg-green-50 text-green-700'
                            : 'border-gray-200 bg-gray-50 text-gray-700'
                        }
                      >
                        {service.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => startEdit(service)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => toggleServiceStatus(service.id, service.isActive)}
                      >
                        <Power className="mr-2 h-4 w-4" />
                        {service.isActive ? 'Deactivate' : 'Activate'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => deleteService(service.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                {service.description && (
                  <p className="text-sm text-gray-600 mb-4">{service.description}</p>
                )}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-gray-900 font-medium">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span>{service.price}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{service.duration} min</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full border-2 border-dashed border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No services added yet</h3>
              <p className="text-sm text-gray-500 mb-4">
                Add your first service to start receiving bookings
              </p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Service
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}