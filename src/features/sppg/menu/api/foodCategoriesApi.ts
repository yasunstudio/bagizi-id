/**
 * @fileoverview FoodCategory API Client - Centralized Enterprise Pattern
 * @version Next.js 15.5.4 / Enterprise-Grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md#api-client-pattern} API Client Standards
 * @see {@link /docs/MENU_MODULE_COMPLETE_AUDIT.md} Menu Module Implementation
 * 
 * CRITICAL: Follow enterprise API client pattern
 * - SSR Support: All methods accept optional headers parameter
 * - Centralized: No direct fetch() in hooks/components
 * - Type Safe: Full TypeScript coverage with Prisma types
 * - Error Handling: Consistent error responses
 * 
 * @example
 * // Client-side usage
 * const categories = await foodCategoriesApi.getAll()
 * 
 * // Server-side usage (RSC)
 * import { headers } from 'next/headers'
 * const categories = await foodCategoriesApi.getAll({}, headers())
 */

import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import type { ApiResponse } from '@/lib/api-utils'

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface FoodCategory {
  id: string
  categoryCode: string
  categoryName: string
  categoryNameEn: string | null
  description: string | null
  parentId: string | null
  primaryNutrient: string | null
  servingSizeGram: number | null
  dailyServings: number | null
  colorCode: string | null
  iconName: string | null
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  parent?: {
    id: string
    categoryCode: string
    categoryName: string
    categoryNameEn: string | null
  } | null
  children?: Array<{
    id: string
    categoryCode: string
    categoryName: string
    categoryNameEn: string | null
    colorCode: string | null
    iconName: string | null
    sortOrder: number
  }>
  _count?: {
    children: number
    inventoryItems: number
    nutritionMenus: number
  }
}

export interface FoodCategoryQueryParams {
  parentId?: string | null
  isActive?: boolean
  includeChildren?: boolean
  search?: string
}

export interface FoodCategoryCreateInput {
  categoryCode: string
  categoryName: string
  categoryNameEn?: string
  description?: string
  parentId?: string
  primaryNutrient?: string
  servingSizeGram?: number
  dailyServings?: number
  colorCode?: string
  iconName?: string
  sortOrder?: number
  isActive?: boolean
}

export interface FoodCategoryUpdateInput {
  categoryCode?: string
  categoryName?: string
  categoryNameEn?: string
  description?: string
  parentId?: string | null
  primaryNutrient?: string
  servingSizeGram?: number
  dailyServings?: number
  colorCode?: string
  iconName?: string
  sortOrder?: number
  isActive?: boolean
}

export interface FoodCategoryListResponse {
  categories: FoodCategory[]
  total: number
  isHierarchical: boolean
}

// ============================================
// API CLIENT
// ============================================

/**
 * FoodCategory API Client with enterprise patterns
 * All methods support SSR via optional headers parameter
 */
export const foodCategoriesApi = {
  /**
   * Fetch all food categories with optional filtering
   * @param filters - Optional filter parameters
   * @param headers - Optional headers for SSR
   * @returns Promise with API response
   * 
   * @example
   * // Get root categories only
   * const { data } = await foodCategoriesApi.getAll({ parentId: null })
   * 
   * // Get children of specific category
   * const { data } = await foodCategoriesApi.getAll({ parentId: 'category-id' })
   * 
   * // Search categories
   * const { data } = await foodCategoriesApi.getAll({ search: 'protein' })
   */
  async getAll(
    filters?: FoodCategoryQueryParams,
    headers?: HeadersInit
  ): Promise<ApiResponse<FoodCategoryListResponse>> {
    const baseUrl = getBaseUrl()
    
    // Build query string
    const params = new URLSearchParams()
    if (filters?.parentId === null) {
      params.append('parentId', 'null') // Root categories
    } else if (filters?.parentId) {
      params.append('parentId', filters.parentId)
    }
    if (filters?.isActive !== undefined) {
      params.append('isActive', String(filters.isActive))
    }
    if (filters?.includeChildren !== undefined) {
      params.append('includeChildren', String(filters.includeChildren))
    }
    if (filters?.search) {
      params.append('search', filters.search)
    }
    
    const queryString = params.toString()
    const url = queryString 
      ? `${baseUrl}/api/sppg/food-categories?${queryString}`
      : `${baseUrl}/api/sppg/food-categories`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch food categories')
    }
    
    return response.json()
  },

  /**
   * Get single food category by ID
   * @param id - Category ID
   * @param headers - Optional headers for SSR
   */
  async getById(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<FoodCategory>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/food-categories/${id}`,
      getFetchOptions(headers)
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch food category')
    }
    
    return response.json()
  },

  /**
   * Create new food category
   * @param data - Category creation data
   * @param headers - Optional headers for SSR
   * @rbac Requires PLATFORM_SUPERADMIN role
   */
  async create(
    data: FoodCategoryCreateInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<FoodCategory>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/food-categories`, {
      ...getFetchOptions(headers),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(headers as Record<string, string>),
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create food category')
    }
    
    return response.json()
  },

  /**
   * Update existing food category
   * @param id - Category ID
   * @param data - Category update data
   * @param headers - Optional headers for SSR
   * @rbac Requires PLATFORM_SUPERADMIN role
   */
  async update(
    id: string,
    data: FoodCategoryUpdateInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<FoodCategory>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/food-categories/${id}`, {
      ...getFetchOptions(headers),
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(headers as Record<string, string>),
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update food category')
    }
    
    return response.json()
  },

  /**
   * Delete food category (soft delete)
   * @param id - Category ID
   * @param headers - Optional headers for SSR
   * @rbac Requires PLATFORM_SUPERADMIN role
   */
  async delete(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<void>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/food-categories/${id}`, {
      ...getFetchOptions(headers),
      method: 'DELETE',
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete food category')
    }
    
    return response.json()
  },

  /**
   * Get hierarchical category tree
   * Helper method to fetch and build complete hierarchy
   * @param headers - Optional headers for SSR
   */
  async getHierarchy(
    headers?: HeadersInit
  ): Promise<ApiResponse<FoodCategory[]>> {
    const result = await this.getAll(
      {
        parentId: null, // Root categories only
        isActive: true,
        includeChildren: true,
      },
      headers
    )
    
    return {
      success: result.success,
      data: result.data?.categories || [],
    }
  },
}

// Export types for use in other files
export type { ApiResponse }
