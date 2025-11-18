/**
 * @fileoverview Procurement Statistics Cards Component
 * @description Displays 4 stat cards with real data and trends
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, ClipboardList, Users, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'

interface ProcurementStatsProps {
  stats: {
    orders: {
      total: number
      pending: number
      approved: number
      completed: number
      totalValue: number
      thisMonth: number
    }
    plans: {
      total: number
      active: number
      completed: number
      totalBudget: number
      usedBudget: number
      remainingBudget: number
    }
    suppliers: {
      total: number
      active: number
      preferred: number
      newThisMonth: number
    }
  }
}

/**
 * Procurement Statistics Cards
 * @description 4-column grid showing key procurement metrics with real-time data
 */
export function ProcurementStats({ stats }: ProcurementStatsProps) {
  // Calculate budget usage percentage
  const budgetUsagePercent = stats.plans.totalBudget > 0 
    ? Math.round((stats.plans.usedBudget / stats.plans.totalBudget) * 100)
    : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Orders with monthly trend */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Procurement
          </CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.orders.total}</div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">
              {stats.orders.thisMonth} bulan ini
            </Badge>
            {stats.orders.pending > 0 && (
              <Badge variant="destructive" className="text-xs">
                {stats.orders.pending} pending
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {stats.orders.completed} selesai, {stats.orders.approved} disetujui
          </p>
        </CardContent>
      </Card>

      {/* Active Plans with budget usage */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Rencana Aktif
          </CardTitle>
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.plans.active}</div>
          <div className="flex items-center gap-2 mt-1">
            <Badge 
              variant={budgetUsagePercent > 80 ? "destructive" : "secondary"}
              className="text-xs"
            >
              {budgetUsagePercent}% budget terpakai
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Sisa Rp {stats.plans.remainingBudget.toLocaleString('id-ID')}
          </p>
        </CardContent>
      </Card>

      {/* Suppliers with preferred count */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Supplier
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.suppliers.total}</div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">
              {stats.suppliers.active} aktif
            </Badge>
            {stats.suppliers.preferred > 0 && (
              <Badge variant="default" className="text-xs bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                {stats.suppliers.preferred} preferred
              </Badge>
            )}
          </div>
          {stats.suppliers.newThisMonth > 0 && (
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +{stats.suppliers.newThisMonth} supplier baru
            </p>
          )}
        </CardContent>
      </Card>

      {/* Total Spending with budget comparison */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Pengeluaran
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            Rp {stats.orders.totalValue.toLocaleString('id-ID')}
          </div>
          <div className="flex items-center gap-2 mt-1">
            {stats.orders.totalValue <= stats.plans.usedBudget ? (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                <TrendingDown className="h-3 w-3" />
                Sesuai budget
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-xs flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Over budget
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Budget: Rp {stats.plans.totalBudget.toLocaleString('id-ID')}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
