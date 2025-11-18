/**
 * @fileoverview HRD Employee Zod Schemas
 * @version Next.js 15.5.4 / Zod 3.x
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Validation Guidelines
 * 
 * Zod validation schemas for Employee CRUD operations
 */

import { z } from 'zod'

/**
 * Phone number schema (Indonesian format)
 * Accepts: 08xx, +628xx, 628xx
 */
const phoneSchema = z
  .string()
  .regex(/^(\+?62|0)8\d{8,11}$/, 'Format nomor telepon tidak valid (contoh: 081234567890)')
  .optional()

/**
 * NIK (Nomor Induk Kependudukan) schema
 * 16 digits Indonesian national ID
 */
const nikSchema = z
  .string()
  .regex(/^\d{16}$/, 'NIK harus 16 digit angka')
  .optional()

/**
 * Email schema with Indonesian domain support
 */
const emailSchema = z
  .string()
  .email('Format email tidak valid')
  .toLowerCase()
  .optional()

/**
 * Employee filters schema for list queries
 */
export const employeeFiltersSchema = z.object({
  search: z.string().optional(),
  departmentId: z.string().cuid().optional(),
  positionId: z.string().cuid().optional(),
  employmentType: z.enum(['PERMANENT', 'CONTRACT', 'TEMPORARY', 'INTERN', 'FREELANCE']).optional(),
  employmentStatus: z.enum(['ACTIVE', 'PROBATION', 'SUSPENDED', 'TERMINATED', 'RESIGNED', 'RETIRED']).optional(),
  employeeLevel: z.enum(['DIRECTOR', 'MANAGER', 'SUPERVISOR', 'STAFF']).optional(),
  gender: z.enum(['MALE', 'FEMALE']).optional(),
  isActive: z.boolean().optional(),
  joinDateFrom: z.coerce.date().optional(),
  joinDateTo: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(['fullName', 'employeeCode', 'joinDate', 'department', 'position']).default('fullName'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

/**
 * Create employee schema
 * All fields required for new employee registration
 */
export const createEmployeeSchema = z.object({
  // Personal Information
  fullName: z.string().min(3, 'Nama lengkap minimal 3 karakter').max(255),
  nickname: z.string().max(100).optional(),
  nik: nikSchema,
  dateOfBirth: z.coerce.date({
    message: 'Tanggal lahir wajib diisi',
  }).refine((date) => {
    const age = new Date().getFullYear() - date.getFullYear()
    return age >= 17 && age <= 70
  }, 'Usia harus antara 17-70 tahun'),
  placeOfBirth: z.string().max(255).optional(),
  gender: z.enum(['MALE', 'FEMALE'], {
    message: 'Jenis kelamin wajib dipilih',
  }),
  religion: z.string().max(50).optional(),
  maritalStatus: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED']).default('SINGLE'),
  bloodType: z.string().max(5).optional(),
  nationality: z.string().max(100).default('Indonesian'),

  // Contact Information
  phone: phoneSchema,
  email: emailSchema,
  personalEmail: emailSchema,
  addressDetail: z.string().min(10, 'Alamat minimal 10 karakter').max(500),
  villageId: z.string().cuid('ID desa tidak valid'),
  postalCode: z.string().regex(/^\d{5}$/, 'Kode pos harus 5 digit').optional(),

  // Emergency Contact
  emergencyContactName: z.string().max(255).optional(),
  emergencyContactPhone: phoneSchema,
  emergencyContactRelation: z.string().max(100).optional(),

  // Employment Information
  employeeCode: z.string().max(50).optional(),
  departmentId: z.string().cuid('Department ID tidak valid'),
  positionId: z.string().cuid('Position ID tidak valid'),
  employmentType: z.enum(['PERMANENT', 'CONTRACT', 'TEMPORARY', 'INTERN', 'FREELANCE']).default('PERMANENT'),
  employmentStatus: z.enum(['ACTIVE', 'PROBATION', 'SUSPENDED', 'TERMINATED', 'RESIGNED', 'RETIRED']).default('PROBATION'),
  joinDate: z.coerce.date({
    message: 'Tanggal bergabung wajib diisi',
  }),
  probationEndDate: z.coerce.date().optional(),
  contractStartDate: z.coerce.date().optional(),
  contractEndDate: z.coerce.date().optional(),
  
  // Supervision & Work Details
  directSupervisor: z.string().cuid().optional(),
  workLocation: z.string().max(255).optional(),
  workScheduleId: z.string().cuid().optional(),

  // Compensation
  basicSalary: z.coerce.number().positive().optional(),
  currency: z.string().length(3).default('IDR'),
  salaryGrade: z.string().max(50).optional(),

  // Financial Information
  taxId: z.string().max(50).optional(),
  bankAccount: z.string().max(50).optional(),
  bankName: z.string().max(100).optional(),
  bankBranch: z.string().max(100).optional(),

  // Additional Information
  photoUrl: z.string().url().optional(),
  biography: z.string().max(1000).optional(),
  skills: z.array(z.string().max(100)).default([]),
  languages: z.array(z.string().max(50)).default(['Indonesian']),
  isActive: z.boolean().default(true),
}).refine((data) => {
  // Contract employees must have contract dates
  if (data.employmentType === 'CONTRACT') {
    return !!data.contractStartDate && !!data.contractEndDate
  }
  return true
}, {
  message: 'Karyawan kontrak harus memiliki tanggal mulai dan akhir kontrak',
  path: ['contractEndDate'],
}).refine((data) => {
  // Contract end date must be after start date
  if (data.contractStartDate && data.contractEndDate) {
    return data.contractEndDate > data.contractStartDate
  }
  return true
}, {
  message: 'Tanggal akhir kontrak harus setelah tanggal mulai',
  path: ['contractEndDate'],
})

/**
 * Update employee schema
 * All fields optional for partial updates
 */
export const updateEmployeeSchema = createEmployeeSchema.partial().extend({
  terminationDate: z.coerce.date().optional(),
  terminationReason: z.string().max(500).optional(),
}).refine((data) => {
  // If terminated, must have termination date and reason
  if (data.employmentStatus === 'TERMINATED' || data.employmentStatus === 'RESIGNED') {
    return !!data.terminationDate && !!data.terminationReason
  }
  return true
}, {
  message: 'Karyawan yang diberhentikan harus memiliki tanggal dan alasan',
  path: ['terminationReason'],
})

/**
 * Type exports for use in components and API
 */
export type EmployeeFiltersInput = z.infer<typeof employeeFiltersSchema>
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>
