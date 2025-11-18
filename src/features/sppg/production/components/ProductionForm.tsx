/**
 * @fileoverview Production Form Component with 4 Sections
 * @version Next.js 15.5.4 / React Hook Form + Zod
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Clock, 
  Utensils, 
  Thermometer,
  Calculator,
  AlertCircle,
  ChefHat,
  Save,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCreateProduction, useUpdateProduction } from '../hooks/useProductions'
import { productionCreateSchema, type ProductionCreateInput } from '../schemas'
import { formatCurrency, generateBatchNumber } from '../lib'
import type { FoodProduction, NutritionMenu, NutritionProgram, User } from '@prisma/client'
import { useMemo } from 'react'

// ============================================================================
// Types
// ============================================================================

interface ProductionFormProps {
  production?: FoodProduction & {
    menu?: NutritionMenu
    program?: NutritionProgram
  }
  programs?: Array<NutritionProgram & { menus?: NutritionMenu[] }>
  users?: User[] // Kitchen staff and supervisors for chef selection
  className?: string
  onSuccess?: () => void
}

type ProductionFormValues = ProductionCreateInput

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate estimated cost from menu cost per serving
 */
function calculateEstimatedCost(costPerServing: number, portions: number): number {
  return costPerServing * portions
}

/**
 * Get default time range (8 hours from now)
 */
function getDefaultTimeRange() {
  const now = new Date()
  const start = new Date(now.getTime() + 60 * 60 * 1000) // 1 hour from now
  const end = new Date(start.getTime() + 8 * 60 * 60 * 1000) // 8 hours later
  
  return {
    start: start.toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm
    end: end.toISOString().slice(0, 16),
  }
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Main Component: Production Form
 */
export function ProductionForm({ 
  production, 
  programs = [],
  users = [],
  className, 
  onSuccess 
}: ProductionFormProps) {
  const router = useRouter()
  const isEdit = Boolean(production)
  const canEdit = !production || production.status === 'PLANNED'

  const { mutate: createProduction, isPending: isCreating } = useCreateProduction()
  const { mutate: updateProduction, isPending: isUpdating } = useUpdateProduction()
  const isPending = isCreating || isUpdating

  // Local state
  const [selectedProgramId, setSelectedProgramId] = useState<string>(
    production?.programId || ''
  )
  const [selectedMenuId, setSelectedMenuId] = useState<string>(
    production?.menuId || ''
  )
  const [selectedMenu, setSelectedMenu] = useState<NutritionMenu | null>(null)
  // ✅ Display-only estimated cost (not sent to API)
  const [estimatedCostDisplay, setEstimatedCostDisplay] = useState<number>(0)

  // Get default time range
  const defaultTimes = getDefaultTimeRange()

  // Initialize form (note: dates as Date objects for schema)
  const form = useForm<ProductionFormValues>({
    resolver: zodResolver(productionCreateSchema),
    defaultValues: production ? {
      programId: production.programId,
      menuId: production.menuId,
      productionDate: production.productionDate,
      plannedPortions: production.plannedPortions,
      plannedStartTime: production.plannedStartTime,
      plannedEndTime: production.plannedEndTime,
      headCook: production.headCook,
      // ❌ estimatedCost removed - not stored in DB anymore
      batchNumber: production.batchNumber,
      assistantCooks: [],
      supervisorId: production.supervisorId || undefined,
      targetTemperature: production.targetTemperature || undefined,
      notes: production.notes || undefined,
    } : {
      programId: '',
      menuId: '',
      productionDate: new Date(),
      plannedPortions: 100,
      plannedStartTime: new Date(defaultTimes.start),
      plannedEndTime: new Date(defaultTimes.end),
      headCook: '',
      // ❌ estimatedCost removed - not stored in DB anymore
      batchNumber: '',
    },
  })

  // Watch for changes
  const watchProgramId = form.watch('programId')
  const watchMenuId = form.watch('menuId')
  const watchPlannedPortions = form.watch('plannedPortions')
  const watchProductionDate = form.watch('productionDate')

  // Get menus for selected program (memoized to prevent effect dependency issues)
  const availableMenus = useMemo(
    () => programs.find(p => p.id === watchProgramId)?.menus || [],
    [programs, watchProgramId]
  )

  // Update selected program
  useEffect(() => {
    if (watchProgramId !== selectedProgramId) {
      setSelectedProgramId(watchProgramId)
      setSelectedMenuId('')
      setSelectedMenu(null)
      form.setValue('menuId', '')
    }
  }, [watchProgramId, selectedProgramId, form])

  // Update selected menu and calculate estimated cost
  useEffect(() => {
    if (watchMenuId !== selectedMenuId) {
      setSelectedMenuId(watchMenuId)
      const menu = availableMenus.find(m => m.id === watchMenuId)
      setSelectedMenu(menu || null)
      
      if (menu && watchPlannedPortions) {
        const estimatedCost = calculateEstimatedCost(
          menu.costPerServing || 0, 
          watchPlannedPortions
        )
        setEstimatedCostDisplay(estimatedCost)
        
        // Set target temperature (standard for all food production)
        form.setValue('targetTemperature', 85)
      }
    }
  }, [watchMenuId, selectedMenuId, availableMenus, watchPlannedPortions, form])

  // Auto-update estimated cost when portions change
  useEffect(() => {
    if (selectedMenu && watchPlannedPortions) {
      const estimatedCost = calculateEstimatedCost(
        selectedMenu.costPerServing || 0,
        watchPlannedPortions
      )
      setEstimatedCostDisplay(estimatedCost)
    }
  }, [watchPlannedPortions, selectedMenu])

  // Auto-generate batch number when date changes
  useEffect(() => {
    if (watchProductionDate && !isEdit) {
      const date = new Date(watchProductionDate)
      const batchNumber = generateBatchNumber(date, 1) // Sequence 1 as placeholder
      form.setValue('batchNumber', batchNumber)
    }
  }, [watchProductionDate, isEdit, form])

  // Submit handler
  const onSubmit = (data: ProductionFormValues) => {
    if (isEdit && production) {
      updateProduction(
        { id: production.id, data },
        {
          onSuccess: () => {
            onSuccess?.()
            router.push(`/production/${production.id}`)
          },
        }
      )
    } else {
      createProduction(data, {
        onSuccess: (response) => {
          onSuccess?.()
          router.push(`/production/${response.data?.id}`)
        },
      })
    }
  }

  // Handle cancel
  const handleCancel = () => {
    if (isEdit && production) {
      router.push(`/production/${production.id}`)
    } else {
      router.push('/production')
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className={cn('space-y-6', className)}>
      {/* Section 1: Basic Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-primary" />
            <CardTitle>Informasi Dasar</CardTitle>
          </div>
          <CardDescription>
            Pilih program dan menu yang akan diproduksi
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Program Selection */}
            <div className="space-y-2">
              <Label htmlFor="programId">
                Program <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.watch('programId')}
                onValueChange={(value) => form.setValue('programId', value)}
                disabled={!canEdit}
              >
                <SelectTrigger id="programId">
                  <SelectValue placeholder="Pilih program" />
                </SelectTrigger>
                <SelectContent>
                  {programs.map((program) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.programId && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.programId.message}
                </p>
              )}
            </div>

            {/* Menu Selection */}
            <div className="space-y-2">
              <Label htmlFor="menuId">
                Menu <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.watch('menuId')}
                onValueChange={(value) => form.setValue('menuId', value)}
                disabled={!canEdit || !watchProgramId}
              >
                <SelectTrigger id="menuId">
                  <SelectValue placeholder="Pilih menu" />
                </SelectTrigger>
                <SelectContent>
                  {availableMenus.map((menu) => (
                    <SelectItem key={menu.id} value={menu.id}>
                      {menu.menuName}
                      <Badge variant="outline" className="ml-2">
                        {menu.mealType}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.menuId && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.menuId.message}
                </p>
              )}
            </div>

            {/* Production Date */}
            <div className="space-y-2">
              <Label htmlFor="productionDate">
                Tanggal Produksi <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="productionDate"
                  type="date"
                  className="pl-9"
                  value={form.watch('productionDate')?.toISOString().split('T')[0] || ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : new Date()
                    form.setValue('productionDate', date)
                  }}
                  disabled={!canEdit}
                />
              </div>
              {form.formState.errors.productionDate && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.productionDate.message}
                </p>
              )}
            </div>

            {/* Batch Number */}
            <div className="space-y-2">
              <Label htmlFor="batchNumber">Nomor Batch</Label>
              <Input
                id="batchNumber"
                placeholder="PROD-YYYYMMDD-XXX"
                {...form.register('batchNumber')}
                disabled={!canEdit}
              />
              <p className="text-xs text-muted-foreground">
                Otomatis dibuat berdasarkan tanggal
              </p>
            </div>
          </div>

          {/* Menu Preview */}
          {selectedMenu && (
            <div className="mt-4 p-4 border rounded-lg bg-muted/50">
              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Jenis Makanan</p>
                  <p className="text-lg font-semibold">
                    <Badge variant="outline">{selectedMenu.mealType}</Badge>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Porsi per Batch</p>
                  <p className="text-lg font-semibold">{selectedMenu.batchSize || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Biaya per Porsi</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(selectedMenu.costPerServing || 0)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 2: Planning */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <CardTitle>Perencanaan Produksi</CardTitle>
          </div>
          <CardDescription>
            Tentukan jumlah porsi dan waktu produksi
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Planned Portions */}
            <div className="space-y-2">
              <Label htmlFor="plannedPortions">
                Jumlah Porsi <span className="text-destructive">*</span>
              </Label>
              <Input
                id="plannedPortions"
                type="number"
                min="1"
                max="10000"
                {...form.register('plannedPortions', { valueAsNumber: true })}
                disabled={!canEdit}
              />
              {form.formState.errors.plannedPortions && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.plannedPortions.message}
                </p>
              )}
            </div>

            {/* Estimated Cost (Display Only - Auto-calculated) */}
            <div className="space-y-2">
              <Label htmlFor="estimatedCost">Estimasi Biaya Total</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  Rp
                </span>
                <Input
                  id="estimatedCost"
                  type="text"
                  className="pl-10 bg-muted/50"
                  value={formatCurrency(estimatedCostDisplay)}
                  disabled
                  readOnly
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Otomatis dihitung dari biaya per porsi × jumlah porsi (display only, tidak disimpan)
              </p>
            </div>

            {/* Planned Start Time */}
            <div className="space-y-2">
              <Label htmlFor="plannedStartTime">
                Waktu Mulai <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="plannedStartTime"
                  type="datetime-local"
                  className="pl-9"
                  value={form.watch('plannedStartTime')?.toISOString().slice(0, 16) || ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : new Date()
                    form.setValue('plannedStartTime', date)
                  }}
                  disabled={!canEdit}
                />
              </div>
              {form.formState.errors.plannedStartTime && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.plannedStartTime.message}
                </p>
              )}
            </div>

            {/* Planned End Time */}
            <div className="space-y-2">
              <Label htmlFor="plannedEndTime">
                Waktu Selesai <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="plannedEndTime"
                  type="datetime-local"
                  className="pl-9"
                  value={form.watch('plannedEndTime')?.toISOString().slice(0, 16) || ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : new Date()
                    form.setValue('plannedEndTime', date)
                  }}
                  disabled={!canEdit}
                />
              </div>
              {form.formState.errors.plannedEndTime && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.plannedEndTime.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Staff Assignment */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-primary" />
            <CardTitle>Penugasan Staff</CardTitle>
          </div>
          <CardDescription>
            Tentukan kepala koki dan tim produksi
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Head Cook */}
            <div className="space-y-2">
              <Label htmlFor="headCook">
                Kepala Koki <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.watch('headCook')}
                onValueChange={(value) => form.setValue('headCook', value)}
                disabled={!canEdit}
              >
                <SelectTrigger id="headCook">
                  <SelectValue placeholder="Pilih kepala koki" />
                </SelectTrigger>
                <SelectContent>
                  {users
                    .filter(u => u.isActive && u.userRole === 'SPPG_STAFF_DAPUR')
                    .map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {form.formState.errors.headCook && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.headCook.message}
                </p>
              )}
            </div>

            {/* Supervisor */}
            <div className="space-y-2">
              <Label htmlFor="supervisorId">Supervisor (Opsional)</Label>
              <Select
                value={form.watch('supervisorId') || undefined}
                onValueChange={(value) => form.setValue('supervisorId', value || undefined)}
                disabled={!canEdit}
              >
                <SelectTrigger id="supervisorId">
                  <SelectValue placeholder="Pilih supervisor (opsional)" />
                </SelectTrigger>
                <SelectContent>
                  {users
                    .filter(u => u.isActive && u.userRole === 'SPPG_PRODUKSI_MANAGER')
                    .map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assistant Cooks */}
          <div className="space-y-2">
            <Label>Asisten Koki (Maks 10)</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.watch('assistantCooks')?.map((cookId, index) => {
                const cook = users.find(u => u.id === cookId)
                return (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {cook?.name || cookId}
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => {
                          const current = form.getValues('assistantCooks') || []
                          form.setValue('assistantCooks', current.filter((_, i) => i !== index))
                        }}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                )
              })}
              {(!form.watch('assistantCooks') || form.watch('assistantCooks')?.length === 0) && (
                <span className="text-sm text-muted-foreground">Belum ada asisten koki dipilih</span>
              )}
            </div>
            {canEdit && (form.watch('assistantCooks')?.length || 0) < 10 && (
              <Select
                value=""
                onValueChange={(value) => {
                  if (value) {
                    const current = form.getValues('assistantCooks') || []
                    if (!current.includes(value)) {
                      form.setValue('assistantCooks', [...current, value])
                    }
                  }
                }}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tambah asisten koki" />
                </SelectTrigger>
                <SelectContent>
                  {users
                    .filter(u => {
                      const current = form.watch('assistantCooks') || []
                      const headCook = form.watch('headCook')
                      return (
                        u.isActive &&
                        u.userRole === 'SPPG_STAFF_DAPUR' &&
                        !current.includes(u.id) &&
                        u.id !== headCook
                      )
                    })
                    .map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
            <p className="text-sm text-muted-foreground">
              Pilih hingga 10 asisten koki untuk membantu produksi
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Additional Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Thermometer className="h-5 w-5 text-primary" />
            <CardTitle>Detail Tambahan</CardTitle>
          </div>
          <CardDescription>
            Informasi tambahan untuk produksi
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Target Temperature */}
            <div className="space-y-2">
              <Label htmlFor="targetTemperature">Target Suhu (°C)</Label>
              <Input
                id="targetTemperature"
                type="number"
                min="-20"
                max="300"
                placeholder="85"
                {...form.register('targetTemperature', { valueAsNumber: true })}
                disabled={!canEdit}
              />
              <p className="text-xs text-muted-foreground">
                Suhu ideal untuk menu ini: 75-90°C
              </p>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan</Label>
            <Textarea
              id="notes"
              rows={4}
              placeholder="Catatan tambahan untuk produksi ini..."
              {...form.register('notes')}
              disabled={!canEdit}
            />
          </div>

          {/* Warning if editing non-PLANNED production */}
          {production && production.status !== 'PLANNED' && (
            <div className="flex items-start gap-2 p-4 border border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-900/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                  Produksi tidak dapat diubah
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Hanya produksi dengan status &quot;PLANNED&quot; yang dapat diedit.
                  Status saat ini: {production.status}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isPending}
        >
          <X className="h-4 w-4 mr-2" />
          Batal
        </Button>
        <Button
          type="submit"
          disabled={isPending || !canEdit}
        >
          <Save className="h-4 w-4 mr-2" />
          {isPending ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Buat Produksi'}
        </Button>
      </div>
    </form>
  )
}
