/**
 * @fileoverview Menu domain TypeScript types based on Prisma models
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/domain-menu-workflow.md} Menu Domain Documentation
 */

import type { MealType, InventoryCategory, MenuDifficulty, CookingMethod } from '@prisma/client'

// ================================ CORE MENU TYPES ================================

/**
 * Base Menu type matching NutritionMenu Prisma model
 */
export interface Menu {
  id: string
  programId: string
  
  // Menu Details
  menuName: string
  menuCode: string
  description?: string | null
  mealType: MealType
  foodCategoryId?: string | null // Food category classification
  servingSize: number // Porsi per orang (gram)
  
  // Cost Information
  costPerServing: number // Biaya per porsi (untuk perencanaan anggaran)
  
  // Recipe Information
  cookingTime?: number | null // Menit
  preparationTime?: number | null // Waktu persiapan dalam menit  
  difficulty?: MenuDifficulty | null // Tingkat kesulitan: EASY, MEDIUM, HARD
  cookingMethod?: CookingMethod | null // Metode memasak: STEAM, BOIL, FRY, BAKE, GRILL, ROAST, SAUTE, STIR_FRY
  batchSize?: number | null // Jumlah porsi per batch
  budgetAllocation?: number | null // Alokasi anggaran untuk menu ini
  
  // Allergen Information
  allergens: string[] // "GLUTEN", "DAIRY", "EGGS", "NUTS"
  isHalal: boolean
  isVegetarian: boolean
  isVegan: boolean // Tidak mengandung produk hewani sama sekali
  
  // Nutrition Compliance
  nutritionStandardCompliance: boolean // Apakah memenuhi standar AKG
  
  // Direct Nutrition Values (from NutritionMenu table)
  calories?: number | null
  protein?: number | null
  carbohydrates?: number | null
  fat?: number | null
  fiber?: number | null
  
  // Optional Relations (included when needed)
  nutritionCalc?: MenuNutritionCalculation | null
  costCalc?: MenuCostCalculation | null
  
  // Status
  isActive: boolean
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
}

/**
 * Menu with relations for detailed view
 */
export interface MenuWithDetails extends Menu {
  program: {
    id: string
    programName: string
    sppgId: string
  }
  ingredients: MenuIngredient[]
  recipeSteps: RecipeStep[]
  nutritionCalc?: MenuNutritionCalculation | null
  costCalc?: MenuCostCalculation | null
}

// ================================ INGREDIENT TYPES ================================

/**
 * Menu Ingredient type - Fix #1 Compatible
 * @note Fix #1: inventoryItemId REQUIRED, redundant fields removed
 */
export interface MenuIngredient {
  id: string
  menuId: string
  inventoryItemId: string // ✅ Fix #1: REQUIRED
  quantity: number
  preparationNotes?: string | null
  isOptional: boolean
  substitutes: string[] // Bahan pengganti
  // ❌ Fix #1: REMOVED - ingredientName, unit, costPerUnit, totalCost (use inventoryItem instead)
  
  // Relations
  inventoryItem: InventoryItem // ✅ Fix #1: REQUIRED relation
}

/**
 * Inventory Item type for ingredient selection
 */
export interface InventoryItem {
  id: string
  sppgId: string
  
  // Item Details
  itemName: string
  itemCode?: string | null
  brand?: string | null
  category: InventoryCategory
  unit: string
  
  // Stock Management
  currentStock: number
  minStock: number
  maxStock: number
  
  // Cost Information
  lastPrice?: number | null
  averagePrice?: number | null
  costPerUnit?: number | null
  
  // Nutrition Information (per 100g/100ml)
  calories?: number | null
  protein?: number | null
  carbohydrates?: number | null
  fat?: number | null
  fiber?: number | null
  
  // Status
  isActive: boolean
}

// ================================ RECIPE TYPES ================================

/**
 * Recipe Step type matching RecipeStep Prisma model
 */
export interface RecipeStep {
  id: string
  menuId: string
  
  // Step Details
  stepNumber: number
  title?: string | null // Judul langkah
  instruction: string
  duration?: number | null // Menit
  temperature?: number | null // Celsius
  
  // Equipment & Tools
  equipment: string[] // "WAJAN", "PANCI", "BLENDER"
  
  // Quality Control
  qualityCheck?: string | null // Hal yang harus diperiksa
  
  // Media
  imageUrl?: string | null // URL gambar langkah
  videoUrl?: string | null // URL video tutorial
}

// ================================ CALCULATION TYPES ================================

/**
 * Nutrition Calculation type matching MenuNutritionCalculation Prisma model
 */
export interface MenuNutritionCalculation {
  id: string
  menuId: string
  requirementId?: string | null
  
  // Calculated Nutritional Values (from ingredients)
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  totalFiber: number
  
  // Vitamins (calculated)
  totalVitaminA: number
  totalVitaminB1: number
  totalVitaminB2: number
  totalVitaminB3: number
  totalVitaminB6: number
  totalVitaminB12: number
  totalVitaminC: number
  totalVitaminD: number
  totalVitaminE: number
  totalVitaminK: number
  totalFolate: number
  
  // Minerals (calculated)
  totalCalcium: number
  totalPhosphorus: number
  totalIron: number
  totalZinc: number
  totalIodine: number
  totalSelenium: number
  totalMagnesium: number
  totalPotassium: number
  totalSodium: number
  
  // % Daily Value (compared to AKG)
  caloriesDV: number
  proteinDV: number
  carbsDV: number
  fatDV: number
  fiberDV: number
  
  // Adequacy Assessment
  meetsCalorieAKG: boolean
  meetsProteinAKG: boolean
  meetsAKG: boolean
  
  // Nutrient Analysis
  excessNutrients: string[]
  deficientNutrients: string[]
  adequateNutrients: string[]
  
  // Calculation Metadata
  calculatedAt: Date
  calculatedBy?: string | null
  calculationMethod: string
  
  createdAt: Date
  updatedAt: Date
}

/**
 * Cost Calculation type matching MenuCostCalculation Prisma model
 */
export interface MenuCostCalculation {
  id: string
  menuId: string
  
  // Ingredient Costs
  totalIngredientCost: number
  ingredientBreakdown?: Record<string, number> // JSON type for ingredient cost breakdown
  
  // Labor Costs
  laborCostPerHour: number
  preparationHours: number
  cookingHours: number
  totalLaborCost: number
  
  // Utility Costs
  gasCost: number
  electricityCost: number
  waterCost: number
  totalUtilityCost: number
  
  // Other Operational Costs
  packagingCost: number
  equipmentCost: number
  cleaningCost: number
  
  // Overhead Costs
  overheadPercentage: number
  overheadCost: number
  
  // Total Costs
  totalDirectCost: number
  totalIndirectCost: number
  grandTotalCost: number
  
  // Per Portion Calculations
  plannedPortions: number
  costPerPortion: number
  
  // Budget Planning (untuk perencanaan anggaran SPPG)
  budgetAllocation?: number | null
  
  // Cost Analysis
  ingredientCostRatio: number
  laborCostRatio: number
  overheadCostRatio: number
  
  // Cost Optimization Suggestions
  costOptimizations: string[]
  alternativeIngredients: string[]
  
  // Calculation Metadata
  calculatedAt: Date
  calculatedBy?: string | null
  calculationMethod: string
  isActive: boolean
  
  createdAt: Date
  updatedAt: Date
}

// ================================ INPUT/OUTPUT TYPES ================================

/**
 * Menu creation input type
 */
export interface MenuInput {
  programId: string
  menuName: string
  menuCode: string
  description?: string
  mealType: MealType
  servingSize: number
  
  // Cost Information (for budget planning only - SPPG social program)
  costPerServing?: number // Optional input - API defaults to meal-type standard if not provided
  budgetAllocation?: number
  
  // Recipe Information
  cookingTime?: number
  preparationTime?: number
  difficulty?: MenuDifficulty
  cookingMethod?: CookingMethod
  batchSize?: number
  
  // Allergen Information
  allergens?: string[]
  isHalal?: boolean
  isVegetarian?: boolean
  isVegan?: boolean
  
  isActive?: boolean
}

/**
 * Menu update input type (partial)
 */
export interface MenuUpdateInput extends Partial<MenuInput> {
  id: string
}

/**
 * Menu ingredient input type
 */
export interface MenuIngredientInput {
  menuId: string
  inventoryItemId?: string
  ingredientName: string
  quantity: number
  unit: string
  costPerUnit: number
  preparationNotes?: string
  isOptional?: boolean
  substitutes?: string[]
}

/**
 * Recipe step input type
 */
export interface RecipeStepInput {
  menuId: string
  stepNumber: number
  title?: string
  instruction: string
  duration?: number
  temperature?: number
  equipment?: string[]
  qualityCheck?: string
  imageUrl?: string
  videoUrl?: string
}

// ================================ API RESPONSE TYPES ================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  details?: Record<string, unknown>
}

/**
 * Menu list response with pagination
 */
export interface MenuListResponse {
  menus: Menu[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * Menu creation response
 */
export interface MenuCreateResponse {
  menu: Menu
  message: string
}

/**
 * Calculation response type
 */
export interface CalculationResponse {
  success: boolean
  nutritionCalculation?: MenuNutritionCalculation
  costCalculation?: MenuCostCalculation
  message?: string
}

// ================================ FILTER & SEARCH TYPES ================================

/**
 * Menu search and filter parameters
 */
export interface MenuFilters {
  search?: string
  mealType?: MealType
  isActive?: boolean
  programId?: string
  hasNutritionCalc?: boolean
  hasCostCalc?: boolean
  meetsAKG?: boolean
  page?: number
  limit?: number
  sortBy?: 'menuName' | 'createdAt' | 'costPerServing' | 'mealType'
  sortOrder?: 'asc' | 'desc'
}

/**
 * Ingredient search parameters
 */
export interface IngredientFilters {
  search?: string
  category?: InventoryCategory
  isActive?: boolean
  hasNutrition?: boolean
  minStock?: number
}

// ================================ VALIDATION ERROR TYPES ================================

/**
 * Form validation error type
 */
export interface ValidationError {
  field: string
  message: string
  code?: string
}

/**
 * Menu validation result
 */
export interface MenuValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings?: string[]
}

/**
 * Inventory Item with nutrition information (extended)
 */
export interface InventoryItemWithNutrition extends InventoryItem {
  // Enhanced nutrition data
  vitaminA?: number | null
  vitaminB1?: number | null
  vitaminB2?: number | null
  vitaminB3?: number | null
  vitaminB6?: number | null
  vitaminB12?: number | null
  vitaminC?: number | null
  vitaminD?: number | null
  vitaminE?: number | null
  vitaminK?: number | null
  folat?: number | null
  
  // Enhanced mineral data
  calcium?: number | null
  phosphorus?: number | null
  iron?: number | null
  zinc?: number | null
  iodine?: number | null
  selenium?: number | null
  magnesium?: number | null
  potassium?: number | null
  sodium?: number | null
}

/**
 * Menu create input (for API)
 */
export type MenuCreateInput = MenuInput

// ================================ EXPORT ALL TYPES ================================
// Types are already exported above with their declarations

// Re-export Prisma enums for convenience
export { MealType, InventoryCategory } from '@prisma/client'