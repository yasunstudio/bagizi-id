/**
 * @fileoverview Low Stock Alerts Component
 * @description Displays inventory items that need reordering
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Package, ArrowRight } from 'lucide-react'

interface LowStockItem {
  id: string
  itemName: string
  itemCode: string | null
  currentStock: number
  minStock: number
  unit: string
}

interface LowStockAlertsProps {
  items: LowStockItem[]
}

/**
 * Low Stock Alerts Component
 * @description Shows items below minimum stock level that need procurement
 */
export function LowStockAlerts({ items }: LowStockAlertsProps) {
  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-green-500" />
            Stok Rendah
          </CardTitle>
          <CardDescription>Item yang perlu di-order</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="h-12 w-12 text-green-500 mb-4" />
            <p className="text-sm font-medium text-foreground mb-1">
              Semua stok aman
            </p>
            <p className="text-xs text-muted-foreground">
              Tidak ada item yang perlu di-order
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-red-200 dark:border-red-900">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Stok Rendah
          </CardTitle>
          <CardDescription className="text-red-600 dark:text-red-400">
            {items.length} item perlu segera di-order
          </CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/inventory?filter=low-stock" className="flex items-center gap-1">
            Lihat Semua
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item) => {
            const stockPercentage = (item.currentStock / item.minStock) * 100
            const isCritical = stockPercentage < 50
            
            return (
              <Link
                key={item.id}
                href={`/inventory/${item.id}`}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  isCritical
                    ? 'border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20 hover:bg-red-100/50 dark:hover:bg-red-950/40'
                    : 'border-yellow-200 dark:border-yellow-900 bg-yellow-50/50 dark:bg-yellow-950/20 hover:bg-yellow-100/50 dark:hover:bg-yellow-950/40'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm truncate">
                      {item.itemName}
                    </p>
                    <Badge 
                      variant={isCritical ? "destructive" : "outline"}
                      className={isCritical ? "" : "bg-yellow-500/10 border-yellow-500/20 text-yellow-700 dark:text-yellow-400"}
                    >
                      {isCritical ? 'Kritis' : 'Rendah'}
                    </Badge>
                  </div>
                  {item.itemCode && (
                    <p className="text-xs text-muted-foreground mb-1">
                      Kode: {item.itemCode}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full transition-all ${
                          isCritical ? 'bg-red-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {Math.round(stockPercentage)}%
                    </span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className={`text-sm font-semibold ${
                    isCritical ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {item.currentStock} {item.unit}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Min: {item.minStock} {item.unit}
                  </p>
                  <Button 
                    size="sm" 
                    variant={isCritical ? "destructive" : "outline"}
                    className="mt-2"
                    onClick={(e) => {
                      e.preventDefault()
                      window.location.href = `/procurement/orders/new?item=${item.id}`
                    }}
                  >
                    Order
                  </Button>
                </div>
              </Link>
            )
          })}
        </div>
        
        <Button asChild className="w-full mt-4" variant="outline">
          <Link href="/procurement/orders/new">
            Buat Procurement Baru
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
