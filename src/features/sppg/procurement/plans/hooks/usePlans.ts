/**
 * @fileoverview Procurement Plans React Hooks
 * @version Next.js 15.5.4 / TanStack Query 5.62.13
 * @author Bagizi-ID Development Team
 * @see {@link /docs/PROCUREMENT_WORKFLOW_GUIDE.md} Procurement Documentation
 * 
 * HOOKS ARCHITECTURE:
 * - Query Hooks: Data fetching with caching (useQuery)
 * - Mutation Hooks: Data mutations with optimistic updates (useMutation)
 * - Centralized API calls via planApi
 * - Automatic cache invalidation on mutations
 * - Toast notifications on success/error
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { planApi } from '../api'
import type {
  PlanFilters,
  CreatePlanRequest,
  UpdatePlanRequest,
  PlanSubmissionInput,
  PlanApprovalInput,
  PlanRejectionInput,
  PlanCancellationInput,
} from '../types'

// ================================ QUERY KEYS ================================

/**
 * Query keys for cache management
 */
export const planKeys = {
  all: ['plans'] as const,
  lists: () => [...planKeys.all, 'list'] as const,
  list: (filters?: PlanFilters) => [...planKeys.lists(), filters] as const,
  details: () => [...planKeys.all, 'detail'] as const,
  detail: (id: string) => [...planKeys.details(), id] as const,
  stats: (filters?: Pick<PlanFilters, 'planYear' | 'planMonth' | 'planQuarter'>) =>
    [...planKeys.all, 'stats', filters] as const,
}

// ================================ QUERY HOOKS ================================

/**
 * Fetch all plans with optional filters
 * 
 * @param filters - Optional filter parameters
 * @param options - React Query options
 * @returns Query result with plans data
 * 
 * @example
 * const { data, isLoading, error } = usePlans({
 *   approvalStatus: ['APPROVED'],
 *   planYear: 2025,
 *   page: 1,
 *   pageSize: 10,
 * })
 */
export function usePlans(filters?: PlanFilters) {
  return useQuery({
    queryKey: planKeys.list(filters),
    queryFn: async () => {
      const result = await planApi.getAll(filters)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch plans')
      }
      
      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Fetch single plan by ID
 * 
 * @param id - Plan ID
 * @param options - React Query options
 * @returns Query result with plan data
 * 
 * @example
 * const { data, isLoading, error } = usePlan('plan_123')
 */
export function usePlan(id: string) {
  return useQuery({
    queryKey: planKeys.detail(id),
    queryFn: async () => {
      const result = await planApi.getById(id)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch plan')
      }
      
      return result.data
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Fetch plan timeline (audit log)
 * 
 * TODO: Implement timeline API endpoint
 * For now, returns empty timeline
 * 
 * @param id - Plan ID
 * @returns Query result with timeline data
 * 
 * @example
 * const { data, isLoading } = usePlanTimeline('plan_123')
 */
export function usePlanTimeline(id: string) {
  return useQuery({
    queryKey: [...planKeys.detail(id), 'timeline'] as const,
    queryFn: async () => {
      // TODO: Implement timeline API endpoint
      // For now, return empty timeline structure
      return {
        events: [],
        totalEvents: 0,
      }
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Fetch plan statistics
 * 
 * @param filters - Optional filter parameters
 * @returns Query result with statistics data
 * 
 * @example
 * const { data, isLoading } = usePlanStats({ planYear: 2025 })
 */
export function usePlanStats(
  filters?: Pick<PlanFilters, 'planYear' | 'planMonth' | 'planQuarter'>
) {
  return useQuery({
    queryKey: planKeys.stats(filters),
    queryFn: async () => {
      const result = await planApi.getStats(filters)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch plan statistics')
      }
      
      return result.data
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (stats change less frequently)
  })
}

// ================================ MUTATION HOOKS ================================

/**
 * Create new plan
 * 
 * @returns Mutation hook with create function
 * 
 * @example
 * const { mutate, isPending } = useCreatePlan()
 * 
 * mutate({
 *   planName: 'Rencana Januari 2025',
 *   planMonth: 'JANUARY',
 *   planYear: 2025,
 *   totalBudget: 50000000,
 *   targetRecipients: 500,
 *   targetMeals: 10000,
 * }, {
 *   onSuccess: (data) => {
 *     console.log('Created:', data)
 *   }
 * })
 */
export function useCreatePlan() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreatePlanRequest) => {
      const result = await planApi.create(data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create plan')
      }
      
      return result.data
    },
    onSuccess: () => {
      // Invalidate plans list to refetch
      queryClient.invalidateQueries({ queryKey: planKeys.lists() })
      queryClient.invalidateQueries({ queryKey: planKeys.stats() })
      
      toast.success('Rencana pengadaan berhasil dibuat')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal membuat rencana pengadaan')
    },
  })
}

/**
 * Update existing plan
 * 
 * @returns Mutation hook with update function
 * 
 * @example
 * const { mutate, isPending } = useUpdatePlan()
 * 
 * mutate({
 *   id: 'plan_123',
 *   data: { totalBudget: 60000000 }
 * })
 */
export function useUpdatePlan() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: UpdatePlanRequest
    }) => {
      const result = await planApi.update(id, data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update plan')
      }
      
      return result.data
    },
    onSuccess: (data, variables) => {
      // Update specific plan in cache
      queryClient.setQueryData(planKeys.detail(variables.id), data)
      
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: planKeys.lists() })
      queryClient.invalidateQueries({ queryKey: planKeys.stats() })
      
      toast.success('Rencana pengadaan berhasil diperbarui')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal memperbarui rencana pengadaan')
    },
  })
}

/**
 * Delete plan
 * Only allowed for DRAFT plans
 * 
 * @returns Mutation hook with delete function
 * 
 * @example
 * const { mutate, isPending } = useDeletePlan()
 * 
 * mutate('plan_123')
 */
export function useDeletePlan() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await planApi.delete(id)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete plan')
      }
      
      return id
    },
    onSuccess: (deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: planKeys.detail(deletedId) })
      
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: planKeys.lists() })
      queryClient.invalidateQueries({ queryKey: planKeys.stats() })
      
      toast.success('Rencana pengadaan berhasil dihapus')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menghapus rencana pengadaan')
    },
  })
}

/**
 * Submit plan for review
 * 
 * @returns Mutation hook with submit function
 * 
 * @example
 * const { mutate, isPending } = useSubmitPlan()
 * 
 * mutate({
 *   id: 'plan_123',
 *   data: { submissionNotes: 'Ready for review' }
 * })
 */
export function useSubmitPlan() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: PlanSubmissionInput
    }) => {
      const result = await planApi.submit(id, data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to submit plan')
      }
      
      return result.data
    },
    onSuccess: (data, variables) => {
      // Update plan in cache
      queryClient.setQueryData(planKeys.detail(variables.id), data)
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: planKeys.lists() })
      queryClient.invalidateQueries({ queryKey: planKeys.stats() })
      
      toast.success('Rencana pengadaan berhasil diajukan untuk ditinjau')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal mengajukan rencana pengadaan')
    },
  })
}

/**
 * Approve plan
 * 
 * @returns Mutation hook with approve function
 * 
 * @example
 * const { mutate, isPending } = useApprovePlan()
 * 
 * mutate({
 *   id: 'plan_123',
 *   data: { approvalNotes: 'Approved for implementation' }
 * })
 */
export function useApprovePlan() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: PlanApprovalInput
    }) => {
      const result = await planApi.approve(id, data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to approve plan')
      }
      
      return result.data
    },
    onSuccess: (data, variables) => {
      // Update plan in cache
      queryClient.setQueryData(planKeys.detail(variables.id), data)
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: planKeys.lists() })
      queryClient.invalidateQueries({ queryKey: planKeys.stats() })
      
      toast.success('Rencana pengadaan berhasil disetujui')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menyetujui rencana pengadaan')
    },
  })
}

/**
 * Reject plan
 * 
 * @returns Mutation hook with reject function
 * 
 * @example
 * const { mutate, isPending } = useRejectPlan()
 * 
 * mutate({
 *   id: 'plan_123',
 *   data: {
 *     rejectionReason: 'Budget needs revision',
 *     improvementSuggestions: 'Adjust protein allocation'
 *   }
 * })
 */
export function useRejectPlan() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: PlanRejectionInput
    }) => {
      const result = await planApi.reject(id, data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to reject plan')
      }
      
      return result.data
    },
    onSuccess: (data, variables) => {
      // Update plan in cache
      queryClient.setQueryData(planKeys.detail(variables.id), data)
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: planKeys.lists() })
      queryClient.invalidateQueries({ queryKey: planKeys.stats() })
      
      toast.success('Rencana pengadaan telah ditolak')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menolak rencana pengadaan')
    },
  })
}

/**
 * Cancel plan
 * 
 * @returns Mutation hook with cancel function
 * 
 * @example
 * const { mutate, isPending } = useCancelPlan()
 * 
 * mutate({
 *   id: 'plan_123',
 *   data: { cancellationReason: 'Program postponed' }
 * })
 */
export function useCancelPlan() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: PlanCancellationInput
    }) => {
      const result = await planApi.cancel(id, data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to cancel plan')
      }
      
      return result.data
    },
    onSuccess: (data, variables) => {
      // Update plan in cache
      queryClient.setQueryData(planKeys.detail(variables.id), data)
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: planKeys.lists() })
      queryClient.invalidateQueries({ queryKey: planKeys.stats() })
      
      toast.success('Rencana pengadaan telah dibatalkan')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal membatalkan rencana pengadaan')
    },
  })
}
