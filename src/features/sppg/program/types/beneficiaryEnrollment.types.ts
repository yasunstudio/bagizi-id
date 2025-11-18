/**
 * @fileoverview TypeScript types untuk Program Beneficiary Enrollment
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import type { 
  ProgramBeneficiaryEnrollment,
  TargetGroup,
  ProgramEnrollmentStatus
} from '@prisma/client'

/**
 * Program Beneficiary Enrollment dari Prisma (base type)
 */
export type { ProgramBeneficiaryEnrollment }

/**
 * Program Beneficiary Enrollment dengan relasi untuk detail view
 */
export interface BeneficiaryEnrollmentWithRelations extends ProgramBeneficiaryEnrollment {
  beneficiaryOrg?: {
    id: string
    organizationCode: string
    organizationName: string // ✅ FIXED: Match Prisma schema field name
    type: string
    address: string
    phone: string | null
  }
  program?: {
    id: string
    name: string // ✅ FIXED: Match Prisma schema field name (not programName)
    programCode: string
    startDate: Date
    endDate: Date | null
    status: string // ✅ FIXED: Match Prisma schema field name (not programStatus)
  }
  distributions?: Array<{
    id: string
    distributionDate: Date
    distributionCode: string
    mealType: string
    plannedRecipients: number
    actualRecipients: number | null
    totalPortions: number
    status: string
  }>
  _count?: {
    distributions: number
  }
}

/**
 * Stats untuk Beneficiary Enrollments
 */
export interface BeneficiaryEnrollmentStats {
  totalEnrollments: number
  activeEnrollments: number
  pausedEnrollments: number
  completedEnrollments: number
  totalTargetBeneficiaries: number
  totalActiveBeneficiaries: number
  byTargetGroup: {
    targetGroup: TargetGroup
    count: number
    targetBeneficiaries: number
    activeBeneficiaries: number
  }[]
  byStatus: {
    status: ProgramEnrollmentStatus
    count: number
  }[]
}

/**
 * Input untuk create Beneficiary Enrollment
 * (exported from schema for consistency)
 */
export interface CreateBeneficiaryEnrollmentInput {
  // Core Relations
  beneficiaryOrgId: string
  programId: string
  
  // Enrollment Period
  enrollmentDate?: Date
  startDate: Date
  endDate?: Date | null
  
  // Target Group Configuration
  targetGroup: TargetGroup
  
  // Beneficiary Count
  targetBeneficiaries: number
  activeBeneficiaries?: number | null
  
  // Age Groups (optional)
  beneficiaries0to2Years?: number | null
  beneficiaries2to5Years?: number | null
  beneficiaries6to12Years?: number | null
  beneficiaries13to15Years?: number | null
  beneficiaries16to18Years?: number | null
  beneficiariesAbove18?: number | null
  
  // Gender Breakdown (optional)
  maleBeneficiaries?: number | null
  femaleBeneficiaries?: number | null
  
  // Feeding Configuration
  feedingDays?: number | null
  mealsPerDay?: number | null
  feedingTime?: string | null
  breakfastTime?: string | null
  lunchTime?: string | null
  snackTime?: string | null
  
  // Delivery Configuration
  deliveryAddress?: string | null
  deliveryContact?: string | null
  deliveryPhone?: string | null
  deliveryInstructions?: string | null
  preferredDeliveryTime?: string | null
  estimatedTravelTime?: number | null
  
  // Service Configuration
  storageCapacity?: number | null
  servingMethod?: string | null
  
  // Budget & Contract
  monthlyBudgetAllocation?: number | null
  budgetPerBeneficiary?: number | null
  contractStartDate?: Date | null
  contractEndDate?: Date | null
  contractValue?: number | null
  paymentSchedule?: string | null
  
  // Performance Tracking
  totalMealsServed?: number
  totalBeneficiariesServed?: number
  averageAttendanceRate?: number | null
  lastDistributionDate?: Date | null
  lastMonitoringDate?: Date | null
  
  // Quality Metrics
  satisfactionScore?: number | null
  complaintCount?: number
  nutritionComplianceRate?: number | null
  
  // Special Requirements
  specialDietaryNeeds?: string | null
  allergenRestrictions?: string | null
  culturalPreferences?: string | null
  medicalConsiderations?: string | null
  
  // Program-Specific Configuration
  programFocus?: string | null
  supplementaryServices?: string | null
  
  // Status & Flags
  enrollmentStatus?: ProgramEnrollmentStatus
  isActive?: boolean
  isPriority?: boolean
  needsAssessment?: boolean
  
  // Administrative
  enrolledBy?: string | null
  approvedBy?: string | null
  approvedAt?: Date | null
  remarks?: string | null
  internalNotes?: string | null
}

/**
 * Response type untuk Beneficiary Enrollment dari API
 */
export type BeneficiaryEnrollmentResponse = Required<ProgramBeneficiaryEnrollment>

/**
 * Filters untuk list Beneficiary Enrollments
 */
export interface BeneficiaryEnrollmentFilters {
  programId?: string
  beneficiaryOrgId?: string
  targetGroup?: TargetGroup
  enrollmentStatus?: ProgramEnrollmentStatus
  isActive?: boolean
  isPriority?: boolean
  search?: string
}
