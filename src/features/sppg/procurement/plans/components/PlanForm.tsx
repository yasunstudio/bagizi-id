/**
 * @fileoverview Plan Form Component
 * @version Next.js 15.5.4 / React 19
 * @author Bagizi-ID Development Team
 * @see {@link /docs/PROCUREMENT_WORKFLOW_GUIDE.md} Procurement Documentation
 * 
 * COMPONENT FEATURES:
 * - Create/Edit procurement plans
 * - Multi-section form layout
 * - **Dynamic program selection from API** (Enterprise Pattern)
 * - Period selection (month/year/quarter)
 * - Budget allocation by category
 * - Target recipients and meals
 * - Form validation with React Hook Form + Zod
 * - Loading states with skeleton
 * - Dark mode support
 * 
 * ENTERPRISE DATA FLOW:
 * - Programs fetched via useActivePrograms() hook
 * - Hook uses programsApi.getAll({ status: 'ACTIVE' })
 * - API endpoint: /api/sppg/program with multi-tenant filtering
 * - No hardcoded data - all from database
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Save,
  X,
  Calendar,
  DollarSign,
  Users,
  FileText,
  AlertCircle,
  BookOpen,
  Calculator,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useCreatePlan, useUpdatePlan } from '../hooks'
import { useActivePrograms } from '@/features/sppg/menu/hooks/usePrograms'
import { useApprovedMenuPlans, useMenuPlanData, calculateBudgetBreakdown } from '@/features/sppg/menu/hooks/useMenuPlans'
import { createPlanFormSchema, updatePlanFormSchema } from '../schemas'
import type { CreatePlanFormInput, UpdatePlanFormInput } from '../types'

// ================================ TYPES ================================

// Flexible type for initialData since we only need certain fields
interface PlanFormData {
  id: string
  programId: string
  planName: string
  planMonth: string
  planYear: number
  planQuarter: number | null
  targetRecipients: number
  targetMeals: number
  totalBudget: number
  proteinBudget: number | null
  carbBudget: number | null
  vegetableBudget: number | null
  fruitBudget: number | null
  otherBudget: number | null
  notes: string | null
}

interface PlanFormProps {
  initialData?: PlanFormData
  mode?: 'create' | 'edit'
  onSuccess?: (planId: string) => void
  onCancel?: () => void
  className?: string
}

// ================================ CONSTANTS ================================

const MONTH_OPTIONS = [
  { value: '01', label: 'Januari' },
  { value: '02', label: 'Februari' },
  { value: '03', label: 'Maret' },
  { value: '04', label: 'April' },
  { value: '05', label: 'Mei' },
  { value: '06', label: 'Juni' },
  { value: '07', label: 'Juli' },
  { value: '08', label: 'Agustus' },
  { value: '09', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' },
]

const QUARTER_OPTIONS = [
  { value: 1, label: 'Kuartal 1 (Jan-Mar)' },
  { value: 2, label: 'Kuartal 2 (Apr-Jun)' },
  { value: 3, label: 'Kuartal 3 (Jul-Sep)' },
  { value: 4, label: 'Kuartal 4 (Okt-Des)' },
]

// Generate year options (current year + 2 years forward)
const currentYear = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 3 }, (_, i) => currentYear + i)

// ================================ COMPONENT ================================

/**
 * Plan Form Component
 * Comprehensive form for creating and editing procurement plans
 * 
 * @example
 * // Create mode
 * <PlanForm
 *   mode="create"
 *   onSuccess={(id) => router.push(`/procurement/plans/${id}`)}
 *   onCancel={() => router.back()}
 * />
 * 
 * // Edit mode
 * <PlanForm
 *   mode="edit"
 *   initialData={planData}
 *   onSuccess={(id) => router.push(`/procurement/plans/${id}`)}
 * />
 */
export function PlanForm({
  initialData,
  mode = 'create',
  onSuccess,
  onCancel,
  className,
}: PlanFormProps) {
  const router = useRouter()
  const { mutate: createPlan, isPending: isCreating } = useCreatePlan()
  const { mutate: updatePlan, isPending: isUpdating } = useUpdatePlan()
  
  // State for menu plan selection (unified form - no tabs)
  const [selectedMenuPlanId, setSelectedMenuPlanId] = useState<string>('')
  
  // Fetch active programs from API
  const { data: programs = [], isLoading: isLoadingPrograms } = useActivePrograms()
  
  // Fetch approved menu plans for optional auto-populate
  const { data: menuPlans = [], isLoading: isLoadingMenuPlans } = useApprovedMenuPlans()
  
  // Debug: Log menu plans data
  console.log('🔍 [PlanForm] Menu Plans:', {
    isLoading: isLoadingMenuPlans,
    count: menuPlans.length,
    plans: menuPlans.map(p => ({ id: p.id, name: p.name, cost: p.totalEstimatedCost }))
  })
  
  // Fetch selected menu plan data with calculations
  const { data: menuPlanData, isLoading: isLoadingMenuPlanData } = useMenuPlanData(
    selectedMenuPlanId || undefined
  )

  const isEditMode = mode === 'edit'
  const isSubmitting = isCreating || isUpdating

  // Initialize form
  const form = useForm<CreatePlanFormInput | UpdatePlanFormInput>({
    resolver: zodResolver(isEditMode ? updatePlanFormSchema : createPlanFormSchema),
    defaultValues: isEditMode && initialData
      ? {
          programId: initialData.programId,
          planName: initialData.planName,
          planMonth: initialData.planMonth,
          planYear: initialData.planYear,
          planQuarter: initialData.planQuarter || undefined,
          targetRecipients: initialData.targetRecipients,
          targetMeals: initialData.targetMeals,
          totalBudget: initialData.totalBudget,
          proteinBudget: initialData.proteinBudget || 0,
          carbBudget: initialData.carbBudget || 0,
          vegetableBudget: initialData.vegetableBudget || 0,
          fruitBudget: initialData.fruitBudget || 0,
          otherBudget: initialData.otherBudget || 0,
          notes: initialData.notes || '',
        }
      : {
          programId: '',
          planName: '',
          planMonth: '',
          planYear: currentYear,
          planQuarter: undefined,
          targetRecipients: 0,
          targetMeals: 0,
          totalBudget: 0,
          proteinBudget: 0,
          carbBudget: 0,
          vegetableBudget: 0,
          fruitBudget: 0,
          otherBudget: 0,
          notes: '',
        },
  })

  // Auto-populate form when menu plan is selected (unified form - no mode check)
  useEffect(() => {
    if (selectedMenuPlanId && menuPlanData && !isLoadingMenuPlanData) {
      const { menuPlan, suggestedItems } = menuPlanData
      
      console.log('🎯 Auto-populating from MenuPlan:', {
        menuPlanName: menuPlan.name,
        totalEstimatedCost: menuPlan.totalEstimatedCost,
        totalMenus: menuPlan.totalMenus,
        suggestedItemsCount: suggestedItems.length,
        programId: menuPlan.programId
      })
      
      // Calculate budget breakdown from suggested items
      const budgetBreakdown = calculateBudgetBreakdown(suggestedItems)
      
      console.log('💰 Budget Breakdown:', budgetBreakdown)
      
      // Auto-populate form fields
      form.setValue('menuPlanId', selectedMenuPlanId)
      form.setValue('programId', menuPlan.programId)
      form.setValue('planName', `Rencana dari ${menuPlan.name}`)
      
      // Set period from menu plan dates
      const startDate = new Date(menuPlan.startDate)
      form.setValue('planMonth', String(startDate.getMonth() + 1).padStart(2, '0'))
      form.setValue('planYear', startDate.getFullYear())
      
      // Set budget from menu plan (even if 0, show warning)
      form.setValue('totalBudget', menuPlan.totalEstimatedCost)
      form.setValue('menuBasedBudget', menuPlan.totalEstimatedCost)
      form.setValue('proteinBudget', budgetBreakdown.proteinBudget)
      form.setValue('carbBudget', budgetBreakdown.carbBudget)
      form.setValue('vegetableBudget', budgetBreakdown.vegetableBudget)
      form.setValue('fruitBudget', budgetBreakdown.fruitBudget)
      form.setValue('otherBudget', budgetBreakdown.otherBudget)
      
      // Set targets
      form.setValue('targetRecipients', menuPlanData.estimatedDailyRecipients)
      form.setValue('targetMeals', menuPlan.totalMenus)
      
      // Store suggested items as JSON
      form.setValue('autoGeneratedItems', {
        items: suggestedItems,
        generatedAt: new Date().toISOString(),
        source: 'menu-plan',
        menuPlanId: selectedMenuPlanId,
      })
      
      // Add note about source
      form.setValue('notes', `Rencana ini dibuat dari menu plan: ${menuPlan.name}\nPeriode: ${new Date(menuPlan.startDate).toLocaleDateString('id-ID')} - ${new Date(menuPlan.endDate).toLocaleDateString('id-ID')}`)
      
      // Show toast notification
      if (menuPlan.totalEstimatedCost === 0 || menuPlan.totalMenus === 0) {
        toast.warning('Menu plan tidak memiliki data lengkap', {
          description: 'Menu plan ini belum memiliki assignments atau estimasi biaya. Silakan isi budget secara manual.'
        })
      } else {
        toast.success('Form berhasil di-populate dari menu plan', {
          description: `Budget: Rp ${menuPlan.totalEstimatedCost.toLocaleString('id-ID')}, Total menu: ${menuPlan.totalMenus}`
        })
      }
    }
  }, [menuPlanData, isLoadingMenuPlanData, selectedMenuPlanId, form])

  // Watch total budget for validation
  const totalBudget = form.watch('totalBudget')
  const proteinBudget = form.watch('proteinBudget')
  const carbBudget = form.watch('carbBudget')
  const vegetableBudget = form.watch('vegetableBudget')
  const fruitBudget = form.watch('fruitBudget')
  const otherBudget = form.watch('otherBudget')

  // Calculate allocated budget
  const allocatedBudget =
    (proteinBudget || 0) +
    (carbBudget || 0) +
    (vegetableBudget || 0) +
    (fruitBudget || 0) +
    (otherBudget || 0)

  const remainingBudget = (totalBudget || 0) - allocatedBudget
  const isOverBudget = allocatedBudget > (totalBudget || 0)

  // Calculate cost per meal
  const targetMeals = form.watch('targetMeals')
  const costPerMeal = (targetMeals ?? 0) > 0 ? (totalBudget || 0) / (targetMeals ?? 0) : 0

  // Handle form submission
  const onSubmit = (data: CreatePlanFormInput | UpdatePlanFormInput) => {
    // Validate budget allocation
    if (isOverBudget) {
      form.setError('totalBudget', {
        type: 'manual',
        message: 'Alokasi anggaran melebihi total anggaran',
      })
      return
    }

    if (isEditMode && initialData) {
      updatePlan(
        {
          id: initialData.id,
          data: data as UpdatePlanFormInput,
        },
        {
          onSuccess: () => {
            onSuccess?.(initialData.id)
          },
        }
      )
    } else {
      createPlan(data as CreatePlanFormInput, {
        onSuccess: (plan) => {
          if (plan?.id) {
            onSuccess?.(plan.id)
          }
        },
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn('space-y-6', className)}>
        
        {/* Optional Menu Plan Selection (only in create mode) */}
        {!isEditMode && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Menu Plan (Opsional)
              </CardTitle>
              <CardDescription>
                Pilih menu plan yang sudah disetujui untuk auto-populate budget dan target
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Menu Plan Selection */}
              <FormField
                control={form.control}
                name="menuPlanId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pilih Menu Plan</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value)
                        setSelectedMenuPlanId(value)
                      }}
                      value={field.value}
                      disabled={isLoadingMenuPlans}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={
                            isLoadingMenuPlans
                              ? "Memuat menu plans..."
                              : "Pilih menu plan (kosongkan jika input manual)"
                          } />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingMenuPlans ? (
                          <SelectItem value="_loading" disabled>
                            Memuat data menu plans...
                          </SelectItem>
                        ) : menuPlans.length === 0 ? (
                          <SelectItem value="_empty" disabled>
                            Tidak ada menu plan yang disetujui
                          </SelectItem>
                        ) : (
                          menuPlans.map((plan) => (
                            <SelectItem key={plan.id} value={plan.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{plan.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(plan.startDate).toLocaleDateString('id-ID')} - {new Date(plan.endDate).toLocaleDateString('id-ID')}
                                  {' • '}
                                  {plan.totalMenus} menu
                                  {' • '}
                                  Rp {plan.totalEstimatedCost.toLocaleString('id-ID')}
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Sistem akan otomatis menghitung budget dan target berdasarkan menu plan
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Loading state for menu plan data */}
              {isLoadingMenuPlanData && selectedMenuPlanId && (
                <div className="rounded-lg border bg-muted/30 p-3 flex items-center gap-3">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span className="text-sm text-muted-foreground">
                    Menghitung budget dari menu plan...
                  </span>
                </div>
              )}

              {/* Display calculated data */}
              {!isLoadingMenuPlanData && menuPlanData && selectedMenuPlanId && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                    <Calculator className="h-4 w-4" />
                    Budget dari Menu Plan
                  </div>
                  
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border bg-card p-3">
                      <div className="text-xs text-muted-foreground">Total Budget</div>
                      <div className="text-lg font-bold">
                        Rp {menuPlanData.estimatedTotalCost.toLocaleString('id-ID')}
                      </div>
                    </div>
                    <div className="rounded-lg border bg-card p-3">
                      <div className="text-xs text-muted-foreground">Total Menu</div>
                      <div className="text-lg font-bold">
                        {menuPlanData.menuPlan.totalMenus} porsi
                      </div>
                    </div>
                  </div>

                  {menuPlanData.suggestedItems.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">
                        {menuPlanData.suggestedItems.length} bahan kebutuhan (Top 5):
                      </div>
                      <div className="space-y-1">
                        {menuPlanData.suggestedItems.slice(0, 5).map((item) => (
                          <div key={item.itemId} className="text-xs flex justify-between">
                            <span>{item.itemName}</span>
                            <span className="text-muted-foreground">
                              {item.totalQuantity} {item.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Main Form Fields */}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Informasi Dasar</CardTitle>
            </div>
            <CardDescription>
              Informasi umum tentang rencana pengadaan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Program Selection - Only in create mode */}
            {!isEditMode && (
              <FormField
                control={form.control}
                name="programId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Program Gizi *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isLoadingPrograms}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={
                            isLoadingPrograms 
                              ? "Memuat program..." 
                              : "Pilih program gizi"
                          } />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingPrograms ? (
                          <SelectItem value="_loading" disabled>
                            Memuat data program...
                          </SelectItem>
                        ) : programs.length === 0 ? (
                          <SelectItem value="_empty" disabled>
                            Tidak ada program aktif
                          </SelectItem>
                        ) : (
                          programs.map((program) => (
                            <SelectItem key={program.id} value={program.id}>
                              {program.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Program gizi yang akan menggunakan rencana ini
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Plan Name */}
            <FormField
              control={form.control}
              name="planName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Rencana *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Rencana Pengadaan Januari 2025" {...field} />
                  </FormControl>
                  <FormDescription>
                    Nama identifikasi untuk rencana pengadaan
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Catatan tambahan tentang rencana ini..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Period Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Periode Rencana</CardTitle>
            </div>
            <CardDescription>
              Tentukan periode waktu untuk rencana pengadaan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {/* Month */}
              <FormField
                control={form.control}
                name="planMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bulan *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih bulan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MONTH_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Year */}
              <FormField
                control={form.control}
                name="planYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tahun *</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tahun" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {YEAR_OPTIONS.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Quarter */}
              <FormField
                control={form.control}
                name="planQuarter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kuartal (Opsional)</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}
                      defaultValue={field.value?.toString() || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Tidak ada (Opsional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {QUARTER_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Target Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Target Penerima & Makanan</CardTitle>
            </div>
            <CardDescription>
              Tentukan jumlah penerima dan makanan yang akan disediakan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Target Recipients */}
              <FormField
                control={form.control}
                name="targetRecipients"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah Penerima *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Total penerima manfaat program
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Target Meals */}
              <FormField
                control={form.control}
                name="targetMeals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah Makanan *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Total porsi makanan yang akan disediakan
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Budget Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Anggaran</CardTitle>
            </div>
            <CardDescription>
              Alokasi anggaran untuk berbagai kategori bahan pangan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Total Budget */}
            <FormField
              control={form.control}
              name="totalBudget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Anggaran *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    Total anggaran yang tersedia untuk periode ini
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Budget Allocation */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground">
                  Alokasi per Kategori
                </h4>
                <div className="text-right">
                  <div className="text-sm font-medium text-foreground">
                    Dialokasikan: Rp {allocatedBudget.toLocaleString('id-ID')}
                  </div>
                  <div
                    className={cn(
                      'text-xs',
                      isOverBudget
                        ? 'text-destructive'
                        : remainingBudget === 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-muted-foreground'
                    )}
                  >
                    Sisa: Rp {remainingBudget.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>

              {isOverBudget && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>Alokasi anggaran melebihi total anggaran yang tersedia</span>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                {/* Protein Budget */}
                <FormField
                  control={form.control}
                  name="proteinBudget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Protein</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Carb Budget */}
                <FormField
                  control={form.control}
                  name="carbBudget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Karbohidrat</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Vegetable Budget */}
                <FormField
                  control={form.control}
                  name="vegetableBudget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sayuran</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Fruit Budget */}
                <FormField
                  control={form.control}
                  name="fruitBudget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Buah</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Other Budget */}
                <FormField
                  control={form.control}
                  name="otherBudget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lainnya</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Cost per Meal Indicator */}
            {(targetMeals ?? 0) > 0 && (
              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    Estimasi Biaya per Porsi
                  </span>
                  <span className="text-lg font-bold text-foreground">
                    Rp {costPerMeal.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                  </span>
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
            onClick={onCancel || (() => router.back())}
            disabled={isSubmitting}
          >
            <X className="mr-2 h-4 w-4" />
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting || isOverBudget}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting
              ? isEditMode
                ? 'Menyimpan...'
                : 'Membuat...'
              : isEditMode
              ? 'Simpan Perubahan'
              : 'Buat Rencana'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
