/**
 * @fileoverview Supplier Procurement History Component
 * @version Next.js 15.5.4
 * @description Display recent procurement history with this supplier
 * @author Bagizi-ID Development Team
 */

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Calendar, ExternalLink } from 'lucide-react'

interface Procurement {
  id: string
  procurementCode: string
  procurementDate: Date
  actualDelivery: Date | null
  status: string
  paymentStatus: string
  totalAmount: number
}

interface SupplierProcurementsProps {
  supplierId: string
  procurements: Procurement[]
}

export function SupplierProcurements({ supplierId, procurements }: SupplierProcurementsProps) {
  if (!procurements || procurements.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Riwayat Pengadaan</CardTitle>
            <CardDescription>5 pengadaan terakhir dari supplier ini</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/procurement?supplier=${supplierId}`}>
              Lihat Semua
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {procurements.map((procurement, index) => (
            <div key={procurement.id}>
              {index > 0 && <Separator className="my-3" />}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Link 
                      href={`/procurement/${procurement.id}`}
                      className="font-medium hover:text-primary hover:underline"
                    >
                      {procurement.procurementCode}
                    </Link>
                    <Badge 
                      variant={
                        procurement.status === 'COMPLETED' 
                          ? 'default' 
                          : procurement.status === 'CANCELLED'
                          ? 'destructive'
                          : 'secondary'
                      }
                      className="text-xs"
                    >
                      {procurement.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(procurement.procurementDate).toLocaleDateString('id-ID')}
                    </span>
                    {procurement.actualDelivery && (
                      <span>
                        Kirim: {new Date(procurement.actualDelivery).toLocaleDateString('id-ID')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                    }).format(procurement.totalAmount)}
                  </p>
                  <Badge 
                    variant="outline" 
                    className="mt-1 text-xs"
                  >
                    {procurement.paymentStatus}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
