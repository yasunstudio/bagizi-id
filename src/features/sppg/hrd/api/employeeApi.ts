/**
 * @fileoverview Employee API Client
 * @version Next.js 15.5.4 / Auth.js v5
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} API Client Pattern (Section 2a)
 * 
 * Centralized API client for Employee CRUD operations
 * All methods support SSR via optional headers parameter
 * 
 * @example
 * ```typescript
 * // Client-side usage
 * const result = await employeeApi.getAll()
 * 
 * // Server-side usage (SSR/RSC)
 * const result = await employeeApi.getAll(undefined, headers())
 * ```
 */

import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import type { ApiResponse } from '@/lib/api-utils'
import type {
  EmployeeListItem,
  EmployeeDetail,
  EmployeeStatistics,
} from '../types'
import type {
  CreateEmployeeInput,
  UpdateEmployeeInput,
  EmployeeFiltersInput,
} from '../schemas/employeeSchema'

/**
 * Employee API client with enterprise patterns
 */
export const employeeApi = {
  /**
   * Fetch all employees with optional filtering, pagination, and sorting
   * @param filters - Optional filter parameters
   * @param headers - Optional headers for SSR
   * @returns Promise with list of employees
   */
  async getAll(
    filters?: EmployeeFiltersInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<EmployeeListItem[]>> {
    const baseUrl = getBaseUrl()
    
    // Build query string if filters provided
    const params = new URLSearchParams()
    if (filters?.search) params.append('search', filters.search)
    if (filters?.departmentId) params.append('departmentId', filters.departmentId)
    if (filters?.positionId) params.append('positionId', filters.positionId)
    if (filters?.employmentType) params.append('employmentType', filters.employmentType)
    if (filters?.employmentStatus) params.append('employmentStatus', filters.employmentStatus)
    if (filters?.employeeLevel) params.append('employeeLevel', filters.employeeLevel)
    if (filters?.gender) params.append('gender', filters.gender)
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive))
    if (filters?.joinDateFrom) params.append('joinDateFrom', filters.joinDateFrom.toISOString())
    if (filters?.joinDateTo) params.append('joinDateTo', filters.joinDateTo.toISOString())
    if (filters?.page) params.append('page', String(filters.page))
    if (filters?.limit) params.append('limit', String(filters.limit))
    if (filters?.sortBy) params.append('sortBy', filters.sortBy)
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)
    
    const queryString = params.toString()
    const url = queryString 
      ? `${baseUrl}/api/sppg/employees?${queryString}`
      : `${baseUrl}/api/sppg/employees`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch employees')
    }
    
    return response.json()
  },

  /**
   * Fetch single employee by ID with full details
   * @param id - Employee ID
   * @param headers - Optional headers for SSR
   * @returns Promise with employee detail
   */
  async getById(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<EmployeeDetail>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/employees/${id}`,
      getFetchOptions(headers)
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch employee')
    }
    
    return response.json()
  },

  /**
   * Create new employee
   * @param data - Employee creation data
   * @param headers - Optional headers for SSR
   * @returns Promise with created employee
   */
  async create(
    data: CreateEmployeeInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<EmployeeDetail>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/employees`, {
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
      throw new Error(error.error || 'Failed to create employee')
    }
    
    return response.json()
  },

  /**
   * Update existing employee
   * @param id - Employee ID
   * @param data - Partial employee update data
   * @param headers - Optional headers for SSR
   * @returns Promise with updated employee
   */
  async update(
    id: string,
    data: Partial<UpdateEmployeeInput>,
    headers?: HeadersInit
  ): Promise<ApiResponse<EmployeeDetail>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/employees/${id}`, {
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
      throw new Error(error.error || 'Failed to update employee')
    }
    
    return response.json()
  },

  /**
   * Delete employee
   * @param id - Employee ID
   * @param headers - Optional headers for SSR
   * @returns Promise with void response
   */
  async delete(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<void>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/employees/${id}`, {
      ...getFetchOptions(headers),
      method: 'DELETE',
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete employee')
    }
    
    return response.json()
  },

  /**
   * Get employee statistics for dashboard
   * @param headers - Optional headers for SSR
   * @returns Promise with employee statistics
   */
  async getStatistics(
    headers?: HeadersInit
  ): Promise<ApiResponse<EmployeeStatistics>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/employees/statistics`,
      getFetchOptions(headers)
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch statistics')
    }
    
    return response.json()
  },

  /**
   * Upload employee photo
   * @param id - Employee ID
   * @param file - Photo file to upload
   * @param headers - Optional headers for SSR
   * @returns Promise with photo URL
   */
  async uploadPhoto(
    id: string,
    file: File,
    headers?: HeadersInit
  ): Promise<ApiResponse<{ photoUrl: string }>> {
    const baseUrl = getBaseUrl()
    const formData = new FormData()
    formData.append('photo', file)
    
    const response = await fetch(`${baseUrl}/api/sppg/employees/${id}/photo`, {
      ...getFetchOptions(headers),
      method: 'POST',
      body: formData,
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to upload photo')
    }
    
    return response.json()
  },

  /**
   * Update employee status (activate/deactivate)
   * @param id - Employee ID
   * @param isActive - New status
   * @param headers - Optional headers for SSR
   * @returns Promise with updated employee
   */
  async updateStatus(
    id: string,
    isActive: boolean,
    headers?: HeadersInit
  ): Promise<ApiResponse<EmployeeDetail>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/employees/${id}/status`, {
      ...getFetchOptions(headers),
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({ isActive }),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update employee status')
    }
    
    return response.json()
  },
}
