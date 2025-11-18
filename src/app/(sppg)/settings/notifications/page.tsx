/**
 * SPPG Notification Settings Page
 * Configure WhatsApp & Email notification providers
 * 
 * @version Next.js 15.5.4 / Auth.js v5
 * @author Bagizi-ID Development Team
 */

'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  NotificationProviderCard,
  WhatsAppProviderForm,
  EmailProviderForm,
} from '@/features/sppg/notifications/components'
import { Bell, Settings, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

// Types
interface NotificationProvider {
  id: string
  type: 'WHATSAPP' | 'EMAIL'
  name: string
  provider: string
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR'
  isEnabled: boolean
  apiKey?: string
  senderNumber?: string
  fromEmail?: string
  lastUsed?: Date
  totalSent?: number
  successRate?: number
  errorMessage?: string
}

interface WhatsAppConfigData {
  provider: 'FONNTE' | 'TWILIO' | 'WABA'
  apiKey: string
  senderNumber: string
  accountSid?: string
  authToken?: string
  wabaId?: string
  apiUrl?: string
}

interface EmailConfigData {
  provider: 'RESEND' | 'SENDGRID' | 'SES'
  apiKey: string
  fromEmail: string
  fromName: string
  replyToEmail?: string
  sendGridApiUrl?: string
  awsRegion?: string
  awsAccessKeyId?: string
  awsSecretAccessKey?: string
}

export default function NotificationSettingsPage() {
  const [providers, setProviders] = useState<NotificationProvider[]>([
    {
      id: '1',
      type: 'WHATSAPP',
      name: 'WhatsApp Fonnte',
      provider: 'FONNTE',
      status: 'ACTIVE',
      isEnabled: true,
      apiKey: 'configured',
      senderNumber: '628123456789',
      lastUsed: new Date(),
      totalSent: 1234,
      successRate: 98.5,
    },
    {
      id: '2',
      type: 'EMAIL',
      name: 'Email Resend',
      provider: 'RESEND',
      status: 'ACTIVE',
      isEnabled: true,
      apiKey: 'configured',
      fromEmail: 'noreply@sppg.id',
      lastUsed: new Date(),
      totalSent: 567,
      successRate: 99.2,
    },
  ])

  const [configureDialog, setConfigureDialog] = useState<{
    open: boolean
    type: 'WHATSAPP' | 'EMAIL' | null
    provider: NotificationProvider | null
  }>({
    open: false,
    type: null,
    provider: null,
  })

  // Handle toggle enable/disable provider
  const handleToggleProvider = async (providerId: string) => {
    try {
      // TODO: Call API to toggle provider
      await new Promise((resolve) => setTimeout(resolve, 500))

      setProviders((prev) =>
        prev.map((p) =>
          p.id === providerId ? { ...p, isEnabled: !p.isEnabled } : p
        )
      )

      toast.success('Provider status updated successfully')
    } catch {
      toast.error('Failed to update provider status')
    }
  }

  // Handle configure provider
  const handleConfigureProvider = (provider: NotificationProvider) => {
    setConfigureDialog({
      open: true,
      type: provider.type,
      provider,
    })
  }

  // Handle test notification
  const handleTestNotification = async () => {
    try {
      // TODO: Call API to send test notification
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success('Test notification sent successfully!')
    } catch {
      toast.error('Failed to send test notification')
    }
  }

  // Handle save WhatsApp configuration
  const handleSaveWhatsAppConfig = async (data: WhatsAppConfigData) => {
    try {
      // TODO: Call API to save WhatsApp configuration
      console.log('Saving WhatsApp config:', data)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update provider in state
      setProviders((prev) =>
        prev.map((p) =>
          p.id === configureDialog.provider?.id
            ? {
                ...p,
                provider: data.provider,
                apiKey: 'configured',
                senderNumber: data.senderNumber,
                status: 'ACTIVE' as const,
              }
            : p
        )
      )

      toast.success('WhatsApp configuration saved successfully')
      setConfigureDialog({ open: false, type: null, provider: null })
    } catch {
      toast.error('Failed to save WhatsApp configuration')
    }
  }

  // Handle save Email configuration
  const handleSaveEmailConfig = async (data: EmailConfigData) => {
    try {
      // TODO: Call API to save Email configuration
      console.log('Saving Email config:', data)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update provider in state
      setProviders((prev) =>
        prev.map((p) =>
          p.id === configureDialog.provider?.id
            ? {
                ...p,
                provider: data.provider,
                apiKey: 'configured',
                fromEmail: data.fromEmail,
                status: 'ACTIVE' as const,
              }
            : p
        )
      )

      toast.success('Email configuration saved successfully')
      setConfigureDialog({ open: false, type: null, provider: null })
    } catch {
      toast.error('Failed to save Email configuration')
    }
  }

  const whatsappProviders = providers.filter((p) => p.type === 'WHATSAPP')
  const emailProviders = providers.filter((p) => p.type === 'EMAIL')

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Notification Settings
          </h1>
          <p className="text-muted-foreground">
            Configure WhatsApp and Email notification providers for your SPPG
          </p>
        </div>
      </div>

      {/* Info Alert */}
      <Alert>
        <Bell className="h-4 w-4" />
        <AlertDescription>
          Configure notification providers to send automatic notifications for approvals,
          QC results, production schedules, and distribution updates.
        </AlertDescription>
      </Alert>

      {/* Tabs */}
      <Tabs defaultValue="whatsapp" className="space-y-6">
        <TabsList>
          <TabsTrigger value="whatsapp" className="gap-2">
            <Bell className="h-4 w-4" />
            WhatsApp
            {whatsappProviders.length > 0 && (
              <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs">
                {whatsappProviders.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-2">
            <Bell className="h-4 w-4" />
            Email
            {emailProviders.length > 0 && (
              <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs">
                {emailProviders.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* WhatsApp Tab */}
        <TabsContent value="whatsapp" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">WhatsApp Providers</h2>
              <p className="text-sm text-muted-foreground">
                Configure WhatsApp notification services (Fonnte, Twilio, WABA)
              </p>
            </div>
            <Button
              onClick={() =>
                setConfigureDialog({
                  open: true,
                  type: 'WHATSAPP',
                  provider: null,
                })
              }
            >
              Add WhatsApp Provider
            </Button>
          </div>

          {whatsappProviders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No WhatsApp Provider</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Add a WhatsApp provider to start sending notifications
                </p>
                <Button
                  onClick={() =>
                    setConfigureDialog({
                      open: true,
                      type: 'WHATSAPP',
                      provider: null,
                    })
                  }
                >
                  Add Provider
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {whatsappProviders.map((provider) => (
                <NotificationProviderCard
                  key={provider.id}
                  config={{
                    type: provider.type,
                    name: provider.name,
                    provider: provider.provider,
                    status: provider.status,
                    isEnabled: provider.isEnabled,
                    lastUsed: provider.lastUsed,
                    totalSent: provider.totalSent,
                    successRate: provider.successRate,
                    apiKey: provider.apiKey,
                    errorMessage: provider.errorMessage,
                  }}
                  onToggle={() => handleToggleProvider(provider.id)}
                  onConfigure={() => handleConfigureProvider(provider)}
                  onTest={() => handleTestNotification(provider.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Email Tab */}
        <TabsContent value="email" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Email Providers</h2>
              <p className="text-sm text-muted-foreground">
                Configure Email notification services (Resend, SendGrid, AWS SES)
              </p>
            </div>
            <Button
              onClick={() =>
                setConfigureDialog({
                  open: true,
                  type: 'EMAIL',
                  provider: null,
                })
              }
            >
              Add Email Provider
            </Button>
          </div>

          {emailProviders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Email Provider</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Add an Email provider to start sending notifications
                </p>
                <Button
                  onClick={() =>
                    setConfigureDialog({
                      open: true,
                      type: 'EMAIL',
                      provider: null,
                    })
                  }
                >
                  Add Provider
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {emailProviders.map((provider) => (
                <NotificationProviderCard
                  key={provider.id}
                  config={{
                    type: provider.type,
                    name: provider.name,
                    provider: provider.provider,
                    status: provider.status,
                    isEnabled: provider.isEnabled,
                    lastUsed: provider.lastUsed,
                    totalSent: provider.totalSent,
                    successRate: provider.successRate,
                    apiKey: provider.apiKey,
                    errorMessage: provider.errorMessage,
                  }}
                  onToggle={() => handleToggleProvider(provider.id)}
                  onConfigure={() => handleConfigureProvider(provider)}
                  onTest={() => handleTestNotification(provider.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Configure Dialog */}
      <Dialog
        open={configureDialog.open}
        onOpenChange={(open) =>
          setConfigureDialog({ open, type: null, provider: null })
        }
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {configureDialog.type === 'WHATSAPP'
                ? 'Configure WhatsApp Provider'
                : 'Configure Email Provider'}
            </DialogTitle>
          </DialogHeader>

          {configureDialog.type === 'WHATSAPP' ? (
            <WhatsAppProviderForm
              initialValues={
                configureDialog.provider
                  ? {
                      provider: configureDialog.provider.provider as 'FONNTE' | 'TWILIO' | 'WABA',
                      apiKey: configureDialog.provider.apiKey || '',
                      senderNumber: configureDialog.provider.senderNumber || '',
                    }
                  : undefined
              }
              onSubmit={handleSaveWhatsAppConfig}
              onCancel={() =>
                setConfigureDialog({ open: false, type: null, provider: null })
              }
            />
          ) : (
            <EmailProviderForm
              initialValues={
                configureDialog.provider
                  ? {
                      provider: configureDialog.provider.provider as 'RESEND' | 'SENDGRID' | 'SES',
                      apiKey: configureDialog.provider.apiKey || '',
                      fromEmail: configureDialog.provider.fromEmail || '',
                    }
                  : undefined
              }
              onSubmit={handleSaveEmailConfig}
              onCancel={() =>
                setConfigureDialog({ open: false, type: null, provider: null })
              }
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
