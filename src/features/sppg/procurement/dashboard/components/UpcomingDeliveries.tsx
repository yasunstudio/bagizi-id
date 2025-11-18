/**
 * @fileoverview Upcoming Deliveries Component
 * @description Displays scheduled deliveries in the next 7 days
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Truck, Calendar, ArrowRight } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

interface UpcomingDelivery {
  id: string
  procurementCode: string | null
  expectedDelivery: Date | null
  totalAmount: number
  supplier: {
    supplierName: string
  } | null
}

interface UpcomingDeliveriesProps {
  deliveries: UpcomingDelivery[]
}

/**
 * Upcoming Deliveries Component
 * @description Shows scheduled deliveries for the next 7 days
 */
export function UpcomingDeliveries({ deliveries }: UpcomingDeliveriesProps) {
  if (deliveries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-muted-foreground" />
            Pengiriman Mendatang
          </CardTitle>
          <CardDescription>7 hari ke depan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm font-medium text-foreground mb-1">
              Tidak ada pengiriman terjadwal
            </p>
            <p className="text-xs text-muted-foreground">
              Belum ada pengiriman dalam 7 hari ke depan
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-blue-200 dark:border-blue-900">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-500" />
            Pengiriman Mendatang
          </CardTitle>
          <CardDescription>
            {deliveries.length} pengiriman dalam 7 hari
          </CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/procurement/deliveries" className="flex items-center gap-1">
            Lihat Semua
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {deliveries.map((delivery) => {
            if (!delivery.expectedDelivery) return null
            
            const deliveryDate = new Date(delivery.expectedDelivery)
            const isToday = format(deliveryDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
            const isTomorrow = format(new Date(Date.now() + 86400000), 'yyyy-MM-dd') === format(deliveryDate, 'yyyy-MM-dd')
            
            let timeLabel = formatDistanceToNow(deliveryDate, { 
              addSuffix: true,
              locale: localeId 
            })
            
            if (isToday) timeLabel = 'Hari ini'
            if (isTomorrow) timeLabel = 'Besok'
            
            return (
              <Link
                key={delivery.id}
                href={`/procurement/orders/${delivery.id}`}
                className="flex items-center justify-between p-3 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100/50 dark:hover:bg-blue-950/40 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">
                      {delivery.procurementCode || 'No Code'}
                    </p>
                    <Badge 
                      variant={isToday || isTomorrow ? "default" : "outline"}
                      className={
                        isToday 
                          ? "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400"
                          : isTomorrow
                          ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-700 dark:text-yellow-400"
                          : "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400"
                      }
                    >
                      <Calendar className="h-3 w-3 mr-1" />
                      {timeLabel}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {delivery.supplier?.supplierName || 'Unknown Supplier'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(deliveryDate, 'EEEE, dd MMMM yyyy', { locale: localeId })}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <p className="font-semibold text-sm">
                    Rp {delivery.totalAmount.toLocaleString('id-ID')}
                  </p>
                  {(isToday || isTomorrow) && (
                    <Button 
                      size="sm" 
                      variant={isToday ? "default" : "outline"}
                      className="mt-2"
                      onClick={(e) => {
                        e.preventDefault()
                        window.location.href = `/procurement/receipts/new?procurement=${delivery.id}`
                      }}
                    >
                      {isToday ? 'Terima' : 'Siapkan'}
                    </Button>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
