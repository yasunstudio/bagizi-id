/**
 * @fileoverview Reports Hooks - Data Fetching for Procurement Reports
 * @version Next.js 15.5.4 / TanStack Query v5
 * @author Bagizi-ID Development Team
 * 
 * Enterprise patterns:
 * - TanStack Query for server state
 * - Centralized API client pattern
 * - Optimistic updates and cache invalidation
 */

import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ReportFilters, ReportResponse } from '../types'

/**
 * Query hook to fetch report data
 * @param filters Report filters including type, date range, optional program/supplier
 * @returns TanStack Query result with report data
 */
export function useReports(filters: ReportFilters) {
  return useQuery({
    queryKey: ['procurement-reports', filters],
    queryFn: async (): Promise<ReportResponse> => {
      const params = new URLSearchParams()
      params.append('reportType', filters.reportType)
      params.append('startDate', filters.startDate)
      params.append('endDate', filters.endDate)
      
      if (filters.programId) {
        params.append('programId', filters.programId)
      }
      if (filters.supplierId) {
        params.append('supplierId', filters.supplierId)
      }
      if (filters.format) {
        params.append('format', filters.format)
      }

      const response = await fetch(`/api/sppg/procurement/reports?${params.toString()}`)
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch reports' }))
        throw new Error(error.error || 'Failed to fetch reports')
      }

      return response.json()
    },
    enabled: !!filters.startDate && !!filters.endDate,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Mutation hook to download report as CSV
 * @returns TanStack Mutation for CSV download
 */
export function useDownloadReportCSV() {
  return useMutation({
    mutationFn: async (filters: ReportFilters): Promise<void> => {
      const params = new URLSearchParams()
      params.append('reportType', filters.reportType)
      params.append('startDate', filters.startDate)
      params.append('endDate', filters.endDate)
      params.append('format', 'csv')
      
      if (filters.programId) {
        params.append('programId', filters.programId)
      }
      if (filters.supplierId) {
        params.append('supplierId', filters.supplierId)
      }

      const response = await fetch(`/api/sppg/procurement/reports?${params.toString()}`)
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to download CSV' }))
        throw new Error(error.error || 'Failed to download CSV')
      }

      // Get CSV data as text
      const csvText = await response.text()
      
      // Create blob and download
      const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `report-${filters.reportType}-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
    },
    onSuccess: () => {
      toast.success('Report berhasil didownload sebagai CSV')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal mendownload report')
    }
  })
}
