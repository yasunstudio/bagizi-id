/**
 * @fileoverview WhatsApp Provider Configuration Form
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * 
 * Configure WhatsApp notification providers (Fonnte/Twilio/WABA)
 */

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MessageSquare, Info, ExternalLink, CheckCircle2 } from 'lucide-react'

// ================================ VALIDATION SCHEMA ================================

const whatsappProviderSchema = z.object({
  provider: z.enum(['FONNTE', 'TWILIO', 'WABA']),
  apiKey: z.string().min(10, 'API key must be at least 10 characters'),
  apiUrl: z.string().url('Must be a valid URL').optional(),
  senderNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  accountSid: z.string().optional(), // For Twilio
  authToken: z.string().optional(), // For Twilio
  wabaId: z.string().optional(), // For WABA
})

type WhatsAppProviderInput = z.infer<typeof whatsappProviderSchema>

// ================================ COMPONENT ================================

interface WhatsAppProviderFormProps {
  initialValues?: Partial<WhatsAppProviderInput>
  onSubmit: (data: WhatsAppProviderInput) => Promise<void>
  onCancel?: () => void
}

export function WhatsAppProviderForm({
  initialValues,
  onSubmit,
  onCancel,
}: WhatsAppProviderFormProps) {
  const form = useForm<WhatsAppProviderInput>({
    resolver: zodResolver(whatsappProviderSchema),
    defaultValues: {
      provider: initialValues?.provider || 'FONNTE',
      apiKey: initialValues?.apiKey || '',
      apiUrl: initialValues?.apiUrl || '',
      senderNumber: initialValues?.senderNumber || '',
      accountSid: initialValues?.accountSid || '',
      authToken: initialValues?.authToken || '',
      wabaId: initialValues?.wabaId || '',
    },
  })

  const selectedProvider = form.watch('provider')

  const handleSubmit = async (data: WhatsAppProviderInput) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Submit error:', error)
    }
  }

  const getProviderInfo = () => {
    switch (selectedProvider) {
      case 'FONNTE':
        return {
          name: 'Fonnte',
          description: 'Indonesian WhatsApp Business API provider',
          website: 'https://fonnte.com',
          features: ['Easy setup', 'Indonesian support', 'Affordable pricing'],
        }
      case 'TWILIO':
        return {
          name: 'Twilio',
          description: 'Global communication platform',
          website: 'https://twilio.com',
          features: ['Global coverage', 'Reliable delivery', 'Advanced features'],
        }
      case 'WABA':
        return {
          name: 'WhatsApp Business API',
          description: 'Official WhatsApp Business API',
          website: 'https://business.whatsapp.com',
          features: ['Official API', 'Enterprise features', 'High volume'],
        }
    }
  }

  const providerInfo = getProviderInfo()

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              WhatsApp Provider Configuration
            </CardTitle>
            <CardDescription>
              Configure your WhatsApp notification provider settings
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Provider Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Select Provider</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp Provider *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="FONNTE">
                        <div className="flex items-center gap-2">
                          Fonnte
                          <Badge variant="secondary">Recommended</Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="TWILIO">Twilio</SelectItem>
                      <SelectItem value="WABA">WhatsApp Business API</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose your preferred WhatsApp provider
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Provider Info */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <strong>{providerInfo.name}</strong>
                    <a
                      href={providerInfo.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      Visit Website <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <p className="text-sm">{providerInfo.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {providerInfo.features.map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* API Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">API Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Common Fields */}
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key *</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your API key"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Your {providerInfo.name} API key
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="senderNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sender Phone Number *</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="628123456789"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    WhatsApp number used to send messages (format: 628xxx)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Twilio-specific fields */}
            {selectedProvider === 'TWILIO' && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Twilio-specific Settings</h4>
                  
                  <FormField
                    control={form.control}
                    name="accountSid"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account SID</FormLabel>
                        <FormControl>
                          <Input placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your Twilio Account SID
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="authToken"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Auth Token</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter auth token" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your Twilio Auth Token
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {/* WABA-specific fields */}
            {selectedProvider === 'WABA' && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">WABA-specific Settings</h4>
                  
                  <FormField
                    control={form.control}
                    name="wabaId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WABA ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter WABA ID" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your WhatsApp Business Account ID
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="apiUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API URL</FormLabel>
                        <FormControl>
                          <Input
                            type="url"
                            placeholder="https://graph.facebook.com/v17.0"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          WhatsApp API base URL
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
