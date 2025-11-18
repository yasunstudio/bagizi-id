/**
 * @fileoverview Supplier Statistics Cards Component
 * Professional statistics display with color-coded status indicators
 * 
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * FEATURES:
 * - 4 statistics cards (Total, Active, Inactive, Suspended)
 * - Color-coded by status (green for active, orange for inactive, red for suspended)
 * - Percentage displays for active/inactive
 * - Professional icons from lucide-react
 * - Responsive grid layout
 * - Dark mode support
 * - shadcn/ui Card components
 * 
 * USAGE:
 * ```typescript
 * <SupplierStatsCards stats={statistics} />
 * ```
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import type { SupplierPageStatistics } from '@/features/sppg/procurement/suppliers/types'

/**
 * Props for SupplierStatsCards component
 */
interface SupplierStatsCardsProps {
  stats: SupplierPageStatistics
}

/**
 * Supplier Statistics Cards Component
 * Displays key supplier metrics in a 4-card grid
 * 
 * @component
 * @param {SupplierStatsCardsProps} props - Component props
 * @param {SupplierPageStatistics} props.stats - Supplier statistics data
 * 
 * @example
 * ```typescript
 * const stats = {
 *   total: 45,
 *   active: 38,
 *   inactive: 5,
 *   suspended: 2,
 *   activePercentage: 84,
 *   inactivePercentage: 11
 * }
 * <SupplierStatsCards stats={stats} />
 * ```
 */
export function SupplierStatsCards({ stats }: SupplierStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* ================================ TOTAL SUPPLIERS CARD ================================ */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Supplier
          </CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.total}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Semua supplier terdaftar
          </p>
        </CardContent>
      </Card>

      {/* ================================ ACTIVE SUPPLIERS CARD ================================ */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Supplier Aktif
          </CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 dark:text-green-500">
            {stats.active}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            <span className="font-medium text-green-600 dark:text-green-500">
              {stats.activePercentage}%
            </span>{' '}
            dari total supplier
          </p>
        </CardContent>
      </Card>

      {/* ================================ INACTIVE SUPPLIERS CARD ================================ */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Supplier Tidak Aktif
          </CardTitle>
          <XCircle className="h-4 w-4 text-orange-600 dark:text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-500">
            {stats.inactive}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            <span className="font-medium text-orange-600 dark:text-orange-500">
              {stats.inactivePercentage}%
            </span>{' '}
            dari total supplier
          </p>
        </CardContent>
      </Card>

      {/* ================================ SUSPENDED SUPPLIERS CARD ================================ */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Supplier Suspended
          </CardTitle>
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600 dark:text-red-500">
            {stats.suspended}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Memerlukan tindakan
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
