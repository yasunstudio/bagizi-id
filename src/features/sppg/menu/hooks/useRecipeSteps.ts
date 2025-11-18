/**
 * @fileoverview Recipe Steps React Hooks - TanStack Query integration
 * @version Next.js 15.5.4 / TanStack Query v5
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md#api-client-pattern} Hook Standards
 * 
 * CRITICAL: Always use centralized API client (recipeStepsApi)
 * - Never use direct fetch() calls
 * - Use TanStack Query for server state management
 * - Implement optimistic updates for better UX
 * - Include proper error handling with toast notifications
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { recipeStepsApi } from '../api/recipeStepsApi'
import type { 
  RecipeStep, 
  RecipeStepCreateInput, 
  RecipeStepUpdateInput 
} from '../api/recipeStepsApi'

/**
 * Query key factory for recipe steps
 */
export const recipeStepKeys = {
  all: ['recipeSteps'] as const,
  menu: (menuId: string) => ['recipeSteps', 'menu', menuId] as const,
}

/**
 * Hook to fetch all recipe steps for a menu
 */
export function useRecipeSteps(menuId: string, options?: {
  enabled?: boolean
  refetchInterval?: number
}) {
  return useQuery({
    queryKey: recipeStepKeys.menu(menuId),
    queryFn: async () => {
      const result = await recipeStepsApi.getAll(menuId)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch recipe steps')
      }
      
      return result.data
    },
    enabled: options?.enabled !== false && !!menuId,
    refetchInterval: options?.refetchInterval,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to add new recipe step
 */
export function useCreateRecipeStep() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      menuId, 
      data 
    }: { 
      menuId: string
      data: RecipeStepCreateInput 
    }) => {
      const result = await recipeStepsApi.create(menuId, data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create recipe step')
      }
      
      return result.data
    },
    onSuccess: (_data, { menuId }) => {
      queryClient.invalidateQueries({ queryKey: recipeStepKeys.menu(menuId) })
      toast.success('Langkah resep berhasil ditambahkan')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menambahkan langkah resep')
    }
  })
}

/**
 * Hook to update recipe step
 */
export function useUpdateRecipeStep() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      menuId, 
      stepId, 
      data 
    }: { 
      menuId: string
      stepId: string
      data: RecipeStepUpdateInput 
    }) => {
      const result = await recipeStepsApi.update(menuId, stepId, data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update recipe step')
      }
      
      return result.data
    },
    onSuccess: (_data, { menuId }) => {
      queryClient.invalidateQueries({ queryKey: recipeStepKeys.menu(menuId) })
      toast.success('Langkah resep berhasil diperbarui')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal memperbarui langkah resep')
    }
  })
}

/**
 * Hook to delete recipe step
 */
export function useDeleteRecipeStep() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      menuId, 
      stepId 
    }: { 
      menuId: string
      stepId: string 
    }) => {
      const result = await recipeStepsApi.delete(menuId, stepId)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete recipe step')
      }
      
      return stepId
    },
    onSuccess: (_data, { menuId }) => {
      queryClient.invalidateQueries({ queryKey: recipeStepKeys.menu(menuId) })
      toast.success('Langkah resep berhasil dihapus')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menghapus langkah resep')
    }
  })
}

/**
 * Hook to reorder recipe steps
 */
export function useReorderRecipeSteps() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      menuId, 
      stepOrders 
    }: { 
      menuId: string
      stepOrders: Array<{ stepId: string; newStepNumber: number }> 
    }) => {
      const result = await recipeStepsApi.reorder(menuId, stepOrders)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to reorder recipe steps')
      }
      
      return result.data
    },
    onSuccess: (_data, { menuId }) => {
      queryClient.invalidateQueries({ queryKey: recipeStepKeys.menu(menuId) })
      toast.success('Urutan langkah resep berhasil diperbarui')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal mengurutkan ulang langkah resep')
    }
  })
}

// Export types
export type { RecipeStep, RecipeStepCreateInput, RecipeStepUpdateInput }

