/**
 * @fileoverview Procurement Pagination Component
 * @version Next.js 15.5.4 / Enterprise Pattern
 * @author Bagizi-ID Development Team
 * 
 * FEATURES:
 * - Consistent pagination across all procurement modules
 * - Page size selector (10, 20, 50, 100)
 * - Navigation buttons (First, Previous, Next, Last)
 * - Info display (showing X-Y of Z items)
 * - Dark mode support
 * - Accessibility compliance
 */

'use client'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from 'lucide-react'

// ============================================
// TYPES
// ============================================

export interface ProcurementPaginationProps {
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  itemLabel?: string // e.g., "rencana", "supplier", "order"
  showPageSize?: boolean
}

// ============================================
// COMPONENT
// ============================================

/**
 * Standard pagination component for all procurement modules
 * 
 * @example
 * ```tsx
 * <ProcurementPagination
 *   currentPage={1}
 *   totalPages={10}
 *   pageSize={20}
 *   totalItems={200}
 *   onPageChange={(page) => setCurrentPage(page)}
 *   onPageSizeChange={(size) => setPageSize(size)}
 *   itemLabel="supplier"
 *   showPageSize
 * />
 * ```
 */
export function ProcurementPagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  itemLabel = 'item',
  showPageSize = true,
}: ProcurementPaginationProps) {
  // Calculate displayed items range
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  // Navigation handlers
  const goToFirstPage = () => onPageChange(1)
  const goToPreviousPage = () => onPageChange(Math.max(1, currentPage - 1))
  const goToNextPage = () => onPageChange(Math.min(totalPages, currentPage + 1))
  const goToLastPage = () => onPageChange(totalPages)

  // Disabled states
  const isFirstPage = currentPage === 1
  const isLastPage = currentPage === totalPages
  const hasNoPagination = totalPages <= 1

  // Don't show pagination if only 1 page
  if (hasNoPagination) {
    return null
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t bg-card">
      {/* Info Display */}
      <div className="text-sm text-muted-foreground">
        Menampilkan{' '}
        <span className="font-medium text-foreground">{startItem}</span> -{' '}
        <span className="font-medium text-foreground">{endItem}</span> dari{' '}
        <span className="font-medium text-foreground">{totalItems}</span> {itemLabel}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Page Size Selector */}
        {showPageSize && onPageSizeChange && (
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 per halaman</SelectItem>
              <SelectItem value="20">20 per halaman</SelectItem>
              <SelectItem value="50">50 per halaman</SelectItem>
              <SelectItem value="100">100 per halaman</SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center gap-1">
          {/* First Page */}
          <Button
            variant="outline"
            size="sm"
            onClick={goToFirstPage}
            disabled={isFirstPage}
            className="hidden sm:flex"
            aria-label="Halaman pertama"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          {/* Previous Page */}
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousPage}
            disabled={isFirstPage}
            aria-label="Halaman sebelumnya"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Sebelumnya</span>
          </Button>

          {/* Current Page Info */}
          <div className="px-3 py-1 text-sm text-muted-foreground">
            Halaman <span className="font-medium text-foreground">{currentPage}</span> dari{' '}
            <span className="font-medium text-foreground">{totalPages}</span>
          </div>

          {/* Next Page */}
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={isLastPage}
            aria-label="Halaman selanjutnya"
          >
            <span className="hidden sm:inline">Selanjutnya</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>

          {/* Last Page */}
          <Button
            variant="outline"
            size="sm"
            onClick={goToLastPage}
            disabled={isLastPage}
            className="hidden sm:flex"
            aria-label="Halaman terakhir"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
