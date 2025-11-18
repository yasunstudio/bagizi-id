/**
 * @fileoverview Procurement Items API Client
 * Centralized API calls for procurement items management
 * 
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Section 2a - API Client Pattern
 */

import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import type { ApiResponse } from '@/lib/api-utils'
import type {
  ProcurementItemResponse,
  CreateProcurementItemInput,
  UpdateProcurementItemInput,
  ProcurementItemFilters,
  ProcurementItemStats,
} from '../types/item.types'

/**
 * Procurement Items API client with enterprise patterns
 * All methods support SSR via optional headers parameter
 * 
 * @example
 * ```typescript
 * // Client-side usage
 * const items = await itemsApi.getAll(orderId)
 * 
 * // Server-side usage (SSR/RSC)
 * const items = await itemsApi.getAll(orderId, headers())
 * ```
 */
export const itemsApi = {
  /**
   * Fetch all items for a procurement order
   * @param orderId - Procurement order ID
   * @param filters - Optional filter parameters
   * @param headers - Optional headers for SSR
   */
  async getAll(
    orderId: string,
    filters?: ProcurementItemFilters,
    headers?: HeadersInit
  ): Promise<ApiResponse<ProcurementItemResponse[]>> {
    const baseUrl = getBaseUrl()
    
    const params = new URLSearchParams()
    if (filters?.category) params.append('category', filters.category)
    if (filters?.isAccepted !== undefined) params.append('isAccepted', String(filters.isAccepted))
    if (filters?.hasQualityIssues) params.append('hasQualityIssues', 'true')
    if (filters?.search) params.append('search', filters.search)
    
    const queryString = params.toString()
    const url = queryString 
      ? `${baseUrl}/api/sppg/procurement/orders/${orderId}/items?${queryString}`
      : `${baseUrl}/api/sppg/procurement/orders/${orderId}/items`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch procurement items')
    }
    
    return response.json()
  },

  /**
   * Get single item detail
   * @param orderId - Procurement order ID
   * @param itemId - Item ID
   * @param headers - Optional headers for SSR
   */
  async getById(
    orderId: string,
    itemId: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<ProcurementItemResponse>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/procurement/orders/${orderId}/items/${itemId}`,
      getFetchOptions(headers)
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch item')
    }
    
    return response.json()
  },

  /**
   * Create new procurement item
   * @param orderId - Procurement order ID
   * @param data - Item creation data
   * @param headers - Optional headers for SSR
   */
  async create(
    orderId: string,
    data: CreateProcurementItemInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<ProcurementItemResponse>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/procurement/orders/${orderId}/items`,
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
      const error = await response.json()
      throw new Error(error.error || 'Failed to create item')
    }
    
    return response.json()
  },

  /**
   * Update existing item (receiving/QC)
   * @param orderId - Procurement order ID
   * @param itemId - Item ID
   * @param data - Item update data
   * @param headers - Optional headers for SSR
   */
  async update(
    orderId: string,
    itemId: string,
    data: UpdateProcurementItemInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<ProcurementItemResponse>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/procurement/orders/${orderId}/items/${itemId}`,
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
      const error = await response.json()
      throw new Error(error.error || 'Failed to update item')
    }
    
    return response.json()
  },

  /**
   * Delete item
   * @param orderId - Procurement order ID
   * @param itemId - Item ID
   * @param headers - Optional headers for SSR
   */
  async delete(
    orderId: string,
    itemId: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<void>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/procurement/orders/${orderId}/items/${itemId}`,
      {
        ...getFetchOptions(headers),
        method: 'DELETE',
      }
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete item')
    }
    
    return response.json()
  },

  /**
   * Get items statistics
   * @param orderId - Procurement order ID
   * @param headers - Optional headers for SSR
   */
  async getStats(
    orderId: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<ProcurementItemStats>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/procurement/orders/${orderId}/items/stats`,
      getFetchOptions(headers)
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch statistics')
    }
    
    return response.json()
  },

  /**
   * Bulk receive items (QC workflow)
   * @param orderId - Procurement order ID
   * @param items - Array of item updates
   * @param headers - Optional headers for SSR
   */
  async bulkReceive(
    orderId: string,
    items: Array<{
      itemId: string
      receivedQuantity: number
      isAccepted: boolean
      qualityReceived?: string
      gradeReceived?: string
      rejectionReason?: string
    }>,
    headers?: HeadersInit
  ): Promise<ApiResponse<{ updated: number; items: ProcurementItemResponse[] }>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/procurement/orders/${orderId}/items/bulk-receive`,
      {
        ...getFetchOptions(headers),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({ items }),
      }
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to bulk receive items')
    }
    
    return response.json()
  },
}
