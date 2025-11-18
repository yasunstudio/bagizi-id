/**
 * @fileoverview Notification Logs Hook
 * @version Next.js 15.5.4 / TanStack Query
 * @author Bagizi-ID Development Team
 * 
 * Hook untuk fetch dan manage notification delivery logs
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// Types
export interface NotificationLog {
  id: string
  channel: 'WHATSAPP' | 'EMAIL'
  recipient: string
  subject?: string
  message: string
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'READ'
  sentAt?: Date
  deliveredAt?: Date
  readAt?: Date
  failureReason?: string
  retryCount: number
  maxRetries: number
}

export interface NotificationLogsFilters {
  searchQuery?: string
  channel?: 'ALL' | 'WHATSAPP' | 'EMAIL'
  status?: 'ALL' | 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED'
  dateFrom?: Date
  dateTo?: Date
  page?: number
  limit?: number
}

export interface NotificationLogsResponse {
  logs: NotificationLog[]
  total: number
  page: number
  totalPages: number
}

// ================================ QUERY HOOKS ================================

/**
 * Fetch notification logs dengan filters
 */
export function useNotificationLogs(filters?: NotificationLogsFilters) {
  return useQuery({
    queryKey: ['notification-logs', filters],
    queryFn: async (): Promise<NotificationLogsResponse> => {
      // TODO: Replace dengan API call
      // const params = new URLSearchParams()
      // if (filters?.searchQuery) params.append('search', filters.searchQuery)
      // if (filters?.channel && filters.channel !== 'ALL') params.append('channel', filters.channel)
      // if (filters?.status && filters.status !== 'ALL') params.append('status', filters.status)
      // if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString())
      // if (filters?.dateTo) params.append('dateTo', filters.dateTo.toISOString())
      // if (filters?.page) params.append('page', filters.page.toString())
      // if (filters?.limit) params.append('limit', filters.limit.toString())
      //
      // const response = await fetch(`/api/sppg/notifications/logs?${params}`)
      // if (!response.ok) throw new Error('Failed to fetch notification logs')
      // return response.json()

      // Mock data untuk development
      const mockLogs: NotificationLog[] = [
        {
          id: '1',
          channel: 'WHATSAPP',
          recipient: '628123456789',
          message: 'Procurement Order #PO-2024-001 telah disetujui oleh SPPG_KEPALA',
          status: 'DELIVERED',
          sentAt: new Date('2024-10-30T10:30:00'),
          deliveredAt: new Date('2024-10-30T10:30:15'),
          readAt: new Date('2024-10-30T10:35:00'),
          retryCount: 0,
          maxRetries: 3,
        },
        {
          id: '2',
          channel: 'EMAIL',
          recipient: 'akuntan@sppg.id',
          subject: 'Budget Alert - 80% Used',
          message: 'Budget kategori PROTEIN telah mencapai 80% dari total alokasi',
          status: 'DELIVERED',
          sentAt: new Date('2024-10-30T09:15:00'),
          deliveredAt: new Date('2024-10-30T09:15:30'),
          retryCount: 0,
          maxRetries: 3,
        },
        {
          id: '3',
          channel: 'WHATSAPP',
          recipient: '628987654321',
          message: 'Quality Control untuk item Ayam Potong: Grade POOR - REJECTED',
          status: 'FAILED',
          sentAt: new Date('2024-10-30T08:00:00'),
          failureReason: 'Invalid phone number format',
          retryCount: 2,
          maxRetries: 3,
        },
        {
          id: '4',
          channel: 'EMAIL',
          recipient: 'kepala@sppg.id',
          subject: 'Escalation Alert - Pending Approval',
          message: 'Procurement Order #PO-2024-002 menunggu approval lebih dari 24 jam',
          status: 'SENT',
          sentAt: new Date('2024-10-30T07:45:00'),
          retryCount: 0,
          maxRetries: 3,
        },
        {
          id: '5',
          channel: 'WHATSAPP',
          recipient: '628111222333',
          message: 'Production schedule untuk tanggal 2024-11-01 telah dibuat',
          status: 'PENDING',
          retryCount: 0,
          maxRetries: 3,
        },
      ]

      // Simple client-side filtering untuk mock data
      let filteredLogs = [...mockLogs]

      if (filters?.searchQuery) {
        const search = filters.searchQuery.toLowerCase()
        filteredLogs = filteredLogs.filter(
          (log) =>
            log.recipient.toLowerCase().includes(search) ||
            log.message.toLowerCase().includes(search) ||
            log.subject?.toLowerCase().includes(search)
        )
      }

      if (filters?.channel && filters.channel !== 'ALL') {
        filteredLogs = filteredLogs.filter((log) => log.channel === filters.channel)
      }

      if (filters?.status && filters.status !== 'ALL') {
        filteredLogs = filteredLogs.filter((log) => log.status === filters.status)
      }

      if (filters?.dateFrom) {
        filteredLogs = filteredLogs.filter(
          (log) => log.sentAt && log.sentAt >= filters.dateFrom!
        )
      }

      if (filters?.dateTo) {
        filteredLogs = filteredLogs.filter(
          (log) => log.sentAt && log.sentAt <= filters.dateTo!
        )
      }

      return {
        logs: filteredLogs,
        total: filteredLogs.length,
        page: filters?.page || 1,
        totalPages: Math.ceil(filteredLogs.length / (filters?.limit || 10)),
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

/**
 * Fetch notification log statistics
 */
export function useNotificationStats() {
  return useQuery({
    queryKey: ['notification-stats'],
    queryFn: async () => {
      // TODO: Replace dengan API call
      // const response = await fetch('/api/sppg/notifications/stats')
      // if (!response.ok) throw new Error('Failed to fetch notification stats')
      // return response.json()

      // Mock stats
      return {
        totalSent: 1234,
        delivered: 1150,
        failed: 84,
        successRate: 93.2,
        whatsappSent: 850,
        emailSent: 384,
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// ================================ MUTATION HOOKS ================================

/**
 * Retry failed notification
 */
export function useRetryNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (logId: string) => {
      // TODO: Replace dengan API call
      // const response = await fetch(`/api/sppg/notifications/logs/${logId}/retry`, {
      //   method: 'POST',
      // })
      // if (!response.ok) throw new Error('Failed to retry notification')
      // return response.json()

      // Mock API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return { success: true, logId }
    },
    onSuccess: (data) => {
      // Update cache optimistically
      queryClient.setQueriesData<NotificationLogsResponse>(
        { queryKey: ['notification-logs'] },
        (old) => {
          if (!old) return old

          return {
            ...old,
            logs: old.logs.map((log) =>
              log.id === data.logId
                ? {
                    ...log,
                    status: 'SENT' as const,
                    retryCount: log.retryCount + 1,
                    sentAt: new Date(),
                  }
                : log
            ),
          }
        }
      )

      queryClient.invalidateQueries({ queryKey: ['notification-logs'] })
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] })
      toast.success('Notification retried successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to retry notification')
    },
  })
}

/**
 * Export notification logs to CSV
 */
export function useExportNotificationLogs() {
  return useMutation({
    mutationFn: async (_filters?: NotificationLogsFilters) => {
      // TODO: Replace dengan API call
      // const params = new URLSearchParams()
      // if (filters?.searchQuery) params.append('search', filters.searchQuery)
      // if (filters?.channel && filters.channel !== 'ALL') params.append('channel', filters.channel)
      // if (filters?.status && filters.status !== 'ALL') params.append('status', filters.status)
      // if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString())
      // if (filters?.dateTo) params.append('dateTo', filters.dateTo.toISOString())
      //
      // const response = await fetch(`/api/sppg/notifications/logs/export?${params}`)
      // if (!response.ok) throw new Error('Failed to export logs')
      // const blob = await response.blob()
      // return blob

      // Mock export
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      // Create mock CSV
      const csvContent = 'Channel,Recipient,Message,Status,Sent At\n' +
        'WHATSAPP,628123456789,Test message,DELIVERED,2024-10-30T10:30:00\n'
      
      return new Blob([csvContent], { type: 'text/csv' })
    },
    onSuccess: (blob) => {
      // Download file
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `notification-logs-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Logs exported successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to export logs')
    },
  })
}

/**
 * Mark notification as read
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (logId: string) => {
      // TODO: Replace dengan API call
      // const response = await fetch(`/api/sppg/notifications/logs/${logId}/read`, {
      //   method: 'PATCH',
      // })
      // if (!response.ok) throw new Error('Failed to mark notification as read')
      // return response.json()

      // Mock API delay
      await new Promise((resolve) => setTimeout(resolve, 300))
      return { success: true, logId }
    },
    onSuccess: (data) => {
      // Update cache optimistically
      queryClient.setQueriesData<NotificationLogsResponse>(
        { queryKey: ['notification-logs'] },
        (old) => {
          if (!old) return old

          return {
            ...old,
            logs: old.logs.map((log) =>
              log.id === data.logId
                ? {
                    ...log,
                    status: 'READ' as const,
                    readAt: new Date(),
                  }
                : log
            ),
          }
        }
      )

      queryClient.invalidateQueries({ queryKey: ['notification-logs'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to mark notification as read')
    },
  })
}
