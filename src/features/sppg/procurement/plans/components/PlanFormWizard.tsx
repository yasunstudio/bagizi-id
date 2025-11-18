/**
 * @fileoverview Plan Form Wizard Component
 * @version Next.js 15.5.4 / React 19
 * @author Bagizi-ID Development Team
 * 
 * REDESIGNED UX:
 * - Step-by-step wizard with progressive disclosure
 * - Visual progress indicator
 * - Smart defaults from menu plan
 * - Real-time budget validation with charts
 * - Contextual help and tooltips
 * - Mobile-responsive design
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Save,
  X,
  ChevronRight,
  ChevronLeft,
  Calendar,
  DollarSign,
  Users,
  FileText,
  AlertCircle,
  BookOpen,
  Calculator,
  CheckCircle2,
  HelpCircle,
  PieChart,
  TrendingUp,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useCreatePlan, useUpdatePlan } from '../hooks'
import { useActivePrograms } from '@/features/sppg/menu/hooks/usePrograms'
import { 
  useApprovedMenuPlans, 
  useMenuPlanData,
  calculateBudgetBreakdown 
} from '@/features/sppg/menu/hooks/useMenuPlans'
import { createPlanFormSchema } from '../schemas'
import type { CreatePlanFormInput } from '../types'

// ================================ TYPES ================================

interface MenuPlanStepProps {
  menuPlans: Array<{
    id: string
    name: string
    startDate: Date | string
    endDate: Date | string
    totalMenus: number
    totalEstimatedCost: number
  }>
  isLoading: boolean
  selectedId: string
  onSelect: (id: string) => void
  menuPlanData?: {
    menuPlan: {
      id: string
      name: string
      startDate: Date | string
      endDate: Date | string
      totalMenus: number
      totalEstimatedCost: number
      programId: string
    }
    estimatedTotalCost: number
    estimatedDailyRecipients: number
    suggestedItems: Array<{
      itemId: string
      itemName: string
      totalQuantity: number
      unit: string
      estimatedCost: number
    }>
  }
  isLoadingData: boolean
  onUseData: () => void
  onSkip: () => void
}

interface BasicInfoStepProps {
  form: UseFormReturn<CreatePlanFormInput>
  programs: Array<{ id: string; name: string }>
  isLoadingPrograms: boolean
}

interface BudgetStepProps {
  form: UseFormReturn<CreatePlanFormInput>
  totalBudget: number
  allocatedBudget: number
  remainingBudget: number
  isOverBudget: boolean
  costPerMeal: number
  budgetPercentages: {
    protein: number
    carb: number
    vegetable: number
    fruit: number
    other: number
  }
  onApplySmartAllocation: () => void
}

interface ReviewStepProps {
  form: UseFormReturn<CreatePlanFormInput>
  programs: Array<{ id: string; name: string }>
  costPerMeal: number
  onEdit: (stepId: WizardStep) => void
}

interface PlanFormWizardProps {
  mode?: 'create' | 'edit'
  initialData?: Partial<CreatePlanFormInput> & { id?: string }
  onSuccess?: (planId: string) => void
  onCancel?: () => void
  className?: string
}

// Wizard steps
type WizardStep = 'menu-plan' | 'basic-info' | 'budget' | 'review'

interface StepConfig {
  id: WizardStep
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  order: number
}

// ================================ CONSTANTS ================================

const WIZARD_STEPS: StepConfig[] = [
  {
    id: 'menu-plan',
    title: 'Menu Plan',
    description: 'Pilih menu plan untuk auto-populate (opsional)',
    icon: BookOpen,
    order: 1,
  },
  {
    id: 'basic-info',
    title: 'Informasi Dasar',
    description: 'Data program, nama, dan periode',
    icon: FileText,
    order: 2,
  },
  {
    id: 'budget',
    title: 'Alokasi Budget',
    description: 'Total budget dan distribusi kategori',
    icon: DollarSign,
    order: 3,
  },
  {
    id: 'review',
    title: 'Review & Submit',
    description: 'Tinjau dan kirim rencana',
    icon: CheckCircle2,
    order: 4,
  },
]

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
  { value: 1, label: 'Q1 (Jan-Mar)' },
  { value: 2, label: 'Q2 (Apr-Jun)' },
  { value: 3, label: 'Q3 (Jul-Sep)' },
  { value: 4, label: 'Q4 (Okt-Des)' },
]

const currentYear = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 3 }, (_, i) => currentYear + i)

// Budget category percentages (smart defaults)
const DEFAULT_BUDGET_PERCENTAGES = {
  protein: 30,
  carb: 35,
  vegetable: 20,
  fruit: 10,
  other: 5,
}

// ================================ COMPONENT ================================

/**
 * Plan Form Wizard Component
 * Multi-step form with improved UX for creating/editing procurement plans
 * 
 * @param mode - 'create' (default) or 'edit' mode
 * @param initialData - Pre-filled data for edit mode
 */
export function PlanFormWizard({
  mode = 'create',
  initialData,
  onSuccess,
  onCancel,
  className,
}: PlanFormWizardProps) {
  const router = useRouter()
  const { mutate: createPlan, isPending: isCreating } = useCreatePlan()
  const { mutate: updatePlan, isPending: isUpdating } = useUpdatePlan()
  
  const isSubmitting = mode === 'edit' ? isUpdating : isCreating
  
  // Wizard state - Skip menu plan step in edit mode
  const [currentStep, setCurrentStep] = useState<WizardStep>(
    mode === 'edit' ? 'basic-info' : 'menu-plan'
  )
  const [completedSteps, setCompletedSteps] = useState<Set<WizardStep>>(new Set())
  const [selectedMenuPlanId, setSelectedMenuPlanId] = useState<string>('')
  const [shouldUseMenuPlanData, setShouldUseMenuPlanData] = useState(false)
  
  // Fetch data
  const { data: programs = [], isLoading: isLoadingPrograms } = useActivePrograms()
  const { data: menuPlans = [], isLoading: isLoadingMenuPlans } = useApprovedMenuPlans()
  const { data: menuPlanData, isLoading: isLoadingMenuPlanData } = useMenuPlanData(
    selectedMenuPlanId || undefined
  )

  // Initialize form with default or initial values
  const form = useForm<CreatePlanFormInput>({
    resolver: zodResolver(createPlanFormSchema),
    defaultValues: initialData || {
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

  // Auto-populate from menu plan
  useEffect(() => {
    if (shouldUseMenuPlanData && selectedMenuPlanId && menuPlanData && !isLoadingMenuPlanData) {
      const { menuPlan, suggestedItems } = menuPlanData
      const budgetBreakdown = calculateBudgetBreakdown(suggestedItems)
      
      // Populate form fields
      form.setValue('menuPlanId', selectedMenuPlanId)
      form.setValue('programId', menuPlan.programId)
      form.setValue('planName', `Rencana ${menuPlan.name}`)
      
      const startDate = new Date(menuPlan.startDate)
      form.setValue('planMonth', String(startDate.getMonth() + 1).padStart(2, '0'))
      form.setValue('planYear', startDate.getFullYear())
      
      form.setValue('totalBudget', menuPlan.totalEstimatedCost)
      form.setValue('proteinBudget', budgetBreakdown.proteinBudget)
      form.setValue('carbBudget', budgetBreakdown.carbBudget)
      form.setValue('vegetableBudget', budgetBreakdown.vegetableBudget)
      form.setValue('fruitBudget', budgetBreakdown.fruitBudget)
      form.setValue('otherBudget', budgetBreakdown.otherBudget)
      
      form.setValue('targetRecipients', menuPlanData.estimatedDailyRecipients)
      form.setValue('targetMeals', menuPlan.totalMenus)
      
      toast.success('Data berhasil diambil dari menu plan', {
        description: `Budget: Rp ${menuPlan.totalEstimatedCost.toLocaleString('id-ID')}`
      })
      
      // Mark menu-plan step as completed and move to basic-info
      setCompletedSteps(prev => new Set([...prev, 'menu-plan']))
      setCurrentStep('basic-info')
      
      // Reset flag
      setShouldUseMenuPlanData(false)
    }
  }, [shouldUseMenuPlanData, menuPlanData, isLoadingMenuPlanData, selectedMenuPlanId, form])

  // Watch form values for calculations
  const totalBudget = form.watch('totalBudget') || 0
  const proteinBudget = form.watch('proteinBudget') || 0
  const carbBudget = form.watch('carbBudget') || 0
  const vegetableBudget = form.watch('vegetableBudget') || 0
  const fruitBudget = form.watch('fruitBudget') || 0
  const otherBudget = form.watch('otherBudget') || 0
  const targetMeals = form.watch('targetMeals') || 0

  const allocatedBudget = proteinBudget + carbBudget + vegetableBudget + fruitBudget + otherBudget
  const remainingBudget = totalBudget - allocatedBudget
  const isOverBudget = allocatedBudget > totalBudget
  const costPerMeal = targetMeals > 0 ? totalBudget / targetMeals : 0

  // Calculate budget percentages
  const budgetPercentages = totalBudget > 0 ? {
    protein: (proteinBudget / totalBudget) * 100,
    carb: (carbBudget / totalBudget) * 100,
    vegetable: (vegetableBudget / totalBudget) * 100,
    fruit: (fruitBudget / totalBudget) * 100,
    other: (otherBudget / totalBudget) * 100,
  } : { protein: 0, carb: 0, vegetable: 0, fruit: 0, other: 0 }

  // Apply smart budget allocation
  const applySmartAllocation = () => {
    if (totalBudget === 0) {
      toast.error('Masukkan total budget terlebih dahulu')
      return
    }
    
    form.setValue('proteinBudget', Math.round(totalBudget * DEFAULT_BUDGET_PERCENTAGES.protein / 100))
    form.setValue('carbBudget', Math.round(totalBudget * DEFAULT_BUDGET_PERCENTAGES.carb / 100))
    form.setValue('vegetableBudget', Math.round(totalBudget * DEFAULT_BUDGET_PERCENTAGES.vegetable / 100))
    form.setValue('fruitBudget', Math.round(totalBudget * DEFAULT_BUDGET_PERCENTAGES.fruit / 100))
    form.setValue('otherBudget', Math.round(totalBudget * DEFAULT_BUDGET_PERCENTAGES.other / 100))
    
    toast.success('Alokasi budget otomatis diterapkan', {
      description: '30% Protein, 35% Karbo, 20% Sayur, 10% Buah, 5% Lainnya'
    })
  }

  // Step navigation
  const getCurrentStepIndex = () => {
    return WIZARD_STEPS.findIndex(step => step.id === currentStep)
  }

  const canGoNext = (): boolean => {
    // Validate current step before proceeding
    switch (currentStep) {
      case 'menu-plan':
        // Optional step - always can proceed
        return true
      
      case 'basic-info':
        const programId = form.getValues('programId')
        const planName = form.getValues('planName')
        const planMonth = form.getValues('planMonth')
        const targetRecipients = form.getValues('targetRecipients')
        const targetMeals = form.getValues('targetMeals')
        return !!(programId && planName && planMonth && targetRecipients > 0 && targetMeals > 0)
      
      case 'budget':
        return totalBudget > 0 && !isOverBudget && allocatedBudget === totalBudget
      
      case 'review':
        return false // Last step
      
      default:
        return false
    }
  }

  const goNext = () => {
    if (!canGoNext()) {
      toast.error('Lengkapi data pada step ini terlebih dahulu')
      return
    }
    
    const stepIndex = getCurrentStepIndex()
    if (stepIndex < WIZARD_STEPS.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]))
      setCurrentStep(WIZARD_STEPS[stepIndex + 1].id)
    }
  }

  const goPrevious = () => {
    const stepIndex = getCurrentStepIndex()
    if (stepIndex > 0) {
      setCurrentStep(WIZARD_STEPS[stepIndex - 1].id)
    }
  }

  const goToStep = (stepId: WizardStep) => {
    setCurrentStep(stepId)
  }

  // Form submission
  const onSubmit = (data: CreatePlanFormInput) => {
    if (isOverBudget) {
      toast.error('Alokasi budget melebihi total budget')
      return
    }

    if (mode === 'edit' && initialData?.id) {
      // Update existing plan
      updatePlan(
        { id: initialData.id, data },
        {
          onSuccess: (plan) => {
            if (plan?.id) {
              toast.success('Rencana pengadaan berhasil diperbarui')
              onSuccess?.(plan.id)
            }
          },
        }
      )
    } else {
      // Create new plan
      createPlan(data, {
        onSuccess: (plan) => {
          if (plan?.id) {
            toast.success('Rencana pengadaan berhasil dibuat')
            onSuccess?.(plan.id)
          }
        },
      })
    }
  }

  // Calculate progress - Filter out menu-plan step in edit mode
  const visibleSteps = mode === 'edit' 
    ? WIZARD_STEPS.filter(step => step.id !== 'menu-plan')
    : WIZARD_STEPS
  const currentStepIndex = visibleSteps.findIndex(step => step.id === currentStep)
  const progress = ((currentStepIndex + 1) / visibleSteps.length) * 100

  return (
    <TooltipProvider>
      <div className={cn('space-y-6', className)}>
        {/* Progress Indicator */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Step {currentStepIndex + 1} dari {visibleSteps.length}
                  </span>
                  <span className="font-medium">
                    {Math.round(progress)}% Selesai
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Step Indicators - Hide menu-plan in edit mode */}
              <div className={cn(
                'grid gap-4',
                mode === 'edit' ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-4'
              )}>
                {visibleSteps.map((step) => {
                  const Icon = step.icon
                  const isActive = currentStep === step.id
                  const isCompleted = completedSteps.has(step.id)
                  
                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => goToStep(step.id)}
                      className={cn(
                        'flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all',
                        isActive && 'border-primary bg-primary/5',
                        !isActive && isCompleted && 'border-green-500/30 bg-green-500/5',
                        !isActive && !isCompleted && 'border-border hover:border-primary/30'
                      )}
                    >
                      <div className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full',
                        isActive && 'bg-primary text-primary-foreground',
                        !isActive && isCompleted && 'bg-green-500 text-white',
                        !isActive && !isCompleted && 'bg-muted text-muted-foreground'
                      )}>
                        {isCompleted && !isActive ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </div>
                      <div className="text-center">
                        <div className={cn(
                          'text-xs font-medium',
                          isActive && 'text-primary',
                          !isActive && isCompleted && 'text-green-600 dark:text-green-400',
                          !isActive && !isCompleted && 'text-muted-foreground'
                        )}>
                          {step.title}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Content */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Step 1: Menu Plan - Only in create mode */}
            {mode === 'create' && currentStep === 'menu-plan' && (
              <MenuPlanStep
                menuPlans={menuPlans}
                isLoading={isLoadingMenuPlans}
                selectedId={selectedMenuPlanId}
                onSelect={setSelectedMenuPlanId}
                menuPlanData={menuPlanData || undefined}
                isLoadingData={isLoadingMenuPlanData}
                onUseData={() => setShouldUseMenuPlanData(true)}
                onSkip={() => {
                  setCurrentStep('basic-info')
                }}
              />
            )}

            {/* Step 2: Basic Info */}
            {currentStep === 'basic-info' && (
              <BasicInfoStep
                form={form}
                programs={programs}
                isLoadingPrograms={isLoadingPrograms}
              />
            )}

            {/* Step 3: Budget */}
            {currentStep === 'budget' && (
              <BudgetStep
                form={form}
                totalBudget={totalBudget}
                allocatedBudget={allocatedBudget}
                remainingBudget={remainingBudget}
                isOverBudget={isOverBudget}
                costPerMeal={costPerMeal}
                budgetPercentages={budgetPercentages}
                onApplySmartAllocation={applySmartAllocation}
              />
            )}

            {/* Step 4: Review */}
            {currentStep === 'review' && (
              <ReviewStep
                form={form}
                programs={programs}
                costPerMeal={costPerMeal}
                onEdit={(stepId) => setCurrentStep(stepId)}
              />
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={goPrevious}
                disabled={getCurrentStepIndex() === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Kembali
              </Button>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onCancel || (() => router.back())}
                  disabled={isCreating}
                >
                  <X className="mr-2 h-4 w-4" />
                  Batal
                </Button>

                {currentStep !== 'review' ? (
                  <Button
                    type="button"
                    onClick={goNext}
                    disabled={!canGoNext()}
                  >
                    Lanjut
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting || isOverBudget}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isSubmitting 
                      ? 'Menyimpan...' 
                      : mode === 'edit' 
                      ? 'Perbarui Rencana' 
                      : 'Buat Rencana'
                    }
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </div>
    </TooltipProvider>
  )
}

// ================================ STEP COMPONENTS ================================

// Step 1: Menu Plan Selection
function MenuPlanStep({
  menuPlans,
  isLoading,
  selectedId,
  onSelect,
  menuPlanData,
  isLoadingData,
  onUseData,
  onSkip,
}: MenuPlanStepProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Pilih Menu Plan (Opsional)
            </CardTitle>
            <CardDescription className="mt-2">
              Auto-populate form dari menu plan yang sudah disetujui, atau skip untuk input manual
            </CardDescription>
          </div>
          <Badge variant="secondary">Opsional</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Menu Plan Selector */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Pilih Menu Plan</label>
          <Select
            value={selectedId}
            onValueChange={onSelect}
            disabled={isLoading}
          >
            <SelectTrigger className="h-auto min-h-[60px]">
              <SelectValue placeholder={
                isLoading ? "Memuat menu plans..." : "Pilih menu plan atau skip"
              } />
            </SelectTrigger>
            <SelectContent>
              {isLoading ? (
                <SelectItem value="_loading" disabled>
                  Memuat data...
                </SelectItem>
              ) : menuPlans.length === 0 ? (
                <SelectItem value="_empty" disabled>
                  Tidak ada menu plan tersedia
                </SelectItem>
              ) : (
                menuPlans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    <div className="flex flex-col py-2">
                      <span className="font-semibold">{plan.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(plan.startDate).toLocaleDateString('id-ID')} - {new Date(plan.endDate).toLocaleDateString('id-ID')}
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">
                        {plan.totalMenus} menu • Rp {plan.totalEstimatedCost.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Loading State */}
        {isLoadingData && selectedId && (
          <div className="rounded-lg border bg-muted/30 dark:bg-muted/10 p-4 flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm">Memuat data menu plan...</span>
          </div>
        )}

        {/* Preview Data */}
        {!isLoadingData && menuPlanData && selectedId && (
          <div className="space-y-4">
            <div className="rounded-lg border-2 border-primary/30 bg-primary/5 dark:bg-primary/10 p-6 space-y-4">
              <div className="flex items-center gap-2 text-primary dark:text-primary-foreground font-semibold">
                <TrendingUp className="h-5 w-5" />
                Preview Data dari Menu Plan
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Total Budget</div>
                  <div className="text-2xl font-bold">
                    Rp {menuPlanData.estimatedTotalCost.toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Total Menu</div>
                  <div className="text-2xl font-bold">
                    {menuPlanData.menuPlan.totalMenus} menu
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Target Penerima</div>
                  <div className="text-xl font-bold">
                    ~{menuPlanData.estimatedDailyRecipients} orang/hari
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Periode</div>
                  <div className="text-sm font-medium">
                    {new Date(menuPlanData.menuPlan.startDate).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>

              {menuPlanData.suggestedItems.length > 0 && (
                <div className="space-y-2 pt-2 border-t">
                  <div className="text-sm font-medium">
                    Top 5 Bahan yang Dibutuhkan:
                  </div>
                  <div className="grid gap-2">
                    {menuPlanData.suggestedItems.slice(0, 5).map((item) => (
                      <div key={item.itemId} className="flex justify-between items-center text-sm bg-card dark:bg-card/50 rounded-lg p-2 border dark:border-border/50">
                        <span className="font-medium">{item.itemName}</span>
                        <span className="text-muted-foreground">
                          {item.totalQuantity} {item.unit} • Rp {item.estimatedCost.toLocaleString('id-ID')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button
              type="button"
              onClick={onUseData}
              className="w-full"
              size="lg"
            >
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Gunakan Data Ini & Lanjut
            </Button>
          </div>
        )}

        {/* Skip Option */}
        {!selectedId && (
          <div className="space-y-3">
            <Separator />
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Tidak ada menu plan yang cocok?
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={onSkip}
                className="w-full"
              >
                Skip & Input Manual
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Step 2: Basic Information
function BasicInfoStep({ form, programs, isLoadingPrograms }: BasicInfoStepProps) {
  return (
    <div className="space-y-6">
      {/* Program & Name */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Informasi Dasar
          </CardTitle>
          <CardDescription>
            Data program, nama rencana, dan periode pengadaan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Program */}
          <FormField
            control={form.control}
            name="programId"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel>Program Gizi *</FormLabel>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Pilih program gizi yang akan menggunakan rencana pengadaan ini
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={
                        isLoadingPrograms ? "Memuat..." : "Pilih program"
                      } />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {programs.map((program) => (
                      <SelectItem key={program.id} value={program.id}>
                        {program.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Plan Name */}
          <FormField
            control={form.control}
            name="planName"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel>Nama Rencana *</FormLabel>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Contoh: &quot;Pengadaan Januari 2025&quot; atau &quot;Rencana Q1 2025&quot;
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <FormControl>
                  <Input placeholder="Nama identifikasi rencana" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Period */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Periode Pengadaan
          </CardTitle>
          <CardDescription>
            Bulan dan tahun rencana pengadaan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
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
                      {MONTH_OPTIONS.map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                        <SelectValue />
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

            <FormField
              control={form.control}
              name="planQuarter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kuartal <span className="text-muted-foreground">(Opsional)</span></FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Tidak ada" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {QUARTER_OPTIONS.map((quarter) => (
                        <SelectItem key={quarter.value} value={quarter.value.toString()}>
                          {quarter.label}
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

      {/* Targets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Target Penerima & Makanan
          </CardTitle>
          <CardDescription>
            Jumlah penerima dan total porsi makanan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="targetRecipients"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel>Jumlah Penerima *</FormLabel>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Total orang yang akan menerima makanan per hari
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Contoh: 500"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    Jumlah penerima per hari
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetMeals"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel>Total Porsi Makanan *</FormLabel>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Total porsi untuk seluruh periode (penerima × hari × frekuensi)
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Contoh: 15000"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    Total porsi untuk seluruh periode
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Step 3: Budget Allocation
function BudgetStep({
  form,
  totalBudget,
  allocatedBudget,
  remainingBudget,
  isOverBudget,
  costPerMeal,
  budgetPercentages,
  onApplySmartAllocation,
}: BudgetStepProps) {
  return (
    <div className="space-y-6">
      {/* Total Budget */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Total Anggaran
          </CardTitle>
          <CardDescription>
            Tentukan total budget yang tersedia untuk periode ini
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="totalBudget"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">Total Budget *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    className="text-2xl font-bold h-14"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>
                  Total anggaran dalam Rupiah
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Budget Summary */}
          {totalBudget > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 pt-4 border-t">
              <div className="rounded-lg bg-muted dark:bg-muted/50 p-4">
                <div className="text-xs text-muted-foreground">Total Budget</div>
                <div className="text-xl font-bold mt-1">
                  Rp {totalBudget.toLocaleString('id-ID')}
                </div>
              </div>
              <div className="rounded-lg bg-muted dark:bg-muted/50 p-4">
                <div className="text-xs text-muted-foreground">Budget Dialokasikan</div>
                <div className={cn(
                  "text-xl font-bold mt-1",
                  isOverBudget && "text-destructive"
                )}>
                  Rp {allocatedBudget.toLocaleString('id-ID')}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Budget Allocation */}
      {totalBudget > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Alokasi per Kategori
                </CardTitle>
                <CardDescription>
                  Distribusi budget berdasarkan kategori bahan pangan
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onApplySmartAllocation}
              >
                <Calculator className="mr-2 h-4 w-4" />
                Alokasi Otomatis
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Budget Status */}
            <div className={cn(
              "rounded-lg border-2 p-4",
              isOverBudget 
                ? "border-destructive bg-destructive/10 dark:bg-destructive/5" 
                : remainingBudget === 0 
                ? "border-green-500 bg-green-50 dark:bg-green-950/30" 
                : "border-border bg-muted/30 dark:bg-muted/10"
            )}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Status Alokasi</div>
                  <div className="text-lg font-bold mt-1">
                    {isOverBudget ? 'Melebihi Budget' : remainingBudget === 0 ? 'Sesuai Budget' : 'Belum Lengkap'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Sisa</div>
                  <div className={cn(
                    "text-2xl font-bold mt-1",
                    isOverBudget && "text-destructive",
                    remainingBudget === 0 && "text-green-600 dark:text-green-400"
                  )}>
                    Rp {Math.abs(remainingBudget).toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
            </div>

            {isOverBudget && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 dark:bg-destructive/5 p-3 text-sm text-destructive dark:text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>Kurangi alokasi atau tingkatkan total budget</span>
              </div>
            )}

            {/* Category Inputs with Percentages */}
            <div className="space-y-4">
              {([
                { name: 'proteinBudget' as const, label: 'Protein (Hewani & Nabati)', recommended: 30, color: 'bg-blue-500' },
                { name: 'carbBudget' as const, label: 'Karbohidrat (Nasi, Roti, dll)', recommended: 35, color: 'bg-amber-500' },
                { name: 'vegetableBudget' as const, label: 'Sayuran', recommended: 20, color: 'bg-green-500' },
                { name: 'fruitBudget' as const, label: 'Buah-buahan', recommended: 10, color: 'bg-orange-500' },
                { name: 'otherBudget' as const, label: 'Lainnya (Bumbu, Minyak, dll)', recommended: 5, color: 'bg-purple-500' },
              ] as const).map((category) => (
                <FormField
                  key={category.name}
                  control={form.control}
                  name={category.name}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="flex items-center gap-2">
                          <div className={cn("w-3 h-3 rounded-full", category.color)} />
                          {category.label}
                        </FormLabel>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">
                            Rekomendasi: {category.recommended}%
                          </span>
                          <Badge variant="secondary">
                            {budgetPercentages[category.name.replace('Budget', '') as keyof typeof budgetPercentages].toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const recommended = Math.round(totalBudget * category.recommended / 100)
                            field.onChange(recommended)
                          }}
                        >
                          {category.recommended}%
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cost per Meal */}
      {totalBudget > 0 && costPerMeal > 0 && (
        <Card className="border-primary/30 bg-primary/5 dark:bg-primary/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Biaya per Porsi</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Total Budget ÷ Target Porsi
                </div>
              </div>
              <div className="text-3xl font-bold text-primary dark:text-primary-foreground">
                Rp {costPerMeal.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Step 4: Review & Submit
function ReviewStep({ form, programs, costPerMeal, onEdit }: ReviewStepProps) {
  const values = form.getValues()
  const selectedProgram = programs.find((p) => p.id === values.programId)
  const monthLabel = MONTH_OPTIONS.find(m => m.value === values.planMonth)?.label
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          Review & Konfirmasi
        </CardTitle>
        <CardDescription>
          Pastikan semua data sudah benar sebelum submit
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Informasi Dasar</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEdit('basic-info')}
            >
              Edit
            </Button>
          </div>
          <div className="rounded-lg border bg-muted/30 dark:bg-muted/10 p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Program:</span>
              <span className="font-medium">{selectedProgram?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nama Rencana:</span>
              <span className="font-medium">{values.planName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Periode:</span>
              <span className="font-medium">{monthLabel} {values.planYear}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Penerima:</span>
              <span className="font-medium">{values.targetRecipients} orang</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Porsi:</span>
              <span className="font-medium">{values.targetMeals} porsi</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Budget Summary */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Alokasi Budget</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEdit('budget')}
            >
              Edit
            </Button>
          </div>
          <div className="rounded-lg border-2 border-primary/30 bg-primary/5 dark:bg-primary/10 p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Budget:</span>
              <span className="text-2xl font-bold">
                Rp {values.totalBudget.toLocaleString('id-ID')}
              </span>
            </div>
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Protein:</span>
                <span className="font-medium">Rp {(values.proteinBudget || 0).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Karbohidrat:</span>
                <span className="font-medium">Rp {(values.carbBudget || 0).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sayuran:</span>
                <span className="font-medium">Rp {(values.vegetableBudget || 0).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Buah:</span>
                <span className="font-medium">Rp {(values.fruitBudget || 0).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lainnya:</span>
                <span className="font-medium">Rp {(values.otherBudget || 0).toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
          
          {costPerMeal > 0 && (
            <div className="rounded-lg bg-muted dark:bg-muted/50 p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Biaya per Porsi:</span>
                <span className="text-xl font-bold">
                  Rp {costPerMeal.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        {values.notes && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Catatan:</h4>
              <div className="rounded-lg border bg-muted/30 dark:bg-muted/10 p-3 text-sm text-muted-foreground">
                {values.notes}
              </div>
            </div>
          </>
        )}

        {/* Optional: Add notes here */}
        {!values.notes && (
          <>
            <Separator />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan Tambahan (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tambahkan catatan jika diperlukan..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}
