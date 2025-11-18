/**
 * @fileoverview Procurement Table Filters Component
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 * 
 * Standardized filter and search component for all procurement module tables.
 * Provides consistent UI/UX across Plans, Suppliers, Orders, Receipts, and Payments.
 * 
 * Features:
 * - Search input with icon
 * - Multiple filter dropdowns (optional)
 * - Clear all filters button
 * - Responsive design
 * - Dark mode support
 * - TypeScript type safety
 * - React.memo optimized to prevent unnecessary re-renders
 */

'use client'

import { memo } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Filter option interface
 * Used for dropdown filters (status, type, category, etc.)
 */
export interface FilterOption {
  value: string
  label: string
}

/**
 * Filter definition interface
 * Defines each filter dropdown configuration
 */
export interface FilterDefinition {
  key: string                    // Unique key for the filter
  label: string                  // Label displayed to user
  placeholder?: string           // Placeholder text for select
  options: FilterOption[]        // Available options
  value: string                  // Current selected value
  onChange: (value: string) => void  // Change handler
}

/**
 * ProcurementTableFilters Props
 */
export interface ProcurementTableFiltersProps {
  /** Search query value */
  searchValue: string
  
  /** Search placeholder text (default: "Cari...") */
  searchPlaceholder?: string
  
  /** Search change handler */
  onSearchChange: (value: string) => void
  
  /** Array of filter definitions (optional) */
  filters?: FilterDefinition[]
  
  /** Show clear all filters button when filters are active */
  showClearButton?: boolean
  
  /** Clear all filters handler */
  onClearAll?: () => void
  
  /** Additional CSS classes */
  className?: string
  
  /** Hide search input */
  hideSearch?: boolean
}

/**
 * Procurement Table Filters Component
 * Standardized filter UI for all procurement tables
 * 
 * @example
 * ```tsx
 * <ProcurementTableFilters
 *   searchValue={search}
 *   searchPlaceholder="Cari supplier..."
 *   onSearchChange={setSearch}
 *   filters={[
 *     {
 *       key: 'status',
 *       label: 'Status',
 *       placeholder: 'Semua Status',
 *       options: [
 *         { value: 'ALL', label: 'Semua' },
 *         { value: 'ACTIVE', label: 'Aktif' },
 *         { value: 'INACTIVE', label: 'Tidak Aktif' },
 *       ],
 *       value: statusFilter,
 *       onChange: setStatusFilter,
 *     },
 *   ]}
 *   showClearButton
 *   onClearAll={() => {
 *     setSearch('')
 *     setStatusFilter('ALL')
 *   }}
 * />
 * ```
 */
const ProcurementTableFiltersComponent = ({
  searchValue,
  searchPlaceholder = 'Cari...',
  onSearchChange,
  filters = [],
  showClearButton = false,
  onClearAll,
  className,
  hideSearch = false,
}: ProcurementTableFiltersProps) => {
  // Check if any filters are active (not 'ALL')
  const hasActiveFilters =
    searchValue.length > 0 ||
    filters.some((filter) => filter.value !== 'ALL')

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row gap-3 p-4 border-b bg-muted/30',
        className
      )}
    >
      {/* Search Input */}
      {!hideSearch && (
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-4"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Filter Dropdowns */}
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Select
              key={filter.key}
              value={filter.value}
              onValueChange={filter.onChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={filter.placeholder || filter.label} />
              </SelectTrigger>
              <SelectContent>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>
      )}

      {/* Clear All Button */}
      {showClearButton && hasActiveFilters && onClearAll && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="whitespace-nowrap"
        >
          <X className="h-4 w-4 mr-2" />
          Reset Filter
        </Button>
      )}
    </div>
  )
}

// Custom comparison function for React.memo
// Only re-render if searchValue or filter values actually change
const arePropsEqual = (
  prevProps: ProcurementTableFiltersProps,
  nextProps: ProcurementTableFiltersProps
): boolean => {
  // Check if searchValue changed
  if (prevProps.searchValue !== nextProps.searchValue) {
    return false
  }

  // Check if filters array length changed
  if (prevProps.filters?.length !== nextProps.filters?.length) {
    return false
  }

  // Check if any filter value changed
  if (prevProps.filters && nextProps.filters) {
    for (let i = 0; i < prevProps.filters.length; i++) {
      if (prevProps.filters[i].value !== nextProps.filters[i].value) {
        return false
      }
    }
  }

  // All checks passed - props are equal, skip re-render
  return true
}

// Export memoized version to prevent unnecessary re-renders
export const ProcurementTableFilters = memo(ProcurementTableFiltersComponent, arePropsEqual)