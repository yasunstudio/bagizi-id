/**
 * @fileoverview Payment List Component - Data table with filters
 * @version Next.js 15.5.4 / shadcn/ui / TanStack Table
 * @author Bagizi-ID Development Team
 * 
 * FEATURES:
 * - Paginated data table
 * - Multi-column filtering (status, date range, supplier, amount)
 * - Search by procurement code, supplier, invoice
 * - Sort by columns
 * - Export to CSV
 * - Bulk actions
 * - Real-time updates via TanStack Query
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { usePayments } from '../hooks'
import { formatPaymentStatus, getPaymentStatusBadgeVariant, type PaymentStatus } from '../types'
import { ProcurementPagination, ProcurementTableFilters } from '@/components/shared/procurement'
import { 
  Download, 
  ArrowUpDown,
  ExternalLink,
  DollarSign,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaymentListProps {
  className?: string
  onPayClick?: (procurementId: string) => void
}

/**
 * Payment List Table Component
 * Displays payments with advanced filtering and pagination
 */
export function PaymentList({ className, onPayClick }: PaymentListProps) {
  // Filter state
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'ALL'>('ALL')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [sortBy, setSortBy] = useState<string>('procurementDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Build filters
  const filters = {
    search: search || undefined,
    paymentStatus: statusFilter !== 'ALL' ? [statusFilter] : undefined,
    page,
    limit,
    sortBy,
    sortOrder,
  }

  // Fetch data
  const { data, isLoading, error } = usePayments(filters)

  const payments = data?.data?.payments || []
  const pagination = data?.data?.pagination

  /**
   * Handle sort by column
   */
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  /**
   * Export to CSV
   */
  const handleExport = () => {
    if (payments.length === 0) return

    const csv = [
      ['Kode Pengadaan', 'Supplier', 'Total Tagihan', 'Sudah Dibayar', 'Sisa', 'Status', 'Jatuh Tempo', 'Invoice'].join(','),
      ...payments.map(p => [
        p.procurementCode,
        p.supplierName || '-',
        p.totalAmount,
        p.paidAmount,
        p.remainingAmount,
        p.paymentStatus,
        p.paymentDue ? new Date(p.paymentDue).toISOString().split('T')[0] : '-',
        p.invoiceNumber || '-',
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Daftar Pembayaran</CardTitle>
            <CardDescription>
              Kelola kewajiban pembayaran kepada supplier
            </CardDescription>
          </div>
          <Button onClick={handleExport} variant="outline" size="sm" disabled={payments.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Ekspor CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Enterprise-Grade Filter Bar */}
        <ProcurementTableFilters
          searchValue={search}
          searchPlaceholder="Cari berdasarkan kode pengadaan, supplier, invoice..."
          onSearchChange={(value) => {
            setSearch(value)
            setPage(1)
          }}
          filters={[
            {
              key: 'status',
              label: 'Status Pembayaran',
              placeholder: 'Semua Status',
              options: [
                { value: 'ALL', label: 'Semua Status' },
                { value: 'UNPAID', label: 'Belum Dibayar' },
                { value: 'PARTIALLY_PAID', label: 'Dibayar Sebagian' },
                { value: 'PAID', label: 'Lunas' },
                { value: 'OVERDUE', label: 'Terlambat' },
                { value: 'CANCELLED', label: 'Dibatalkan' },
              ],
              value: statusFilter,
              onChange: (value) => {
                setStatusFilter(value as PaymentStatus | 'ALL')
                setPage(1)
              },
            },
          ]}
          showClearButton
          onClearAll={() => {
            setSearch('')
            setStatusFilter('ALL')
            setPage(1)
          }}
        />

        {/* Error State */}
        {error && (
          <div className="text-sm text-destructive">
            Gagal memuat data pembayaran. Silakan coba lagi.
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        )}

        {/* Table */}
        {!isLoading && !error && (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('procurementCode')}
                        className="h-8 gap-1"
                      >
                        Pengadaan
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('totalAmount')}
                        className="h-8 gap-1"
                      >
                        Total
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">Dibayar</TableHead>
                    <TableHead className="text-right">Sisa</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('paymentDue')}
                        className="h-8 gap-1"
                      >
                        Jatuh Tempo
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        Tidak ada pembayaran ditemukan. Coba sesuaikan filter Anda.
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((payment) => (
                      <TableRow key={payment.procurementId}>
                        <TableCell>
                          <div className="space-y-1">
                            <Link
                              href={`/procurement/orders/${payment.procurementId}`}
                              className="font-medium hover:underline"
                            >
                              {payment.procurementCode}
                            </Link>
                            {payment.invoiceNumber && (
                              <div className="text-xs text-muted-foreground">
                                Invoice: {payment.invoiceNumber}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate">
                            {payment.supplierName || '-'}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          Rp {payment.totalAmount.toLocaleString('id-ID')}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          Rp {payment.paidAmount.toLocaleString('id-ID')}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          Rp {payment.remainingAmount.toLocaleString('id-ID')}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPaymentStatusBadgeVariant(payment.paymentStatus)}>
                            {formatPaymentStatus(payment.paymentStatus)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {payment.paymentDue ? (
                            <div className={cn(
                              'text-sm',
                              new Date(payment.paymentDue) < new Date() && 
                              payment.paymentStatus !== 'PAID' && 
                              'text-destructive font-semibold'
                            )}>
                              {new Date(payment.paymentDue).toLocaleDateString('id-ID')}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {payment.paymentStatus !== 'PAID' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onPayClick?.(payment.procurementId)}
                              >
                                <DollarSign className="h-4 w-4" />
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" asChild>
                              <Link href={`/procurement/orders/${payment.procurementId}`}>
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <ProcurementPagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                pageSize={limit}
                totalItems={pagination.total}
                onPageChange={setPage}
                itemLabel="payment"
                showPageSize={false}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
