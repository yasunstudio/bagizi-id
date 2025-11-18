/**
 * @fileoverview Program Enrollments React Query Hooks
 * @version Next.js 15.5.4 / TanStack Query v5
 * @author Bagizi-ID Development Team
 * @see {@link /docs/PROGRAM_ENROLLMENTS_IMPLEMENTATION.md} Implementation Guide
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { enrollmentApi } from '@/features/sppg/program/api/enrollmentApi'
import type { EnrollmentInput } from '@/features/sppg/program/schemas/enrollmentSchema'
import type {
  EnrollmentWithRelations,
  EnrollmentFilters,
} from '@/features/sppg/program/types/enrollment.types'
import { toast } from 'sonner'

/**
 * Query key factory for enrollment queries
 * Provides centralized query key management
 */
export const enrollmentKeys = {
  all: ['enrollments'] as const,
  lists: () => [...enrollmentKeys.all, 'list'] as const,
  list: (programId: string, filters?: EnrollmentFilters) =>
    [...enrollmentKeys.lists(), programId, filters] as const,
  details: () => [...enrollmentKeys.all, 'detail'] as const,
  detail: (programId: string, enrollmentId: string) =>
    [...enrollmentKeys.details(), programId, enrollmentId] as const,
}

/**
 * Hook to fetch all enrollments for a program
 * 
 * @param programId - Program ID to fetch enrollments for
 * @param filters - Optional filters for enrollments
 * @returns Query result with enrollment list
 * 
 * @example
 * ```tsx
 * const { data: enrollments, isLoading } = useProgramEnrollments(programId, {
 *   status: 'ACTIVE',
 *   schoolType: 'SD'
 * })
 * ```
 */
export function useProgramEnrollments(
  programId: string,
  filters?: EnrollmentFilters
) {
  return useQuery({
    queryKey: enrollmentKeys.list(programId, filters),
    queryFn: async () => {
      console.log('🔍 [useProgramEnrollments] Fetching data for:', { programId, filters })
      
      const result = await enrollmentApi.getAll(programId, filters)
      
      console.log('🔍 [useProgramEnrollments] API Response:', {
        success: result.success,
        hasData: !!result.data,
        dataType: result.data ? typeof result.data : null,
        isArray: Array.isArray(result.data),
        arrayLength: Array.isArray(result.data) ? result.data.length : null,
        error: result.error
      })
      
      if (!result.success || !result.data) {
        console.error('❌ [useProgramEnrollments] API Error:', result.error)
        throw new Error(result.error || 'Failed to fetch enrollments')
      }
      
      console.log('✅ [useProgramEnrollments] Returning data:', result.data)
      return result.data
    },
    enabled: !!programId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch single enrollment by ID
 * 
 * @param programId - Program ID
 * @param enrollmentId - Enrollment ID to fetch
 * @returns Query result with enrollment details
 * 
 * @example
 * ```tsx
 * const { data: enrollment, isLoading } = useEnrollment(programId, enrollmentId)
 * ```
 */
export function useEnrollment(programId: string, enrollmentId: string) {
  return useQuery({
    queryKey: enrollmentKeys.detail(programId, enrollmentId),
    queryFn: async () => {
      const result = await enrollmentApi.getOne(programId, enrollmentId)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch enrollment')
      }
      
      return result.data
    },
    enabled: !!programId && !!enrollmentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to create new enrollment
 * 
 * @returns Mutation object with create function
 * 
 * @example
 * ```tsx
 * const { mutate: createEnrollment, isPending } = useCreateEnrollment(programId)
 * 
 * createEnrollment(enrollmentData, {
 *   onSuccess: () => {
 *     router.push(`/program/${programId}?tab=enrollments`)
 *   }
 * })
 * ```
 */
export function useCreateEnrollment(programId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: EnrollmentInput) => {
      const result = await enrollmentApi.create(programId, data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create enrollment')
      }
      
      // API returns EnrollmentResponse but we cast to EnrollmentWithRelations
      // This is safe because the API endpoint includes related data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return result.data as any as EnrollmentWithRelations
    },
    onSuccess: (newEnrollment) => {
      // Invalidate and refetch enrollments list
      queryClient.invalidateQueries({
        queryKey: enrollmentKeys.lists(),
      })
      
      // Optimistically update cache with new enrollment
      queryClient.setQueryData<EnrollmentWithRelations[]>(
        enrollmentKeys.list(programId),
        (old) => {
          if (!old) return [newEnrollment]
          return [...old, newEnrollment]
        }
      )
      
      toast.success('Enrollment created successfully', {
        description: `School enrolled in program`,
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to create enrollment', {
        description: error.message,
      })
    },
  })
}

/**
 * Hook to update existing enrollment
 * 
 * @returns Mutation object with update function
 * 
 * @example
 * ```tsx
 * const { mutate: updateEnrollment, isPending } = useUpdateEnrollment(programId)
 * 
 * updateEnrollment({
 *   enrollmentId: 'abc123',
 *   data: { activeStudents: 150 }
 * })
 * ```
 */
export function useUpdateEnrollment(programId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({
      enrollmentId,
      data,
    }: {
      enrollmentId: string
      data: Partial<EnrollmentInput>
    }) => {
      const result = await enrollmentApi.update(programId, enrollmentId, data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update enrollment')
      }
      
      // API returns EnrollmentResponse but we cast to EnrollmentWithRelations
      // This is safe because the API endpoint includes related data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return result.data as any as EnrollmentWithRelations
    },
    onMutate: async ({ enrollmentId, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: enrollmentKeys.detail(programId, enrollmentId),
      })
      
      // Snapshot previous value
      const previousEnrollment = queryClient.getQueryData<EnrollmentWithRelations>(
        enrollmentKeys.detail(programId, enrollmentId)
      )
      
      // Optimistically update cache
      if (previousEnrollment) {
        queryClient.setQueryData<EnrollmentWithRelations>(
          enrollmentKeys.detail(programId, enrollmentId),
          {
            ...previousEnrollment,
            ...data,
          }
        )
      }
      
      return { previousEnrollment }
    },
    onSuccess: (updatedEnrollment, { enrollmentId }) => {
      // Update specific enrollment in cache
      queryClient.setQueryData(
        enrollmentKeys.detail(programId, enrollmentId),
        updatedEnrollment
      )
      
      // Update enrollment in list cache
      queryClient.setQueryData<EnrollmentWithRelations[]>(
        enrollmentKeys.list(programId),
        (old) => {
          if (!old) return [updatedEnrollment]
          return old.map((enrollment) =>
            enrollment.id === enrollmentId ? updatedEnrollment : enrollment
          )
        }
      )
      
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: enrollmentKeys.lists(),
      })
      
      toast.success('Enrollment updated successfully')
    },
    onError: (error: Error, _variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousEnrollment) {
        queryClient.setQueryData(
          enrollmentKeys.detail(programId, context.previousEnrollment.id),
          context.previousEnrollment
        )
      }
      
      toast.error('Failed to update enrollment', {
        description: error.message,
      })
    },
    onSettled: (_data, _error, { enrollmentId }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: enrollmentKeys.detail(programId, enrollmentId),
      })
    },
  })
}

/**
 * Hook to delete enrollment
 * 
 * @returns Mutation object with delete function
 * 
 * @example
 * ```tsx
 * const { mutate: deleteEnrollment, isPending } = useDeleteEnrollment(programId)
 * 
 * deleteEnrollment(enrollmentId, {
 *   onSuccess: () => {
 *     router.push(`/program/${programId}?tab=enrollments`)
 *   }
 * })
 * ```
 */
export function useDeleteEnrollment(programId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (enrollmentId: string) => {
      const result = await enrollmentApi.delete(programId, enrollmentId)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete enrollment')
      }
      
      return enrollmentId
    },
    onMutate: async (enrollmentId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: enrollmentKeys.lists(),
      })
      
      // Snapshot previous value
      const previousEnrollments = queryClient.getQueryData<EnrollmentWithRelations[]>(
        enrollmentKeys.list(programId)
      )
      
      // Optimistically remove from cache
      queryClient.setQueryData<EnrollmentWithRelations[]>(
        enrollmentKeys.list(programId),
        (old) => {
          if (!old) return []
          return old.filter((enrollment) => enrollment.id !== enrollmentId)
        }
      )
      
      return { previousEnrollments }
    },
    onSuccess: (deletedId) => {
      // Remove enrollment from all list caches
      queryClient.setQueryData<EnrollmentWithRelations[]>(
        enrollmentKeys.list(programId),
        (old) => {
          if (!old) return []
          return old.filter((enrollment) => enrollment.id !== deletedId)
        }
      )
      
      // Remove detail cache
      queryClient.removeQueries({
        queryKey: enrollmentKeys.detail(programId, deletedId),
      })
      
      // Invalidate lists
      queryClient.invalidateQueries({
        queryKey: enrollmentKeys.lists(),
      })
      
      toast.success('Enrollment deleted successfully')
    },
    onError: (error: Error, _enrollmentId, context) => {
      // Rollback optimistic update on error
      if (context?.previousEnrollments) {
        queryClient.setQueryData(
          enrollmentKeys.list(programId),
          context.previousEnrollments
        )
      }
      
      toast.error('Failed to delete enrollment', {
        description: error.message,
      })
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: enrollmentKeys.lists(),
      })
    },
  })
}

/**
 * Hook to get enrollment statistics
 * Derives stats from enrollment list data
 * 
 * @param programId - Program ID
 * @returns Computed statistics from enrollments
 * 
 * @example
 * ```tsx
 * const stats = useEnrollmentStats(programId)
 * // {
 * //   totalSchools: 15,
 * //   totalStudents: 3500,
 * //   activeEnrollments: 12,
 * //   totalBudget: 52500000
 * // }
 * ```
 */
export function useEnrollmentStats(programId: string) {
  const { data: enrollments } = useProgramEnrollments(programId)
  
  if (!enrollments) {
    return {
      totalSchools: 0,
      totalStudents: 0,
      activeEnrollments: 0,
      totalBudget: 0,
      averageBudgetPerStudent: 0,
    }
  }
  
  const totalSchools = enrollments.length
  const totalStudents = enrollments.reduce(
    (sum, e) => sum + (e.activeStudents || 0),
    0
  )
  const activeEnrollments = enrollments.filter(
    (e) => e.status === 'ACTIVE'
  ).length
  const totalBudget = enrollments.reduce(
    (sum, e) => sum + (e.monthlyBudgetAllocation || 0),
    0
  )
  const averageBudgetPerStudent = totalStudents > 0 ? totalBudget / totalStudents : 0
  
  return {
    totalSchools,
    totalStudents,
    activeEnrollments,
    totalBudget,
    averageBudgetPerStudent,
  }
}
