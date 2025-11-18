/**
 * @fileoverview React Query hooks for Beneficiary Organizations
 * @version Next.js 15.5.4 / TanStack Query v5
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { beneficiaryOrganizationsApi } from '../api/beneficiaryOrganizationsApi'
import type {
  CreateBeneficiaryOrganizationInput,
  UpdateBeneficiaryOrganizationInput,
  BeneficiaryOrganizationFilters,
  BeneficiaryOrganizationWithRelations,
} from '../types/beneficiaryOrganization.types'

// ============================================================================
// Query Keys
// ============================================================================

export const beneficiaryOrganizationKeys = {
  all: ['beneficiary-organizations'] as const,
  lists: () => [...beneficiaryOrganizationKeys.all, 'list'] as const,
  list: (filters?: BeneficiaryOrganizationFilters) =>
    [...beneficiaryOrganizationKeys.lists(), { filters }] as const,
  details: () => [...beneficiaryOrganizationKeys.all, 'detail'] as const,
  detail: (id: string) => [...beneficiaryOrganizationKeys.details(), id] as const,
  stats: () => [...beneficiaryOrganizationKeys.all, 'stats'] as const,
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch all beneficiary organizations with optional filtering
 * 
 * @param filters - Optional filter parameters
 * @param options - TanStack Query options
 * @returns Query result with beneficiary organizations array
 * 
 * @example
 * ```typescript
 * const { data: orgs, isLoading } = useBeneficiaryOrganizations({
 *   type: 'SCHOOL',
 *   status: 'ACTIVE'
 * })
 * ```
 */
export function useBeneficiaryOrganizations(
  filters?: BeneficiaryOrganizationFilters,
  options?: {
    enabled?: boolean
    staleTime?: number
    refetchInterval?: number
  }
) {
  return useQuery({
    queryKey: beneficiaryOrganizationKeys.list(filters),
    queryFn: async () => {
      const result = await beneficiaryOrganizationsApi.getAll(filters)

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch beneficiary organizations')
      }

      return result.data
    },
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    refetchInterval: options?.refetchInterval,
  })
}

/**
 * Fetch single beneficiary organization by ID
 * 
 * @param id - Organization ID
 * @param options - TanStack Query options
 * @returns Query result with beneficiary organization details
 * 
 * @example
 * ```typescript
 * const { data: org, isLoading } = useBeneficiaryOrganization('org_123')
 * ```
 */
export function useBeneficiaryOrganization(
  id: string,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: beneficiaryOrganizationKeys.detail(id),
    queryFn: async () => {
      const result = await beneficiaryOrganizationsApi.getById(id)

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch beneficiary organization')
      }

      return result.data
    },
    enabled: options?.enabled ?? !!id,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Fetch beneficiary organization statistics
 * 
 * @param options - TanStack Query options
 * @returns Query result with statistics
 * 
 * @example
 * ```typescript
 * const { data: stats, isLoading } = useBeneficiaryOrganizationStats()
 * console.log(stats.totalOrganizations, stats.activeOrganizations)
 * ```
 */
export function useBeneficiaryOrganizationStats(options?: {
  enabled?: boolean
  staleTime?: number
  refetchInterval?: number
}) {
  return useQuery({
    queryKey: beneficiaryOrganizationKeys.stats(),
    queryFn: async () => {
      const result = await beneficiaryOrganizationsApi.getStats()

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch organization statistics')
      }

      return result.data
    },
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 2 * 60 * 1000, // 2 minutes
    refetchInterval: options?.refetchInterval,
  })
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create new beneficiary organization
 * 
 * Features:
 * - Automatic organizationCode generation on server
 * - Optimistic cache update
 * - Toast notifications
 * - Query invalidation
 * 
 * @returns Mutation object with mutate function
 * 
 * @example
 * ```typescript
 * const { mutate: createOrg, isPending } = useCreateBeneficiaryOrganization()
 * 
 * createOrg({
 *   organizationName: 'SDN 01 Jakarta',
 *   type: 'SCHOOL',
 *   address: 'Jl. Sudirman No. 1',
 *   phone: '021-1234567',
 *   email: 'sdn01@example.com'
 * }, {
 *   onSuccess: (data) => {
 *     console.log('Created:', data.organizationCode)
 *   }
 * })
 * ```
 */
export function useCreateBeneficiaryOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateBeneficiaryOrganizationInput) => {
      const result = await beneficiaryOrganizationsApi.create(data)

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create beneficiary organization')
      }

      return result.data
    },
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: beneficiaryOrganizationKeys.lists() })

      // Snapshot previous value
      const previousOrgs = queryClient.getQueryData<BeneficiaryOrganizationWithRelations[]>(
        beneficiaryOrganizationKeys.lists()
      )

      // Optimistically update cache (optional - since we don't have ID yet)
      // We'll just invalidate after success instead

      return { previousOrgs }
    },
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: beneficiaryOrganizationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: beneficiaryOrganizationKeys.stats() })

      // Show success toast
      toast.success('Organisasi berhasil dibuat', {
        description: `${data.organizationName} (${data.organizationCode})`,
      })
    },
    onError: (error: Error, _newOrg, context) => {
      // Rollback on error
      if (context?.previousOrgs) {
        queryClient.setQueryData(beneficiaryOrganizationKeys.lists(), context.previousOrgs)
      }

      // Show error toast
      toast.error('Gagal membuat organisasi', {
        description: error.message,
      })
    },
  })
}

/**
 * Update existing beneficiary organization
 * 
 * Features:
 * - Optimistic cache update
 * - Toast notifications
 * - Query invalidation
 * 
 * @returns Mutation object with mutate function
 * 
 * @example
 * ```typescript
 * const { mutate: updateOrg, isPending } = useUpdateBeneficiaryOrganization()
 * 
 * updateOrg({
 *   id: 'org_123',
 *   data: {
 *     phone: '021-9876543',
 *     status: 'INACTIVE'
 *   }
 * })
 * ```
 */
export function useUpdateBeneficiaryOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateBeneficiaryOrganizationInput }) => {
      const result = await beneficiaryOrganizationsApi.update(id, data)

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update beneficiary organization')
      }

      return result.data
    },
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: beneficiaryOrganizationKeys.detail(id) })
      await queryClient.cancelQueries({ queryKey: beneficiaryOrganizationKeys.lists() })

      // Snapshot previous values
      const previousOrg = queryClient.getQueryData<BeneficiaryOrganizationWithRelations>(
        beneficiaryOrganizationKeys.detail(id)
      )
      const previousOrgs = queryClient.getQueryData<BeneficiaryOrganizationWithRelations[]>(
        beneficiaryOrganizationKeys.lists()
      )

      // Optimistically update detail cache
      if (previousOrg) {
        queryClient.setQueryData<BeneficiaryOrganizationWithRelations>(
          beneficiaryOrganizationKeys.detail(id),
          { ...previousOrg, ...data, updatedAt: new Date() }
        )
      }

      // Optimistically update list cache
      if (previousOrgs) {
        queryClient.setQueryData<BeneficiaryOrganizationWithRelations[]>(
          beneficiaryOrganizationKeys.lists(),
          previousOrgs.map((org) =>
            org.id === id ? { ...org, ...data, updatedAt: new Date() } : org
          )
        )
      }

      return { previousOrg, previousOrgs }
    },
    onSuccess: (data, { id }) => {
      // Update cache with real data from server
      queryClient.setQueryData(beneficiaryOrganizationKeys.detail(id), data)

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: beneficiaryOrganizationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: beneficiaryOrganizationKeys.stats() })

      // Show success toast
      toast.success('Organisasi berhasil diperbarui', {
        description: data.organizationName,
      })
    },
    onError: (error: Error, { id }, context) => {
      // Rollback on error
      if (context?.previousOrg) {
        queryClient.setQueryData(beneficiaryOrganizationKeys.detail(id), context.previousOrg)
      }
      if (context?.previousOrgs) {
        queryClient.setQueryData(beneficiaryOrganizationKeys.lists(), context.previousOrgs)
      }

      // Show error toast
      toast.error('Gagal memperbarui organisasi', {
        description: error.message,
      })
    },
  })
}

/**
 * Delete beneficiary organization
 * 
 * Features:
 * - Validation check (prevents deletion if enrollments exist)
 * - Optimistic cache update
 * - Toast notifications
 * - Query invalidation
 * 
 * @returns Mutation object with mutate function
 * 
 * @example
 * ```typescript
 * const { mutate: deleteOrg, isPending } = useDeleteBeneficiaryOrganization()
 * 
 * // With confirmation dialog
 * const handleDelete = (org: BeneficiaryOrganization) => {
 *   if (confirm(`Hapus ${org.organizationName}?`)) {
 *     deleteOrg(org.id)
 *   }
 * }
 * ```
 */
export function useDeleteBeneficiaryOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await beneficiaryOrganizationsApi.delete(id)

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete beneficiary organization')
      }

      return { id }
    },
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: beneficiaryOrganizationKeys.lists() })

      // Snapshot previous value
      const previousOrgs = queryClient.getQueryData<BeneficiaryOrganizationWithRelations[]>(
        beneficiaryOrganizationKeys.lists()
      )

      // Optimistically remove from cache
      if (previousOrgs) {
        queryClient.setQueryData<BeneficiaryOrganizationWithRelations[]>(
          beneficiaryOrganizationKeys.lists(),
          previousOrgs.filter((org) => org.id !== id)
        )
      }

      return { previousOrgs }
    },
    onSuccess: (data) => {
      // Remove detail cache
      queryClient.removeQueries({ queryKey: beneficiaryOrganizationKeys.detail(data.id) })

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: beneficiaryOrganizationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: beneficiaryOrganizationKeys.stats() })

      // Show success toast
      toast.success('Organisasi berhasil dihapus')
    },
    onError: (error: Error, _id, context) => {
      // Rollback on error
      if (context?.previousOrgs) {
        queryClient.setQueryData(beneficiaryOrganizationKeys.lists(), context.previousOrgs)
      }

      // Show error toast
      toast.error('Gagal menghapus organisasi', {
        description: error.message,
      })
    },
  })
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Prefetch beneficiary organization for hover states
 * 
 * @returns Prefetch function
 * 
 * @example
 * ```typescript
 * const prefetchOrg = usePrefetchBeneficiaryOrganization()
 * 
 * <Card
 *   onMouseEnter={() => prefetchOrg(org.id)}
 *   onTouchStart={() => prefetchOrg(org.id)}
 * >
 *   ...
 * </Card>
 * ```
 */
export function usePrefetchBeneficiaryOrganization() {
  const queryClient = useQueryClient()

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: beneficiaryOrganizationKeys.detail(id),
      queryFn: async () => {
        const result = await beneficiaryOrganizationsApi.getById(id)
        if (!result.success || !result.data) {
          throw new Error(result.error || 'Failed to fetch beneficiary organization')
        }
        return result.data
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    })
  }
}
