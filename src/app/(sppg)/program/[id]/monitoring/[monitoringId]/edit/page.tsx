/**
 * @fileoverview Edit Monitoring Report Page - Multi-step Form (Pre-filled)
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.18.0
 * @author Bagizi-ID Development Team
 * 
 * Page: /program/[id]/monitoring/[monitoringId]/edit
 * Purpose: Edit existing monitoring report with pre-filled multi-step form
 * 
 * Features:
 * - Pre-filled form with existing data
 * - Same multi-step structure as create
 * - Update instead of create
 * - Show last updated info
 * - Audit trail preservation
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Form } from '@/components/ui/form'
import { Skeleton } from '@/components/ui/skeleton'
import { useMonitoringReport, useUpdateMonitoringReport } from '@/features/sppg/program/hooks/useMonitoring'
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

export default function EditMonitoringReportPage() {
  const params = useParams()
  const router = useRouter()
  const programId = params.id as string
  const monitoringId = params.monitoringId as string

  const [currentStep, setCurrentStep] = useState(1)
  const [isDirty, setIsDirty] = useState(false)

  // Fetch existing monitoring report
  const { data: monitoring, isLoading } = useMonitoringReport(programId, monitoringId)
  const { mutate: updateMonitoring, isPending } = useUpdateMonitoringReport(programId, monitoringId)

  const form = useForm<CreateMonitoringInput>({
    resolver: zodResolver(createMonitoringSchema),
    mode: 'onChange'
  })

  // Populate form when data loads
  useEffect(() => {
    if (monitoring) {
      form.reset({
        monitoringDate: new Date(monitoring.monitoringDate),
        reportingWeek: monitoring.reportingWeek ?? undefined,
        reportDate: new Date(monitoring.reportDate),
        
        targetRecipients: monitoring.targetRecipients,
        enrolledRecipients: monitoring.enrolledRecipients,
        activeRecipients: monitoring.activeRecipients,
        dropoutCount: monitoring.dropoutCount,
        newEnrollments: monitoring.newEnrollments,
        attendanceRate: monitoring.attendanceRate,
        assessmentsCompleted: monitoring.assessmentsCompleted,
        improvedNutrition: monitoring.improvedNutrition,
        stableNutrition: monitoring.stableNutrition,
        worsenedNutrition: monitoring.worsenedNutrition,
        criticalCases: monitoring.criticalCases,
        
        feedingDaysPlanned: monitoring.feedingDaysPlanned,
        feedingDaysCompleted: monitoring.feedingDaysCompleted,
        menuVariety: monitoring.menuVariety,
        stockoutDays: monitoring.stockoutDays,
        qualityIssues: monitoring.qualityIssues,
        totalMealsProduced: monitoring.totalMealsProduced,
        totalMealsDistributed: monitoring.totalMealsDistributed,
        wastePercentage: monitoring.wastePercentage ?? 0,
        avgQualityScore: monitoring.avgQualityScore ?? 0,
        customerSatisfaction: monitoring.customerSatisfaction ?? 0,
        complaintCount: monitoring.complaintCount,
        complimentCount: monitoring.complimentCount,
        foodSafetyIncidents: monitoring.foodSafetyIncidents,
        hygieneScore: monitoring.hygieneScore ?? 0,
        temperatureCompliance: monitoring.temperatureCompliance ?? 0,
        
        budgetAllocated: monitoring.budgetAllocated,
        budgetUtilized: monitoring.budgetUtilized,
        staffAttendance: monitoring.staffAttendance ?? 0,
        trainingCompleted: monitoring.trainingCompleted,
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        challenges: monitoring.challenges as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        achievements: monitoring.achievements as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recommendations: monitoring.recommendations as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        feedback: monitoring.feedback as any
      })
    }
  }, [monitoring, form])

  // Track form changes
  useEffect(() => {
    const subscription = form.watch(() => {
      setIsDirty(true)
    })
    return () => subscription.unsubscribe()
  }, [form])

  const handleNextStep = async () => {
    const fieldsToValidate = getStepFields(currentStep)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isValid = await form.trigger(fieldsToValidate as any)

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
    console.log('Updating monitoring report:', data)
    
    updateMonitoring(
      data,
      {
        onSuccess: () => {
          toast.success('Monitoring report updated successfully')
          router.push(`/program/${programId}/monitoring/${monitoringId}`)
        },
        onError: (error: Error) => {
          toast.error('Failed to update monitoring report', {
            description: error.message
          })
        }
      }
    )
  }

  if (isLoading) {
    return (
      <div className="container max-w-5xl py-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-96" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!monitoring) {
    return (
      <div className="container max-w-5xl py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Monitoring report not found or you don&apos;t have permission to edit it.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const progressPercentage = (currentStep / 5) * 100

  return (
    <div className="container max-w-5xl py-6 space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/program/${programId}/monitoring/${monitoringId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Detail
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
        <Link href={`/program/${programId}/monitoring/${monitoringId}`} className="hover:text-foreground">
          Report Detail
        </Link>
        <span>/</span>
        <span className="text-foreground">Edit</span>
      </div>

      {/* Main Form Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">Edit Monitoring Report</CardTitle>
              <CardDescription>
                Step {currentStep} of 5: {STEP_TITLES[currentStep - 1]}
              </CardDescription>
              <p className="text-sm text-muted-foreground mt-2">
                {STEP_DESCRIPTIONS[currentStep - 1]}
              </p>
            </div>
            <div className="text-xs text-muted-foreground text-right">
              <div>Last updated:</div>
              <div>{new Date(monitoring.updatedAt).toLocaleString()}</div>
            </div>
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
              {/* Unsaved changes indicator */}
              {isDirty && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You have unsaved changes.
                  </AlertDescription>
                </Alert>
              )}

              {/* Step Content */}
              {currentStep === 1 && <Step1BasicInfo control={form.control} />}
              {currentStep === 2 && <Step2Beneficiaries control={form.control} />}
              {currentStep === 3 && <Step3ProductionQuality control={form.control} />}
              {currentStep === 4 && <Step4BudgetResources control={form.control} />}
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

              {/* Right: Cancel + Next/Update */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/program/${programId}/monitoring/${monitoringId}`)}
                  disabled={isPending}
                >
                  Cancel
                </Button>

                {currentStep < 5 ? (
                  <Button type="button" onClick={handleNextStep} disabled={isPending}>
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {isPending ? 'Updating...' : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Update Report
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
      return []
    default:
      return []
  }
}
