/**
 * @fileoverview TypeScript types untuk Beneficiary Organization
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import type { 
  BeneficiaryOrganization,
  BeneficiaryOrganizationType,
  BeneficiaryOrganizationSubType
} from '@prisma/client'

/**
 * Beneficiary Organization dari Prisma (base type)
 */
export type { BeneficiaryOrganization }

/**
 * Beneficiary Organization dengan relasi untuk detail view
 */
export interface BeneficiaryOrganizationWithRelations extends BeneficiaryOrganization {
  // Regional relations
  province?: {
    id: string
    name: string
  }
  regency?: {
    id: string
    name: string
  }
  district?: {
    id: string
    name: string
  } | null
  village?: {
    id: string
    name: string
  } | null
  // Program relations
  enrollments?: Array<{
    id: string
    enrollmentDate: Date
    targetGroup: string
    enrollmentStatus: string
    targetBeneficiaries: number
    activeBeneficiaries: number | null
  }>
  distributions?: Array<{
    id: string
    distributionDate: Date
    plannedRecipients: number // ✅ FIXED: Correct Prisma field name
    actualRecipients: number | null // ✅ FIXED: Correct Prisma field name
    totalPortions: number
  }>
  _count?: {
    enrollments: number
    distributions: number
  }
}

/**
 * Stats untuk Beneficiary Organization
 */
export interface BeneficiaryOrganizationStats {
  totalOrganizations: number
  activeOrganizations: number
  inactiveOrganizations: number
  suspendedOrganizations: number
  byType: Record<BeneficiaryOrganizationType, number>
  byProvince: Record<string, number>
}

/**
 * Input untuk create Beneficiary Organization
 * (from Zod schema - synchronized with Prisma model)
 * 
 * ✅ UPDATED: Using foreign key IDs instead of direct string fields
 * ✅ UPDATED: Removed non-existent fields (facilities, serving capacity)
 * ✅ UPDATED: Added membership fields (maleMembers, femaleMembers, posyanduCadres)
 * 
 * NOTE: organizationCode will be auto-generated on server
 */
export interface CreateBeneficiaryOrganizationInput {
  // Basic Information
  organizationName: string
  type: BeneficiaryOrganizationType
  subType?: BeneficiaryOrganizationSubType
  
  // Registration Numbers (type-specific)
  npsn?: string // SCHOOL only
  nikkes?: string // HEALTH_FACILITY only
  
  // Leadership
  principalName?: string
  principalNip?: string
  
  // Contact Information
  contactPerson?: string
  contactTitle?: string
  phone?: string
  email?: string
  
  // Location - Foreign Keys (✅ UPDATED: Using IDs instead of strings)
  address: string
  provinceId: string // ✅ CORRECT: FK to Province
  regencyId: string // ✅ CORRECT: FK to Regency
  districtId?: string | null // ✅ CORRECT: FK to District (optional)
  villageId?: string | null // ✅ CORRECT: FK to Village (optional)
  postalCode?: string
  latitude?: number
  longitude?: number
  
  // Operational Status
  operationalStatus?: string
  isActive?: boolean
  
  // Capacity
  totalCapacity?: number
  
  // Membership (✅ ADDED: Fields that exist in Prisma)
  maleMembers?: number
  femaleMembers?: number
  posyanduCadres?: number
  
  // Ownership
  ownershipStatus?: string
  
  // Schedule
  serviceHours?: string
  operatingDays?: string
  
  // Accreditation
  accreditationGrade?: string
  accreditationYear?: number
  
  // Other
  establishedYear?: number
  description?: string
  notes?: string
  
  // ❌ REMOVED: Non-existent fields
  // - servingCapacity, averageServings (not in Prisma)
  // - buildingArea (not in Prisma)
  // - hasElectricity, hasCleanWater, hasKitchen, hasStorageRoom, storageCapacity (facilities - not in Prisma)
}

/**
 * Input untuk update Beneficiary Organization
 */
export type UpdateBeneficiaryOrganizationInput = Partial<CreateBeneficiaryOrganizationInput>

/**
 * Filters untuk query Beneficiary Organizations
 * 
 * ✅ UPDATED: Using isActive instead of regional filters
 * (Regional filtering should use backend API with proper relations)
 */
export interface BeneficiaryOrganizationFilters {
  type?: BeneficiaryOrganizationType
  subType?: BeneficiaryOrganizationSubType
  operationalStatus?: string
  isActive?: boolean // ✅ UPDATED: Status filter
  search?: string
}

