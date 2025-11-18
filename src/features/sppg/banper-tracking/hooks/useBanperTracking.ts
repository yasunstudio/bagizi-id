/**
 * @fileoverview TanStack Query hooks untuk Banper Request Tracking
 * @version Next.js 15.5.4 / TanStack Query v5
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * CRITICAL: Menggunakan centralized API client pattern
 * - Import dari ../api/banperTrackingApi (NEVER direct fetch)
 * - Optimistic updates untuk better UX
 * - Proper error handling dengan toast notifications
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { banperTrackingApi } from '../api/banperTrackingApi'
import type {
  BanperRequestTrackingCreateInput,
  BanperRequestTrackingUpdateInput,
  BanperRequestTrackingSubmitInput,
  BanperRequestTrackingApprovalInput,
  BanperRequestTrackingDisbursementInput,
} from '../lib/schemas'

// Query keys
export const banperTrackingKeys = {
  all: ['banper-tracking'] as const,
  lists: () => [...banperTrackingKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...banperTrackingKeys.lists(), filters] as const,
  details: () => [...banperTrackingKeys.all, 'detail'] as const,
  detail: (id: string) => [...banperTrackingKeys.details(), id] as const,
}

/**
 * Hook untuk fetch semua banper request trackings
 * Auto-filtered by sppgId pada server (multi-tenant security)
 * 
 * @example
 * ```tsx
 * const { data: trackings, isLoading } = useBanperTrackings()
 * ```
 */
export function useBanperTrackings() {
  return useQuery({
    queryKey: banperTrackingKeys.lists(),
    queryFn: async () => {
      const result = await banperTrackingApi.getAll()
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch banper trackings')
      }
      
      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook untuk fetch single banper request tracking by ID
 * 
 * @param id - Banper tracking ID
 * @example
 * ```tsx
 * const { data: tracking, isLoading } = useBanperTracking(trackingId)
 * ```
 */
export function useBanperTracking(id: string) {
  return useQuery({
    queryKey: banperTrackingKeys.detail(id),
    queryFn: async () => {
      const result = await banperTrackingApi.getById(id)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch banper tracking')
      }
      
      return result.data
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook untuk create new banper request tracking
 * Invalidates list query on success
 * 
 * @example
 * ```tsx
 * const { mutate: createTracking } = useCreateBanperTracking()
 * createTracking(data, {
 *   onSuccess: () => router.push('/banper-tracking')
 * })
 * ```
 */
export function useCreateBanperTracking() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: BanperRequestTrackingCreateInput) => {
      const result = await banperTrackingApi.create(data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create banper tracking')
      }
      
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: banperTrackingKeys.lists() })
      toast.success('Banper tracking created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create banper tracking')
    },
  })
}

/**
 * Hook untuk update banper request tracking
 * Invalidates both list and detail queries on success
 * 
 * @example
 * ```tsx
 * const { mutate: updateTracking } = useUpdateBanperTracking()
 * updateTracking({ id, data })
 * ```
 */
export function useUpdateBanperTracking() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: BanperRequestTrackingUpdateInput }) => {
      const result = await banperTrackingApi.update(id, data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update banper tracking')
      }
      
      return result.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: banperTrackingKeys.lists() })
      queryClient.invalidateQueries({ queryKey: banperTrackingKeys.detail(data.id) })
      toast.success('Banper tracking updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update banper tracking')
    },
  })
}

/**
 * Hook untuk submit banper request to BGN portal
 * Changes status from DRAFT_LOCAL to SUBMITTED_TO_BGN
 * 
 * @example
 * ```tsx
 * const { mutate: submitTracking } = useSubmitBanperTracking()
 * submitTracking({ id, data })
 * ```
 */
export function useSubmitBanperTracking() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: BanperRequestTrackingSubmitInput }) => {
      const result = await banperTrackingApi.submit(id, data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to submit banper tracking')
      }
      
      return result.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: banperTrackingKeys.lists() })
      queryClient.invalidateQueries({ queryKey: banperTrackingKeys.detail(data.id) })
      toast.success('Banper request submitted to BGN portal')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit banper request')
    },
  })
}

/**
 * Hook untuk approve banper request (record BGN approval)
 * Changes status to APPROVED_BY_BGN
 * 
 * @example
 * ```tsx
 * const { mutate: approveTracking } = useApproveBanperTracking()
 * approveTracking({ id, data })
 * ```
 */
export function useApproveBanperTracking() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: BanperRequestTrackingApprovalInput }) => {
      const result = await banperTrackingApi.approve(id, data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to approve banper tracking')
      }
      
      return result.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: banperTrackingKeys.lists() })
      queryClient.invalidateQueries({ queryKey: banperTrackingKeys.detail(data.id) })
      toast.success('BGN approval recorded successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to record BGN approval')
    },
  })
}

/**
 * Hook untuk record disbursement (dana cair)
 * Changes status to DISBURSED and creates ProgramBudgetAllocation
 * 
 * @example
 * ```tsx
 * const { mutate: disburseTracking } = useDisburseBanperTracking()
 * disburseTracking({ id, data })
 * ```
 */
export function useDisburseBanperTracking() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: BanperRequestTrackingDisbursementInput }) => {
      const result = await banperTrackingApi.disburse(id, data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to record disbursement')
      }
      
      return result.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: banperTrackingKeys.lists() })
      queryClient.invalidateQueries({ queryKey: banperTrackingKeys.detail(data.id) })
      // Also invalidate budget allocations
      queryClient.invalidateQueries({ queryKey: ['budget-allocations'] })
      toast.success('Disbursement recorded successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to record disbursement')
    },
  })
}

/**
 * Hook untuk delete banper request tracking
 * Only allowed for DRAFT_LOCAL status
 * 
 * @example
 * ```tsx
 * const { mutate: deleteTracking } = useDeleteBanperTracking()
 * deleteTracking(trackingId)
 * ```
 */
export function useDeleteBanperTracking() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await banperTrackingApi.delete(id)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete banper tracking')
      }
      
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: banperTrackingKeys.lists() })
      toast.success('Banper tracking deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete banper tracking')
    },
  })
}
