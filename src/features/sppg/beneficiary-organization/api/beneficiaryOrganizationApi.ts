/**
 * @fileoverview API Client untuk Beneficiary Organizations
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import type { ApiResponse } from '@/lib/api-utils'
import type {
  BeneficiaryOrganizationInput,
  BeneficiaryOrganizationFilter,
} from '../schemas/beneficiaryOrganizationSchema'

/**
 * Type untuk response organization dengan statistik
 * ✅ SESUAI 100% dengan Prisma Schema
 */
export interface BeneficiaryOrganizationResponse {
  id: string
  sppgId: string
  
  // Organization Identity
  organizationName: string
  organizationCode: string
  type: string
  subType: string | null
  
  // Location - Using proper foreign keys with nested relations
  address: string
  provinceId: string
  regencyId: string
  districtId: string | null
  villageId: string | null
  postalCode: string | null
  latitude: number | null
  longitude: number | null
  
  // Location relations (populated by API)
  province?: {
    id: string
    code: string
    name: string
  }
  regency?: {
    id: string
    code: string
    name: string
    type: string
  }
  district?: {
    id: string
    code: string
    name: string
  } | null
  village?: {
    id: string
    code: string
    name: string
    type: string
  } | null
  
  // Contact Information
  phone: string | null
  email: string | null
  contactPerson: string | null
  contactTitle: string | null
  
  // Type-Specific Identifiers
  npsn: string | null
  nikkes: string | null
  registrationNumber: string | null
  
  // Principal/Head Information
  principalName: string | null
  principalNip: string | null
  
  // Ownership Status
  ownershipStatus: string | null
  
  // Staff/Personnel Counts (applies to all organization types)
  teachingStaffCount: number | null    // Jumlah Guru/Tenaga Pengajar/Kader
  nonTeachingStaffCount: number | null // Jumlah Tendik/Tenaga Non-Pengajar
  establishedYear: number | null       // Year organization was established
  
  // Operational Status
  operationalStatus: string
  isActive: boolean
  
  // Additional Information
  notes: string | null
  
  // Timestamps
  createdAt: string
  updatedAt: string
  
  // Statistics (dari API)
  totalEnrollments?: number
  totalDistributions?: number
}

/**
 * Type untuk detail organization dengan relasi
 */
export interface BeneficiaryOrganizationDetail extends BeneficiaryOrganizationResponse {
  enrollments: Array<{
    id: string
    enrollmentDate: string
    enrollmentStatus: string
    targetBeneficiaries: number
    activeBeneficiaries: number
    targetGroup: string
    program: {
      id: string
      name: string
      programCode: string
    }
  }>
  distributions: Array<{
    id: string
    distributionDate: string
    distributionCode: string
    mealType: string
    plannedRecipients: number
    actualRecipients: number | null
    totalPortions: number
    status: string
  }>
  _count?: {
    enrollments: number
    distributions: number
  }
  stats?: {
    totalEnrollments: number
    activeEnrollments: number
    totalDistributions: number
    totalBeneficiariesServed: number
  }
}

/**
 * Beneficiary Organizations API client dengan enterprise patterns
 * Semua metode mendukung SSR via optional headers parameter
 */
export const beneficiaryOrganizationApi = {
  /**
   * Ambil semua beneficiary organizations dengan filter
   * @param filters - Filter opsional
   * @param headers - Headers untuk SSR
   */
  async getAll(
    filters?: BeneficiaryOrganizationFilter,
    headers?: HeadersInit
  ): Promise<ApiResponse<BeneficiaryOrganizationResponse[]>> {
    const baseUrl = getBaseUrl()
    
    // Build query string
    const params = new URLSearchParams()
    if (filters?.type) params.append('type', filters.type)
    if (filters?.search) params.append('search', filters.search)
    if (filters?.district) params.append('district', filters.district)
    if (filters?.city) params.append('city', filters.city)
    if (filters?.province) params.append('province', filters.province)
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive))
    
    const queryString = params.toString()
    const url = queryString
      ? `${baseUrl}/api/sppg/beneficiary-organizations?${queryString}`
      : `${baseUrl}/api/sppg/beneficiary-organizations`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Gagal mengambil data organisasi penerima manfaat')
    }
    
    return response.json()
  },

  /**
   * Ambil detail beneficiary organization by ID
   * @param id - Organization ID
   * @param headers - Headers untuk SSR
   */
  async getById(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<BeneficiaryOrganizationDetail>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/beneficiary-organizations/${id}`,
      getFetchOptions(headers)
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Gagal mengambil detail organisasi penerima manfaat')
    }
    
    return response.json()
  },

  /**
   * Buat beneficiary organization baru
   * @param data - Data organization
   * @param headers - Headers untuk SSR
   */
  async create(
    data: BeneficiaryOrganizationInput,
    headers?: HeadersInit
  ): Promise<ApiResponse<BeneficiaryOrganizationResponse>> {
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
      throw new Error(error.error || 'Gagal membuat organisasi penerima manfaat')
    }
    
    return response.json()
  },

  /**
   * Update beneficiary organization
   * @param id - Organization ID
   * @param data - Data yang akan diupdate
   * @param headers - Headers untuk SSR
   */
  async update(
    id: string,
    data: Partial<BeneficiaryOrganizationInput>,
    headers?: HeadersInit
  ): Promise<ApiResponse<BeneficiaryOrganizationResponse>> {
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
      throw new Error(error.error || 'Gagal mengubah organisasi penerima manfaat')
    }
    
    return response.json()
  },

  /**
   * Hapus beneficiary organization (soft delete)
   * @param id - Organization ID
   * @param headers - Headers untuk SSR
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
      throw new Error(error.error || 'Gagal menghapus organisasi penerima manfaat')
    }
    
    return response.json()
  },
}
