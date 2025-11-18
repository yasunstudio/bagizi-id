/**
 * Enrollment Schema for ProgramSchoolEnrollment
 * 
 * Comprehensive validation for school enrollment in nutrition programs
 * with student configuration, feeding schedule, delivery info, and budget allocation.
 * 
 * @fileoverview ProgramSchoolEnrollment validation schema
 * @version Next.js 15.5.4 / Zod 3.x
 * @author Bagizi-ID Development Team
 * @see {@link /docs/PROGRAM_ENROLLMENTS_IMPLEMENTATION.md} Implementation Guide
 */

import { z } from 'zod'

/**
 * Main enrollment schema with comprehensive validation
 * Validates 40+ fields for ProgramSchoolEnrollment configuration
 */
export const enrollmentSchema = z.object({
  // School Reference
  schoolId: z.string().cuid('Invalid school ID'),
  
  // Enrollment Period
  enrollmentDate: z.coerce.date(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
  
  // Student Configuration
  targetStudents: z.number()
    .int('Target siswa harus bilangan bulat')
    .min(1, 'Target siswa minimal 1')
    .max(10000, 'Target siswa maksimal 10,000'),
    
  activeStudents: z.number()
    .int('Siswa aktif harus bilangan bulat')
    .min(0, 'Siswa aktif tidak boleh negatif')
    .max(10000, 'Siswa aktif maksimal 10,000')
    .optional(),
    
  // Student Age Groups
  students4to6Years: z.number()
    .int('Jumlah siswa harus bilangan bulat')
    .min(0, 'Jumlah siswa tidak boleh negatif')
    .default(0),
    
  students7to12Years: z.number()
    .int('Jumlah siswa harus bilangan bulat')
    .min(0, 'Jumlah siswa tidak boleh negatif')
    .default(0),
    
  students13to15Years: z.number()
    .int('Jumlah siswa harus bilangan bulat')
    .min(0, 'Jumlah siswa tidak boleh negatif')
    .default(0),
    
  students16to18Years: z.number()
    .int('Jumlah siswa harus bilangan bulat')
    .min(0, 'Jumlah siswa tidak boleh negatif')
    .default(0),
  
  // Student Gender Distribution
  maleStudents: z.number()
    .int('Jumlah siswa harus bilangan bulat')
    .min(0, 'Jumlah siswa tidak boleh negatif')
    .optional(),
    
  femaleStudents: z.number()
    .int('Jumlah siswa harus bilangan bulat')
    .min(0, 'Jumlah siswa tidak boleh negatif')
    .optional(),
  
  // Feeding Configuration
  feedingDays: z.number()
    .int('Jumlah hari harus bilangan bulat')
    .min(1, 'Minimal 1 hari per minggu')
    .max(7, 'Maksimal 7 hari per minggu')
    .optional(),
    
  mealsPerDay: z.number()
    .int('Jumlah makan harus bilangan bulat')
    .min(1, 'Minimal 1 kali makan per hari')
    .max(5, 'Maksimal 5 kali makan per hari')
    .optional(),
    
  feedingTime: z.string()
    .max(50, 'Waktu feeding maksimal 50 karakter')
    .optional()
    .nullable(),
  
  breakfastTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format waktu: HH:MM (contoh: 09:30)')
    .optional()
    .nullable(),
    
  lunchTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format waktu: HH:MM (contoh: 12:00)')
    .optional()
    .nullable(),
    
  snackTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format waktu: HH:MM (contoh: 15:00)')
    .optional()
    .nullable(),
  
  // Delivery Configuration
  deliveryAddress: z.string()
    .min(10, 'Alamat minimal 10 karakter')
    .max(500, 'Alamat maksimal 500 karakter')
    .optional()
    .nullable(),
    
  deliveryContact: z.string()
    .min(3, 'Nama kontak minimal 3 karakter')
    .max(100, 'Nama kontak maksimal 100 karakter')
    .optional()
    .nullable(),
    
  deliveryPhone: z.string()
    .regex(
      /^(\+62|62|0)[0-9]{9,12}$/,
      'Format nomor HP tidak valid (contoh: 0812345678, +628123456789)'
    )
    .optional()
    .nullable(),
    
  deliveryInstructions: z.string()
    .max(1000, 'Instruksi maksimal 1000 karakter')
    .optional()
    .nullable(),
    
  preferredDeliveryTime: z.string()
    .max(100, 'Waktu pengiriman maksimal 100 karakter')
    .optional()
    .nullable(),
    
  estimatedTravelTime: z.number()
    .int('Waktu tempuh harus bilangan bulat (menit)')
    .min(0, 'Waktu tempuh tidak boleh negatif')
    .max(1440, 'Waktu tempuh maksimal 1440 menit (24 jam)')
    .optional()
    .nullable(),
  
  // Service Configuration
  storageCapacity: z.number()
    .int('Kapasitas penyimpanan harus bilangan bulat (liter)')
    .min(0, 'Kapasitas tidak boleh negatif')
    .optional()
    .nullable(),
    
  servingMethod: z.string()
    .max(50, 'Metode penyajian maksimal 50 karakter')
    .optional()
    .nullable(),
  
  // Budget Configuration
  monthlyBudgetAllocation: z.number()
    .min(0, 'Budget tidak boleh negatif')
    .max(1000000000, 'Budget maksimal Rp 1 miliar per bulan')
    .optional()
    .nullable(),
    
  budgetPerStudent: z.number()
    .min(0, 'Budget per siswa tidak boleh negatif')
    .max(10000000, 'Budget per siswa maksimal Rp 10 juta')
    .optional()
    .nullable(),
  
  // Contract Information
  contractStartDate: z.coerce.date().optional().nullable(),
  contractEndDate: z.coerce.date().optional().nullable(),
  
  contractValue: z.number()
    .min(0, 'Nilai kontrak tidak boleh negatif')
    .optional()
    .nullable(),
    
  contractNumber: z.string()
    .max(100, 'Nomor kontrak maksimal 100 karakter')
    .optional()
    .nullable(),
  
  // Performance Tracking (optional, calculated fields)
  attendanceRate: z.number()
    .min(0, 'Tingkat kehadiran minimal 0%')
    .max(100, 'Tingkat kehadiran maksimal 100%')
    .optional()
    .nullable(),
    
  participationRate: z.number()
    .min(0, 'Tingkat partisipasi minimal 0%')
    .max(100, 'Tingkat partisipasi maksimal 100%')
    .optional()
    .nullable(),
    
  satisfactionScore: z.number()
    .min(0, 'Skor kepuasan minimal 0')
    .max(100, 'Skor kepuasan maksimal 100')
    .optional()
    .nullable(),
  
  // Status
  status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'COMPLETED', 'CANCELLED', 'GRADUATED']).default('ACTIVE'),
  
  isActive: z.boolean().default(true),
  
  // Notes
  notes: z.string()
    .max(2000, 'Catatan maksimal 2000 karakter')
    .optional()
    .nullable(),
    
  specialRequirements: z.string()
    .max(1000, 'Kebutuhan khusus maksimal 1000 karakter')
    .optional()
    .nullable(),
})
  // Cross-field validations (only run when all relevant fields are present)
  .refine(
    (data) => {
      // Skip validation if any field is undefined (partial update)
      if (data.maleStudents === undefined || data.femaleStudents === undefined || data.activeStudents === undefined) {
        return true
      }
      return data.maleStudents + data.femaleStudents === data.activeStudents
    },
    {
      message: 'Jumlah siswa laki-laki + perempuan harus sama dengan total siswa aktif',
      path: ['activeStudents']
    }
  )
  .refine(
    (data) => {
      // Skip validation if any field is undefined (partial update)
      if (data.activeStudents === undefined || data.targetStudents === undefined) {
        return true
      }
      return data.activeStudents <= data.targetStudents
    },
    {
      message: 'Siswa aktif tidak boleh melebihi target siswa',
      path: ['activeStudents']
    }
  )
  .refine(
    (data) => {
      // Skip validation if activeStudents is undefined (partial update)
      if (data.activeStudents === undefined) {
        return true
      }
      
      const totalByAge = 
        (data.students4to6Years || 0) + 
        (data.students7to12Years || 0) + 
        (data.students13to15Years || 0) + 
        (data.students16to18Years || 0)
      return totalByAge === 0 || totalByAge === data.activeStudents
    },
    {
      message: 'Total siswa per kelompok umur harus sama dengan siswa aktif (atau 0 jika tidak diisi)',
      path: ['students4to6Years']
    }
  )
  .refine(
    (data) => {
      if (data.endDate && data.startDate) {
        return data.endDate >= data.startDate
      }
      return true
    },
    {
      message: 'Tanggal selesai harus lebih besar atau sama dengan tanggal mulai',
      path: ['endDate']
    }
  )
  .refine(
    (data) => {
      if (data.contractEndDate && data.contractStartDate) {
        return data.contractEndDate >= data.contractStartDate
      }
      return true
    },
    {
      message: 'Tanggal akhir kontrak harus lebih besar atau sama dengan tanggal mulai kontrak',
      path: ['contractEndDate']
    }
  )

/**
 * Type for enrollment input (from forms)
 */
export type EnrollmentInput = z.infer<typeof enrollmentSchema>

/**
 * Type for enrollment response (from API)
 */
export type EnrollmentResponse = Required<EnrollmentInput> & {
  id: string
  programId: string
  sppgId: string
  totalDistributions: number
  totalMealsServed: number
  createdAt: Date
  updatedAt: Date
}

/**
 * Partial schema for updates (all fields optional)
 */
export const enrollmentUpdateSchema = enrollmentSchema.partial()

/**
 * Type for enrollment update input
 */
export type EnrollmentUpdateInput = z.infer<typeof enrollmentUpdateSchema>
