/**
 * @fileoverview Regional Data Hooks - TanStack Query
 * @version Next.js 15.5.4 / TanStack Query v5
 * @author Bagizi-ID Development Team
 * 
 * Purpose: React Query hooks for cascade select regional data
 */

'use client'

import { useQuery } from '@tanstack/react-query'
import { regionalApi } from '../api/regionalApi'

/**
 * Hook to fetch all provinces
 */
export function useProvinces() {
  return useQuery({
    queryKey: ['regional', 'provinces'],
    queryFn: async () => {
      const result = await regionalApi.getProvinces()
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch provinces')
      }
      return result.data
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours (regional data rarely changes)
  })
}

/**
 * Hook to fetch regencies by province
 */
export function useRegenciesByProvince(provinceId: string | null) {
  return useQuery({
    queryKey: ['regional', 'regencies', provinceId],
    queryFn: async () => {
      if (!provinceId) return []
      
      const result = await regionalApi.getRegenciesByProvince(provinceId)
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch regencies')
      }
      return result.data
    },
    enabled: !!provinceId, // Only fetch when provinceId is set
    staleTime: 24 * 60 * 60 * 1000,
  })
}

/**
 * Hook to fetch districts by regency
 */
export function useDistrictsByRegency(regencyId: string | null) {
  return useQuery({
    queryKey: ['regional', 'districts', regencyId],
    queryFn: async () => {
      if (!regencyId) return []
      
      const result = await regionalApi.getDistrictsByRegency(regencyId)
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch districts')
      }
      return result.data
    },
    enabled: !!regencyId,
    staleTime: 24 * 60 * 60 * 1000,
  })
}

/**
 * Hook to fetch villages by district
 */
export function useVillagesByDistrict(districtId: string | null) {
  return useQuery({
    queryKey: ['regional', 'villages', districtId],
    queryFn: async () => {
      if (!districtId) return []
      
      const result = await regionalApi.getVillagesByDistrict(districtId)
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch villages')
      }
      return result.data
    },
    enabled: !!districtId,
    staleTime: 24 * 60 * 60 * 1000,
  })
}
