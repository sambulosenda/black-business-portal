'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  ArrowLeft, User, Calendar, DollarSign, MessageSquare, 
  Phone, Mail, Loader2, Edit, Save, X, Plus, Crown, Ban,
  Clock, AlertCircle, Send
} from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

interface CustomerDetails extends CustomerProfile {
  bookings: Booking[]
  communications: Communication[]
}

interface CustomerProfile {
  id: string
  userId: string
  customerName: string
  customerEmail: string
  customerPhone: string | null
  firstVisit: string | null
  lastVisit: string | null
  totalVisits: number
  totalSpent: number
  averageSpent: number
  favoriteService: string | null
  notes: string | null
  tags: string[]
  birthday: string | null
  isVip: boolean
  isBlocked: boolean
  createdAt: string
  updatedAt: string
}

interface Booking {
  id: string
  date: string
  startTime: string
  endTime: string
  status: string
  totalPrice: number
  service: {
    name: string
  }
  staff?: {
    name: string
  } | null
}

interface Communication {
  id: string
  type: string
  subject: string | null
  content: string
  sentAt: string
  readAt: string | null
  staff?: {
    name: string
  } | null
}

export default function CustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const customerId = params.customerId as string
  
  const [customer, setCustomer] = useState<CustomerDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingNotes, setEditingNotes] = useState(false)
  const [notes, setNotes] = useState('')
  const [newTag, setNewTag] = useState('')
  const [showMessageDialog, setShowMessageDialog] = useState(false)
  const [messageContent, setMessageContent] = useState('')
  const [messageSubject, setMessageSubject] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)

  useEffect(() => {
    if (customerId) {
      fetchCustomerDetails()
    }
  }, [customerId])

  const fetchCustomerDetails = async () => {
    try {
      const response = await fetch(`/api/business/customers/${customerId}`)
      if (response.ok) {
        const data = await response.json()
        setCustomer(data.customer)
        setNotes(data.customer.notes || '')
      } else {
        toast.error('Failed to fetch customer details')
        router.push('/business/dashboard/customers')
      }
    } catch (error) {
      console.error('Error fetching customer:', error)
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const updateCustomer = async (updates: Partial<CustomerProfile>) => {
    try {
      const response = await fetch(`/api/business/customers/${customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const data = await response.json()
        setCustomer(data.customer)
        toast.success('Customer updated')
      } else {
        toast.error('Failed to update customer')
      }
    } catch (error) {
      console.error('Error updating customer:', error)
      toast.error('Something went wrong')
    }
  }

  const saveNotes = async () => {
    await updateCustomer({ notes })
    setEditingNotes(false)
  }

  const toggleVipStatus = async () => {
    if (!customer) return
    await updateCustomer({ isVip: !customer.isVip })
  }

  const toggleBlockStatus = async () => {
    if (!customer) return
    if (!confirm(`Are you sure you want to ${customer.isBlocked ? 'unblock' : 'block'} this customer?`)) {
      return
    }
    await updateCustomer({ isBlocked: !customer.isBlocked })
  }

  const addTag = async () => {
    if (!customer || !newTag.trim()) return
    
    const updatedTags = [...customer.tags, newTag.trim()]
    await updateCustomer({ tags: updatedTags })
    setNewTag('')
  }

  const removeTag = async (tagToRemove: string) => {
    if (!customer) return
    
    const updatedTags = customer.tags.filter(tag => tag !== tagToRemove)
    await updateCustomer({ tags: updatedTags })
  }

  const sendMessage = async () => {
    if (!messageContent.trim()) return
    
    setSendingMessage(true)
    try {
      const response = await fetch(`/api/business/customers/${customerId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'NOTE', // For now, just notes. Later can add EMAIL/SMS
          subject: messageSubject,
          content: messageContent,
        }),
      })

      if (response.ok) {
        toast.success('Message sent')
        setShowMessageDialog(false)
        setMessageSubject('')
        setMessageContent('')
        fetchCustomerDetails() // Refresh to show new communication
      } else {
        toast.error('Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Something went wrong')
    } finally {
      setSendingMessage(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p>Customer not found</p>
      </div>
    )
  }

  const daysSinceLastVisit = customer.lastVisit 
    ? Math.floor((new Date().getTime() - new Date(customer.lastVisit).getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/business/dashboard/customers')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback>
                {customer.customerName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{customer.customerName}</h1>
                {customer.isVip && <Crown className="h-5 w-5 text-purple-600" />}
                {customer.isBlocked && <Ban className="h-5 w-5 text-red-600" />}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {customer.customerEmail}
                </span>
                {customer.customerPhone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {customer.customerPhone}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={customer.isVip ? "default" : "outline"}
            size="sm"
            onClick={toggleVipStatus}
          >
            <Crown className="h-4 w-4 mr-2" />
            {customer.isVip ? 'VIP' : 'Make VIP'}
          </Button>
          <Button
            variant={customer.isBlocked ? "destructive" : "outline"}
            size="sm"
            onClick={toggleBlockStatus}
          >
            <Ban className="h-4 w-4 mr-2" />
            {customer.isBlocked ? 'Blocked' : 'Block'}
          </Button>
          <Button onClick={() => setShowMessageDialog(true)}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Message
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${customer.totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              ${customer.averageSpent.toFixed(2)} per visit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customer.totalVisits}</div>
            <p className="text-xs text-muted-foreground">
              {customer.favoriteService || 'No favorite yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Visit</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {daysSinceLastVisit !== null ? `${daysSinceLastVisit}d` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {customer.lastVisit ? format(new Date(customer.lastVisit), 'MMM d, yyyy') : 'No visits yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Since</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {format(new Date(customer.createdAt), 'MMM yyyy')}
            </div>
            <p className="text-xs text-muted-foreground">
              {customer.firstVisit ? format(new Date(customer.firstVisit), 'MMM d, yyyy') : 'First visit pending'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">Bookings ({customer.bookings.length})</TabsTrigger>
          <TabsTrigger value="communications">Communications ({customer.communications.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Notes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Notes</CardTitle>
                {editingNotes ? (
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={saveNotes}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setNotes(customer.notes || '')
                        setEditingNotes(false)
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setEditingNotes(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
              <CardDescription>
                Private notes about this customer
              </CardDescription>
            </CardHeader>
            <CardContent>
              {editingNotes ? (
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about customer preferences, special requests, etc..."
                  rows={4}
                />
              ) : (
                <p className={notes ? '' : 'text-muted-foreground'}>
                  {notes || 'No notes yet'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>
                Organize customers with tags
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {customer.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="pl-3 pr-1">
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button onClick={addTag} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Birthday</Label>
                <p className="font-medium">
                  {customer.birthday 
                    ? format(new Date(customer.birthday), 'MMMM d')
                    : 'Not set'
                  }
                </p>
              </div>
              {daysSinceLastVisit && daysSinceLastVisit > 60 && (
                <div className="p-3 bg-yellow-50 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-900">At Risk Customer</p>
                    <p className="text-yellow-700">
                      Hasn&apos;t visited in {daysSinceLastVisit} days. Consider reaching out.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>Booking History</CardTitle>
              <CardDescription>
                All appointments with your business
              </CardDescription>
            </CardHeader>
            <CardContent>
              {customer.bookings.length > 0 ? (
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-3">
                    {customer.bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div>
                          <p className="font-medium">{booking.service.name}</p>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(booking.date), 'MMM d, yyyy')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(booking.startTime), 'h:mm a')}
                            </span>
                            {booking.staff && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {booking.staff.name}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${booking.totalPrice.toFixed(2)}</p>
                          <Badge
                            variant={
                              booking.status === 'COMPLETED' ? 'success' :
                              booking.status === 'CONFIRMED' ? 'default' :
                              booking.status === 'CANCELLED' ? 'destructive' :
                              'outline'
                            }
                          >
                            {booking.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  No bookings yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communications">
          <Card>
            <CardHeader>
              <CardTitle>Communication History</CardTitle>
              <CardDescription>
                All messages and notes for this customer
              </CardDescription>
            </CardHeader>
            <CardContent>
              {customer.communications.length > 0 ? (
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-3">
                    {customer.communications.map((comm) => (
                      <div key={comm.id} className="p-4 rounded-lg border">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {comm.type}
                            </Badge>
                            {comm.subject && (
                              <span className="font-medium">{comm.subject}</span>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(comm.sentAt), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{comm.content}</p>
                        {comm.staff && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Sent by {comm.staff.name}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  No communications yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
            <DialogDescription>
              Send a message or note about {customer.customerName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject (optional)</Label>
              <Input
                id="subject"
                value={messageSubject}
                onChange={(e) => setMessageSubject(e.target.value)}
                placeholder="e.g., Follow-up, Special offer"
              />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Type your message here..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMessageDialog(false)}>
              Cancel
            </Button>
            <Button onClick={sendMessage} disabled={sendingMessage}>
              {sendingMessage ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}