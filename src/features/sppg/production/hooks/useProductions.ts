/**
 * @fileoverview TanStack Query hooks for Food Production
 * @version Next.js 15.5.4 / TanStack Query v5
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { productionApi } from '../api/productionApi'
import type {
  ProductionFilters,
  ProductionInput,
  ProductionResponse,
  QualityCheckInput,
} from '../api/productionApi'

// ============================================================================
// Query Keys
// ============================================================================

const QUERY_KEYS = {
  all: ['production'] as const,
  lists: () => [...QUERY_KEYS.all, 'list'] as const,
  list: (filters: ProductionFilters) => [...QUERY_KEYS.lists(), filters] as const,
  details: () => [...QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...QUERY_KEYS.details(), id] as const,
  statistics: () => [...QUERY_KEYS.all, 'statistics'] as const,
  qualityChecks: (productionId: string) => [...QUERY_KEYS.all, 'quality', productionId] as const,
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Hook to fetch productions list with filters and pagination
 */
export function useProductions(filters: ProductionFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.list(filters),
    queryFn: async () => {
      try {
        console.log('[useProductions] Fetching with filters:', filters)
        const response = await productionApi.getAll(filters)
        console.log('[useProductions] API Response:', response)
        
        // Validate response structure
        if (!response || typeof response !== 'object') {
          console.error('[useProductions] Invalid response structure:', response)
          throw new Error('Invalid response from API')
        }
        
        if (!response.success) {
          console.error('[useProductions] API returned error:', response.error)
          throw new Error(response.error || 'API request failed')
        }
        
        return response
      } catch (error) {
        console.error('[useProductions] Fetch error:', error)
        throw error
      }
    },
    select: (response) => {
      console.log('[useProductions] Select response:', response)
      console.log('[useProductions] Extracted data:', response?.data)
      return response?.data || []
    },
    staleTime: 3 * 60 * 1000, // 3 minutes (shorter for real-time production)
  })
}

/**
 * Hook to fetch single production details with relations
 */
export function useProduction(id: string | undefined) {
  return useQuery({
    queryKey: id ? QUERY_KEYS.detail(id) : ['production', 'empty'],
    queryFn: () => {
      if (!id) throw new Error('Production ID is required')
      return productionApi.getById(id)
    },
    select: (response) => response.data,
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: (query) => {
      // Auto-refetch every 30 seconds for in-progress productions
      const production = query.state.data?.data
      const activeStatuses = ['PREPARING', 'COOKING', 'QUALITY_CHECK']
      return production && activeStatuses.includes(production.status) ? 30000 : false
    },
  })
}

/**
 * Hook to fetch production statistics
 * Note: Statistics should be calculated from production list or added to API
 */
export function useProductionStats() {
  // For now, calculate from all productions
  return useQuery({
    queryKey: QUERY_KEYS.statistics(),
    queryFn: async () => {
      const response = await productionApi.getAll()
      const data = response.data || []
      
      return {
        total: data.length,
        inProgress: data.filter(p => ['PREPARING', 'COOKING', 'QUALITY_CHECK'].includes(p.status)).length,
        completed: data.filter(p => p.status === 'COMPLETED').length,
        cancelled: data.filter(p => p.status === 'CANCELLED').length,
        planned: data.filter(p => p.status === 'PLANNED').length,
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch quality checks for a production
 */
export function useQualityChecks(productionId: string | undefined) {
  return useQuery({
    queryKey: productionId ? QUERY_KEYS.qualityChecks(productionId) : ['production', 'quality', 'empty'],
    queryFn: () => {
      if (!productionId) throw new Error('Production ID is required')
      return productionApi.getQualityChecks(productionId)
    },
    select: (response) => response.data,
    enabled: !!productionId,
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: 'always', // Always refetch when component mounts
  })
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Hook to create new production
 */
export function useCreateProduction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ProductionInput) => productionApi.create(data),
    onSuccess: (response) => {
      // Invalidate lists and statistics to refetch
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.lists(),
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.statistics(),
      })

      toast.success('Produksi berhasil dibuat', {
        description: `Batch: ${response.data?.batchNumber}`,
      })
    },
    onError: (error: Error) => {
      toast.error('Gagal membuat produksi', {
        description: error.message,
      })
    },
  })
}

/**
 * Hook to update existing production
 */
export function useUpdateProduction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductionInput> }) =>
      productionApi.update(id, data),
    onSuccess: (response, variables) => {
      // Update specific production in cache
      queryClient.setQueryData<ProductionResponse>(
        QUERY_KEYS.detail(variables.id),
        response
      )

      // Invalidate lists and statistics to refetch
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.lists(),
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.statistics(),
      })

      toast.success('Produksi berhasil diperbarui', {
        description: `Batch: ${response.data?.batchNumber}`,
      })
    },
    onError: (error: Error) => {
      toast.error('Gagal memperbarui produksi', {
        description: error.message,
      })
    },
  })
}

/**
 * Hook to delete production
 */
export function useDeleteProduction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => productionApi.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove production from cache
      queryClient.removeQueries({
        queryKey: QUERY_KEYS.detail(deletedId),
      })

      // Invalidate lists and statistics to refetch
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.lists(),
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.statistics(),
      })

      toast.success('Produksi berhasil dihapus')
    },
    onError: (error: Error) => {
      toast.error('Gagal menghapus produksi', {
        description: error.message,
      })
    },
  })
}

/**
 * Hook to start production (PLANNED → PREPARING)
 */
export function useStartProduction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => productionApi.startProduction(id),
    onSuccess: (response) => {
      // Invalidate lists and statistics
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.lists(),
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.statistics(),
      })

      toast.success('Produksi dimulai - Status: Persiapan', {
        description: `Batch: ${response.data?.batchNumber}`,
      })
    },
    onError: (error: Error) => {
      toast.error('Gagal memulai produksi', {
        description: error.message,
      })
    },
  })
}

/**
 * Hook to start cooking (PREPARING → COOKING)
 */
export function useStartCooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => productionApi.startCooking(id),
    onSuccess: (response) => {
      // Invalidate lists and statistics
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.lists(),
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.statistics(),
      })

      toast.success('Memasak dimulai', {
        description: `Batch: ${response.data?.batchNumber}`,
      })
    },
    onError: (error: Error) => {
      toast.error('Gagal memulai memasak', {
        description: error.message,
      })
    },
  })
}

/**
 * Hook to complete production with actual portions
 */
export function useCompleteProduction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { actualPortions: number; actualTemperature?: number } }) =>
      productionApi.completeProduction(id, data),
    onSuccess: (response, variables) => {
      // Update cache
      queryClient.setQueryData<ProductionResponse>(
        QUERY_KEYS.detail(variables.id),
        response
      )

      // Invalidate lists and statistics
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.lists(),
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.statistics(),
      })

      toast.success('Memasak selesai - Menunggu Quality Check', {
        description: `Porsi: ${variables.data.actualPortions}`,
      })
    },
    onError: (error: Error) => {
      toast.error('Gagal menyelesaikan produksi', {
        description: error.message,
      })
    },
  })
}

/**
 * Hook to cancel production
 */
export function useCancelProduction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      productionApi.cancelProduction(id, reason),
    onSuccess: (response) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.lists(),
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.statistics(),
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.detail(response.data?.id || ''),
      })

      toast.success('Produksi dibatalkan', {
        description: 'Status produksi telah diubah menjadi CANCELLED',
      })
    },
    onError: (error: Error) => {
      toast.error('Gagal membatalkan produksi', {
        description: error.message,
      })
    },
  })
}

/**
 * Hook to add quality check to production
 */
export function useAddQualityCheck() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ productionId, data }: { productionId: string; data: QualityCheckInput }) =>
      productionApi.addQualityCheck(productionId, data),
    onSuccess: async (response, variables) => {
      // Invalidate and refetch quality checks immediately
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.qualityChecks(variables.productionId),
      })

      // Refetch quality checks to ensure fresh data
      await queryClient.refetchQueries({
        queryKey: QUERY_KEYS.qualityChecks(variables.productionId),
      })

      // Invalidate production detail to refetch with new quality checks
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.detail(variables.productionId),
      })

      const checkType = variables.data.checkType
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (l) => l.toUpperCase())

      toast.success('Quality Check berhasil ditambahkan', {
        description: `Tipe: ${checkType}`,
      })
    },
    onError: (error: Error) => {
      toast.error('Gagal menambahkan Quality Check', {
        description: error.message,
      })
    },
  })
}

// ============================================================================
// Compound Hooks
// ============================================================================

/**
 * Hook to get productions with statistics
 */
export function useProductionsWithStats(filters: ProductionFilters = {}) {
  const productionsQuery = useProductions(filters)
  const statsQuery = useProductionStats()

  return {
    productions: productionsQuery.data,
    statistics: statsQuery.data,
    isLoading: productionsQuery.isLoading || statsQuery.isLoading,
    isError: productionsQuery.isError || statsQuery.isError,
    error: productionsQuery.error || statsQuery.error,
  }
}

/**
 * Hook to check if user can edit production (only PLANNED status)
 */
export function useCanEditProduction(productionId: string | undefined) {
  const { data: production, isLoading } = useProduction(productionId)

  const canEdit = production?.status === 'PLANNED'
  const canDelete = production?.status === 'PLANNED'
  const canUpdateStatus = production && ['PLANNED', 'PREPARING', 'COOKING'].includes(production.status)

  return {
    canEdit,
    canDelete,
    canUpdateStatus,
    isLoading,
    production,
  }
}
