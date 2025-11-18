/**
 * @fileoverview Department API Client
 * @version Next.js 15.5.4 / Enterprise Pattern
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Enterprise API Client Pattern (Section 2a)
 * 
 * Centralized API client for Department CRUD operations
 * Supports both Client-Side Rendering (CSR) and Server-Side Rendering (SSR)
 * 
 * @example
 * ```typescript
 * // Client-side usage (CSR)
 * const result = await departmentApi.getAll()
 * 
 * // Server-side usage (SSR/RSC)
 * const headersList = await headers()
 * const result = await departmentApi.getAll(undefined, headersList)
 * ```
 */

import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import type {
  ApiResponse,
  Department,
  DepartmentInput,
  DepartmentUpdate,
  DepartmentFilters,
  DepartmentWithRelations,
  DepartmentTreeNode,
} from '@/features/sppg/hrd/types/department.types'

/**
 * Department API client with enterprise patterns
 * All methods support SSR via optional headers parameter
 */
export const departmentApi = {
  /**
   * Fetch all departments with optional filtering
   * 
   * @param filters - Optional filter parameters
   * @param headers - Optional headers for SSR (e.g., Cookie header)
   * @returns Promise with API response containing department list
   * 
   * @example
   * ```typescript
   * // Client-side with filters
   * const result = await departmentApi.getAll({ isActive: true })
   * 
   * // Server-side with auth
   * const headersList = await headers()
   * const cookieHeader = headersList.get('cookie')
   * const requestHeaders = cookieHeader ? { Cookie: cookieHeader } : {}
   * const result = await departmentApi.getAll(filters, requestHeaders)
   * ```
   */
  async getAll(
    filters?: DepartmentFilters,
    headers?: HeadersInit
  ): Promise<ApiResponse<Department[]>> {
    const baseUrl = getBaseUrl()
    
    // Build query string if filters provided
    const params = new URLSearchParams()
    if (filters?.search) params.append('search', filters.search)
    if (filters?.parentId) params.append('parentId', filters.parentId)
    if (filters?.managerId) params.append('managerId', filters.managerId)
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive))
    if (filters?.hasParent !== undefined) params.append('hasParent', String(filters.hasParent))
    
    const queryString = params.toString()
    const url = queryString 
      ? `${baseUrl}/api/sppg/departments?${queryString}`
      : `${baseUrl}/api/sppg/departments`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch departments' }))
      throw new Error(error.error || 'Failed to fetch departments')
    }
    
    return response.json()
  },

  /**
   * Fetch single department by ID with full relationships
   * 
   * @param id - Department ID
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing department detail
   * 
   * @example
   * ```typescript
   * const result = await departmentApi.getById('dept-id-123')
   * if (result.success && result.data) {
   *   console.log(result.data.employees) // Access related employees
   * }
   * ```
   */
  async getById(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<DepartmentWithRelations>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/departments/${id}`,
      getFetchOptions(headers)
    )
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch department' }))
      throw new Error(error.error || 'Failed to fetch department')
    }
    
    return response.json()
  },

  /**
   * Fetch hierarchical department tree
   * 
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing nested tree structure
   * 
   * @example
   * ```typescript
   * const result = await departmentApi.getHierarchy()
   * if (result.success && result.data) {
   *   // result.data is array of root departments with nested children
   *   result.data.forEach(dept => renderTree(dept))
   * }
   * ```
   */
  async getHierarchy(
    headers?: HeadersInit
  ): Promise<ApiResponse<DepartmentTreeNode[]>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/departments/hierarchy`,
      getFetchOptions(headers)
    )
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch department hierarchy' }))
      throw new Error(error.error || 'Failed to fetch department hierarchy')
    }
    
    return response.json()
  },

  /**
   * Create new department
   * 
   * @param data - Department creation data
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing created department
   * 
   * @example
   * ```typescript
   * const result = await departmentApi.create({
   *   departmentCode: 'FIN',
   *   departmentName: 'Finance Department',
   *   parentId: 'parent-dept-id', // optional
   *   maxEmployees: 50,
   *   budgetAllocated: 1000000000
   * })
   * ```
   */
  async create(
    data: DepartmentInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<Department>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/departments`, {
      ...getFetchOptions(headers),
      method: 'POST',
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to create department' }))
      throw new Error(error.error || 'Failed to create department')
    }
    
    return response.json()
  },

  /**
   * Update existing department
   * 
   * @param id - Department ID
   * @param data - Partial department data to update
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing updated department
   * 
   * @example
   * ```typescript
   * const result = await departmentApi.update('dept-id-123', {
   *   departmentName: 'Finance & Accounting Department',
   *   maxEmployees: 75
   * })
   * ```
   */
  async update(
    id: string,
    data: DepartmentUpdate,
    headers?: HeadersInit
  ): Promise<ApiResponse<Department>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/departments/${id}`, {
      ...getFetchOptions(headers),
      method: 'PUT',
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to update department' }))
      throw new Error(error.error || 'Failed to update department')
    }
    
    return response.json()
  },

  /**
   * Delete department
   * 
   * VALIDATION: Department must have no employees, positions, or child departments
   * 
   * @param id - Department ID
   * @param headers - Optional headers for SSR
   * @returns Promise with API response
   * 
   * @example
   * ```typescript
   * try {
   *   await departmentApi.delete('dept-id-123')
   *   toast.success('Department deleted successfully')
   * } catch (error) {
   *   // Error message explains why deletion failed (has employees, etc.)
   *   toast.error(error.message)
   * }
   * ```
   */
  async delete(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<void>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/departments/${id}`, {
      ...getFetchOptions(headers),
      method: 'DELETE',
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to delete department' }))
      throw new Error(error.error || 'Failed to delete department')
    }
    
    return response.json()
  },
}
