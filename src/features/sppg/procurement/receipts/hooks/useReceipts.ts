/**
 * @fileoverview Receipt TanStack Query Hooks
 * @version Next.js 15.5.4 / TanStack Query v5 / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/PROCUREMENT_WORKFLOW_GUIDE.md} Procurement Documentation
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { receiptApi } from '../api'
import type {
  ReceiptFilters,
  ReceiptSort,
  CreateReceiptInput,
  UpdateReceiptInput,
  QualityControlInput
} from '../types'

// ================================ QUERY KEYS ================================

export const receiptKeys = {
  all: ['receipts'] as const,
  lists: () => [...receiptKeys.all, 'list'] as const,
  list: (filters?: ReceiptFilters, sort?: ReceiptSort) => 
    [...receiptKeys.lists(), { filters, sort }] as const,
  details: () => [...receiptKeys.all, 'detail'] as const,
  detail: (id: string) => [...receiptKeys.details(), id] as const,
  stats: () => [...receiptKeys.all, 'stats'] as const,
  pending: () => [...receiptKeys.all, 'pending'] as const,
}

// ================================ QUERY HOOKS ================================

/**
 * Hook to fetch all receipts with filtering and sorting
 * 
 * @example
 * ```typescript
 * const { data, isLoading } = useReceipts({
 *   supplierId: 'supplier-123',
 *   deliveryStatus: 'DELIVERED'
 * })
 * ```
 */
export function useReceipts(filters?: ReceiptFilters, sort?: ReceiptSort) {
  return useQuery({
    queryKey: receiptKeys.list(filters, sort),
    queryFn: async () => {
      const result = await receiptApi.getAll(filters, sort)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch receipts')
      }
      
      return result.data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook to fetch receipt statistics
 */
export function useReceiptStats() {
  return useQuery({
    queryKey: receiptKeys.stats(),
    queryFn: async () => {
      const result = await receiptApi.getStats()
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch receipt stats')
      }
      
      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch single receipt by ID
 * 
 * @example
 * ```typescript
 * const { data: receipt } = useReceipt(receiptId)
 * ```
 */
export function useReceipt(id: string) {
  return useQuery({
    queryKey: receiptKeys.detail(id),
    queryFn: async () => {
      const result = await receiptApi.getById(id)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch receipt')
      }
      
      return result.data
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook to fetch pending procurements ready for receipt
 */
export function usePendingProcurements() {
  return useQuery({
    queryKey: receiptKeys.pending(),
    queryFn: async () => {
      const result = await receiptApi.getPendingProcurements()
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch pending procurements')
      }
      
      return result.data
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

// ================================ MUTATION HOOKS ================================

/**
 * Hook to create new receipt
 * 
 * @example
 * ```typescript
 * const { mutate: createReceipt, isPending } = useCreateReceipt()
 * 
 * createReceipt(receiptData, {
 *   onSuccess: (data) => {
 *     router.push(`/procurement/receipts/${data.data?.id}`)
 *   }
 * })
 * ```
 */
export function useCreateReceipt() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateReceiptInput) => receiptApi.create(data),
    onSuccess: () => {
      // Invalidate and refetch receipts
      queryClient.invalidateQueries({ queryKey: receiptKeys.lists() })
      queryClient.invalidateQueries({ queryKey: receiptKeys.stats() })
      queryClient.invalidateQueries({ queryKey: receiptKeys.pending() })
      
      toast.success('Penerimaan barang berhasil dicatat')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal mencatat penerimaan barang')
    }
  })
}

/**
 * Hook to update receipt
 * 
 * @example
 * ```typescript
 * const { mutate: updateReceipt } = useUpdateReceipt()
 * 
 * updateReceipt({ id: receiptId, data: updateData })
 * ```
 */
export function useUpdateReceipt() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReceiptInput }) => 
      receiptApi.update(id, data),
    onSuccess: (response, variables) => {
      // Update specific receipt in cache
      queryClient.setQueryData(
        receiptKeys.detail(variables.id),
        response.data
      )
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: receiptKeys.lists() })
      queryClient.invalidateQueries({ queryKey: receiptKeys.stats() })
      
      toast.success('Penerimaan barang berhasil diperbarui')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal memperbarui penerimaan barang')
    }
  })
}

/**
 * Hook to submit quality control inspection
 * 
 * @example
 * ```typescript
 * const { mutate: submitQC, isPending } = useSubmitQualityControl()
 * 
 * submitQC(qualityData)
 * ```
 */
export function useSubmitQualityControl() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: QualityControlInput) => 
      receiptApi.submitQualityControl(data),
    onSuccess: (response, variables) => {
      // Update receipt detail
      queryClient.setQueryData(
        receiptKeys.detail(variables.receiptId),
        response.data
      )
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: receiptKeys.lists() })
      queryClient.invalidateQueries({ queryKey: receiptKeys.stats() })
      
      toast.success('Quality control berhasil disubmit')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal submit quality control')
    }
  })
}

/**
 * Hook to accept receipt
 * 
 * @example
 * ```typescript
 * const { mutate: acceptReceipt } = useAcceptReceipt()
 * 
 * acceptReceipt(receiptId)
 * ```
 */
export function useAcceptReceipt() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => receiptApi.accept(id),
    onSuccess: (response, id) => {
      // Update receipt detail
      queryClient.setQueryData(
        receiptKeys.detail(id),
        response.data
      )
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: receiptKeys.lists() })
      queryClient.invalidateQueries({ queryKey: receiptKeys.stats() })
      
      toast.success('Penerimaan barang berhasil diterima')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menerima penerimaan barang')
    }
  })
}

/**
 * Hook to reject receipt
 * 
 * @example
 * ```typescript
 * const { mutate: rejectReceipt } = useRejectReceipt()
 * 
 * rejectReceipt({ id: receiptId, reason: 'Kualitas tidak sesuai' })
 * ```
 */
export function useRejectReceipt() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      receiptApi.reject(id, reason),
    onSuccess: (response, variables) => {
      // Update receipt detail
      queryClient.setQueryData(
        receiptKeys.detail(variables.id),
        response.data
      )
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: receiptKeys.lists() })
      queryClient.invalidateQueries({ queryKey: receiptKeys.stats() })
      
      toast.success('Penerimaan barang berhasil ditolak')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menolak penerimaan barang')
    }
  })
}

/**
 * Hook to delete receipt
 * 
 * @example
 * ```typescript
 * const { mutate: deleteReceipt } = useDeleteReceipt()
 * 
 * deleteReceipt(receiptId)
 * ```
 */
export function useDeleteReceipt() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => receiptApi.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: receiptKeys.detail(deletedId) })
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: receiptKeys.lists() })
      queryClient.invalidateQueries({ queryKey: receiptKeys.stats() })
      
      toast.success('Penerimaan barang berhasil dihapus')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menghapus penerimaan barang')
    }
  })
}
