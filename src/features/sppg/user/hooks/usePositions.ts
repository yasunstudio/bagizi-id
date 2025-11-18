/**
 * @fileoverview Positions Hook for User Management
 * @version Next.js 15.5.4 / TanStack Query
 * @author Bagizi-ID Development Team
 */

import { useQuery } from '@tanstack/react-query'
import { positionApi } from '@/features/sppg/hrd/api'
import type { Position } from '@/features/sppg/hrd/types'

/**
 * Hook to fetch all active positions for dropdown
 * Optionally filtered by department
 */
export function usePositionsForUser(departmentId?: string | null) {
  return useQuery({
    queryKey: ['positions', 'active', departmentId],
    queryFn: async () => {
      const result = await positionApi.getAll()
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch positions')
      }
      
      // Filter active positions, optionally by department
      let positions = result.data.filter((pos: Position) => pos.isActive)
      
      if (departmentId) {
        positions = positions.filter((pos: Position) => pos.departmentId === departmentId)
      }
      
      return positions
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true, // Always enabled, but filtered by departmentId if provided
  })
}
