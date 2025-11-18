/**
 * @fileoverview Form component untuk Program Beneficiary Enrollment
 * REFACTORED VERSION: Menggunakan modular section components dengan Indonesian translation
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * Form lengkap dengan conditional rendering berdasarkan target group
 * 10 Sections menggunakan component terpisah dari ./form-sections/:
 * 1. Core Relations (Program & Organization)
 * 2. Enrollment Period (Dates)
 * 3. Target Group & Beneficiaries (with Gender Breakdown)
 * 4. Feeding Configuration
 * 5. Delivery Configuration (with Service Config)
 * 6. Budget Tracking (Optional)
 * 7. Performance Tracking (Edit mode only)
 * 8. Quality & Satisfaction (Edit mode only)
 * 9. Special Requirements (with Program Focus)
 * 10. Status & Administrative
 */

'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Form } from '@/components/ui/form'
import { Loader2 } from 'lucide-react'
import { 
  useCreateBeneficiaryEnrollment, 
  useUpdateBeneficiaryEnrollment,
  useBeneficiaryEnrollment
} from '../../hooks/useBeneficiaryEnrollments'
import { useBeneficiaryOrganizations } from '../../hooks/useBeneficiaryOrganizations'
import { usePrograms, useProgram } from '../../hooks/usePrograms'
import { 
  createBeneficiaryEnrollmentSchema,
  type CreateBeneficiaryEnrollmentInput 
} from '../../schemas/beneficiaryEnrollmentSchema'
import { TargetGroup, ProgramEnrollmentStatus } from '@prisma/client'
import { FORM_LABELS } from '../../lib/enrollmentFormLabels'

// Import all form sections
import {
  CoreRelationsSection,
  EnrollmentPeriodSection,
  TargetGroupSection,
  FeedingConfigSection,
  DeliveryConfigSection,
  BudgetTrackingSection,
  PerformanceTrackingSection,
  QualitySatisfactionSection,
  SpecialRequirementsSection,
  StatusAdministrativeSection,
} from './form-sections'

interface BeneficiaryEnrollmentFormProps {
  enrollmentId?: string
  programId?: string
  targetGroup?: TargetGroup
  onSuccess?: () => void
  onCancel?: () => void
}

export function BeneficiaryEnrollmentForm({
  enrollmentId,
  programId,
  targetGroup,
  onSuccess,
  onCancel
}: BeneficiaryEnrollmentFormProps) {
  const isEditMode = !!enrollmentId

  // Data fetching
  const { data: enrollment, isLoading: isLoadingEnrollment } = useBeneficiaryEnrollment(
    enrollmentId || '',
    { enabled: isEditMode }
  )
  const { data: organizations = [], isLoading: isLoadingOrgs } = useBeneficiaryOrganizations()
  const { data: programs = [], isLoading: isLoadingPrograms } = usePrograms()

  // Mutations
  const { mutate: createEnrollment, isPending: isCreating } = useCreateBeneficiaryEnrollment()
  const { mutate: updateEnrollment, isPending: isUpdating } = useUpdateBeneficiaryEnrollment()

  const isPending = isCreating || isUpdating

  // Form setup with explicit typing to avoid React Hook Form v7 type issues  
  const form = useForm({
    resolver: zodResolver(createBeneficiaryEnrollmentSchema),
    defaultValues: {
      beneficiaryOrgId: '',
      programId: programId || '',
      enrollmentDate: new Date(),
      startDate: new Date(),
      endDate: undefined,
      targetGroup: targetGroup || ('SCHOOL_CHILDREN' as TargetGroup),
      targetBeneficiaries: 0,
      activeBeneficiaries: undefined,
      beneficiaries0to2Years: undefined,
      beneficiaries2to5Years: undefined,
      beneficiaries6to12Years: undefined,
      beneficiaries13to15Years: undefined,
      beneficiaries16to18Years: undefined,
      beneficiariesAbove18: undefined,
      targetGroupSpecificData: undefined,
      maleBeneficiaries: undefined,
      femaleBeneficiaries: undefined,
      feedingDays: undefined,
      mealsPerDay: undefined,
      feedingTime: undefined,
      breakfastTime: undefined,
      lunchTime: undefined,
      snackTime: undefined,
      deliveryAddress: undefined,
      deliveryContact: undefined,
      deliveryPhone: undefined,
      deliveryInstructions: undefined,
      preferredDeliveryTime: undefined,
      estimatedTravelTime: undefined,
      storageCapacity: undefined,
      servingMethod: undefined,
      monthlyBudgetAllocation: undefined,
      budgetPerBeneficiary: undefined,
      totalMealsServed: 0,
      totalBeneficiariesServed: 0,
      averageAttendanceRate: undefined,
      lastDistributionDate: undefined,
      lastMonitoringDate: undefined,
      satisfactionScore: undefined,
      complaintCount: 0,
      nutritionComplianceRate: undefined,
      specialDietaryNeeds: undefined,
      allergenRestrictions: undefined,
      culturalPreferences: undefined,
      medicalConsiderations: undefined,
      programFocus: undefined,
      supplementaryServices: undefined,
      enrollmentStatus: 'ACTIVE' as ProgramEnrollmentStatus,
      isActive: true,
      isPriority: false,
      needsAssessment: false,
      enrolledBy: undefined,
      approvedBy: undefined,
      approvedAt: undefined,
      remarks: undefined,
      internalNotes: undefined,
    }
  })

  // Fetch selected program configuration for multi-target support (after form is defined)
  const selectedProgramId = form.watch('programId')
  const { data: selectedProgram, isLoading: isLoadingProgram } = useProgram(
    selectedProgramId || ''
  )

  // Load existing data in edit mode
  useEffect(() => {
    if (isEditMode && enrollment) {
      form.reset({
        beneficiaryOrgId: enrollment.beneficiaryOrgId,
        programId: enrollment.programId,
        enrollmentDate: enrollment.enrollmentDate ? new Date(enrollment.enrollmentDate) : undefined,
        startDate: new Date(enrollment.startDate),
        endDate: enrollment.endDate ? new Date(enrollment.endDate) : undefined,
        targetGroup: enrollment.targetGroup as TargetGroup,
        targetBeneficiaries: enrollment.targetBeneficiaries,
        activeBeneficiaries: enrollment.activeBeneficiaries ?? undefined,
        beneficiaries0to2Years: enrollment.beneficiaries0to2Years ?? undefined,
        beneficiaries2to5Years: enrollment.beneficiaries2to5Years ?? undefined,
        beneficiaries6to12Years: enrollment.beneficiaries6to12Years ?? undefined,
        beneficiaries13to15Years: enrollment.beneficiaries13to15Years ?? undefined,
        beneficiaries16to18Years: enrollment.beneficiaries16to18Years ?? undefined,
        beneficiariesAbove18: enrollment.beneficiariesAbove18 ?? undefined,
        targetGroupSpecificData: enrollment.targetGroupSpecificData as Record<string, number | string | boolean> | undefined,
        maleBeneficiaries: enrollment.maleBeneficiaries ?? undefined,
        femaleBeneficiaries: enrollment.femaleBeneficiaries ?? undefined,
        feedingDays: enrollment.feedingDays ?? undefined,
        mealsPerDay: enrollment.mealsPerDay ?? undefined,
        feedingTime: enrollment.feedingTime ?? undefined,
        breakfastTime: enrollment.breakfastTime ?? undefined,
        lunchTime: enrollment.lunchTime ?? undefined,
        snackTime: enrollment.snackTime ?? undefined,
        deliveryAddress: enrollment.deliveryAddress ?? undefined,
        deliveryContact: enrollment.deliveryContact ?? undefined,
        deliveryPhone: enrollment.deliveryPhone ?? undefined,
        deliveryInstructions: enrollment.deliveryInstructions ?? undefined,
        preferredDeliveryTime: enrollment.preferredDeliveryTime ?? undefined,
        estimatedTravelTime: enrollment.estimatedTravelTime ?? undefined,
        storageCapacity: enrollment.storageCapacity ?? undefined,
        servingMethod: enrollment.servingMethod ?? undefined,
        monthlyBudgetAllocation: enrollment.monthlyBudgetAllocation ? Number(enrollment.monthlyBudgetAllocation) : undefined,
        budgetPerBeneficiary: enrollment.budgetPerBeneficiary ? Number(enrollment.budgetPerBeneficiary) : undefined,
        totalMealsServed: enrollment.totalMealsServed ?? 0,
        totalBeneficiariesServed: enrollment.totalBeneficiariesServed ?? 0,
        averageAttendanceRate: enrollment.averageAttendanceRate ? Number(enrollment.averageAttendanceRate) : undefined,
        lastDistributionDate: enrollment.lastDistributionDate ? new Date(enrollment.lastDistributionDate) : undefined,
        lastMonitoringDate: enrollment.lastMonitoringDate ? new Date(enrollment.lastMonitoringDate) : undefined,
        satisfactionScore: enrollment.satisfactionScore ? Number(enrollment.satisfactionScore) : undefined,
        complaintCount: enrollment.complaintCount ?? 0,
        nutritionComplianceRate: enrollment.nutritionComplianceRate ? Number(enrollment.nutritionComplianceRate) : undefined,
        specialDietaryNeeds: enrollment.specialDietaryNeeds ?? undefined,
        allergenRestrictions: enrollment.allergenRestrictions ?? undefined,
        culturalPreferences: enrollment.culturalPreferences ?? undefined,
        medicalConsiderations: enrollment.medicalConsiderations ?? undefined,
        programFocus: enrollment.programFocus ?? undefined,
        supplementaryServices: enrollment.supplementaryServices ?? undefined,
        enrollmentStatus: enrollment.enrollmentStatus as ProgramEnrollmentStatus,
        isActive: enrollment.isActive ?? true,
        isPriority: enrollment.isPriority ?? false,
        needsAssessment: enrollment.needsAssessment ?? false,
        enrolledBy: enrollment.enrolledBy ?? undefined,
        approvedBy: enrollment.approvedBy ?? undefined,
        approvedAt: enrollment.approvedAt ? new Date(enrollment.approvedAt) : undefined,
        remarks: enrollment.remarks ?? undefined,
        internalNotes: enrollment.internalNotes ?? undefined,
      })
    }
  }, [enrollment, isEditMode, form])

  // Form submission handler
  const onSubmit = (data: CreateBeneficiaryEnrollmentInput) => {
    if (isEditMode && enrollmentId) {
      updateEnrollment(
        { id: enrollmentId, data },
        {
          onSuccess: () => {
            onSuccess?.()
          }
        }
      )
    } else {
      createEnrollment(data, {
        onSuccess: () => {
          form.reset()
          onSuccess?.()
        }
      })
    }
  }

  // Loading state
  if (isEditMode && isLoadingEnrollment) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">
          {isEditMode ? FORM_LABELS.title.edit : FORM_LABELS.title.create}
        </CardTitle>
        <CardDescription>
          {FORM_LABELS.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Section 1: Core Relations */}
            <CoreRelationsSection
              form={form as unknown as UseFormReturn<CreateBeneficiaryEnrollmentInput>}
              organizations={organizations.map(org => ({
                id: org.id,
                organizationName: org.organizationName,
                organizationCode: org.organizationCode,
                type: org.type
              }))}
              programs={programs.map(program => ({
                id: program.id,
                name: program.name,
                programCode: program.programCode,
                programType: program.programType
              }))}
              isLoadingOrgs={isLoadingOrgs}
              isLoadingPrograms={isLoadingPrograms}
            />

            <Separator />

            {/* Section 2: Enrollment Period */}
            <EnrollmentPeriodSection form={form as unknown as UseFormReturn<CreateBeneficiaryEnrollmentInput>} />

            <Separator />

            {/* Section 3: Target Group & Beneficiaries */}
            <TargetGroupSection 
              form={form as unknown as UseFormReturn<CreateBeneficiaryEnrollmentInput>} 
              selectedProgram={selectedProgram}
              isLoadingProgram={isLoadingProgram}
            />

            <Separator />

            {/* Section 4: Feeding Configuration */}
            <FeedingConfigSection form={form as unknown as UseFormReturn<CreateBeneficiaryEnrollmentInput>} />

            <Separator />

            {/* Section 5: Delivery Configuration */}
            <DeliveryConfigSection form={form as unknown as UseFormReturn<CreateBeneficiaryEnrollmentInput>} />

            <Separator />

            {/* Section 6: Budget Tracking (Optional for Government Programs) */}
            <BudgetTrackingSection form={form as unknown as UseFormReturn<CreateBeneficiaryEnrollmentInput>} />

            <Separator />

            {/* Section 7: Performance Tracking - ONLY IN EDIT MODE */}
            {isEditMode && (
              <>
                <PerformanceTrackingSection form={form as unknown as UseFormReturn<CreateBeneficiaryEnrollmentInput>} />
                <Separator />
              </>
            )}

            {/* Section 8: Quality & Satisfaction - ONLY IN EDIT MODE */}
            {isEditMode && (
              <>
                <QualitySatisfactionSection form={form as unknown as UseFormReturn<CreateBeneficiaryEnrollmentInput>} />
                <Separator />
              </>
            )}

            {/* Section 9: Special Requirements */}
            <SpecialRequirementsSection form={form as unknown as UseFormReturn<CreateBeneficiaryEnrollmentInput>} />

            <Separator />

            {/* Section 10: Status & Administrative */}
            <StatusAdministrativeSection form={form as unknown as UseFormReturn<CreateBeneficiaryEnrollmentInput>} />

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isPending}
                  size="lg"
                >
                  {FORM_LABELS.buttons.cancel}
                </Button>
              )}
              <Button
                type="submit"
                disabled={isPending}
                size="lg"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode 
                  ? (isPending ? FORM_LABELS.buttons.updating : FORM_LABELS.buttons.update)
                  : (isPending ? FORM_LABELS.buttons.creating : FORM_LABELS.buttons.create)
                }
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
