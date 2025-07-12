'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Plus, User, Mail, Phone, Shield, Calendar, Clock, Edit, Trash2, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"

const staffSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  role: z.enum(['STAFF', 'MANAGER', 'OWNER']),
  canManageBookings: z.boolean(),
  canManageStaff: z.boolean(),
})

type StaffFormData = z.infer<typeof staffSchema>

interface Staff {
  id: string
  name: string
  email: string
  phone: string | null
  role: string
  isActive: boolean
  canManageBookings: boolean
  canManageStaff: boolean
  profileImage: string | null
  bio: string | null
  createdAt: string
  services?: { service: { id: string; name: string } }[]
  schedules?: { dayOfWeek: number; startTime: string; endTime: string; isActive: boolean }[]
}

interface Service {
  id: string
  name: string
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [selectedServices, setSelectedServices] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      role: 'STAFF',
      canManageBookings: true,
      canManageStaff: false,
    }
  })

  const watchRole = watch('role')

  useEffect(() => {
    fetchStaff()
    fetchServices()
  }, [])

  useEffect(() => {
    // Auto-set permissions based on role
    if (watchRole === 'OWNER') {
      setValue('canManageBookings', true)
      setValue('canManageStaff', true)
    } else if (watchRole === 'MANAGER') {
      setValue('canManageBookings', true)
      setValue('canManageStaff', true)
    } else {
      setValue('canManageStaff', false)
    }
  }, [watchRole, setValue])

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/business/staff')
      if (response.ok) {
        const data = await response.json()
        setStaff(data.staff)
      } else {
        toast.error('Failed to fetch staff')
      }
    } catch (error) {
      console.error('Error fetching staff:', error)
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/business/services')
      if (response.ok) {
        const data = await response.json()
        setServices(data.services.filter((s: Service & { isActive: boolean }) => s.isActive))
      }
    } catch (error) {
      console.error('Error fetching services:', error)
    }
  }

  const onSubmit = async (data: StaffFormData) => {
    try {
      const url = editingStaff
        ? `/api/business/staff/${editingStaff.id}`
        : '/api/business/staff'
      const method = editingStaff ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          services: selectedServices,
        }),
      })

      if (response.ok) {
        await fetchStaff()
        setShowAddDialog(false)
        setEditingStaff(null)
        setSelectedServices([])
        reset()
        toast.success(editingStaff ? 'Staff member updated' : 'Staff member added')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to save staff member')
      }
    } catch (error) {
      console.error('Error saving staff:', error)
      toast.error('Something went wrong')
    }
  }

  const toggleStaffStatus = async (staffId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/business/staff/${staffId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (response.ok) {
        await fetchStaff()
        toast.success(`Staff member ${isActive ? 'deactivated' : 'activated'}`)
      } else {
        toast.error('Failed to update staff status')
      }
    } catch (error) {
      console.error('Error toggling staff status:', error)
      toast.error('Something went wrong')
    }
  }

  const deleteStaff = async (staffId: string) => {
    if (!confirm('Are you sure you want to remove this staff member?')) return

    try {
      const response = await fetch(`/api/business/staff/${staffId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchStaff()
        toast.success('Staff member removed')
      } else {
        toast.error('Failed to remove staff member')
      }
    } catch (error) {
      console.error('Error deleting staff:', error)
      toast.error('Something went wrong')
    }
  }

  const startEdit = (member: Staff) => {
    setEditingStaff(member)
    setValue('name', member.name)
    setValue('email', member.email)
    setValue('phone', member.phone || '')
    setValue('role', member.role as 'STAFF' | 'MANAGER' | 'OWNER')
    setValue('canManageBookings', member.canManageBookings)
    setValue('canManageStaff', member.canManageStaff)
    setSelectedServices(member.services?.map(s => s.service.id) || [])
    setShowAddDialog(true)
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'destructive'
      case 'MANAGER':
        return 'default'
      default:
        return 'secondary'
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Staff Management</h1>
          <p className="text-gray-600 mt-1">Manage your team members and their permissions</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800">
          <Plus className="h-4 w-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      {/* Staff List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {staff.map((member) => (
          <Card key={member.id} className={`border border-gray-200 shadow-sm hover:shadow-md transition-all ${!member.isActive ? 'opacity-60' : ''}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.profileImage || ''} />
                    <AvatarFallback>
                      {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-900">{member.name}</h3>
                    <Badge 
                      variant="outline" 
                      className={`mt-1 ${
                        member.role === 'OWNER' ? 'border-red-200 bg-red-50 text-red-700' :
                        member.role === 'MANAGER' ? 'border-indigo-200 bg-indigo-50 text-indigo-700' :
                        'border-gray-200 bg-gray-50 text-gray-700'
                      }`}
                    >
                      {member.role}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedStaff(member)}
                  className="hover:bg-gray-100"
                >
                  View
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-3 w-3 text-gray-400" />
                  <span className="truncate text-sm">{member.email}</span>
                </div>
                {member.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-3 w-3 text-gray-400" />
                    <span className="text-sm">{member.phone}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {member.canManageBookings && (
                  <Badge variant="outline" className="text-xs border-blue-200 bg-blue-50 text-blue-700">
                    <Calendar className="h-3 w-3 mr-1" />
                    Manage Bookings
                  </Badge>
                )}
                {member.canManageStaff && (
                  <Badge variant="outline" className="text-xs border-purple-200 bg-purple-50 text-purple-700">
                    <Shield className="h-3 w-3 mr-1" />
                    Manage Staff
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  {member.isActive ? (
                    <Badge variant="outline" className="text-xs border-green-200 bg-green-50 text-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs border-red-200 bg-red-50 text-red-700">
                      <XCircle className="h-3 w-3 mr-1" />
                      Inactive
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(member)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleStaffStatus(member.id, member.isActive)}
                  >
                    {member.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {staff.length === 0 && (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No staff members yet</h3>
            <p className="text-gray-600 text-center mb-4">
              Add your first team member to get started
            </p>
            <Button onClick={() => setShowAddDialog(true)} className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800">
              <Plus className="h-4 w-4 mr-2" />
              Add Staff Member
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Staff Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => {
        setShowAddDialog(open)
        if (!open) {
          setEditingStaff(null)
          setSelectedServices([])
          reset()
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
            </DialogTitle>
            <DialogDescription>
              Enter the details of your team member
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    {...register('name')}
                    id="name"
                    placeholder="John Doe"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    {...register('email')}
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input
                    {...register('phone')}
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={watch('role')}
                    onValueChange={(value) => setValue('role', value as 'STAFF' | 'MANAGER' | 'OWNER')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STAFF">Staff</SelectItem>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                      <SelectItem value="OWNER">Owner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Permissions</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      {...register('canManageBookings')}
                      id="canManageBookings"
                      checked={watch('canManageBookings')}
                      onCheckedChange={(checked) => setValue('canManageBookings', checked as boolean)}
                      disabled={watchRole === 'OWNER' || watchRole === 'MANAGER'}
                    />
                    <Label
                      htmlFor="canManageBookings"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Can manage bookings (view, confirm, cancel)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      {...register('canManageStaff')}
                      id="canManageStaff"
                      checked={watch('canManageStaff')}
                      onCheckedChange={(checked) => setValue('canManageStaff', checked as boolean)}
                      disabled={watchRole === 'OWNER'}
                    />
                    <Label
                      htmlFor="canManageStaff"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Can manage other staff members
                    </Label>
                  </div>
                </div>
              </div>

              {services.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-gray-900">Services</Label>
                  <p className="text-sm text-gray-600">
                    Select which services this staff member can perform
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {services.map((service) => (
                      <div key={service.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`service-${service.id}`}
                          checked={selectedServices.includes(service.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedServices([...selectedServices, service.id])
                            } else {
                              setSelectedServices(selectedServices.filter(id => id !== service.id))
                            }
                          }}
                        />
                        <Label
                          htmlFor={`service-${service.id}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {service.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                className="hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800">
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingStaff ? 'Update' : 'Add'} Staff Member
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Staff Details Dialog */}
      {selectedStaff && (
        <Dialog open={!!selectedStaff} onOpenChange={() => setSelectedStaff(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Staff Member Details</DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="info" className="mt-4">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100">
                <TabsTrigger value="info" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600">Information</TabsTrigger>
                <TabsTrigger value="services" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600">Services</TabsTrigger>
                <TabsTrigger value="schedule" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600">Schedule</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedStaff.profileImage || ''} />
                    <AvatarFallback>
                      {selectedStaff.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedStaff.name}</h3>
                    <Badge 
                      variant="outline"
                      className={`${
                        selectedStaff.role === 'OWNER' ? 'border-red-200 bg-red-50 text-red-700' :
                        selectedStaff.role === 'MANAGER' ? 'border-indigo-200 bg-indigo-50 text-indigo-700' :
                        'border-gray-200 bg-gray-50 text-gray-700'
                      }`}
                    >
                      {selectedStaff.role}
                    </Badge>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-sm text-gray-500">Email</Label>
                    <p className="font-medium text-gray-900">{selectedStaff.email}</p>
                  </div>
                  {selectedStaff.phone && (
                    <div>
                      <Label className="text-sm text-gray-500">Phone</Label>
                      <p className="font-medium text-gray-900">{selectedStaff.phone}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm text-gray-500">Status</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {selectedStaff.isActive ? (
                        <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Joined</Label>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedStaff.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-gray-500">Permissions</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedStaff.canManageBookings && (
                      <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                        <Calendar className="h-3 w-3 mr-1" />
                        Manage Bookings
                      </Badge>
                    )}
                    {selectedStaff.canManageStaff && (
                      <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700">
                        <Shield className="h-3 w-3 mr-1" />
                        Manage Staff
                      </Badge>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="services">
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Services this staff member can perform
                  </p>
                  {selectedStaff.services && selectedStaff.services.length > 0 ? (
                    <div className="grid gap-2">
                      {selectedStaff.services.map((item) => (
                        <div
                          key={item.service.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50"
                        >
                          <span className="font-medium text-gray-900">{item.service.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-gray-500">
                      No services assigned yet
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="schedule">
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Working hours for this staff member
                  </p>
                  {selectedStaff.schedules && selectedStaff.schedules.length > 0 ? (
                    <div className="grid gap-2">
                      {dayNames.map((day, index) => {
                        const schedule = selectedStaff.schedules?.find(s => s.dayOfWeek === index)
                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50"
                          >
                            <span className="font-medium text-gray-900">{day}</span>
                            {schedule && schedule.isActive ? (
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-3 w-3" />
                                {schedule.startTime} - {schedule.endTime}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">Off</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-gray-500">
                      No schedule set yet
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedStaff(null)} className="hover:bg-gray-50">
                Close
              </Button>
              <Button onClick={() => {
                startEdit(selectedStaff)
                setSelectedStaff(null)
              }} className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800">
                <Edit className="h-4 w-4 mr-2" />
                Edit Staff Member
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}