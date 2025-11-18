/**
 * @fileoverview Zod validation schemas untuk Beneficiary Organization
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * Schemas untuk validasi data Beneficiary Organization dengan support
 * untuk 3 tipe organisasi MBG: SCHOOL, HEALTH_FACILITY, INTEGRATED_SERVICE_POST
 * 
 * ✅ UPDATED: Menggunakan provinceId, regencyId, districtId, villageId (foreign keys)
 */

import { z } from 'zod'
import { 
  BeneficiaryOrganizationType, 
  BeneficiaryOrganizationSubType
} from '@prisma/client'

/**
 * Schema untuk membuat Beneficiary Organization baru
 * Fields yang required vs optional disesuaikan dengan tipe organisasi
 * 
 * NOTE: organizationCode will be auto-generated on server (not included in input)
 */
export const createBeneficiaryOrganizationSchema = z.object({
  // Basic Information (Required for all types)
  organizationName: z.string().min(3, 'Nama organisasi minimal 3 karakter'),
  type: z.nativeEnum(BeneficiaryOrganizationType),
  subType: z.nativeEnum(BeneficiaryOrganizationSubType).optional(),
  
  // Identifiers (Conditional based on type)
  npsn: z.string().min(8).max(8).optional(), // Required for SCHOOL
  nikkes: z.string().optional(), // Required for HEALTH_FACILITY
  registrationNumber: z.string().optional(), // Required for INTEGRATED_SERVICE_POST
  
  // Contact Information
  principalName: z.string().optional(), // School: Kepala Sekolah, Other: Kepala/Pengelola
  principalNip: z.string().optional(),
  contactPerson: z.string().optional(),
  contactTitle: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email tidak valid').optional(),
  
  // Location - Using foreign keys (hierarchical order: Province → Regency → District → Village)
  provinceId: z.string().cuid('ID Provinsi tidak valid'),
  regencyId: z.string().cuid('ID Kabupaten/Kota tidak valid'),
  districtId: z.string().cuid('ID Kecamatan tidak valid').optional().nullable(),
  villageId: z.string().cuid('ID Kelurahan/Desa tidak valid').optional().nullable(),
  
  // Address Information (Required)
  address: z.string().min(5, 'Alamat minimal 5 karakter'),
  postalCode: z.string().optional(),
  
  // Coordinates (Optional)
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  
  // Operational Status
  operationalStatus: z.string().default('ACTIVE'),
  isActive: z.boolean().default(true),
  
  // Capacity & Membership (Optional, depends on organization type)
  totalCapacity: z.number().int().min(0).optional(),
  maleMembers: z.number().int().min(0).optional(),
  femaleMembers: z.number().int().min(0).optional(),
  posyanduCadres: z.number().int().min(0).optional(),
  
  // Ownership Status
  ownershipStatus: z.string().optional(),
  
  // Service Configuration (Optional)
  serviceHours: z.string().optional(), // e.g., "08:00-16:00"
  operatingDays: z.string().optional(), // e.g., "Monday-Friday"
  
  // Accreditation (Optional, mainly for schools/health facilities)
  accreditationGrade: z.string().optional(),
  accreditationYear: z.number().int().min(1900).max(2100).optional(),
  establishedYear: z.number().int().min(1900).max(2100).optional(),
  
  // Additional Information
  description: z.string().optional(),
  notes: z.string().optional(),
  
  // Timestamps are handled by Prisma
}).refine(
  (data) => {
    // Validate NPSN for SCHOOL type
    if (data.type === 'SCHOOL' && !data.npsn) {
      return false
    }
    return true
  },
  {
    message: 'NPSN wajib diisi untuk tipe organisasi SCHOOL',
    path: ['npsn']
  }
).refine(
  (data) => {
    // Validate NIKKES for HEALTH_FACILITY type
    if (data.type === 'HEALTH_FACILITY' && !data.nikkes) {
      return false
    }
    return true
  },
  {
    message: 'NIKKES wajib diisi untuk tipe organisasi HEALTH_FACILITY',
    path: ['nikkes']
  }
).refine(
  (data) => {
    // Validate Registration Number for INTEGRATED_SERVICE_POST
    if (data.type === 'INTEGRATED_SERVICE_POST' && !data.registrationNumber) {
      return false
    }
    return true
  },
  {
    message: 'Nomor registrasi wajib diisi untuk tipe organisasi INTEGRATED_SERVICE_POST',
    path: ['registrationNumber']
  }
)

/**
 * Schema untuk update Beneficiary Organization
 * Semua fields optional karena partial update
 */
export const updateBeneficiaryOrganizationSchema = createBeneficiaryOrganizationSchema.partial()

/**
 * Schema untuk filter Beneficiary Organizations
 */
export const beneficiaryOrganizationFiltersSchema = z.object({
  type: z.nativeEnum(BeneficiaryOrganizationType).optional(), // ✅ FIXED: was organizationType
  subType: z.nativeEnum(BeneficiaryOrganizationSubType).optional(), // ✅ FIXED: was organizationSubType
  operationalStatus: z.string().optional(), // ✅ FIXED: string instead of enum
  province: z.string().optional(),
  city: z.string().optional(), // ✅ FIXED: was regency
  district: z.string().optional(),
  search: z.string().optional(), // Search by name, NPSN, NIKKES, etc.
})

/**
 * TypeScript types derived from schemas
 */
export type CreateBeneficiaryOrganizationInput = z.infer<typeof createBeneficiaryOrganizationSchema>
export type UpdateBeneficiaryOrganizationInput = z.infer<typeof updateBeneficiaryOrganizationSchema>
export type BeneficiaryOrganizationFilters = z.infer<typeof beneficiaryOrganizationFiltersSchema>
