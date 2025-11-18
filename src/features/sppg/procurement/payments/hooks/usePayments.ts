/**
 * @fileoverview Payment Hooks - TanStack Query integration
 * @version TanStack Query v5 / Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * @see {@link /docs/COPILOT_INSTRUCTIONS_API_CLIENT_UPDATE.md} API Client Pattern
 * 
 * ENTERPRISE PATTERN:
 * - TanStack Query for server state management
 * - Optimistic updates for better UX
 * - Query key factories for cache management
 * - Automatic cache invalidation
 * - Error handling with toast notifications
 * 
 * USAGE:
 * ```typescript
 * // List payments
 * const { data, isLoading } = usePayments({ overdueOnly: true })
 * 
 * // Create payment
 * const { mutate } = useCreatePayment()
 * mutate(paymentData, {
 *   onSuccess: () => toast.success('Payment recorded')
 * })
 * ```
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query'
import { paymentApi } from '../api'
import { toast } from 'sonner'
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
import type { ApiResponse } from '@/lib/api-utils'

// ================================ QUERY KEY FACTORIES ================================

/**
 * Payment query keys for cache management
 */
export const paymentKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentKeys.all, 'list'] as const,
  list: (filters?: PaymentFiltersWithPagination) => [...paymentKeys.lists(), filters] as const,
  details: () => [...paymentKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentKeys.details(), id] as const,
  overdue: () => [...paymentKeys.all, 'overdue'] as const,
  aging: (filters?: AgingReportFilters) => [...paymentKeys.all, 'aging', filters] as const,
  stats: (query?: PaymentStatsQuery) => [...paymentKeys.all, 'stats', query] as const,
}

// ================================ QUERY HOOKS ================================

/**
 * Fetch payments with filters and pagination
 * @param filters - Optional filter parameters
 * @param options - TanStack Query options
 */
export function usePayments(
  filters?: PaymentFiltersWithPagination,
  options?: Omit<UseQueryOptions<ApiResponse<PaginatedPayments>, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: paymentKeys.list(filters),
    queryFn: async () => {
      const result = await paymentApi.getAll(filters)
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch payments')
      }
      return result
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

/**
 * Fetch single payment transaction by ID
 * @param id - Payment transaction ID
 * @param options - TanStack Query options
 */
export function usePayment(
  id: string | null,
  options?: Omit<UseQueryOptions<ApiResponse<PaymentTransaction>, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: paymentKeys.detail(id || ''),
    queryFn: async () => {
      if (!id) throw new Error('Payment transaction ID is required')
      
      const result = await paymentApi.getById(id)
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch payment transaction')
      }
      return result
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

/**
 * Fetch overdue payments
 * @param options - TanStack Query options
 */
export function useOverduePayments(
  options?: Omit<UseQueryOptions<ApiResponse<{ payments: OverduePayment[]; summary: Record<string, unknown> }>, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: paymentKeys.overdue(),
    queryFn: async () => {
      const result = await paymentApi.getOverdue()
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch overdue payments')
      }
      return result
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (more frequent for critical data)
    ...options,
  })
}

/**
 * Fetch aging report
 * @param filters - Optional aging report filters
 * @param options - TanStack Query options
 */
export function useAgingReport(
  filters?: AgingReportFilters,
  options?: Omit<UseQueryOptions<ApiResponse<AgingReportResponse>, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: paymentKeys.aging(filters),
    queryFn: async () => {
      const result = await paymentApi.getAging(filters)
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch aging report')
      }
      return result
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

/**
 * Fetch payment statistics
 * @param query - Optional statistics query parameters
 * @param options - TanStack Query options
 */
export function usePaymentStats(
  query?: PaymentStatsQuery,
  options?: Omit<UseQueryOptions<ApiResponse<PaymentStats>, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: paymentKeys.stats(query),
    queryFn: async () => {
      const result = await paymentApi.getStats(query)
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch payment statistics')
      }
      return result
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for dashboard stats
    ...options,
  })
}

// ================================ MUTATION HOOKS ================================

/**
 * Create new payment transaction
 */
export function useCreatePayment(
  options?: Omit<UseMutationOptions<ApiResponse<PaymentTransaction>, Error, PaymentTransactionFormInput>, 'mutationFn'>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: PaymentTransactionFormInput) => {
      const result = await paymentApi.create(data)
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create payment transaction')
      }
      return result
    },
    onSuccess: (response) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: paymentKeys.overdue() })
      queryClient.invalidateQueries({ queryKey: paymentKeys.aging() })
      queryClient.invalidateQueries({ queryKey: paymentKeys.stats() })
      
      // Show success toast
      const message = response.message || 'Payment transaction recorded successfully'
      toast.success(message)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to record payment transaction')
    },
    ...options,
  })
}

/**
 * Update payment transaction
 */
export function useUpdatePayment(
  options?: Omit<UseMutationOptions<ApiResponse<PaymentTransaction>, Error, { id: string; data: PaymentTransactionUpdateInput }>, 'mutationFn'>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PaymentTransactionUpdateInput }) => {
      const result = await paymentApi.update(id, data)
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update payment transaction')
      }
      return result
    },
    onSuccess: (response, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: paymentKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: paymentKeys.overdue() })
      queryClient.invalidateQueries({ queryKey: paymentKeys.aging() })
      queryClient.invalidateQueries({ queryKey: paymentKeys.stats() })
      
      // Show success toast
      const message = response.message || 'Payment transaction updated successfully'
      toast.success(message)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update payment transaction')
    },
    ...options,
  })
}

/**
 * Delete payment transaction
 */
export function useDeletePayment(
  options?: Omit<UseMutationOptions<ApiResponse<void>, Error, string>, 'mutationFn'>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await paymentApi.delete(id)
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete payment transaction')
      }
      return result
    },
    onSuccess: (response, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: paymentKeys.detail(deletedId) })
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: paymentKeys.overdue() })
      queryClient.invalidateQueries({ queryKey: paymentKeys.aging() })
      queryClient.invalidateQueries({ queryKey: paymentKeys.stats() })
      
      // Show success toast
      const message = response.message || 'Payment transaction deleted successfully'
      toast.success(message)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete payment transaction')
    },
    ...options,
  })
}

// ================================ UTILITY HOOKS ================================

/**
 * Prefetch payments for better UX
 */
export function usePrefetchPayments() {
  const queryClient = useQueryClient()

  return (filters?: PaymentFiltersWithPagination) => {
    queryClient.prefetchQuery({
      queryKey: paymentKeys.list(filters),
      queryFn: async () => {
        const result = await paymentApi.getAll(filters)
        if (!result.success || !result.data) {
          throw new Error(result.error || 'Failed to fetch payments')
        }
        return result
      },
      staleTime: 5 * 60 * 1000,
    })
  }
}

/**
 * Prefetch payment detail for better UX
 */
export function usePrefetchPayment() {
  const queryClient = useQueryClient()

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: paymentKeys.detail(id),
      queryFn: async () => {
        const result = await paymentApi.getById(id)
        if (!result.success || !result.data) {
          throw new Error(result.error || 'Failed to fetch payment transaction')
        }
        return result
      },
      staleTime: 5 * 60 * 1000,
    })
  }
}

/**
 * Invalidate all payment queries (useful after bulk operations)
 */
export function useInvalidatePayments() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: paymentKeys.all })
  }
}
