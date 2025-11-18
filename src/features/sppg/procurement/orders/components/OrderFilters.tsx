/**
 * @fileoverview Order Filters Component - Advanced filtering for orders list
 * @version Next.js 15.5.4 / React 19 / TypeScript 5.7.2
 * @author Bagizi-ID Development Team
 * @see {@link /docs/PROCUREMENT_WORKFLOW_GUIDE.md} Procurement Documentation
 * 
 * COMPONENT FEATURES:
 * - Advanced filtering with multiple criteria
 * - Date range picker for order/delivery dates
 * - Status, payment status, delivery status filters
 * - Supplier, plan selection
 * - Amount range filtering
 * - Search by order code
 * - Filter reset functionality
 * - Collapsible filter panel
 * - Active filter count badge
 * 
 * USAGE:
 * ```tsx
 * <OrderFilters
 *   filters={currentFilters}
 *   onFiltersChange={handleFiltersChange}
 *   onReset={handleReset}
 * />
 * ```
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Filter, 
  X, 
  Search,
  Calendar,
  DollarSign,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import type { OrderFilters as OrderFiltersType } from '../types'
import type { ProcurementStatus } from '@prisma/client'

// ================================ TYPES ================================

interface OrderFiltersProps {
  filters: OrderFiltersType
  onFiltersChange: (filters: OrderFiltersType) => void
  onReset: () => void
  suppliers?: Array<{ id: string; supplierName: string }>
  plans?: Array<{ id: string; planName: string; planCode: string }>
}

// ================================ CONSTANTS ================================

const STATUS_OPTIONS: Array<{ value: ProcurementStatus; label: string }> = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PENDING_APPROVAL', label: 'Menunggu Persetujuan' },
  { value: 'APPROVED', label: 'Disetujui' },
  { value: 'ORDERED', label: 'Dipesan' },
  { value: 'PARTIALLY_RECEIVED', label: 'Diterima Sebagian' },
  { value: 'FULLY_RECEIVED', label: 'Diterima Penuh' },
  { value: 'COMPLETED', label: 'Selesai' },
  { value: 'CANCELLED', label: 'Dibatalkan' },
  { value: 'REJECTED', label: 'Ditolak' },
]

const PAYMENT_STATUS_OPTIONS = [
  { value: 'UNPAID', label: 'Belum Dibayar' },
  { value: 'PARTIAL', label: 'Dibayar Sebagian' },
  { value: 'PAID', label: 'Lunas' },
  { value: 'OVERDUE', label: 'Jatuh Tempo' },
]

const DELIVERY_STATUS_OPTIONS = [
  { value: 'ORDERED', label: 'Dipesan' },
  { value: 'SHIPPED', label: 'Dikirim' },
  { value: 'IN_TRANSIT', label: 'Dalam Perjalanan' },
  { value: 'DELIVERED', label: 'Terkirim' },
  { value: 'PARTIAL', label: 'Terkirim Sebagian' },
  { value: 'CANCELLED', label: 'Dibatalkan' },
]

// ================================ COMPONENT ================================

/**
 * OrderFilters - Advanced filtering component for orders
 * 
 * Features:
 * - Multiple filter criteria
 * - Date range selection
 * - Status filters (order, payment, delivery)
 * - Supplier and plan selection
 * - Amount range filtering
 * - Search by code
 * - Filter reset
 * - Collapsible panel
 * - Active filter count
 */
export function OrderFilters({
  filters,
  onFiltersChange,
  onReset,
  suppliers = [],
  plans = [],
}: OrderFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Count active filters
  const activeFilterCount = Object.values(filters).filter((value) => {
    if (Array.isArray(value)) return value.length > 0
    return value !== undefined && value !== null && value !== ''
  }).length

  // Handle filter change
  const handleFilterChange = (key: keyof OrderFiltersType, value: string | number | string[] | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  // Handle reset
  const handleReset = () => {
    onReset()
    setIsExpanded(false)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </CardTitle>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFilterCount} aktif
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-8 px-2 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Reset
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4 pt-0">
          {/* Search by Code */}
          <div className="space-y-2">
            <Label htmlFor="search" className="text-xs font-medium">
              Cari Kode Order
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                type="text"
                placeholder="Cari kode order..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-xs font-medium">
                Status Order
              </Label>
              <Select
                value={Array.isArray(filters.status) && filters.status.length > 0 ? filters.status[0] : undefined}
                onValueChange={(value) => handleFilterChange('status', value ? [value as ProcurementStatus] : undefined)}
              >
                <SelectTrigger id="status" className="h-9">
                  <SelectValue placeholder="Semua status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="paymentStatus" className="text-xs font-medium">
                Status Pembayaran
              </Label>
              <Select
                value={Array.isArray(filters.paymentStatus) && filters.paymentStatus.length > 0 ? filters.paymentStatus[0] : undefined}
                onValueChange={(value) => handleFilterChange('paymentStatus', value ? [value] : undefined)}
              >
                <SelectTrigger id="paymentStatus" className="h-9">
                  <SelectValue placeholder="Semua status" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Delivery Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="deliveryStatus" className="text-xs font-medium">
                Status Pengiriman
              </Label>
              <Select
                value={Array.isArray(filters.deliveryStatus) && filters.deliveryStatus.length > 0 ? filters.deliveryStatus[0] : undefined}
                onValueChange={(value) => handleFilterChange('deliveryStatus', value ? [value] : undefined)}
              >
                <SelectTrigger id="deliveryStatus" className="h-9">
                  <SelectValue placeholder="Semua status" />
                </SelectTrigger>
                <SelectContent>
                  {DELIVERY_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Supplier Filter */}
            <div className="space-y-2">
              <Label htmlFor="supplierId" className="text-xs font-medium">
                Supplier
              </Label>
              <Select
                value={filters.supplierId || undefined}
                onValueChange={(value) => handleFilterChange('supplierId', value || undefined)}
              >
                <SelectTrigger id="supplierId" className="h-9">
                  <SelectValue placeholder="Semua supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.supplierName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Plan Filter */}
            <div className="space-y-2">
              <Label htmlFor="planId" className="text-xs font-medium">
                Rencana Pengadaan
              </Label>
              <Select
                value={filters.planId || undefined}
                onValueChange={(value) => handleFilterChange('planId', value || undefined)}
              >
                <SelectTrigger id="planId" className="h-9">
                  <SelectValue placeholder="Semua rencana" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.planName} ({plan.planCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Range Filters */}
          <div className="space-y-3">
            <Label className="text-xs font-medium flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Rentang Tanggal
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Procurement Date Range */}
              <div className="space-y-2">
                <Label htmlFor="dateFrom" className="text-xs text-muted-foreground">
                  Tanggal Order (Dari)
                </Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value || undefined)}
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateTo" className="text-xs text-muted-foreground">
                  Tanggal Order (Sampai)
                </Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value || undefined)}
                  className="h-9"
                />
              </div>
            </div>
          </div>

          {/* Amount Range Filters */}
          <div className="space-y-3">
            <Label className="text-xs font-medium flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Rentang Nominal
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minAmount" className="text-xs text-muted-foreground">
                  Dari (Rp)
                </Label>
                <Input
                  id="minAmount"
                  type="number"
                  placeholder="0"
                  value={filters.minAmount || ''}
                  onChange={(e) => handleFilterChange('minAmount', e.target.value ? Number(e.target.value) : undefined)}
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxAmount" className="text-xs text-muted-foreground">
                  Sampai (Rp)
                </Label>
                <Input
                  id="maxAmount"
                  type="number"
                  placeholder="0"
                  value={filters.maxAmount || ''}
                  onChange={(e) => handleFilterChange('maxAmount', e.target.value ? Number(e.target.value) : undefined)}
                  className="h-9"
                />
              </div>
            </div>
          </div>

          {/* Apply/Reset Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={activeFilterCount === 0}
            >
              Reset Filter
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsExpanded(false)}
            >
              Terapkan Filter
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
