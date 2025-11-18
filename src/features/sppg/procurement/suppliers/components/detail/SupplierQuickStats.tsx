/**
 * @fileoverview Supplier Quick Stats Component
 * @version Next.js 15.5.4
 * @description 4-card quick statistics display
 * @author Bagizi-ID Development Team
 */

import { Card, CardContent } from '@/components/ui/card'
import { 
  TrendingUp, 
  Package, 
  CheckCircle2, 
  DollarSign,
  Star
} from 'lucide-react'
import type { Supplier } from '@prisma/client'

interface SupplierQuickStatsProps {
  supplier: Pick<Supplier,
    | 'overallRating'
    | 'totalOrders'
    | 'onTimeDeliveryRate'
    | 'totalPurchaseValue'
  >
}

export function SupplierQuickStats({ supplier }: SupplierQuickStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Rating Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Rating</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-2xl font-bold">
                  {supplier.overallRating.toFixed(1)}
                </p>
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              </div>
            </div>
            <TrendingUp className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      {/* Total Orders Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Order</p>
              <p className="text-2xl font-bold mt-1">{supplier.totalOrders}</p>
            </div>
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      {/* On-Time Rate Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">On-Time Rate</p>
              <p className="text-2xl font-bold mt-1">
                {supplier.onTimeDeliveryRate.toFixed(0)}%
              </p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      {/* Total Purchase Value Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Pembelian</p>
              <p className="text-2xl font-bold mt-1">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(supplier.totalPurchaseValue)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
