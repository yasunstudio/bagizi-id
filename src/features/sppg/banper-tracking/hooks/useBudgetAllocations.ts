/**
 * @fileoverview TanStack Query hooks untuk Program Budget Allocations
 * @version Next.js 15.5.4 / TanStack Query v5
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * CRITICAL: Menggunakan centralized API client pattern
 * - Import dari ../api/budgetAllocationsApi (NEVER direct fetch)
 * - Optimistic updates untuk better UX
 * - Proper error handling dengan toast notifications
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { budgetAllocationsApi } from '../api/budgetAllocationsApi'
import type {
  ProgramBudgetAllocationCreateInput,
  ProgramBudgetAllocationUpdateInput,
} from '../lib/schemas'

// Query keys
export const budgetAllocationKeys = {
  all: ['budget-allocations'] as const,
  lists: () => [...budgetAllocationKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...budgetAllocationKeys.lists(), filters] as const,
  details: () => [...budgetAllocationKeys.all, 'detail'] as const,
  detail: (id: string) => [...budgetAllocationKeys.details(), id] as const,
}

/**
 * Hook untuk fetch semua budget allocations
 * Auto-filtered by sppgId pada server (multi-tenant security)
 * 
 * @example
 * ```tsx
 * const { data: allocations, isLoading } = useBudgetAllocations()
 * ```
 */
export function useBudgetAllocations() {
  return useQuery({
    queryKey: budgetAllocationKeys.lists(),
    queryFn: async () => {
      const result = await budgetAllocationsApi.getAll()
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch budget allocations')
      }
      
      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook untuk fetch single budget allocation by ID
 * 
 * @param id - Budget allocation ID
 * @example
 * ```tsx
 * const { data: allocation, isLoading } = useBudgetAllocation(allocationId)
 * ```
 */
export function useBudgetAllocation(id: string) {
  return useQuery({
    queryKey: budgetAllocationKeys.detail(id),
    queryFn: async () => {
      const result = await budgetAllocationsApi.getById(id)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch budget allocation')
      }
      
      return result.data
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook untuk create new budget allocation (manual)
 * Invalidates list query on success
 * 
 * @example
 * ```tsx
 * const { mutate: createAllocation } = useCreateBudgetAllocation()
 * createAllocation(data, {
 *   onSuccess: () => router.push('/budget-allocations')
 * })
 * ```
 */
export function useCreateBudgetAllocation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: ProgramBudgetAllocationCreateInput) => {
      const result = await budgetAllocationsApi.create(data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create budget allocation')
      }
      
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetAllocationKeys.lists() })
      toast.success('Budget allocation created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create budget allocation')
    },
  })
}

/**
 * Hook untuk update budget allocation
 * Invalidates both list and detail queries on success
 * 
 * @example
 * ```tsx
 * const { mutate: updateAllocation } = useUpdateBudgetAllocation()
 * updateAllocation({ id, data })
 * ```
 */
export function useUpdateBudgetAllocation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProgramBudgetAllocationUpdateInput }) => {
      const result = await budgetAllocationsApi.update(id, data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update budget allocation')
      }
      
      return result.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: budgetAllocationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: budgetAllocationKeys.detail(data.id) })
      toast.success('Budget allocation updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update budget allocation')
    },
  })
}

/**
 * Hook untuk delete budget allocation
 * Only allowed if no transactions exist
 * 
 * @example
 * ```tsx
 * const { mutate: deleteAllocation } = useDeleteBudgetAllocation()
 * deleteAllocation(allocationId)
 * ```
 */
export function useDeleteBudgetAllocation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await budgetAllocationsApi.delete(id)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete budget allocation')
      }
      
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetAllocationKeys.lists() })
      toast.success('Budget allocation deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete budget allocation')
    },
  })
}
