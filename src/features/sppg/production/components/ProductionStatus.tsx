/**
 * @fileoverview Production Status Timeline Component with Action Buttons
 * @version Next.js 15.5.4 / shadcn/ui / TanStack Query
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import {
  CheckCircle2,
  Circle,
  Clock,
  Play,
  ChefHat,
  Thermometer,
  ClipboardCheck,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  useStartProduction,
  useStartCooking,
  useCompleteProduction,
  useCancelProduction,
} from '../hooks/useProductions'
import { productionApi } from '../api'
import { toast } from 'sonner'
import { 
  getStatusLabel, 
  getStatusColor, 
  getNextStatuses,
  formatDateTime,
  formatDuration,
  calculateDuration,
} from '../lib'
import type { FoodProduction } from '@prisma/client'
import type { CompleteProductionInput, CancelProductionInput } from '../schemas'

// ============================================================================
// Types
// ============================================================================

interface ProductionStatusProps {
  production: FoodProduction
  className?: string
  onStatusChange?: () => void
}

interface StatusStep {
  status: 'PLANNED' | 'PREPARING' | 'COOKING' | 'QUALITY_CHECK' | 'COMPLETED' | 'CANCELLED'
  label: string
  icon: typeof Circle
  description: string
}

// ============================================================================
// Constants
// ============================================================================

const STATUS_STEPS: StatusStep[] = [
  {
    status: 'PLANNED',
    label: 'Dijadwalkan',
    icon: Circle,
    description: 'Produksi telah dijadwalkan',
  },
  {
    status: 'PREPARING',
    label: 'Persiapan',
    icon: Clock,
    description: 'Menyiapkan bahan dan peralatan',
  },
  {
    status: 'COOKING',
    label: 'Memasak',
    icon: ChefHat,
    description: 'Proses memasak berlangsung',
  },
  {
    status: 'QUALITY_CHECK',
    label: 'Quality Check',
    icon: ClipboardCheck,
    description: 'Pemeriksaan kualitas',
  },
  {
    status: 'COMPLETED',
    label: 'Selesai',
    icon: CheckCircle2,
    description: 'Produksi selesai',
  },
]

// ============================================================================
// Helper Components
// ============================================================================

/**
 * Complete Production Dialog
 */
function CompleteProductionDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending,
  production,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CompleteProductionInput) => void
  isPending: boolean
  production: FoodProduction
}) {
  const [formData, setFormData] = useState<CompleteProductionInput>({
    actualPortions: production.plannedPortions,
    // ❌ actualCost removed - will be calculated by ProductionCostCalculator
    actualTemperature: production.targetTemperature || 85,
    wasteAmount: 0,
    wasteNotes: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Selesaikan Produksi</DialogTitle>
          <DialogDescription>
            Masukkan data aktual dari hasil produksi
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="actualPortions">Jumlah Porsi Aktual</Label>
                <Input
                  id="actualPortions"
                  type="number"
                  min="0"
                  value={formData.actualPortions}
                  onChange={(e) =>
                    setFormData({ ...formData, actualPortions: Number(e.target.value) })
                  }
                  required
                />
              </div>
              {/* ❌ actualCost input removed - costs calculated by ProductionCostCalculator */}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="actualTemperature">Suhu Aktual (°C)</Label>
                <Input
                  id="actualTemperature"
                  type="number"
                  min="-20"
                  max="300"
                  value={formData.actualTemperature || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      actualTemperature: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wasteAmount">Jumlah Limbah (kg)</Label>
                <Input
                  id="wasteAmount"
                  type="number"
                  min="0"
                  value={formData.wasteAmount || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      wasteAmount: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="wasteNotes">Catatan Limbah (Opsional)</Label>
              <Textarea
                id="wasteNotes"
                rows={3}
                value={formData.wasteNotes || ''}
                onChange={(e) => setFormData({ ...formData, wasteNotes: e.target.value })}
                placeholder="Catatan tentang limbah produksi..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Menyimpan...' : 'Selesaikan Produksi'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Cancel Production Dialog
 */
function CancelProductionDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CancelProductionInput) => void
  isPending: boolean
}) {
  const [reason, setReason] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (reason.length >= 10) {
      onSubmit({ reason })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Batalkan Produksi</DialogTitle>
          <DialogDescription>
            Berikan alasan pembatalan produksi (minimal 10 karakter)
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Alasan Pembatalan</Label>
              <Textarea
                id="reason"
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Contoh: Kekurangan bahan baku..."
                required
                minLength={10}
              />
              {reason.length > 0 && reason.length < 10 && (
                <p className="text-xs text-destructive">
                  Minimal 10 karakter ({10 - reason.length} lagi)
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Kembali
            </Button>
            <Button type="submit" variant="destructive" disabled={isPending || reason.length < 10}>
              {isPending ? 'Membatalkan...' : 'Batalkan Produksi'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Main Component: Production Status Timeline
 */
export function ProductionStatus({ production, className, onStatusChange }: ProductionStatusProps) {
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const { mutate: startProduction, isPending: isStarting } = useStartProduction()
  const { mutate: startCooking, isPending: isStartingCooking } = useStartCooking()
  const { mutate: completeProduction, isPending: isCompleting } = useCompleteProduction()
  const { mutate: cancelProduction, isPending: isCancelling } = useCancelProduction()

  const currentStatus = production.status
  const nextStatuses = getNextStatuses(currentStatus)
  const isCancelled = currentStatus === 'CANCELLED'
  const isCompleted = currentStatus === 'COMPLETED'

  // Get current step index
  const currentStepIndex = STATUS_STEPS.findIndex((step) => step.status === currentStatus)

  // Handle action buttons
  const handleStartProduction = () => {
    startProduction(production.id, {
      onSuccess: () => onStatusChange?.(),
    })
  }

  const handleStartCooking = () => {
    startCooking(production.id, {
      onSuccess: () => onStatusChange?.(),
    })
  }

  const handleCompleteProduction = async (data: CompleteProductionInput) => {
    // Complete production (COOKING → QUALITY_CHECK)
    completeProduction(
      { id: production.id, data },
      {
        onSuccess: async () => {
          setShowCompleteDialog(false)
          
          // Automatically record stock usage
          try {
            toast.info('Mencatat penggunaan bahan...')
            
            const stockUsageResult = await productionApi.recordStockUsage(production.id, {
              actualPortions: data.actualPortions,
            })
            
            if (stockUsageResult.success) {
              toast.success(
                `✅ Penggunaan bahan tercatat: ${stockUsageResult.data?.recordsCreated} bahan, ` +
                `Total: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(stockUsageResult.data?.totalCost || 0)}`
              )
            }
          } catch (error) {
            // Non-blocking error - production is still completed
            console.error('Failed to record stock usage:', error)
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            toast.warning(
              `⚠️ Gagal mencatat penggunaan bahan: ${errorMessage}. ` +
              'Silakan rekam manual dari detail produksi.',
              { duration: 5000 }
            )
          }
          
          onStatusChange?.()
        },
      }
    )
  }

  const handleCancelProduction = (data: CancelProductionInput) => {
    cancelProduction(
      { id: production.id, reason: data.reason },
      {
        onSuccess: () => {
          setShowCancelDialog(false)
          onStatusChange?.()
        },
      }
    )
  }

  return (
    <>
      <Card className={cn('', className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Status Produksi</CardTitle>
              <CardDescription>Timeline progres produksi makanan</CardDescription>
            </div>
            <Badge className={getStatusColor(currentStatus)}>{getStatusLabel(currentStatus)}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Timeline */}
          <div className="space-y-4">
            {STATUS_STEPS.map((step, index) => {
              const Icon = step.icon
              const isActive = step.status === currentStatus
              const isCompleted = index < currentStepIndex
              const isFuture = index > currentStepIndex

              return (
                <div key={step.status} className="relative">
                  {/* Vertical Line */}
                  {index < STATUS_STEPS.length - 1 && (
                    <div
                      className={cn(
                        'absolute left-4 top-8 w-0.5 h-8',
                        isCompleted ? 'bg-primary' : 'bg-muted'
                      )}
                    />
                  )}

                  {/* Step Content */}
                  <div className="flex gap-4 items-start">
                    {/* Icon */}
                    <div
                      className={cn(
                        'flex items-center justify-center w-8 h-8 rounded-full border-2 bg-background',
                        isActive && 'border-primary bg-primary/10',
                        isCompleted && 'border-primary bg-primary text-primary-foreground',
                        isFuture && 'border-muted text-muted-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 pt-0.5">
                      <div className="flex items-center justify-between">
                        <p
                          className={cn(
                            'font-medium',
                            isActive && 'text-primary',
                            isFuture && 'text-muted-foreground'
                          )}
                        >
                          {step.label}
                        </p>
                        {isActive && (
                          <Badge variant="outline" className="border-primary text-primary">
                            Sedang Berlangsung
                          </Badge>
                        )}
                        {isCompleted && <CheckCircle2 className="h-4 w-4 text-primary" />}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{step.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Cancelled Status */}
            {isCancelled && (
              <div className="relative">
                <div className="flex gap-4 items-start">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-destructive bg-destructive/10">
                    <XCircle className="h-4 w-4 text-destructive" />
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className="font-medium text-destructive">Dibatalkan</p>
                    {production.notes && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Alasan: {production.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Time Information */}
          <div className="grid gap-3 md:grid-cols-2">
            {/* Planned Time */}
            <div className="p-3 border rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Waktu Rencana</p>
              <p className="text-sm font-semibold">
                {formatDateTime(production.plannedStartTime)} -{' '}
                {formatDateTime(production.plannedEndTime)}
              </p>
              {production.plannedStartTime && production.plannedEndTime && (
                <p className="text-xs text-muted-foreground mt-1">
                  Durasi:{' '}
                  {formatDuration(
                    calculateDuration(production.plannedStartTime, production.plannedEndTime)
                  )}
                </p>
              )}
            </div>

            {/* Actual Time */}
            {production.actualStartTime && (
              <div className="p-3 border rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Waktu Aktual</p>
                <p className="text-sm font-semibold">
                  {formatDateTime(production.actualStartTime)}
                  {production.actualEndTime && ` - ${formatDateTime(production.actualEndTime)}`}
                </p>
                {production.actualEndTime && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Durasi:{' '}
                    {formatDuration(
                      calculateDuration(production.actualStartTime, production.actualEndTime)
                    )}
                  </p>
                )}
              </div>
            )}

            {/* Temperature */}
            {(production.targetTemperature || production.actualTemperature) && (
              <div className="p-3 border rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Suhu</p>
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-semibold">
                    Target: {production.targetTemperature || '-'}°C
                    {production.actualTemperature && ` | Aktual: ${production.actualTemperature}°C`}
                  </p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Action Buttons */}
          {!isCompleted && !isCancelled && (
            <div className="space-y-3">
              <p className="text-sm font-medium">Aksi</p>
              <div className="flex flex-wrap gap-2">
                {/* Start Production (PLANNED → PREPARING) */}
                {currentStatus === 'PLANNED' && (
                  <Button onClick={handleStartProduction} disabled={isStarting}>
                    <Play className="h-4 w-4 mr-2" />
                    {isStarting ? 'Memulai...' : 'Mulai Persiapan'}
                  </Button>
                )}

                {/* Start Cooking (PREPARING → COOKING) */}
                {currentStatus === 'PREPARING' && (
                  <Button onClick={handleStartCooking} disabled={isStartingCooking}>
                    <ChefHat className="h-4 w-4 mr-2" />
                    {isStartingCooking ? 'Memulai...' : 'Mulai Memasak'}
                  </Button>
                )}

                {/* Complete Production (COOKING → QUALITY_CHECK) */}
                {currentStatus === 'COOKING' && (
                  <Button onClick={() => setShowCompleteDialog(true)}>
                    <ClipboardCheck className="h-4 w-4 mr-2" />
                    Selesai Memasak
                  </Button>
                )}

                {/* Quality Check Reminder */}
                {currentStatus === 'QUALITY_CHECK' && (
                  <div className="flex items-start gap-2 p-3 border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20 rounded-lg w-full">
                    <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Lakukan Quality Check
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        Gunakan komponen Quality Control untuk menambahkan hasil pemeriksaan
                        kualitas sebelum menyelesaikan produksi.
                      </p>
                    </div>
                  </div>
                )}

                {/* Cancel Button */}
                {nextStatuses.includes('CANCELLED') && (
                  <Button
                    variant="destructive"
                    onClick={() => setShowCancelDialog(true)}
                    disabled={isCancelling}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Batalkan Produksi
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Completed Message */}
          {isCompleted && (
            <div className="flex items-start gap-2 p-4 border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Produksi Selesai
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Produksi telah selesai dan siap untuk didistribusikan.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CompleteProductionDialog
        open={showCompleteDialog}
        onOpenChange={setShowCompleteDialog}
        onSubmit={handleCompleteProduction}
        isPending={isCompleting}
        production={production}
      />
      <CancelProductionDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onSubmit={handleCancelProduction}
        isPending={isCancelling}
      />
    </>
  )
}
