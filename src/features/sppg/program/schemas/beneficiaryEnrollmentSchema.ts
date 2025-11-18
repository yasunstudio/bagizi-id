/**
 * @fileoverview Zod validation schema untuk Program Beneficiary Enrollment
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { z } from 'zod'
import { TargetGroup, ProgramEnrollmentStatus } from '@prisma/client'

/**
 * Schema untuk membuat Program Beneficiary Enrollment baru
 * Supports multiple beneficiary types: Schools, Health Facilities, Community Centers, etc.
 * 
 * @example
 * ```typescript
 * const enrollment = {
 *   beneficiaryOrgId: 'org_123',
 *   programId: 'prog_456',
 *   targetGroup: 'SCHOOL_CHILDREN',
 *   startDate: new Date('2025-01-15'),
 *   targetBeneficiaries: 150,
 *   feedingDays: 5,
 *   mealsPerDay: 1
 * }
 * ```
 */
export const createBeneficiaryEnrollmentSchema = z.object({
  // Core Relations (required)
  beneficiaryOrgId: z.string().cuid('Invalid organization ID'),
  programId: z.string().cuid('Invalid program ID'),
  
  // Enrollment Period (required)
  enrollmentDate: z.date().optional().default(() => new Date()),
  startDate: z.date(),
  endDate: z.date().optional().nullable(),
  
  // Target Group Configuration (CRITICAL - defines who receives meals)
  targetGroup: z.nativeEnum(TargetGroup, {
    message: 'Invalid target group'
  }),
  
  // Beneficiary Count (required - flexible terminology)
  targetBeneficiaries: z.number().int().min(1, 'Minimal 1 beneficiary'),
  activeBeneficiaries: z.number().int().min(0).optional().nullable(),
  
  // Age Groups (optional - applicable for multiple target groups)
  beneficiaries0to2Years: z.number().int().min(0).optional().nullable(),
  beneficiaries2to5Years: z.number().int().min(0).optional().nullable(),
  beneficiaries6to12Years: z.number().int().min(0).optional().nullable(),
  beneficiaries13to15Years: z.number().int().min(0).optional().nullable(),
  beneficiaries16to18Years: z.number().int().min(0).optional().nullable(),
  beneficiariesAbove18: z.number().int().min(0).optional().nullable(),
  
  // ✅ NEW: Target-Specific Data (flexible JSON field)
  // Different target groups have different breakdown requirements:
  // - PREGNANT_WOMAN: { firstTrimester, secondTrimester, thirdTrimester }
  // - BREASTFEEDING_MOTHER: { babyAge0to6Months, babyAge6to12Months, babyAge12to24Months }
  // - SCHOOL_CHILDREN: { elementaryStudents, juniorHighStudents, seniorHighStudents }
  // - TODDLER: { age0to2Years, age2to5Years }
  // - TEENAGE_GIRL: { age10to14, age15to19 }
  // - ELDERLY: { age60to69, age70to79, age80Plus }
  targetGroupSpecificData: z.record(z.string(), z.union([z.number(), z.string(), z.boolean()])).optional().nullable(),
  
  // Gender Breakdown (optional - applicable for all target groups)
  maleBeneficiaries: z.number().int().min(0).optional().nullable(),
  femaleBeneficiaries: z.number().int().min(0).optional().nullable(),
  
  // Feeding Configuration (optional but recommended)
  feedingDays: z.number().int().min(1).max(7).optional().nullable(),
  mealsPerDay: z.number().int().min(1).max(5).optional().nullable(),
  feedingTime: z.string().max(50).optional().nullable(),
  breakfastTime: z.string().max(10).optional().nullable(),
  lunchTime: z.string().max(10).optional().nullable(),
  snackTime: z.string().max(10).optional().nullable(),
  
  // Delivery Configuration (optional)
  deliveryAddress: z.string().optional().nullable(),
  deliveryContact: z.string().max(255).optional().nullable(),
  deliveryPhone: z.string().max(20).optional().nullable(),
  deliveryInstructions: z.string().optional().nullable(),
  preferredDeliveryTime: z.string().max(50).optional().nullable(),
  estimatedTravelTime: z.number().int().min(0).optional().nullable(),
  
  // Service Configuration (optional)
  storageCapacity: z.number().int().min(0).optional().nullable(),
  servingMethod: z.string().max(50).optional().nullable(),
  
  // Budget Tracking (optional - for government program monitoring)
  monthlyBudgetAllocation: z.number().min(0).optional().nullable(),
  budgetPerBeneficiary: z.number().min(0).optional().nullable(),
  
  // Performance Tracking (optional - system managed)
  totalMealsServed: z.number().int().min(0).optional().default(0),
  totalBeneficiariesServed: z.number().int().min(0).optional().default(0),
  averageAttendanceRate: z.number().min(0).max(100).optional().nullable(),
  lastDistributionDate: z.date().optional().nullable(),
  lastMonitoringDate: z.date().optional().nullable(),
  
  // Quality Metrics (optional)
  satisfactionScore: z.number().min(1).max(5).optional().nullable(),
  complaintCount: z.number().int().min(0).optional().default(0),
  nutritionComplianceRate: z.number().min(0).max(100).optional().nullable(),
  
  // Special Requirements (optional - type-specific)
  specialDietaryNeeds: z.string().optional().nullable(),
  allergenRestrictions: z.string().optional().nullable(),
  culturalPreferences: z.string().optional().nullable(),
  medicalConsiderations: z.string().optional().nullable(),
  
  // Program-Specific Configuration (optional)
  programFocus: z.string().max(100).optional().nullable(),
  supplementaryServices: z.string().optional().nullable(),
  
  // Status & Flags
  enrollmentStatus: z.nativeEnum(ProgramEnrollmentStatus).optional().default('ACTIVE'),
  isActive: z.boolean().optional().default(true),
  isPriority: z.boolean().optional().default(false),
  needsAssessment: z.boolean().optional().default(false),
  
  // Administrative
  enrolledBy: z.string().optional().nullable(),
  approvedBy: z.string().optional().nullable(),
  approvedAt: z.date().optional().nullable(),
  remarks: z.string().optional().nullable(),
  internalNotes: z.string().optional().nullable(),
})
.refine(
  (data) => {
    // Validate: activeBeneficiaries should not exceed targetBeneficiaries
    if (data.activeBeneficiaries && data.targetBeneficiaries) {
      return data.activeBeneficiaries <= data.targetBeneficiaries
    }
    return true
  },
  {
    message: 'Active beneficiaries cannot exceed target beneficiaries',
    path: ['activeBeneficiaries']
  }
)
.refine(
  (data) => {
    // Validate: gender breakdown should not exceed target beneficiaries
    if (data.maleBeneficiaries && data.femaleBeneficiaries && data.targetBeneficiaries) {
      const total = (data.maleBeneficiaries || 0) + (data.femaleBeneficiaries || 0)
      return total <= data.targetBeneficiaries
    }
    return true
  },
  {
    message: 'Male + Female beneficiaries cannot exceed target beneficiaries',
    path: ['maleBeneficiaries']
  }
)
.refine(
  (data) => {
    // Validate: age groups breakdown should not exceed target beneficiaries
    const ageGroupsTotal = (
      (data.beneficiaries0to2Years || 0) +
      (data.beneficiaries2to5Years || 0) +
      (data.beneficiaries6to12Years || 0) +
      (data.beneficiaries13to15Years || 0) +
      (data.beneficiaries16to18Years || 0) +
      (data.beneficiariesAbove18 || 0)
    )
    
    if (ageGroupsTotal > 0 && data.targetBeneficiaries) {
      return ageGroupsTotal <= data.targetBeneficiaries
    }
    return true
  },
  {
    message: 'Total age groups breakdown cannot exceed target beneficiaries',
    path: ['beneficiaries0to2Years']
  }
)

/**
 * Schema untuk update Program Beneficiary Enrollment
 * Semua field optional untuk partial update
 */
export const updateBeneficiaryEnrollmentSchema = createBeneficiaryEnrollmentSchema.partial()

/**
 * Schema untuk filter/search Beneficiary Enrollments
 */
export const beneficiaryEnrollmentFiltersSchema = z.object({
  programId: z.string().optional(),
  beneficiaryOrgId: z.string().optional(),
  targetGroup: z.nativeEnum(TargetGroup).optional(),
  enrollmentStatus: z.nativeEnum(ProgramEnrollmentStatus).optional(),
  isActive: z.boolean().optional(),
  isPriority: z.boolean().optional(),
  search: z.string().optional(), // Search in delivery address, contact, notes
})

/**
 * Type exports untuk use in other files
 */
export type CreateBeneficiaryEnrollmentInput = z.infer<typeof createBeneficiaryEnrollmentSchema>
export type UpdateBeneficiaryEnrollmentInput = z.infer<typeof updateBeneficiaryEnrollmentSchema>
export type BeneficiaryEnrollmentFilters = z.infer<typeof beneficiaryEnrollmentFiltersSchema>
