/**
 * @fileoverview Receipt API Client
 * @version Next.js 15.5.4 / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/PROCUREMENT_WORKFLOW_GUIDE.md} Procurement Documentation
 */

import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import type { ApiResponse } from '@/lib/api-utils'
import type {
  Receipt,
  ReceiptWithDetails,
  ReceiptListItem,
  ReceiptStats,
  CreateReceiptInput,
  UpdateReceiptInput,
  QualityControlInput,
  ReceiptFilters,
  ReceiptSort
} from '../types'

// ================================ HELPER FUNCTIONS ================================

/**
 * Convert date strings to Date objects in receipt data
 */
function convertReceiptDates<T extends { actualDelivery?: string | Date | null, expectedDelivery?: string | Date | null, createdAt?: string | Date, updatedAt?: string | Date }>(receipt: T): T {
  return {
    ...receipt,
    actualDelivery: receipt.actualDelivery 
      ? (typeof receipt.actualDelivery === 'string' ? new Date(receipt.actualDelivery) : receipt.actualDelivery)
      : null,
    expectedDelivery: receipt.expectedDelivery 
      ? (typeof receipt.expectedDelivery === 'string' ? new Date(receipt.expectedDelivery) : receipt.expectedDelivery)
      : null,
    createdAt: receipt.createdAt 
      ? (typeof receipt.createdAt === 'string' ? new Date(receipt.createdAt) : receipt.createdAt)
      : receipt.createdAt,
    updatedAt: receipt.updatedAt 
      ? (typeof receipt.updatedAt === 'string' ? new Date(receipt.updatedAt) : receipt.updatedAt)
      : receipt.updatedAt
  }
}

/**
 * Receipt API client with enterprise patterns
 * All methods support SSR via optional headers parameter
 * 
 * @example
 * ```typescript
 * // Client-side usage
 * const result = await receiptApi.getAll()
 * 
 * // Server-side usage (SSR/RSC)
 * const result = await receiptApi.getAll(undefined, headers())
 * ```
 */
export const receiptApi = {
  /**
   * Fetch all receipts with optional filtering and sorting
   * @param filters - Optional filter parameters
   * @param sort - Optional sort configuration
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing receipts
   */
  async getAll(
    filters?: ReceiptFilters,
    sort?: ReceiptSort,
    headers?: HeadersInit
  ): Promise<ApiResponse<ReceiptListItem[]>> {
    const baseUrl = getBaseUrl()
    
    // Build query string
    const params = new URLSearchParams()
    if (filters?.supplierId) params.append('supplierId', filters.supplierId)
    if (filters?.deliveryStatus) params.append('deliveryStatus', filters.deliveryStatus)
    if (filters?.qualityGrade) params.append('qualityGrade', filters.qualityGrade)
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString())
    if (filters?.dateTo) params.append('dateTo', filters.dateTo.toISOString())
    if (filters?.inspectedBy) params.append('inspectedBy', filters.inspectedBy)
    if (filters?.searchTerm) params.append('search', filters.searchTerm)
    if (sort?.field) params.append('sortField', sort.field)
    if (sort?.direction) params.append('sortDirection', sort.direction)
    
    const queryString = params.toString()
    const url = queryString 
      ? `${baseUrl}/api/sppg/procurement/receipts?${queryString}`
      : `${baseUrl}/api/sppg/procurement/receipts`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch receipts')
    }
    
    const result = await response.json()
    
    // Convert date strings to Date objects
    if (result.success && result.data && Array.isArray(result.data)) {
      result.data = result.data.map(convertReceiptDates)
    }
    
    return result
  },

  /**
   * Fetch receipt statistics
   * @param headers - Optional headers for SSR
   */
  async getStats(headers?: HeadersInit): Promise<ApiResponse<ReceiptStats>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/procurement/receipts/stats`,
      getFetchOptions(headers)
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch receipt stats')
    }
    
    return response.json()
  },

  /**
   * Fetch single receipt by ID with full details
   * @param id - Receipt ID
   * @param headers - Optional headers for SSR
   */
  async getById(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<ReceiptWithDetails>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/procurement/receipts/${id}`,
      getFetchOptions(headers)
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch receipt')
    }
    
    const result = await response.json()
    
    // Convert date strings to Date objects
    if (result.success && result.data) {
      result.data = convertReceiptDates(result.data)
      
      // Also convert dates in items if present
      if (result.data.items && Array.isArray(result.data.items)) {
        result.data.items = result.data.items.map((item: { createdAt?: string | Date, updatedAt?: string | Date }) => ({
          ...item,
          createdAt: item.createdAt ? (typeof item.createdAt === 'string' ? new Date(item.createdAt) : item.createdAt) : item.createdAt,
          updatedAt: item.updatedAt ? (typeof item.updatedAt === 'string' ? new Date(item.updatedAt) : item.updatedAt) : item.updatedAt
        }))
      }
    }
    
    return result
  },

  /**
   * Create new receipt from procurement order
   * @param data - Receipt creation data
   * @param headers - Optional headers for SSR
   */
  async create(
    data: CreateReceiptInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<Receipt>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/procurement/receipts`, {
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
      throw new Error(error.error || 'Failed to create receipt')
    }
    
    const result = await response.json()
    
    // Convert date strings to Date objects
    if (result.success && result.data) {
      result.data = convertReceiptDates(result.data)
    }
    
    return result
  },

  /**
   * Update existing receipt
   * @param id - Receipt ID
   * @param data - Receipt update data
   * @param headers - Optional headers for SSR
   */
  async update(
    id: string,
    data: UpdateReceiptInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<Receipt>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/procurement/receipts/${id}`, {
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
      throw new Error(error.error || 'Failed to update receipt')
    }
    
    const result = await response.json()
    
    // Convert date strings to Date objects
    if (result.success && result.data) {
      result.data = convertReceiptDates(result.data)
    }
    
    return result
  },

  /**
   * Submit quality control inspection
   * @param data - Quality control data
   * @param headers - Optional headers for SSR
   */
  async submitQualityControl(
    data: QualityControlInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<Receipt>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/procurement/receipts/${data.receiptId}/quality-control`,
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
      throw new Error(error.error || 'Failed to submit quality control')
    }
    
    const result = await response.json()
    
    // Convert date strings to Date objects
    if (result.success && result.data) {
      result.data = convertReceiptDates(result.data)
    }
    
    return result
  },

  /**
   * Accept receipt (mark as completed)
   * @param id - Receipt ID
   * @param headers - Optional headers for SSR
   */
  async accept(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<Receipt>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/procurement/receipts/${id}/accept`,
      {
        ...getFetchOptions(headers),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      }
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to accept receipt')
    }
    
    const result = await response.json()
    
    // Convert date strings to Date objects
    if (result.success && result.data) {
      result.data = convertReceiptDates(result.data)
    }
    
    return result
  },

  /**
   * Reject receipt with reason
   * @param id - Receipt ID
   * @param reason - Rejection reason
   * @param headers - Optional headers for SSR
   */
  async reject(
    id: string,
    reason: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<Receipt>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/procurement/receipts/${id}/reject`,
      {
        ...getFetchOptions(headers),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({ reason }),
      }
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to reject receipt')
    }
    
    const result = await response.json()
    
    // Convert date strings to Date objects
    if (result.success && result.data) {
      result.data = convertReceiptDates(result.data)
    }
    
    return result
  },

  /**
   * Delete receipt
   * @param id - Receipt ID
   * @param headers - Optional headers for SSR
   */
  async delete(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<void>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/procurement/receipts/${id}`,
      {
        ...getFetchOptions(headers),
        method: 'DELETE',
      }
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete receipt')
    }
    
    return response.json()
  },

  /**
   * Get pending procurements (ready for receipt)
   * @param headers - Optional headers for SSR
   */
  /**
   * Get pending procurements ready for receipt
   */
  async getPendingProcurements(
    headers?: HeadersInit
  ): Promise<ApiResponse<Array<{
    id: string
    procurementCode: string
    supplierName: string | null
    expectedDelivery: Date | null
    totalAmount: number
    items: Array<{
      id: string
      itemName: string
      quantity: number
      unit: string
      price: number
    }>
  }>>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/procurement/receipts/pending`,
      getFetchOptions(headers)
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch pending procurements')
    }
    
    return response.json()
  },
}
