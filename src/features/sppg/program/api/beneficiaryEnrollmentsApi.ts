/**
 * @fileoverview API client untuk Program Beneficiary Enrollments
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * Enterprise API client with SSR support and centralized error handling
 */

import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import type { ApiResponse } from '@/lib/api-utils'
import type {
  BeneficiaryEnrollmentWithRelations,
  BeneficiaryEnrollmentFilters,
  BeneficiaryEnrollmentStats,
  CreateBeneficiaryEnrollmentInput,
} from '@/features/sppg/program/types/beneficiaryEnrollment.types'

/**
 * Beneficiary Enrollments API client
 * All methods support SSR via optional headers parameter
 * 
 * @example
 * ```typescript
 * // Client-side usage
 * const enrollments = await beneficiaryEnrollmentsApi.getAll({ programId: 'prog_123' })
 * 
 * // Server-side usage (SSR/RSC)
 * const enrollments = await beneficiaryEnrollmentsApi.getAll({ programId: 'prog_123' }, headers())
 * ```
 */
export const beneficiaryEnrollmentsApi = {
  /**
   * Fetch all beneficiary enrollments with optional filtering
   * Auto-filtered by sppgId on server-side for multi-tenancy
   * 
   * @param filters - Optional filter parameters
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing enrollments array
   * 
   * @example
   * ```typescript
   * // Filter by program
   * const enrollments = await beneficiaryEnrollmentsApi.getAll({ 
   *   programId: 'prog_123' 
   * })
   * 
   * // Filter by target group
   * const schoolEnrollments = await beneficiaryEnrollmentsApi.getAll({ 
   *   targetGroup: 'SCHOOL_CHILDREN' 
   * })
   * 
   * // Filter by status
   * const activeEnrollments = await beneficiaryEnrollmentsApi.getAll({ 
   *   enrollmentStatus: 'ACTIVE',
   *   isActive: true
   * })
   * ```
   */
  async getAll(
    filters?: BeneficiaryEnrollmentFilters,
    headers?: HeadersInit
  ): Promise<ApiResponse<BeneficiaryEnrollmentWithRelations[]>> {
    const baseUrl = getBaseUrl()
    
    // Build query string
    const params = new URLSearchParams()
    if (filters?.programId) params.append('programId', filters.programId)
    if (filters?.beneficiaryOrgId) params.append('beneficiaryOrgId', filters.beneficiaryOrgId)
    if (filters?.targetGroup) params.append('targetGroup', filters.targetGroup)
    if (filters?.enrollmentStatus) params.append('enrollmentStatus', filters.enrollmentStatus)
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive))
    if (filters?.isPriority !== undefined) params.append('isPriority', String(filters.isPriority))
    if (filters?.search) params.append('search', filters.search)
    
    const queryString = params.toString()
    const url = queryString 
      ? `${baseUrl}/api/sppg/beneficiary-enrollments?${queryString}`
      : `${baseUrl}/api/sppg/beneficiary-enrollments`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch beneficiary enrollments')
    }
    
    return response.json()
  },

  /**
   * Fetch single beneficiary enrollment by ID
   * Includes relations: beneficiaryOrg, program, distributions
   * 
   * @param id - Enrollment ID
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing enrollment detail
   * 
   * @example
   * ```typescript
   * const enrollment = await beneficiaryEnrollmentsApi.getById('enroll_123')
   * console.log(enrollment.data?.beneficiaryOrg.name)
   * console.log(enrollment.data?.distributions?.length)
   * ```
   */
  async getById(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<BeneficiaryEnrollmentWithRelations>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/beneficiary-enrollments/${id}`,
      getFetchOptions(headers)
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch beneficiary enrollment')
    }
    
    return response.json()
  },

  /**
   * Create new beneficiary enrollment
   * Validates all required fields and business rules
   * 
   * @param data - Enrollment creation data
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing created enrollment
   * 
   * @example
   * ```typescript
   * const newEnrollment = await beneficiaryEnrollmentsApi.create({
   *   beneficiaryOrgId: 'org_123',
   *   programId: 'prog_456',
   *   targetGroup: 'SCHOOL_CHILDREN',
   *   startDate: new Date('2025-01-15'),
   *   targetBeneficiaries: 150,
   *   feedingDays: 5,
   *   mealsPerDay: 1,
   *   deliveryAddress: 'Jl. Merdeka No. 123, Jakarta',
   *   deliveryPhone: '021-12345678'
   * })
   * ```
   */
  async create(
    data: CreateBeneficiaryEnrollmentInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<BeneficiaryEnrollmentWithRelations>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/beneficiary-enrollments`, {
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
      throw new Error(error.error || 'Failed to create beneficiary enrollment')
    }
    
    return response.json()
  },

  /**
   * Update existing beneficiary enrollment
   * Supports partial updates - only provided fields are updated
   * 
   * @param id - Enrollment ID
   * @param data - Partial enrollment update data
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing updated enrollment
   * 
   * @example
   * ```typescript
   * // Update beneficiary count
   * await beneficiaryEnrollmentsApi.update('enroll_123', {
   *   activeBeneficiaries: 145
   * })
   * 
   * // Pause enrollment
   * await beneficiaryEnrollmentsApi.update('enroll_123', {
   *   enrollmentStatus: 'PAUSED',
   *   remarks: 'Temporary closure for renovation'
   * })
   * ```
   */
  async update(
    id: string,
    data: Partial<CreateBeneficiaryEnrollmentInput>,
    headers?: HeadersInit
  ): Promise<ApiResponse<BeneficiaryEnrollmentWithRelations>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/beneficiary-enrollments/${id}`, {
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
      throw new Error(error.error || 'Failed to update beneficiary enrollment')
    }
    
    return response.json()
  },

  /**
   * Delete beneficiary enrollment
   * Cascade deletes associated distributions if any
   * 
   * @param id - Enrollment ID
   * @param headers - Optional headers for SSR
   * @returns Promise with API response
   * 
   * @example
   * ```typescript
   * await beneficiaryEnrollmentsApi.delete('enroll_123')
   * ```
   */
  async delete(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<void>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/beneficiary-enrollments/${id}`, {
      ...getFetchOptions(headers),
      method: 'DELETE',
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete beneficiary enrollment')
    }
    
    return response.json()
  },

  /**
   * Get enrollment statistics
   * Aggregated data by status and target group
   * 
   * @param programId - Optional program ID to filter stats
   * @param headers - Optional headers for SSR
   * @returns Promise with API response containing statistics
   * 
   * @example
   * ```typescript
   * // All enrollments stats
   * const stats = await beneficiaryEnrollmentsApi.getStats()
   * 
   * // Program-specific stats
   * const programStats = await beneficiaryEnrollmentsApi.getStats('prog_123')
   * ```
   */
  async getStats(
    programId?: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<BeneficiaryEnrollmentStats>> {
    const baseUrl = getBaseUrl()
    const url = programId
      ? `${baseUrl}/api/sppg/beneficiary-enrollments/stats?programId=${programId}`
      : `${baseUrl}/api/sppg/beneficiary-enrollments/stats`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch enrollment statistics')
    }
    
    return response.json()
  },
}
