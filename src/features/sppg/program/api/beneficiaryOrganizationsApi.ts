/**
 * @fileoverview API client untuk Beneficiary Organizations
 * @version Next.js 15.5.4 / Enterprise-Grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * CRITICAL: Menggunakan centralized API client pattern (Section 2a)
 * - Semua API calls melalui client ini (NEVER direct fetch)
 * - Support SSR dengan optional headers parameter
 * - Full TypeScript coverage dengan proper error handling
 */

import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import type { ApiResponse } from '@/lib/api-utils'
import type {
  BeneficiaryOrganization,
  BeneficiaryOrganizationWithRelations,
  BeneficiaryOrganizationStats,
  CreateBeneficiaryOrganizationInput,
  UpdateBeneficiaryOrganizationInput,
  BeneficiaryOrganizationFilters
} from '../types'

/**
 * Beneficiary Organizations API client dengan enterprise patterns
 * All methods support SSR via optional headers parameter
 * 
 * @example
 * ```typescript
 * // Client-side usage
 * const orgs = await beneficiaryOrganizationsApi.getAll()
 * 
 * // Server-side usage (SSR/RSC)
 * const orgs = await beneficiaryOrganizationsApi.getAll(undefined, headers())
 * 
 * // With filters
 * const schools = await beneficiaryOrganizationsApi.getAll({ 
 *   organizationType: 'SCHOOL',
 *   operationalStatus: 'ACTIVE'
 * })
 * ```
 */
export const beneficiaryOrganizationsApi = {
  /**
   * Fetch all beneficiary organizations dengan optional filtering
   * Auto-filtered by sppgId pada server (multi-tenant security)
   * 
   * @param filters - Optional filter parameters (type, subType, status, location, search)
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing organizations array
   * 
   * @example
   * ```typescript
   * // Fetch all schools in Jakarta
   * const result = await beneficiaryOrganizationsApi.getAll({ 
   *   type: 'SCHOOL',
   *   province: 'DKI Jakarta'
   * })
   * 
   * // Search by name or identifier
   * const result = await beneficiaryOrganizationsApi.getAll({ 
   *   search: 'SDN 01'
   * })
   * ```
   */
  async getAll(
    filters?: BeneficiaryOrganizationFilters,
    headers?: HeadersInit
  ): Promise<ApiResponse<BeneficiaryOrganization[]>> {
    const baseUrl = getBaseUrl()
    
    // Build query string if filters provided
    const params = new URLSearchParams()
    if (filters?.type) params.append('type', filters.type) // ✅ FIXED: was organizationType
    if (filters?.subType) params.append('subType', filters.subType) // ✅ FIXED: was organizationSubType
    if (filters?.operationalStatus) params.append('operationalStatus', filters.operationalStatus)
    if (filters?.province) params.append('province', filters.province)
    if (filters?.city) params.append('city', filters.city) // ✅ FIXED: was regency
    if (filters?.district) params.append('district', filters.district)
    if (filters?.search) params.append('search', filters.search)
    
    const queryString = params.toString()
    const url = queryString 
      ? `${baseUrl}/api/sppg/beneficiary-organizations?${queryString}`
      : `${baseUrl}/api/sppg/beneficiary-organizations`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch beneficiary organizations')
    }
    
    return response.json()
  },

  /**
   * Fetch single beneficiary organization by ID dengan relasi
   * 
   * @param id - Beneficiary Organization ID
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing organization detail
   * 
   * @example
   * ```typescript
   * const result = await beneficiaryOrganizationsApi.getById('org-123')
   * if (result.success && result.data) {
   *   console.log(result.data.organizationName)
   *   console.log(result.data._count?.enrollments) // Total enrollments
   * }
   * ```
   */
  async getById(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<BeneficiaryOrganizationWithRelations>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/beneficiary-organizations/${id}`,
      getFetchOptions(headers)
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch beneficiary organization')
    }
    
    return response.json()
  },

  /**
   * Create new beneficiary organization
   * 
   * @param data - Organization creation data
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing created organization
   * 
   * @example
   * ```typescript
   * const result = await beneficiaryOrganizationsApi.create({
   *   organizationName: 'SDN 01 Menteng',
   *   type: 'SCHOOL',
   *   subType: 'SD',
   *   npsn: '12345678',
   *   address: 'Jl. Menteng No. 1',
   *   district: 'Menteng',
   *   city: 'Jakarta Pusat',
   *   province: 'DKI Jakarta'
   * })
   * ```
   */
  async create(
    data: CreateBeneficiaryOrganizationInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<BeneficiaryOrganization>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/beneficiary-organizations`, {
      ...getFetchOptions(headers),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create beneficiary organization')
    }
    
    return response.json()
  },

  /**
   * Update existing beneficiary organization
   * 
   * @param id - Organization ID to update
   * @param data - Partial organization data to update
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing updated organization
   * 
   * @example
   * ```typescript
   * const result = await beneficiaryOrganizationsApi.update('org-123', {
   *   principalName: 'Budi Santoso, S.Pd',
   *   principalPhone: '08123456789',
   *   operationalStatus: 'ACTIVE'
   * })
   * ```
   */
  async update(
    id: string,
    data: UpdateBeneficiaryOrganizationInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<BeneficiaryOrganization>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/beneficiary-organizations/${id}`, {
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
      throw new Error(error.error || 'Failed to update beneficiary organization')
    }
    
    return response.json()
  },

  /**
   * Delete beneficiary organization
   * 
   * @param id - Organization ID to delete
   * @param headers - Optional headers for SSR
   * @returns Promise with API response
   * 
   * @example
   * ```typescript
   * await beneficiaryOrganizationsApi.delete('org-123')
   * ```
   */
  async delete(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<void>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/beneficiary-organizations/${id}`, {
      ...getFetchOptions(headers),
      method: 'DELETE',
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete beneficiary organization')
    }
    
    return response.json()
  },

  /**
   * Fetch statistics for beneficiary organizations
   * 
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing stats
   * 
   * @example
   * ```typescript
   * const result = await beneficiaryOrganizationsApi.getStats()
   * console.log(result.data?.totalOrganizations)
   * console.log(result.data?.byType.SCHOOL)
   * ```
   */
  async getStats(
    headers?: HeadersInit
  ): Promise<ApiResponse<BeneficiaryOrganizationStats>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/beneficiary-organizations/stats`,
      getFetchOptions(headers)
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch organization stats')
    }
    
    return response.json()
  },
}
