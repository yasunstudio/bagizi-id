/**
 * @fileoverview Procurement Orders TanStack Query Hooks - Enterprise-grade
 * @version Next.js 15.5.4 / TanStack Query v5 / TypeScript 5.7.2
 * @author Bagizi-ID Development Team
 * 
 * CRITICAL: Centralized data fetching hooks using TanStack Query v5
 * - All hooks use orderApi client (NO direct fetch calls)
 * - Optimistic updates for mutations
 * - Automatic cache invalidation
 * - Error handling with toast notifications
 * - Loading and error states managed
 * 
 * PATTERN:
 * - Query hooks: useOrders, useOrder, useOrderStats
 * - Mutation hooks: useCreateOrder, useUpdateOrder, useDeleteOrder
 * - Action hooks: useApproveOrder, useRejectOrder, useCancelOrder
 */

'use client'

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
import { orderApi } from '../api'
import type {
  OrderWithDetails,
  OrderFormInput,
  OrderUpdateInput,
  OrderFilters,
  OrderStats,
  PaginatedOrders,
  PaginationParams,
  ApprovedPlan,
  PaymentTerm,
} from '../types'
import type {
  ApproveOrderInput,
  RejectOrderInput,
  CancelOrderInput,
} from '../schemas'
import { toast } from 'sonner'

// ================================ QUERY KEYS ================================

/**
 * Query key factory for orders
 */
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters?: OrderFilters, pagination?: PaginationParams) => 
    [...orderKeys.lists(), { filters, pagination }] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  stats: (filters?: OrderFilters) => [...orderKeys.all, 'stats', { filters }] as const,
}

// ================================ QUERY HOOKS ================================

/**
 * Fetch paginated orders with filters
 * @param filters - Optional filter parameters
 * @param pagination - Optional pagination parameters
 * @param options - TanStack Query options
 * @returns Query result with orders
 * 
 * @example
 * ```typescript
 * const { data, isLoading, error } = useOrders({
 *   status: ['DRAFT', 'PENDING_APPROVAL'],
 *   dateFrom: '2024-01-01'
 * })
 * ```
 */
export function useOrders(
  filters?: OrderFilters,
  pagination?: PaginationParams,
  options?: Omit<UseQueryOptions<PaginatedOrders>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: orderKeys.list(filters, pagination),
    queryFn: async () => {
      const result = await orderApi.getAll(filters, pagination)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch orders')
      }
      
      return result.data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  })
}

/**
 * Fetch single order by ID
 * @param id - Order ID
 * @param options - TanStack Query options
 * @returns Query result with order details
 * 
 * @example
 * ```typescript
 * const { data: order, isLoading } = useOrder('order-id')
 * ```
 */
export function useOrder(
  id: string | undefined,
  options?: Omit<UseQueryOptions<OrderWithDetails>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: orderKeys.detail(id!),
    queryFn: async () => {
      const result = await orderApi.getById(id!)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch order')
      }
      
      return result.data
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  })
}

/**
 * Fetch order statistics
 * @param filters - Optional filter parameters
 * @param options - TanStack Query options
 * @returns Query result with order stats
 * 
 * @example
 * ```typescript
 * const { data: stats } = useOrderStats({
 *   dateFrom: '2024-01-01',
 *   dateTo: '2024-01-31'
 * })
 * ```
 */
export function useOrderStats(
  filters?: OrderFilters,
  options?: Omit<UseQueryOptions<OrderStats>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: orderKeys.stats(filters),
    queryFn: async () => {
      const result = await orderApi.getStats(filters)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch order statistics')
      }
      
      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

// ================================ MUTATION HOOKS ================================

/**
 * Create new order mutation
 * @returns Mutation result
 * 
 * @example
 * ```typescript
 * const { mutate: createOrder, isPending } = useCreateOrder()
 * 
 * createOrder({
 *   supplierId: 'supplier-id',
 *   procurementDate: '2024-01-01',
 *   items: [...]
 * }, {
 *   onSuccess: (data) => {
 *     router.push(`/procurement/orders/${data.id}`)
 *   }
 * })
 * ```
 */
export function useCreateOrder() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: OrderFormInput) => {
      console.log('🔵 useCreateOrder mutation called with:', data)
      const result = await orderApi.create(data)
      console.log('🔵 API response:', result)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create order')
      }
      
      return result.data
    },
    onSuccess: (data) => {
      console.log('✅ Mutation success, data:', data)
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      
      // Add to cache
      queryClient.setQueryData(orderKeys.detail(data.id), data)
      
      // Note: Toast is handled in the component's onSuccess callback
    },
    onError: (error: Error) => {
      console.error('❌ Mutation error:', error)
      // Note: Toast is handled in the component's onError callback
    },
  })
}

/**
 * Update order mutation
 * @returns Mutation result
 * 
 * @example
 * ```typescript
 * const { mutate: updateOrder } = useUpdateOrder()
 * 
 * updateOrder({
 *   id: 'order-id',
 *   data: { expectedDelivery: '2024-01-15' }
 * })
 * ```
 */
export function useUpdateOrder() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: OrderUpdateInput }) => {
      const result = await orderApi.update(id, data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update order')
      }
      
      return result.data
    },
    onSuccess: (data, variables) => {
      // Update specific order in cache
      queryClient.setQueryData(orderKeys.detail(variables.id), data)
      
      // Update in lists cache
      queryClient.setQueriesData<PaginatedOrders>(
        { queryKey: orderKeys.lists() },
        (oldData) => {
          if (!oldData) return oldData
          
          return {
            ...oldData,
            orders: oldData.orders.map((order) => 
              order.id === variables.id ? data : order
            ),
          }
        }
      )
      
      toast.success('Order berhasil diperbarui')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal memperbarui order')
    },
  })
}

/**
 * Delete order mutation
 * @returns Mutation result
 * 
 * @example
 * ```typescript
 * const { mutate: deleteOrder } = useDeleteOrder()
 * 
 * deleteOrder('order-id', {
 *   onSuccess: () => {
 *     router.push('/procurement/orders')
 *   }
 * })
 * ```
 */
export function useDeleteOrder() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await orderApi.delete(id)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete order')
      }
      
      return id
    },
    onSuccess: (deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: orderKeys.detail(deletedId) })
      
      // Remove from lists cache
      queryClient.setQueriesData<PaginatedOrders>(
        { queryKey: orderKeys.lists() },
        (oldData) => {
          if (!oldData) return oldData
          
          return {
            ...oldData,
            orders: oldData.orders.filter((order) => order.id !== deletedId),
            pagination: {
              ...oldData.pagination,
              totalItems: oldData.pagination.totalItems - 1,
            },
          }
        }
      )
      
      toast.success('Order berhasil dihapus')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menghapus order')
    },
  })
}

// ================================ ACTION HOOKS ================================

/**
 * Approve order mutation
 * @returns Mutation result
 * 
 * @example
 * ```typescript
 * const { mutate: approveOrder, isPending } = useApproveOrder()
 * 
 * approveOrder({
 *   id: 'order-id',
 *   data: { approvalNotes: 'Approved for procurement' }
 * })
 * ```
 */
export function useApproveOrder() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ApproveOrderInput }) => {
      const result = await orderApi.approve(id, data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to approve order')
      }
      
      return result.data
    },
    onSuccess: (data, variables) => {
      // Update caches
      queryClient.setQueryData(orderKeys.detail(variables.id), data)
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() })
      
      toast.success('Order berhasil disetujui')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menyetujui order')
    },
  })
}

/**
 * Reject order mutation
 * @returns Mutation result
 * 
 * @example
 * ```typescript
 * const { mutate: rejectOrder } = useRejectOrder()
 * 
 * rejectOrder({
 *   id: 'order-id',
 *   data: { rejectionReason: 'Budget constraints' }
 * })
 * ```
 */
export function useRejectOrder() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: RejectOrderInput }) => {
      const result = await orderApi.reject(id, data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to reject order')
      }
      
      return result.data
    },
    onSuccess: (data, variables) => {
      // Update caches
      queryClient.setQueryData(orderKeys.detail(variables.id), data)
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() })
      
      toast.success('Order berhasil ditolak')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menolak order')
    },
  })
}

/**
 * Cancel order mutation
 * @returns Mutation result
 * 
 * @example
 * ```typescript
 * const { mutate: cancelOrder } = useCancelOrder()
 * 
 * cancelOrder({
 *   id: 'order-id',
 *   data: {
 *     cancellationReason: 'Supplier not available',
 *     refundRequired: false
 *   }
 * })
 * ```
 */
export function useCancelOrder() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CancelOrderInput }) => {
      const result = await orderApi.cancel(id, data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to cancel order')
      }
      
      return result.data
    },
    onSuccess: (data, variables) => {
      // Update caches
      queryClient.setQueryData(orderKeys.detail(variables.id), data)
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() })
      
      toast.success('Order berhasil dibatalkan')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal membatalkan order')
    },
  })
}

/**
 * Escalate order mutation hook
 * Escalates pending order approval to higher authority
 * 
 * @example
 * ```typescript
 * const { mutate: escalateOrder } = useEscalateOrder()
 * 
 * escalateOrder({ 
 *   id: orderId, 
 *   data: { 
 *     escalateToRole: 'SPPG_KEPALA',
 *     reason: 'Urgent approval needed'
 *   } 
 * })
 * ```
 */
export function useEscalateOrder() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { 
      id: string
      data: { escalateToRole: string; reason: string } 
    }) => {
      const result = await orderApi.escalate(id, data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to escalate order')
      }
      
      return result.data
    },
    onSuccess: (data, variables) => {
      // Invalidate caches to refresh data
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      
      toast.success('Order berhasil dieskalasi')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal melakukan eskalasi order')
    },
  })
}

// ================================ PREFETCH UTILITIES ================================

/**
 * Prefetch orders list
 * Useful for optimistic navigation
 * 
 * @example
 * ```typescript
 * const queryClient = useQueryClient()
 * 
 * // Prefetch on hover
 * <Link 
 *   href="/procurement/orders"
 *   onMouseEnter={() => prefetchOrders(queryClient)}
 * >
 *   Orders
 * </Link>
 * ```
 */
export function prefetchOrders(
  queryClient: ReturnType<typeof useQueryClient>,
  filters?: OrderFilters,
  pagination?: PaginationParams
) {
  return queryClient.prefetchQuery({
    queryKey: orderKeys.list(filters, pagination),
    queryFn: async () => {
      const result = await orderApi.getAll(filters, pagination)
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch orders')
      }
      return result.data
    },
    staleTime: 2 * 60 * 1000,
  })
}

// ================================ APPROVED PLANS FOR ORDER ================================

/**
 * Get approved plans for order selection
 * 
 * @returns Query with approved plans list
 * 
 * @example
 * ```tsx
 * const { data: plans, isLoading } = useApprovedPlans()
 * ```
 */
export function useApprovedPlans() {
  return useQuery<ApprovedPlan[]>({
    queryKey: ['plans', 'approved'],
    queryFn: async () => {
      const response = await fetch('/api/sppg/procurement/plans/approved')
      
      if (!response.ok) {
        throw new Error('Failed to fetch approved plans')
      }
      
      const result = await response.json()
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch approved plans')
      }
      
      return result.data as ApprovedPlan[]
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get active payment terms for order selection
 * 
 * @returns Query with payment terms list
 * 
 * @example
 * ```tsx
 * const { data: paymentTerms, isLoading } = usePaymentTerms()
 * ```
 */
export function usePaymentTerms() {
  return useQuery<PaymentTerm[]>({
    queryKey: ['settings', 'payment-terms'],
    queryFn: async () => {
      const response = await fetch('/api/sppg/procurement/settings/payment-terms')
      
      if (!response.ok) {
        throw new Error('Failed to fetch payment terms')
      }
      
      const result = await response.json()
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch payment terms')
      }
      
      return result.data as PaymentTerm[]
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (rarely changes)
  })
}

/**
 * Prefetch order detail
 * Useful for optimistic navigation
 */
export function prefetchOrder(
  queryClient: ReturnType<typeof useQueryClient>,
  id: string
) {
  return queryClient.prefetchQuery({
    queryKey: orderKeys.detail(id),
    queryFn: async () => {
      const result = await orderApi.getById(id)
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch order')
      }
      return result.data
    },
    staleTime: 2 * 60 * 1000,
  })
}
