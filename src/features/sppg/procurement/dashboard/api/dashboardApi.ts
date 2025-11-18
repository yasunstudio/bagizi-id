/**
 * @fileoverview Procurement Dashboard API Client
 * @description Client for fetching dashboard statistics
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import type { ApiResponse } from '@/lib/api-utils'

/**
 * Dashboard statistics type definitions
 */
export interface DashboardStats {
  orders: {
    total: number
    pending: number
    approved: number
    completed: number
    totalValue: number
    thisMonth: number
  }
  plans: {
    total: number
    active: number
    completed: number
    totalBudget: number
    usedBudget: number
    remainingBudget: number
  }
  suppliers: {
    total: number
    active: number
    preferred: number
    newThisMonth: number
  }
  recentActivities: Array<{
    id: string
    procurementCode: string | null
    procurementDate: Date
    totalAmount: number
    status: string
    supplier: {
      supplierName: string
    } | null
  }>
  pendingApprovals: Array<{
    id: string
    procurementCode: string | null
    procurementDate: Date
    totalAmount: number
    supplier: {
      supplierName: string
    } | null
  }>
  lowStockItems: Array<{
    id: string
    itemName: string
    itemCode: string | null
    currentStock: number
    minStock: number
    unit: string
  }>
  upcomingDeliveries: Array<{
    id: string
    procurementCode: string | null
    expectedDelivery: Date | null
    totalAmount: number
    supplier: {
      supplierName: string
    } | null
  }>
}

/**
 * Dashboard API client with enterprise patterns
 * Supports both client-side and server-side rendering
 * 
 * @example
 * ```typescript
 * // Client-side usage
 * const stats = await dashboardApi.getStats()
 * 
 * // Server-side usage (SSR/RSC)
 * const stats = await dashboardApi.getStats(headers())
 * ```
 */
export const dashboardApi = {
  /**
   * Fetch comprehensive dashboard statistics
   * @param headers - Optional headers for SSR
   * @returns Dashboard stats with real-time data
   */
  async getStats(headers?: HeadersInit): Promise<ApiResponse<DashboardStats>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/procurement/dashboard`, {
      ...getFetchOptions(headers),
      // Cache for 1 minute to reduce DB load
      next: { revalidate: 60 }
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch dashboard statistics')
    }

    return response.json()
  }
}
