/**
 * Program Beneficiary Enrollment Helper Functions
 * 
 * Provides utility functions for enrollment operations:
 * 1. Budget calculations
 * 2. Enrollment statistics
 * 3. Data aggregations
 * 4. Program duration calculations
 * 5. Beneficiary count summaries
 * 
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/PROGRAM_BENEFICIARY_ARCHITECTURE_ANALYSIS.md}
 */

import { db } from '@/lib/prisma'
import { TargetGroup } from '@prisma/client'

// ============================================================================
// Budget Calculation Helpers
// ============================================================================

/**
 * Calculate monthly budget allocation for enrollment
 * 
 * @param budgetPerMeal - Cost per meal from program
 * @param targetBeneficiaries - Number of beneficiaries
 * @param mealsPerDay - Number of meals per day
 * @param feedingDays - Number of feeding days per week
 * @returns Monthly budget allocation in IDR
 * 
 * @example
 * const budget = calculateMonthlyBudget({
 *   budgetPerMeal: 8000,
 *   targetBeneficiaries: 400,
 *   mealsPerDay: 1,
 *   feedingDays: 5
 * })
 * // Returns: 8000 × 400 × 1 × 5 × 4 = 64,000,000
 */
export function calculateMonthlyBudget(params: {
  budgetPerMeal: number
  targetBeneficiaries: number
  mealsPerDay: number
  feedingDays: number
}): number {
  const { budgetPerMeal, targetBeneficiaries, mealsPerDay, feedingDays } = params
  
  // Monthly = per meal × beneficiaries × meals/day × days/week × 4 weeks
  return budgetPerMeal * targetBeneficiaries * mealsPerDay * feedingDays * 4
}

/**
 * Calculate program duration in months
 * 
 * @param startDate - Program start date
 * @param endDate - Program end date (optional, defaults to now)
 * @returns Duration in months (rounded up)
 */
export function calculateProgramDuration(
  startDate: Date,
  endDate?: Date | null
): number {
  const end = endDate || new Date()
  const diffTime = end.getTime() - startDate.getTime()
  const diffDays = diffTime / (1000 * 60 * 60 * 24)
  const diffMonths = diffDays / 30
  
  return Math.ceil(diffMonths)
}

/**
 * Get total allocated budget for a program
 * 
 * @param programId - Program ID
 * @returns Total monthly allocation across all enrollments
 */
export async function getProgramAllocatedBudget(
  programId: string
): Promise<number> {
    const enrollments = await db.programBeneficiaryEnrollment.findMany({
    where: {
      programId,
      enrollmentStatus: 'ACTIVE'
    }
  })

  return enrollments.reduce(
    (sum: number, enrollment) => sum + (enrollment.monthlyBudgetAllocation || 0),
    0
  )
}

/**
 * Check if program budget will be exceeded
 * 
 * @param programId - Program ID
 * @returns Object with budget status
 */
export async function isProgramBudgetExceeded(programId: string): Promise<{
  exceeded: boolean
  totalBudget: number
  allocated: number
  remaining: number
  utilizationRate: number
}> {
  const program = await db.nutritionProgram.findUnique({
    where: { id: programId },
    select: {
      totalBudget: true,
      startDate: true,
      endDate: true,
    },
  })

  if (!program) {
    throw new Error('Program not found')
  }

  const monthlyAllocated = await getProgramAllocatedBudget(programId)
  const months = calculateProgramDuration(program.startDate, program.endDate)
  const totalAllocated = monthlyAllocated * months

  return {
    exceeded: totalAllocated > program.totalBudget,
    totalBudget: program.totalBudget,
    allocated: totalAllocated,
    remaining: program.totalBudget - totalAllocated,
    utilizationRate: (totalAllocated / program.totalBudget) * 100,
  }
}

// ============================================================================
// Enrollment Statistics Helpers
// ============================================================================

/**
 * Get enrollment statistics
 * 
 * @param enrollmentId - Enrollment ID
 * @returns Comprehensive enrollment statistics
 */
export async function getEnrollmentStats(enrollmentId: string) {
  const enrollment = await db.programBeneficiaryEnrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      distributions: {
        select: {
          id: true,
          status: true,
          totalPortionsDelivered: true,
          distributionDate: true,
        },
      },
      program: {
        select: {
          budgetPerMeal: true,
        },
      },
    },
  })

  if (!enrollment) {
    throw new Error('Enrollment not found')
  }

  // Calculate actual spending
  const totalMealsDistributed = enrollment.distributions.reduce(
    (sum: number, dist) => sum + (dist.totalPortionsDelivered || 0),
    0
  )
  const actualSpending = totalMealsDistributed * enrollment.program.budgetPerMeal

  // Calculate budget utilization
  const months = calculateProgramDuration(enrollment.startDate, enrollment.endDate)
  const totalBudgetAllocated = (enrollment.monthlyBudgetAllocation || 0) * months
  const budgetUtilization = totalBudgetAllocated > 0
    ? (actualSpending / totalBudgetAllocated) * 100
    : 0

  return {
    // Beneficiary stats
    targetBeneficiaries: enrollment.targetBeneficiaries,
    activeBeneficiaries: enrollment.activeBeneficiaries,
    beneficiaryUtilization: enrollment.activeBeneficiaries && enrollment.targetBeneficiaries
      ? (enrollment.activeBeneficiaries / enrollment.targetBeneficiaries) * 100
      : 0,

    // Meal stats
    totalMealsServed: enrollment.totalMealsServed || 0,
    totalMealsDistributed,
    averageMealsPerDay: enrollment.mealsPerDay || 0,

    // Distribution stats
    totalDistributions: enrollment.distributions.length,
    completedDistributions: enrollment.distributions.filter(
      (d) => d.status === 'COMPLETED'
    ).length,
    lastDistribution: enrollment.lastDistributionDate,

    // Attendance & quality
    attendanceRate: enrollment.averageAttendanceRate || 0,
    satisfactionScore: enrollment.satisfactionScore || 0,
    complaintCount: enrollment.complaintCount || 0,
    nutritionComplianceRate: enrollment.nutritionComplianceRate || 0,

    // Budget stats
    monthlyBudgetAllocation: enrollment.monthlyBudgetAllocation || 0,
    totalBudgetAllocated,
    actualSpending,
    budgetUtilization,
    budgetRemaining: totalBudgetAllocated - actualSpending,

    // Status
    enrollmentStatus: enrollment.enrollmentStatus,
    isActive: enrollment.isActive,
    isPriority: enrollment.isPriority,
    needsAssessment: enrollment.needsAssessment,
  }
}

/**
 * Get program enrollment summary
 * 
 * @param programId - Program ID
 * @returns Summary of all enrollments for a program
 */
export async function getProgramEnrollmentSummary(programId: string) {
  const enrollments = await db.programBeneficiaryEnrollment.findMany({
    where: { programId },
    include: {
      beneficiaryOrg: {
        select: {
          organizationName: true,
          type: true,
        },
      },
    },
  })

  // Group by target group
    const byTargetGroup = enrollments.reduce((acc, enrollment) => {
    const group = enrollment.targetGroup
    if (!acc[group]) {
      acc[group] = {
        count: 0,
        targetBeneficiaries: 0,
        activeBeneficiaries: 0,
        budgetAllocation: 0,
      }
    }
    acc[group].count++
    acc[group].targetBeneficiaries += enrollment.targetBeneficiaries
    acc[group].activeBeneficiaries += enrollment.activeBeneficiaries || 0
    acc[group].budgetAllocation += enrollment.monthlyBudgetAllocation || 0
    return acc
  }, {} as Record<TargetGroup, { count: number; targetBeneficiaries: number; activeBeneficiaries: number; budgetAllocation: number }>)

  // Overall summary
  const totalEnrollments = enrollments.length
  const totalBeneficiaries = enrollments.reduce(
    (sum, e) => sum + e.targetBeneficiaries,
    0
  )
  const activeBeneficiaries = enrollments.reduce(
    (sum, e) => sum + (e.activeBeneficiaries || 0),
    0
  )
  const totalMonthlyBudget = enrollments.reduce(
    (sum: number, e) => sum + (e.monthlyBudgetAllocation || 0),
    0
  )

  const stats = {
    total: enrollments.length,
    activeEnrollments: enrollments.filter((e) => e.enrollmentStatus === 'ACTIVE')
      .length,
    suspendedEnrollments: enrollments.filter(
      (e) => e.enrollmentStatus === 'SUSPENDED'
    ).length,
    completedEnrollments: enrollments.filter(
      (e) => e.enrollmentStatus === 'COMPLETED'
    ).length,
  }

  return {
    totalEnrollments,
    totalBeneficiaries,
    activeBeneficiaries,
    totalMonthlyBudget,
    byTargetGroup,
    stats,
  }
}

// ============================================================================
// Beneficiary Count Helpers
// ============================================================================

/**
 * Get age breakdown summary for enrollment
 * 
 * @param enrollmentId - Enrollment ID
 * @returns Age breakdown with percentages
 */
export async function getEnrollmentAgeBreakdown(enrollmentId: string) {
  const enrollment = await db.programBeneficiaryEnrollment.findUnique({
    where: { id: enrollmentId },
    select: {
      targetBeneficiaries: true,
      beneficiaries0to2Years: true,
      beneficiaries2to5Years: true,
      beneficiaries6to12Years: true,
      beneficiaries13to15Years: true,
      beneficiaries16to18Years: true,
      beneficiariesAbove18: true,
    },
  })

  if (!enrollment) {
    throw new Error('Enrollment not found')
  }

  const total = enrollment.targetBeneficiaries

  return {
    '0-2 years': {
      count: enrollment.beneficiaries0to2Years || 0,
      percentage:
        total > 0 ? ((enrollment.beneficiaries0to2Years || 0) / total) * 100 : 0,
    },
    '2-5 years': {
      count: enrollment.beneficiaries2to5Years || 0,
      percentage:
        total > 0 ? ((enrollment.beneficiaries2to5Years || 0) / total) * 100 : 0,
    },
    '6-12 years': {
      count: enrollment.beneficiaries6to12Years || 0,
      percentage:
        total > 0
          ? ((enrollment.beneficiaries6to12Years || 0) / total) * 100
          : 0,
    },
    '13-15 years': {
      count: enrollment.beneficiaries13to15Years || 0,
      percentage:
        total > 0
          ? ((enrollment.beneficiaries13to15Years || 0) / total) * 100
          : 0,
    },
    '16-18 years': {
      count: enrollment.beneficiaries16to18Years || 0,
      percentage:
        total > 0
          ? ((enrollment.beneficiaries16to18Years || 0) / total) * 100
          : 0,
    },
    'Above 18': {
      count: enrollment.beneficiariesAbove18 || 0,
      percentage:
        total > 0
          ? ((enrollment.beneficiariesAbove18 || 0) / total) * 100
          : 0,
    },
    total,
  }
}

/**
 * Get gender breakdown summary for enrollment
 * 
 * @param enrollmentId - Enrollment ID
 * @returns Gender breakdown with percentages
 */
export async function getEnrollmentGenderBreakdown(enrollmentId: string) {
  const enrollment = await db.programBeneficiaryEnrollment.findUnique({
    where: { id: enrollmentId },
    select: {
      targetBeneficiaries: true,
      maleBeneficiaries: true,
      femaleBeneficiaries: true,
    },
  })

  if (!enrollment) {
    throw new Error('Enrollment not found')
  }

  const total = enrollment.targetBeneficiaries

  return {
    male: {
      count: enrollment.maleBeneficiaries || 0,
      percentage:
        total > 0 ? ((enrollment.maleBeneficiaries || 0) / total) * 100 : 0,
    },
    female: {
      count: enrollment.femaleBeneficiaries || 0,
      percentage:
        total > 0 ? ((enrollment.femaleBeneficiaries || 0) / total) * 100 : 0,
    },
    total,
  }
}

// ============================================================================
// Data Aggregation Helpers
// ============================================================================

/**
 * Get SPPG-wide enrollment statistics
 * 
 * @param sppgId - SPPG ID
 * @returns Organization-wide enrollment statistics
 */
export async function getSppgEnrollmentStats(sppgId: string) {
  const enrollments = await db.programBeneficiaryEnrollment.findMany({
    where: { sppgId },
    include: {
      program: {
        select: {
          name: true,
          programType: true,
        },
      },
      beneficiaryOrg: {
        select: {
          organizationName: true,
          type: true,
        },
      },
    },
  })

  const activeEnrollments = enrollments.filter((e) => e.enrollmentStatus === 'ACTIVE')

  return {
    totalEnrollments: enrollments.length,
    activeEnrollments: activeEnrollments.length,
    totalBeneficiaries: enrollments.reduce(
      (sum, e) => sum + e.targetBeneficiaries,
      0
    ),
    activeBeneficiaries: activeEnrollments.reduce(
      (sum, e) => sum + (e.activeBeneficiaries || 0),
      0
    ),
    totalMonthlyBudget: activeEnrollments.reduce(
      (sum, e) => sum + (e.monthlyBudgetAllocation || 0),
      0
    ),
    byTargetGroup: enrollments.reduce((acc, e) => {
      const group = e.targetGroup
      acc[group] = (acc[group] || 0) + e.targetBeneficiaries
      return acc
    }, {} as Record<TargetGroup, number>),
    byProgramType: enrollments.reduce((acc, e) => {
      const type = e.program.programType
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    byOrgType: enrollments.reduce((acc, e) => {
      const type = e.beneficiaryOrg.type
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>),
  }
}

/**
 * Get organization's enrollment history
 * 
 * @param beneficiaryOrgId - Organization ID
 * @returns List of enrollments with program details
 */
export async function getOrganizationEnrollments(beneficiaryOrgId: string) {
  const enrollments = await db.programBeneficiaryEnrollment.findMany({
    where: { beneficiaryOrgId },
    include: {
      program: {
        select: {
          name: true,
          programCode: true,
          programType: true,
          startDate: true,
          endDate: true,
          status: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return enrollments.map((enrollment) => ({
    id: enrollment.id,
    targetGroup: enrollment.targetGroup,
    targetBeneficiaries: enrollment.targetBeneficiaries,
    activeBeneficiaries: enrollment.activeBeneficiaries,
    enrollmentStatus: enrollment.enrollmentStatus,
    startDate: enrollment.startDate,
    endDate: enrollment.endDate,
    monthlyBudgetAllocation: enrollment.monthlyBudgetAllocation,
    program: {
      name: enrollment.program.name,
      code: enrollment.program.programCode,
      type: enrollment.program.programType,
      startDate: enrollment.program.startDate,
      endDate: enrollment.program.endDate,
      status: enrollment.program.status,
    },
    createdAt: enrollment.createdAt,
  }))
}
