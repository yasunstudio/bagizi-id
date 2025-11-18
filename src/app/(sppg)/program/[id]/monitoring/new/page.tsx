/**
 * @fileoverview New Monitoring Report Page - Multi-step Form
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.18.0
 * @author Bagizi-ID Development Team
 * 
 * Page: /program/[id]/monitoring/new
 * Purpose: Create new monitoring report with multi-step form (5 steps)
 * 
 * Architecture Decision:
 * - Uses DEDICATED PAGE instead of modal (enterprise-grade pattern)
 * - Complex entity: 30+ fields + 4 JSON fields
 * - Multi-step form with progress indicator
 * - Draft save + auto-save functionality
 * - Proper audit trail with reportedBy
 * 
 * Steps:
 * 1. Basic Information (20%) - Date, reporter, period
 * 2. Beneficiary & Nutrition (40%) - Recipients, attendance, assessments
 * 3. Production & Quality (60%) - Meals, quality scores, safety
 * 4. Budget & Resources (80%) - Budget utilization, staff
 * 5. Qualitative Analysis (100%) - Challenges, achievements, recommendations, feedback
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Save,
  Check,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Form } from '@/components/ui/form'
import { useCreateMonitoringReport } from '@/features/sppg/program/hooks/useMonitoring'
import { useAutoPopulateMonitoring } from '@/features/sppg/program/hooks/useAutoPopulateMonitoring'
import { createMonitoringSchema, type CreateMonitoringInput } from '@/features/sppg/program/schemas/monitoringSchema'
import { toast } from 'sonner'

// Import step components
import {
  Step1BasicInfo,
  Step2Beneficiaries,
  Step3ProductionQuality,
  Step4BudgetResources,
  Step5Qualitative
} from '@/features/sppg/program/components/monitoring'

const STEP_TITLES = [
  'Basic Information',
  'Beneficiary & Nutrition Metrics',
  'Production & Quality',
  'Budget & Resources',
  'Qualitative Analysis'
]

const STEP_DESCRIPTIONS = [
  'Monitoring period and reporter information',
  'Recipients, attendance, and nutrition assessments',
  'Meal production, distribution, and quality scores',
  'Budget utilization and human resources',
  'Challenges, achievements, recommendations, and feedback'
]

export default function NewMonitoringReportPage() {
  const params = useParams()
  const router = useRouter()
  const programId = params.id as string

  const [currentStep, setCurrentStep] = useState(1)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  
  // 🔒 Use ref to track if auto-fill has already been executed (prevent infinite loop)
  const hasAutoFilled = useRef(false)

  const { mutate: createMonitoring, isPending } = useCreateMonitoringReport(programId)

  // 🚀 NEW: Auto-populate monitoring data
  const { 
    data: autoData, 
    isLoading: isLoadingAutoData,
    error: autoDataError,
    refetch: refetchAutoData
  } = useAutoPopulateMonitoring(programId)

  const form = useForm({
    resolver: zodResolver(createMonitoringSchema),
    defaultValues: {
      // Auto-filled by API
      programId: programId,
      reportedById: '', // Will be filled from session in API

      // Step 1: Basic Info
      monitoringDate: new Date(),
      reportingWeek: undefined,

      // Step 2: Beneficiaries
      targetRecipients: 0,
      enrolledRecipients: 0,
      activeRecipients: 0,
      dropoutCount: 0,
      newEnrollments: 0,
      attendanceRate: 0,
      assessmentsCompleted: 0,
      improvedNutrition: 0,
      stableNutrition: 0,
      worsenedNutrition: 0,
      criticalCases: 0,

      // Step 3: Production & Quality
      feedingDaysPlanned: 0,
      feedingDaysCompleted: 0,
      menuVariety: 0,
      stockoutDays: 0,
      qualityIssues: 0,
      totalMealsProduced: 0,
      totalMealsDistributed: 0,
      wastePercentage: 0,
      avgQualityScore: 0,
      customerSatisfaction: 0,
      complaintCount: 0,
      complimentCount: 0,
      foodSafetyIncidents: 0,
      hygieneScore: 0,
      temperatureCompliance: 0,

      // Step 4: Budget & Resources
      budgetAllocated: 0,
      budgetUtilized: 0,
      staffAttendance: 0,
      trainingCompleted: 0,

      // Step 5: Qualitative - Optional fields (can be undefined)
      challenges: undefined,
      achievements: undefined,
      recommendations: undefined,
      feedback: undefined
    },
    mode: 'onChange'
  })

  // Handle save draft functionality (defined before useEffect that uses it)
  // Accepts an options object so auto-save can run silently (no toast)
  const handleSaveDraft = useCallback((opts?: { silent?: boolean }) => {
    const { silent = false } = opts || {}
    const data = form.getValues()
    // Save to localStorage as draft
    try {
      localStorage.setItem(`monitoring-draft-${programId}`, JSON.stringify(data))
      setLastSaved(new Date())
      setIsDirty(false)
      if (!silent) {
        toast.success('Draft disimpan')
      }
    } catch (e) {
      // LocalStorage can fail in some browsers / private mode — handle gracefully
      console.error('Failed to save draft to localStorage', e)
      if (!silent) {
        toast.error('Gagal menyimpan draft secara lokal')
      }
    }
  }, [form, programId])

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (!isDirty) return

    const autoSaveInterval = setInterval(() => {
      // Auto-save should be silent to avoid repeated toasts
      handleSaveDraft({ silent: true })
    }, 30000) // 30 seconds

    return () => clearInterval(autoSaveInterval)
  }, [isDirty, handleSaveDraft])

  // Track form changes
  useEffect(() => {
    const subscription = form.watch(() => {
      setIsDirty(true)
    })
    return () => subscription.unsubscribe()
  }, [form])

  // 🚀 NEW: Auto-fill form with aggregated data
  useEffect(() => {
    // Only auto-fill once when data is available and hasn't been filled yet
    if (autoData && !hasAutoFilled.current) {
      hasAutoFilled.current = true
      
      console.log('🎯 Auto-filling form with data:', autoData)
      
      // Step 1: Basic Info
      form.setValue('monitoringDate', new Date(autoData.monitoringDate))
      form.setValue('reportingWeek', autoData.reportingWeek)
      
      // Step 2: Beneficiaries
      form.setValue('targetRecipients', autoData.targetRecipients)
      form.setValue('enrolledRecipients', autoData.enrolledRecipients)
      form.setValue('activeRecipients', autoData.activeRecipients)
      form.setValue('attendanceRate', autoData.attendanceRate)
      
      // Step 3: Production & Quality
      form.setValue('totalMealsProduced', autoData.totalMealsProduced)
      form.setValue('totalMealsDistributed', autoData.totalMealsDistributed)
      form.setValue('wastePercentage', autoData.wastePercentage || 0)
      
      // Step 4: Budget
      form.setValue('budgetAllocated', autoData.budgetAllocated)
      form.setValue('budgetUtilized', autoData.budgetUtilized)
      
      // Show success notification (only once)
      toast.success('✨ Data otomatis terisi dari sistem!', {
        description: `Data agregasi dari ${autoData.productionCount} produksi dan ${autoData.distributionCount} distribusi (7 hari terakhir)`
      })
    }
  }, [autoData, form])

  // Handle auto-populate error
  useEffect(() => {
    if (autoDataError) {
      console.error('❌ Auto-populate error:', autoDataError)
      toast.error('Gagal memuat data otomatis', {
        description: 'Silakan isi form secara manual atau muat ulang halaman'
      })
    }
  }, [autoDataError])

  const handleNextStep = async () => {
    // Validate current step fields before proceeding
    const fieldsToValidate = getStepFields(currentStep)
    const isValid = await form.trigger(fieldsToValidate as unknown as Parameters<typeof form.trigger>[0])

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 5))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      toast.error('Please fix the errors before proceeding')
    }
  }

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const onSubmit = (data: CreateMonitoringInput) => {
    console.log('📝 Submitting monitoring report (before transform):', data)
    
    // Transform Date objects to ISO strings for API
    const transformedData = {
      ...data,
      monitoringDate: data.monitoringDate instanceof Date 
        ? data.monitoringDate.toISOString() 
        : data.monitoringDate,
    } as unknown as CreateMonitoringInput
    
    console.log('📝 Submitting monitoring report (after transform):', transformedData)
    
    // Temporary type assertion - hook signature needs fixing (expects Omit<> but should accept full type)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createMonitoring(transformedData as any, {
      onSuccess: () => {
        toast.success('Monitoring report created successfully')
        // Clear draft
        localStorage.removeItem(`monitoring-draft-${programId}`)
        // Navigate to detail page or list
        router.push(`/program/${programId}?tab=monitoring`)
      },
      onError: (error: Error) => {
        toast.error('Failed to create monitoring report', {
          description: error.message
        })
      }
    })
  }

  const progressPercentage = (currentStep / 5) * 100

  return (
    <div className="container max-w-5xl py-6 space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/program/${programId}?tab=monitoring`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Monitoring
        </Button>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href={`/program/${programId}`} className="hover:text-foreground">
          Program
        </Link>
        <span>/</span>
        <Link href={`/program/${programId}?tab=monitoring`} className="hover:text-foreground">
          Monitoring
        </Link>
        <span>/</span>
        <span className="text-foreground">New Report</span>
      </div>

      {/* Main Form Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">New Monitoring Report</CardTitle>
              <CardDescription>
                Step {currentStep} of 5: {STEP_TITLES[currentStep - 1]}
              </CardDescription>
              <p className="text-sm text-muted-foreground mt-2">
                {STEP_DESCRIPTIONS[currentStep - 1]}
              </p>
            </div>
            {lastSaved && (
              <div className="text-xs text-muted-foreground">
                Last saved: {lastSaved.toLocaleTimeString()}
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 mt-4">
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              {STEP_TITLES.map((title, index) => (
                <div
                  key={index}
                  className={currentStep === index + 1 ? 'font-medium text-foreground' : ''}
                >
                  {index + 1}
                </div>
              ))}
            </div>
          </div>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              {/* 🚀 NEW: Auto-populate status */}
              {isLoadingAutoData && (
                <Alert>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertDescription>
                    Memuat data otomatis dari sistem...
                  </AlertDescription>
                </Alert>
              )}

              {/* Manual refresh button for auto-populate */}
              {!isLoadingAutoData && autoData && (
                <Alert>
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>Data otomatis terisi dari {autoData.productionCount} produksi & {autoData.distributionCount} distribusi (7 hari terakhir)</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        hasAutoFilled.current = false // Reset flag to allow re-fill
                        refetchAutoData()
                      }}
                      disabled={isLoadingAutoData}
                    >
                      {isLoadingAutoData ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                          Memuat...
                        </>
                      ) : (
                        'Muat Ulang'
                      )}
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {/* Auto-save indicator */}
              {isDirty && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Unsaved changes. Auto-save will run every 30 seconds.
                  </AlertDescription>
                </Alert>
              )}

              {/* Step Content - Temporary type assertion due to z.coerce.date() creating 'unknown' type */}
              {/* @ts-expect-error - Control type incompatibility from z.coerce.date() */}
              {currentStep === 1 && <Step1BasicInfo control={form.control} />}
              {/* @ts-expect-error - Control type incompatibility from z.coerce.date() */}
              {currentStep === 2 && <Step2Beneficiaries control={form.control} />}
              {/* @ts-expect-error - Control type incompatibility from z.coerce.date() */}
              {currentStep === 3 && <Step3ProductionQuality control={form.control} />}
              {/* @ts-expect-error - Control type incompatibility from z.coerce.date() */}
              {currentStep === 4 && <Step4BudgetResources control={form.control} />}
              {/* @ts-expect-error - Control type incompatibility from z.coerce.date() */}
              {currentStep === 5 && <Step5Qualitative control={form.control} />}
            </CardContent>

            <CardFooter className="flex justify-between border-t pt-6">
              {/* Left: Previous Button */}
              <div>
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevStep}
                    disabled={isPending}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                )}
              </div>

              {/* Right: Save Draft + Next/Submit */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSaveDraft({ silent: false })}
                  disabled={isPending || !isDirty}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>

                {currentStep < 5 ? (
                  <Button type="button" onClick={handleNextStep} disabled={isPending}>
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {isPending ? 'Submitting...' : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Submit Report
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}

// Helper function to get fields for each step (for validation)
function getStepFields(step: number): string[] {
  switch (step) {
    case 1:
      return ['monitoringDate', 'reportingWeek']
    case 2:
      return [
        'targetRecipients',
        'enrolledRecipients',
        'activeRecipients',
        'attendanceRate'
      ]
    case 3:
      return [
        'feedingDaysPlanned',
        'feedingDaysCompleted',
        'totalMealsProduced',
        'totalMealsDistributed'
      ]
    case 4:
      return ['budgetAllocated', 'budgetUtilized']
    case 5:
      return [] // Qualitative fields are optional
    default:
      return []
  }
}
