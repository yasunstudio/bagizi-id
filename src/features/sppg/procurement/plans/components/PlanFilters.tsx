/**
 * @fileoverview Plan Filters - Enterprise Grade
 * @version Next.js 15.5.4 / React 19
 * @author Bagizi-ID Development Team
 * 
 * ENTERPRISE-GRADE INLINE FILTERS:
 * - Always visible, compact horizontal layout
 * - Real-time filtering without form submission
 * - Professional UI like Google Admin, Salesforce
 * - Optimized for desktop enterprise users
 * - Clear, accessible, and efficient
 */

'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Search,
  X,
  Calendar,
  DollarSign,
  CheckSquare,
} from 'lucide-react'
import type { PlanFiltersFormInput, PlanApprovalStatus } from '../types'

// ================================ TYPES ================================

interface PlanFiltersProps {
  initialFilters?: Partial<PlanFiltersFormInput>
  onFiltersChange?: (filters: Partial<PlanFiltersFormInput>) => void
  onApplyFilters?: (filters: Partial<PlanFiltersFormInput>) => void
  onClearFilters?: () => void
  activeFilterCount?: number
  className?: string
}

// ================================ CONSTANTS ================================

const STATUS_OPTIONS: { value: PlanApprovalStatus; label: string; color: string }[] = [
  { value: 'DRAFT', label: 'Draft', color: 'bg-gray-500' },
  { value: 'SUBMITTED', label: 'Submitted', color: 'bg-blue-500' },
  { value: 'UNDER_REVIEW', label: 'Under Review', color: 'bg-yellow-500' },
  { value: 'APPROVED', label: 'Approved', color: 'bg-green-500' },
  { value: 'REJECTED', label: 'Rejected', color: 'bg-red-500' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-gray-400' },
]

const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i)

const MONTH_OPTIONS = [
  { value: 1, label: 'Jan' },
  { value: 2, label: 'Feb' },
  { value: 3, label: 'Mar' },
  { value: 4, label: 'Apr' },
  { value: 5, label: 'May' },
  { value: 6, label: 'Jun' },
  { value: 7, label: 'Jul' },
  { value: 8, label: 'Aug' },
  { value: 9, label: 'Sep' },
  { value: 10, label: 'Oct' },
  { value: 11, label: 'Nov' },
  { value: 12, label: 'Dec' },
]

const QUARTER_OPTIONS = [
  { value: 1, label: 'Q1' },
  { value: 2, label: 'Q2' },
  { value: 3, label: 'Q3' },
  { value: 4, label: 'Q4' },
]

// ================================ COMPONENT ================================

export function PlanFilters({
  initialFilters = {},
  onFiltersChange,
  onApplyFilters,
  activeFilterCount = 0,
  className = '',
}: PlanFiltersProps) {
  const [localFilters, setLocalFilters] = useState<Partial<PlanFiltersFormInput>>(initialFilters)
  const [statusOpen, setStatusOpen] = useState(false)

  // Update local filters when initial filters change
  useEffect(() => {
    setLocalFilters(initialFilters)
  }, [initialFilters])

  // Handle filter change with real-time update
  const handleFilterChange = (key: keyof PlanFiltersFormInput, value: unknown) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    
    // Support both new callback pattern and legacy pattern
    if (onFiltersChange) {
      onFiltersChange(newFilters)
    }
    if (onApplyFilters) {
      onApplyFilters(newFilters)
    }
  }

  // Handle status toggle
  const handleStatusToggle = (status: PlanApprovalStatus) => {
    const currentStatuses = localFilters.approvalStatus || []
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter((s) => s !== status)
      : [...currentStatuses, status]
    
    handleFilterChange('approvalStatus', newStatuses.length > 0 ? newStatuses : undefined)
  }

  // Clear single filter
  const clearFilter = (key: keyof PlanFiltersFormInput) => {
    const newFilters = { ...localFilters }
    delete newFilters[key]
    setLocalFilters(newFilters)
    
    if (onFiltersChange) {
      onFiltersChange(newFilters)
    }
    if (onApplyFilters) {
      onApplyFilters(newFilters)
    }
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {/* Search Input - Always Visible */}
      <div className="relative w-64">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search plans..."
          value={localFilters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
          className="h-9 pl-8 pr-8 text-sm"
        />
        {localFilters.search && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => clearFilter('search')}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Status Filter - Popover */}
      <Popover open={statusOpen} onOpenChange={setStatusOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 text-sm font-normal"
          >
            <CheckSquare className="h-3.5 w-3.5" />
            <span>Status</span>
            {(localFilters.approvalStatus?.length ?? 0) > 0 && (
              <>
                <span className="text-xs text-muted-foreground">:</span>
                <Badge variant="secondary" className="h-4 px-1 text-xs">
                  {localFilters.approvalStatus?.length}
                </Badge>
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-3" align="start">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Approval Status
            </div>
            {STATUS_OPTIONS.map((option) => {
              const isChecked = localFilters.approvalStatus?.includes(option.value) ?? false
              return (
                <div key={option.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`status-${option.value}`}
                    checked={isChecked}
                    onCheckedChange={() => handleStatusToggle(option.value)}
                  />
                  <Label
                    htmlFor={`status-${option.value}`}
                    className="flex items-center gap-2 text-sm font-normal cursor-pointer flex-1"
                  >
                    <span className={`h-2 w-2 rounded-full ${option.color}`} />
                    {option.label}
                  </Label>
                </div>
              )
            })}
          </div>
        </PopoverContent>
      </Popover>

      {/* Year Filter */}
      <Select
        value={localFilters.planYear?.toString() || 'all'}
        onValueChange={(value) => handleFilterChange('planYear', value !== 'all' ? parseInt(value) : undefined)}
      >
        <SelectTrigger className="h-9 w-[110px] text-sm">
          <Calendar className="h-3.5 w-3.5 mr-1.5" />
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Years</SelectItem>
          {YEAR_OPTIONS.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Month Filter */}
      <Select
        value={localFilters.planMonth?.toString() || 'all'}
        onValueChange={(value) => handleFilterChange('planMonth', value !== 'all' ? parseInt(value) : undefined)}
      >
        <SelectTrigger className="h-9 w-[100px] text-sm">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Months</SelectItem>
          {MONTH_OPTIONS.map((month) => (
            <SelectItem key={month.value} value={month.value.toString()}>
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Quarter Filter */}
      <Select
        value={localFilters.planQuarter?.toString() || 'all'}
        onValueChange={(value) => handleFilterChange('planQuarter', value !== 'all' ? parseInt(value) : undefined)}
      >
        <SelectTrigger className="h-9 w-[100px] text-sm">
          <SelectValue placeholder="Quarter" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Quarters</SelectItem>
          {QUARTER_OPTIONS.map((quarter) => (
            <SelectItem key={quarter.value} value={quarter.value.toString()}>
              {quarter.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Budget Range - Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 text-sm font-normal"
          >
            <DollarSign className="h-3.5 w-3.5" />
            <span>Budget</span>
            {(localFilters.minBudget || localFilters.maxBudget) && (
              <>
                <span className="text-xs text-muted-foreground">:</span>
                <Badge variant="secondary" className="h-4 px-1 text-xs">
                  {localFilters.minBudget && localFilters.maxBudget
                    ? '2'
                    : '1'}
                </Badge>
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-4" align="start">
          <div className="space-y-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Budget Range
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="minBudget" className="text-xs">
                  Minimum
                </Label>
                <Input
                  id="minBudget"
                  type="number"
                  placeholder="0"
                  value={localFilters.minBudget || ''}
                  onChange={(e) =>
                    handleFilterChange('minBudget', e.target.value ? parseFloat(e.target.value) : undefined)
                  }
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="maxBudget" className="text-xs">
                  Maximum
                </Label>
                <Input
                  id="maxBudget"
                  type="number"
                  placeholder="999999"
                  value={localFilters.maxBudget || ''}
                  onChange={(e) =>
                    handleFilterChange('maxBudget', e.target.value ? parseFloat(e.target.value) : undefined)
                  }
                  className="h-8 text-sm"
                />
              </div>
            </div>
            {(localFilters.minBudget || localFilters.maxBudget) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  clearFilter('minBudget')
                  clearFilter('maxBudget')
                }}
                className="w-full h-7 text-xs"
              >
                Clear Budget Range
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filters Summary (Right Side) */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-1 ml-auto">
          <span className="text-xs text-muted-foreground">
            {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
          </span>
        </div>
      )}
    </div>
  )
}
