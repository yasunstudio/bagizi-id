/**
 * @fileoverview Menu domain client-side API functions
 * @version Next.js 15.5.4 / Enterprise-grade API client
 * @author Bagizi-ID Development Team
 * @see {@link /docs/domain-menu-workflow.md} Menu Domain Documentation
 */

import { getBaseUrl } from '@/lib/api-utils'
import type {
  Menu,
  MenuWithDetails,
  MenuIngredient,
  MenuUpdateInput,
  MenuCreateInput,
  MenuIngredientInput,
  MenuFilters,
  ApiResponse,
  MenuListResponse,
  MenuCreateResponse
} from '../types'

// Export Food Categories API
export * from './foodCategoriesApi'

// ================================ API BASE CONFIGURATION ================================

/**
 * Get API base URL for menu endpoints
 * Uses getBaseUrl() for SSR compatibility
 */
const getMenuApiBase = () => `${getBaseUrl()}/api/sppg/menu`

/**
 * Handle API responses with consistent error handling
 */
async function handleApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.error || `API Error: ${response.status}`)
  }
  
  return data
}

/**
 * Build query string from filters
 */
function buildQueryString(filters?: Partial<MenuFilters>): string {
  if (!filters) return ''
  
  const params = new URLSearchParams()
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value))
    }
  })
  
  return params.toString() ? `?${params.toString()}` : ''
}

// ================================ MENU CRUD OPERATIONS ================================

export const menuApi = {
  /**
   * Fetch menus with optional filtering and pagination
   */
  async getMenus(filters?: Partial<MenuFilters>): Promise<ApiResponse<MenuListResponse>> {
    const queryString = buildQueryString(filters)
    const response = await fetch(`${getMenuApiBase()}${queryString}`)
    return handleApiResponse<MenuListResponse>(response)
  },

  /**
   * Get detailed menu by ID
   */
  async getMenuById(id: string): Promise<ApiResponse<MenuWithDetails>> {
    const response = await fetch(`${getMenuApiBase()}/${id}`)
    return handleApiResponse<MenuWithDetails>(response)
  },

  /**
   * Create new menu
   */
  async createMenu(data: MenuCreateInput): Promise<ApiResponse<MenuCreateResponse>> {
    const response = await fetch(getMenuApiBase(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    return handleApiResponse<MenuCreateResponse>(response)
  },

  /**
   * Update existing menu
   */
  async updateMenu(id: string, data: Partial<MenuUpdateInput>): Promise<ApiResponse<Menu>> {
    const response = await fetch(`${getMenuApiBase()}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    return handleApiResponse<Menu>(response)
  },

  /**
   * Delete menu
   */
  async deleteMenu(id: string): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${getMenuApiBase()}/${id}`, {
      method: 'DELETE',
    })
    return handleApiResponse<{ message: string }>(response)
  },

  /**
   * Duplicate menu with optional data copying
   */
  async duplicateMenu(
    menuId: string,
    input: {
      newMenuName: string
      newMenuCode: string
      programId?: string
      copyIngredients?: boolean
      copyRecipeSteps?: boolean
      copyNutritionData?: boolean
      copyCostData?: boolean
    }
  ): Promise<ApiResponse<{
    id: string
    menuName: string
    menuCode: string
  }>> {
    const response = await fetch(`${getMenuApiBase()}/${menuId}/duplicate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })
    return handleApiResponse<{
      id: string
      menuName: string
      menuCode: string
    }>(response)
  },

  /**
   * Batch operations on multiple menus
   */
  async batchOperation(operation: 'activate' | 'deactivate' | 'delete', menuIds: string[]): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${getMenuApiBase()}/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ operation, menuIds }),
    })
    return handleApiResponse<{ message: string }>(response)
  }
}

// ================================ MENU INGREDIENT OPERATIONS ================================

export const menuIngredientApi = {
  /**
   * Get ingredients for a specific menu
   */
  async getIngredients(menuId: string): Promise<ApiResponse<{
    ingredients: MenuIngredient[]
    summary: {
      totalIngredients: number
      totalCost: number
      hasStockIssues: boolean
      stockWarnings: Array<{
        ingredientId: string
        ingredientName: string
        required: number
        available: number
        shortage: number
      }>
    }
  }>> {
    const response = await fetch(`${getMenuApiBase()}/${menuId}/ingredients`)
    return handleApiResponse(response)
  },

  /**
   * Add ingredient to menu
   */
  async addIngredient(menuId: string, data: Omit<MenuIngredientInput, 'menuId'>): Promise<ApiResponse<{
    ingredient: MenuIngredient
    message: string
    calculationTriggered: boolean
  }>> {
    const response = await fetch(`${getMenuApiBase()}/${menuId}/ingredients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    return handleApiResponse(response)
  },

  /**
   * Update ingredient
   */
  async updateIngredient(ingredientId: string, data: Partial<MenuIngredientInput>): Promise<ApiResponse<MenuIngredient>> {
    const response = await fetch(`${getBaseUrl()}/api/sppg/menu/ingredients/${ingredientId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    return handleApiResponse<MenuIngredient>(response)
  },

  /**
   * Remove ingredient from menu
   */
  async removeIngredient(ingredientId: string): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${getBaseUrl()}/api/sppg/menu/ingredients/${ingredientId}`, {
      method: 'DELETE',
    })
    return handleApiResponse<{ message: string }>(response)
  }
}

// ================================ CALCULATION OPERATIONS ================================

export const menuCalculationApi = {
  /**
   * Trigger nutrition calculation for menu
   */
  async calculateNutrition(menuId: string, forceRecalculate = false): Promise<ApiResponse<{
    nutritionCalculation: Record<string, unknown>
    message: string
  }>> {
    const response = await fetch(`${getMenuApiBase()}/${menuId}/calculate-nutrition`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ forceRecalculate }),
    })
    return handleApiResponse(response)
  },

  /**
   * Trigger cost calculation for menu
   */
  async calculateCost(menuId: string, options?: {
    laborCostPerHour?: number
    overheadPercentage?: number
    plannedPortions?: number
    forceRecalculate?: boolean
  }): Promise<ApiResponse<{
    costCalculation: Record<string, unknown>
    message: string
  }>> {
    const response = await fetch(`${getMenuApiBase()}/${menuId}/calculate-cost`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options || {}),
    })
    return handleApiResponse(response)
  },

  /**
   * Get nutrition calculation for menu
   */
  async getNutritionCalculation(menuId: string): Promise<ApiResponse<Record<string, unknown>>> {
    const response = await fetch(`${getMenuApiBase()}/${menuId}/nutrition-calculation`)
    return handleApiResponse(response)
  },

  /**
   * Get cost calculation for menu
   */
  async getCostCalculation(menuId: string): Promise<ApiResponse<Record<string, unknown>>> {
    const response = await fetch(`${getMenuApiBase()}/${menuId}/cost-calculation`)
    return handleApiResponse(response)
  },

  /**
   * Get compliance report for menu
   */
  async getComplianceReport(menuId: string): Promise<ApiResponse<{
    meetsAKG: boolean
    deficientNutrients: string[]
    excessNutrients: string[]
    recommendations: string[]
    akgComparison: Record<string, {
      current: number
      required: number
      percentage: number
      status: 'adequate' | 'deficient' | 'excess'
    }>
  }>> {
    const response = await fetch(`${getMenuApiBase()}/${menuId}/compliance-report`)
    return handleApiResponse(response)
  }
}

// ================================ RECIPE OPERATIONS ================================

export const recipeApi = {
  /**
   * Get recipe steps for menu
   */
  async getRecipeSteps(menuId: string): Promise<ApiResponse<Array<Record<string, unknown>>>> {
    const response = await fetch(`${getMenuApiBase()}/${menuId}/recipe`)
    return handleApiResponse(response)
  },

  /**
   * Update recipe steps for menu
   */
  async updateRecipeSteps(menuId: string, steps: Array<Record<string, unknown>>): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${getMenuApiBase()}/${menuId}/recipe`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ steps }),
    })
    return handleApiResponse(response)
  }
}

// ================================ INVENTORY INTEGRATION ================================

export const inventoryIntegrationApi = {
  /**
   * Search available inventory items for ingredient selection
   */
  async searchInventoryItems(query: {
    search?: string
    category?: string
    hasNutrition?: boolean
    page?: number
    limit?: number
  }): Promise<ApiResponse<{
    items: Array<Record<string, unknown>>
    total: number
    page: number
    totalPages: number
  }>> {
    const queryString = buildQueryString(query)
    const response = await fetch(`${getBaseUrl()}/api/sppg/inventory/items${queryString}`)
    return handleApiResponse(response)
  },

  /**
   * Get inventory item details with nutrition data
   */
  async getInventoryItemDetails(itemId: string): Promise<ApiResponse<Record<string, unknown>>> {
    const response = await fetch(`${getBaseUrl()}/api/sppg/inventory/items/${itemId}`)
    return handleApiResponse(response)
  }
}

// ================================ EXPORT ALL API FUNCTIONS ================================

// Export allergens API
export * from './allergensApi'

// Export menu actions API
export * from './menuActionsApi'

// Export menu plans API
export * from './menuPlansApi'

// Export recipe steps API
export * from './recipeStepsApi'

// Export default for convenience
const menuDomainApi = {
  menu: menuApi,
  ingredient: menuIngredientApi,
  calculation: menuCalculationApi,
  recipe: recipeApi,
  inventory: inventoryIntegrationApi
}

export default menuDomainApi
