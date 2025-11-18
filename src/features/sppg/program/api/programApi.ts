/**
 * @fileoverview API client untuk Program domain
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
  Program,
  ProgramWithStats,
  CreateProgramInput,
  UpdateProgramInput,
  ProgramFilters
} from '../types'

/**
 * Program API client dengan enterprise patterns
 * All methods support SSR via optional headers parameter
 * 
 * @example
 * ```typescript
 * // Client-side usage
 * const programs = await programApi.getAll()
 * 
 * // Server-side usage (SSR/RSC)
 * const programs = await programApi.getAll(undefined, headers())
 * ```
 */
export const programApi = {
  /**
   * Fetch all programs dengan optional filtering
   * Auto-filtered by sppgId pada server (multi-tenant security)
   * 
   * @param filters - Optional filter parameters
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing programs array
   * 
   * @example
   * ```typescript
   * // Fetch all active programs
   * const result = await programApi.getAll({ status: 'ACTIVE' })
   * 
   * // Fetch by program type
   * const result = await programApi.getAll({ programType: 'FREE_NUTRITIOUS_MEAL' })
   * ```
   */
  async getAll(
    filters?: ProgramFilters,
    headers?: HeadersInit
  ): Promise<ApiResponse<Program[]>> {
    const baseUrl = getBaseUrl()
    
    // Build query string if filters provided
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.programType) params.append('programType', filters.programType)
    if (filters?.targetGroup) params.append('targetGroup', filters.targetGroup)
    if (filters?.search) params.append('search', filters.search)
    if (filters?.startDate) params.append('startDate', filters.startDate.toString())
    if (filters?.endDate) params.append('endDate', filters.endDate.toString())
    
    const queryString = params.toString()
    const url = queryString 
      ? `${baseUrl}/api/sppg/program?${queryString}`
      : `${baseUrl}/api/sppg/program`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch programs')
    }
    
    return response.json()
  },

  /**
   * Fetch single program by ID
   * 
   * @param id - Program ID
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing program
   * 
   * @example
   * ```typescript
   * const result = await programApi.getById('clu123abc')
   * if (result.success && result.data) {
   *   console.log('Program:', result.data.name)
   * }
   * ```
   */
  async getById(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<Program>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/program/${id}`,
      getFetchOptions(headers)
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch program')
    }
    
    return response.json()
  },

  /**
   * Fetch program dengan statistics (menu count, distribution count, dll)
   * 
   * @param id - Program ID
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing program with stats
   * 
   * @example
   * ```typescript
   * const result = await programApi.getWithStats('clu123abc')
   * if (result.success && result.data) {
   *   console.log('Menus:', result.data._count.menus)
   *   console.log('Distributions:', result.data._count.distributions)
   * }
   * ```
   */
  async getWithStats(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<ProgramWithStats>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/program/${id}?includeStats=true`,
      getFetchOptions(headers)
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch program with stats')
    }
    
    return response.json()
  },

  /**
   * Create new program
   * programCode will be auto-generated on server
   * sppgId will be auto-populated from session
   * 
   * @param data - Program creation data
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing created program
   * 
   * @example
   * ```typescript
   * const result = await programApi.create({
   *   name: 'Program Makan Bergizi Gratis SD',
   *   programType: 'FREE_NUTRITIOUS_MEAL',
   *   allowedTargetGroups: ['SCHOOL_CHILDREN'],
   *   startDate: new Date('2025-01-01'),
   *   feedingDays: [1, 2, 3, 4, 5], // Monday-Friday
   *   mealsPerDay: 1,
   *   targetRecipients: 500,
   *   implementationArea: 'Jakarta Pusat',
   *   partnerSchools: ['SD 01', 'SD 02']
   * })
   * ```
   */
  async create(
    data: CreateProgramInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<Program>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/program`, {
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
      throw new Error(error.error || 'Failed to create program')
    }
    
    return response.json()
  },

  /**
   * Update existing program
   * Only fields provided will be updated (partial update)
   * 
   * @param id - Program ID
   * @param data - Partial program update data
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing updated program
   * 
   * @example
   * ```typescript
   * const result = await programApi.update('clu123abc', {
   *   targetRecipients: 600,
   *   partnerSchools: ['SD 01', 'SD 02', 'SD 03']
   * })
   * ```
   */
  async update(
    id: string,
    data: UpdateProgramInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<Program>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/program/${id}`, {
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
      throw new Error(error.error || 'Failed to update program')
    }
    
    return response.json()
  },

  /**
   * Delete program
   * Cascade delete will remove related: menus, menu plans, productions, distributions
   * 
   * @param id - Program ID
   * @param headers - Optional headers for SSR
   * @returns Promise with API response
   * 
   * @example
   * ```typescript
   * await programApi.delete('clu123abc')
   * ```
   */
  async delete(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<void>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/program/${id}`, {
      ...getFetchOptions(headers),
      method: 'DELETE',
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete program')
    }
    
    return response.json()
  },

  /**
   * Update program status (ACTIVE, INACTIVE, COMPLETED, ARCHIVED)
   * 
   * @param id - Program ID
   * @param status - New status
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing updated program
   * 
   * @example
   * ```typescript
   * await programApi.updateStatus('clu123abc', 'COMPLETED')
   * ```
   */
  async updateStatus(
    id: string,
    status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'DRAFT' | 'ARCHIVED' | 'CANCELLED',
    headers?: HeadersInit
  ): Promise<ApiResponse<Program>> {
    return this.update(id, { status }, headers)
  },

  /**
   * Get program summary statistics
   * Returns aggregated data untuk dashboard
   * 
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing summary stats
   * 
   * @example
   * ```typescript
   * const result = await programApi.getSummary()
   * // Returns: { totalPrograms, activePrograms, totalRecipients, totalBudget }
   * ```
   */
  async getSummary(
    headers?: HeadersInit
  ): Promise<ApiResponse<{
    totalPrograms: number
    activePrograms: number
    inactivePrograms: number
    completedPrograms: number
    totalRecipients: number
    totalBudget: number
  }>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/program/summary`,
      getFetchOptions(headers)
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch program summary')
    }
    
    return response.json()
  }
}
