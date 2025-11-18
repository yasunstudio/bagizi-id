/**
 * @fileoverview Position API Client
 * Centralized API client for Position management with enterprise patterns
 * @version Next.js 15.5.4 / Auth.js v5
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} API Client Development Guidelines
 */

import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import type {
  PositionInput,
  PositionUpdate,
  PositionFilters,
  PositionListResponse,
  PositionDetailResponse,
  PositionCreateResponse,
  PositionUpdateResponse,
  PositionDeleteResponse,
  PositionByDepartmentResponse,
} from '../types/position.types'

/**
 * Position API client with enterprise patterns
 * All methods support SSR via optional headers parameter
 * 
 * @example
 * ```typescript
 * // Client-side usage
 * const positions = await positionApi.getAll()
 * 
 * // Server-side usage (SSR/RSC)
 * const positions = await positionApi.getAll(undefined, headers())
 * ```
 */
export const positionApi = {
  /**
   * Fetch all positions with optional filtering
   * 
   * @param filters - Optional filter parameters
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing positions array
   * 
   * @example
   * ```typescript
   * // Fetch all positions
   * const result = await positionApi.getAll()
   * 
   * // With filters
   * const result = await positionApi.getAll({
   *   search: 'Manager',
   *   departmentId: 'clxxx123',
   *   level: 'MANAGER',
   *   isActive: true
   * })
   * ```
   */
  async getAll(
    filters?: PositionFilters,
    headers?: HeadersInit
  ): Promise<PositionListResponse> {
    const baseUrl = getBaseUrl()
    
    // Build query string if filters provided
    const params = new URLSearchParams()
    if (filters?.search) params.append('search', filters.search)
    if (filters?.departmentId) params.append('departmentId', filters.departmentId)
    if (filters?.level) params.append('level', filters.level)
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive))
    if (filters?.minSalaryRange !== undefined) params.append('minSalaryRange', String(filters.minSalaryRange))
    if (filters?.maxSalaryRange !== undefined) params.append('maxSalaryRange', String(filters.maxSalaryRange))
    
    const queryString = params.toString()
    const url = queryString 
      ? `${baseUrl}/api/sppg/positions?${queryString}`
      : `${baseUrl}/api/sppg/positions`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: `Failed to fetch positions: ${response.status} ${response.statusText}`
      }))
      throw new Error(error.error || 'Failed to fetch positions')
    }
    
    return response.json()
  },

  /**
   * Fetch single position by ID
   * 
   * @param id - Position ID
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing position detail
   * 
   * @example
   * ```typescript
   * const result = await positionApi.getById('clxxx123')
   * ```
   */
  async getById(
    id: string,
    headers?: HeadersInit
  ): Promise<PositionDetailResponse> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/positions/${id}`,
      getFetchOptions(headers)
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch position')
    }
    
    return response.json()
  },

  /**
   * Fetch positions by department
   * 
   * @param departmentId - Department ID
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing positions array
   * 
   * @example
   * ```typescript
   * const result = await positionApi.getByDepartment('dept-123')
   * ```
   */
  async getByDepartment(
    departmentId: string,
    headers?: HeadersInit
  ): Promise<PositionByDepartmentResponse> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/positions/by-department/${departmentId}`,
      getFetchOptions(headers)
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch positions by department')
    }
    
    return response.json()
  },

  /**
   * Create new position
   * 
   * @param data - Position creation data
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing created position
   * 
   * @example
   * ```typescript
   * const result = await positionApi.create({
   *   departmentId: 'dept-123',
   *   positionCode: 'MGR-001',
   *   positionName: 'Department Manager',
   *   level: 'MANAGER',
   *   minSalary: 8000000,
   *   maxSalary: 12000000,
   *   requirements: ['Bachelor degree', '5 years experience'],
   *   responsibilities: ['Lead team', 'Manage budget']
   * })
   * ```
   */
  async create(
    data: PositionInput,
    headers?: HeadersInit
  ): Promise<PositionCreateResponse> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/positions`, {
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
      throw new Error(error.error || 'Failed to create position')
    }
    
    return response.json()
  },

  /**
   * Update existing position
   * 
   * @param id - Position ID
   * @param data - Partial position update data
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing updated position
   * 
   * @example
   * ```typescript
   * const result = await positionApi.update('clxxx123', {
   *   positionName: 'Senior Manager',
   *   level: 'SENIOR_MANAGER',
   *   maxSalary: 15000000
   * })
   * ```
   */
  async update(
    id: string,
    data: PositionUpdate,
    headers?: HeadersInit
  ): Promise<PositionUpdateResponse> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/positions/${id}`, {
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
      throw new Error(error.error || 'Failed to update position')
    }
    
    return response.json()
  },

  /**
   * Delete position
   * 
   * @param id - Position ID
   * @param headers - Optional headers for SSR
   * @returns Promise with API response
   * 
   * @example
   * ```typescript
   * const result = await positionApi.delete('clxxx123')
   * ```
   */
  async delete(
    id: string,
    headers?: HeadersInit
  ): Promise<PositionDeleteResponse> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/positions/${id}`, {
      ...getFetchOptions(headers),
      method: 'DELETE',
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete position')
    }
    
    return response.json()
  },
}
