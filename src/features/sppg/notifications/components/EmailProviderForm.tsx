/**
 * @fileoverview Email Provider Configuration Form
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * 
 * Configure Email notification providers (Resend/SendGrid/SES)
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
import { Mail, Info, ExternalLink, CheckCircle2 } from 'lucide-react'

// ================================ VALIDATION SCHEMA ================================

const emailProviderSchema = z.object({
  provider: z.enum(['RESEND', 'SENDGRID', 'SES']),
  apiKey: z.string().min(10, 'API key must be at least 10 characters'),
  fromEmail: z.string().email('Must be a valid email address'),
  fromName: z.string().min(2, 'From name must be at least 2 characters'),
  replyToEmail: z.string().email('Must be a valid email address').optional(),
  // SendGrid specific
  sendGridApiUrl: z.string().url().optional(),
  // AWS SES specific
  awsRegion: z.string().optional(),
  awsAccessKeyId: z.string().optional(),
  awsSecretAccessKey: z.string().optional(),
})

type EmailProviderInput = z.infer<typeof emailProviderSchema>

// ================================ COMPONENT ================================

interface EmailProviderFormProps {
  initialValues?: Partial<EmailProviderInput>
  onSubmit: (data: EmailProviderInput) => Promise<void>
  onCancel?: () => void
}

export function EmailProviderForm({
  initialValues,
  onSubmit,
  onCancel,
}: EmailProviderFormProps) {
  const form = useForm<EmailProviderInput>({
    resolver: zodResolver(emailProviderSchema),
    defaultValues: {
      provider: initialValues?.provider || 'RESEND',
      apiKey: initialValues?.apiKey || '',
      fromEmail: initialValues?.fromEmail || '',
      fromName: initialValues?.fromName || '',
      replyToEmail: initialValues?.replyToEmail || '',
      sendGridApiUrl: initialValues?.sendGridApiUrl || '',
      awsRegion: initialValues?.awsRegion || 'ap-southeast-1',
      awsAccessKeyId: initialValues?.awsAccessKeyId || '',
      awsSecretAccessKey: initialValues?.awsSecretAccessKey || '',
    },
  })

  const selectedProvider = form.watch('provider')

  const handleSubmit = async (data: EmailProviderInput) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Submit error:', error)
    }
  }

  const getProviderInfo = () => {
    switch (selectedProvider) {
      case 'RESEND':
        return {
          name: 'Resend',
          description: 'Modern email API for developers',
          website: 'https://resend.com',
          features: ['Simple API', 'Great DX', 'Generous free tier'],
        }
      case 'SENDGRID':
        return {
          name: 'SendGrid',
          description: 'Reliable email delivery platform',
          website: 'https://sendgrid.com',
          features: ['High deliverability', 'Advanced analytics', 'Template engine'],
        }
      case 'SES':
        return {
          name: 'Amazon SES',
          description: 'AWS Simple Email Service',
          website: 'https://aws.amazon.com/ses',
          features: ['Cost-effective', 'Scalable', 'AWS integration'],
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
              <Mail className="h-5 w-5" />
              Email Provider Configuration
            </CardTitle>
            <CardDescription>
              Configure your email notification provider settings
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
                  <FormLabel>Email Provider *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="RESEND">
                        <div className="flex items-center gap-2">
                          Resend
                          <Badge variant="secondary">Recommended</Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="SENDGRID">SendGrid</SelectItem>
                      <SelectItem value="SES">Amazon SES</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose your preferred email provider
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fromEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From Email *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="noreply@bagizi.id"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Email address used as sender
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fromName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Bagizi-ID Notification"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Display name for sender
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="replyToEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reply-To Email (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="support@bagizi.id"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Email address for replies (if different from sender)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* SendGrid-specific fields */}
            {selectedProvider === 'SENDGRID' && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">SendGrid-specific Settings</h4>
                  
                  <FormField
                    control={form.control}
                    name="sendGridApiUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API URL (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="url"
                            placeholder="https://api.sendgrid.com/v3"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          SendGrid API base URL (use default if unsure)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {/* AWS SES-specific fields */}
            {selectedProvider === 'SES' && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">AWS SES-specific Settings</h4>
                  
                  <FormField
                    control={form.control}
                    name="awsRegion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>AWS Region</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select AWS region" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ap-southeast-1">Singapore (ap-southeast-1)</SelectItem>
                            <SelectItem value="ap-southeast-3">Jakarta (ap-southeast-3)</SelectItem>
                            <SelectItem value="us-east-1">US East (us-east-1)</SelectItem>
                            <SelectItem value="us-west-2">US West (us-west-2)</SelectItem>
                            <SelectItem value="eu-west-1">EU Ireland (eu-west-1)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          AWS region for SES
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="awsAccessKeyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>AWS Access Key ID</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="AKIAIOSFODNN7EXAMPLE"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Your AWS access key ID
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="awsSecretAccessKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>AWS Secret Access Key</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter secret access key"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Your AWS secret access key
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
