/**
 * @fileoverview Supplier Active Filters Component
 * Displays active filters with clear button
 * 
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * FEATURES:
 * - Conditional display based on active filters
 * - Type filter badge with translated labels
 * - Category/search filter badge
 * - "Hapus Semua Filter" button
 * - Primary-themed card for visibility
 * - Dark mode support
 * - shadcn/ui components
 * 
 * USAGE:
 * ```typescript
 * <SupplierActiveFilters 
 *   filters={{ type: 'LOCAL', category: 'makanan' }}
 *   hasActiveFilters={true}
 * />
 * ```
 */

'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Filter } from 'lucide-react'
import type { SupplierType } from '@prisma/client'

/**
 * Active filters object structure
 */
interface ActiveFilters {
  type?: SupplierType | string
  category?: string
}

/**
 * Props for SupplierActiveFilters component
 */
interface SupplierActiveFiltersProps {
  filters: ActiveFilters
  hasActiveFilters: boolean
}

/**
 * Supplier type label mapping
 * Translates enum values to Indonesian labels
 */
const SUPPLIER_TYPE_LABELS: Record<string, string> = {
  'LOCAL': 'Lokal',
  'REGIONAL': 'Regional',
  'NATIONAL': 'Nasional',
  'INTERNATIONAL': 'Internasional',
  'COOPERATIVE': 'Koperasi',
  'INDIVIDUAL': 'Perorangan'
}

/**
 * Supplier Active Filters Component
 * Shows currently active filters with option to clear all
 * Only displays when filters are active
 * 
 * @component
 * @param {SupplierActiveFiltersProps} props - Component props
 * @param {ActiveFilters} props.filters - Current filter values
 * @param {boolean} props.hasActiveFilters - Whether any filters are active
 * 
 * @example
 * ```typescript
 * const filters = { type: 'LOCAL', category: 'makanan' }
 * <SupplierActiveFilters 
 *   filters={filters}
 *   hasActiveFilters={true}
 * />
 * ```
 */
export function SupplierActiveFilters({ 
  filters, 
  hasActiveFilters 
}: SupplierActiveFiltersProps) {
  // Don't render if no active filters
  if (!hasActiveFilters) {
    return null
  }

  return (
    <Card className="border-primary/20 bg-primary/5 dark:bg-primary/10">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm">Filter Aktif</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {/* Type Filter Badge */}
          {filters.type && (
            <Badge variant="secondary" className="gap-1">
              <span className="text-xs text-muted-foreground">Tipe:</span>
              <span className="font-medium">
                {SUPPLIER_TYPE_LABELS[filters.type] || filters.type}
              </span>
            </Badge>
          )}
          
          {/* Category/Search Filter Badge */}
          {filters.category && (
            <Badge variant="secondary" className="gap-1">
              <span className="text-xs text-muted-foreground">Kategori:</span>
              <span className="font-medium">&ldquo;{filters.category}&rdquo;</span>
            </Badge>
          )}

          {/* Clear All Filters Button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            asChild
          >
            <Link href="/procurement/suppliers">
              Hapus Semua Filter
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
