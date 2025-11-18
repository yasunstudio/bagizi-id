/**
 * @fileoverview Notification Providers Hook
 * @version Next.js 15.5.4 / TanStack Query
 * @author Bagizi-ID Development Team
 * 
 * Hook untuk fetch dan manage notification providers (WhatsApp & Email)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// Types
export interface NotificationProvider {
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
  config?: Record<string, string>
}

export interface WhatsAppConfig {
  provider: 'FONNTE' | 'TWILIO' | 'WABA'
  apiKey: string
  senderNumber: string
  accountSid?: string
  authToken?: string
  wabaId?: string
  apiUrl?: string
}

export interface EmailConfig {
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

// ================================ QUERY HOOKS ================================

/**
 * Fetch all notification providers untuk SPPG
 */
export function useNotificationProviders() {
  return useQuery({
    queryKey: ['notification-providers'],
    queryFn: async (): Promise<NotificationProvider[]> => {
      // TODO: Replace dengan API call
      // const response = await fetch('/api/sppg/notifications/providers')
      // if (!response.ok) throw new Error('Failed to fetch providers')
      // return response.json()

      // Mock data untuk development
      return [
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
      ]
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Fetch single notification provider by ID
 */
export function useNotificationProvider(providerId: string) {
  return useQuery({
    queryKey: ['notification-provider', providerId],
    queryFn: async (): Promise<NotificationProvider> => {
      // TODO: Replace dengan API call
      // const response = await fetch(`/api/sppg/notifications/providers/${providerId}`)
      // if (!response.ok) throw new Error('Failed to fetch provider')
      // return response.json()

      throw new Error('Provider not found')
    },
    enabled: !!providerId,
  })
}

// ================================ MUTATION HOOKS ================================

/**
 * Toggle enable/disable notification provider
 */
export function useToggleNotificationProvider() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      providerId: _providerId,
      isEnabled: _isEnabled,
    }: {
      providerId: string
      isEnabled: boolean
    }) => {
      // TODO: Replace dengan API call
      // const response = await fetch(`/api/sppg/notifications/providers/${providerId}/toggle`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ isEnabled }),
      // })
      // if (!response.ok) throw new Error('Failed to toggle provider')
      // return response.json()

      // Mock API delay
      await new Promise((resolve) => setTimeout(resolve, 500))
      return { success: true }
    },
    onSuccess: (_, variables) => {
      // Update cache optimistically
      queryClient.setQueryData<NotificationProvider[]>(
        ['notification-providers'],
        (old) =>
          old?.map((provider) =>
            provider.id === variables.providerId
              ? { ...provider, isEnabled: variables.isEnabled }
              : provider
          ) || []
      )

      queryClient.invalidateQueries({ queryKey: ['notification-providers'] })
      toast.success(
        variables.isEnabled
          ? 'Provider enabled successfully'
          : 'Provider disabled successfully'
      )
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to toggle provider')
    },
  })
}

/**
 * Save WhatsApp provider configuration
 */
export function useSaveWhatsAppConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      providerId,
      config,
    }: {
      providerId?: string
      config: WhatsAppConfig
    }) => {
      // TODO: Replace dengan API call
      // const url = providerId
      //   ? `/api/sppg/notifications/providers/${providerId}`
      //   : '/api/sppg/notifications/providers'
      // const response = await fetch(url, {
      //   method: providerId ? 'PUT' : 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ type: 'WHATSAPP', ...config }),
      // })
      // if (!response.ok) throw new Error('Failed to save WhatsApp configuration')
      // return response.json()

      // Mock API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return {
        success: true,
        provider: {
          id: providerId || 'new-id',
          type: 'WHATSAPP' as const,
          name: `WhatsApp ${config.provider}`,
          provider: config.provider,
          status: 'ACTIVE' as const,
          isEnabled: true,
          apiKey: 'configured',
          senderNumber: config.senderNumber,
        },
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-providers'] })
      toast.success('WhatsApp configuration saved successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save WhatsApp configuration')
    },
  })
}

/**
 * Save Email provider configuration
 */
export function useSaveEmailConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      providerId,
      config,
    }: {
      providerId?: string
      config: EmailConfig
    }) => {
      // TODO: Replace dengan API call
      // const url = providerId
      //   ? `/api/sppg/notifications/providers/${providerId}`
      //   : '/api/sppg/notifications/providers'
      // const response = await fetch(url, {
      //   method: providerId ? 'PUT' : 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ type: 'EMAIL', ...config }),
      // })
      // if (!response.ok) throw new Error('Failed to save Email configuration')
      // return response.json()

      // Mock API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return {
        success: true,
        provider: {
          id: providerId || 'new-id',
          type: 'EMAIL' as const,
          name: `Email ${config.provider}`,
          provider: config.provider,
          status: 'ACTIVE' as const,
          isEnabled: true,
          apiKey: 'configured',
          fromEmail: config.fromEmail,
        },
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-providers'] })
      toast.success('Email configuration saved successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save Email configuration')
    },
  })
}

/**
 * Delete notification provider
 */
export function useDeleteNotificationProvider() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (_providerId: string) => {
      // TODO: Replace dengan API call
      // const response = await fetch(`/api/sppg/notifications/providers/${providerId}`, {
      //   method: 'DELETE',
      // })
      // if (!response.ok) throw new Error('Failed to delete provider')
      // return response.json()

      // Mock API delay
      await new Promise((resolve) => setTimeout(resolve, 500))
      return { success: true }
    },
    onSuccess: (_, providerId) => {
      // Remove from cache
      queryClient.setQueryData<NotificationProvider[]>(
        ['notification-providers'],
        (old) => old?.filter((provider) => provider.id !== providerId) || []
      )

      queryClient.invalidateQueries({ queryKey: ['notification-providers'] })
      toast.success('Provider deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete provider')
    },
  })
}

/**
 * Test notification provider
 */
export function useTestNotification() {
  return useMutation({
    mutationFn: async ({
      providerId: _providerId,
      recipient: _recipient,
      message: _message,
    }: {
      providerId: string
      recipient?: string
      message?: string
    }) => {
      // TODO: Replace dengan API call
      // const response = await fetch(`/api/sppg/notifications/providers/${providerId}/test`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ recipient, message }),
      // })
      // if (!response.ok) throw new Error('Failed to send test notification')
      // return response.json()

      // Mock API delay
      await new Promise((resolve) => setTimeout(resolve, 1500))
      return { success: true, message: 'Test notification sent successfully' }
    },
    onSuccess: () => {
      toast.success('Test notification sent successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send test notification')
    },
  })
}
