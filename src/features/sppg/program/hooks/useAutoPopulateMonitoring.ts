/**
 * @fileoverview React Query hook for auto-populating monitoring form data
 * Fetches aggregated data from multiple sources to auto-fill monitoring forms
 * @version Next.js 15.5.4 / TanStack Query v5
 * @author Bagizi-ID Development Team
 */

'use client'

import { useQuery } from '@tanstack/react-query'
import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import type { ApiResponse } from '@/lib/api-utils'

/**
 * Auto-populated monitoring data structure
 */
export interface AutoPopulatedMonitoringData {
  // Time period
  monitoringDate: string | Date
  reportingWeek: number
  dateRange: {
    start: string | Date
    end: string | Date
  }

  // Program info
  programId: string
  programName: string

  // Beneficiary metrics
  targetRecipients: number
  enrolledRecipients: number
  activeRecipients: number
  attendanceRate: number

  // Production & Distribution metrics
  totalMealsProduced: number
  totalMealsDistributed: number
  wastePercentage: number
  productionCount: number
  distributionCount: number

  // Budget metrics
  budgetAllocated: number
  budgetUtilized: number
  budgetUtilization: number

  // Meta
  autoPopulatedAt: string | Date
}

/**
 * Hook options for auto-populate monitoring
 */
interface UseAutoPopulateMonitoringOptions {
  enabled?: boolean
  headers?: HeadersInit
}

/**
 * React Query hook to fetch auto-populated monitoring data
 * 
 * Aggregates data from:
 * - Program (target beneficiaries, budget)
 * - Enrollments (enrolled/active students)
 * - Production (meals produced in last 7 days)
 * - Distribution (meals distributed in last 7 days)
 * - Procurement (budget utilized in last 7 days)
 * 
 * @param programId - Program ID to fetch data for
 * @param options - Query options (enabled, headers for SSR)
 * @returns React Query result with auto-populated data
 * 
 * @example
 * ```typescript
 * // Client-side usage
 * const { data, isLoading, error } = useAutoPopulateMonitoring(programId)
 * 
 * // Use data to auto-fill form
 * useEffect(() => {
 *   if (data) {
 *     form.setValue('targetRecipients', data.targetRecipients)
 *     form.setValue('enrolledRecipients', data.enrolledRecipients)
 *     toast.success('Data otomatis terisi!')
 *   }
 * }, [data, form])
 * 
 * // Server-side usage (SSR/RSC)
 * const { data } = useAutoPopulateMonitoring(programId, { headers: headers() })
 * ```
 */
export function useAutoPopulateMonitoring(
  programId: string,
  options: UseAutoPopulateMonitoringOptions = {}
) {
  const { enabled = true, headers } = options

  return useQuery({
    queryKey: ['monitoring', 'auto-populate', programId],
    queryFn: async (): Promise<AutoPopulatedMonitoringData> => {
      const baseUrl = getBaseUrl()
      const url = `${baseUrl}/api/sppg/monitoring/auto-populate?programId=${programId}`

      const response = await fetch(url, getFetchOptions(headers))

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to auto-populate monitoring data')
      }

      const result: ApiResponse<AutoPopulatedMonitoringData> = await response.json()

      if (!result.success || !result.data) {
        throw new Error(result.error || 'No data returned from server')
      }

      return result.data
    },
    enabled: enabled && !!programId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus (data is time-specific)
    retry: 2, // Retry failed requests twice
  })
}

/**
 * Hook to manually trigger auto-populate (for refresh button)
 * 
 * @example
 * ```typescript
 * const { data, refetch, isRefetching } = useAutoPopulateMonitoring(programId)
 * 
 * <Button onClick={() => refetch()} disabled={isRefetching}>
 *   {isRefetching ? 'Memuat...' : 'Muat Ulang Data'}
 * </Button>
 * ```
 */
export type RefetchAutoPopulate = ReturnType<typeof useAutoPopulateMonitoring>['refetch']
