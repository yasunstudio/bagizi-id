/**
 * @fileoverview API client untuk Budget Transactions
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
  BudgetTransaction,
  BudgetTransactionWithRelations,
  BudgetTransactionListItem,
} from '../types'
import type {
  BudgetTransactionCreateInput,
  BudgetTransactionUpdateInput,
} from '../lib/schemas'

/**
 * Budget Transactions API client dengan enterprise patterns
 * All methods support SSR via optional headers parameter
 * 
 * @example
 * ```typescript
 * // Client-side usage
 * const transactions = await budgetTransactionsApi.getAll()
 * 
 * // Server-side usage (SSR/RSC)
 * const transactions = await budgetTransactionsApi.getAll(headers())
 * ```
 */
export const budgetTransactionsApi = {
  /**
   * Fetch all budget transactions
   * Auto-filtered by sppgId pada server (multi-tenant security)
   * 
   * @param filters - Optional filter parameters
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing transactions array
   */
  async getAll(
    filters?: {
      programId?: string
      allocationId?: string
      category?: string
      startDate?: string
      endDate?: string
    },
    headers?: HeadersInit
  ): Promise<ApiResponse<BudgetTransactionListItem[]>> {
    const baseUrl = getBaseUrl()
    
    // Build query string
    const params = new URLSearchParams()
    if (filters?.programId) params.append('programId', filters.programId)
    if (filters?.allocationId) params.append('allocationId', filters.allocationId)
    if (filters?.category) params.append('category', filters.category)
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    
    const queryString = params.toString()
    const url = queryString 
      ? `${baseUrl}/api/sppg/budget-transactions?${queryString}`
      : `${baseUrl}/api/sppg/budget-transactions`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch budget transactions')
    }
    
    return response.json()
  },

  /**
   * Fetch budget transactions by program ID
   * 
   * @param programId - Program ID
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing transactions for specific program
   */
  async getByProgramId(
    programId: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<BudgetTransaction[]>> {
    const baseUrl = getBaseUrl()
    const url = `${baseUrl}/api/sppg/budget-transactions?programId=${programId}`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch program transactions')
    }
    
    return response.json()
  },

  /**
   * Fetch budget transactions by allocation ID
   * 
   * @param allocationId - Allocation ID
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing transactions for specific allocation
   */
  async getByAllocationId(
    allocationId: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<BudgetTransaction[]>> {
    const baseUrl = getBaseUrl()
    const url = `${baseUrl}/api/sppg/budget-transactions?allocationId=${allocationId}`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch allocation transactions')
    }
    
    return response.json()
  },

  /**
   * Fetch single budget transaction by ID
   * 
   * @param id - Transaction ID
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing transaction detail
   */
  async getById(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<BudgetTransactionWithRelations>> {
    const baseUrl = getBaseUrl()
    const url = `${baseUrl}/api/sppg/budget-transactions/${id}`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch budget transaction')
    }
    
    return response.json()
  },

  /**
   * Create new budget transaction
   * Server akan auto-update usedAmount di ProgramBudgetAllocation
   * 
   * @param data - Transaction creation data
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing created transaction
   */
  async create(
    data: BudgetTransactionCreateInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<BudgetTransaction>> {
    const baseUrl = getBaseUrl()
    const url = `${baseUrl}/api/sppg/budget-transactions`
    
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
      throw new Error(error.error || 'Failed to create budget transaction')
    }
    
    return response.json()
  },

  /**
   * Update budget transaction
   * Server akan auto-sync usedAmount di ProgramBudgetAllocation jika amount berubah
   * 
   * @param id - Transaction ID
   * @param data - Transaction update data
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing updated transaction
   */
  async update(
    id: string,
    data: BudgetTransactionUpdateInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<BudgetTransaction>> {
    const baseUrl = getBaseUrl()
    const url = `${baseUrl}/api/sppg/budget-transactions/${id}`
    
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
      throw new Error(error.error || 'Failed to update budget transaction')
    }
    
    return response.json()
  },

  /**
   * Delete budget transaction
   * Server akan auto-adjust usedAmount di ProgramBudgetAllocation
   * 
   * @param id - Transaction ID
   * @param headers - Optional headers for SSR
   * @returns Promise with API response
   */
  async delete(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<void>> {
    const baseUrl = getBaseUrl()
    const url = `${baseUrl}/api/sppg/budget-transactions/${id}`
    
    const response = await fetch(url, {
      ...getFetchOptions(headers),
      method: 'DELETE',
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete budget transaction')
    }
    
    return response.json()
  },

  /**
   * Approve budget transaction (untuk verifikasi transaksi)
   * 
   * @param id - Transaction ID
   * @param data - Approval data (approver info, notes)
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing approved transaction
   */
  async approve(
    id: string,
    data: {
      approvedBy: string
      approvalNotes?: string
    },
    headers?: HeadersInit
  ): Promise<ApiResponse<BudgetTransaction>> {
    const baseUrl = getBaseUrl()
    const url = `${baseUrl}/api/sppg/budget-transactions/${id}/approve`
    
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
      throw new Error(error.error || 'Failed to approve transaction')
    }
    
    return response.json()
  },
}
