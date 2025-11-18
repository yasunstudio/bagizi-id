/**
 * Enrollment Types for ProgramSchoolEnrollment
 * 
 * Type definitions for enrollment-related data structures,
 * including relations with School and Program models.
 * 
 * @fileoverview ProgramSchoolEnrollment type definitions
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/PROGRAM_ENROLLMENTS_IMPLEMENTATION.md} Implementation Guide
 * ✅ SIMPLIFIED (Nov 11, 2025): Removed School and targetGroup references
 */

import { 
  NutritionProgram,
  EnrollmentStatus,
  BeneficiaryOrganization
} from '@prisma/client'

/**
 * ✅ SIMPLIFIED: Enrollment with full relations
 * Used in detail views and API responses
 */
export type EnrollmentWithRelations = {
  id: string
  status: EnrollmentStatus
  enrolledAt: Date
  totalBeneficiaries: number
  organization: Pick<BeneficiaryOrganization, 
    | 'id' 
    | 'organizationName' 
    | 'organizationCode' 
    | 'type' 
    | 'address' 
    | 'phone'
  >
  program: Pick<NutritionProgram, 
    | 'id' 
    | 'name' 
    | 'programCode'
    | 'programType'
    | 'allowedTargetGroups'
  >
}

/**
 * Enrollment statistics for program overview
 */
export interface EnrollmentStats {
  // Counts
  totalSchools: number
  activeSchools: number
  pausedSchools: number
  completedSchools: number
  cancelledSchools: number
  
  // Students
  totalTargetStudents: number
  totalActiveStudents: number
  maleStudents: number
  femaleStudents: number
  
  // Budget
  totalMonthlyBudget: number
  averageBudgetPerStudent: number
  totalContractValue: number
  
  // Performance
  averageAttendanceRate: number
  averageParticipationRate: number
  averageSatisfactionScore: number
  
  // Operations
  totalDistributions: number
  totalMealsServed: number
}

/**
 * Filters for enrollment queries
 */
export interface EnrollmentFilters {
  status?: EnrollmentStatus | 'ALL'
  schoolType?: string
  search?: string
  isActive?: boolean
  hasContract?: boolean
  minStudents?: number
  maxStudents?: number
}

/**
 * Enrollment summary for cards/lists
 */
export interface EnrollmentSummary {
  id: string
  schoolId: string
  schoolName: string
  schoolCode: string
  npsn: string
  schoolType: string
  status: EnrollmentStatus
  isActive: boolean
  
  // Key metrics
  targetStudents: number
  activeStudents: number
  feedingDays: number
  mealsPerDay: number
  monthlyBudgetAllocation: number
  budgetPerStudent: number
  
  // Performance
  attendanceRate?: number
  participationRate?: number
  totalDistributions: number
  totalMealsServed: number
  
  // Dates
  startDate: Date
  endDate?: Date | null
}

/**
 * Enrollment for select/autocomplete components
 */
export interface EnrollmentOption {
  id: string
  label: string // School name
  value: string // School ID
  description?: string // School code + type
  disabled?: boolean // Already enrolled
}

/**
 * Enrollment validation result
 */
export interface EnrollmentValidation {
  isValid: boolean
  errors: {
    field: string
    message: string
  }[]
  warnings?: {
    field: string
    message: string
  }[]
}

/**
 * Enrollment import data
 */
export interface EnrollmentImportData {
  schoolCode?: string
  schoolName?: string
  npsn?: string
  targetStudents: number
  activeStudents: number
  feedingDays: number
  mealsPerDay: number
  monthlyBudgetAllocation: number
  deliveryAddress: string
  deliveryContact: string
  deliveryPhone: string
  startDate: string | Date
  endDate?: string | Date
}

/**
 * Enrollment import result
 */
export interface EnrollmentImportResult {
  success: number
  failed: number
  skipped: number
  errors: {
    row: number
    school: string
    message: string
  }[]
  created: EnrollmentSummary[]
}

/**
 * Enrollment history entry
 */
export interface EnrollmentHistoryEntry {
  id: string
  enrollmentId: string
  action: 'CREATED' | 'UPDATED' | 'ACTIVATED' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
  changes?: Record<string, { from: unknown; to: unknown }>
  reason?: string
  createdBy: string
  createdAt: Date
}

/**
 * Enrollment performance metrics
 */
export interface EnrollmentPerformance {
  enrollmentId: string
  period: {
    start: Date
    end: Date
  }
  
  // Attendance
  totalScheduledDays: number
  totalAttendedDays: number
  attendanceRate: number
  
  // Participation
  totalEligibleStudents: number
  averageDailyParticipants: number
  participationRate: number
  
  // Distribution
  totalDistributions: number
  totalMealsPlanned: number
  totalMealsServed: number
  fulfillmentRate: number
  
  // Budget
  budgetAllocated: number
  budgetUsed: number
  budgetUtilization: number
  
  // Satisfaction
  satisfactionScore?: number
  feedbackCount: number
}

/**
 * Enrollment contract details
 */
export interface EnrollmentContract {
  contractNumber: string
  contractValue: number
  contractStartDate: Date
  contractEndDate: Date
  
  // Payment terms
  paymentSchedule?: 'MONTHLY' | 'QUARTERLY' | 'SEMESTER' | 'YEARLY'
  paymentAmount?: number
  
  // Status
  isActive: boolean
  daysRemaining: number
  renewalDue?: Date
}

/**
 * Enrollment delivery schedule
 */
export interface EnrollmentDeliverySchedule {
  enrollmentId: string
  schoolName: string
  deliveryAddress: string
  deliveryContact: string
  deliveryPhone: string
  
  // Schedule
  deliveryDays: number[]  // 0=Sunday, 1=Monday, etc.
  deliveryTime: string
  estimatedTravelTime?: number
  
  // Preferences
  preferredDeliveryTime?: string
  deliveryInstructions?: string
  specialRequirements?: string
  
  // Logistics
  route?: string
  vehicleType?: string
  driverName?: string
  driverPhone?: string
}

/**
 * Enrollment feeding schedule
 */
export interface EnrollmentFeedingSchedule {
  enrollmentId: string
  schoolName: string
  
  // Schedule
  feedingDays: number
  mealsPerDay: number
  feedingTime?: string
  
  // Meal times
  breakfastTime?: string
  lunchTime?: string
  snackTime?: string
  
  // Service
  servingMethod?: string
  storageCapacity?: number
  
  // Students
  activeStudents: number
  dailyPortions: number
  weeklyPortions: number
  monthlyPortions: number
}
