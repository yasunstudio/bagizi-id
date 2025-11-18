/**
 * Nutrition Helper Functions
 * 
 * Provides utility functions to retrieve nutrition targets from NutritionStandard
 * based on program configuration. This eliminates data redundancy by using
 * NutritionStandard as the single source of truth.
 * 
 * @version 1.0
 * @date November 7, 2025
 */

import { db } from '@/lib/prisma'
import { TargetGroup, AgeGroup, Gender, ActivityLevel } from '@prisma/client'

/**
 * Nutrition target for a specific group
 */
export interface NutritionTarget {
  targetGroup: TargetGroup
  ageGroup: AgeGroup
  gender: Gender | null
  activityLevel: ActivityLevel
  calories: number
  protein: number
  carbohydrates: number
  fat: number
  fiber: number
  calcium: number | null
  iron: number | null
  vitaminA: number | null
  vitaminC: number | null
  vitaminD: number | null
  vitaminE: number | null
  folate: number | null
  zinc: number | null
  caloriesMin: number | null
  caloriesMax: number | null
  proteinMin: number | null
  proteinMax: number | null
  source: string | null
  referenceYear: number | null
}

/**
 * Aggregated nutrition targets for a program
 */
export interface ProgramNutritionSummary {
  targetGroups: TargetGroup[]
  standards: NutritionTarget[]
  aggregates: {
    avgCalories: number
    avgProtein: number
    avgCarbohydrates: number
    avgFat: number
    avgFiber: number
    minCalories: number
    maxCalories: number
    minProtein: number
    maxProtein: number
  }
  calculatedAt: Date
}

/**
 * Get nutrition standards for specific target group
 * 
 * @param targetGroup - Target beneficiary group
 * @param ageGroup - Age group (optional, uses most common if not specified)
 * @param gender - Gender (optional)
 * @param activityLevel - Activity level (optional, defaults to MODERATE)
 * @returns Nutrition standard or null if not found
 * 
 * @example
 * ```typescript
 * const standard = await getNutritionStandard('PREGNANT_WOMAN')
 * console.log(`Calories: ${standard.calories}`)
 * console.log(`Iron: ${standard.iron}mg`)
 * ```
 */
export async function getNutritionStandard(
  targetGroup: TargetGroup,
  ageGroup?: AgeGroup,
  gender?: Gender,
  activityLevel: ActivityLevel = 'MODERATE'
): Promise<NutritionTarget | null> {
  const where: {
    targetGroup: TargetGroup
    activityLevel: ActivityLevel
    isActive: boolean
    ageGroup?: AgeGroup
    gender?: Gender
  } = {
    targetGroup,
    activityLevel,
    isActive: true
  }

  if (ageGroup) where.ageGroup = ageGroup
  if (gender) where.gender = gender

  const standard = await db.nutritionStandard.findFirst({
    where,
    orderBy: { createdAt: 'desc' } // Get most recent if multiple
  })

  return standard as NutritionTarget | null
}

/**
 * Get nutrition standards for all target groups in a program
 * 
 * @param programId - Program ID
 * @returns Array of nutrition standards for each allowed target group
 * 
 * @example
 * ```typescript
 * const standards = await getProgramNutritionTargets('program_123')
 * standards.forEach(std => {
 *   console.log(`${std.targetGroup}: ${std.calories} calories`)
 * })
 * ```
 */
export async function getProgramNutritionTargets(
  programId: string
): Promise<NutritionTarget[]> {
  // Get program with allowed target groups
  const program = await db.nutritionProgram.findUnique({
    where: { id: programId },
    select: { 
      allowedTargetGroups: true
    }
  })

  if (!program) {
    throw new Error(`Program not found: ${programId}`)
  }

  // If no specific target groups, return empty
  if (!program.allowedTargetGroups || program.allowedTargetGroups.length === 0) {
    return []
  }

  // Get standards for each target group
  const standards = await db.nutritionStandard.findMany({
    where: {
      targetGroup: { in: program.allowedTargetGroups },
      isActive: true
    },
    orderBy: [
      { targetGroup: 'asc' },
      { ageGroup: 'asc' }
    ]
  })

  return standards as NutritionTarget[]
}

/**
 * Get aggregated nutrition summary for a program
 * Useful for dashboard displays and overview statistics
 * 
 * @param programId - Program ID
 * @returns Aggregated nutrition statistics
 * 
 * @example
 * ```typescript
 * const summary = await getProgramNutritionSummary('program_123')
 * console.log(`Average calories: ${summary.aggregates.avgCalories}`)
 * console.log(`Calorie range: ${summary.aggregates.minCalories} - ${summary.aggregates.maxCalories}`)
 * ```
 */
export async function getProgramNutritionSummary(
  programId: string
): Promise<ProgramNutritionSummary> {
  const program = await db.nutritionProgram.findUnique({
    where: { id: programId },
    select: { allowedTargetGroups: true }
  })

  if (!program) {
    throw new Error(`Program not found: ${programId}`)
  }

  const standards = await getProgramNutritionTargets(programId)

  if (standards.length === 0) {
    return {
      targetGroups: [],
      standards: [],
      aggregates: {
        avgCalories: 0,
        avgProtein: 0,
        avgCarbohydrates: 0,
        avgFat: 0,
        avgFiber: 0,
        minCalories: 0,
        maxCalories: 0,
        minProtein: 0,
        maxProtein: 0
      },
      calculatedAt: new Date()
    }
  }

  // Calculate aggregates
  const calories = standards.map(s => s.calories)
  const proteins = standards.map(s => s.protein)
  const carbs = standards.map(s => s.carbohydrates)
  const fats = standards.map(s => s.fat)
  const fibers = standards.map(s => s.fiber)

  const avgCalories = calories.reduce((sum, v) => sum + v, 0) / calories.length
  const avgProtein = proteins.reduce((sum, v) => sum + v, 0) / proteins.length
  const avgCarbohydrates = carbs.reduce((sum, v) => sum + v, 0) / carbs.length
  const avgFat = fats.reduce((sum, v) => sum + v, 0) / fats.length
  const avgFiber = fibers.reduce((sum, v) => sum + v, 0) / fibers.length

  return {
    targetGroups: program.allowedTargetGroups,
    standards,
    aggregates: {
      avgCalories: Math.round(avgCalories),
      avgProtein: Math.round(avgProtein * 10) / 10,
      avgCarbohydrates: Math.round(avgCarbohydrates * 10) / 10,
      avgFat: Math.round(avgFat * 10) / 10,
      avgFiber: Math.round(avgFiber * 10) / 10,
      minCalories: Math.min(...calories),
      maxCalories: Math.max(...calories),
      minProtein: Math.min(...proteins),
      maxProtein: Math.max(...proteins)
    },
    calculatedAt: new Date()
  }
}

/**
 * Check if a menu meets nutrition standards for a target group
 * 
 * @param menuId - Menu ID
 * @param targetGroup - Target group to check against
 * @returns Compliance status and details
 * 
 * @example
 * ```typescript
 * const compliance = await checkMenuNutritionCompliance('menu_123', 'PREGNANT_WOMAN')
 * if (compliance.isCompliant) {
 *   console.log('Menu meets standards!')
 * } else {
 *   console.log('Deficiencies:', compliance.deficiencies)
 * }
 * ```
 */
export async function checkMenuNutritionCompliance(
  menuId: string,
  targetGroup: TargetGroup
): Promise<{
  isCompliant: boolean
  standard: NutritionTarget | null
  menuNutrition: {
    calories?: number
    protein?: number
    iron?: number
    calcium?: number
    folicAcid?: number
    vitaminA?: number
    vitaminD?: number
  }
  deficiencies: string[]
  excesses: string[]
}> {
  // Get menu nutrition
  const menu = await db.nutritionMenu.findUnique({
    where: { id: menuId },
    include: { nutritionCalc: true }
  })

  if (!menu) {
    throw new Error(`Menu not found: ${menuId}`)
  }

  // Get standard for target group
  const standard = await getNutritionStandard(targetGroup)

  if (!standard) {
    return {
      isCompliant: false,
      standard: null,
      menuNutrition: {},
      deficiencies: [`No nutrition standard found for ${targetGroup}`],
      excesses: []
    }
  }

  const deficiencies: string[] = []
  const excesses: string[] = []

  // Check basic nutrients from nutritionCalc
  if (menu.nutritionCalc) {
    const calc = menu.nutritionCalc

    // Calories
    if (calc.totalCalories < standard.calories * 0.9) {
      deficiencies.push(`Calories: ${calc.totalCalories} < ${standard.calories} (90% minimum)`)
    } else if (calc.totalCalories > standard.calories * 1.2) {
      excesses.push(`Calories: ${calc.totalCalories} > ${standard.calories} (120% maximum)`)
    }

    // Protein
    if (calc.totalProtein < standard.protein * 0.9) {
      deficiencies.push(`Protein: ${calc.totalProtein}g < ${standard.protein}g (90% minimum)`)
    }
  }

  // Check special nutrients for specific target groups
  if (targetGroup === 'PREGNANT_WOMAN') {
    if (!menu.folicAcid || menu.folicAcid < (standard.folate || 600) * 0.9) {
      deficiencies.push(`Folic Acid: Required ≥${(standard.folate || 600) * 0.9}mcg for pregnant women`)
    }
    if (!menu.iron || menu.iron < (standard.iron || 27) * 0.9) {
      deficiencies.push(`Iron: Required ≥${(standard.iron || 27) * 0.9}mg for pregnant women`)
    }
    if (!menu.calcium || menu.calcium < (standard.calcium || 1000) * 0.9) {
      deficiencies.push(`Calcium: Required ≥${(standard.calcium || 1000) * 0.9}mg for pregnant women`)
    }
  }

  if (targetGroup === 'TEENAGE_GIRL') {
    if (!menu.iron || menu.iron < 15) {
      deficiencies.push(`Iron: Required ≥15mg for teenage girls (menstruation support)`)
    }
  }

  if (targetGroup === 'ELDERLY') {
    if (!menu.calcium || menu.calcium < (standard.calcium || 1200) * 0.9) {
      deficiencies.push(`Calcium: Required ≥${(standard.calcium || 1200) * 0.9}mg for elderly`)
    }
    if (!menu.vitaminD) {
      deficiencies.push(`Vitamin D: Required for elderly (bone health)`)
    }
  }

  if (targetGroup === 'TODDLER') {
    if (!menu.vitaminA) {
      deficiencies.push(`Vitamin A: Required for toddlers (anti-stunting)`)
    }
    if (!menu.vitaminD) {
      deficiencies.push(`Vitamin D: Required for toddlers (bone development)`)
    }
  }

  if (targetGroup === 'BREASTFEEDING_MOTHER') {
    if (!menu.vitaminA || menu.vitaminA < (standard.vitaminA || 1300)) {
      deficiencies.push(`Vitamin A: Required ≥${standard.vitaminA || 1300} IU for breastfeeding mothers`)
    }
  }

  return {
    isCompliant: deficiencies.length === 0 && excesses.length === 0,
    standard,
    menuNutrition: {
      calories: menu.nutritionCalc?.totalCalories,
      protein: menu.nutritionCalc?.totalProtein,
      iron: menu.iron || undefined,
      calcium: menu.calcium || undefined,
      folicAcid: menu.folicAcid || undefined,
      vitaminA: menu.vitaminA || undefined,
      vitaminD: menu.vitaminD || undefined
    },
    deficiencies,
    excesses
  }
}

/**
 * Get formatted nutrition target display for UI
 * 
 * @param targetGroup - Target group
 * @returns Formatted display string
 * 
 * @example
 * ```typescript
 * const display = await getNutritionTargetDisplay('PREGNANT_WOMAN')
 * console.log(display)
 * // "Ibu Hamil: 2200 kal, 60g protein, 27mg iron, 1000mg calcium"
 * ```
 */
export async function getNutritionTargetDisplay(
  targetGroup: TargetGroup
): Promise<string> {
  const standard = await getNutritionStandard(targetGroup)

  if (!standard) {
    return `${targetGroup}: No standard available`
  }

  const parts = [
    `${standard.calories} kal`,
    `${standard.protein}g protein`
  ]

  if (standard.iron) parts.push(`${standard.iron}mg iron`)
  if (standard.calcium) parts.push(`${standard.calcium}mg calcium`)
  if (standard.folate) parts.push(`${standard.folate}mcg folate`)

  return `${targetGroup}: ${parts.join(', ')}`
}

/**
 * Export all helper functions
 */
export const NutritionHelpers = {
  getNutritionStandard,
  getProgramNutritionTargets,
  getProgramNutritionSummary,
  checkMenuNutritionCompliance,
  getNutritionTargetDisplay
}
