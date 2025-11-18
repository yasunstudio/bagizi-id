/**
 * @fileoverview Supplier Performance Ratings Component
 * @version Next.js 15.5.4
 * @description Display supplier performance ratings with progress bars
 * @author Bagizi-ID Development Team
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { TrendingUp } from 'lucide-react'
import type { Supplier } from '@prisma/client'

interface SupplierRatingsProps {
  supplier: Pick<Supplier,
    | 'overallRating'
    | 'qualityRating'
    | 'deliveryRating'
    | 'priceCompetitiveness'
    | 'serviceRating'
    | 'totalOrders'
    | 'successfulDeliveries'
    | 'failedDeliveries'
    | 'onTimeDeliveryRate'
    | 'averageDeliveryTime'
    | 'totalPurchaseValue'
  >
}

export function SupplierRatings({ supplier }: SupplierRatingsProps) {
  return (
    <div className="space-y-6">
      {/* Performance Ratings Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle>Rating Performance</CardTitle>
          </div>
          <CardDescription>Evaluasi kinerja supplier</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Overall Rating */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Rating</span>
                <span className="text-sm font-bold">{supplier.overallRating.toFixed(1)} / 5.0</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-400"
                  style={{ width: `${(supplier.overallRating / 5) * 100}%` }}
                />
              </div>
            </div>

            <Separator />

            {/* Quality Rating */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Kualitas</span>
                <span className="text-sm font-medium">{supplier.qualityRating.toFixed(1)}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500"
                  style={{ width: `${(supplier.qualityRating / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Delivery Rating */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Pengiriman</span>
                <span className="text-sm font-medium">{supplier.deliveryRating.toFixed(1)}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500"
                  style={{ width: `${(supplier.deliveryRating / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Price Rating */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Harga</span>
                <span className="text-sm font-medium">{supplier.priceCompetitiveness.toFixed(1)}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500"
                  style={{ width: `${(supplier.priceCompetitiveness / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Service Rating */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Pelayanan</span>
                <span className="text-sm font-medium">{supplier.serviceRating.toFixed(1)}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500"
                  style={{ width: `${(supplier.serviceRating / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Statistics Card */}
      <Card>
        <CardHeader>
          <CardTitle>Statistik Kinerja</CardTitle>
          <CardDescription>Data performa operasional</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Order:</span>
              <span className="font-medium">{supplier.totalOrders}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Pengiriman Sukses:</span>
              <span className="font-medium text-green-600">{supplier.successfulDeliveries}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Pengiriman Gagal:</span>
              <span className="font-medium text-red-600">{supplier.failedDeliveries}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">On-Time Delivery:</span>
              <span className="font-medium">{supplier.onTimeDeliveryRate.toFixed(1)}%</span>
            </div>
            {supplier.averageDeliveryTime && (
              <>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg. Waktu Kirim:</span>
                  <span className="font-medium">{supplier.averageDeliveryTime} jam</span>
                </div>
              </>
            )}
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Pembelian:</span>
              <span className="font-medium">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                  notation: 'compact',
                }).format(supplier.totalPurchaseValue)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
