/**
 * Enrollment API Client
 * 
 * Centralized API client for ProgramBeneficiaryEnrollment operations.
 * Handles all HTTP communications with enrollment API endpoints.
 * 
 * @fileoverview Enrollment API client with enterprise patterns
 * @version Next.js 15.5.4 / Auth.js v5
 * @author Bagizi-ID Development Team
 * @see {@link /docs/PROGRAM_BENEFICIARY_ARCHITECTURE_ANALYSIS.md} Architecture Guide
 */

import { getBaseUrl, getFetchOptions, type ApiResponse } from '@/lib/api-utils'
import type { 
  EnrollmentInput, 
  EnrollmentResponse,
  EnrollmentUpdateInput
} from '../schemas/enrollmentSchema'
import type { 
  EnrollmentWithRelations,
  EnrollmentFilters 
} from '../types/enrollment.types'

/**
 * Enrollment API client with enterprise patterns
 * All methods support SSR via optional headers parameter
 * 
 * @example
 * ```typescript
 * // Client-side usage
 * const result = await enrollmentApi.getAll(programId)
 * 
 * // Server-side usage (SSR/RSC)
 * const result = await enrollmentApi.getAll(programId, undefined, headers())
 * ```
 */
export const enrollmentApi = {
  /**
   * Fetch all enrollments for a program
   * 
   * @param programId - Program ID to fetch enrollments for
   * @param filters - Optional filters for enrollment list
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing enrollments
   * 
   * @example
   * ```typescript
   * const result = await enrollmentApi.getAll('prog_123', { status: 'ACTIVE' })
   * if (result.success && result.data) {
   *   console.log('Enrollments:', result.data)
   * }
   * ```
   */
  async getAll(
    programId: string,
    filters?: EnrollmentFilters,
    headers?: HeadersInit
  ): Promise<ApiResponse<EnrollmentWithRelations[]>> {
    const baseUrl = getBaseUrl()
    
    // Build query string if filters provided
    const params = new URLSearchParams()
    if (filters?.status && filters.status !== 'ALL') {
      params.append('status', filters.status)
    }
    if (filters?.schoolType) {
      params.append('schoolType', filters.schoolType)
    }
    if (filters?.search) {
      params.append('search', filters.search)
    }
    if (filters?.isActive !== undefined) {
      params.append('isActive', String(filters.isActive))
    }
    if (filters?.hasContract !== undefined) {
      params.append('hasContract', String(filters.hasContract))
    }
    if (filters?.minStudents) {
      params.append('minStudents', String(filters.minStudents))
    }
    if (filters?.maxStudents) {
      params.append('maxStudents', String(filters.maxStudents))
    }
    
    const queryString = params.toString()
    const url = queryString 
      ? `${baseUrl}/api/sppg/program/${programId}/enrollments?${queryString}`
      : `${baseUrl}/api/sppg/program/${programId}/enrollments`
    
    console.log('🔍 [enrollmentApi.getAll] Fetching:', { url, filters })
    
    const response = await fetch(url, getFetchOptions(headers))
    
    console.log('🔍 [enrollmentApi.getAll] Response:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText
    })
    
    if (!response.ok) {
      let error: { error?: string; message?: string; details?: unknown } = {}
      let errorText = ''
      
      try {
        errorText = await response.text()
        if (errorText) {
          error = JSON.parse(errorText)
        }
      } catch (parseError) {
        console.error('❌ Failed to parse error response:', parseError)
        error = { error: errorText || 'Failed to parse error response' }
      }
      
      console.error('❌ [enrollmentApi.getAll] Error response:', error)
      throw new Error(
        error.error || 
        error.message || 
        `Failed to fetch enrollments (${response.status}: ${response.statusText})`
      )
    }
    
    const data = await response.json()
    console.log('✅ [enrollmentApi.getAll] Success response:', {
      success: data.success,
      hasData: !!data.data,
      dataType: data.data ? typeof data.data : null,
      dataLength: Array.isArray(data.data) ? data.data.length : null
    })
    
    return data
  },

  /**
   * Fetch single enrollment by ID
   * 
   * @param programId - Program ID
   * @param enrollmentId - Enrollment ID to fetch
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing enrollment details
   */
  async getOne(
    programId: string,
    enrollmentId: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<EnrollmentWithRelations>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/program/${programId}/enrollments/${enrollmentId}`,
      getFetchOptions(headers)
    )
    
    if (!response.ok) {
      let error: { error?: string; message?: string; details?: unknown } = {}
      let errorText = ''
      
      try {
        errorText = await response.text()
        if (errorText) {
          error = JSON.parse(errorText)
        }
      } catch (parseError) {
        console.error('❌ Failed to parse error response:', parseError)
        error = { error: errorText || 'Failed to parse error response' }
      }
      
      throw new Error(
        error.error || 
        error.message || 
        `Failed to fetch enrollment (${response.status}: ${response.statusText})`
      )
    }
    
    return response.json()
  },

  /**
   * Create new enrollment
   * 
   * @param programId - Program ID to create enrollment for
   * @param data - Enrollment creation data
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing created enrollment
   * 
   * @example
   * ```typescript
   * const result = await enrollmentApi.create('prog_123', {
   *   schoolId: 'school_456',
   *   targetStudents: 500,
   *   activeStudents: 485,
   *   feedingDays: 5,
   *   mealsPerDay: 1,
   *   // ... other fields
   * })
   * ```
   */
  async create(
    programId: string,
    data: EnrollmentInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<EnrollmentResponse>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/program/${programId}/enrollments`,
      {
        ...getFetchOptions(headers),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(data),
      }
    )
    
    if (!response.ok) {
      let error: { error?: string; message?: string; details?: unknown } = {}
      let errorText = ''
      
      try {
        errorText = await response.text()
        if (errorText) {
          error = JSON.parse(errorText)
        }
      } catch (parseError) {
        console.error('❌ Failed to parse error response:', parseError)
        error = { error: errorText || 'Failed to parse error response' }
      }
      
      throw new Error(
        error.error || 
        error.message || 
        `Failed to create enrollment (${response.status}: ${response.statusText})`
      )
    }
    
    return response.json()
  },

  /**
   * Update existing enrollment
   * 
   * @param programId - Program ID
   * @param enrollmentId - Enrollment ID to update
   * @param data - Partial enrollment data to update
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing updated enrollment
   * 
   * @example
   * ```typescript
   * const result = await enrollmentApi.update('prog_123', 'enroll_789', {
   *   activeStudents: 490,
   *   attendanceRate: 95.5
   * })
   * ```
   */
  async update(
    programId: string,
    enrollmentId: string,
    data: EnrollmentUpdateInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<EnrollmentResponse>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/program/${programId}/enrollments/${enrollmentId}`,
      {
        ...getFetchOptions(headers),
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(data),
      }
    )
    
    if (!response.ok) {
      let error: { error?: string; message?: string; details?: unknown } = {}
      let errorText = ''
      
      try {
        // Try to parse as JSON first
        errorText = await response.text()
        if (errorText) {
          error = JSON.parse(errorText)
        }
      } catch (parseError) {
        console.error('❌ Failed to parse error response:', parseError)
        error = { error: errorText || 'Failed to parse error response' }
      }
      
      console.error('❌ API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText,
        error: error,
        details: error.details,
        fullError: JSON.stringify(error, null, 2)
      })
      
      throw new Error(
        error.error || 
        error.message || 
        `Failed to update enrollment (${response.status}: ${response.statusText})`
      )
    }
    
    return response.json()
  },

  /**
   * Delete enrollment
   * 
   * @param programId - Program ID
   * @param enrollmentId - Enrollment ID to delete
   * @param headers - Optional headers for SSR
   * @returns Promise with API response
   * 
   * @example
   * ```typescript
   * const result = await enrollmentApi.delete('prog_123', 'enroll_789')
   * if (result.success) {
   *   console.log('Enrollment deleted successfully')
   * }
   * ```
   */
  async delete(
    programId: string,
    enrollmentId: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<void>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/program/${programId}/enrollments/${enrollmentId}`,
      {
        ...getFetchOptions(headers),
        method: 'DELETE',
      }
    )
    
    if (!response.ok) {
      let error: { error?: string; message?: string; details?: unknown } = {}
      let errorText = ''
      
      try {
        errorText = await response.text()
        if (errorText) {
          error = JSON.parse(errorText)
        }
      } catch (parseError) {
        console.error('❌ Failed to parse error response:', parseError)
        error = { error: errorText || 'Failed to parse error response' }
      }
      
      throw new Error(
        error.error || 
        error.message || 
        `Failed to delete enrollment (${response.status}: ${response.statusText})`
      )
    }
    
    return response.json()
  },

  /**
   * Bulk create enrollments
   * Useful for importing multiple schools at once
   * 
   * @param programId - Program ID
   * @param enrollments - Array of enrollment data
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing created enrollments
   */
  async bulkCreate(
    programId: string,
    enrollments: EnrollmentInput[],
    headers?: HeadersInit
  ): Promise<ApiResponse<EnrollmentResponse[]>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/program/${programId}/enrollments/bulk`,
      {
        ...getFetchOptions(headers),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({ enrollments }),
      }
    )
    
    if (!response.ok) {
      let error: { error?: string; message?: string; details?: unknown } = {}
      let errorText = ''
      
      try {
        errorText = await response.text()
        if (errorText) {
          error = JSON.parse(errorText)
        }
      } catch (parseError) {
        console.error('❌ Failed to parse error response:', parseError)
        error = { error: errorText || 'Failed to parse error response' }
      }
      
      throw new Error(
        error.error || 
        error.message || 
        `Failed to bulk create enrollments (${response.status}: ${response.statusText})`
      )
    }
    
    return response.json()
  },

  /**
   * Update enrollment status
   * Quick method to activate, pause, or complete enrollment
   * 
   * @param programId - Program ID
   * @param enrollmentId - Enrollment ID
   * @param status - New status
   * @param reason - Optional reason for status change
   * @param headers - Optional headers for SSR
   * @returns Promise with API response
   */
  async updateStatus(
    programId: string,
    enrollmentId: string,
    status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED',
    reason?: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<EnrollmentResponse>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/program/${programId}/enrollments/${enrollmentId}/status`,
      {
        ...getFetchOptions(headers),
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({ status, reason }),
      }
    )
    
    if (!response.ok) {
      let error: { error?: string; message?: string; details?: unknown } = {}
      let errorText = ''
      
      try {
        errorText = await response.text()
        if (errorText) {
          error = JSON.parse(errorText)
        }
      } catch (parseError) {
        console.error('❌ Failed to parse error response:', parseError)
        error = { error: errorText || 'Failed to parse error response' }
      }
      
      throw new Error(
        error.error || 
        error.message || 
        `Failed to update enrollment status (${response.status}: ${response.statusText})`
      )
    }
    
    return response.json()
  },

  /**
   * Get enrollment statistics for a program
   * Returns aggregated data for dashboard/overview
   * 
   * @param programId - Program ID
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing stats
   */
  async getStats(
    programId: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<{
    totalSchools: number
    activeSchools: number
    totalStudents: number
    totalBudget: number
    averageAttendance: number
    averageParticipation: number
  }>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/program/${programId}/enrollments/stats`,
      getFetchOptions(headers)
    )
    
    if (!response.ok) {
      let error: { error?: string; message?: string; details?: unknown } = {}
      let errorText = ''
      
      try {
        errorText = await response.text()
        if (errorText) {
          error = JSON.parse(errorText)
        }
      } catch (parseError) {
        console.error('❌ Failed to parse error response:', parseError)
        error = { error: errorText || 'Failed to parse error response' }
      }
      
      throw new Error(
        error.error || 
        error.message || 
        `Failed to fetch enrollment stats (${response.status}: ${response.statusText})`
      )
    }
    
    return response.json()
  },
}
