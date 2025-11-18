/**
 * @fileoverview Programs TanStack Query Hooks
 * @version TanStack Query v5 / Next.js 15.5.4
 * @description React hooks for fetching programs data with caching
 */

'use client'

import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { programsApi, type ProgramWithMenus } from '../api/programsApi'

// ================================ QUERY HOOKS ================================

/**
 * Hook to fetch all programs with menus
 * Used by ProductionForm to populate program and menu dropdowns
 * 
 * Features:
 * - Auto refetch on window focus
 * - 5 minute stale time
 * - Cached across components
 * 
 * @example
 * ```tsx
 * function ProductionPage() {
 *   const { data: programs, isLoading, error } = usePrograms()
 *   
 *   if (isLoading) return <LoadingSpinner />
 *   if (error) return <ErrorMessage error={error} />
 *   
 *   return <ProductionForm programs={programs} />
 * }
 * ```
 */
export function usePrograms(): UseQueryResult<ProgramWithMenus[], Error> {
  return useQuery({
    queryKey: ['programs'],
    queryFn: async () => {
      const response = await programsApi.getAll()
      return response.data || []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })
}

/**
 * Hook to fetch single program by ID
 * @param programId - Program ID to fetch
 * @param enabled - Enable/disable query (default: true when programId exists)
 * 
 * @example
 * ```tsx
 * function ProgramDetail({ id }: { id: string }) {
 *   const { data: program, isLoading } = useProgram(id)
 *   
 *   return <div>{program?.name}</div>
 * }
 * ```
 */
export function useProgram(
  programId: string,
  enabled = true
): UseQueryResult<ProgramWithMenus, Error> {
  return useQuery({
    queryKey: ['programs', programId],
    queryFn: async () => {
      const response = await programsApi.getById(programId)
      if (!response.data) throw new Error('Program not found')
      return response.data
    },
    enabled: enabled && !!programId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Hook to fetch programs with filters
 * @param filters - Filter options
 * 
 * @example
 * ```tsx
 * function FilteredPrograms() {
 *   const { data: programs } = useProgramsFiltered({
 *     status: 'ACTIVE',
 *     programType: 'FREE_NUTRITIOUS_MEAL'
 *   })
 *   
 *   return <ProgramsList programs={programs} />
 * }
 * ```
 */
export function useProgramsFiltered(filters?: {
  programType?: string
  targetGroup?: string
  status?: string
  search?: string
}): UseQueryResult<ProgramWithMenus[], Error> {
  return useQuery({
    queryKey: ['programs', 'filtered', filters],
    queryFn: async () => {
      const response = await programsApi.getFiltered(filters)
      return response.data || []
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!filters,
  })
}

// ================================ HELPER HOOKS ================================

/**
 * Hook to get active programs only
 * Convenience wrapper around usePrograms
 */
export function useActivePrograms(): UseQueryResult<ProgramWithMenus[], Error> {
  return useProgramsFiltered({ status: 'ACTIVE' })
}

/**
 * Hook to get programs count
 * Returns just the count without full data
 */
export function useProgramsCount(): UseQueryResult<number, Error> {
  return useQuery({
    queryKey: ['programs', 'count'],
    queryFn: async () => {
      const response = await programsApi.getAll()
      return response.data?.length || 0
    },
    staleTime: 5 * 60 * 1000,
  })
}
