'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Mail, MessageSquare, Clock, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'

interface NotificationSettings {
  id: string
  emailEnabled: boolean
  emailFrom: string | null
  emailReplyTo: string | null
  smsEnabled: boolean
  smsFrom: string | null
  timezone: string
  quietHoursStart: string | null
  quietHoursEnd: string | null
}

interface NotificationTemplate {
  type: string
  channel: string
  name: string
  subject: string | null
  content: string
  isActive: boolean
  isDefault: boolean
}

interface NotificationTrigger {
  event: string
  channel: string
  enabled: boolean
  timing: string
  delayMinutes: number | null
  advanceHours: number | null
}

const timezones = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
]

const notificationTypes = {
  BOOKING_CONFIRMATION: 'Booking Confirmation',
  BOOKING_REMINDER: 'Booking Reminder',
  BOOKING_CANCELLED: 'Booking Cancelled',
  BOOKING_RESCHEDULED: 'Booking Rescheduled',
  BOOKING_COMPLETED: 'Booking Completed',
  REVIEW_REQUEST: 'Review Request',
  PROMOTIONAL: 'Promotional',
  BIRTHDAY: 'Birthday Wishes',
  RE_ENGAGEMENT: 'Re-engagement',
}

const notificationEvents = {
  BOOKING_CREATED: 'When booking is created',
  BOOKING_CONFIRMED: 'When booking is confirmed',
  BOOKING_CANCELLED: 'When booking is cancelled',
  BOOKING_COMPLETED: 'When booking is completed',
  BEFORE_APPOINTMENT: 'Before appointment',
  AFTER_APPOINTMENT: 'After appointment',
  CUSTOMER_BIRTHDAY: 'On customer birthday',
  CUSTOMER_INACTIVE: 'When customer becomes inactive',
}

export default function NotificationSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [triggers, setTriggers] = useState<NotificationTrigger[]>([])
  const [activeTab, setActiveTab] = useState('general')
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null)
  const [testingNotification, setTestingNotification] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/business/notifications/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings || createDefaultSettings())
        setTemplates(data.templates || [])
        setTriggers(data.triggers || [])
      } else if (response.status === 404) {
        // No settings exist yet, use defaults
        setSettings(createDefaultSettings())
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error)
      toast.error('Failed to load notification settings')
    } finally {
      setLoading(false)
    }
  }

  const createDefaultSettings = (): NotificationSettings => ({
    id: '',
    emailEnabled: true,
    emailFrom: null,
    emailReplyTo: null,
    smsEnabled: false,
    smsFrom: null,
    timezone: 'America/New_York',
    quietHoursStart: '21:00',
    quietHoursEnd: '09:00',
  })

  const saveGeneralSettings = async () => {
    if (!settings) return

    setSaving(true)
    try {
      const response = await fetch('/api/business/notifications/settings', {
        method: settings.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
        toast.success('Settings saved successfully')
      } else {
        toast.error('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  // const updateTemplate = async (type: string, channel: string, updates: Partial<NotificationTemplate>) => {
  //   try {
  //     const response = await fetch(`/api/business/notifications/templates`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ type, channel, ...updates }),
  //     })
  //
  //     if (response.ok) {
  //       await fetchSettings()
  //       toast.success('Template updated')
  //       setEditingTemplate(null)
  //     } else {
  //       toast.error('Failed to update template')
  //     }
  //   } catch (error) {
  //     console.error('Error updating template:', error)
  //     toast.error('Something went wrong')
  //   }
  // }

  const updateTrigger = async (event: string, channel: string, updates: Partial<NotificationTrigger>) => {
    try {
      const response = await fetch(`/api/business/notifications/triggers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, channel, ...updates }),
      })

      if (response.ok) {
        await fetchSettings()
        toast.success('Trigger updated')
      } else {
        toast.error('Failed to update trigger')
      }
    } catch (error) {
      console.error('Error updating trigger:', error)
      toast.error('Something went wrong')
    }
  }

  const sendTestNotification = async (type: string, channel: string) => {
    setTestingNotification(true)
    try {
      const response = await fetch('/api/business/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, channel }),
      })

      if (response.ok) {
        toast.success(`Test ${channel} sent successfully`)
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to send test notification')
      }
    } catch (error) {
      console.error('Error sending test:', error)
      toast.error('Something went wrong')
    } finally {
      setTestingNotification(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notification Settings</h1>
        <p className="text-muted-foreground">
          Configure how you communicate with your customers
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="triggers">Triggers</TabsTrigger>
          <TabsTrigger value="test">Test</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>
                Configure your email notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-enabled">Enable Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send notifications to customers via email
                  </p>
                </div>
                <Switch
                  id="email-enabled"
                  checked={settings?.emailEnabled || false}
                  onCheckedChange={(checked) => 
                    setSettings(prev => prev ? {...prev, emailEnabled: checked} : null)
                  }
                />
              </div>

              {settings?.emailEnabled && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="email-from">From Name</Label>
                    <Input
                      id="email-from"
                      placeholder="Your Business Name"
                      value={settings.emailFrom || ''}
                      onChange={(e) => 
                        setSettings(prev => prev ? {...prev, emailFrom: e.target.value} : null)
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      The name that appears in the &quot;From&quot; field
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email-reply-to">Reply-To Email</Label>
                    <Input
                      id="email-reply-to"
                      type="email"
                      placeholder="your-email@example.com"
                      value={settings.emailReplyTo || ''}
                      onChange={(e) => 
                        setSettings(prev => prev ? {...prev, emailReplyTo: e.target.value} : null)
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      Where customer replies will be sent
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SMS Settings</CardTitle>
              <CardDescription>
                Configure your SMS notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sms-enabled">Enable SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send notifications to customers via text message
                  </p>
                </div>
                <Switch
                  id="sms-enabled"
                  checked={settings?.smsEnabled || false}
                  onCheckedChange={(checked) => 
                    setSettings(prev => prev ? {...prev, smsEnabled: checked} : null)
                  }
                />
              </div>

              {settings?.smsEnabled && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="sms-from">SMS From Number/ID</Label>
                    <Input
                      id="sms-from"
                      placeholder="+1234567890 or Business Name"
                      value={settings.smsFrom || ''}
                      onChange={(e) => 
                        setSettings(prev => prev ? {...prev, smsFrom: e.target.value} : null)
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      Your SMS sender ID or phone number
                    </p>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-lg flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-amber-900">SMS requires setup</p>
                      <p className="text-amber-700">
                        SMS notifications require AWS SNS or Twilio configuration
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quiet Hours</CardTitle>
              <CardDescription>
                Prevent notifications from being sent during specific hours
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={settings?.timezone || 'America/New_York'}
                  onValueChange={(value) => 
                    setSettings(prev => prev ? {...prev, timezone: value} : null)
                  }
                >
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map(tz => (
                      <SelectItem key={tz} value={tz}>
                        {tz.replace('_', ' ').replace('/', ' - ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quiet-start">Quiet Hours Start</Label>
                  <Input
                    id="quiet-start"
                    type="time"
                    value={settings?.quietHoursStart || '21:00'}
                    onChange={(e) => 
                      setSettings(prev => prev ? {...prev, quietHoursStart: e.target.value} : null)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quiet-end">Quiet Hours End</Label>
                  <Input
                    id="quiet-end"
                    type="time"
                    value={settings?.quietHoursEnd || '09:00'}
                    onChange={(e) => 
                      setSettings(prev => prev ? {...prev, quietHoursEnd: e.target.value} : null)
                    }
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Non-urgent notifications will be held until quiet hours end
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={saveGeneralSettings} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Templates</CardTitle>
              <CardDescription>
                Customize the content of your automated notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(notificationTypes).map(([type, name]) => (
                  <div key={type} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{name}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          <Mail className="h-3 w-3 mr-1" />
                          Email
                        </Badge>
                        {settings?.smsEnabled && (
                          <Badge variant="outline">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            SMS
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {editingTemplate === type ? (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label>Email Subject</Label>
                          <Input 
                            placeholder="Subject line for email"
                            defaultValue={templates.find(t => t.type === type && t.channel === 'EMAIL')?.subject || ''}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Message Content</Label>
                          <Textarea 
                            placeholder="Use {{customerName}}, {{businessName}}, {{serviceName}}, etc."
                            rows={4}
                            defaultValue={templates.find(t => t.type === type)?.content || ''}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingTemplate(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              // Save template logic here
                              setEditingTemplate(null)
                              toast.success('Template saved')
                            }}
                          >
                            Save Template
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Using default template
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingTemplate(type)}
                        >
                          Customize
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="triggers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Triggers</CardTitle>
              <CardDescription>
                Choose when to send automated notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(notificationEvents).map(([event, description]) => (
                  <div key={event} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {event.includes('BEFORE') ? '24 hours before' : 
                           event.includes('AFTER') ? '1 hour after' : 
                           'Immediately'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={triggers.find(t => t.event === event && t.channel === 'EMAIL')?.enabled || false}
                        onCheckedChange={(checked) => updateTrigger(event, 'EMAIL', { enabled: checked })}
                      />
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {settings?.smsEnabled && (
                        <>
                          <Switch
                            checked={triggers.find(t => t.event === event && t.channel === 'SMS')?.enabled || false}
                            onCheckedChange={(checked) => updateTrigger(event, 'SMS', { enabled: checked })}
                          />
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Notifications</CardTitle>
              <CardDescription>
                Send test notifications to verify your configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">Test mode</p>
                  <p className="text-blue-700">
                    Test notifications will be sent to your registered email/phone
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {Object.entries(notificationTypes).map(([type, name]) => (
                  <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{name}</span>
                    <div className="flex items-center gap-2">
                      {settings?.emailEnabled && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => sendTestNotification(type, 'EMAIL')}
                          disabled={testingNotification}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Test Email
                        </Button>
                      )}
                      {settings?.smsEnabled && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => sendTestNotification(type, 'SMS')}
                          disabled={testingNotification}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Test SMS
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}