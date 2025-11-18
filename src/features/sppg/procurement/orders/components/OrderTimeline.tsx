/**
 * @fileoverview Order Timeline Component - Visual status timeline for order history
 * @version Next.js 15.5.4 / React 19 / TypeScript 5.7.2
 * @author Bagizi-ID Development Team
 * @see {@link /docs/PROCUREMENT_WORKFLOW_GUIDE.md} Procurement Documentation
 * 
 * COMPONENT FEATURES:
 * - Visual timeline with status progression
 * - Status icons with color coding
 * - Timestamps for each status
 * - User who performed action
 * - Notes/comments for status changes
 * - Approval/rejection reasons
 * - Delivery tracking
 * - Responsive layout
 * 
 * USAGE:
 * ```tsx
 * <OrderTimeline
 *   order={orderData}
 *   showDetails={true}
 * />
 * ```
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  ShoppingCart,
  Package,
  Truck,
  AlertCircle,
  User,
  Calendar
} from 'lucide-react'
import type { Order } from '../types'
import { formatDateTime, getStatusLabel } from '../utils'
import type { ProcurementStatus } from '@prisma/client'

// ================================ TYPES ================================

interface TimelineEvent {
  id: string
  status: ProcurementStatus
  timestamp: Date
  user?: string
  notes?: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

interface OrderTimelineProps {
  order: Order
  showDetails?: boolean
}

// ================================ CONSTANTS ================================

const STATUS_CONFIG: Record<ProcurementStatus, {
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
}> = {
  DRAFT: {
    icon: FileText,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  },
  PENDING_APPROVAL: {
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
  APPROVED: {
    icon: CheckCircle2,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  ORDERED: {
    icon: ShoppingCart,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
  },
  PARTIALLY_RECEIVED: {
    icon: Package,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  FULLY_RECEIVED: {
    icon: Package,
    color: 'text-teal-600',
    bgColor: 'bg-teal-100',
  },
  COMPLETED: {
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  CANCELLED: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  REJECTED: {
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
}

// ================================ COMPONENT ================================

/**
 * OrderTimeline - Visual timeline component for order status history
 * 
 * Features:
 * - Chronological status progression
 * - Visual timeline with connecting lines
 * - Status icons with color coding
 * - Timestamps and user information
 * - Notes and reasons for changes
 * - Delivery tracking milestones
 * - Responsive layout
 */
export function OrderTimeline({
  order,
  showDetails = true,
}: OrderTimelineProps) {
  // Build timeline events from order data
  const events: TimelineEvent[] = []

  // Created event
  events.push({
    id: 'created',
    status: 'DRAFT',
    timestamp: order.createdAt,
    notes: 'Order dibuat',
    icon: FileText,
    color: 'gray',
  })

  // Current status event
  if (order.status !== 'DRAFT') {
    events.push({
      id: 'current',
      status: order.status,
      timestamp: order.updatedAt,
      notes: `Status: ${getStatusLabel(order.status)}`,
      icon: STATUS_CONFIG[order.status].icon,
      color: STATUS_CONFIG[order.status].color,
    })
  }

  // Delivery events
  if (order.expectedDelivery) {
    events.push({
      id: 'expected-delivery',
      status: 'ORDERED',
      timestamp: order.expectedDelivery,
      notes: 'Estimasi pengiriman',
      icon: Truck,
      color: 'blue',
    })
  }

  if (order.actualDelivery) {
    events.push({
      id: 'actual-delivery',
      status: 'FULLY_RECEIVED',
      timestamp: order.actualDelivery,
      notes: 'Diterima',
      icon: Package,
      color: 'green',
    })
  }

  // Inspection event
  if (order.inspectedAt && order.inspectedBy) {
    events.push({
      id: 'inspection',
      status: 'FULLY_RECEIVED',
      timestamp: order.inspectedAt,
      user: order.inspectedBy,
      notes: `Quality check - Grade: ${order.qualityGrade || 'N/A'}`,
      icon: CheckCircle2,
      color: 'teal',
    })
  }

  // Sort events by timestamp
  events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Timeline Order
        </CardTitle>
        <CardDescription>Riwayat status dan aktivitas order</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-6">
          {/* Timeline line */}
          <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-border" />

          {/* Timeline events */}
          {events.map((event, index) => {
            const isLast = index === events.length - 1
            const isFuture = event.timestamp > new Date()
            const config = STATUS_CONFIG[event.status]

            return (
              <div key={event.id} className="relative flex gap-4">
                {/* Icon */}
                <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${config.bgColor} ${config.color} shrink-0`}>
                  <event.icon className="h-4 w-4" />
                </div>

                {/* Content */}
                <div className={`flex-1 pb-6 ${isLast ? 'pb-0' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">
                          {getStatusLabel(event.status)}
                        </p>
                        {isFuture && (
                          <Badge variant="outline" className="text-xs">
                            Dijadwalkan
                          </Badge>
                        )}
                      </div>
                      
                      {showDetails && event.notes && (
                        <p className="text-sm text-muted-foreground">
                          {event.notes}
                        </p>
                      )}

                      {showDetails && event.user && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <User className="h-3 w-3" />
                          <span>{event.user}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <time dateTime={event.timestamp.toISOString()}>
                        {formatDateTime(event.timestamp)}
                      </time>
                    </div>
                  </div>

                  {/* Additional details */}
                  {showDetails && index === events.length - 1 && (
                    <div className="mt-3 pt-3 border-t space-y-2">
                      {/* Rejection reason */}
                      {order.rejectionReason && (
                        <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-md">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                            <div>
                              <p className="text-xs font-medium text-red-900 dark:text-red-100">
                                Alasan Penolakan
                              </p>
                              <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                                {order.rejectionReason}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Quality notes */}
                      {order.qualityNotes && (
                        <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md">
                          <div className="flex items-start gap-2">
                            <Package className="h-4 w-4 text-blue-600 mt-0.5" />
                            <div>
                              <p className="text-xs font-medium text-blue-900 dark:text-blue-100">
                                Catatan Kualitas
                              </p>
                              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                {order.qualityNotes}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Delivery status */}
                      {order.deliveryStatus && order.deliveryStatus !== 'ORDERED' && (
                        <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-md">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-green-600" />
                            <div>
                              <p className="text-xs font-medium text-green-900 dark:text-green-100">
                                Status Pengiriman: {order.deliveryStatus}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
