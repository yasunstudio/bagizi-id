/**
 * @fileoverview React Query hooks for Beneficiary Enrollments
 * @version Next.js 15.5.4 / TanStack Query v5
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { beneficiaryEnrollmentsApi } from '../api/beneficiaryEnrollmentsApi'
import type {
  CreateBeneficiaryEnrollmentInput,
  BeneficiaryEnrollmentFilters,
  BeneficiaryEnrollmentWithRelations,
} from '../types/beneficiaryEnrollment.types'

// Update type is same as Create but with optional fields
type UpdateBeneficiaryEnrollmentInput = Partial<CreateBeneficiaryEnrollmentInput>

// ============================================================================
// Query Keys
// ============================================================================

export const beneficiaryEnrollmentKeys = {
  all: ['beneficiary-enrollments'] as const,
  lists: () => [...beneficiaryEnrollmentKeys.all, 'list'] as const,
  list: (filters?: BeneficiaryEnrollmentFilters) =>
    [...beneficiaryEnrollmentKeys.lists(), { filters }] as const,
  details: () => [...beneficiaryEnrollmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...beneficiaryEnrollmentKeys.details(), id] as const,
  stats: () => [...beneficiaryEnrollmentKeys.all, 'stats'] as const,
  byProgram: (programId: string) =>
    [...beneficiaryEnrollmentKeys.all, 'by-program', programId] as const,
  byOrganization: (organizationId: string) =>
    [...beneficiaryEnrollmentKeys.all, 'by-organization', organizationId] as const,
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch all beneficiary enrollments with optional filtering
 * 
 * @param filters - Optional filter parameters
 * @param options - TanStack Query options
 * @returns Query result with enrollments array
 * 
 * @example
 * ```typescript
 * const { data: enrollments, isLoading } = useBeneficiaryEnrollments({
 *   programId: 'prog_123',
 *   status: 'ACTIVE',
 *   targetGroup: 'SCHOOL_CHILDREN'
 * })
 * ```
 */
export function useBeneficiaryEnrollments(
  filters?: BeneficiaryEnrollmentFilters,
  options?: {
    enabled?: boolean
    staleTime?: number
    refetchInterval?: number
  }
) {
  return useQuery({
    queryKey: beneficiaryEnrollmentKeys.list(filters),
    queryFn: async () => {
      const result = await beneficiaryEnrollmentsApi.getAll(filters)

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch beneficiary enrollments')
      }

      return result.data
    },
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    refetchInterval: options?.refetchInterval,
  })
}

/**
 * Fetch enrollments for a specific program
 * 
 * @param programId - Program ID
 * @param options - TanStack Query options
 * @returns Query result with enrollments array
 * 
 * @example
 * ```typescript
 * const { data: enrollments } = useEnrollmentsByProgram('prog_123')
 * ```
 */
export function useEnrollmentsByProgram(
  programId: string,
  options?: {
    enabled?: boolean
    targetGroup?: string
  }
) {
  const filters: BeneficiaryEnrollmentFilters = {
    programId,
  }

  return useQuery({
    queryKey: beneficiaryEnrollmentKeys.byProgram(programId),
    queryFn: async () => {
      const result = await beneficiaryEnrollmentsApi.getAll(filters)

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch program enrollments')
      }

      return result.data
    },
    enabled: options?.enabled ?? !!programId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Fetch enrollments for a specific organization
 * 
 * @param organizationId - Organization ID
 * @param options - TanStack Query options
 * @returns Query result with enrollments array
 * 
 * @example
 * ```typescript
 * const { data: enrollments } = useEnrollmentsByOrganization('org_123')
 * ```
 */
export function useEnrollmentsByOrganization(
  organizationId: string,
  options?: {
    enabled?: boolean
    status?: string
  }
) {
  const filters: BeneficiaryEnrollmentFilters = {
    beneficiaryOrgId: organizationId,
    ...(options?.status && { status: options.status }),
  }

  return useQuery({
    queryKey: beneficiaryEnrollmentKeys.byOrganization(organizationId),
    queryFn: async () => {
      const result = await beneficiaryEnrollmentsApi.getAll(filters)

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch organization enrollments')
      }

      return result.data
    },
    enabled: options?.enabled ?? !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Fetch single beneficiary enrollment by ID
 * 
 * @param id - Enrollment ID
 * @param options - TanStack Query options
 * @returns Query result with enrollment details
 * 
 * @example
 * ```typescript
 * const { data: enrollment, isLoading } = useBeneficiaryEnrollment('enroll_123')
 * ```
 */
export function useBeneficiaryEnrollment(
  id: string,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: beneficiaryEnrollmentKeys.detail(id),
    queryFn: async () => {
      const result = await beneficiaryEnrollmentsApi.getById(id)

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch beneficiary enrollment')
      }

      return result.data
    },
    enabled: options?.enabled ?? !!id,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Fetch beneficiary enrollment statistics
 * 
 * @param options - TanStack Query options
 * @returns Query result with statistics
 * 
 * @example
 * ```typescript
 * const { data: stats, isLoading } = useBeneficiaryEnrollmentStats()
 * console.log(stats.totalEnrollments, stats.activeEnrollments)
 * ```
 */
export function useBeneficiaryEnrollmentStats(options?: {
  enabled?: boolean
  staleTime?: number
  refetchInterval?: number
}) {
  return useQuery({
    queryKey: beneficiaryEnrollmentKeys.stats(),
    queryFn: async () => {
      const result = await beneficiaryEnrollmentsApi.getStats()

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch enrollment statistics')
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
 * Create new beneficiary enrollment
 * 
 * Features:
 * - Validation (organization and program must exist and belong to same SPPG)
 * - Optimistic cache update
 * - Toast notifications
 * - Query invalidation
 * 
 * @returns Mutation object with mutate function
 * 
 * @example
 * ```typescript
 * const { mutate: createEnrollment, isPending } = useCreateBeneficiaryEnrollment()
 * 
 * createEnrollment({
 *   programId: 'prog_123',
 *   beneficiaryOrgId: 'org_456',
 *   targetGroup: 'SCHOOL_CHILDREN',
 *   targetBeneficiaries: 500,
 *   startDate: new Date('2025-01-01'),
 *   endDate: new Date('2025-12-31'),
 *   contractStartDate: new Date('2025-01-01'),
 *   contractEndDate: new Date('2025-12-31'),
 *   contractValue: 50000000,
 *   status: 'ACTIVE'
 * }, {
 *   onSuccess: (data) => {
 *     console.log('Enrollment created:', data.id)
 *   }
 * })
 * ```
 */
export function useCreateBeneficiaryEnrollment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateBeneficiaryEnrollmentInput) => {
      const result = await beneficiaryEnrollmentsApi.create(data)

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create beneficiary enrollment')
      }

      return result.data
    },
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: beneficiaryEnrollmentKeys.lists() })

      // Snapshot previous value
      const previousEnrollments = queryClient.getQueryData<BeneficiaryEnrollmentWithRelations[]>(
        beneficiaryEnrollmentKeys.lists()
      )

      // Optimistically update cache (optional - since we don't have ID yet)
      // We'll just invalidate after success instead

      return { previousEnrollments }
    },
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: beneficiaryEnrollmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: beneficiaryEnrollmentKeys.stats() })
      queryClient.invalidateQueries({ 
        queryKey: beneficiaryEnrollmentKeys.byProgram(data.programId) 
      })
      queryClient.invalidateQueries({ 
        queryKey: beneficiaryEnrollmentKeys.byOrganization(data.beneficiaryOrgId) 
      })

      // Show success toast with safe field access
      const programName = data.program?.programName || 'Program'
      const orgName = data.beneficiaryOrg?.name || 'Organisasi'
      
      toast.success('Pendaftaran berhasil dibuat', {
        description: `Program: ${programName} - Organisasi: ${orgName}`,
      })
    },
    onError: (error: Error, _newEnrollment, context) => {
      // Rollback on error
      if (context?.previousEnrollments) {
        queryClient.setQueryData(beneficiaryEnrollmentKeys.lists(), context.previousEnrollments)
      }

      // Show error toast
      toast.error('Gagal membuat pendaftaran', {
        description: error.message,
      })
    },
  })
}

/**
 * Update existing beneficiary enrollment
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
 * const { mutate: updateEnrollment, isPending } = useUpdateBeneficiaryEnrollment()
 * 
 * updateEnrollment({
 *   id: 'enroll_123',
 *   data: {
 *     activeBeneficiaries: 450,
 *     status: 'COMPLETED'
 *   }
 * })
 * ```
 */
export function useUpdateBeneficiaryEnrollment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      id, 
      data 
    }: { 
      id: string
      data: UpdateBeneficiaryEnrollmentInput 
    }) => {
      const result = await beneficiaryEnrollmentsApi.update(id, data)

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update beneficiary enrollment')
      }

      return result.data
    },
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: beneficiaryEnrollmentKeys.detail(id) })
      await queryClient.cancelQueries({ queryKey: beneficiaryEnrollmentKeys.lists() })

      // Snapshot previous values
      const previousEnrollment = queryClient.getQueryData<BeneficiaryEnrollmentWithRelations>(
        beneficiaryEnrollmentKeys.detail(id)
      )
      const previousEnrollments = queryClient.getQueryData<BeneficiaryEnrollmentWithRelations[]>(
        beneficiaryEnrollmentKeys.lists()
      )

      // Optimistically update detail cache
      if (previousEnrollment) {
        queryClient.setQueryData<BeneficiaryEnrollmentWithRelations>(
          beneficiaryEnrollmentKeys.detail(id),
          { ...previousEnrollment, ...data, updatedAt: new Date() }
        )
      }

      // Optimistically update list cache
      if (previousEnrollments) {
        queryClient.setQueryData<BeneficiaryEnrollmentWithRelations[]>(
          beneficiaryEnrollmentKeys.lists(),
          previousEnrollments.map((enrollment) =>
            enrollment.id === id ? { ...enrollment, ...data, updatedAt: new Date() } : enrollment
          )
        )
      }

      return { previousEnrollment, previousEnrollments }
    },
    onSuccess: (data, { id }) => {
      // Update cache with real data from server
      queryClient.setQueryData(beneficiaryEnrollmentKeys.detail(id), data)

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: beneficiaryEnrollmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: beneficiaryEnrollmentKeys.stats() })
      queryClient.invalidateQueries({ 
        queryKey: beneficiaryEnrollmentKeys.byProgram(data.programId) 
      })
      queryClient.invalidateQueries({ 
        queryKey: beneficiaryEnrollmentKeys.byOrganization(data.beneficiaryOrgId) 
      })

      // Show success toast with safe field access
      const orgName = data.beneficiaryOrg?.name || 'Organisasi'
      const programName = data.program?.programName || 'Program'
      
      toast.success('Pendaftaran berhasil diperbarui', {
        description: `${orgName} - ${programName}`,
      })
    },
    onError: (error: Error, { id }, context) => {
      // Rollback on error
      if (context?.previousEnrollment) {
        queryClient.setQueryData(beneficiaryEnrollmentKeys.detail(id), context.previousEnrollment)
      }
      if (context?.previousEnrollments) {
        queryClient.setQueryData(beneficiaryEnrollmentKeys.lists(), context.previousEnrollments)
      }

      // Show error toast
      toast.error('Gagal memperbarui pendaftaran', {
        description: error.message,
      })
    },
  })
}

/**
 * Delete beneficiary enrollment
 * 
 * Features:
 * - Validation check (prevents deletion if distributions exist)
 * - Optimistic cache update
 * - Toast notifications
 * - Query invalidation
 * 
 * @returns Mutation object with mutate function
 * 
 * @example
 * ```typescript
 * const { mutate: deleteEnrollment, isPending } = useDeleteBeneficiaryEnrollment()
 * 
 * // With confirmation dialog
 * const handleDelete = (enrollment: BeneficiaryEnrollment) => {
 *   if (confirm(`Hapus pendaftaran ${enrollment.beneficiaryOrg.organizationName}?`)) {
 *     deleteEnrollment(enrollment.id)
 *   }
 * }
 * ```
 */
export function useDeleteBeneficiaryEnrollment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      // Get enrollment data before deletion for cache invalidation
      const enrollmentData = queryClient.getQueryData<BeneficiaryEnrollmentWithRelations>(
        beneficiaryEnrollmentKeys.detail(id)
      )

      const result = await beneficiaryEnrollmentsApi.delete(id)

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete beneficiary enrollment')
      }

      return { id, enrollmentData }
    },
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: beneficiaryEnrollmentKeys.lists() })

      // Snapshot previous value
      const previousEnrollments = queryClient.getQueryData<BeneficiaryEnrollmentWithRelations[]>(
        beneficiaryEnrollmentKeys.lists()
      )

      // Optimistically remove from cache
      if (previousEnrollments) {
        queryClient.setQueryData<BeneficiaryEnrollmentWithRelations[]>(
          beneficiaryEnrollmentKeys.lists(),
          previousEnrollments.filter((enrollment) => enrollment.id !== id)
        )
      }

      return { previousEnrollments }
    },
    onSuccess: (data) => {
      // Remove detail cache
      queryClient.removeQueries({ queryKey: beneficiaryEnrollmentKeys.detail(data.id) })

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: beneficiaryEnrollmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: beneficiaryEnrollmentKeys.stats() })
      
      // Invalidate program and organization specific queries if we have the data
      if (data.enrollmentData) {
        queryClient.invalidateQueries({ 
          queryKey: beneficiaryEnrollmentKeys.byProgram(data.enrollmentData.programId) 
        })
        queryClient.invalidateQueries({ 
          queryKey: beneficiaryEnrollmentKeys.byOrganization(data.enrollmentData.beneficiaryOrgId) 
        })
      }

      // Show success toast
      toast.success('Pendaftaran berhasil dihapus')
    },
    onError: (error: Error, _id, context) => {
      // Rollback on error
      if (context?.previousEnrollments) {
        queryClient.setQueryData(beneficiaryEnrollmentKeys.lists(), context.previousEnrollments)
      }

      // Show error toast
      toast.error('Gagal menghapus pendaftaran', {
        description: error.message,
      })
    },
  })
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Prefetch beneficiary enrollment for hover states
 * 
 * @returns Prefetch function
 * 
 * @example
 * ```typescript
 * const prefetchEnrollment = usePrefetchBeneficiaryEnrollment()
 * 
 * <Card
 *   onMouseEnter={() => prefetchEnrollment(enrollment.id)}
 *   onTouchStart={() => prefetchEnrollment(enrollment.id)}
 * >
 *   ...
 * </Card>
 * ```
 */
export function usePrefetchBeneficiaryEnrollment() {
  const queryClient = useQueryClient()

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: beneficiaryEnrollmentKeys.detail(id),
      queryFn: async () => {
        const result = await beneficiaryEnrollmentsApi.getById(id)
        if (!result.success || !result.data) {
          throw new Error(result.error || 'Failed to fetch beneficiary enrollment')
        }
        return result.data
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    })
  }
}

/**
 * Get enrollment count for a program (from cache)
 * 
 * @param programId - Program ID
 * @returns Enrollment count or undefined if not in cache
 * 
 * @example
 * ```typescript
 * const enrollmentCount = useEnrollmentCountForProgram('prog_123')
 * console.log(`${enrollmentCount} enrollments`)
 * ```
 */
export function useEnrollmentCountForProgram(programId: string): number | undefined {
  const queryClient = useQueryClient()
  
  const enrollments = queryClient.getQueryData<BeneficiaryEnrollmentWithRelations[]>(
    beneficiaryEnrollmentKeys.byProgram(programId)
  )
  
  return enrollments?.length
}

/**
 * Get active enrollment count for an organization (from cache)
 * 
 * @param organizationId - Organization ID
 * @returns Active enrollment count or undefined if not in cache
 * 
 * @example
 * ```typescript
 * const activeCount = useActiveEnrollmentCountForOrganization('org_123')
 * console.log(`${activeCount} active enrollments`)
 * ```
 */
export function useActiveEnrollmentCountForOrganization(organizationId: string): number | undefined {
  const queryClient = useQueryClient()
  
  const enrollments = queryClient.getQueryData<BeneficiaryEnrollmentWithRelations[]>(
    beneficiaryEnrollmentKeys.byOrganization(organizationId)
  )
  
  return enrollments?.filter(e => e.enrollmentStatus === 'ACTIVE').length
}
