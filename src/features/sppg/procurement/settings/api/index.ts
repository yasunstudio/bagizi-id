/**
 * @fileoverview Procurement Settings API Client
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * API CLIENT PATTERN:
 * - Centralized API calls
 * - SSR support with optional headers
 * - Type-safe requests and responses
 * - Proper error handling
 */

import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import type {
  ApiResponse,
  ProcurementSettingsDetail,
  UpdateSettingsRequest,
} from '../types'

/**
 * Procurement Settings API client
 * All methods support SSR via optional headers parameter
 * 
 * @example
 * ```typescript
 * // Client-side usage
 * const result = await settingsApi.get()
 * 
 * // Server-side usage (SSR/RSC)
 * const result = await settingsApi.get(headers())
 * ```
 */
export const settingsApi = {
  /**
   * Fetch procurement settings
   * Returns settings with all relations (approval levels, categories, etc.)
   * 
   * @param headers - Optional headers for SSR
   * @returns Promise with settings data
   */
  async get(
    headers?: HeadersInit
  ): Promise<ApiResponse<ProcurementSettingsDetail | null>> {
    const baseUrl = getBaseUrl()
    console.log('[settingsApi.get] Fetching from:', `${baseUrl}/api/sppg/procurement/settings`)
    
    const response = await fetch(`${baseUrl}/api/sppg/procurement/settings`, {
      ...getFetchOptions(headers),
      method: 'GET',
    })
    
    console.log('[settingsApi.get] Response status:', response.status, response.statusText)
    
    if (!response.ok) {
      const error = await response.json()
      console.error('[settingsApi.get] Error response:', error)
      throw new Error(error.error || 'Failed to fetch procurement settings')
    }
    
    const result = await response.json()
    console.log('[settingsApi.get] Success! Data:', {
      hasData: !!result.data,
      dataKeys: result.data ? Object.keys(result.data) : [],
      approvalLevelsCount: result.data?.approvalLevels?.length || 0,
    })
    
    return result
  },

  /**
   * Update procurement settings
   * Can update general settings and/or specific sections
   * 
   * @param data - Settings update data
   * @param headers - Optional headers for SSR
   * @returns Promise with updated settings
   * 
   * @example
   * ```typescript
   * await settingsApi.update({
   *   general: {
   *     autoApproveThreshold: 10000000,
   *     requireQCPhotos: true
   *   },
   *   approvalLevels: [
   *     { level: 1, levelName: 'Manager', minAmount: 0, maxAmount: 50000000, requiredRole: 'SPPG_ADMIN' }
   *   ]
   * })
   * ```
   */
  async update(
    data: UpdateSettingsRequest,
    headers?: HeadersInit
  ): Promise<ApiResponse<ProcurementSettingsDetail>> {
    const baseUrl = getBaseUrl()
    
    const response = await fetch(`${baseUrl}/api/sppg/procurement/settings`, {
      ...getFetchOptions(headers),
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update procurement settings')
    }
    
    return response.json()
  },

  /**
   * Initialize default settings for a new SPPG
   * Creates settings with default approval levels, categories, payment terms, etc.
   * 
   * @param headers - Optional headers for SSR
   * @returns Promise with created settings
   */
  async initialize(
    headers?: HeadersInit
  ): Promise<ApiResponse<ProcurementSettingsDetail>> {
    const baseUrl = getBaseUrl()
    
    const response = await fetch(`${baseUrl}/api/sppg/procurement/settings/initialize`, {
      ...getFetchOptions(headers),
      method: 'POST',
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to initialize procurement settings')
    }
    
    return response.json()
  },

  /**
   * Reset settings to default values
   * WARNING: This will delete all custom configurations and recreate with defaults
   * Requires SPPG_KEPALA role
   * 
   * @param headers - Optional headers for SSR
   * @returns Promise with reset settings
   */
  async reset(
    headers?: HeadersInit
  ): Promise<ApiResponse<ProcurementSettingsDetail>> {
    const baseUrl = getBaseUrl()
    
    const response = await fetch(`${baseUrl}/api/sppg/procurement/settings/reset`, {
      ...getFetchOptions(headers),
      method: 'POST',
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to reset procurement settings')
    }
    
    return response.json()
  },
}
