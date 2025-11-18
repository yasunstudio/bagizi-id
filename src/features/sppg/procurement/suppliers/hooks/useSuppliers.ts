/**
 * @fileoverview Supplier Management Hooks - Independent Domain
 * @version Next.js 15.5.4 / TanStack Query v5 / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Enterprise Development Guidelines
 * 
 * ARCHITECTURAL NOTE:
 * Supplier hooks are in independent domain for reusability across:
 * - Procurement (purchase orders)
 * - Inventory (item sourcing)
 * - Production (raw materials)
 * - Quality (evaluations)
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supplierApi } from '../api'
import type {
  CreateSupplierInput,
  UpdateSupplierInput,
  SupplierFilters
} from '../types'

// ================================ QUERY KEY FACTORY ================================

/**
 * Query key factory for suppliers
 */
export const supplierKeys = {
  all: ['suppliers'] as const,
  lists: () => [...supplierKeys.all, 'list'] as const,
  list: (filters?: Partial<SupplierFilters>) => 
    [...supplierKeys.lists(), { filters }] as const,
  details: () => [...supplierKeys.all, 'detail'] as const,
  detail: (id: string) => [...supplierKeys.details(), id] as const,
  performance: (id: string) => [...supplierKeys.all, 'performance', id] as const,
}

// ================================ SUPPLIER QUERY HOOKS ================================

/**
 * Hook to fetch suppliers with optional filters
 * Returns array of Suppliers directly
 * 
 * @example
 * ```tsx
 * // Basic usage
 * const { data: suppliers, isLoading } = useSuppliers()
 * 
 * // With filters
 * const { data: activeSuppliers } = useSuppliers({ isActive: true })
 * const { data: localSuppliers } = useSuppliers({ supplierType: ['LOCAL'] })
 * ```
 */
export function useSuppliers(filters?: Partial<SupplierFilters>) {
  return useQuery({
    queryKey: supplierKeys.list(filters),
    queryFn: async () => {
      const response = await supplierApi.getSuppliers(filters)
      // API returns { success, data: [...], pagination }
      // So response.data is the array of suppliers
      return response.data ?? []
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook to fetch single supplier by ID
 */
export function useSupplier(id: string) {
  return useQuery({
    queryKey: supplierKeys.detail(id),
    queryFn: () => supplierApi.getSupplierById(id),
    select: (data) => data.data,
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook to fetch active suppliers only
 */
export function useActiveSuppliers() {
  return useQuery({
    queryKey: supplierKeys.list({ isActive: true }),
    queryFn: () => supplierApi.getSuppliers({ isActive: true }),
    select: (data) => data.data,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook to fetch supplier performance analytics
 */
export function useSupplierPerformance(id: string) {
  return useQuery({
    queryKey: supplierKeys.performance(id),
    queryFn: () => supplierApi.getSupplierPerformance(id),
    select: (data) => data.data,
    enabled: !!id,
    staleTime: 1000 * 60 * 3, // 3 minutes
  })
}

// ================================ SUPPLIER MUTATION HOOKS ================================

/**
 * Hook to create new supplier
 */
export function useCreateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSupplierInput) => supplierApi.createSupplier(data),
    onSuccess: () => {
      // Invalidate suppliers list
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() })
      toast.success('Supplier berhasil ditambahkan')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menambahkan supplier')
    }
  })
}

/**
 * Hook to update supplier
 */
export function useUpdateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UpdateSupplierInput> }) => 
      supplierApi.updateSupplier(id, data),
    onSuccess: (response, variables) => {
      // Invalidate specific supplier and lists
      queryClient.invalidateQueries({ queryKey: supplierKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() })
      toast.success('Supplier berhasil diperbarui')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal memperbarui supplier')
    }
  })
}

/**
 * Hook to delete supplier
 */
export function useDeleteSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => supplierApi.deleteSupplier(id),
    onSuccess: () => {
      // Invalidate suppliers list
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() })
      toast.success('Supplier berhasil dihapus')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menghapus supplier')
    }
  })
}

/**
 * Hook to activate supplier
 */
export function useActivateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => supplierApi.activateSupplier(id),
    onSuccess: (response, id) => {
      // Invalidate specific supplier and lists
      queryClient.invalidateQueries({ queryKey: supplierKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() })
      toast.success('Supplier berhasil diaktifkan')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal mengaktifkan supplier')
    }
  })
}

/**
 * Hook to deactivate supplier
 */
export function useDeactivateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => 
      supplierApi.deactivateSupplier(id, reason),
    onSuccess: (response, variables) => {
      // Invalidate specific supplier and lists
      queryClient.invalidateQueries({ queryKey: supplierKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() })
      toast.success('Supplier berhasil dinonaktifkan')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menonaktifkan supplier')
    }
  })
}

/**
 * Hook to blacklist supplier
 */
export function useBlacklistSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      supplierApi.blacklistSupplier(id, reason),
    onSuccess: (response, variables) => {
      // Invalidate specific supplier and lists
      queryClient.invalidateQueries({ queryKey: supplierKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() })
      toast.warning('Supplier telah dimasukkan ke daftar hitam')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal memblacklist supplier')
    }
  })
}
