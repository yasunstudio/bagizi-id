/**
 * @fileoverview Nutrition Calculation Utilities
 * Helper functions untuk menghitung kebutuhan nutrisi berdasarkan age groups
 * Maps ProgramBeneficiaryEnrollment age breakdown to NutritionStandard
 * 
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { AgeGroup, Gender } from '@prisma/client'
import type { ProgramBeneficiaryEnrollment } from '@prisma/client'

/**
 * Age Group Mapping Interface
 * Maps database age fields to AgeGroup enum for nutrition standards
 */
export interface AgeGroupBreakdown {
  ageGroup: AgeGroup
  count: number
  description: string
}

/**
 * Nutrition Requirement Interface
 * Calculated nutrition needs based on age groups and gender
 */
export interface NutritionRequirement {
  totalCalories: number
  totalProtein: number
  totalCarbohydrates: number
  totalFat: number
  totalFiber: number
  breakdown: {
    ageGroup: AgeGroup
    gender: Gender | 'UNISEX'
    count: number
    calories: number
    protein: number
  }[]
}

/**
 * Map enrollment age fields to AgeGroup enum
 * 
 * @param enrollment - ProgramBeneficiaryEnrollment with age breakdown
 * @returns Array of age group breakdowns with counts
 * 
 * @example
 * ```typescript
 * const enrollment = await db.programBeneficiaryEnrollment.findUnique({
 *   where: { id: 'enrollment_123' }
 * })
 * 
 * const ageBreakdown = getAgeGroupBreakdown(enrollment)
 * // [
 * //   { ageGroup: 'CHILDREN_6_12', count: 150, description: 'SD (6-12 tahun)' },
 * //   { ageGroup: 'TEENAGERS_13_15', count: 80, description: 'SMP (13-15 tahun)' }
 * // ]
 * ```
 */
export function getAgeGroupBreakdown(
  enrollment: Pick<
    ProgramBeneficiaryEnrollment,
    | 'beneficiaries0to2Years'
    | 'beneficiaries2to5Years'
    | 'beneficiaries6to12Years'
    | 'beneficiaries13to15Years'
    | 'beneficiaries16to18Years'
    | 'beneficiariesAbove18'
  >
): AgeGroupBreakdown[] {
  const breakdown: AgeGroupBreakdown[] = []

  // 0-2 years → BALITA_6_23 (closest match for 0-2 years)
  if (enrollment.beneficiaries0to2Years && enrollment.beneficiaries0to2Years > 0) {
    breakdown.push({
      ageGroup: AgeGroup.BALITA_6_23,
      count: enrollment.beneficiaries0to2Years,
      description: 'Balita 0-2 tahun',
    })
  }

  // 2-5 years → BALITA_2_5
  if (enrollment.beneficiaries2to5Years && enrollment.beneficiaries2to5Years > 0) {
    breakdown.push({
      ageGroup: AgeGroup.BALITA_2_5,
      count: enrollment.beneficiaries2to5Years,
      description: 'PAUD/TK 2-5 tahun',
    })
  }

  // 6-12 years → ANAK_6_12
  if (enrollment.beneficiaries6to12Years && enrollment.beneficiaries6to12Years > 0) {
    breakdown.push({
      ageGroup: AgeGroup.ANAK_6_12,
      count: enrollment.beneficiaries6to12Years,
      description: 'SD 6-12 tahun',
    })
  }

  // 13-15 years → REMAJA_13_18 (13-15 is subset of 13-18)
  if (enrollment.beneficiaries13to15Years && enrollment.beneficiaries13to15Years > 0) {
    breakdown.push({
      ageGroup: AgeGroup.REMAJA_13_18,
      count: enrollment.beneficiaries13to15Years,
      description: 'SMP 13-15 tahun',
    })
  }

  // 16-18 years → REMAJA_13_18 (16-18 is subset of 13-18)
  if (enrollment.beneficiaries16to18Years && enrollment.beneficiaries16to18Years > 0) {
    breakdown.push({
      ageGroup: AgeGroup.REMAJA_13_18,
      count: enrollment.beneficiaries16to18Years,
      description: 'SMA 16-18 tahun',
    })
  }

  // 18+ years → DEWASA_19_59
  if (enrollment.beneficiariesAbove18 && enrollment.beneficiariesAbove18 > 0) {
    breakdown.push({
      ageGroup: AgeGroup.DEWASA_19_59,
      count: enrollment.beneficiariesAbove18,
      description: 'Dewasa 18+ tahun',
    })
  }

  return breakdown
}

/**
 * Calculate gender ratio from enrollment data
 * Returns percentage split between male and female
 * 
 * @param enrollment - Enrollment with gender breakdown
 * @returns Object with male and female ratios (0-1)
 * 
 * @example
 * ```typescript
 * const ratio = getGenderRatio(enrollment)
 * // { male: 0.52, female: 0.48 } → 52% laki-laki, 48% perempuan
 * ```
 */
export function getGenderRatio(
  enrollment: Pick<
    ProgramBeneficiaryEnrollment,
    'maleBeneficiaries' | 'femaleBeneficiaries' | 'targetBeneficiaries'
  >
): { male: number; female: number } {
  const total =
    (enrollment.maleBeneficiaries || 0) + (enrollment.femaleBeneficiaries || 0)

  if (total === 0) {
    // Default 50-50 split if no gender data
    return { male: 0.5, female: 0.5 }
  }

  return {
    male: (enrollment.maleBeneficiaries || 0) / total,
    female: (enrollment.femaleBeneficiaries || 0) / total,
  }
}

/**
 * Calculate total nutrition requirements for enrollment
 * Fetches nutrition standards from database and calculates total needs
 * 
 * @param enrollment - Full enrollment with age and gender breakdown
 * @param nutritionStandards - Array of nutrition standards from DB
 * @returns Total nutrition requirements with breakdown
 * 
 * @example
 * ```typescript
 * const enrollment = await db.programBeneficiaryEnrollment.findUnique({
 *   where: { id: 'enrollment_123' }
 * })
 * 
 * const standards = await db.nutritionStandard.findMany()
 * 
 * const requirements = calculateNutritionRequirements(enrollment, standards)
 * // {
 * //   totalCalories: 125000,
 * //   totalProtein: 3750,
 * //   breakdown: [...]
 * // }
 * ```
 */
export function calculateNutritionRequirements(
  enrollment: Pick<
    ProgramBeneficiaryEnrollment,
    | 'beneficiaries0to2Years'
    | 'beneficiaries2to5Years'
    | 'beneficiaries6to12Years'
    | 'beneficiaries13to15Years'
    | 'beneficiaries16to18Years'
    | 'beneficiariesAbove18'
    | 'maleBeneficiaries'
    | 'femaleBeneficiaries'
    | 'targetBeneficiaries'
  >,
  nutritionStandards: Array<{
    ageGroup: AgeGroup
    gender: Gender | null
    calories: number
    protein: number
    carbohydrates: number
    fat: number
    fiber: number
  }>
): NutritionRequirement {
  const ageBreakdown = getAgeGroupBreakdown(enrollment)
  const genderRatio = getGenderRatio(enrollment)

  const breakdown: NutritionRequirement['breakdown'] = []
  let totalCalories = 0
  let totalProtein = 0
  let totalCarbohydrates = 0
  let totalFat = 0
  let totalFiber = 0

  // For each age group
  for (const ageGroup of ageBreakdown) {
    // Calculate male beneficiaries for this age group
    const maleCount = Math.round(ageGroup.count * genderRatio.male)
    const femaleCount = Math.round(ageGroup.count * genderRatio.female)

    // Find nutrition standard for male
    const maleStandard = nutritionStandards.find(
      (s) => s.ageGroup === ageGroup.ageGroup && s.gender === Gender.MALE
    )

    // Find nutrition standard for female
    const femaleStandard = nutritionStandards.find(
      (s) => s.ageGroup === ageGroup.ageGroup && s.gender === Gender.FEMALE
    )

    // Calculate male nutrition (if standard exists)
    if (maleCount > 0 && maleStandard) {
      const calories = maleStandard.calories * maleCount
      const protein = maleStandard.protein * maleCount
      
      breakdown.push({
        ageGroup: ageGroup.ageGroup,
        gender: Gender.MALE,
        count: maleCount,
        calories,
        protein,
      })

      totalCalories += calories
      totalProtein += protein
      totalCarbohydrates += maleStandard.carbohydrates * maleCount
      totalFat += maleStandard.fat * maleCount
      totalFiber += maleStandard.fiber * maleCount
    }

    // Calculate female nutrition
    if (femaleCount > 0 && femaleStandard) {
      const calories = femaleStandard.calories * femaleCount
      const protein = femaleStandard.protein * femaleCount
      
      breakdown.push({
        ageGroup: ageGroup.ageGroup,
        gender: Gender.FEMALE,
        count: femaleCount,
        calories,
        protein,
      })

      totalCalories += calories
      totalProtein += protein
      totalCarbohydrates += femaleStandard.carbohydrates * femaleCount
      totalFat += femaleStandard.fat * femaleCount
      totalFiber += femaleStandard.fiber * femaleCount
    }

    // Use average if both standards exist but no gender data
    if (!maleStandard && !femaleStandard) {
      console.warn(`No nutrition standard found for age group: ${ageGroup.ageGroup}`)
    }
  }

  return {
    totalCalories,
    totalProtein,
    totalCarbohydrates,
    totalFat,
    totalFiber,
    breakdown,
  }
}

/**
 * Validate if age breakdown adds up to target beneficiaries
 * 
 * @param enrollment - Enrollment with age breakdown
 * @returns Validation result with warnings
 */
export function validateAgeBreakdown(
  enrollment: Pick<
    ProgramBeneficiaryEnrollment,
    | 'targetBeneficiaries'
    | 'beneficiaries0to2Years'
    | 'beneficiaries2to5Years'
    | 'beneficiaries6to12Years'
    | 'beneficiaries13to15Years'
    | 'beneficiaries16to18Years'
    | 'beneficiariesAbove18'
  >
): {
  isValid: boolean
  total: number
  target: number
  difference: number
  warnings: string[]
} {
  const total =
    (enrollment.beneficiaries0to2Years || 0) +
    (enrollment.beneficiaries2to5Years || 0) +
    (enrollment.beneficiaries6to12Years || 0) +
    (enrollment.beneficiaries13to15Years || 0) +
    (enrollment.beneficiaries16to18Years || 0) +
    (enrollment.beneficiariesAbove18 || 0)

  const target = enrollment.targetBeneficiaries
  const difference = total - target
  const warnings: string[] = []

  if (total === 0) {
    warnings.push('Data distribusi usia belum diisi')
  } else if (total > target) {
    warnings.push(
      `Total distribusi usia (${total}) melebihi target penerima manfaat (${target})`
    )
  } else if (total < target) {
    warnings.push(
      `Total distribusi usia (${total}) kurang dari target penerima manfaat (${target}). Kekurangan: ${target - total}`
    )
  }

  return {
    isValid: total === target,
    total,
    target,
    difference,
    warnings,
  }
}
