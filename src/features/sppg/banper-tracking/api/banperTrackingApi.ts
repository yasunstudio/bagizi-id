/**
 * @fileoverview API client untuk Banper Request Tracking
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
  BanperRequestTracking,
  BanperRequestTrackingWithRelations,
  BanperRequestTrackingListItem,
} from '../types'
import type {
  BanperRequestTrackingCreateInput,
  BanperRequestTrackingSubmitInput,
  BanperRequestTrackingApprovalInput,
  BanperRequestTrackingDisbursementInput,
  BanperRequestTrackingUpdateInput,
} from '../lib/schemas'

/**
 * Banper Tracking API client dengan enterprise patterns
 * All methods support SSR via optional headers parameter
 * 
 * @example
 * ```typescript
 * // Client-side usage
 * const trackings = await banperTrackingApi.getAll()
 * 
 * // Server-side usage (SSR/RSC)
 * const trackings = await banperTrackingApi.getAll(headers())
 * ```
 */
export const banperTrackingApi = {
  /**
   * Fetch all Banper request trackings
   * Auto-filtered by sppgId pada server (multi-tenant security)
   * 
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing trackings array
   */
  async getAll(
    headers?: HeadersInit
  ): Promise<ApiResponse<BanperRequestTrackingListItem[]>> {
    const baseUrl = getBaseUrl()
    const url = `${baseUrl}/api/sppg/banper-tracking`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch Banper trackings')
    }
    
    return response.json()
  },

  /**
   * Fetch single Banper request tracking by ID
   * 
   * @param id - Tracking ID
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing tracking detail
   */
  async getById(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<BanperRequestTrackingWithRelations>> {
    const baseUrl = getBaseUrl()
    const url = `${baseUrl}/api/sppg/banper-tracking/${id}`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch Banper tracking')
    }
    
    return response.json()
  },

  /**
   * Create new Banper request tracking (draft status)
   * 
   * @param data - Tracking creation data
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing created tracking
   */
  async create(
    data: BanperRequestTrackingCreateInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<BanperRequestTracking>> {
    const baseUrl = getBaseUrl()
    const url = `${baseUrl}/api/sppg/banper-tracking`
    
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
      throw new Error(error.error || 'Failed to create Banper tracking')
    }
    
    return response.json()
  },

  /**
   * Update Banper request tracking
   * 
   * @param id - Tracking ID
   * @param data - Tracking update data
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing updated tracking
   */
  async update(
    id: string,
    data: BanperRequestTrackingUpdateInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<BanperRequestTracking>> {
    const baseUrl = getBaseUrl()
    const url = `${baseUrl}/api/sppg/banper-tracking/${id}`
    
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
      throw new Error(error.error || 'Failed to update Banper tracking')
    }
    
    return response.json()
  },

  /**
   * Delete Banper request tracking
   * 
   * @param id - Tracking ID
   * @param headers - Optional headers for SSR
   * @returns Promise with API response
   */
  async delete(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<void>> {
    const baseUrl = getBaseUrl()
    const url = `${baseUrl}/api/sppg/banper-tracking/${id}`
    
    const response = await fetch(url, {
      ...getFetchOptions(headers),
      method: 'DELETE',
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete Banper tracking')
    }
    
    return response.json()
  },

  /**
   * Submit Banper request to BGN portal
   * Changes status from DRAFT_LOCAL to SUBMITTED_TO_BGN
   * 
   * @param id - Tracking ID
   * @param data - Submission data (BGN request number, portal URL, submission date)
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing updated tracking
   */
  async submit(
    id: string,
    data: BanperRequestTrackingSubmitInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<BanperRequestTracking>> {
    const baseUrl = getBaseUrl()
    const url = `${baseUrl}/api/sppg/banper-tracking/${id}/submit`
    
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
      throw new Error(error.error || 'Failed to submit Banper request')
    }
    
    return response.json()
  },

  /**
   * Record BGN approval
   * Changes status to APPROVED_BY_BGN
   * 
   * @param id - Tracking ID
   * @param data - Approval data (approval number, date, approver info, document URL)
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing updated tracking
   */
  async approve(
    id: string,
    data: BanperRequestTrackingApprovalInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<BanperRequestTracking>> {
    const baseUrl = getBaseUrl()
    const url = `${baseUrl}/api/sppg/banper-tracking/${id}/approve`
    
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
      throw new Error(error.error || 'Failed to approve Banper request')
    }
    
    return response.json()
  },

  /**
   * Record budget disbursement
   * Changes status to DISBURSED
   * 
   * @param id - Tracking ID
   * @param data - Disbursement data (amount, date, bank reference, account)
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing updated tracking
   */
  async disburse(
    id: string,
    data: BanperRequestTrackingDisbursementInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<BanperRequestTracking>> {
    const baseUrl = getBaseUrl()
    const url = `${baseUrl}/api/sppg/banper-tracking/${id}/disburse`
    
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
      throw new Error(error.error || 'Failed to record disbursement')
    }
    
    return response.json()
  },
}
