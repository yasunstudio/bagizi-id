/**
 * @fileoverview Procurement Items React Query Hooks
 * TanStack Query integration for items management
 * 
 * @version React 18 / TanStack Query v5
 * @author Bagizi-ID Development Team
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { itemsApi } from '../api/itemsApi'
import type {
  ProcurementItemFilters,
  CreateProcurementItemInput,
  UpdateProcurementItemInput,
} from '../types/item.types'
import { toast } from 'sonner'

// ============================================================================
// Query Keys
// ============================================================================

export const itemsKeys = {
  all: ['procurement-items'] as const,
  lists: () => [...itemsKeys.all, 'list'] as const,
  list: (orderId: string, filters?: ProcurementItemFilters) => 
    [...itemsKeys.lists(), orderId, filters] as const,
  details: () => [...itemsKeys.all, 'detail'] as const,
  detail: (orderId: string, itemId: string) => 
    [...itemsKeys.details(), orderId, itemId] as const,
  stats: (orderId: string) => 
    [...itemsKeys.all, 'stats', orderId] as const,
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch all items for a procurement order
 */
export function useItems(orderId: string, filters?: ProcurementItemFilters) {
  return useQuery({
    queryKey: itemsKeys.list(orderId, filters),
    queryFn: async () => {
      const result = await itemsApi.getAll(orderId, filters)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch items')
      }
      
      return result.data
    },
    enabled: !!orderId,
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Fetch single item detail
 */
export function useItem(orderId: string, itemId: string) {
  return useQuery({
    queryKey: itemsKeys.detail(orderId, itemId),
    queryFn: async () => {
      const result = await itemsApi.getById(orderId, itemId)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch item')
      }
      
      return result.data
    },
    enabled: !!orderId && !!itemId,
    staleTime: 60 * 1000, // 1 minute
  })
}

/**
 * Fetch items statistics
 */
export function useItemsStats(orderId: string) {
  return useQuery({
    queryKey: itemsKeys.stats(orderId),
    queryFn: async () => {
      const result = await itemsApi.getStats(orderId)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch statistics')
      }
      
      return result.data
    },
    enabled: !!orderId,
    staleTime: 60 * 1000, // 1 minute
  })
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create new procurement item
 */
export function useCreateItem(orderId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateProcurementItemInput) => {
      const result = await itemsApi.create(orderId, data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create item')
      }
      
      return result.data
    },
    onSuccess: () => {
      // Invalidate items list and stats
      queryClient.invalidateQueries({ queryKey: itemsKeys.list(orderId) })
      queryClient.invalidateQueries({ queryKey: itemsKeys.stats(orderId) })
      
      // Also invalidate order detail to update totals
      queryClient.invalidateQueries({ queryKey: ['procurement-orders', 'detail', orderId] })
      
      toast.success('Item added successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add item')
    },
  })
}

/**
 * Update procurement item
 */
export function useUpdateItem(orderId: string, itemId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: UpdateProcurementItemInput) => {
      const result = await itemsApi.update(orderId, itemId, data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update item')
      }
      
      return result.data
    },
    onSuccess: (data) => {
      // Update item detail cache
      queryClient.setQueryData(itemsKeys.detail(orderId, itemId), data)
      
      // Invalidate lists and stats
      queryClient.invalidateQueries({ queryKey: itemsKeys.list(orderId) })
      queryClient.invalidateQueries({ queryKey: itemsKeys.stats(orderId) })
      
      toast.success('Item updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update item')
    },
  })
}

/**
 * Delete procurement item
 */
export function useDeleteItem(orderId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (itemId: string) => {
      const result = await itemsApi.delete(orderId, itemId)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete item')
      }
      
      return itemId
    },
    onSuccess: () => {
      // Invalidate lists and stats
      queryClient.invalidateQueries({ queryKey: itemsKeys.list(orderId) })
      queryClient.invalidateQueries({ queryKey: itemsKeys.stats(orderId) })
      
      // Also invalidate order detail to update totals
      queryClient.invalidateQueries({ queryKey: ['procurement-orders', 'detail', orderId] })
      
      toast.success('Item deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete item')
    },
  })
}

/**
 * Bulk receive items
 */
export function useBulkReceiveItems(orderId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (items: Array<{
      itemId: string
      receivedQuantity: number
      isAccepted: boolean
      qualityReceived?: string
      gradeReceived?: string
      rejectionReason?: string
    }>) => {
      const result = await itemsApi.bulkReceive(orderId, items)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to bulk receive items')
      }
      
      return result.data
    },
    onSuccess: (data) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: itemsKeys.list(orderId) })
      queryClient.invalidateQueries({ queryKey: itemsKeys.stats(orderId) })
      queryClient.invalidateQueries({ queryKey: ['procurement-orders', 'detail', orderId] })
      
      toast.success(`Successfully received ${data.updated} items`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to receive items')
    },
  })
}
