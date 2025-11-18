/**
 * @fileoverview ReportsDashboard Component - Comprehensive Procurement Analytics
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 * 
 * Features:
 * - 4 report types: Cost Analysis, Supplier Performance, Menu Usage, Budget Tracking
 * - Date range filtering with Calendar component
 * - Program and Supplier filters
 * - Dynamic data tables based on report type
 * - CSV export functionality
 * - Loading states with Skeleton components
 * - Error and empty states
 * - Dark mode compatible
 * - Fully responsive design
 * 
 * @example
 * <ReportsDashboard
 *   programs={allPrograms}
 *   suppliers={allSuppliers}
 *   defaultReportType="cost-analysis"
 * />
 */

'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { id as indonesianLocale } from 'date-fns/locale'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DollarSign,
  TrendingUp,
  FileText,
  Users,
  CalendarIcon,
  Download,
  RotateCcw,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useReports, useDownloadReportCSV } from '../hooks'
import type {
  ReportType,
  ReportFilters,
  Program,
  Supplier,
  CostAnalysisRow,
  SupplierPerformanceRow,
  MenuUsageRow,
  BudgetTrackingRow,
} from '../types'

interface ReportsDashboardProps {
  programs: Program[]
  suppliers: Supplier[]
  defaultReportType?: ReportType
  className?: string
}

// Report type configuration
const reportTypeConfig = {
  'cost-analysis': {
    label: 'Cost Analysis',
    labelId: 'Analisis Biaya',
    icon: DollarSign,
    description: 'Total biaya procurement, production, dan distribution',
  },
  'supplier-performance': {
    label: 'Supplier Performance',
    labelId: 'Performa Supplier',
    icon: TrendingUp,
    description: 'Evaluasi performa dan kualitas supplier',
  },
  'menu-usage': {
    label: 'Menu Usage',
    labelId: 'Penggunaan Menu',
    icon: FileText,
    description: 'Statistik produksi dan popularitas menu',
  },
  'budget-tracking': {
    label: 'Budget Tracking',
    labelId: 'Tracking Budget',
    icon: Users,
    description: 'Monitoring penggunaan dan sisa budget',
  },
} as const

// Currency formatter
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function ReportsDashboard({
  programs,
  suppliers,
  defaultReportType = 'cost-analysis',
  className,
}: ReportsDashboardProps) {
  // State for filters
  const [reportType, setReportType] = useState<ReportType>(defaultReportType)
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  )
  const [endDate, setEndDate] = useState<Date | undefined>(new Date())
  const [selectedProgramId, setSelectedProgramId] = useState<string>('')
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('')

  // Build filters for query
  const filters: ReportFilters = {
    reportType,
    startDate: startDate ? format(startDate, 'yyyy-MM-dd') : '',
    endDate: endDate ? format(endDate, 'yyyy-MM-dd') : '',
    programId: selectedProgramId || undefined,
    supplierId: selectedSupplierId || undefined,
  }

  // Hooks for data fetching
  const { data: reportData, isLoading, error, refetch } = useReports(filters)
  const { mutate: downloadCSV, isPending: isDownloading } = useDownloadReportCSV()

  // Reset filters
  const handleResetFilters = () => {
    setReportType('cost-analysis')
    setStartDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
    setEndDate(new Date())
    setSelectedProgramId('')
    setSelectedSupplierId('')
  }

  // Handle CSV download
  const handleDownloadCSV = () => {
    downloadCSV({ ...filters, format: 'csv' })
  }

  // Get current report config
  const currentConfig = reportTypeConfig[reportType]
  const CurrentIcon = currentConfig.icon

  return (
    <div className={cn('space-y-6', className)}>
      {/* Filter Panel Card */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Laporan</CardTitle>
          <CardDescription>
            Pilih jenis laporan dan periode untuk melihat data analytics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Jenis Laporan</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {(Object.entries(reportTypeConfig) as [ReportType, typeof reportTypeConfig[ReportType]][]).map(
                ([type, config]) => {
                  const Icon = config.icon
                  return (
                    <Button
                      key={type}
                      variant={reportType === type ? 'default' : 'outline'}
                      className="h-auto py-4 px-4 flex flex-col items-start gap-2"
                      onClick={() => setReportType(type)}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Icon className="h-5 w-5" />
                        <span className="font-semibold text-sm">{config.labelId}</span>
                      </div>
                      <span className="text-xs text-muted-foreground text-left">
                        {config.description}
                      </span>
                    </Button>
                  )
                }
              )}
            </div>
          </div>

          {/* Date Range Pickers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tanggal Mulai</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !startDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? (
                      format(startDate, 'PPP', { locale: indonesianLocale })
                    ) : (
                      <span>Pilih tanggal</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    locale={indonesianLocale}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tanggal Akhir</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !endDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? (
                      format(endDate, 'PPP', { locale: indonesianLocale })
                    ) : (
                      <span>Pilih tanggal</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    locale={indonesianLocale}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Program Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Program (Opsional)</label>
            <Select value={selectedProgramId} onValueChange={setSelectedProgramId}>
              <SelectTrigger>
                <SelectValue placeholder="Semua program" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Semua program</SelectItem>
                {programs.map((program) => (
                  <SelectItem key={program.id} value={program.id}>
                    {program.programCode} - {program.programName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Supplier Filter (only for supplier-performance) */}
          {reportType === 'supplier-performance' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Supplier (Opsional)</label>
              <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua supplier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua supplier</SelectItem>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.supplierName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={() => refetch()} variant="secondary" className="flex-1">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Filter
            </Button>
            <Button onClick={handleResetFilters} variant="outline">
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CurrentIcon className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>{currentConfig.labelId}</CardTitle>
                <CardDescription>
                  {startDate && endDate
                    ? `Periode: ${format(startDate, 'dd MMM yyyy', {
                        locale: indonesianLocale,
                      })} - ${format(endDate, 'dd MMM yyyy', { locale: indonesianLocale })}`
                    : 'Pilih periode untuk melihat data'}
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={handleDownloadCSV}
              disabled={isDownloading || !reportData?.data || reportData.data.length === 0}
              variant="outline"
              size="sm"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Loading State */}
          {isLoading && (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat data'}
              </AlertDescription>
            </Alert>
          )}

          {/* Empty State */}
          {!isLoading && !error && reportData?.data && reportData.data.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Tidak ada data untuk periode yang dipilih. Coba pilih periode lain.
              </AlertDescription>
            </Alert>
          )}

          {/* Data Table */}
          {!isLoading && !error && reportData?.data && reportData.data.length > 0 && (
            <div className="rounded-md border">
              <Table>
                {/* Table Header - Dynamic based on report type */}
                <TableHeader>
                  <TableRow>
                    {reportType === 'cost-analysis' && (
                      <>
                        <TableHead>Periode</TableHead>
                        <TableHead className="text-right">Total Procurement</TableHead>
                        <TableHead className="text-right">Total Produksi</TableHead>
                        <TableHead className="text-right">Total Distribusi</TableHead>
                        <TableHead className="text-right font-bold">Grand Total</TableHead>
                        <TableHead className="text-right">Biaya/Porsi</TableHead>
                      </>
                    )}
                    {reportType === 'supplier-performance' && (
                      <>
                        <TableHead>Supplier</TableHead>
                        <TableHead className="text-center">Total Orders</TableHead>
                        <TableHead className="text-center">Completed</TableHead>
                        <TableHead className="text-right">Total Value</TableHead>
                        <TableHead className="text-center">Delivery Time (hari)</TableHead>
                        <TableHead className="text-center">Quality Score</TableHead>
                      </>
                    )}
                    {reportType === 'menu-usage' && (
                      <>
                        <TableHead>Menu</TableHead>
                        <TableHead className="text-center">Times Produced</TableHead>
                        <TableHead className="text-right">Total Portions</TableHead>
                        <TableHead className="text-right">Avg Cost</TableHead>
                        <TableHead className="text-center">Popularity</TableHead>
                      </>
                    )}
                    {reportType === 'budget-tracking' && (
                      <>
                        <TableHead>Periode</TableHead>
                        <TableHead className="text-right">Planned Budget</TableHead>
                        <TableHead className="text-right">Used Budget</TableHead>
                        <TableHead className="text-right">Remaining</TableHead>
                        <TableHead className="text-center">Utilization Rate</TableHead>
                        <TableHead className="text-center">Variance</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>

                {/* Table Body - Dynamic based on report type */}
                <TableBody>
                  {reportData.data.map((row, index) => (
                    <TableRow key={index}>
                      {/* Cost Analysis Rows */}
                      {reportType === 'cost-analysis' &&
                        'totalProcurement' in row &&
                        (() => {
                          const data = row as CostAnalysisRow
                          return (
                            <>
                              <TableCell className="font-medium">{data.period}</TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(data.totalProcurement)}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(data.totalProduction)}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(data.totalDistribution)}
                              </TableCell>
                              <TableCell className="text-right font-bold">
                                {formatCurrency(data.grandTotal)}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(data.costPerMeal)}
                              </TableCell>
                            </>
                          )
                        })()}

                      {/* Supplier Performance Rows */}
                      {reportType === 'supplier-performance' &&
                        'totalOrders' in row &&
                        (() => {
                          const data = row as SupplierPerformanceRow
                          return (
                            <>
                              <TableCell className="font-medium">{data.supplier}</TableCell>
                              <TableCell className="text-center">{data.totalOrders}</TableCell>
                              <TableCell className="text-center">{data.completedOrders}</TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(data.totalValue)}
                              </TableCell>
                              <TableCell className="text-center">
                                {data.avgDeliveryTime.toFixed(1)}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant={data.qualityScore >= 80 ? 'default' : 'secondary'}>
                                  {data.qualityScore.toFixed(0)}%
                                </Badge>
                              </TableCell>
                            </>
                          )
                        })()}

                      {/* Menu Usage Rows */}
                      {reportType === 'menu-usage' &&
                        'timesProduced' in row &&
                        (() => {
                          const data = row as MenuUsageRow
                          return (
                            <>
                              <TableCell className="font-medium">{data.menuName}</TableCell>
                              <TableCell className="text-center">{data.timesProduced}</TableCell>
                              <TableCell className="text-right">
                                {data.totalPortions.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(data.avgCost)}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge>{data.popularity.toFixed(0)}%</Badge>
                              </TableCell>
                            </>
                          )
                        })()}

                      {/* Budget Tracking Rows */}
                      {reportType === 'budget-tracking' &&
                        'plannedBudget' in row &&
                        (() => {
                          const data = row as BudgetTrackingRow
                          return (
                            <>
                              <TableCell className="font-medium">{data.period}</TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(data.plannedBudget)}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(data.usedBudget)}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(data.remaining)}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant={data.utilizationRate > 90 ? 'destructive' : 'default'}>
                                  {data.utilizationRate.toFixed(0)}%
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant={data.variance > 0 ? 'destructive' : 'secondary'}>
                                  {formatCurrency(Math.abs(data.variance))}
                                </Badge>
                              </TableCell>
                            </>
                          )
                        })()}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
