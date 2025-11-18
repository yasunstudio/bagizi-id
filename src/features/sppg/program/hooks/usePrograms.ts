/**
 * @fileoverview React Query hooks untuk Program domain
 * @version Next.js 15.5.4 / TanStack Query v5
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * CRITICAL: Menggunakan centralized API client (programApi)
 * NEVER use direct fetch() calls
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { programApi } from '../api'
import type {
  Program,
  CreateProgramInput,
  UpdateProgramInput,
  ProgramFilters
} from '../types'
import { toast } from 'sonner'

/**
 * Query keys untuk cache management
 */
export const programKeys = {
  all: ['programs'] as const,
  lists: () => [...programKeys.all, 'list'] as const,
  list: (filters?: ProgramFilters) => [...programKeys.lists(), { filters }] as const,
  details: () => [...programKeys.all, 'detail'] as const,
  detail: (id: string) => [...programKeys.details(), id] as const,
  stats: (id: string) => [...programKeys.detail(id), 'stats'] as const,
  summary: () => [...programKeys.all, 'summary'] as const,
}

/**
 * Fetch all programs dengan optional filtering
 * Auto-filtered by sppgId pada server (multi-tenant security)
 * 
 * @example
 * ```typescript
 * const { data, isLoading } = usePrograms({ status: 'ACTIVE' })
 * ```
 */
export function usePrograms(filters?: ProgramFilters) {
  return useQuery({
    queryKey: programKeys.list(filters),
    queryFn: async () => {
      const result = await programApi.getAll(filters)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch programs')
      }
      
      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Fetch single program by ID
 * 
 * @example
 * ```typescript
 * const { data: program } = useProgram('clu123abc')
 * ```
 */
export function useProgram(id: string) {
  return useQuery({
    queryKey: programKeys.detail(id),
    queryFn: async () => {
      const result = await programApi.getById(id)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch program')
      }
      
      return result.data
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Fetch program dengan statistics
 * 
 * @example
 * ```typescript
 * const { data: programWithStats } = useProgramWithStats('clu123abc')
 * console.log('Menu count:', programWithStats?._count.menus)
 * ```
 */
export function useProgramWithStats(id: string) {
  return useQuery({
    queryKey: programKeys.stats(id),
    queryFn: async () => {
      const result = await programApi.getWithStats(id)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch program with stats')
      }
      
      return result.data
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes (stats change more frequently)
  })
}

/**
 * Fetch program summary statistics
 * Returns aggregated data untuk dashboard
 * 
 * @example
 * ```typescript
 * const { data: summary } = useProgramSummary()
 * console.log('Total Programs:', summary?.totalPrograms)
 * ```
 */
export function useProgramSummary() {
  return useQuery({
    queryKey: programKeys.summary(),
    queryFn: async () => {
      const result = await programApi.getSummary()
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch program summary')
      }
      
      return result.data
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Mutation untuk create program
 * Auto-invalidates programs list cache
 * 
 * @example
 * ```typescript
 * const { mutate: createProgram, isPending } = useCreateProgram()
 * 
 * createProgram({
 *   name: 'Program Makan Bergizi Gratis SD',
 *   programType: 'FREE_NUTRITIOUS_MEAL',
 *   allowedTargetGroups: ['SCHOOL_CHILDREN'],
 *   ...
 * }, {
 *   onSuccess: (program) => {
 *     console.log('Created:', program.programCode)
 *   }
 * })
 * ```
 */
export function useCreateProgram() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateProgramInput) => {
      const result = await programApi.create(data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create program')
      }
      
      return result.data
    },
    onSuccess: (newProgram) => {
      // Invalidate programs list cache
      queryClient.invalidateQueries({ queryKey: programKeys.lists() })
      queryClient.invalidateQueries({ queryKey: programKeys.summary() })
      
      toast.success(`Program "${newProgram.name}" berhasil dibuat`, {
        description: `Kode Program: ${newProgram.programCode}`
      })
    },
    onError: (error: Error) => {
      toast.error('Gagal membuat program', {
        description: error.message
      })
    }
  })
}

/**
 * Mutation untuk update program
 * Auto-updates program cache optimistically
 * 
 * @example
 * ```typescript
 * const { mutate: updateProgram } = useUpdateProgram()
 * 
 * updateProgram({
 *   id: 'clu123abc',
 *   data: { targetRecipients: 600 }
 * })
 * ```
 */
export function useUpdateProgram() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProgramInput }) => {
      const result = await programApi.update(id, data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update program')
      }
      
      return result.data
    },
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: programKeys.detail(id) })
      
      // Snapshot previous value
      const previousProgram = queryClient.getQueryData<Program>(programKeys.detail(id))
      
      // Optimistically update cache
      if (previousProgram) {
        queryClient.setQueryData<Program>(programKeys.detail(id), {
          ...previousProgram,
          ...data
        })
      }
      
      return { previousProgram }
    },
    onSuccess: async (updatedProgram, { id }) => {
      // Update detail cache dengan data from server
      queryClient.setQueryData(programKeys.detail(id), updatedProgram)
      
      // Invalidate and refetch related caches
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: programKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: programKeys.stats(id) }),
        queryClient.invalidateQueries({ queryKey: programKeys.summary() }),
        // Force refetch detail page
        queryClient.refetchQueries({ queryKey: programKeys.detail(id) })
      ])
      
      toast.success('Program berhasil diperbarui')
    },
    onError: (error: Error, { id }, context) => {
      // Rollback optimistic update
      if (context?.previousProgram) {
        queryClient.setQueryData(programKeys.detail(id), context.previousProgram)
      }
      
      toast.error('Gagal memperbarui program', {
        description: error.message
      })
    }
  })
}

/**
 * Mutation untuk delete program
 * Removes program from cache
 * 
 * @example
 * ```typescript
 * const { mutate: deleteProgram } = useDeleteProgram()
 * 
 * deleteProgram('clu123abc', {
 *   onSuccess: () => {
 *     router.push('/program')
 *   }
 * })
 * ```
 */
export function useDeleteProgram() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await programApi.delete(id)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete program')
      }
      
      return id
    },
    onSuccess: (deletedId) => {
      // Remove from detail cache
      queryClient.removeQueries({ queryKey: programKeys.detail(deletedId) })
      queryClient.removeQueries({ queryKey: programKeys.stats(deletedId) })
      
      // Invalidate list cache
      queryClient.invalidateQueries({ queryKey: programKeys.lists() })
      queryClient.invalidateQueries({ queryKey: programKeys.summary() })
      
      toast.success('Program berhasil dihapus')
    },
    onError: (error: Error) => {
      toast.error('Gagal menghapus program', {
        description: error.message
      })
    }
  })
}

/**
 * Mutation untuk update program status
 * Specialized mutation untuk status changes
 * 
 * @example
 * ```typescript
 * const { mutate: updateStatus } = useUpdateProgramStatus()
 * 
 * updateStatus({
 *   id: 'clu123abc',
 *   status: 'COMPLETED'
 * })
 * ```
 */
export function useUpdateProgramStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      status 
    }: { 
      id: string
      status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'DRAFT' | 'ARCHIVED'
    }) => {
      const result = await programApi.updateStatus(id, status)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update program status')
      }
      
      return result.data
    },
    onSuccess: (updatedProgram, { id }) => {
      // Update caches
      queryClient.setQueryData(programKeys.detail(id), updatedProgram)
      queryClient.invalidateQueries({ queryKey: programKeys.lists() })
      queryClient.invalidateQueries({ queryKey: programKeys.summary() })
      
      const statusLabel: Record<string, string> = {
        ACTIVE: 'Aktif',
        PAUSED: 'Dijeda',
        COMPLETED: 'Selesai',
        CANCELLED: 'Dibatalkan',
        DRAFT: 'Draft',
        ARCHIVED: 'Diarsipkan'
      }
      
      toast.success(`Status program diubah menjadi "${statusLabel[updatedProgram.status] || updatedProgram.status}"`)
    },
    onError: (error: Error) => {
      toast.error('Gagal mengubah status program', {
        description: error.message
      })
    }
  })
}
