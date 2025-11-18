/**
 * @fileoverview Recipe Steps API Client - Centralized Enterprise Pattern
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
 * const steps = await recipeStepsApi.getAll('menu-id')
 * 
 * // Server-side usage (RSC)
 * import { headers } from 'next/headers'
 * const steps = await recipeStepsApi.getAll('menu-id', headers())
 */

import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import type { ApiResponse } from '@/lib/api-utils'

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface RecipeStep {
  id: string
  menuId: string
  stepNumber: number
  title: string | null
  instruction: string
  duration: number | null
  temperature: number | null
  equipment: string[]
  qualityCheck: string | null
  imageUrl: string | null
  videoUrl: string | null
}

export interface RecipeStepCreateInput {
  stepNumber: number
  title?: string | null
  instruction: string
  duration?: number | null
  temperature?: number | null
  equipment?: string[]
  qualityCheck?: string | null
  imageUrl?: string | null
  videoUrl?: string | null
}

export interface RecipeStepUpdateInput {
  stepNumber?: number
  title?: string | null
  instruction?: string
  duration?: number | null
  temperature?: number | null
  equipment?: string[]
  qualityCheck?: string | null
  imageUrl?: string | null
  videoUrl?: string | null
}

export interface RecipeStepsListResponse {
  steps: RecipeStep[]
  total: number
  menuId: string
}

// ============================================
// API CLIENT
// ============================================

/**
 * Recipe Steps API client with enterprise patterns
 * All methods support SSR via optional headers parameter
 */
export const recipeStepsApi = {
  /**
   * Fetch all recipe steps for a menu
   * @param menuId - Menu ID to fetch steps for
   * @param headers - Optional headers for SSR
   * @returns Promise with recipe steps list
   */
  async getAll(
    menuId: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<RecipeStep[]>> {
    const baseUrl = getBaseUrl()
    const url = `${baseUrl}/api/sppg/menu/${menuId}/recipe-steps`

    const response = await fetch(url, getFetchOptions(headers))

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch recipe steps')
    }

    const result = await response.json()
    return {
      success: result.success,
      data: result.data
    }
  },

  /**
   * Create new recipe step
   * @param menuId - Menu ID to create step for
   * @param data - Recipe step creation data
   * @param headers - Optional headers for SSR
   */
  async create(
    menuId: string,
    data: RecipeStepCreateInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<RecipeStep>> {
    const baseUrl = getBaseUrl()
    const url = `${baseUrl}/api/sppg/menu/${menuId}/recipe-steps`

    const response = await fetch(url, {
      ...getFetchOptions(headers),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create recipe step')
    }

    return response.json()
  },

  /**
   * Update existing recipe step
   * @param menuId - Menu ID
   * @param stepId - Recipe step ID
   * @param data - Recipe step update data
   * @param headers - Optional headers for SSR
   */
  async update(
    menuId: string,
    stepId: string,
    data: RecipeStepUpdateInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<RecipeStep>> {
    const baseUrl = getBaseUrl()
    const url = `${baseUrl}/api/sppg/menu/${menuId}/recipe-steps/${stepId}`

    const response = await fetch(url, {
      ...getFetchOptions(headers),
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update recipe step')
    }

    return response.json()
  },

  /**
   * Delete recipe step
   * @param menuId - Menu ID
   * @param stepId - Recipe step ID
   * @param headers - Optional headers for SSR
   */
  async delete(
    menuId: string,
    stepId: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<void>> {
    const baseUrl = getBaseUrl()
    const url = `${baseUrl}/api/sppg/menu/${menuId}/recipe-steps/${stepId}`

    const response = await fetch(url, {
      ...getFetchOptions(headers),
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete recipe step')
    }

    return response.json()
  },

  /**
   * Reorder recipe steps (batch update step numbers)
   * @param menuId - Menu ID
   * @param stepOrders - Array of { stepId, newStepNumber }
   * @param headers - Optional headers for SSR
   */
  async reorder(
    menuId: string,
    stepOrders: Array<{ stepId: string; newStepNumber: number }>,
    headers?: HeadersInit
  ): Promise<ApiResponse<RecipeStep[]>> {
    // Update each step sequentially to avoid conflicts
    const updatedSteps: RecipeStep[] = []
    
    for (const { stepId, newStepNumber } of stepOrders) {
      const result = await this.update(
        menuId,
        stepId,
        { stepNumber: newStepNumber },
        headers
      )
      
      if (result.data) {
        updatedSteps.push(result.data)
      }
    }

    return {
      success: true,
      data: updatedSteps
    }
  }
}

// ============================================
// EXPORTS
// ============================================

export type {
  RecipeStep as RecipeStepType,
  RecipeStepCreateInput as RecipeStepCreate,
  RecipeStepUpdateInput as RecipeStepUpdate
}
