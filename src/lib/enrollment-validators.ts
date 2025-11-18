/**
 * Program Beneficiary Enrollment Validators
 * 
 * Implements business rules and validation for enrollment operations:
 * 1. Target group validation (must be in program's allowedTargetGroups)
 * 2. Date range validation (enrollment within program period)
 * 3. Beneficiary count consistency (age/gender breakdown)
 * 4. Budget allocation validation
 * 5. Target-specific data validation
 * 
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/PROGRAM_BENEFICIARY_ARCHITECTURE_ANALYSIS.md}
 */

import { z, ZodError, type ZodIssue } from 'zod'
import { TargetGroup } from '@prisma/client'
import { db } from '@/lib/prisma'

// ============================================================================
// Zod Schemas for Target-Specific Data
// ============================================================================

/**
 * Pregnant Woman specific data schema
 */
const pregnantWomanDataSchema = z.object({
  firstTrimester: z.number().int().min(0).optional(),
  secondTrimester: z.number().int().min(0).optional(),
  thirdTrimester: z.number().int().min(0).optional(),
  highRiskCount: z.number().int().min(0).optional(),
  averageAge: z.number().int().min(15).max(50).optional(),
  nutritionalRiskCount: z.number().int().min(0).optional(),
})

/**
 * Breastfeeding Mother specific data schema
 */
const breastfeedingMotherDataSchema = z.object({
  babyAge0to6Months: z.number().int().min(0).optional(),
  babyAge6to12Months: z.number().int().min(0).optional(),
  babyAge12to24Months: z.number().int().min(0).optional(),
  exclusiveBreastfeeding: z.number().int().min(0).optional(),
  averageMotherAge: z.number().int().min(15).max(50).optional(),
})

/**
 * School Children specific data schema
 */
const schoolChildrenDataSchema = z.object({
  elementaryStudents: z.number().int().min(0).optional(),
  juniorHighStudents: z.number().int().min(0).optional(),
  seniorHighStudents: z.number().int().min(0).optional(),
  specialNeedsStudents: z.number().int().min(0).optional(),
  grade1: z.number().int().min(0).optional(),
  grade2: z.number().int().min(0).optional(),
  grade3: z.number().int().min(0).optional(),
  grade4: z.number().int().min(0).optional(),
  grade5: z.number().int().min(0).optional(),
  grade6: z.number().int().min(0).optional(),
  grade7: z.number().int().min(0).optional(),
  grade8: z.number().int().min(0).optional(),
  grade9: z.number().int().min(0).optional(),
  grade10: z.number().int().min(0).optional(),
  grade11: z.number().int().min(0).optional(),
  grade12: z.number().int().min(0).optional(),
})

/**
 * Toddler specific data schema
 */
const toddlerDataSchema = z.object({
  age0to2Years: z.number().int().min(0).optional(),
  age2to5Years: z.number().int().min(0).optional(),
  stuntingRisk: z.number().int().min(0).optional(),
  underweight: z.number().int().min(0).optional(),
  wasting: z.number().int().min(0).optional(),
})

/**
 * Teenage Girl specific data schema
 */
const teenageGirlDataSchema = z.object({
  age10to14: z.number().int().min(0).optional(),
  age15to19: z.number().int().min(0).optional(),
  anemiaRisk: z.number().int().min(0).optional(),
  nutritionalRisk: z.number().int().min(0).optional(),
})

/**
 * Elderly specific data schema
 */
const elderlyDataSchema = z.object({
  age60to69: z.number().int().min(0).optional(),
  age70to79: z.number().int().min(0).optional(),
  age80Plus: z.number().int().min(0).optional(),
  chronicDisease: z.number().int().min(0).optional(),
  mobilityIssues: z.number().int().min(0).optional(),
})

// ============================================================================
// Validation Error Classes
// ============================================================================

export class EnrollmentValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EnrollmentValidationError'
  }
}

export class BudgetValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BudgetValidationError'
  }
}

export class DateValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DateValidationError'
  }
}

// ============================================================================
// Enrollment Input Type
// ============================================================================

export interface EnrollmentInput {
  beneficiaryOrgId: string
  programId: string
  sppgId: string
  targetGroup: TargetGroup
  targetBeneficiaries: number
  activeBeneficiaries?: number | null
  
  // Age breakdown
  beneficiaries0to2Years?: number | null
  beneficiaries2to5Years?: number | null
  beneficiaries6to12Years?: number | null
  beneficiaries13to15Years?: number | null
  beneficiaries16to18Years?: number | null
  beneficiariesAbove18?: number | null
  
  // Gender breakdown
  maleBeneficiaries?: number | null
  femaleBeneficiaries?: number | null
  
  // Date range
  startDate: Date
  endDate?: Date | null
  
  // Feeding config
  feedingDays?: number | null
  mealsPerDay?: number | null
  
  // Budget
  monthlyBudgetAllocation?: number | null
  budgetPerBeneficiary?: number | null
  
  // Target-specific data
  targetGroupSpecificData?: unknown
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate target-specific data based on target group
 */
export function validateTargetGroupData(
  targetGroup: TargetGroup,
  data: unknown
): unknown {
  if (!data) return null

  try {
    switch (targetGroup) {
      case 'PREGNANT_WOMAN':
        return pregnantWomanDataSchema.parse(data)
      case 'BREASTFEEDING_MOTHER':
        return breastfeedingMotherDataSchema.parse(data)
      case 'SCHOOL_CHILDREN':
        return schoolChildrenDataSchema.parse(data)
      case 'TODDLER':
        return toddlerDataSchema.parse(data)
      case 'TEENAGE_GIRL':
        return teenageGirlDataSchema.parse(data)
      case 'ELDERLY':
        return elderlyDataSchema.parse(data)
      default:
        throw new EnrollmentValidationError(
          `Unknown target group: ${targetGroup}`
        )
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new EnrollmentValidationError(
        `Invalid target-specific data for ${targetGroup}: ${(error as ZodError).issues
          .map((e: ZodIssue) => e.message)
          .join(', ')}`
      )
    }
    throw error
  }
}

/**
 * Validate beneficiary count consistency
 * Sum of age/gender breakdowns should match total
 */
export function validateBeneficiaryCount(data: EnrollmentInput): void {
  // Check age breakdown consistency
  const ageBreakdown = [
    data.beneficiaries0to2Years || 0,
    data.beneficiaries2to5Years || 0,
    data.beneficiaries6to12Years || 0,
    data.beneficiaries13to15Years || 0,
    data.beneficiaries16to18Years || 0,
    data.beneficiariesAbove18 || 0,
  ]

  const totalFromAge = ageBreakdown.reduce((sum, count) => sum + count, 0)

  if (totalFromAge > 0 && totalFromAge !== data.targetBeneficiaries) {
    throw new EnrollmentValidationError(
      `Age breakdown total (${totalFromAge}) does not match target beneficiaries (${data.targetBeneficiaries})`
    )
  }

  // Check gender breakdown consistency
  const maleCount = data.maleBeneficiaries || 0
  const femaleCount = data.femaleBeneficiaries || 0
  const totalFromGender = maleCount + femaleCount

  if (totalFromGender > 0 && totalFromGender !== data.targetBeneficiaries) {
    throw new EnrollmentValidationError(
      `Gender breakdown total (${totalFromGender}) does not match target beneficiaries (${data.targetBeneficiaries})`
    )
  }
}

/**
 * Validate enrollment date ranges
 */
export async function validateDateRanges(
  data: EnrollmentInput
): Promise<void> {
  const program = await db.nutritionProgram.findUnique({
    where: { id: data.programId },
    select: {
      startDate: true,
      endDate: true,
    },
  })

  if (!program) {
    throw new EnrollmentValidationError('Program not found')
  }

  // Enrollment start must be on or after program start
  if (data.startDate < program.startDate) {
    throw new DateValidationError(
      `Enrollment start date (${data.startDate.toISOString()}) cannot be before program start date (${program.startDate.toISOString()})`
    )
  }

  // If program has end date, enrollment end must be before or equal
  if (program.endDate && data.endDate) {
    if (data.endDate > program.endDate) {
      throw new DateValidationError(
        `Enrollment end date (${data.endDate.toISOString()}) cannot be after program end date (${program.endDate.toISOString()})`
      )
    }
  }

  // Enrollment end must be after start
  if (data.endDate && data.endDate <= data.startDate) {
    throw new DateValidationError(
      'Enrollment end date must be after start date'
    )
  }
}

/**
 * Validate target group is allowed in program
 */
export async function validateTargetGroup(
  programId: string,
  targetGroup: TargetGroup
): Promise<void> {
  const program = await db.nutritionProgram.findUnique({
    where: { id: programId },
    select: {
      allowedTargetGroups: true,
      name: true,
    },
  })

  if (!program) {
    throw new EnrollmentValidationError('Program not found')
  }

  if (!program.allowedTargetGroups.includes(targetGroup)) {
    throw new EnrollmentValidationError(
      `Target group "${targetGroup}" is not allowed in program "${program.name}". ` +
        `Allowed target groups: ${program.allowedTargetGroups.join(', ')}`
    )
  }
}

/**
 * Calculate expected monthly budget allocation
 */
export function calculateExpectedBudget(params: {
  budgetPerMeal: number
  targetBeneficiaries: number
  mealsPerDay: number
  feedingDays: number
}): number {
  const { budgetPerMeal, targetBeneficiaries, mealsPerDay, feedingDays } =
    params

  // Monthly budget = budgetPerMeal × beneficiaries × meals/day × days/week × 4 weeks
  return budgetPerMeal * targetBeneficiaries * mealsPerDay * feedingDays * 4
}

/**
 * Validate budget allocation
 */
export async function validateBudgetAllocation(
  data: EnrollmentInput
): Promise<void> {
  if (!data.monthlyBudgetAllocation) {
    // Budget allocation is optional
    return
  }

  const program = await db.nutritionProgram.findUnique({
    where: { id: data.programId },
    select: {
      budgetPerMeal: true,
      totalBudget: true,
    },
  })

  if (!program) {
    throw new EnrollmentValidationError('Program not found')
  }

  // Calculate expected budget
  const expectedBudget = calculateExpectedBudget({
    budgetPerMeal: program.budgetPerMeal,
    targetBeneficiaries: data.targetBeneficiaries,
    mealsPerDay: data.mealsPerDay || 1,
    feedingDays: data.feedingDays || 5,
  })

  // Allow 10% tolerance for rounding
  const tolerance = expectedBudget * 0.1
  const diff = Math.abs(data.monthlyBudgetAllocation - expectedBudget)

  if (diff > tolerance) {
    throw new BudgetValidationError(
      `Monthly budget allocation (Rp ${data.monthlyBudgetAllocation.toLocaleString()}) ` +
        `differs significantly from expected budget (Rp ${expectedBudget.toLocaleString()}). ` +
        `Expected: Rp ${program.budgetPerMeal.toLocaleString()} × ${data.targetBeneficiaries} × ${data.mealsPerDay || 1} × ${data.feedingDays || 5} × 4 weeks`
    )
  }
}

/**
 * Main validation function - validates all enrollment data
 */
export async function validateEnrollment(
  data: EnrollmentInput
): Promise<void> {
  // 1. Validate target group is allowed in program
  await validateTargetGroup(data.programId, data.targetGroup)

  // 2. Validate date ranges
  await validateDateRanges(data)

  // 3. Validate beneficiary counts
  validateBeneficiaryCount(data)

  // 4. Validate budget allocation
  await validateBudgetAllocation(data)

  // 5. Validate target-specific data
  if (data.targetGroupSpecificData) {
    validateTargetGroupData(data.targetGroup, data.targetGroupSpecificData)
  }

  // 6. Basic data validation
  if (data.targetBeneficiaries <= 0) {
    throw new EnrollmentValidationError(
      'Target beneficiaries must be greater than 0'
    )
  }

  if (data.mealsPerDay && (data.mealsPerDay < 1 || data.mealsPerDay > 5)) {
    throw new EnrollmentValidationError(
      'Meals per day must be between 1 and 5'
    )
  }

  if (data.feedingDays && (data.feedingDays < 1 || data.feedingDays > 7)) {
    throw new EnrollmentValidationError(
      'Feeding days must be between 1 and 7'
    )
  }
}

/**
 * Check if program budget will be exceeded with new enrollment
 */
export async function checkProgramBudgetExceeded(
  programId: string,
  newMonthlyAllocation: number
): Promise<boolean> {
  const program = await db.nutritionProgram.findUnique({
    where: { id: programId },
    select: {
      totalBudget: true,
      startDate: true,
      endDate: true,
      beneficiaryEnrollments: {
        select: {
          monthlyBudgetAllocation: true,
        },
      },
    },
  })

  if (!program) {
    throw new EnrollmentValidationError('Program not found')
  }

  // Calculate program duration in months
  const endDate = program.endDate || new Date()
  const months = Math.ceil(
    (endDate.getTime() - program.startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
  )

  // Calculate existing allocations
  const existingMonthlyTotal = program.beneficiaryEnrollments.reduce(
    (sum, enrollment) => sum + (enrollment.monthlyBudgetAllocation || 0),
    0
  )

  // Total allocated = (existing + new) × months
  const totalAllocated = (existingMonthlyTotal + newMonthlyAllocation) * months

  return totalAllocated > program.totalBudget
}
