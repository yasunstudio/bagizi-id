/**
 * @fileoverview Procurement Plans API Client
 * @version Next.js 15.5.4 / TanStack Query 5.62.13
 * @author Bagizi-ID Development Team
 * @see {@link /docs/PROCUREMENT_WORKFLOW_GUIDE.md} Procurement Documentation
 * 
 * ENTERPRISE API CLIENT PATTERN:
 * - Centralized API calls (NO direct fetch in hooks/stores)
 * - SSR compatible with optional headers parameter
 * - Consistent error handling
 * - Type-safe with proper TypeScript
 * - Base URL resolution for all environments
 * 
 * CRITICAL: All methods support SSR via optional headers parameter
 */

import type {
  PlanResponse,
  PlanListResponse,
  PlanStatsResponse,
  CreatePlanRequest,
  UpdatePlanRequest,
  PlanFilters,
  PlanSubmissionInput,
  PlanApprovalInput,
  PlanRejectionInput,
  PlanCancellationInput,
} from '../types'

// ================================ TYPES ================================

/**
 * Standard API response wrapper
 */
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  details?: unknown
}

// ================================ HELPER FUNCTIONS ================================

/**
 * Get base URL for API calls
 * Handles different environments (client, server, development, production)
 */
function getBaseUrl(): string {
  // Browser
  if (typeof window !== 'undefined') {
    return ''
  }
  
  // Vercel deployment
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  
  // Development
  return 'http://localhost:3000'
}

/**
 * Get fetch options with headers for SSR
 */
function getFetchOptions(headers?: HeadersInit): RequestInit {
  return {
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    cache: 'no-store', // Disable caching for API calls
  }
}

// ================================ API CLIENT ================================

/**
 * Plans API Client
 * All methods support SSR via optional headers parameter
 */
export const planApi = {
  /**
   * Fetch all plans with optional filtering
   * 
   * @param filters - Optional filter parameters
   * @param headers - Optional headers for SSR
   * @returns Promise with plan list response
   * 
   * @example
   * // Client-side
   * const result = await planApi.getAll({ approvalStatus: ['APPROVED'] })
   * 
   * // Server-side (SSR/RSC)
   * const result = await planApi.getAll({ approvalStatus: ['APPROVED'] }, headers())
   */
  async getAll(
    filters?: PlanFilters,
    headers?: HeadersInit
  ): Promise<ApiResponse<PlanListResponse>> {
    const baseUrl = getBaseUrl()
    
    // Build query string
    const params = new URLSearchParams()
    
    if (filters?.search) params.append('search', filters.search)
    if (filters?.approvalStatus?.length) {
      filters.approvalStatus.forEach((status) => params.append('approvalStatus', status))
    }
    if (filters?.planYear) params.append('planYear', filters.planYear.toString())
    if (filters?.planMonth) params.append('planMonth', filters.planMonth)
    if (filters?.planQuarter) params.append('planQuarter', filters.planQuarter.toString())
    if (filters?.minBudget) params.append('minBudget', filters.minBudget.toString())
    if (filters?.maxBudget) params.append('maxBudget', filters.maxBudget.toString())
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString())
    if (filters?.sortBy) params.append('sortBy', filters.sortBy)
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)
    
    const queryString = params.toString()
    const url = queryString
      ? `${baseUrl}/api/sppg/procurement/plans?${queryString}`
      : `${baseUrl}/api/sppg/procurement/plans`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch plans')
    }
    
    return response.json()
  },

  /**
   * Fetch single plan by ID
   * 
   * @param id - Plan ID
   * @param headers - Optional headers for SSR
   * @returns Promise with plan response
   * 
   * @example
   * const result = await planApi.getById('plan_123')
   */
  async getById(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<PlanResponse>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/procurement/plans/${id}`,
      getFetchOptions(headers)
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch plan')
    }
    
    return response.json()
  },

  /**
   * Create new plan
   * 
   * @param data - Plan creation data
   * @returns Promise with created plan
   * 
   * @example
   * const result = await planApi.create({
   *   planName: 'Rencana Pengadaan Januari 2025',
   *   planMonth: 'JANUARY',
   *   planYear: 2025,
   *   totalBudget: 50000000,
   *   targetRecipients: 500,
   *   targetMeals: 10000,
   * })
   */
  async create(
    data: CreatePlanRequest
  ): Promise<ApiResponse<PlanResponse>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/procurement/plans`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create plan')
    }
    
    return response.json()
  },

  /**
   * Update existing plan
   * 
   * @param id - Plan ID
   * @param data - Plan update data (partial)
   * @returns Promise with updated plan
   * 
   * @example
   * const result = await planApi.update('plan_123', {
   *   totalBudget: 60000000,
   *   notes: 'Updated budget allocation',
   * })
   */
  async update(
    id: string,
    data: UpdatePlanRequest
  ): Promise<ApiResponse<PlanResponse>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/procurement/plans/${id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update plan')
    }
    
    return response.json()
  },

  /**
   * Delete plan
   * Only allowed for DRAFT plans
   * 
   * @param id - Plan ID
   * @returns Promise with void response
   * 
   * @example
   * await planApi.delete('plan_123')
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/procurement/plans/${id}`,
      {
        method: 'DELETE',
      }
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete plan')
    }
    
    return response.json()
  },

  /**
   * Submit plan for review
   * Changes status from DRAFT to SUBMITTED
   * 
   * @param id - Plan ID
   * @param data - Submission data
   * @returns Promise with updated plan
   * 
   * @example
   * const result = await planApi.submit('plan_123', {
   *   submissionNotes: 'Ready for review',
   * })
   */
  async submit(
    id: string,
    data: PlanSubmissionInput
  ): Promise<ApiResponse<PlanResponse>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/procurement/plans/${id}/submit`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to submit plan')
    }
    
    return response.json()
  },

  /**
   * Approve plan
   * Changes status to APPROVED
   * Requires: SPPG_KEPALA, SPPG_ADMIN, SPPG_AKUNTAN, or PLATFORM_SUPERADMIN role
   * 
   * @param id - Plan ID
   * @param data - Approval data
   * @returns Promise with updated plan
   * 
   * @example
   * const result = await planApi.approve('plan_123', {
   *   approvalNotes: 'Approved for implementation',
   * })
   */
  async approve(
    id: string,
    data: PlanApprovalInput
  ): Promise<ApiResponse<PlanResponse>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/procurement/plans/${id}/approve`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to approve plan')
    }
    
    return response.json()
  },

  /**
   * Reject plan
   * Changes status to REJECTED
   * Requires: SPPG_KEPALA, SPPG_ADMIN, SPPG_AKUNTAN, or PLATFORM_SUPERADMIN role
   * 
   * @param id - Plan ID
   * @param data - Rejection data
   * @returns Promise with updated plan
   * 
   * @example
   * const result = await planApi.reject('plan_123', {
   *   rejectionReason: 'Budget allocation needs revision',
   *   improvementSuggestions: 'Please adjust protein budget',
   * })
   */
  async reject(
    id: string,
    data: PlanRejectionInput
  ): Promise<ApiResponse<PlanResponse>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/procurement/plans/${id}/reject`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to reject plan')
    }
    
    return response.json()
  },

  /**
   * Cancel plan
   * Changes status to CANCELLED
   * Requires: SPPG_KEPALA, SPPG_ADMIN, or PLATFORM_SUPERADMIN role
   * 
   * @param id - Plan ID
   * @param data - Cancellation data
   * @returns Promise with updated plan
   * 
   * @example
   * const result = await planApi.cancel('plan_123', {
   *   cancellationReason: 'Program postponed',
   * })
   */
  async cancel(
    id: string,
    data: PlanCancellationInput
  ): Promise<ApiResponse<PlanResponse>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/procurement/plans/${id}/cancel`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to cancel plan')
    }
    
    return response.json()
  },

  /**
   * Get plan statistics
   * 
   * @param filters - Optional filter parameters
   * @param headers - Optional headers for SSR
   * @returns Promise with statistics response
   * 
   * @example
   * const result = await planApi.getStats({ planYear: 2025 })
   */
  async getStats(
    filters?: Pick<PlanFilters, 'planYear' | 'planMonth' | 'planQuarter'>,
    headers?: HeadersInit
  ): Promise<ApiResponse<PlanStatsResponse>> {
    const baseUrl = getBaseUrl()
    
    // Build query string
    const params = new URLSearchParams()
    
    if (filters?.planYear) params.append('planYear', filters.planYear.toString())
    if (filters?.planMonth) params.append('planMonth', filters.planMonth)
    if (filters?.planQuarter) params.append('planQuarter', filters.planQuarter.toString())
    
    const queryString = params.toString()
    const url = queryString
      ? `${baseUrl}/api/sppg/procurement/plans/stats?${queryString}`
      : `${baseUrl}/api/sppg/procurement/plans/stats`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch plan statistics')
    }
    
    return response.json()
  },
}
