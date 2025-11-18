/**
 * @fileoverview Plan Related Records Component
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 * 
 * PHASE 4: RELATED RECORDS DISPLAY
 * - Shows productions linked to procurement plan
 * - Displays production statistics
 * - Provides quick links to production details
 * - Status breakdown visualization
 */

'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Factory,
  Calendar,
  TrendingUp,
  ExternalLink,
  CheckCircle2,
  Clock,
  XCircle,
  Package,
} from 'lucide-react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import type { ProductionStatus } from '@prisma/client'

// ================================ TYPES ================================

interface Production {
  id: string
  productionDate: Date
  batchNumber: string
  plannedPortions: number
  actualPortions: number | null
  status: ProductionStatus
  totalCost: number | null
  menu: {
    id: string
    menuName: string
    mealType: string
  }
}

interface PlanRelatedRecordsProps {
  productions: Production[]
  planId: string
}

// ================================ HELPERS ================================

/**
 * Get status badge variant
 */
function getStatusVariant(status: ProductionStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'COMPLETED':
      return 'default'
    case 'COOKING':
    case 'PREPARING':
      return 'secondary'
    case 'PLANNED':
    case 'QUALITY_CHECK':
      return 'outline'
    case 'CANCELLED':
      return 'destructive'
    default:
      return 'outline'
  }
}

/**
 * Get status icon
 */
function getStatusIcon(status: ProductionStatus) {
  switch (status) {
    case 'COMPLETED':
      return CheckCircle2
    case 'COOKING':
    case 'PREPARING':
    case 'QUALITY_CHECK':
      return Clock
    case 'PLANNED':
      return Calendar
    case 'CANCELLED':
      return XCircle
    default:
      return Package
  }
}

/**
 * Get status label in Indonesian
 */
function getStatusLabel(status: ProductionStatus): string {
  const labels: Record<ProductionStatus, string> = {
    PLANNED: 'Direncanakan',
    PREPARING: 'Persiapan',
    COOKING: 'Memasak',
    QUALITY_CHECK: 'Pemeriksaan Kualitas',
    COMPLETED: 'Selesai',
    CANCELLED: 'Dibatalkan',
  }
  return labels[status] || status
}

// ================================ COMPONENT ================================

/**
 * Plan Related Records Component
 * Displays productions linked to procurement plan
 */
export function PlanRelatedRecords({ productions, planId }: PlanRelatedRecordsProps) {
  // Calculate statistics
  const totalProductions = productions.length
  const completedProductions = productions.filter(p => p.status === 'COMPLETED').length
  const inProgressProductions = productions.filter(p => 
    p.status === 'PREPARING' || p.status === 'COOKING' || p.status === 'QUALITY_CHECK'
  ).length
  const plannedProductions = productions.filter(p => p.status === 'PLANNED').length
  const cancelledProductions = productions.filter(p => p.status === 'CANCELLED').length
  
  const totalPlannedPortions = productions.reduce((sum, p) => sum + p.plannedPortions, 0)
  const totalActualPortions = productions.reduce((sum, p) => sum + (p.actualPortions || 0), 0)
  const totalCost = productions.reduce((sum, p) => sum + (p.totalCost || 0), 0)
  
  const completionRate = totalProductions > 0 
    ? Math.round((completedProductions / totalProductions) * 100) 
    : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Factory className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Produksi Terkait</CardTitle>
              <CardDescription>
                Produksi yang menggunakan rencana pengadaan ini
              </CardDescription>
            </div>
          </div>
          {totalProductions > 0 && (
            <Badge variant="secondary" className="text-base px-3 py-1">
              {totalProductions} Produksi
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {totalProductions === 0 ? (
          // Empty State
          <div className="text-center py-12">
            <div className="rounded-full bg-muted p-4 inline-flex mb-4">
              <Factory className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Belum Ada Produksi</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Belum ada jadwal produksi yang dibuat dari rencana pengadaan ini. 
              Buat produksi untuk memulai.
            </p>
            <Button asChild>
              <Link href={`/production/new/from-plan/${planId}`}>
                <Factory className="mr-2 h-4 w-4" />
                Buat Produksi Pertama
              </Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Total Productions */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Produksi</p>
                <p className="text-2xl font-bold">{totalProductions}</p>
              </div>

              {/* Completion Rate */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Tingkat Selesai</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {completionRate}%
                </p>
              </div>

              {/* Total Portions */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Porsi</p>
                <p className="text-2xl font-bold">
                  {totalActualPortions > 0 ? totalActualPortions : totalPlannedPortions}
                </p>
              </div>

              {/* Total Cost */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Biaya</p>
                <p className="text-2xl font-bold">
                  {totalCost > 0 ? `Rp ${(totalCost / 1000).toFixed(0)}K` : '-'}
                </p>
              </div>
            </div>

            <Separator />

            {/* Status Breakdown */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                Status Breakdown
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {completedProductions > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-muted-foreground">Selesai:</span>
                    <span className="font-semibold">{completedProductions}</span>
                  </div>
                )}
                {inProgressProductions > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-muted-foreground">Proses:</span>
                    <span className="font-semibold">{inProgressProductions}</span>
                  </div>
                )}
                {plannedProductions > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="text-muted-foreground">Rencana:</span>
                    <span className="font-semibold">{plannedProductions}</span>
                  </div>
                )}
                {cancelledProductions > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-muted-foreground">Dibatalkan:</span>
                    <span className="font-semibold">{cancelledProductions}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Productions List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">Daftar Produksi</h4>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/production?planId=${planId}`}>
                    Lihat Semua
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </Link>
                </Button>
              </div>

              <div className="space-y-3">
                {productions.slice(0, 5).map((production) => {
                  const StatusIcon = getStatusIcon(production.status)
                  
                  return (
                    <div
                      key={production.id}
                      className={cn(
                        'flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors',
                        'group'
                      )}
                    >
                      {/* Status Icon */}
                      <div className={cn(
                        'rounded-lg p-2 mt-1',
                        production.status === 'COMPLETED' && 'bg-green-100 dark:bg-green-950',
                        (production.status === 'COOKING' || production.status === 'PREPARING' || production.status === 'QUALITY_CHECK') && 'bg-yellow-100 dark:bg-yellow-950',
                        production.status === 'PLANNED' && 'bg-blue-100 dark:bg-blue-950',
                        production.status === 'CANCELLED' && 'bg-red-100 dark:bg-red-950'
                      )}>
                        <StatusIcon className={cn(
                          'h-4 w-4',
                          production.status === 'COMPLETED' && 'text-green-600 dark:text-green-400',
                          (production.status === 'COOKING' || production.status === 'PREPARING' || production.status === 'QUALITY_CHECK') && 'text-yellow-600 dark:text-yellow-400',
                          production.status === 'PLANNED' && 'text-blue-600 dark:text-blue-400',
                          production.status === 'CANCELLED' && 'text-red-600 dark:text-red-400'
                        )} />
                      </div>

                      {/* Production Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h5 className="font-semibold truncate">
                              {production.menu.menuName}
                            </h5>
                            <p className="text-sm text-muted-foreground">
                              Batch: {production.batchNumber}
                            </p>
                          </div>
                          <Badge variant={getStatusVariant(production.status)}>
                            {getStatusLabel(production.status)}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground">Tanggal</p>
                            <p className="font-medium">
                              {format(new Date(production.productionDate), 'dd MMM yyyy', { locale: localeId })}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Porsi</p>
                            <p className="font-medium">
                              {production.actualPortions || production.plannedPortions} porsi
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Biaya</p>
                            <p className="font-medium">
                              {production.totalCost 
                                ? `Rp ${production.totalCost.toLocaleString('id-ID')}`
                                : '-'
                              }
                            </p>
                          </div>
                          <div className="flex justify-end">
                            <Button asChild variant="ghost" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground">
                              <Link href={`/production/${production.id}`}>
                                Detail
                                <ExternalLink className="ml-2 h-3 w-3" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {productions.length > 5 && (
                  <p className="text-sm text-muted-foreground text-center pt-2">
                    Dan {productions.length - 5} produksi lainnya...
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-center pt-4">
              <Button asChild variant="outline" className="w-full md:w-auto">
                <Link href={`/production/new/from-plan/${planId}`}>
                  <Factory className="mr-2 h-4 w-4" />
                  Buat Produksi Baru
                </Link>
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
