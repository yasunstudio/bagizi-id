/**
 * @fileoverview ProgramBeneficiaryEnrollment seed - Link Programs to Organizations
 * @description Creates enrollments linking PMAS and PMT programs to schools and health facilities:
 *              - PMAS → 10 Schools (5000 SCHOOL_CHILDREN total)
 *              - PMT → 3 Schools + 5 Health facilities (2500 vulnerable beneficiaries)
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import {
  PrismaClient,
  SPPG,
  NutritionProgram,
  BeneficiaryOrganization,
  ProgramBeneficiaryEnrollment,
  TargetGroup,
  ProgramEnrollmentStatus,
  BeneficiaryOrganizationSubType,
  Prisma
} from '@prisma/client'

/**
 * PMAS Program Enrollment Configuration
 * Target: SCHOOL_CHILDREN in 10 schools (4 SD, 3 SMP, 2 SMA, 1 SMK)
 * Total: 5000 students
 */
interface SchoolEnrollmentConfig {
  npsn: string
  subType: BeneficiaryOrganizationSubType
  targetBeneficiaries: number
  beneficiaries6to12Years?: number // SD students
  beneficiaries13to15Years?: number // SMP students
  beneficiaries16to18Years?: number // SMA/SMK students
  maleBeneficiaries: number
  femaleBeneficiaries: number
  monthlyBudgetAllocation: number
  budgetPerBeneficiary: number
}

/**
 * PMT Program Enrollment Configuration
 * Target: Multiple vulnerable groups across schools + health facilities
 */
interface VulnerableEnrollmentConfig {
  orgIdentifier: string // NPSN or NIKKES
  targetGroup: TargetGroup
  targetBeneficiaries: number
  targetGroupSpecificData: Prisma.JsonValue
  maleBeneficiaries?: number
  femaleBeneficiaries?: number
  monthlyBudgetAllocation: number
  budgetPerBeneficiary: number
  specialDietaryNeeds?: string
  culturalPreferences: string
}

// ============================================================================
// PMAS SCHOOL ENROLLMENTS (10 schools, 5000 students total)
// ============================================================================

const PMAS_SCHOOL_ENROLLMENTS: SchoolEnrollmentConfig[] = [
  // Elementary Schools (SD) - 4 schools, 1660 students
  {
    npsn: '20213001',
    subType: BeneficiaryOrganizationSubType.SD,
    targetBeneficiaries: 450,
    beneficiaries6to12Years: 450,
    maleBeneficiaries: 225,
    femaleBeneficiaries: 225,
    monthlyBudgetAllocation: 5_400_000, // 450 × Rp 12,000
    budgetPerBeneficiary: 12_000 // Average lunch cost
  },
  {
    npsn: '20213005',
    subType: BeneficiaryOrganizationSubType.SD,
    targetBeneficiaries: 400,
    beneficiaries6to12Years: 400,
    maleBeneficiaries: 205,
    femaleBeneficiaries: 195,
    monthlyBudgetAllocation: 4_800_000,
    budgetPerBeneficiary: 12_000
  },
  {
    npsn: '20213008',
    subType: BeneficiaryOrganizationSubType.SD,
    targetBeneficiaries: 350,
    beneficiaries6to12Years: 350,
    maleBeneficiaries: 180,
    femaleBeneficiaries: 170,
    monthlyBudgetAllocation: 4_200_000,
    budgetPerBeneficiary: 12_000
  },
  {
    npsn: '20213012',
    subType: BeneficiaryOrganizationSubType.SD,
    targetBeneficiaries: 460,
    beneficiaries6to12Years: 460,
    maleBeneficiaries: 230,
    femaleBeneficiaries: 230,
    monthlyBudgetAllocation: 5_520_000,
    budgetPerBeneficiary: 12_000
  },

  // Junior High Schools (SMP) - 3 schools, 1820 students
  {
    npsn: '20213020',
    subType: BeneficiaryOrganizationSubType.SMP,
    targetBeneficiaries: 700,
    beneficiaries13to15Years: 700,
    maleBeneficiaries: 340,
    femaleBeneficiaries: 360,
    monthlyBudgetAllocation: 9_100_000, // 700 × Rp 13,000
    budgetPerBeneficiary: 13_000 // Slightly higher for older students
  },
  {
    npsn: '20213022',
    subType: BeneficiaryOrganizationSubType.SMP,
    targetBeneficiaries: 620,
    beneficiaries13to15Years: 620,
    maleBeneficiaries: 310,
    femaleBeneficiaries: 310,
    monthlyBudgetAllocation: 8_060_000,
    budgetPerBeneficiary: 13_000
  },
  {
    npsn: '20213025',
    subType: BeneficiaryOrganizationSubType.SMP,
    targetBeneficiaries: 500,
    beneficiaries13to15Years: 500,
    maleBeneficiaries: 245,
    femaleBeneficiaries: 255,
    monthlyBudgetAllocation: 6_500_000,
    budgetPerBeneficiary: 13_000
  },

  // Senior High Schools (SMA) - 2 schools, 1700 students
  {
    npsn: '20213030',
    subType: BeneficiaryOrganizationSubType.SMA,
    targetBeneficiaries: 900,
    beneficiaries16to18Years: 900,
    maleBeneficiaries: 450,
    femaleBeneficiaries: 450,
    monthlyBudgetAllocation: 12_600_000, // 900 × Rp 14,000
    budgetPerBeneficiary: 14_000 // Higher for SMA
  },
  {
    npsn: '20213032',
    subType: BeneficiaryOrganizationSubType.SMA,
    targetBeneficiaries: 800,
    beneficiaries16to18Years: 800,
    maleBeneficiaries: 400,
    femaleBeneficiaries: 400,
    monthlyBudgetAllocation: 11_200_000,
    budgetPerBeneficiary: 14_000
  },

  // Vocational High School (SMK) - 1 school, 820 students
  {
    npsn: '20213040',
    subType: BeneficiaryOrganizationSubType.SMK,
    targetBeneficiaries: 820,
    beneficiaries16to18Years: 820,
    maleBeneficiaries: 500,
    femaleBeneficiaries: 320,
    monthlyBudgetAllocation: 11_480_000, // 820 × Rp 14,000
    budgetPerBeneficiary: 14_000
  }
]
// Total PMAS: 6,000 students planned (using 5000 active)

// ============================================================================
// PMT VULNERABLE GROUP ENROLLMENTS (8 organizations, 2500 beneficiaries)
// ============================================================================

const PMT_VULNERABLE_ENROLLMENTS: VulnerableEnrollmentConfig[] = [
  // PREGNANT_WOMAN - 3 Posyandu (530 total)
  {
    orgIdentifier: '3214051001', // Posyandu Melati Jatiluhur
    targetGroup: TargetGroup.PREGNANT_WOMAN,
    targetBeneficiaries: 200,
    targetGroupSpecificData: {
      firstTrimester: 60,
      secondTrimester: 80,
      thirdTrimester: 60
    },
    femaleBeneficiaries: 200,
    monthlyBudgetAllocation: 2_800_000, // 200 × Rp 14,000 (2 snacks/day × 30 days × Rp 7k)
    budgetPerBeneficiary: 14_000,
    specialDietaryNeeds: 'High iron, folic acid, calcium',
    culturalPreferences: 'Halal'
  },
  {
    orgIdentifier: '3214051002', // Posyandu Mawar Maniis
    targetGroup: TargetGroup.PREGNANT_WOMAN,
    targetBeneficiaries: 180,
    targetGroupSpecificData: {
      firstTrimester: 50,
      secondTrimester: 70,
      thirdTrimester: 60
    },
    femaleBeneficiaries: 180,
    monthlyBudgetAllocation: 2_520_000,
    budgetPerBeneficiary: 14_000,
    specialDietaryNeeds: 'High iron, folic acid, calcium',
    culturalPreferences: 'Halal'
  },
  {
    orgIdentifier: '3214051003', // Posyandu Anggrek Campaka
    targetGroup: TargetGroup.PREGNANT_WOMAN,
    targetBeneficiaries: 150,
    targetGroupSpecificData: {
      firstTrimester: 45,
      secondTrimester: 55,
      thirdTrimester: 50
    },
    femaleBeneficiaries: 150,
    monthlyBudgetAllocation: 2_100_000,
    budgetPerBeneficiary: 14_000,
    specialDietaryNeeds: 'High iron, folic acid, calcium',
    culturalPreferences: 'Halal'
  },

  // TODDLER - 2 Puskesmas (1000 total)
  {
    orgIdentifier: '3214052001', // Puskesmas Jatiluhur
    targetGroup: TargetGroup.TODDLER,
    targetBeneficiaries: 600,
    targetGroupSpecificData: {
      age0to2Years: 250,
      age2to5Years: 350
    },
    maleBeneficiaries: 310,
    femaleBeneficiaries: 290,
    monthlyBudgetAllocation: 8_400_000, // 600 × Rp 14,000
    budgetPerBeneficiary: 14_000,
    specialDietaryNeeds: 'Soft foods, age-appropriate portions, allergen monitoring',
    culturalPreferences: 'Halal'
  },
  {
    orgIdentifier: '3214052002', // Puskesmas Purwakarta Kota
    targetGroup: TargetGroup.TODDLER,
    targetBeneficiaries: 400,
    targetGroupSpecificData: {
      age0to2Years: 170,
      age2to5Years: 230
    },
    maleBeneficiaries: 205,
    femaleBeneficiaries: 195,
    monthlyBudgetAllocation: 5_600_000,
    budgetPerBeneficiary: 14_000,
    specialDietaryNeeds: 'Soft foods, age-appropriate portions, allergen monitoring',
    culturalPreferences: 'Halal'
  },

  // BREASTFEEDING_MOTHER - 2 Posyandu (350 total)
  {
    orgIdentifier: '3214051001', // Posyandu Melati Jatiluhur (shared with pregnant women)
    targetGroup: TargetGroup.BREASTFEEDING_MOTHER,
    targetBeneficiaries: 200,
    targetGroupSpecificData: {
      babyAge0to6Months: 100,
      babyAge6to12Months: 70,
      babyAge12to24Months: 30
    },
    femaleBeneficiaries: 200,
    monthlyBudgetAllocation: 2_800_000,
    budgetPerBeneficiary: 14_000,
    specialDietaryNeeds: 'High protein, calcium, lactation support foods',
    culturalPreferences: 'Halal'
  },
  {
    orgIdentifier: '3214051002', // Posyandu Mawar Maniis (shared)
    targetGroup: TargetGroup.BREASTFEEDING_MOTHER,
    targetBeneficiaries: 150,
    targetGroupSpecificData: {
      babyAge0to6Months: 80,
      babyAge6to12Months: 50,
      babyAge12to24Months: 20
    },
    femaleBeneficiaries: 150,
    monthlyBudgetAllocation: 2_100_000,
    budgetPerBeneficiary: 14_000,
    specialDietaryNeeds: 'High protein, calcium, lactation support foods',
    culturalPreferences: 'Halal'
  },

  // ELDERLY (Lansia) - 1 Puskesmas (150 total)
  // Added to replace teenage girl enrollments for consistency
  // Uses existing Puskesmas for elderly nutrition program
  {
    orgIdentifier: '3214052002', // Puskesmas Purwakarta Kota (shared with toddlers)
    targetGroup: TargetGroup.ELDERLY,
    targetBeneficiaries: 150,
    targetGroupSpecificData: {
      age60to70Years: 80,
      age70PlusYears: 70,
      hasChronicDisease: true,
      needsSpecialDiet: true
    },
    maleBeneficiaries: 60,
    femaleBeneficiaries: 90,
    monthlyBudgetAllocation: 2_100_000, // 150 × Rp 14,000
    budgetPerBeneficiary: 14_000,
    specialDietaryNeeds: 'Soft foods, low sodium, easy to digest, fiber-rich',
    culturalPreferences: 'Halal'
  },

  // ❌ REMOVED: TEENAGE_GIRL enrollments for SMP schools
  // REASON: Inconsistent - schools should use SCHOOL_CHILDREN target group
  // If teenage girls are in schools, they should be counted as SCHOOL_CHILDREN
  // TEENAGE_GIRL should only be used for community-based programs (Posyandu/Puskesmas)
  // This maintains consistency: organization type matches target group context
]
// Total PMT: 2,030 beneficiaries (530 pregnant + 350 breastfeeding + 1000 toddler + 150 elderly)
// ❌ REMOVED 470 teenage girls from schools - moved to PMAS program context

// ============================================================================
// SEED FUNCTION
// ============================================================================

export async function seedProgramBeneficiaryEnrollment(
  prisma: PrismaClient,
  sppg: SPPG,
  programs: NutritionProgram[],
  organizations: BeneficiaryOrganization[]
): Promise<ProgramBeneficiaryEnrollment[]> {
  console.log('  → Creating ProgramBeneficiaryEnrollments...')

  const enrollments: ProgramBeneficiaryEnrollment[] = []

  // Find PMAS and PMT programs
  const pmasProgram = programs.find(p => p.programCode === 'PMAS-PWK-2025')
  const pmtProgram = programs.find(p => p.programCode === 'PMT-PWK-2025')

  if (!pmasProgram) {
    throw new Error('PMAS program not found')
  }
  if (!pmtProgram) {
    throw new Error('PMT program not found')
  }

  // Create organization maps
  const orgByNpsn = new Map(
    organizations
      .filter(o => o.npsn)
      .map(o => [o.npsn!, o])
  )
  const orgByNikkes = new Map(
    organizations
      .filter(o => o.nikkes)
      .map(o => [o.nikkes!, o])
  )

  // ============================================================================
  // PMAS ENROLLMENTS - Schools (SCHOOL_CHILDREN)
  // ============================================================================

  let pmasTotal = 0
  for (const config of PMAS_SCHOOL_ENROLLMENTS) {
    const organization = orgByNpsn.get(config.npsn)
    if (!organization) {
      console.warn(`⚠️  School with NPSN ${config.npsn} not found, skipping`)
      continue
    }

    const enrollment = await prisma.programBeneficiaryEnrollment.create({
      data: {
        beneficiaryOrgId: organization.id,
        programId: pmasProgram.id,
        sppgId: sppg.id,

        // Enrollment period (full year 2025)
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),

        // Target group
        targetGroup: TargetGroup.SCHOOL_CHILDREN,

        // Beneficiary counts
        targetBeneficiaries: config.targetBeneficiaries,
        activeBeneficiaries: Math.floor(config.targetBeneficiaries * 0.95), // 95% attendance

        // Age breakdown
        beneficiaries6to12Years: config.beneficiaries6to12Years,
        beneficiaries13to15Years: config.beneficiaries13to15Years,
        beneficiaries16to18Years: config.beneficiaries16to18Years,

        // Gender breakdown
        maleBeneficiaries: config.maleBeneficiaries,
        femaleBeneficiaries: config.femaleBeneficiaries,

        // Feeding configuration (PMAS: lunch only on weekdays)
        feedingDays: 5, // Monday-Friday
        mealsPerDay: 1, // Lunch only
        feedingTime: 'Lunch',
        lunchTime: '12:00',

        // Delivery configuration
        deliveryAddress: organization.address,
        deliveryContact: organization.contactPerson || 'School Administration',
        deliveryPhone: organization.phone,
        deliveryInstructions: `Deliver to school kitchen by 11:00. Contact ${organization.contactPerson || 'principal'} upon arrival.`,
        preferredDeliveryTime: '10:00-11:00',
        estimatedTravelTime: 30,

        // Service configuration
        // storageCapacity removed - field doesn't exist in BeneficiaryOrganization
        servingMethod: 'On-site cafeteria service',

        // Budget tracking
        monthlyBudgetAllocation: config.monthlyBudgetAllocation,
        budgetPerBeneficiary: config.budgetPerBeneficiary,

        // Performance tracking
        totalMealsServed: 0,
        totalBeneficiariesServed: 0,
        averageAttendanceRate: 0.95,

        // Cultural preferences
        culturalPreferences: 'Halal',

        // Status
        enrollmentStatus: ProgramEnrollmentStatus.ACTIVE,
        isActive: true,
        isPriority: false,

        // Administrative
        enrolledBy: 'SEED_SYSTEM',
        approvedBy: 'DEMO_ADMIN',
        approvedAt: new Date('2024-12-15'),
        remarks: `PMAS enrollment for ${config.subType} - Academic Year 2025`
      }
    })

    enrollments.push(enrollment)
    pmasTotal += config.targetBeneficiaries
  }

  // ============================================================================
  // PMT ENROLLMENTS - Health Facilities + Schools (Vulnerable Groups)
  // ============================================================================

  let pmtTotal = 0
  for (const config of PMT_VULNERABLE_ENROLLMENTS) {
    // Try to find organization by NPSN or NIKKES
    const organization = orgByNpsn.get(config.orgIdentifier) || orgByNikkes.get(config.orgIdentifier)
    
    if (!organization) {
      console.warn(`⚠️  Organization ${config.orgIdentifier} not found, skipping`)
      continue
    }

    const enrollment = await prisma.programBeneficiaryEnrollment.create({
      data: {
        beneficiaryOrgId: organization.id,
        programId: pmtProgram.id,
        sppgId: sppg.id,

        // Enrollment period (full year 2025)
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),

        // Target group (specific vulnerable group)
        targetGroup: config.targetGroup,

        // Beneficiary counts
        targetBeneficiaries: config.targetBeneficiaries,
        activeBeneficiaries: Math.floor(config.targetBeneficiaries * 0.9), // 90% attendance for vulnerable groups

        // Target-specific data (flexible JSON)
        targetGroupSpecificData: config.targetGroupSpecificData as Prisma.InputJsonValue,

        // Gender breakdown
        maleBeneficiaries: config.maleBeneficiaries,
        femaleBeneficiaries: config.femaleBeneficiaries,

        // Feeding configuration (PMT: 2 snacks per day, daily including weekends)
        feedingDays: 7, // Daily
        mealsPerDay: 2, // Morning + afternoon snack
        feedingTime: 'Morning and Afternoon Snack',
        snackTime: '09:00', // Morning snack time (afternoon is 15:00, stored in delivery instructions)

        // Delivery configuration
        deliveryAddress: organization.address,
        deliveryContact: organization.contactPerson || 'Health Facility Staff',
        deliveryPhone: organization.phone,
        deliveryInstructions: `Deliver to ${organization.subType} by 08:00. Coordinate with ${organization.contactPerson}.`,
        preferredDeliveryTime: '07:00-08:00',
        estimatedTravelTime: 20,

        // Service configuration
        servingMethod: config.targetGroup === TargetGroup.TODDLER 
          ? 'On-site feeding with caregiver supervision'
          : 'Take-home package with nutrition education',

        // Budget tracking
        monthlyBudgetAllocation: config.monthlyBudgetAllocation,
        budgetPerBeneficiary: config.budgetPerBeneficiary,

        // Performance tracking
        totalMealsServed: 0,
        totalBeneficiariesServed: 0,
        averageAttendanceRate: 0.9,

        // Special requirements
        specialDietaryNeeds: config.specialDietaryNeeds,
        culturalPreferences: config.culturalPreferences,
        medicalConsiderations: config.targetGroup === TargetGroup.PREGNANT_WOMAN
          ? 'Monitor for gestational diabetes, anemia, and nutritional deficiencies'
          : config.targetGroup === TargetGroup.TODDLER
          ? 'Monitor for stunting indicators, allergies, and developmental milestones'
          : config.targetGroup === TargetGroup.BREASTFEEDING_MOTHER
          ? 'Support lactation, monitor maternal nutrition status'
          : config.targetGroup === TargetGroup.TEENAGE_GIRL
          ? 'Monitor for anemia, support growth and development'
          : undefined,

        // Program focus
        programFocus: config.targetGroup === TargetGroup.TODDLER
          ? 'Stunting Prevention'
          : config.targetGroup === TargetGroup.PREGNANT_WOMAN
          ? 'Maternal Health'
          : config.targetGroup === TargetGroup.TEENAGE_GIRL
          ? 'Anemia Prevention'
          : 'Nutritional Support',

        // Status
        enrollmentStatus: ProgramEnrollmentStatus.ACTIVE,
        isActive: true,
        isPriority: true, // Vulnerable groups are priority
        needsAssessment: true, // Require nutritional assessment

        // Administrative
        enrolledBy: 'SEED_SYSTEM',
        approvedBy: 'DEMO_ADMIN',
        approvedAt: new Date('2024-12-15'),
        remarks: `PMT enrollment for ${config.targetGroup} - Year 2025`
      }
    })

    enrollments.push(enrollment)
    pmtTotal += config.targetBeneficiaries
  }

  console.log(`  ✓ Created ${enrollments.length} ProgramBeneficiaryEnrollments:`)
  console.log(`    - PMAS (SCHOOL_CHILDREN): 10 schools, ${pmasTotal} students`)
  console.log(`      * SD: 1,660 students (4 schools)`)
  console.log(`      * SMP: 1,820 students (3 schools)`)
  console.log(`      * SMA: 1,700 students (2 schools)`)
  console.log(`      * SMK: 820 students (1 school)`)
  console.log(`      * Feeding: Lunch only, Monday-Friday (5 days/week)`)
  console.log(`    - PMT (Vulnerable Groups): 9 enrollments, ${pmtTotal} beneficiaries`)
  console.log(`      * PREGNANT_WOMAN: 530 (3 Posyandu)`)
  console.log(`      * TODDLER: 1,000 (2 Puskesmas)`)
  console.log(`      * BREASTFEEDING_MOTHER: 350 (2 Posyandu)`)
  console.log(`      * TEENAGE_GIRL: 470 (3 SMP schools)`)
  console.log(`      * Feeding: 2 snacks/day, 7 days/week`)
  console.log(`    - Total beneficiaries: ${pmasTotal + pmtTotal}`)

  return enrollments
}
