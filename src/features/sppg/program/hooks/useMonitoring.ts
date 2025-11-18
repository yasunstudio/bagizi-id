/**
 * @fileoverview React Query hooks untuk ProgramMonitoring domain
 * @version Next.js 15.5.4 / TanStack Query v5
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * CRITICAL: Menggunakan centralized API client (monitoringApi)
 * NEVER use direct fetch() calls
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { monitoringApi } from '../api'
import type {
  MonitoringResponse,
  MonitoringListResponse,
  CreateMonitoringInput,
  UpdateMonitoringInput,
  MonitoringFilter
} from '../types'
import { toast } from 'sonner'

// Type untuk API response yang actual (dengan pagination di top level)
interface MonitoringApiResponse {
  success: boolean
  data: MonitoringResponse[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  error?: string
}

/**
 * Query keys untuk cache management
 */
export const monitoringKeys = {
  all: ['monitoring'] as const,
  lists: () => [...monitoringKeys.all, 'list'] as const,
  list: (programId: string, filters?: MonitoringFilter) => 
    [...monitoringKeys.lists(), programId, { filters }] as const,
  details: () => [...monitoringKeys.all, 'detail'] as const,
  detail: (programId: string, monitoringId: string) => 
    [...monitoringKeys.details(), programId, monitoringId] as const,
}

/**
 * Fetch all monitoring reports untuk program dengan optional filtering
 * Auto-filtered by program.sppgId pada server (multi-tenant security)
 * 
 * @example
 * ```typescript
 * const { data, isLoading } = useMonitoringReports('program-123', {
 *   startDate: new Date('2024-01-01'),
 *   endDate: new Date('2024-12-31')
 * })
 * ```
 */
export function useMonitoringReports(
  programId: string,
  filters?: MonitoringFilter
) {
  return useQuery({
    queryKey: monitoringKeys.list(programId, filters),
    queryFn: async () => {
      console.log('🔍 [useMonitoringReports] Fetching data for:', { programId, filters })
      
      const result = await monitoringApi.getAll(programId, filters) as unknown as MonitoringApiResponse
      
      console.log('🔍 [useMonitoringReports] API Response:', {
        success: result.success,
        hasData: !!result.data,
        dataType: result.data ? typeof result.data : null,
        isArray: Array.isArray(result.data),
        arrayLength: Array.isArray(result.data) ? result.data.length : null,
        hasPagination: !!result.pagination,
        error: result.error
      })
      
      if (!result.success || !result.data) {
        console.error('❌ [useMonitoringReports] API Error:', result.error)
        throw new Error(result.error || 'Failed to fetch monitoring reports')
      }
      
      // CRITICAL: API returns { success, data: MonitoringResponse[], pagination }
      // We need to transform it to MonitoringListResponse: { data: [], pagination }
      const transformedData: MonitoringListResponse = {
        data: result.data,
        pagination: result.pagination || {
          page: 1,
          limit: filters?.limit || 10,
          total: result.data.length,
          totalPages: 1
        }
      }
      
      console.log('✅ [useMonitoringReports] Returning transformed data:', {
        hasData: !!transformedData.data,
        dataLength: Array.isArray(transformedData.data) ? transformedData.data.length : 0,
        hasPagination: !!transformedData.pagination
      })
      
      return transformedData
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!programId, // Only fetch if programId exists
  })
}

/**
 * Fetch single monitoring report by ID
 * 
 * @example
 * ```typescript
 * const { data: report } = useMonitoringReport('program-123', 'monitoring-456')
 * ```
 */
export function useMonitoringReport(
  programId: string,
  monitoringId: string
) {
  return useQuery({
    queryKey: monitoringKeys.detail(programId, monitoringId),
    queryFn: async () => {
      const result = await monitoringApi.getById(programId, monitoringId)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch monitoring report')
      }
      
      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!programId && !!monitoringId,
  })
}

/**
 * Create new monitoring report
 * Auto-invalidates monitoring list cache
 * 
 * @example
 * ```typescript
 * const { mutate: createReport, isPending } = useCreateMonitoringReport('program-123')
 * 
 * createReport({
 *   monitoringDate: new Date(),
 *   mealsPlanned: 1000,
 *   mealsServed: 980,
 *   // ... other fields
 * })
 * ```
 */
export function useCreateMonitoringReport(programId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: Omit<CreateMonitoringInput, 'programId' | 'reportedById'>) => {
      const result = await monitoringApi.create(programId, data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create monitoring report')
      }
      
      return result.data
    },
    onSuccess: (data) => {
      // Invalidate monitoring list untuk program ini
      queryClient.invalidateQueries({ 
        queryKey: monitoringKeys.lists() 
      })
      
      // Set cache untuk detail baru
      queryClient.setQueryData(
        monitoringKeys.detail(programId, data.id),
        data
      )
      
      toast.success('Laporan monitoring berhasil dibuat')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal membuat laporan monitoring')
    }
  })
}

/**
 * Update existing monitoring report
 * Implements optimistic updates untuk better UX
 * 
 * @example
 * ```typescript
 * const { mutate: updateReport } = useUpdateMonitoringReport('program-123', 'monitoring-456')
 * 
 * updateReport({
 *   mealsServed: 985,
 *   notes: 'Updated after verification'
 * })
 * ```
 */
export function useUpdateMonitoringReport(
  programId: string,
  monitoringId: string
) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: UpdateMonitoringInput) => {
      const result = await monitoringApi.update(programId, monitoringId, data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update monitoring report')
      }
      
      return result.data
    },
    // Optimistic update
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: monitoringKeys.detail(programId, monitoringId) 
      })
      
      // Snapshot previous value
      const previousReport = queryClient.getQueryData<MonitoringResponse>(
        monitoringKeys.detail(programId, monitoringId)
      )
      
      // Optimistically update cache
      if (previousReport) {
        queryClient.setQueryData(
          monitoringKeys.detail(programId, monitoringId),
          { ...previousReport, ...newData }
        )
      }
      
      return { previousReport }
    },
    onSuccess: (data) => {
      // Update with server response
      queryClient.setQueryData(
        monitoringKeys.detail(programId, monitoringId),
        data
      )
      
      // Invalidate list cache
      queryClient.invalidateQueries({ 
        queryKey: monitoringKeys.lists() 
      })
      
      toast.success('Laporan monitoring berhasil diperbarui')
    },
    onError: (error: Error, _newData, context) => {
      // Rollback on error
      if (context?.previousReport) {
        queryClient.setQueryData(
          monitoringKeys.detail(programId, monitoringId),
          context.previousReport
        )
      }
      
      toast.error(error.message || 'Gagal memperbarui laporan monitoring')
    }
  })
}

/**
 * Delete monitoring report
 * Auto-invalidates monitoring list cache
 * 
 * @example
 * ```typescript
 * const { mutate: deleteReport, isPending } = useDeleteMonitoringReport('program-123', 'monitoring-456')
 * 
 * deleteReport()
 * ```
 */
export function useDeleteMonitoringReport(
  programId: string,
  monitoringId: string
) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      const result = await monitoringApi.delete(programId, monitoringId)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete monitoring report')
      }
      
      return result
    },
    onSuccess: () => {
      // Remove dari cache
      queryClient.removeQueries({ 
        queryKey: monitoringKeys.detail(programId, monitoringId) 
      })
      
      // Invalidate list cache
      queryClient.invalidateQueries({ 
        queryKey: monitoringKeys.lists() 
      })
      
      toast.success('Laporan monitoring berhasil dihapus')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menghapus laporan monitoring')
    }
  })
}

/**
 * Helper hook untuk get latest monitoring report
 * 
 * @example
 * ```typescript
 * const { data: latestReport } = useLatestMonitoringReport('program-123')
 * ```
 */
export function useLatestMonitoringReport(programId: string) {
  return useMonitoringReports(programId, {
    limit: 1,
    page: 1,
  })
}
