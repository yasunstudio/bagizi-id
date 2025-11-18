/**
 * @fileoverview TanStack Query hooks untuk Budget Transactions
 * @version Next.js 15.5.4 / TanStack Query v5
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * CRITICAL: Menggunakan centralized API client pattern
 * - Import dari ../api/budgetTransactionsApi (NEVER direct fetch)
 * - Optimistic updates untuk better UX
 * - Proper error handling dengan toast notifications
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { budgetTransactionsApi } from '../api/budgetTransactionsApi'
import type {
  BudgetTransactionCreateInput,
  BudgetTransactionUpdateInput,
} from '../lib/schemas'

// Query keys
export const budgetTransactionKeys = {
  all: ['budget-transactions'] as const,
  lists: () => [...budgetTransactionKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...budgetTransactionKeys.lists(), filters] as const,
  details: () => [...budgetTransactionKeys.all, 'detail'] as const,
  detail: (id: string) => [...budgetTransactionKeys.details(), id] as const,
}

/**
 * Hook untuk fetch semua budget transactions
 * Auto-filtered by sppgId pada server (multi-tenant security)
 * 
 * @example
 * ```tsx
 * const { data: transactions, isLoading } = useBudgetTransactions()
 * ```
 */
export function useBudgetTransactions() {
  return useQuery({
    queryKey: budgetTransactionKeys.lists(),
    queryFn: async () => {
      const result = await budgetTransactionsApi.getAll()
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch budget transactions')
      }
      
      return result.data
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
  })
}

/**
 * Hook untuk fetch single budget transaction by ID
 * 
 * @param id - Budget transaction ID
 * @example
 * ```tsx
 * const { data: transaction, isLoading } = useBudgetTransaction(transactionId)
 * ```
 */
export function useBudgetTransaction(id: string) {
  return useQuery({
    queryKey: budgetTransactionKeys.detail(id),
    queryFn: async () => {
      const result = await budgetTransactionsApi.getById(id)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch budget transaction')
      }
      
      return result.data
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook untuk create new budget transaction
 * Automatically updates allocation spentAmount and remainingAmount
 * Invalidates both transaction and allocation queries on success
 * 
 * @example
 * ```tsx
 * const { mutate: createTransaction } = useCreateBudgetTransaction()
 * createTransaction(data, {
 *   onSuccess: () => router.push('/budget-transactions')
 * })
 * ```
 */
export function useCreateBudgetTransaction() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: BudgetTransactionCreateInput) => {
      const result = await budgetTransactionsApi.create(data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create budget transaction')
      }
      
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetTransactionKeys.lists() })
      // Also invalidate budget allocations since spentAmount changed
      queryClient.invalidateQueries({ queryKey: ['budget-allocations'] })
      toast.success('Budget transaction created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create budget transaction')
    },
  })
}

/**
 * Hook untuk update budget transaction
 * If amount changed, recalculates allocation spentAmount
 * Invalidates transaction, detail, and allocation queries on success
 * 
 * @example
 * ```tsx
 * const { mutate: updateTransaction } = useUpdateBudgetTransaction()
 * updateTransaction({ id, data })
 * ```
 */
export function useUpdateBudgetTransaction() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: BudgetTransactionUpdateInput }) => {
      const result = await budgetTransactionsApi.update(id, data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update budget transaction')
      }
      
      return result.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: budgetTransactionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: budgetTransactionKeys.detail(data.id) })
      // Also invalidate budget allocations if amount changed
      queryClient.invalidateQueries({ queryKey: ['budget-allocations'] })
      toast.success('Budget transaction updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update budget transaction')
    },
  })
}

/**
 * Hook untuk approve budget transaction
 * Records approvedBy and approvedAt fields
 * 
 * @example
 * ```tsx
 * const { mutate: approveTransaction } = useApproveBudgetTransaction()
 * approveTransaction({ 
 *   id: transactionId, 
 *   approvedBy: 'John Doe',
 *   approvalNotes: 'Approved for procurement'
 * })
 * ```
 */
export function useApproveBudgetTransaction() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, approvedBy, approvalNotes }: { 
      id: string
      approvedBy: string
      approvalNotes?: string
    }) => {
      const result = await budgetTransactionsApi.approve(id, { approvedBy, approvalNotes })
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to approve budget transaction')
      }
      
      return result.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: budgetTransactionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: budgetTransactionKeys.detail(data.id) })
      toast.success('Budget transaction approved successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve budget transaction')
    },
  })
}

/**
 * Hook untuk delete budget transaction
 * Recalculates allocation spentAmount and remainingAmount
 * 
 * @example
 * ```tsx
 * const { mutate: deleteTransaction } = useDeleteBudgetTransaction()
 * deleteTransaction(transactionId)
 * ```
 */
export function useDeleteBudgetTransaction() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await budgetTransactionsApi.delete(id)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete budget transaction')
      }
      
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetTransactionKeys.lists() })
      // Also invalidate budget allocations since spentAmount changed
      queryClient.invalidateQueries({ queryKey: ['budget-allocations'] })
      toast.success('Budget transaction deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete budget transaction')
    },
  })
}
