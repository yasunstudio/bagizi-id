/**
 * @fileoverview Notification Logs Table with Delivery Tracking
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * 
 * Display notification delivery logs with status tracking and retry functionality
 */

'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  CheckCircle2,
  XCircle,
  Clock,
  MoreHorizontal,
  RefreshCw,
  Eye,
  MessageSquare,
  Mail,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ================================ TYPES ================================

type NotificationChannel = 'WHATSAPP' | 'EMAIL'
type NotificationStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'READ'

interface NotificationLog {
  id: string
  channel: NotificationChannel
  recipient: string
  subject?: string
  message: string
  status: NotificationStatus
  sentAt?: Date
  deliveredAt?: Date
  readAt?: Date
  failureReason?: string
  retryCount: number
  maxRetries: number
  metadata?: Record<string, unknown>
}

interface NotificationLogsTableProps {
  logs: NotificationLog[]
  onRetry: (logId: string) => void
  onViewDetails: (log: NotificationLog) => void
  isLoading?: boolean
}

// ================================ COMPONENT ================================

export function NotificationLogsTable({
  logs,
  onRetry,
  onViewDetails,
  isLoading = false,
}: NotificationLogsTableProps) {
  const [selectedLog, setSelectedLog] = useState<NotificationLog | null>(null)

  const getChannelIcon = (channel: NotificationChannel) => {
    switch (channel) {
      case 'WHATSAPP':
        return <MessageSquare className="h-4 w-4" />
      case 'EMAIL':
        return <Mail className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: NotificationStatus) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Delivered
          </Badge>
        )
      case 'SENT':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Sent
          </Badge>
        )
      case 'READ':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Read
          </Badge>
        )
      case 'PENDING':
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case 'FAILED':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        )
    }
  }

  const canRetry = (log: NotificationLog) => {
    return log.status === 'FAILED' && log.retryCount < log.maxRetries
  }

  const formatDate = (date?: Date) => {
    if (!date) return '-'
    return new Date(date).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading notification logs...</p>
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No notification logs found. Notifications will appear here once sent.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Channel</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead>Subject/Message</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sent At</TableHead>
              <TableHead>Retries</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                {/* Channel */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getChannelIcon(log.channel)}
                    <span className="text-sm font-medium">{log.channel}</span>
                  </div>
                </TableCell>

                {/* Recipient */}
                <TableCell>
                  <div className="max-w-[200px] truncate" title={log.recipient}>
                    {log.recipient}
                  </div>
                </TableCell>

                {/* Subject/Message */}
                <TableCell>
                  <div className="space-y-1 max-w-[300px]">
                    {log.subject && (
                      <div className="font-medium text-sm truncate" title={log.subject}>
                        {log.subject}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground truncate" title={log.message}>
                      {log.message}
                    </div>
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell>{getStatusBadge(log.status)}</TableCell>

                {/* Sent At */}
                <TableCell>
                  <div className="text-sm">{formatDate(log.sentAt)}</div>
                  {log.deliveredAt && (
                    <div className="text-xs text-muted-foreground">
                      Delivered: {formatDate(log.deliveredAt)}
                    </div>
                  )}
                </TableCell>

                {/* Retries */}
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      log.retryCount > 0 && 'bg-amber-50 text-amber-700 border-amber-200'
                    )}
                  >
                    {log.retryCount}/{log.maxRetries}
                  </Badge>
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onViewDetails(log)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {canRetry(log) && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onRetry(log.id)}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Retry
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Details Dialog */}
      <Dialog open={selectedLog !== null} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Notification Details</DialogTitle>
            <DialogDescription>
              Complete information about this notification delivery
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                {getStatusBadge(selectedLog.status)}
              </div>

              {/* Channel & Recipient */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium">Channel</span>
                  <div className="flex items-center gap-2 mt-1">
                    {getChannelIcon(selectedLog.channel)}
                    <span className="text-sm">{selectedLog.channel}</span>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium">Recipient</span>
                  <div className="text-sm mt-1">{selectedLog.recipient}</div>
                </div>
              </div>

              {/* Subject (if email) */}
              {selectedLog.subject && (
                <div>
                  <span className="text-sm font-medium">Subject</span>
                  <div className="text-sm mt-1">{selectedLog.subject}</div>
                </div>
              )}

              {/* Message */}
              <div>
                <span className="text-sm font-medium">Message</span>
                <div className="text-sm mt-1 p-3 bg-muted rounded-md">
                  {selectedLog.message}
                </div>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Sent At</span>
                  <div className="text-muted-foreground mt-1">
                    {formatDate(selectedLog.sentAt)}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Delivered At</span>
                  <div className="text-muted-foreground mt-1">
                    {formatDate(selectedLog.deliveredAt)}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Read At</span>
                  <div className="text-muted-foreground mt-1">
                    {formatDate(selectedLog.readAt)}
                  </div>
                </div>
              </div>

              {/* Retry Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Retry Count</span>
                  <div className="mt-1">
                    <Badge variant="outline">
                      {selectedLog.retryCount}/{selectedLog.maxRetries}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Failure Reason */}
              {selectedLog.failureReason && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Failure Reason:</strong>
                    <br />
                    {selectedLog.failureReason}
                  </AlertDescription>
                </Alert>
              )}

              {/* Retry Button */}
              {canRetry(selectedLog) && (
                <Button
                  onClick={() => {
                    onRetry(selectedLog.id)
                    setSelectedLog(null)
                  }}
                  className="w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry Sending
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
