/**
 * @fileoverview Position Management React Hooks
 * TanStack Query hooks for Position CRUD operations with cache management
 * @version Next.js 15.5.4 / TanStack Query v5
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
import { positionApi } from '../api/positionApi'
import type {
  PositionInput,
  PositionUpdate,
  PositionFilters,
  PositionWithCount,
  PositionWithRelations,
} from '../types/position.types'
import { toast } from 'sonner'

/**
 * Position Query Keys Factory
 * Centralized query key management for consistent cache handling
 * 
 * @example
 * ```typescript
 * // Invalidate all position queries
 * queryClient.invalidateQueries({ queryKey: positionKeys.all })
 * 
 * // Invalidate specific position list
 * queryClient.invalidateQueries({ queryKey: positionKeys.list({ departmentId: 'dept-123' }) })
 * ```
 */
export const positionKeys = {
  all: ['positions'] as const,
  lists: () => [...positionKeys.all, 'list'] as const,
  list: (filters?: PositionFilters) => [...positionKeys.lists(), filters] as const,
  byDepartment: (departmentId: string) => [...positionKeys.all, 'department', departmentId] as const,
  details: () => [...positionKeys.all, 'detail'] as const,
  detail: (id: string) => [...positionKeys.details(), id] as const,
}

/**
 * Fetch positions with optional filters
 * 
 * @param filters - Optional filter parameters
 * @param options - TanStack Query options
 * @returns Query result with positions array
 * 
 * @example
 * ```typescript
 * // Fetch all positions
 * const { data, isLoading } = usePositions()
 * 
 * // With filters
 * const { data } = usePositions({
 *   search: 'Manager',
 *   departmentId: 'dept-123',
 *   level: 'MANAGER'
 * })
 * ```
 */
export function usePositions(
  filters?: PositionFilters,
  options?: Omit<UseQueryOptions<PositionWithCount[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: positionKeys.list(filters),
    queryFn: async () => {
      console.log('🔄 Fetching positions with filters:', filters)
      const result = await positionApi.getAll(filters)
      
      console.log('📦 API Response:', {
        success: result.success,
        dataLength: result.data?.length,
        hasError: !!result.error,
        error: result.error,
      })
      
      if (!result.success || !result.data) {
        const errorMessage = result.error || 'Failed to fetch positions'
        console.error('❌ Position fetch failed:', errorMessage)
        throw new Error(errorMessage)
      }
      
      console.log('✅ Positions fetched successfully:', result.data.length)
      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

/**
 * Fetch single position by ID
 * 
 * @param id - Position ID
 * @param options - TanStack Query options
 * @returns Query result with position detail
 * 
 * @example
 * ```typescript
 * const { data: position, isLoading } = usePosition('pos-123')
 * ```
 */
export function usePosition(
  id: string,
  options?: Omit<UseQueryOptions<PositionWithRelations>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: positionKeys.detail(id),
    queryFn: async () => {
      const result = await positionApi.getById(id)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch position')
      }
      
      return result.data
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

/**
 * Fetch positions by department
 * 
 * @param departmentId - Department ID
 * @param options - TanStack Query options
 * @returns Query result with positions array for department
 * 
 * @example
 * ```typescript
 * const { data: positions } = usePositionsByDepartment('dept-123')
 * ```
 */
export function usePositionsByDepartment(
  departmentId: string,
  options?: Omit<UseQueryOptions<PositionWithCount[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: positionKeys.byDepartment(departmentId),
    queryFn: async () => {
      const result = await positionApi.getByDepartment(departmentId)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch positions by department')
      }
      
      return result.data
    },
    enabled: !!departmentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

/**
 * Create new position mutation
 * 
 * Features:
 * - Optimistic updates to cache
 * - Invalidates related queries (lists, department positions)
 * - Toast notifications
 * - Error handling
 * 
 * @returns Mutation object with mutate function
 * 
 * @example
 * ```typescript
 * const { mutate: createPosition, isPending } = useCreatePosition()
 * 
 * createPosition({
 *   departmentId: 'dept-123',
 *   positionCode: 'MGR-001',
 *   positionName: 'Department Manager',
 *   level: 'MANAGER'
 * })
 * ```
 */
export function useCreatePosition() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: PositionInput) => {
      const result = await positionApi.create(data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create position')
      }
      
      return result.data
    },
    onSuccess: (newPosition) => {
      // Invalidate all position lists
      queryClient.invalidateQueries({ queryKey: positionKeys.lists() })
      
      // Invalidate department positions if departmentId exists
      if (newPosition.departmentId) {
        queryClient.invalidateQueries({ 
          queryKey: positionKeys.byDepartment(newPosition.departmentId) 
        })
        
        // Invalidate department detail (for position count)
        queryClient.invalidateQueries({ 
          queryKey: ['departments', 'detail', newPosition.departmentId] 
        })
      }
      
      toast.success('Posisi berhasil dibuat', {
        description: `${newPosition.positionCode} - ${newPosition.positionName}`,
      })
    },
    onError: (error: Error) => {
      toast.error('Gagal membuat posisi', {
        description: error.message,
      })
    },
  })
}

/**
 * Update position mutation
 * 
 * Features:
 * - Updates cache directly for immediate UI feedback
 * - Invalidates related queries
 * - Handles department changes (invalidates old and new department)
 * - Toast notifications
 * 
 * @returns Mutation object with mutate function
 * 
 * @example
 * ```typescript
 * const { mutate: updatePosition } = useUpdatePosition()
 * 
 * updatePosition({
 *   id: 'pos-123',
 *   data: {
 *     positionName: 'Senior Manager',
 *     level: 'SENIOR_MANAGER'
 *   }
 * })
 * ```
 */
export function useUpdatePosition() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PositionUpdate }) => {
      const result = await positionApi.update(id, data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update position')
      }
      
      return result.data
    },
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: positionKeys.detail(id) })
      
      // Snapshot previous value
      const previousPosition = queryClient.getQueryData<PositionWithRelations>(
        positionKeys.detail(id)
      )
      
      // Optimistically update cache
      if (previousPosition) {
        queryClient.setQueryData<PositionWithRelations>(
          positionKeys.detail(id),
          {
            ...previousPosition,
            ...data,
          }
        )
      }
      
      return { previousPosition }
    },
    onSuccess: (updatedPosition, { id }) => {
      // Update detail cache with server response
      queryClient.setQueryData(positionKeys.detail(id), updatedPosition)
      
      // Invalidate all position lists
      queryClient.invalidateQueries({ queryKey: positionKeys.lists() })
      
      // Invalidate department positions
      if (updatedPosition.departmentId) {
        queryClient.invalidateQueries({ 
          queryKey: positionKeys.byDepartment(updatedPosition.departmentId) 
        })
        
        // Invalidate department detail
        queryClient.invalidateQueries({ 
          queryKey: ['departments', 'detail', updatedPosition.departmentId] 
        })
      }
      
      toast.success('Posisi berhasil diperbarui', {
        description: `${updatedPosition.positionCode} - ${updatedPosition.positionName}`,
      })
    },
    onError: (error: Error, { id }, context) => {
      // Rollback on error
      if (context?.previousPosition) {
        queryClient.setQueryData(positionKeys.detail(id), context.previousPosition)
      }
      
      toast.error('Gagal memperbarui posisi', {
        description: error.message,
      })
    },
  })
}

/**
 * Delete position mutation
 * 
 * Features:
 * - Removes from cache immediately
 * - Invalidates related queries
 * - Toast notifications
 * - Error handling with rollback
 * 
 * @returns Mutation object with mutate function
 * 
 * @example
 * ```typescript
 * const { mutate: deletePosition } = useDeletePosition()
 * 
 * deletePosition('pos-123')
 * ```
 */
export function useDeletePosition() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await positionApi.delete(id)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete position')
      }
      
      return { id }
    },
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: positionKeys.detail(id) })
      
      // Snapshot previous value
      const previousPosition = queryClient.getQueryData<PositionWithRelations>(
        positionKeys.detail(id)
      )
      
      // Remove from cache optimistically
      queryClient.removeQueries({ queryKey: positionKeys.detail(id) })
      
      return { previousPosition }
    },
    onSuccess: (_, deletedId) => {
      // Get the deleted position data from cache snapshot
      const previousPosition = queryClient.getQueryData<PositionWithRelations>(
        positionKeys.detail(deletedId)
      )
      
      // Invalidate all position lists
      queryClient.invalidateQueries({ queryKey: positionKeys.lists() })
      
      // Invalidate department positions if departmentId exists
      if (previousPosition?.departmentId) {
        queryClient.invalidateQueries({ 
          queryKey: positionKeys.byDepartment(previousPosition.departmentId) 
        })
        
        // Invalidate department detail (for position count)
        queryClient.invalidateQueries({ 
          queryKey: ['departments', 'detail', previousPosition.departmentId] 
        })
      }
      
      toast.success('Posisi berhasil dihapus')
    },
    onError: (error: Error, id, context) => {
      // Rollback on error
      if (context?.previousPosition) {
        queryClient.setQueryData(positionKeys.detail(id), context.previousPosition)
      }
      
      toast.error('Gagal menghapus posisi', {
        description: error.message,
      })
    },
  })
}
