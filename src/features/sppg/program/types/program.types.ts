/**
 * @fileoverview TypeScript types untuk domain Program (Nutrition Program)
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * ✅ UPDATED: Now uses proper Prisma types for type safety
 */

import { ProgramType, TargetGroup, ProgramStatus, NutritionProgram } from '@prisma/client'

// Re-export Prisma enums for convenience
export { ProgramType, TargetGroup, ProgramStatus } from '@prisma/client'

/**
 * Base Program type - Import directly from Prisma for perfect alignment
 * ✅ This ensures 100% schema compliance
 */
export type Program = NutritionProgram

/**
 * Program dengan relasi SPPG info
 */
export interface ProgramWithSppg extends NutritionProgram {
  sppg: {
    id: string
    name: string
    code: string
  }
}

/**
 * Program dengan relasi Menus untuk production dropdown
 */
export interface ProgramWithMenus extends NutritionProgram {
  menus: {
    id: string
    menuName: string
    menuCode: string
    mealType: string
    servingSize: number
    batchSize: number | null
    costPerServing: number
    description: string | null
    preparationTime: number | null
    cookingTime: number | null
  }[]
}

/**
 * Program dengan relasi School Enrollments untuk detail view
 */
export interface ProgramWithEnrollments extends NutritionProgram {
  programEnrollments: {
    id: string
    status: string
    targetStudents: number
    activeStudents: number
    school: {
      id: string
      schoolName: string
      schoolCode: string | null
    }
  }[]
}

/**
 * Program dengan statistics (menu count, distribution count, dll)
 */
export interface ProgramWithStats extends NutritionProgram {
  _count: {
    menus: number
    menuPlans: number
    productions: number
    distributions: number
    schools: number
    feedback: number
  }
  // Computed fields
  daysRunning?: number
  completionPercentage?: number
  averageFeedback?: number
}

/**
 * Input untuk create program (sesuai form)
 * ✅ Uses Zod schema validation - see programSchema.ts
 * ✅ SIMPLIFIED (Nov 11, 2025): Unified multi-target approach
 */
export interface CreateProgramInput {
  name: string
  description?: string | null
  programCode: string
  programType: ProgramType
  
  // ✅ SIMPLIFIED: Always use array (1 item = single, 2+ = multi)
  allowedTargetGroups: TargetGroup[] // Minimum 1 required
  
  status: ProgramStatus
  
  // Nutrition targets (optional)
  calorieTarget?: number | null
  proteinTarget?: number | null
  carbTarget?: number | null
  fatTarget?: number | null
  fiberTarget?: number | null
  
  // Schedule
  startDate: Date
  endDate?: Date | null
  feedingDays: number[]
  mealsPerDay: number
  
  // Budget
  totalBudget?: number | null
  budgetPerMeal?: number | null
  targetRecipients: number
  currentRecipients?: number
  
  // Implementation
  implementationArea: string
  // partnerSchools removed - use programEnrollments relation instead
}

/**
 * Input untuk update program (partial)
 * ✅ SIMPLIFIED (Nov 11, 2025): Unified multi-target approach
 */
export interface UpdateProgramInput {
  name?: string
  description?: string | null
  programCode?: string
  programType?: ProgramType
  
  // ✅ SIMPLIFIED: Always use array
  allowedTargetGroups?: TargetGroup[]
  
  calorieTarget?: number | null
  proteinTarget?: number | null
  carbTarget?: number | null
  fatTarget?: number | null
  fiberTarget?: number | null
  
  startDate?: Date
  endDate?: Date | null
  feedingDays?: number[]
  mealsPerDay?: number
  
  totalBudget?: number | null
  budgetPerMeal?: number | null
  targetRecipients?: number
  currentRecipients?: number
  
  implementationArea?: string
  // partnerSchools removed - use programEnrollments relation instead
  
  status?: ProgramStatus
}

/**
 * Filter untuk query programs
 */
export interface ProgramFilters {
  status?: string
  programType?: string
  targetGroup?: string
  search?: string
  startDate?: Date
  endDate?: Date
}

/**
 * Program summary untuk cards/tables
 * ✅ SIMPLIFIED (Nov 11, 2025): Unified multi-target approach
 */
export interface ProgramSummary {
  id: string
  name: string
  programCode: string
  programType: ProgramType
  allowedTargetGroups: TargetGroup[] // Always array
  status: string
  startDate: Date
  endDate: Date | null
  targetRecipients: number
  currentRecipients: number
  totalBudget: number | null
  mealsPerDay: number
  daysRunning?: number
}

/**
 * API Response types
 */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  details?: Record<string, unknown>
}

export type ProgramResponse = ApiResponse<Program>
export type ProgramsResponse = ApiResponse<Program[]>
export type ProgramWithStatsResponse = ApiResponse<ProgramWithStats>

/**
 * Program Page Statistics
 * Used for stats cards on program list page
 */
export interface ProgramPageStatistics {
  total: number
  active: number
  completed: number
  draft: number
  paused: number
  cancelled: number
  archived: number
  activePercentage: number
  completedPercentage: number
  totalRecipients: number
  totalBudget: number
}
