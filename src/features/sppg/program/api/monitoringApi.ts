/**
 * @fileoverview API client untuk ProgramMonitoring domain
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
  MonitoringResponse,
  MonitoringListResponse,
  CreateMonitoringInput,
  UpdateMonitoringInput,
  MonitoringFilter
} from '../types'

/**
 * ProgramMonitoring API client dengan enterprise patterns
 * All methods support SSR via optional headers parameter
 * 
 * @example
 * ```typescript
 * // Client-side usage
 * const reports = await monitoringApi.getAll('program-id')
 * 
 * // Server-side usage (SSR/RSC)
 * const reports = await monitoringApi.getAll('program-id', undefined, headers())
 * ```
 */
export const monitoringApi = {
  /**
   * Fetch all monitoring reports untuk program dengan optional filtering
   * Auto-filtered by program.sppgId pada server (multi-tenant security)
   * 
   * @param programId - Program ID
   * @param filters - Optional filter parameters
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing monitoring reports array with pagination
   * 
   * @example
   * ```typescript
   * // Fetch all reports for program
   * const result = await monitoringApi.getAll('program-123')
   * 
   * // Fetch with date range filter
   * const result = await monitoringApi.getAll('program-123', {
   *   startDate: new Date('2024-01-01'),
   *   endDate: new Date('2024-12-31')
   * })
   * ```
   */
  async getAll(
    programId: string,
    filters?: MonitoringFilter,
    headers?: HeadersInit
  ): Promise<ApiResponse<MonitoringResponse[]>> {
    const baseUrl = getBaseUrl()
    
    // Build query string if filters provided
    const params = new URLSearchParams()
    if (filters?.startDate) {
      params.append('startDate', filters.startDate instanceof Date 
        ? filters.startDate.toISOString() 
        : filters.startDate)
    }
    if (filters?.endDate) {
      params.append('endDate', filters.endDate instanceof Date 
        ? filters.endDate.toISOString() 
        : filters.endDate)
    }
    if (filters?.reportedById) params.append('reportedById', filters.reportedById)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    
    const queryString = params.toString()
    const url = queryString 
      ? `${baseUrl}/api/sppg/program/${programId}/monitoring?${queryString}`
      : `${baseUrl}/api/sppg/program/${programId}/monitoring`
    
    console.log('🔍 [monitoringApi.getAll] Fetching:', { url, filters })
    
    const response = await fetch(url, getFetchOptions(headers))
    
    console.log('🔍 [monitoringApi.getAll] Response:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText
    })
    
    if (!response.ok) {
      const error = await response.json()
      console.error('❌ [monitoringApi.getAll] Error response:', error)
      throw new Error(error.error || 'Failed to fetch monitoring reports')
    }
    
    const data = await response.json()
    console.log('✅ [monitoringApi.getAll] Success response:', {
      success: data.success,
      hasData: !!data.data,
      dataType: data.data ? typeof data.data : null,
      dataLength: Array.isArray(data.data) ? data.data.length : data.data?.data?.length,
      hasPagination: !!data.pagination
    })
    
    return data
  },

  /**
   * Fetch single monitoring report by ID
   * 
   * @param programId - Program ID
   * @param monitoringId - Monitoring report ID
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing monitoring report with stats
   * 
   * @example
   * ```typescript
   * const result = await monitoringApi.getById('program-123', 'monitoring-456')
   * ```
   */
  async getById(
    programId: string,
    monitoringId: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<MonitoringResponse>> {
    const baseUrl = getBaseUrl()
    const url = `${baseUrl}/api/sppg/program/${programId}/monitoring/${monitoringId}`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch monitoring report')
    }
    
    return response.json()
  },

  /**
   * Create new monitoring report
   * 
   * @param programId - Program ID
   * @param data - Monitoring report data (reportedById akan di-set otomatis di server)
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing created monitoring report
   * 
   * @example
   * ```typescript
   * const result = await monitoringApi.create('program-123', {
   *   monitoringDate: new Date(),
   *   mealsPlanned: 1000,
   *   mealsServed: 980,
   *   recipientsPlanned: 500,
   *   recipientsServed: 490,
   *   budgetPlanned: 10000000,
   *   budgetSpent: 9500000,
   *   productionDays: 20,
   *   // ... other fields
   * })
   * ```
   */
  async create(
    programId: string,
    data: Omit<CreateMonitoringInput, 'programId' | 'reportedById'>,
    headers?: HeadersInit
  ): Promise<ApiResponse<MonitoringResponse>> {
    const baseUrl = getBaseUrl()
    const url = `${baseUrl}/api/sppg/program/${programId}/monitoring`
    
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
      throw new Error(error.error || 'Failed to create monitoring report')
    }
    
    return response.json()
  },

  /**
   * Update existing monitoring report
   * 
   * @param programId - Program ID
   * @param monitoringId - Monitoring report ID
   * @param data - Partial monitoring report data untuk update
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing updated monitoring report
   * 
   * @example
   * ```typescript
   * const result = await monitoringApi.update('program-123', 'monitoring-456', {
   *   mealsServed: 985,
   *   notes: 'Updated meal count after final verification'
   * })
   * ```
   */
  async update(
    programId: string,
    monitoringId: string,
    data: UpdateMonitoringInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<MonitoringResponse>> {
    const baseUrl = getBaseUrl()
    const url = `${baseUrl}/api/sppg/program/${programId}/monitoring/${monitoringId}`
    
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
      throw new Error(error.error || 'Failed to update monitoring report')
    }
    
    return response.json()
  },

  /**
   * Delete monitoring report
   * 
   * @param programId - Program ID
   * @param monitoringId - Monitoring report ID
   * @param headers - Optional headers for SSR
   * @returns Promise with API response
   * 
   * @example
   * ```typescript
   * await monitoringApi.delete('program-123', 'monitoring-456')
   * ```
   */
  async delete(
    programId: string,
    monitoringId: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<void>> {
    const baseUrl = getBaseUrl()
    const url = `${baseUrl}/api/sppg/program/${programId}/monitoring/${monitoringId}`
    
    const response = await fetch(url, {
      ...getFetchOptions(headers),
      method: 'DELETE',
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete monitoring report')
    }
    
    return response.json()
  },
}
