/**
 * @fileoverview Departments Hook for User Management
 * @version Next.js 15.5.4 / TanStack Query
 * @author Bagizi-ID Development Team
 */

import { useQuery } from '@tanstack/react-query'
import { departmentApi } from '@/features/sppg/hrd/api'
import type { Department } from '@/features/sppg/hrd/types'

/**
 * Hook to fetch all active departments for dropdown
 */
export function useDepartmentsForUser() {
  return useQuery({
    queryKey: ['departments', 'active'],
    queryFn: async () => {
      const result = await departmentApi.getAll()
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch departments')
      }
      
      // Filter only active departments
      return result.data.filter((dept: Department) => dept.isActive)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
