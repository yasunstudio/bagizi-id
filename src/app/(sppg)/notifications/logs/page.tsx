/**
 * SPPG Notification Logs Dashboard
 * View notification delivery logs with filtering and retry functionality
 * 
 * @version Next.js 15.5.4 / Auth.js v5
 * @author Bagizi-ID Development Team
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  NotificationLogsTable,
  NotificationFiltersComponent,
} from '@/features/sppg/notifications/components'
import { Bell, Download, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

// Types
type NotificationChannel = 'ALL' | 'WHATSAPP' | 'EMAIL'
type NotificationStatus = 'ALL' | 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'READ'

interface NotificationLog {
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

interface NotificationFilters {
  searchQuery?: string
  channel: NotificationChannel
  status: NotificationStatus
  dateFrom?: Date
  dateTo?: Date
}

export default function NotificationLogsPage() {
  const [logs, setLogs] = useState<NotificationLog[]>([
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
  ])

  const [filters, setFilters] = useState<NotificationFilters>({
    searchQuery: '',
    channel: 'ALL',
    status: 'ALL',
  })

  const [appliedFilters, setAppliedFilters] = useState<NotificationFilters>(filters)
  const [isLoading, setIsLoading] = useState(false)

  // Filter logs based on applied filters
  const filteredLogs = logs.filter((log) => {
    // Search filter
    if (appliedFilters.searchQuery) {
      const search = appliedFilters.searchQuery.toLowerCase()
      const matchesSearch =
        log.recipient.toLowerCase().includes(search) ||
        log.message.toLowerCase().includes(search) ||
        log.subject?.toLowerCase().includes(search)
      if (!matchesSearch) return false
    }

    // Channel filter
    if (appliedFilters.channel !== 'ALL') {
      if (log.channel !== appliedFilters.channel) return false
    }

    // Status filter
    if (appliedFilters.status !== 'ALL') {
      if (log.status !== appliedFilters.status) return false
    }

    // Date from filter
    if (appliedFilters.dateFrom && log.sentAt) {
      if (log.sentAt < appliedFilters.dateFrom) return false
    }

    // Date to filter
    if (appliedFilters.dateTo && log.sentAt) {
      if (log.sentAt > appliedFilters.dateTo) return false
    }

    return true
  })

  // Handle retry notification
  const handleRetryNotification = async (logId: string) => {
    setIsLoading(true)
    try {
      // TODO: Call API to retry notification
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update log status
      setLogs((prev) =>
        prev.map((log) =>
          log.id === logId
            ? {
                ...log,
                status: 'SENT' as const,
                retryCount: log.retryCount + 1,
                sentAt: new Date(),
              }
            : log
        )
      )

      toast.success('Notification retried successfully')
    } catch {
      toast.error('Failed to retry notification')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle view details
  const handleViewDetails = (log: NotificationLog) => {
    console.log('View details:', log)
    // Details are shown in the table dialog
  }

  // Handle refresh logs
  const handleRefreshLogs = async () => {
    setIsLoading(true)
    try {
      // TODO: Call API to fetch latest logs
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success('Logs refreshed successfully')
    } catch {
      toast.error('Failed to refresh logs')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle export logs
  const handleExportLogs = () => {
    // TODO: Implement export to CSV
    toast.success('Exporting logs to CSV...')
  }

  // Handle apply filters
  const handleApplyFilters = () => {
    setAppliedFilters(filters)
    toast.success('Filters applied')
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Notification Logs
          </h1>
          <p className="text-muted-foreground">
            View and manage notification delivery logs for your SPPG
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefreshLogs} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
            <p className="text-xs text-muted-foreground">All time notifications</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {logs.filter((l) => l.status === 'DELIVERED').length}
            </div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {logs.filter((l) => l.status === 'FAILED').length}
            </div>
            <p className="text-xs text-muted-foreground">Failed to deliver</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {logs.length > 0
                ? Math.round(
                    (logs.filter((l) => l.status === 'DELIVERED' || l.status === 'READ')
                      .length /
                      logs.length) *
                      100
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Delivery success rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <NotificationFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        onApplyFilters={handleApplyFilters}
        resultsCount={filteredLogs.length}
      />

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Notification History</CardTitle>
        </CardHeader>
        <CardContent>
          <NotificationLogsTable
            logs={filteredLogs}
            onRetry={handleRetryNotification}
            onViewDetails={handleViewDetails}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  )
}
