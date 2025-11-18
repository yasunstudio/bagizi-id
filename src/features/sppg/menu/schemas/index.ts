/**
 * @fileoverview Menu domain Zod validation schemas
 * @version Next.js 15.5.4 / Zod / Enterprise-grade validation
 * @author Bagizi-ID Development Team
 * @see {@link /docs/domain-menu-workflow.md} Menu Domain Documentation
 */

import { z } from 'zod'
import { MealType, InventoryCategory, MenuDifficulty, CookingMethod, TargetGroup } from '@prisma/client'

// ================================ ENUM SCHEMAS ================================

export const mealTypeSchema = z.nativeEnum(MealType)
export const inventoryCategorySchema = z.nativeEnum(InventoryCategory)
export const difficultySchema = z.nativeEnum(MenuDifficulty)
export const cookingMethodSchema = z.nativeEnum(CookingMethod)
export const targetGroupSchema = z.nativeEnum(TargetGroup)

// ================================ CORE MENU SCHEMAS ================================

/**
 * Menu creation schema with comprehensive validation
 */
export const menuCreateSchema = z.object({
  programId: z.string().cuid('Program ID harus valid'),
  
  // Menu Details - Required fields
  menuName: z.string()
    .min(3, 'Nama menu minimal 3 karakter')
    .max(100, 'Nama menu maksimal 100 karakter')
    .regex(/^[a-zA-Z0-9\s\-\_\(\)]+$/, 'Nama menu mengandung karakter tidak valid'),
  
  menuCode: z.string()
    .min(2, 'Kode menu minimal 2 karakter')
    .max(20, 'Kode menu maksimal 20 karakter')
    .regex(/^[A-Z0-9\-\_]+$/, 'Kode menu harus huruf kapital, angka, atau tanda hubung'),
  
  description: z.string()
    .max(500, 'Deskripsi maksimal 500 karakter')
    .optional(),
  
  mealType: mealTypeSchema,
  
  servingSize: z.number()
    .min(50, 'Ukuran porsi minimal 50 gram')
    .max(1000, 'Ukuran porsi maksimal 1000 gram')
    .int('Ukuran porsi harus berupa bilangan bulat'),
  
  // Food Category - Optional
  foodCategoryId: z.string()
    .cuid('Food Category ID harus valid')
    .optional()
    .nullable(),
  
  // Cost Information - Optional during creation
  costPerServing: z.number()
    .min(0, 'Biaya per porsi tidak boleh negatif')
    .max(1000000, 'Biaya per porsi tidak realistis')
    .optional(),
  
  // Recipe Information
  cookingTime: z.number()
    .min(1, 'Waktu memasak minimal 1 menit')
    .max(480, 'Waktu memasak maksimal 8 jam')
    .int('Waktu memasak harus berupa bilangan bulat')
    .optional(),
  
  preparationTime: z.number()
    .min(1, 'Waktu persiapan minimal 1 menit')
    .max(240, 'Waktu persiapan maksimal 4 jam')
    .int('Waktu persiapan harus berupa bilangan bulat')
    .optional(),
  
  difficulty: difficultySchema.optional(),
  cookingMethod: cookingMethodSchema.optional(),
  
  batchSize: z.number()
    .min(1, 'Ukuran batch minimal 1 porsi')
    .max(1000, 'Ukuran batch maksimal 1000 porsi')
    .int('Ukuran batch harus berupa bilangan bulat')
    .optional(),
  
  budgetAllocation: z.number()
    .min(0, 'Alokasi anggaran tidak boleh negatif')
    .max(100000000, 'Alokasi anggaran terlalu besar')
    .optional(),
  
  // Allergen Information
  allergens: z.array(z.string())
    .max(10, 'Maksimal 10 alergen')
    .default([]),
  
  isHalal: z.boolean().default(true),
  isVegetarian: z.boolean().default(false),
  isVegan: z.boolean().default(false),
  
  // ✅ NEW (Nov 7, 2025): Target Group Compatibility
  // Empty array = universal menu (compatible with all target groups)
  // Filled array = menu only compatible with specified target groups
  compatibleTargetGroups: z.array(targetGroupSchema)
    .default([])
    .optional(),
  
  // ✅ NEW (Nov 7, 2025): Special Nutrients for Target-Specific Requirements
  // Optional but REQUIRED for certain target groups (validated in refinement)
  folicAcid: z.number()
    .min(0, 'Asam folat tidak boleh negatif')
    .max(10000, 'Nilai asam folat tidak realistis')
    .optional()
    .nullable(),
  
  iron: z.number()
    .min(0, 'Zat besi tidak boleh negatif')
    .max(1000, 'Nilai zat besi tidak realistis')
    .optional()
    .nullable(),
  
  calcium: z.number()
    .min(0, 'Kalsium tidak boleh negatif')
    .max(10000, 'Nilai kalsium tidak realistis')
    .optional()
    .nullable(),
  
  vitaminA: z.number()
    .min(0, 'Vitamin A tidak boleh negatif')
    .max(10000, 'Nilai vitamin A tidak realistis')
    .optional()
    .nullable(),
  
  vitaminC: z.number()
    .min(0, 'Vitamin C tidak boleh negatif')
    .max(10000, 'Nilai vitamin C tidak realistis')
    .optional()
    .nullable(),
  
  vitaminD: z.number()
    .min(0, 'Vitamin D tidak boleh negatif')
    .max(1000, 'Nilai vitamin D tidak realistis')
    .optional()
    .nullable(),
  
  // Status
  isActive: z.boolean().default(true)
})
.refine((data) => {
  // ✅ VALIDATION: Jika target PREGNANT_WOMAN, harus ada folicAcid, iron & calcium
  if (data.compatibleTargetGroups?.includes('PREGNANT_WOMAN')) {
    return data.folicAcid && data.iron && data.calcium
  }
  return true
}, {
  message: 'Menu untuk ibu hamil harus memiliki asam folat, zat besi, dan kalsium',
  path: ['compatibleTargetGroups']
})
.refine((data) => {
  // ✅ VALIDATION: Jika target TEENAGE_GIRL, harus ada iron minimum 15 mg
  if (data.compatibleTargetGroups?.includes('TEENAGE_GIRL')) {
    return data.iron && data.iron >= 15
  }
  return true
}, {
  message: 'Menu untuk remaja putri harus memiliki zat besi minimal 15 mg',
  path: ['iron']
})
.refine((data) => {
  // ✅ VALIDATION: Jika target ELDERLY, harus ada calcium & vitaminD
  if (data.compatibleTargetGroups?.includes('ELDERLY')) {
    return data.calcium && data.vitaminD
  }
  return true
}, {
  message: 'Menu untuk lansia harus memiliki kalsium dan vitamin D',
  path: ['compatibleTargetGroups']
})
.refine((data) => {
  // ✅ VALIDATION: Jika target TODDLER, harus ada vitaminA & vitaminD (anti-stunting)
  if (data.compatibleTargetGroups?.includes('TODDLER')) {
    return data.vitaminA && data.vitaminD
  }
  return true
}, {
  message: 'Menu untuk balita harus memiliki vitamin A dan vitamin D (anti-stunting)',
  path: ['compatibleTargetGroups']
})
.refine((data) => {
  // ✅ VALIDATION: Jika target BREASTFEEDING_MOTHER, harus ada vitaminA
  if (data.compatibleTargetGroups?.includes('BREASTFEEDING_MOTHER')) {
    return data.vitaminA
  }
  return true
}, {
  message: 'Menu untuk ibu menyusui harus memiliki vitamin A untuk produksi ASI',
  path: ['vitaminA']
})

/**
 * Menu update schema (partial validation)
 */
export const menuUpdateSchema = menuCreateSchema.partial().extend({
  id: z.string().cuid('ID menu harus valid')
})

/**
 * Menu query/filter schema
 */
export const menuFiltersSchema = z.object({
  search: z.string().max(100).optional(),
  mealType: mealTypeSchema.optional(),
  isActive: z.boolean().optional(),
  programId: z.string().cuid().optional(),
  hasNutritionCalc: z.boolean().optional(),
  hasCostCalc: z.boolean().optional(),
  meetsAKG: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['menuName', 'createdAt', 'costPerServing', 'mealType']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

// ================================ INGREDIENT SCHEMAS ================================

/**
 * Menu ingredient schema - Fix #1 Compatible
 * @note Fix #1: inventoryItemId REQUIRED, redundant fields removed
 */
export const menuIngredientSchema = z.object({
  menuId: z.string().cuid('Menu ID harus valid'),
  inventoryItemId: z.string().cuid('Inventory item ID harus valid'), // ✅ Fix #1: REQUIRED
  quantity: z.number()
    .min(0.01, 'Jumlah bahan minimal 0.01')
    .max(10000, 'Jumlah bahan terlalu besar'),
  preparationNotes: z.string()
    .max(500, 'Catatan persiapan maksimal 500 karakter')
    .optional().nullable(),
  isOptional: z.boolean().default(false),
  // ❌ Fix #1: REMOVED - ingredientName, unit, costPerUnit (use inventoryItem relation)
  
  substitutes: z.array(z.string().max(50))
    .max(5, 'Maksimal 5 bahan pengganti')
    .default([])
})

/**
 * Ingredient update schema
 */
export const ingredientUpdateSchema = menuIngredientSchema.partial().extend({
  id: z.string().cuid('ID bahan harus valid')
})

/**
 * Ingredient filters schema
 */
export const ingredientFiltersSchema = z.object({
  search: z.string().max(100).optional(),
  category: inventoryCategorySchema.optional(),
  isActive: z.boolean().optional(),
  hasNutrition: z.boolean().optional(),
  minStock: z.number().min(0).optional()
})

// ================================ RECIPE SCHEMAS ================================

/**
 * Recipe step schema
 */
export const recipeStepSchema = z.object({
  menuId: z.string().cuid('Menu ID harus valid'),
  
  stepNumber: z.number()
    .int('Nomor langkah harus bilangan bulat')
    .min(1, 'Nomor langkah minimal 1')
    .max(50, 'Nomor langkah maksimal 50'),
  
  title: z.string()
    .max(100, 'Judul langkah maksimal 100 karakter')
    .optional(),
  
  instruction: z.string()
    .min(10, 'Instruksi minimal 10 karakter')
    .max(1000, 'Instruksi maksimal 1000 karakter'),
  
  duration: z.number()
    .int('Durasi harus bilangan bulat')
    .min(1, 'Durasi minimal 1 menit')
    .max(480, 'Durasi maksimal 8 jam')
    .optional(),
  
  temperature: z.number()
    .min(0, 'Suhu tidak boleh negatif')
    .max(300, 'Suhu terlalu tinggi untuk memasak')
    .optional(),
  
  equipment: z.array(z.string().max(50))
    .max(10, 'Maksimal 10 peralatan')
    .default([]),
  
  qualityCheck: z.string()
    .max(200, 'Catatan quality check maksimal 200 karakter')
    .optional(),
  
  imageUrl: z.string()
    .url('URL gambar tidak valid')
    .max(500, 'URL gambar terlalu panjang')
    .optional(),
  
  videoUrl: z.string()
    .url('URL video tidak valid')
    .max(500, 'URL video terlalu panjang')
    .optional()
})

/**
 * Recipe step update schema
 */
export const recipeStepUpdateSchema = recipeStepSchema.partial().extend({
  id: z.string().cuid('ID langkah resep harus valid')
})

/**
 * Multiple recipe steps schema for batch operations
 */
export const recipeStepsSchema = z.object({
  menuId: z.string().cuid('Menu ID harus valid'),
  steps: z.array(recipeStepSchema.omit({ menuId: true }))
    .min(1, 'Minimal 1 langkah resep')
    .max(50, 'Maksimal 50 langkah resep')
    .refine(
      (steps) => {
        const stepNumbers = steps.map(step => step.stepNumber)
        const uniqueNumbers = new Set(stepNumbers)
        return uniqueNumbers.size === stepNumbers.length
      },
      'Nomor langkah tidak boleh duplikat'
    )
    .refine(
      (steps) => {
        const stepNumbers = steps.map(step => step.stepNumber).sort((a, b) => a - b)
        return stepNumbers.every((num, index) => num === index + 1)
      },
      'Nomor langkah harus berurutan mulai dari 1'
    )
})

// ================================ CALCULATION SCHEMAS ================================

/**
 * Nutrition calculation trigger schema
 */
export const nutritionCalculationSchema = z.object({
  menuId: z.string().cuid('Menu ID harus valid'),
  requirementId: z.string().cuid('Requirement ID harus valid').optional(),
  forceRecalculate: z.boolean().default(false)
})

// ================================ COST CALCULATION SCHEMAS ================================

/**
 * Ingredient breakdown item schema - Fix #1 Compatible
 * Used for cost calculation JSON breakdown
 * @note Fix #1: Now includes inventoryItemId, redundant fields for legacy support
 */
export const ingredientBreakdownItemSchema = z.object({
  inventoryItemId: z.string().cuid('Inventory item ID harus valid'),
  inventoryItemName: z.string().min(1, 'Nama bahan harus diisi'), // From inventoryItem
  quantity: z.number().min(0, 'Jumlah tidak boleh negatif').max(100000, 'Jumlah terlalu besar'),
  unit: z.string().min(1, 'Satuan harus diisi').max(20, 'Satuan terlalu panjang'),
  costPerUnit: z.number().min(0, 'Biaya per satuan tidak boleh negatif').max(10000000, 'Biaya terlalu tinggi'),
  totalCost: z.number().min(0, 'Total biaya tidak boleh negatif').max(100000000, 'Total biaya terlalu tinggi')
  // Note: unit, costPerUnit, totalCost kept for calculation purposes (not stored in MenuIngredient)
})

/**
 * Ingredient breakdown array schema (for MenuCostCalculation.ingredientBreakdown)
 */
export const ingredientBreakdownSchema = z.array(ingredientBreakdownItemSchema)
  .min(1, 'Minimal harus ada 1 bahan')
  .max(100, 'Maksimal 100 bahan per menu')

/**
 * Cost calculation trigger schema
 */
export const costCalculationSchema = z.object({
  menuId: z.string().cuid('Menu ID harus valid'),
  
  // Labor cost overrides
  laborCostPerHour: z.number()
    .min(0, 'Biaya tenaga kerja per jam tidak boleh negatif')
    .max(1000000, 'Biaya tenaga kerja per jam terlalu tinggi')
    .optional(),
  
  // Utility cost overrides
  gasCostOverride: z.number().min(0).optional(),
  electricityCostOverride: z.number().min(0).optional(),
  waterCostOverride: z.number().min(0).optional(),
  
  // Overhead settings
  overheadPercentage: z.number()
    .min(0, 'Persentase overhead tidak boleh negatif')
    .max(100, 'Persentase overhead maksimal 100%')
    .default(15),
  
  // Batch settings
  plannedPortions: z.number()
    .int('Jumlah porsi harus bilangan bulat')
    .min(1, 'Jumlah porsi minimal 1')
    .max(10000, 'Jumlah porsi terlalu besar')
    .optional(),
  
  forceRecalculate: z.boolean().default(false)
})

// ================================ BATCH OPERATION SCHEMAS ================================

/**
 * Batch menu operations schema
 */
export const batchMenuOperationSchema = z.object({
  operation: z.enum(['activate', 'deactivate', 'delete', 'recalculate']),
  menuIds: z.array(z.string().cuid())
    .min(1, 'Minimal 1 menu untuk operasi batch')
    .max(100, 'Maksimal 100 menu untuk operasi batch'),
  
  // Additional parameters for specific operations
  recalculationType: z.enum(['nutrition', 'cost', 'both']).optional(),
  confirmDeletion: z.boolean().default(false)
})

// ================================ API VALIDATION SCHEMAS ================================

/**
 * Menu ID parameter validation
 */
export const menuIdParamSchema = z.object({
  id: z.string().cuid('Menu ID tidak valid')
})

/**
 * Program ID parameter validation  
 */
export const programIdParamSchema = z.object({
  programId: z.string().cuid('Program ID tidak valid')
})

// ================================ EXPORT SCHEMAS ================================

// Input validation schemas
export type MenuCreateInput = z.infer<typeof menuCreateSchema>
export type MenuUpdateInput = z.infer<typeof menuUpdateSchema>
export type MenuFilters = z.infer<typeof menuFiltersSchema>

export type MenuIngredientInput = z.infer<typeof menuIngredientSchema>
export type IngredientUpdateInput = z.infer<typeof ingredientUpdateSchema>
export type IngredientFilters = z.infer<typeof ingredientFiltersSchema>

export type RecipeStepInput = z.infer<typeof recipeStepSchema>
export type RecipeStepUpdateInput = z.infer<typeof recipeStepUpdateSchema>
export type RecipeStepsInput = z.infer<typeof recipeStepsSchema>

export type IngredientBreakdownItem = z.infer<typeof ingredientBreakdownItemSchema>
export type IngredientBreakdown = z.infer<typeof ingredientBreakdownSchema>

export type NutritionCalculationInput = z.infer<typeof nutritionCalculationSchema>
export type CostCalculationInput = z.infer<typeof costCalculationSchema>

export type BatchMenuOperation = z.infer<typeof batchMenuOperationSchema>

// Parameter schemas
export type MenuIdParam = z.infer<typeof menuIdParamSchema>
export type ProgramIdParam = z.infer<typeof programIdParamSchema>