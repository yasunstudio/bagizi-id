/**
 * @fileoverview Plan Timeline Component
 * @version Next.js 15.5.4 / React 19
 * @author Bagizi-ID Development Team
 * @see {@link /docs/PROCUREMENT_WORKFLOW_GUIDE.md} Procurement Documentation
 * 
 * COMPONENT FEATURES:
 * - Vertical timeline layout
 * - Activity history display
 * - Event type icons and colors
 * - User attribution
 * - Timestamp formatting
 * - Loading states
 * - Empty state
 * - Dark mode support
 */

'use client'

import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  FileText,
  Edit,
  Send,
  CheckCircle2,
  XCircle,
  Ban,
  Clock,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ================================ TYPES ================================

/**
 * Timeline event types
 */
export type TimelineEventType =
  | 'CREATED'
  | 'UPDATED'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'

/**
 * Timeline event data
 */
export interface TimelineEvent {
  id: string
  type: TimelineEventType
  title: string
  description?: string
  timestamp: Date
  user?: {
    id: string
    name: string
    email?: string
  }
  metadata?: Record<string, string | number | boolean>
}

interface PlanTimelineProps {
  events: TimelineEvent[]
  isLoading?: boolean
  className?: string
}

interface TimelineItemProps {
  event: TimelineEvent
  isLast: boolean
}

// ================================ UTILITIES ================================

/**
 * Get event configuration (icon, color, label)
 */
function getEventConfig(type: TimelineEventType) {
  const configs: Record<
    TimelineEventType,
    {
      icon: React.ElementType
      color: string
      bgColor: string
      textColor: string
      label: string
    }
  > = {
    CREATED: {
      icon: FileText,
      color: 'border-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      textColor: 'text-blue-700 dark:text-blue-400',
      label: 'Dibuat',
    },
    UPDATED: {
      icon: Edit,
      color: 'border-gray-500',
      bgColor: 'bg-gray-100 dark:bg-gray-800',
      textColor: 'text-gray-700 dark:text-gray-400',
      label: 'Diperbarui',
    },
    SUBMITTED: {
      icon: Send,
      color: 'border-yellow-500',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      textColor: 'text-yellow-700 dark:text-yellow-400',
      label: 'Diajukan',
    },
    APPROVED: {
      icon: CheckCircle2,
      color: 'border-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      textColor: 'text-green-700 dark:text-green-400',
      label: 'Disetujui',
    },
    REJECTED: {
      icon: XCircle,
      color: 'border-red-500',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      textColor: 'text-red-700 dark:text-red-400',
      label: 'Ditolak',
    },
    CANCELLED: {
      icon: Ban,
      color: 'border-gray-500',
      bgColor: 'bg-gray-100 dark:bg-gray-800',
      textColor: 'text-gray-700 dark:text-gray-400',
      label: 'Dibatalkan',
    },
  }

  return configs[type]
}

/**
 * Format timestamp to readable format
 */
function formatTimestamp(date: Date): string {
  return format(date, "d MMM yyyy 'pukul' HH:mm", { locale: idLocale })
}

/**
 * Get relative time label
 */
function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return 'Baru saja'
  if (diffInMinutes < 60) return `${diffInMinutes} menit yang lalu`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours} jam yang lalu`

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays} hari yang lalu`

  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) return `${diffInWeeks} minggu yang lalu`

  const diffInMonths = Math.floor(diffInDays / 30)
  return `${diffInMonths} bulan yang lalu`
}

// ================================ SUB-COMPONENTS ================================

/**
 * Timeline Item Component
 * Individual timeline event entry
 */
function TimelineItem({ event, isLast }: TimelineItemProps) {
  const config = getEventConfig(event.type)
  const Icon = config.icon

  return (
    <div className="relative flex gap-4 pb-8">
      {/* Vertical Line */}
      {!isLast && (
        <div className="absolute left-5 top-10 bottom-0 w-px bg-border" />
      )}

      {/* Icon */}
      <div
        className={cn(
          'relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2',
          config.color,
          config.bgColor
        )}
      >
        <Icon className={cn('h-5 w-5', config.textColor)} />
      </div>

      {/* Content */}
      <div className="flex-1 space-y-2 pt-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-foreground">{event.title}</h4>
              <Badge variant="secondary" className="text-xs">
                {config.label}
              </Badge>
            </div>
            {event.description && (
              <p className="text-sm text-muted-foreground">{event.description}</p>
            )}
          </div>
        </div>

        {/* User & Timestamp */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          {event.user && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{event.user.name}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span title={formatTimestamp(event.timestamp)}>
              {getRelativeTime(event.timestamp)}
            </span>
          </div>
        </div>

        {/* Metadata */}
        {event.metadata && Object.keys(event.metadata).length > 0 && (
          <div className="mt-3 rounded-lg bg-muted p-3 space-y-1">
            {Object.entries(event.metadata).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2 text-xs">
                <span className="font-medium text-foreground capitalize">
                  {key.replace(/_/g, ' ')}:
                </span>
                <span className="text-muted-foreground">{String(value)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ================================ MAIN COMPONENT ================================

/**
 * Plan Timeline Component
 * Displays chronological activity history for a plan
 * 
 * @example
 * <PlanTimeline
 *   events={timelineEvents}
 *   isLoading={isLoading}
 * />
 */
export function PlanTimeline({
  events,
  isLoading = false,
  className,
}: PlanTimelineProps) {
  // Loading skeleton
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Riwayat Aktivitas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-10 w-10 flex-shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (!events.length) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Riwayat Aktivitas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Belum Ada Aktivitas
            </h3>
            <p className="text-sm text-muted-foreground">
              Riwayat aktivitas akan muncul di sini
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Sort events by timestamp (newest first)
  const sortedEvents = [...events].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  )

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Riwayat Aktivitas</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {events.length} aktivitas
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          {sortedEvents.map((event, index) => (
            <TimelineItem
              key={event.id}
              event={event}
              isLast={index === sortedEvents.length - 1}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
