/**
 * @fileoverview Banper Timeline Tab Component  
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Send, 
  Eye, 
  CheckCircle2, 
  DollarSign,
  XCircle,
  Clock,
} from 'lucide-react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import type { BanperRequestTrackingWithRelations } from '../../types'

interface BanperTimelineTabProps {
  tracking: BanperRequestTrackingWithRelations
}

interface TimelineEvent {
  date: Date
  title: string
  description: string
  icon: React.ElementType
  iconColor: string
}

export function BanperTimelineTab({ tracking }: BanperTimelineTabProps) {
  const events: TimelineEvent[] = []

  // Created
  events.push({
    date: new Date(tracking.createdAt),
    title: 'Permohonan Dibuat',
    description: 'Permohonan banper dibuat di sistem lokal',
    icon: FileText,
    iconColor: 'text-blue-600',
  })

  // Submitted
  if (tracking.bgnSubmissionDate) {
    events.push({
      date: new Date(tracking.bgnSubmissionDate),
      title: 'Diajukan ke BGN',
      description: `Nomor permohonan: ${tracking.bgnRequestNumber}`,
      icon: Send,
      iconColor: 'text-purple-600',
    })
  }

  // Under Review
  if (tracking.bgnStatus === 'UNDER_REVIEW_BGN' && tracking.lastStatusUpdate) {
    events.push({
      date: new Date(tracking.lastStatusUpdate),
      title: 'Dalam Review BGN',
      description: tracking.bgnReviewNotes || 'Permohonan sedang ditinjau oleh BGN',
      icon: Eye,
      iconColor: 'text-yellow-600',
    })
  }

  // Approved
  if (tracking.bgnApprovalDate) {
    events.push({
      date: new Date(tracking.bgnApprovalDate),
      title: 'Disetujui BGN',
      description: `Disetujui oleh ${tracking.bgnApprovedByName || 'BGN'}. Nomor SK: ${tracking.bgnApprovalNumber}`,
      icon: CheckCircle2,
      iconColor: 'text-green-600',
    })
  }

  // Disbursed
  if (tracking.disbursedDate) {
    events.push({
      date: new Date(tracking.disbursedDate),
      title: 'Dana Dicairkan',
      description: `Dana sebesar Rp ${tracking.disbursedAmount?.toLocaleString('id-ID')} telah dicairkan. Ref: ${tracking.bankReferenceNumber}`,
      icon: DollarSign,
      iconColor: 'text-emerald-600',
    })
  }

  // Rejected
  if (tracking.bgnStatus === 'REJECTED_BY_BGN' && tracking.lastStatusUpdate) {
    events.push({
      date: new Date(tracking.lastStatusUpdate),
      title: 'Ditolak BGN',
      description: tracking.bgnRejectionReason || 'Permohonan ditolak oleh BGN',
      icon: XCircle,
      iconColor: 'text-red-600',
    })
  }

  // Cancelled
  if (tracking.bgnStatus === 'CANCELLED' && tracking.lastStatusUpdate) {
    events.push({
      date: new Date(tracking.lastStatusUpdate),
      title: 'Dibatalkan',
      description: 'Permohonan dibatalkan',
      icon: XCircle,
      iconColor: 'text-gray-600',
    })
  }

  // Sort by date descending (newest first)
  events.sort((a, b) => b.date.getTime() - a.date.getTime())

  return (
    <Card>
      <CardHeader>
        <CardTitle>Riwayat Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent dark:before:via-slate-700">
          {events.map((event, index) => (
            <div key={index} className="relative flex items-start">
              {/* Icon */}
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow ${event.iconColor}`}>
                <event.icon className="h-5 w-5" />
              </div>

              {/* Content */}
              <div className="ml-4 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{event.title}</h3>
                  <Badge variant="outline" className="text-xs">
                    <Clock className="mr-1 h-3 w-3" />
                    {format(event.date, 'd MMM yyyy HH:mm', { locale: localeId })}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{event.description}</p>
              </div>
            </div>
          ))}

          {events.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Belum ada riwayat aktivitas
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
