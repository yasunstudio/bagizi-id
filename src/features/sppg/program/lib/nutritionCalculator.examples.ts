/**
 * @fileoverview Example Usage: Age Groups & Nutrition Calculation
 * Contoh implementasi perhitungan nutrisi menggunakan age groups breakdown
 * 
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { db } from '@/lib/prisma'
import {
  getAgeGroupBreakdown,
  getGenderRatio,
  calculateNutritionRequirements,
  validateAgeBreakdown,
} from '@/features/sppg/program/lib/nutritionCalculator'

/**
 * Example 1: Fetch enrollment and get age group breakdown
 * 
 * Use Case: Display age distribution in dashboard/reports
 */
export async function exampleGetAgeBreakdown() {
  // 1. Fetch enrollment with age data
  const enrollment = await db.programBeneficiaryEnrollment.findUnique({
    where: { id: 'enrollment_123' },
    select: {
      id: true,
      beneficiaryOrg: {
        select: {
          organizationName: true,
        },
      },
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

  // 2. Get age group breakdown
  const ageBreakdown = getAgeGroupBreakdown(enrollment)

  console.log('📊 Age Group Breakdown:')
  console.log(`Organization: ${enrollment.beneficiaryOrg.organizationName}`)
  console.log(`Target Beneficiaries: ${enrollment.targetBeneficiaries}`)
  console.log('\nAge Distribution:')
  ageBreakdown.forEach((group) => {
    console.log(`  - ${group.description}: ${group.count} penerima manfaat`)
  })

  /**
   * Expected Output:
   * 📊 Age Group Breakdown:
   * Organization: SDN 1 Purwakarta
   * Target Beneficiaries: 450
   * 
   * Age Distribution:
   *   - SD 6-12 tahun: 450 penerima manfaat
   */

  return ageBreakdown
}

/**
 * Example 2: Calculate total nutrition requirements
 * 
 * Use Case: Menu planning, budget estimation, nutrition compliance
 */
export async function exampleCalculateNutrition() {
  // 1. Fetch enrollment with full age & gender data
  const enrollment = await db.programBeneficiaryEnrollment.findUnique({
    where: { id: 'enrollment_123' },
    select: {
      id: true,
      targetBeneficiaries: true,
      maleBeneficiaries: true,
      femaleBeneficiaries: true,
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

  // 2. Fetch nutrition standards from database
  const nutritionStandards = await db.nutritionStandard.findMany({
    select: {
      ageGroup: true,
      gender: true,
      calories: true,
      protein: true,
      carbohydrates: true,
      fat: true,
      fiber: true,
    },
  })

  // 3. Calculate total nutrition requirements
  const requirements = calculateNutritionRequirements(enrollment, nutritionStandards)

  console.log('🍽️  Total Nutrition Requirements (per day):')
  console.log(`Total Calories: ${requirements.totalCalories.toLocaleString('id-ID')} kal`)
  console.log(`Total Protein: ${requirements.totalProtein.toLocaleString('id-ID')} g`)
  console.log(`Total Carbohydrates: ${requirements.totalCarbohydrates.toLocaleString('id-ID')} g`)
  console.log(`Total Fat: ${requirements.totalFat.toLocaleString('id-ID')} g`)
  console.log(`Total Fiber: ${requirements.totalFiber.toLocaleString('id-ID')} g`)
  console.log('\nBreakdown by Age & Gender:')
  requirements.breakdown.forEach((item) => {
    console.log(
      `  - ${item.ageGroup} (${item.gender}): ${item.count} × ${item.calories / item.count} kal = ${item.calories.toLocaleString('id-ID')} kal`
    )
  })

  /**
   * Expected Output:
   * 🍽️  Total Nutrition Requirements (per day):
   * Total Calories: 506,250 kal
   * Total Protein: 11,250 g
   * Total Carbohydrates: 78,750 g
   * Total Fat: 16,875 g
   * Total Fiber: 22,500 g
   * 
   * Breakdown by Age & Gender:
   *   - ANAK_6_12 (MALE): 234 × 1,125 kal = 263,250 kal
   *   - ANAK_6_12 (FEMALE): 216 × 1,125 kal = 243,000 kal
   */

  return requirements
}

/**
 * Example 3: Validate age breakdown completeness
 * 
 * Use Case: Form validation, data quality checks
 */
export async function exampleValidateAgeData() {
  const enrollment = await db.programBeneficiaryEnrollment.findUnique({
    where: { id: 'enrollment_123' },
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

  const validation = validateAgeBreakdown(enrollment)

  console.log('✅ Age Breakdown Validation:')
  console.log(`Valid: ${validation.isValid ? 'Yes' : 'No'}`)
  console.log(`Total Breakdown: ${validation.total}`)
  console.log(`Target: ${validation.target}`)
  console.log(`Difference: ${validation.difference}`)

  if (validation.warnings.length > 0) {
    console.log('\n⚠️  Warnings:')
    validation.warnings.forEach((warning) => {
      console.log(`  - ${warning}`)
    })
  }

  /**
   * Expected Output (Complete Data):
   * ✅ Age Breakdown Validation:
   * Valid: Yes
   * Total Breakdown: 450
   * Target: 450
   * Difference: 0
   * 
   * Expected Output (Incomplete Data):
   * ✅ Age Breakdown Validation:
   * Valid: No
   * Total Breakdown: 350
   * Target: 450
   * Difference: -100
   * 
   * ⚠️  Warnings:
   *   - Total distribusi usia (350) kurang dari target penerima manfaat (450). Kekurangan: 100
   */

  return validation
}

/**
 * Example 4: API Endpoint - Get Enrollment with Nutrition Analysis
 * 
 * Use Case: Dashboard API, Enrollment Detail Page
 */
export async function apiGetEnrollmentWithNutrition(enrollmentId: string) {
  // 1. Fetch enrollment
  const enrollment = await db.programBeneficiaryEnrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      beneficiaryOrg: {
        select: {
          id: true,
          organizationName: true,
          type: true,
        },
      },
      program: {
        select: {
          id: true,
          name: true,
          programType: true,
        },
      },
    },
  })

  if (!enrollment) {
    return {
      success: false,
      error: 'Enrollment not found',
    }
  }

  // 2. Get age breakdown
  const ageBreakdown = getAgeGroupBreakdown(enrollment)

  // 3. Get gender ratio
  const genderRatio = getGenderRatio(enrollment)

  // 4. Validate age data
  const validation = validateAgeBreakdown(enrollment)

  // 5. Calculate nutrition requirements
  const nutritionStandards = await db.nutritionStandard.findMany()
  const nutritionRequirements = calculateNutritionRequirements(
    enrollment,
    nutritionStandards
  )

  // 6. Return comprehensive data
  return {
    success: true,
    data: {
      enrollment: {
        id: enrollment.id,
        beneficiaryOrg: enrollment.beneficiaryOrg,
        program: enrollment.program,
        targetBeneficiaries: enrollment.targetBeneficiaries,
        activeBeneficiaries: enrollment.activeBeneficiaries,
      },
      ageAnalysis: {
        breakdown: ageBreakdown,
        validation: validation,
      },
      genderAnalysis: {
        ratio: genderRatio,
        male: enrollment.maleBeneficiaries,
        female: enrollment.femaleBeneficiaries,
      },
      nutritionRequirements: nutritionRequirements,
    },
  }
}

/**
 * Example 5: Batch calculation for multiple enrollments
 * 
 * Use Case: Program-level nutrition planning
 */
export async function exampleBatchNutritionCalculation(programId: string) {
  // 1. Fetch all enrollments for a program
  const enrollments = await db.programBeneficiaryEnrollment.findMany({
    where: {
      programId,
      isActive: true,
    },
    select: {
      id: true,
      beneficiaryOrg: {
        select: {
          organizationName: true,
        },
      },
      targetBeneficiaries: true,
      maleBeneficiaries: true,
      femaleBeneficiaries: true,
      beneficiaries0to2Years: true,
      beneficiaries2to5Years: true,
      beneficiaries6to12Years: true,
      beneficiaries13to15Years: true,
      beneficiaries16to18Years: true,
      beneficiariesAbove18: true,
    },
  })

  // 2. Fetch nutrition standards once
  const nutritionStandards = await db.nutritionStandard.findMany()

  // 3. Calculate for each enrollment
  const results = enrollments.map((enrollment) => {
    const requirements = calculateNutritionRequirements(enrollment, nutritionStandards)
    return {
      enrollmentId: enrollment.id,
      organizationName: enrollment.beneficiaryOrg.organizationName,
      targetBeneficiaries: enrollment.targetBeneficiaries,
      dailyCalories: requirements.totalCalories,
      dailyProtein: requirements.totalProtein,
    }
  })

  // 4. Calculate program totals
  const programTotals = {
    totalBeneficiaries: results.reduce((sum, r) => sum + r.targetBeneficiaries, 0),
    totalDailyCalories: results.reduce((sum, r) => sum + r.dailyCalories, 0),
    totalDailyProtein: results.reduce((sum, r) => sum + r.dailyProtein, 0),
  }

  console.log('📈 Program-Level Nutrition Requirements:')
  console.log(`Total Beneficiaries: ${programTotals.totalBeneficiaries}`)
  console.log(`Total Daily Calories: ${programTotals.totalDailyCalories.toLocaleString('id-ID')} kal`)
  console.log(`Total Daily Protein: ${programTotals.totalDailyProtein.toLocaleString('id-ID')} g`)
  console.log('\nBy Organization:')
  results.forEach((result) => {
    console.log(`  - ${result.organizationName}: ${result.dailyCalories.toLocaleString('id-ID')} kal/day`)
  })

  return {
    enrollments: results,
    totals: programTotals,
  }
}
