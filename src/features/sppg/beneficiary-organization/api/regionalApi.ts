/**
 * @fileoverview Regional API Client for Cascade Selects
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * 
 * Purpose: Fetch regional data (Province → Regency → District → Village)
 * for cascade select components in forms
 */

import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import type { ApiResponse } from '@/lib/api-utils'

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface Province {
  id: string
  code: string
  name: string
  region: string
}

export interface Regency {
  id: string
  provinceId: string
  code: string
  name: string
  type: string
}

export interface District {
  id: string
  regencyId: string
  code: string
  name: string
}

export interface Village {
  id: string
  districtId: string
  code: string
  name: string
  type: string
  postalCode?: string
}

// ============================================
// API CLIENT
// ============================================

/**
 * Regional API client for cascade select components
 * All methods support SSR via optional headers parameter
 */
export const regionalApi = {
  /**
   * Get all provinces
   */
  async getProvinces(
    headers?: HeadersInit
  ): Promise<ApiResponse<Province[]>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/regional/provinces`,
      getFetchOptions(headers)
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch provinces')
    }

    return response.json()
  },

  /**
   * Get regencies by province ID
   */
  async getRegenciesByProvince(
    provinceId: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<Regency[]>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/regional/provinces/${provinceId}/regencies`,
      getFetchOptions(headers)
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch regencies')
    }

    return response.json()
  },

  /**
   * Get districts by regency ID
   */
  async getDistrictsByRegency(
    regencyId: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<District[]>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/regional/regencies/${regencyId}/districts`,
      getFetchOptions(headers)
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch districts')
    }

    return response.json()
  },

  /**
   * Get villages by district ID
   */
  async getVillagesByDistrict(
    districtId: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<Village[]>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/regional/districts/${districtId}/villages`,
      getFetchOptions(headers)
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch villages')
    }

    return response.json()
  },
}
