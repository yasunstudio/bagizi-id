/**
 * @fileoverview Supplier Quick Stats Footer Component
 * Professional footer with key metrics
 * 
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * FEATURES:
 * - Verified suppliers count (real data from API)
 * - Professional footer design
 * - Dark mode support
 * - shadcn/ui components
 * 
 * IMPLEMENTATION:
 * - ✅ No hardcoded/mock data
 * - ✅ All metrics from real database queries
 * - ✅ API-first architecture compliance
 * 
 * USAGE:
 * ```typescript
 * <SupplierQuickStats stats={statistics} />
 * ```
 */

'use client'

import { CheckCircle2 } from 'lucide-react'
import type { SupplierPageStatistics } from '@/features/sppg/procurement/suppliers/types'

/**
 * Props for SupplierQuickStats component
 */
interface SupplierQuickStatsProps {
  stats: SupplierPageStatistics
}

/**
 * Supplier Quick Stats Footer Component
 * Displays summary metrics at page bottom
 * 
 * @component
 * @param {SupplierQuickStatsProps} props - Component props
 * @param {SupplierPageStatistics} props.stats - Supplier statistics data
 * 
 * @example
 * ```typescript
 * const stats = {
 *   active: 38,
 *   total: 45
 * }
 * <SupplierQuickStats stats={stats} />
 * ```
 */
export function SupplierQuickStats({ stats }: SupplierQuickStatsProps) {
  return (
    <div className="flex items-center justify-center rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
      {/* ================================ VERIFIED METRIC ================================ */}
      <div className="flex items-center gap-3">
        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500" />
        <div className="text-sm">
          <span className="text-muted-foreground">Supplier Terverifikasi:</span>
          <span className="ml-2 font-semibold text-green-600 dark:text-green-500">
            {stats.active} dari {stats.total}
          </span>
          <span className="ml-2 text-xs text-muted-foreground">
            ({stats.activePercentage}% aktif)
          </span>
        </div>
      </div>
    </div>
  )
}
