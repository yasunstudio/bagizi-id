/**
 * @fileoverview Zod Schema untuk Beneficiary Organization dengan validasi bahasa Indonesia
 * @version Next.js 15.5.4 / Zod 3.24.1
 * @author Bagizi-ID Development Team
 */

import { z } from 'zod'
import { BeneficiaryOrganizationType, BeneficiaryOrganizationSubType } from '@prisma/client'

/**
 * Helper function to convert empty strings to null/undefined for optional fields
 */
const emptyStringToNull = (val: unknown) => {
  if (typeof val === 'string' && val.trim() === '') {
    return null
  }
  return val
}

/**
 * Schema untuk membuat/mengubah Beneficiary Organization
 * ✅ SESUAI 100% dengan Prisma Schema
 */
export const beneficiaryOrganizationSchema = z.object({
  // Organization Identity
  organizationName: z
    .string({ message: 'Nama organisasi wajib diisi' })
    .min(3, 'Nama organisasi minimal 3 karakter')
    .max(255, 'Nama organisasi maksimal 255 karakter'),

  organizationCode: z
    .string({ message: 'Kode organisasi wajib diisi' })
    .min(2, 'Kode organisasi minimal 2 karakter')
    .max(50, 'Kode organisasi maksimal 50 karakter')
    .regex(/^[A-Z0-9-]+$/, 'Kode organisasi hanya boleh huruf kapital, angka, dan strip'),

  type: z.nativeEnum(BeneficiaryOrganizationType, {
    message: 'Jenis organisasi wajib dipilih',
  }),

  subType: z.nativeEnum(BeneficiaryOrganizationSubType).optional().nullable(),

  // Location - Using foreign keys (hierarchical order: Province → Regency → District → Village)
  provinceId: z
    .string({ message: 'Provinsi wajib dipilih' })
    .cuid('ID Provinsi tidak valid'),

  regencyId: z
    .string({ message: 'Kabupaten/Kota wajib dipilih' })
    .cuid('ID Kabupaten/Kota tidak valid'),

  districtId: z
    .string()
    .cuid('ID Kecamatan tidak valid')
    .optional()
    .nullable(),

  villageId: z
    .string()
    .cuid('ID Kelurahan/Desa tidak valid')
    .optional()
    .nullable(),

  address: z
    .string({ message: 'Alamat wajib diisi' })
    .min(10, 'Alamat minimal 10 karakter'),

  postalCode: z.preprocess(
    emptyStringToNull,
    z
      .string()
      .max(10, 'Kode pos maksimal 10 karakter')
      .regex(/^\d*$/, 'Kode pos hanya boleh berisi angka')
      .optional()
      .nullable()
  ),

  latitude: z
    .number()
    .min(-90, 'Latitude tidak valid')
    .max(90, 'Latitude tidak valid')
    .optional()
    .nullable(),

  longitude: z
    .number()
    .min(-180, 'Longitude tidak valid')
    .max(180, 'Longitude tidak valid')
    .optional()
    .nullable(),

  // Contact Information (sesuai Prisma)
  phone: z.preprocess(
    emptyStringToNull,
    z
      .string()
      .min(10, 'Nomor telepon minimal 10 digit')
      .max(20, 'Nomor telepon maksimal 20 digit')
      .regex(/^[0-9+()-\s]+$/, 'Format nomor telepon tidak valid')
      .optional()
      .nullable()
  ),

  email: z.preprocess(
    emptyStringToNull,
    z
      .string()
      .email('Format email tidak valid')
      .max(255, 'Email maksimal 255 karakter')
      .optional()
      .nullable()
  ),

  contactPerson: z.preprocess(
    emptyStringToNull,
    z
      .string()
      .max(255, 'Nama kontak maksimal 255 karakter')
      .optional()
      .nullable()
  ),

  contactTitle: z.preprocess(
    emptyStringToNull,
    z
      .string()
      .max(100, 'Jabatan kontak maksimal 100 karakter')
      .optional()
      .nullable()
  ),

  // Type-Specific Identifiers
  npsn: z.preprocess(
    emptyStringToNull,
    z
      .string()
      .max(20, 'NPSN maksimal 20 karakter')
      .regex(/^\d*$/, 'NPSN hanya boleh berisi angka')
      .optional()
      .nullable()
  ),

  nikkes: z.preprocess(
    emptyStringToNull,
    z
      .string()
      .max(30, 'NIKKES maksimal 30 karakter')
      .optional()
      .nullable()
  ),

  registrationNumber: z.preprocess(
    emptyStringToNull,
    z
      .string()
      .max(50, 'Nomor registrasi maksimal 50 karakter')
      .optional()
      .nullable()
  ),

  // Principal/Head Information
  principalName: z.preprocess(
    emptyStringToNull,
    z
      .string()
      .max(255, 'Nama kepala maksimal 255 karakter')
      .optional()
      .nullable()
  ),

  principalNip: z.preprocess(
    emptyStringToNull,
    z
      .string()
      .max(30, 'NIP maksimal 30 karakter')
      .optional()
      .nullable()
  ),

  // Ownership Status
  ownershipStatus: z
    .enum(['NEGERI', 'SWASTA'])
    .optional()
    .nullable(),

  // Staff/Personnel Counts (Comprehensive - applies to all organization types)
  teachingStaffCount: z
    .number()
    .int('Jumlah tenaga pengajar harus bilangan bulat')
    .min(0, 'Jumlah tenaga pengajar tidak boleh negatif')
    .optional()
    .nullable(),

  nonTeachingStaffCount: z
    .number()
    .int('Jumlah tenaga non-pengajar harus bilangan bulat')
    .min(0, 'Jumlah tenaga non-pengajar tidak boleh negatif')
    .optional()
    .nullable(),

  establishedYear: z
    .number()
    .int('Tahun berdiri harus bilangan bulat')
    .min(1900, 'Tahun berdiri tidak valid')
    .max(2100, 'Tahun berdiri tidak valid')
    .optional()
    .nullable(),

  // Operational Status
  operationalStatus: z
    .string()
    .max(20, 'Status operasional maksimal 20 karakter')
    .default('ACTIVE'), // ✅ NOT nullable - matches Prisma @default("ACTIVE")

  isActive: z.boolean().default(true),

  // Additional Information
  notes: z.preprocess(
    emptyStringToNull,
    z
      .string()
      .optional()
      .nullable()
  ),
})

/**
 * Type untuk create/update Beneficiary Organization
 */
export type BeneficiaryOrganizationInput = z.infer<typeof beneficiaryOrganizationSchema>

/**
 * Schema untuk filter/search
 */
export const beneficiaryOrganizationFilterSchema = z.object({
  type: z.nativeEnum(BeneficiaryOrganizationType).optional(), // ✅ Uses Prisma enum
  search: z.string().optional(),
  // NOTE: Filter regional menggunakan nested relations, bukan field langsung
  // Contoh: { province: { name: { contains: 'Jawa' } } }
  isActive: z.boolean().optional(),
})

export type BeneficiaryOrganizationFilter = z.infer<typeof beneficiaryOrganizationFilterSchema>

/**
 * Label untuk jenis organisasi dalam bahasa Indonesia
 * ✅ Fokus MBG Nasional (Program Makanan Bergizi Gratis)
 */
export const organizationTypeLabels = {
  SCHOOL: 'Sekolah',
  HEALTH_FACILITY: 'Fasilitas Kesehatan',
  INTEGRATED_SERVICE_POST: 'Posyandu',
} as const

/**
 * Label untuk status kepemilikan
 */
export const ownershipStatusLabels = {
  NEGERI: 'Negeri',
  SWASTA: 'Swasta',
} as const

/**
 * Label untuk sub jenis organisasi dalam bahasa Indonesia
 * ✅ Sesuai dengan program MBG Nasional
 */
export const organizationSubTypeLabels = {
  // Sekolah (Target: SCHOOL_CHILDREN, TEENAGE_GIRL)
  PAUD: 'PAUD (Pendidikan Anak Usia Dini)',
  TK: 'Taman Kanak-Kanak',
  SD: 'Sekolah Dasar',
  SMP: 'Sekolah Menengah Pertama',
  SMA: 'Sekolah Menengah Atas',
  SMK: 'Sekolah Menengah Kejuruan',
  PESANTREN: 'Pesantren/Pondok Pesantren',
  
  // Fasilitas Kesehatan (Target: PREGNANT_WOMAN, BREASTFEEDING_MOTHER)
  PUSKESMAS: 'Puskesmas (Pusat Kesehatan Masyarakat)',
  KLINIK: 'Klinik Kesehatan',
  RUMAH_SAKIT: 'Rumah Sakit',
  
  // Posyandu (Target: TODDLER)
  POSYANDU: 'Posyandu (Pos Pelayanan Terpadu)',
} as const

/**
 * Mapping sub jenis berdasarkan jenis organisasi
 * ✅ Fokus pada 3 beneficiary types utama MBG
 */
export const subTypesByOrganizationType = {
  SCHOOL: ['PAUD', 'TK', 'SD', 'SMP', 'SMA', 'SMK', 'PESANTREN'],
  HEALTH_FACILITY: ['PUSKESMAS', 'KLINIK', 'RUMAH_SAKIT'],
  INTEGRATED_SERVICE_POST: ['POSYANDU'],
} as const

/**
 * Label untuk status operasional dalam bahasa Indonesia
 */
export const operationalStatusLabels = {
  ACTIVE: 'Aktif',
  INACTIVE: 'Tidak Aktif',
  TEMPORARILY_CLOSED: 'Tutup Sementara',
} as const
