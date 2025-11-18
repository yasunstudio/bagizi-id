/**
 * @fileoverview Recent Activities Component
 * @description Displays recent procurement activities from database
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

interface Activity {
  id: string
  procurementCode: string | null
  procurementDate: Date
  totalAmount: number
  status: string
  supplier: {
    supplierName: string
  } | null
}

interface RecentActivitiesProps {
  activities: Activity[]
}

/**
 * Get status badge variant
 */
function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case 'COMPLETED':
      return 'default'
    case 'APPROVED':
      return 'secondary'
    case 'PENDING_APPROVAL':
      return 'outline'
    case 'REJECTED':
    case 'CANCELLED':
      return 'destructive'
    default:
      return 'secondary'
  }
}

/**
 * Get status label in Indonesian
 */
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'PENDING_APPROVAL': 'Menunggu',
    'APPROVED': 'Disetujui',
    'REJECTED': 'Ditolak',
    'COMPLETED': 'Selesai',
    'CANCELLED': 'Dibatalkan',
    'IN_PROGRESS': 'Proses'
  }
  return labels[status] || status
}

/**
 * Recent Activities Component
 * @description Shows last 10 procurement activities with real data
 */
export function RecentActivities({ activities }: RecentActivitiesProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Terbaru</CardTitle>
          <CardDescription>Riwayat procurement terbaru</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              Belum ada aktivitas procurement
            </p>
            <Button asChild className="mt-4" size="sm">
              <Link href="/procurement/orders/new">
                Buat Procurement Baru
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Aktivitas Terbaru</CardTitle>
          <CardDescription>10 procurement terakhir</CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/procurement/orders" className="flex items-center gap-1">
            Lihat Semua
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <Link
              key={activity.id}
              href={`/procurement/orders/${activity.id}`}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm">
                    {activity.procurementCode || 'No Code'}
                  </p>
                  <Badge variant={getStatusVariant(activity.status)} className="text-xs">
                    {getStatusLabel(activity.status)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {activity.supplier?.supplierName || 'Unknown Supplier'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(activity.procurementDate), 'dd MMM yyyy, HH:mm', { 
                    locale: localeId 
                  })}
                </p>
              </div>
              <div className="text-right ml-4">
                <p className="font-semibold text-sm">
                  Rp {activity.totalAmount.toLocaleString('id-ID')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
