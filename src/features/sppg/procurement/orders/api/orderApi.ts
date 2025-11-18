/**
 * @fileoverview Procurement Orders API Client - Enterprise-grade
 * @version Next.js 15.5.4 / TypeScript 5.7.2
 * @author Bagizi-ID Development Team
 * @see {@link /docs/COPILOT_INSTRUCTIONS_API_CLIENT_UPDATE.md} API Client Pattern
 * 
 * CRITICAL: Centralized API client for all order operations
 * - Supports both Client Components (CSR) and Server Components (SSR)
 * - Uses getBaseUrl() and getFetchOptions() from @/lib/api-utils
 * - Returns consistent ApiResponse<T> structure
 * - Handles errors with proper messages
 * 
 * USAGE:
 * ```typescript
 * // Client-side (hooks, stores)
 * const orders = await orderApi.getAll()
 * 
 * // Server-side (Server Components)
 * const orders = await orderApi.getAll(undefined, headers())
 * ```
 */

import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import type { ApiResponse } from '@/lib/api-utils'
import type {
  Order,
  OrderWithDetails,
  OrderFormInput,
  OrderUpdateInput,
  OrderFilters,
  OrderStats,
  PaginatedOrders,
  PaginationParams,
} from '../types'
import type {
  ApproveOrderInput,
  RejectOrderInput,
  CancelOrderInput,
} from '../schemas'

// ================================ MAIN API CLIENT ================================

/**
 * Orders API client with enterprise patterns
 * All methods support SSR via optional headers parameter
 */
export const orderApi = {
  /**
   * Fetch all orders with optional filtering
   * @param filters - Optional filter parameters
   * @param pagination - Optional pagination parameters
   * @param headers - Optional headers for SSR
   * @returns Promise with paginated orders
   * 
   * @example
   * ```typescript
   * // Client-side
   * const result = await orderApi.getAll({ status: ['DRAFT'] })
   * 
   * // Server-side (SSR)
   * const result = await orderApi.getAll(undefined, undefined, headers())
   * ```
   */
  async getAll(
    filters?: OrderFilters,
    pagination?: PaginationParams,
    headers?: HeadersInit
  ): Promise<ApiResponse<PaginatedOrders>> {
    const baseUrl = getBaseUrl()
    
    // Build query string
    const params = new URLSearchParams()
    
    // Filters
    if (filters?.search) params.append('search', filters.search)
    if (filters?.status) filters.status.forEach(s => params.append('status', s))
    if (filters?.deliveryStatus) filters.deliveryStatus.forEach(d => params.append('deliveryStatus', d))
    if (filters?.paymentStatus) filters.paymentStatus.forEach(p => params.append('paymentStatus', p))
    if (filters?.supplierId) params.append('supplierId', filters.supplierId)
    if (filters?.planId) params.append('planId', filters.planId)
    if (filters?.purchaseMethod) filters.purchaseMethod.forEach(m => params.append('purchaseMethod', m))
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom)
    if (filters?.dateTo) params.append('dateTo', filters.dateTo)
    if (filters?.minAmount !== undefined) params.append('minAmount', filters.minAmount.toString())
    if (filters?.maxAmount !== undefined) params.append('maxAmount', filters.maxAmount.toString())
    if (filters?.priority) params.append('priority', filters.priority)
    if (filters?.approvalStatus) filters.approvalStatus.forEach(a => params.append('approvalStatus', a))
    
    // Pagination
    if (pagination?.page) params.append('page', pagination.page.toString())
    if (pagination?.pageSize) params.append('pageSize', pagination.pageSize.toString())
    
    const queryString = params.toString()
    const url = queryString 
      ? `${baseUrl}/api/sppg/procurement/orders?${queryString}`
      : `${baseUrl}/api/sppg/procurement/orders`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch orders' }))
      throw new Error(error.error || 'Failed to fetch orders')
    }
    
    return response.json()
  },

  /**
   * Fetch single order by ID
   * @param id - Order ID
   * @param headers - Optional headers for SSR
   * @returns Promise with order details
   * 
   * @example
   * ```typescript
   * const result = await orderApi.getById('order-id')
   * ```
   */
  async getById(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<OrderWithDetails>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/procurement/orders/${id}`,
      getFetchOptions(headers)
    )
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch order' }))
      throw new Error(error.error || 'Failed to fetch order')
    }
    
    return response.json()
  },

  /**
   * Create new order
   * @param data - Order creation data
   * @param headers - Optional headers for SSR
   * @returns Promise with created order
   * 
   * @example
   * ```typescript
   * const result = await orderApi.create({
   *   supplierId: 'supplier-id',
   *   procurementDate: '2024-01-01',
   *   items: [...]
   * })
   * ```
   */
  async create(
    data: OrderFormInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<Order>> {
    const baseUrl = getBaseUrl()
    console.log('🟢 orderApi.create called')
    console.log('🟢 baseUrl:', baseUrl)
    console.log('🟢 data:', data)
    
    const response = await fetch(`${baseUrl}/api/sppg/procurement/orders`, {
      ...getFetchOptions(headers),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    })
    
    console.log('🟢 Response status:', response.status)
    console.log('🟢 Response ok:', response.ok)
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to create order' }))
      console.error('🔴 API Error:', error)
      throw new Error(error.error || 'Failed to create order')
    }
    
    const result = await response.json()
    console.log('🟢 API Success:', result)
    return result
  },

  /**
   * Update existing order
   * @param id - Order ID
   * @param data - Order update data
   * @param headers - Optional headers for SSR
   * @returns Promise with updated order
   * 
   * @example
   * ```typescript
   * const result = await orderApi.update('order-id', {
   *   expectedDelivery: '2024-01-15'
   * })
   * ```
   */
  async update(
    id: string,
    data: OrderUpdateInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<Order>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/procurement/orders/${id}`, {
      ...getFetchOptions(headers),
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to update order' }))
      throw new Error(error.error || 'Failed to update order')
    }
    
    return response.json()
  },

  /**
   * Delete order
   * @param id - Order ID
   * @param headers - Optional headers for SSR
   * @returns Promise with success status
   * 
   * @example
   * ```typescript
   * await orderApi.delete('order-id')
   * ```
   */
  async delete(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<void>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/procurement/orders/${id}`, {
      ...getFetchOptions(headers),
      method: 'DELETE',
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to delete order' }))
      throw new Error(error.error || 'Failed to delete order')
    }
    
    return response.json()
  },

  // ================================ ACTIONS ================================

  /**
   * Approve order
   * @param id - Order ID
   * @param data - Approval data
   * @param headers - Optional headers for SSR
   * @returns Promise with updated order
   * 
   * @example
   * ```typescript
   * const result = await orderApi.approve('order-id', {
   *   approvalNotes: 'Approved for procurement'
   * })
   * ```
   */
  async approve(
    id: string,
    data: ApproveOrderInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<Order>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/procurement/orders/${id}/approve`, {
      ...getFetchOptions(headers),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to approve order' }))
      throw new Error(error.error || 'Failed to approve order')
    }
    
    return response.json()
  },

  /**
   * Reject order
   * @param id - Order ID
   * @param data - Rejection data
   * @param headers - Optional headers for SSR
   * @returns Promise with updated order
   * 
   * @example
   * ```typescript
   * const result = await orderApi.reject('order-id', {
   *   rejectionReason: 'Budget constraints'
   * })
   * ```
   */
  async reject(
    id: string,
    data: RejectOrderInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<Order>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/procurement/orders/${id}/reject`, {
      ...getFetchOptions(headers),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to reject order' }))
      throw new Error(error.error || 'Failed to reject order')
    }
    
    return response.json()
  },

  /**
   * Cancel order
   * @param id - Order ID
   * @param data - Cancellation data
   * @param headers - Optional headers for SSR
   * @returns Promise with updated order
   * 
   * @example
   * ```typescript
   * const result = await orderApi.cancel('order-id', {
   *   cancellationReason: 'Supplier not available',
   *   refundRequired: false
   * })
   * ```
   */
  /**
   * Escalate order approval to higher authority
   * @param id - Order ID
   * @param data - Escalation data (escalateToRole, reason)
   * @param headers - Optional headers for SSR
   * @returns Promise with escalation result
   * 
   * @example
   * ```typescript
   * const result = await orderApi.escalate(orderId, {
   *   escalateToRole: 'SPPG_KEPALA',
   *   reason: 'Urgent approval needed'
   * })
   * ```
   */
  async escalate(
    id: string,
    data: { escalateToRole: string; reason: string },
    headers?: HeadersInit
  ): Promise<ApiResponse<Order>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/procurement/orders/${id}/escalate`, {
      ...getFetchOptions(headers),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to escalate order' }))
      throw new Error(error.error || 'Failed to escalate order')
    }
    
    return response.json()
  },

  /**
   * Cancel order
   * @param id - Order ID
   * @param data - Cancel data
   * @param headers - Optional headers for SSR
   * @returns Promise with cancelled order
   */
  async cancel(
    id: string,
    data: CancelOrderInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<Order>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/procurement/orders/${id}/cancel`, {
      ...getFetchOptions(headers),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to cancel order' }))
      throw new Error(error.error || 'Failed to cancel order')
    }
    
    return response.json()
  },

  // ================================ STATISTICS ================================

  /**
   * Fetch order statistics
   * @param filters - Optional filter parameters
   * @param headers - Optional headers for SSR
   * @returns Promise with order stats
   * 
   * @example
   * ```typescript
   * const result = await orderApi.getStats({
   *   dateFrom: '2024-01-01',
   *   dateTo: '2024-01-31'
   * })
   * ```
   */
  async getStats(
    filters?: OrderFilters,
    headers?: HeadersInit
  ): Promise<ApiResponse<OrderStats>> {
    const baseUrl = getBaseUrl()
    
    // Build query string
    const params = new URLSearchParams()
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom)
    if (filters?.dateTo) params.append('dateTo', filters.dateTo)
    if (filters?.supplierId) params.append('supplierId', filters.supplierId)
    if (filters?.status) filters.status.forEach(s => params.append('status', s))
    
    const queryString = params.toString()
    const url = queryString 
      ? `${baseUrl}/api/sppg/procurement/orders/stats?${queryString}`
      : `${baseUrl}/api/sppg/procurement/orders/stats`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch stats' }))
      throw new Error(error.error || 'Failed to fetch order statistics')
    }
    
    return response.json()
  },
}

// ================================ TYPE EXPORTS ================================

export type { ApiResponse } from '@/lib/api-utils'
