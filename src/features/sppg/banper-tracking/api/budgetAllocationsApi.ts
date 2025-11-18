/**
 * @fileoverview API client untuk Budget Allocations
 * @version Next.js 15.5.4 / Enterprise-Grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * CRITICAL: Menggunakan centralized API client pattern (Section 2a)
 * - Semua API calls melalui client ini (NEVER direct fetch)
 * - Support SSR dengan optional headers parameter
 * - Full TypeScript coverage dengan proper error handling
 */

import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import type { ApiResponse } from '@/lib/api-utils'
import type {
  ProgramBudgetAllocation,
  ProgramBudgetAllocationWithRelations,
  BudgetAllocationListItem,
} from '../types'
import type {
  ProgramBudgetAllocationCreateInput,
  ProgramBudgetAllocationUpdateInput,
} from '../lib/schemas'

/**
 * Budget Allocations API client dengan enterprise patterns
 * All methods support SSR via optional headers parameter
 * 
 * @example
 * ```typescript
 * // Client-side usage
 * const allocations = await budgetAllocationsApi.getAll()
 * 
 * // Server-side usage (SSR/RSC)
 * const allocations = await budgetAllocationsApi.getAll(headers())
 * ```
 */
export const budgetAllocationsApi = {
  /**
   * Fetch all budget allocations
   * Auto-filtered by sppgId pada server (multi-tenant security)
   * 
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing allocations array
   */
  async getAll(
    headers?: HeadersInit
  ): Promise<ApiResponse<BudgetAllocationListItem[]>> {
    const baseUrl = getBaseUrl()
    const url = `${baseUrl}/api/sppg/budget-allocations`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch budget allocations')
    }
    
    return response.json()
  },

  /**
   * Fetch budget allocations by program ID
   * 
   * @param programId - Program ID
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing allocations for specific program
   */
  async getByProgramId(
    programId: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<ProgramBudgetAllocation[]>> {
    const baseUrl = getBaseUrl()
    const url = `${baseUrl}/api/sppg/budget-allocations?programId=${programId}`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch program budget allocations')
    }
    
    return response.json()
  },

  /**
   * Fetch single budget allocation by ID
   * 
   * @param id - Allocation ID
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing allocation detail
   */
  async getById(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<ProgramBudgetAllocationWithRelations>> {
    const baseUrl = getBaseUrl()
    const url = `${baseUrl}/api/sppg/budget-allocations/${id}`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch budget allocation')
    }
    
    return response.json()
  },

  /**
   * Create new budget allocation
   * 
   * @param data - Allocation creation data
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing created allocation
   */
  async create(
    data: ProgramBudgetAllocationCreateInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<ProgramBudgetAllocation>> {
    const baseUrl = getBaseUrl()
    const url = `${baseUrl}/api/sppg/budget-allocations`
    
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
      throw new Error(error.error || 'Failed to create budget allocation')
    }
    
    return response.json()
  },

  /**
   * Update budget allocation
   * 
   * @param id - Allocation ID
   * @param data - Allocation update data
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing updated allocation
   */
  async update(
    id: string,
    data: ProgramBudgetAllocationUpdateInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<ProgramBudgetAllocation>> {
    const baseUrl = getBaseUrl()
    const url = `${baseUrl}/api/sppg/budget-allocations/${id}`
    
    const response = await fetch(url, {
      ...getFetchOptions(headers),
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update budget allocation')
    }
    
    return response.json()
  },

  /**
   * Delete budget allocation
   * 
   * @param id - Allocation ID
   * @param headers - Optional headers for SSR
   * @returns Promise with API response
   */
  async delete(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<void>> {
    const baseUrl = getBaseUrl()
    const url = `${baseUrl}/api/sppg/budget-allocations/${id}`
    
    const response = await fetch(url, {
      ...getFetchOptions(headers),
      method: 'DELETE',
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete budget allocation')
    }
    
    return response.json()
  },
}
