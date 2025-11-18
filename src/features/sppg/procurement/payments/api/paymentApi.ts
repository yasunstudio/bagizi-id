/**
 * @fileoverview Payment API Client - Centralized API calls for payment management
 * @version Next.js 15.5.4 / TanStack Query v5
 * @author Bagizi-ID Development Team
 * @see {@link /docs/COPILOT_INSTRUCTIONS_API_CLIENT_UPDATE.md} API Client Pattern
 * 
 * ENTERPRISE PATTERN:
 * - Centralized API client with getBaseUrl, getFetchOptions
 * - SSR support via optional headers parameter
 * - Full TypeScript type safety
 * - Consistent error handling
 * - Standard ApiResponse format
 * 
 * USAGE:
 * ```typescript
 * // Client-side
 * const result = await paymentApi.getAll()
 * 
 * // Server-side (SSR/RSC)
 * const result = await paymentApi.getAll(undefined, headers())
 * ```
 */

import { getBaseUrl, getFetchOptions, type ApiResponse } from '@/lib/api-utils'
import type {
  PaymentTransaction,
  PaymentTransactionFormInput,
  PaymentTransactionUpdateInput,
  PaymentFiltersWithPagination,
  PaginatedPayments,
  OverduePayment,
  AgingReportResponse,
  PaymentStats,
  PaymentStatsQuery,
  AgingReportFilters,
} from '../types'

/**
 * Payment API client with enterprise patterns
 * All methods support SSR via optional headers parameter
 */
export const paymentApi = {
  /**
   * Fetch all payments with optional filtering and pagination
   * @param filters - Optional filter parameters
   * @param headers - Optional headers for SSR
   * @returns Promise with paginated payment list
   */
  async getAll(
    filters?: PaymentFiltersWithPagination,
    headers?: HeadersInit
  ): Promise<ApiResponse<PaginatedPayments>> {
    const baseUrl = getBaseUrl()
    
    // Build query string if filters provided
    const params = new URLSearchParams()
    if (filters?.search) params.append('search', filters.search)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.sortBy) params.append('sortBy', filters.sortBy)
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)
    if (filters?.paymentStatus?.length) {
      params.append('paymentStatus', filters.paymentStatus.join(','))
    }
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom)
    if (filters?.dateTo) params.append('dateTo', filters.dateTo)
    if (filters?.dueDateFrom) params.append('dueDateFrom', filters.dueDateFrom)
    if (filters?.dueDateTo) params.append('dueDateTo', filters.dueDateTo)
    if (filters?.supplierId) params.append('supplierId', filters.supplierId)
    if (filters?.minAmount) params.append('minAmount', filters.minAmount.toString())
    if (filters?.maxAmount) params.append('maxAmount', filters.maxAmount.toString())
    if (filters?.overdueOnly) params.append('overdueOnly', 'true')
    if (filters?.agingCategory?.length) {
      params.append('agingCategory', filters.agingCategory.join(','))
    }
    
    const queryString = params.toString()
    const url = queryString 
      ? `${baseUrl}/api/sppg/procurement/payments?${queryString}`
      : `${baseUrl}/api/sppg/procurement/payments`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch payments')
    }
    
    return response.json()
  },

  /**
   * Get payment transaction by ID
   * @param id - Payment transaction ID
   * @param headers - Optional headers for SSR
   */
  async getById(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<PaymentTransaction>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/procurement/payments/${id}`,
      getFetchOptions(headers)
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch payment transaction')
    }
    
    return response.json()
  },

  /**
   * Create new payment transaction
   * @param data - Payment transaction creation data
   * @param headers - Optional headers for SSR
   */
  async create(
    data: PaymentTransactionFormInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<PaymentTransaction>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/procurement/payments`, {
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
      throw new Error(error.error || 'Failed to create payment transaction')
    }
    
    return response.json()
  },

  /**
   * Update existing payment transaction
   * @param id - Payment transaction ID
   * @param data - Updated payment data
   * @param headers - Optional headers for SSR
   */
  async update(
    id: string,
    data: PaymentTransactionUpdateInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<PaymentTransaction>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/procurement/payments/${id}`, {
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
      throw new Error(error.error || 'Failed to update payment transaction')
    }
    
    return response.json()
  },

  /**
   * Delete payment transaction
   * @param id - Payment transaction ID
   * @param headers - Optional headers for SSR
   */
  async delete(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<void>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/procurement/payments/${id}`, {
      ...getFetchOptions(headers),
      method: 'DELETE',
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete payment transaction')
    }
    
    return response.json()
  },

  /**
   * Get overdue payments
   * @param headers - Optional headers for SSR
   */
  async getOverdue(
    headers?: HeadersInit
  ): Promise<ApiResponse<{ payments: OverduePayment[]; summary: Record<string, unknown> }>> {
    const baseUrl = getBaseUrl()
    const url = `${baseUrl}/api/sppg/procurement/payments/overdue`
    
    try {
      const response = await fetch(url, getFetchOptions(headers))
      
      if (!response.ok) {
        let errorMessage = `Failed to fetch overdue payments (${response.status})`
        let errorData: Record<string, unknown> | null = null
        
        try {
          errorData = await response.json()
          errorMessage = (errorData?.error as string) || (errorData?.message as string) || errorMessage
          
          console.error('[paymentApi.getOverdue] API Error:', 
            `\nStatus: ${response.status} ${response.statusText}`,
            '\nError:', errorData?.error,
            '\nMessage:', errorData?.message,
            '\nDetails:', errorData?.details,
            '\nURL:', url
          )
        } catch (parseError) {
          console.error('[paymentApi.getOverdue] Error parsing error response:', 
            parseError instanceof Error ? parseError.message : String(parseError),
            '\nRaw status:', response.status, response.statusText
          )
        }
        
        // Include status code and additional context in error
        const enhancedError = new Error(errorMessage) as Error & {
          status: number
          statusText: string
          errorData: Record<string, unknown> | null
        }
        enhancedError.status = response.status
        enhancedError.statusText = response.statusText
        enhancedError.errorData = errorData
        throw enhancedError
      }
      
      return response.json()
    } catch (error) {
      // If it's already our enhanced error, just rethrow
      if (error instanceof Error && 'status' in error) {
        throw error
      }
      
      // Network or other errors
      console.error('[paymentApi.getOverdue] Request failed:',
        '\nError:', error instanceof Error ? error.message : String(error),
        '\nError Stack:', error instanceof Error ? error.stack : 'N/A',
        '\nURL:', url
      )
      throw error
    }
  },

  /**
   * Get aging report
   * @param filters - Optional aging report filters
   * @param headers - Optional headers for SSR
   */
  async getAging(
    filters?: AgingReportFilters,
    headers?: HeadersInit
  ): Promise<ApiResponse<AgingReportResponse>> {
    const baseUrl = getBaseUrl()
    
    // Build query string if filters provided
    const params = new URLSearchParams()
    if (filters?.supplierId) params.append('supplierId', filters.supplierId)
    
    const queryString = params.toString()
    const url = queryString 
      ? `${baseUrl}/api/sppg/procurement/payments/aging?${queryString}`
      : `${baseUrl}/api/sppg/procurement/payments/aging`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch aging report')
    }
    
    return response.json()
  },

  /**
   * Get payment statistics
   * @param query - Optional statistics query parameters
   * @param headers - Optional headers for SSR
   */
  async getStats(
    query?: PaymentStatsQuery,
    headers?: HeadersInit
  ): Promise<ApiResponse<PaymentStats>> {
    const baseUrl = getBaseUrl()
    
    // Build query string if query provided
    const params = new URLSearchParams()
    if (query?.supplierId) params.append('supplierId', query.supplierId)
    
    const queryString = params.toString()
    const url = queryString 
      ? `${baseUrl}/api/sppg/procurement/payments/stats?${queryString}`
      : `${baseUrl}/api/sppg/procurement/payments/stats`
    
    try {
      const response = await fetch(url, getFetchOptions(headers))
      
      if (!response.ok) {
        let errorMessage = `Failed to fetch payment statistics (${response.status})`
        let errorData: Record<string, unknown> | null = null
        
        try {
          errorData = await response.json()
          errorMessage = (errorData?.error as string) || (errorData?.message as string) || errorMessage
          
          console.error('[paymentApi.getStats] API Error:', 
            `\nStatus: ${response.status} ${response.statusText}`,
            '\nError:', errorData?.error,
            '\nMessage:', errorData?.message,
            '\nDetails:', errorData?.details,
            '\nURL:', url
          )
        } catch (parseError) {
          console.error('[paymentApi.getStats] Error parsing error response:', 
            parseError instanceof Error ? parseError.message : String(parseError),
            '\nRaw status:', response.status, response.statusText
          )
        }
        
        // Include status code and additional context in error
        const enhancedError = new Error(errorMessage) as Error & {
          status: number
          statusText: string
          errorData: Record<string, unknown> | null
        }
        enhancedError.status = response.status
        enhancedError.statusText = response.statusText
        enhancedError.errorData = errorData
        throw enhancedError
      }
      
      return response.json()
    } catch (error) {
      // If it's already our enhanced error, just rethrow
      if (error instanceof Error && 'status' in error) {
        throw error
      }
      
      // Network or other errors
      console.error('[paymentApi.getStats] Request failed:',
        '\nError:', error instanceof Error ? error.message : String(error),
        '\nError Stack:', error instanceof Error ? error.stack : 'N/A',
        '\nURL:', url
      )
      throw error
    }
  },
}
