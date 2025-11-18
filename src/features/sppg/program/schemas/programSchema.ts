/**
 * @fileoverview Zod validation schemas untuk Program domain
 * @version Next.js 15.5.4 / Zod 3.x
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { z } from 'zod'
import { ProgramType, TargetGroup, ProgramStatus, BudgetSource } from '@prisma/client'

/**
 * Schema untuk create program
 * ✅ SIMPLIFIED (Nov 11, 2025): Unified multi-target approach
 */
export const createProgramSchema = z.object({
  name: z
    .string()
    .min(5, 'Nama program minimal 5 karakter')
    .max(200, 'Nama program maksimal 200 karakter'),
  
  programCode: z
    .string()
    .min(3, 'Kode program minimal 3 karakter')
    .max(50, 'Kode program maksimal 50 karakter')
    .regex(/^[A-Za-z0-9-_]+$/, 'Kode program hanya boleh berisi huruf, angka, tanda hubung, dan underscore'),
  
  description: z
    .string()
    .max(1000, 'Deskripsi maksimal 1000 karakter')
    .optional()
    .nullable(),
  
  programType: z.nativeEnum(ProgramType),
  
  // ✅ SIMPLIFIED: Always use array (1 item = single, 2+ = multi)
  allowedTargetGroups: z
    .array(z.nativeEnum(TargetGroup))
    .min(1, 'Minimal 1 target group harus dipilih')
    .max(6, 'Maksimal 6 target groups')
    .refine(
      (groups) => {
        // Check for duplicates
        const uniqueGroups = new Set(groups)
        return uniqueGroups.size === groups.length
      },
      { message: 'Tidak boleh ada duplikasi target group' }
    ),
  
  status: z.nativeEnum(ProgramStatus),
  
  // ❌ REMOVED (Phase 4 - Nov 8, 2025): Nutrition targets from NutritionStandard
  // calorieTarget, proteinTarget, carbTarget, fatTarget, fiberTarget
  // Use getProgramNutritionTargets() or getProgramNutritionSummary() instead
  
  // Schedule
  startDate: z.coerce.date(),
  
  endDate: z.coerce.date().optional().nullable(),
  
  feedingDays: z
    .array(z.number().min(0).max(6))
    .min(1, 'Minimal 1 hari pemberian makan')
    .max(7, 'Maksimal 7 hari pemberian makan')
    .refine(
      (days) => {
        // Check for duplicates
        const uniqueDays = new Set(days)
        return uniqueDays.size === days.length
      },
      { message: 'Hari pemberian makan tidak boleh duplikat' }
    ),
  
  mealsPerDay: z
    .number()
    .int('Jumlah makanan per hari harus bilangan bulat')
    .min(1, 'Minimal 1 makanan per hari')
    .max(5, 'Maksimal 5 makanan per hari'),
  
  // ✅ UPDATED (Nov 12, 2025): Budget fields now REQUIRED for government compliance
  totalBudget: z
    .number()
    .min(1000000, 'Total budget minimal Rp 1.000.000')
    .max(10000000000, 'Total budget maksimal Rp 10 miliar'),
  
  budgetPerMeal: z
    .number()
    .min(5000, 'Budget per makanan minimal Rp 5.000')
    .max(100000, 'Budget per makanan maksimal Rp 100.000'),
  
  // ✅ NEW (Nov 12, 2025): Government budget tracking fields
  budgetSource: z.nativeEnum(BudgetSource).default('APBN_PUSAT'),
  
  budgetYear: z
    .number()
    .int('Tahun anggaran harus bilangan bulat')
    .min(2024, 'Tahun anggaran minimal 2024')
    .max(2030, 'Tahun anggaran maksimal 2030'),
  
  dpaNumber: z
    .string()
    .max(100, 'Nomor DPA maksimal 100 karakter')
    .optional()
    .nullable(),
  
  dpaDate: z.coerce.date().optional().nullable(),
  
  apbnProgramCode: z
    .string()
    .max(50, 'Kode program APBN maksimal 50 karakter')
    .optional()
    .nullable(),
  
  // ✅ NEW: Budget decree (SK Penetapan Anggaran)
  budgetDecreeNumber: z
    .string()
    .max(100, 'Nomor SK maksimal 100 karakter')
    .optional()
    .nullable(),
  
  budgetDecreeDate: z.coerce.date().optional().nullable(),
  
  budgetDecreeUrl: z
    .string()
    .url('URL SK harus valid')
    .max(500, 'URL SK maksimal 500 karakter')
    .optional()
    .nullable(),
  
  // ✅ NEW: Budget breakdown (sesuai regulasi pemerintah)
  foodBudget: z
    .number()
    .min(0, 'Anggaran makanan tidak boleh negatif')
    .optional()
    .nullable(),
  
  operationalBudget: z
    .number()
    .min(0, 'Anggaran operasional tidak boleh negatif')
    .optional()
    .nullable(),
  
  transportBudget: z
    .number()
    .min(0, 'Anggaran transport tidak boleh negatif')
    .optional()
    .nullable(),
  
  utilityBudget: z
    .number()
    .min(0, 'Anggaran utilitas tidak boleh negatif')
    .optional()
    .nullable(),
  
  staffBudget: z
    .number()
    .min(0, 'Anggaran tenaga tidak boleh negatif')
    .optional()
    .nullable(),
  
  otherBudget: z
    .number()
    .min(0, 'Anggaran lain-lain tidak boleh negatif')
    .optional()
    .nullable(),
  
  // ✅ NEW: Approval & audit trail
  budgetApprovalNotes: z
    .string()
    .max(1000, 'Catatan persetujuan maksimal 1000 karakter')
    .optional()
    .nullable(),
  
  targetRecipients: z
    .number()
    .int('Target penerima harus bilangan bulat')
    .min(1, 'Target penerima minimal 1 orang')
    .max(100000, 'Target penerima maksimal 100.000 orang'),
  
  currentRecipients: z
    .number()
    .int('Jumlah penerima saat ini harus bilangan bulat')
    .min(0, 'Jumlah penerima tidak boleh negatif')
    .optional(),
  
  // Implementation
  implementationArea: z
    .string()
    .min(3, 'Area implementasi minimal 3 karakter')
    .max(200, 'Area implementasi maksimal 200 karakter'),
  
  // partnerSchools removed - use programEnrollments relation instead
}).refine(
  (data) => {
    // Validate endDate is after startDate
    if (data.endDate && data.startDate) {
      return data.endDate > data.startDate
    }
    return true
  },
  {
    message: 'Tanggal selesai harus setelah tanggal mulai',
    path: ['endDate']
  }
).refine(
  (data) => {
    // Validate currentRecipients <= targetRecipients
    if (data.currentRecipients !== undefined && data.targetRecipients) {
      return data.currentRecipients <= data.targetRecipients
    }
    return true
  },
  {
    message: 'Jumlah penerima saat ini tidak boleh melebihi target penerima',
    path: ['currentRecipients']
  }
).refine(
  (data) => {
    // ✅ NEW: Validate budget breakdown total matches totalBudget (if all breakdown provided)
    const hasBreakdown = data.foodBudget !== undefined && data.foodBudget !== null
    
    if (hasBreakdown) {
      const breakdownTotal = 
        (data.foodBudget || 0) +
        (data.operationalBudget || 0) +
        (data.transportBudget || 0) +
        (data.utilityBudget || 0) +
        (data.staffBudget || 0) +
        (data.otherBudget || 0)
      
      // Allow 1% tolerance for rounding
      const tolerance = data.totalBudget * 0.01
      const diff = Math.abs(breakdownTotal - data.totalBudget)
      
      return diff <= tolerance
    }
    return true
  },
  {
    message: 'Total breakdown anggaran harus sama dengan total anggaran (toleransi 1%)',
    path: ['foodBudget']
  }
)

/**
 * Schema untuk update program (partial)
 * ✅ SIMPLIFIED (Nov 11, 2025): Unified multi-target approach
 */
export const updateProgramSchema = z.object({
  name: z
    .string()
    .min(5, 'Nama program minimal 5 karakter')
    .max(200, 'Nama program maksimal 200 karakter')
    .optional(),
  
  programCode: z
    .string()
    .min(3, 'Kode program minimal 3 karakter')
    .max(50, 'Kode program maksimal 50 karakter')
    .regex(/^[A-Z0-9-]+$/, 'Kode program harus huruf besar, angka, dan tanda hubung')
    .optional(),
  
  description: z
    .string()
    .max(1000, 'Deskripsi maksimal 1000 karakter')
    .optional()
    .nullable(),
  
  programType: z
    .nativeEnum(ProgramType)
    .optional(),
  
  // ✅ SIMPLIFIED: Always use array
  allowedTargetGroups: z
    .array(z.nativeEnum(TargetGroup))
    .min(1, 'Minimal 1 target group harus dipilih')
    .max(6, 'Maksimal 6 target groups')
    .refine(
      (groups) => {
        const uniqueGroups = new Set(groups)
        return uniqueGroups.size === groups.length
      },
      { message: 'Tidak boleh ada duplikasi target group' }
    )
    .optional(),
  
  status: z
    .nativeEnum(ProgramStatus)
    .optional(),
  
  // ❌ REMOVED (Phase 4 - Nov 8, 2025): Nutrition targets from NutritionStandard
  // calorieTarget, proteinTarget, carbTarget, fatTarget, fiberTarget
  
  startDate: z.coerce.date().optional(),
  
  endDate: z.coerce.date().optional().nullable(),
  
  feedingDays: z
    .array(z.number().min(0).max(6))
    .min(1)
    .max(7)
    .optional(),
  
  mealsPerDay: z
    .number()
    .int()
    .min(1)
    .max(5)
    .optional(),
  
  // ✅ UPDATED (Nov 12, 2025): Budget fields
  totalBudget: z
    .number()
    .min(1000000, 'Total budget minimal Rp 1.000.000')
    .max(10000000000, 'Total budget maksimal Rp 10 miliar')
    .optional(),
  
  budgetPerMeal: z
    .number()
    .min(5000, 'Budget per makanan minimal Rp 5.000')
    .max(100000, 'Budget per makanan maksimal Rp 100.000')
    .optional(),
  
  // ✅ NEW (Nov 12, 2025): Government budget tracking fields
  budgetSource: z.nativeEnum(BudgetSource).optional(),
  
  budgetYear: z
    .number()
    .int()
    .min(2024)
    .max(2030)
    .optional(),
  
  dpaNumber: z.string().max(100).optional().nullable(),
  dpaDate: z.coerce.date().optional().nullable(),
  apbnProgramCode: z.string().max(50).optional().nullable(),
  
  budgetDecreeNumber: z.string().max(100).optional().nullable(),
  budgetDecreeDate: z.coerce.date().optional().nullable(),
  budgetDecreeUrl: z.string().url().max(500).optional().nullable(),
  
  // Budget breakdown
  foodBudget: z.number().min(0).optional().nullable(),
  operationalBudget: z.number().min(0).optional().nullable(),
  transportBudget: z.number().min(0).optional().nullable(),
  utilityBudget: z.number().min(0).optional().nullable(),
  staffBudget: z.number().min(0).optional().nullable(),
  otherBudget: z.number().min(0).optional().nullable(),
  
  budgetApprovalNotes: z.string().max(1000).optional().nullable(),
  
  targetRecipients: z
    .number()
    .int()
    .min(1)
    .max(100000)
    .optional(),
  
  currentRecipients: z
    .number()
    .int()
    .min(0)
    .optional(),
  
  implementationArea: z
    .string()
    .min(3)
    .max(200)
    .optional(),
  
  // partnerSchools removed - use programEnrollments relation instead
}).refine(
  (data) => {
    // Validate endDate is after startDate if both provided
    if (data.endDate && data.startDate) {
      return data.endDate > data.startDate
    }
    return true
  },
  {
    message: 'Tanggal selesai harus setelah tanggal mulai',
    path: ['endDate']
  }
)

/**
 * Schema untuk filter programs
 */
export const programFiltersSchema = z.object({
  search: z.string().optional(),
  type: z.nativeEnum(ProgramType).optional(),
  targetGroup: z.nativeEnum(TargetGroup).optional(),
  status: z.nativeEnum(ProgramStatus).optional(),
  startDateFrom: z.string().optional(),
  startDateTo: z.string().optional(),
  endDateFrom: z.string().optional(),
  endDateTo: z.string().optional()
})

/**
 * Type inference dari schemas
 */
export type CreateProgramInput = z.infer<typeof createProgramSchema>
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>
export type ProgramFilters = z.infer<typeof programFiltersSchema>
