/**
 * @fileoverview SPPG User Management Zod Schemas
 * @version Next.js 15.5.4 / Zod 3.24.1
 * @author Bagizi-ID Development Team
 * @see {@link /.github/copilot-instructions.md} Validation Standards
 * 
 * Zod validation schemas for SPPG user management.
 * Based on Prisma User model with business rules.
 */

import { z } from 'zod'
import { UserType, UserRole } from '@prisma/client'

/**
 * Password validation rules
 * Minimum 8 characters, at least one uppercase, one lowercase, one number
 */
const passwordSchema = z
  .string()
  .min(8, 'Password minimal 8 karakter')
  .regex(/[A-Z]/, 'Password harus mengandung minimal 1 huruf besar')
  .regex(/[a-z]/, 'Password harus mengandung minimal 1 huruf kecil')
  .regex(/[0-9]/, 'Password harus mengandung minimal 1 angka')
  .max(100, 'Password maksimal 100 karakter')

/**
 * Email validation with Indonesian domain support
 */
const emailSchema = z
  .string()
  .email('Format email tidak valid')
  .max(255, 'Email maksimal 255 karakter')
  .toLowerCase()
  .trim()

/**
 * Phone number validation (Indonesian format)
 * Supports: 08xxx, +628xxx, 628xxx
 */
const phoneSchema = z
  .string()
  .regex(/^(\+62|62|0)[0-9]{8,13}$/, 'Format nomor telepon tidak valid (contoh: 081234567890)')
  .transform((val) => {
    // Normalize to +628xxx format
    if (val.startsWith('08')) return `+62${val.substring(1)}`
    if (val.startsWith('62')) return `+${val}`
    return val
  })
  .optional()

/**
 * Create user schema
 */
export const createUserSchema = z.object({
  // Required fields
  email: emailSchema,
  
  name: z
    .string()
    .min(3, 'Nama minimal 3 karakter')
    .max(255, 'Nama maksimal 255 karakter')
    .trim(),
  
  password: passwordSchema,
  
  userType: z.nativeEnum(UserType, {
    message: 'Tipe user tidak valid'
  }),
  
  userRole: z.nativeEnum(UserRole, {
    message: 'Role user tidak valid'
  }),
  
  // Optional contact fields
  phone: phoneSchema,
  
  firstName: z
    .string()
    .min(1, 'Nama depan minimal 1 karakter')
    .max(100, 'Nama depan maksimal 100 karakter')
    .trim()
    .optional(),
  
  lastName: z
    .string()
    .min(1, 'Nama belakang minimal 1 karakter')
    .max(100, 'Nama belakang maksimal 100 karakter')
    .trim()
    .optional(),
  
  departmentId: z
    .string()
    .cuid('Department ID tidak valid')
    .optional()
    .nullable(),
  
  positionId: z
    .string()
    .cuid('Position ID tidak valid')
    .optional()
    .nullable(),
  
  // Optional settings
  timezone: z
    .enum(['WIB', 'WITA', 'WIT'])
    .default('WIB')
    .optional(),
  
  language: z
    .enum(['id', 'en'])
    .default('id')
    .optional(),
  
  isActive: z
    .boolean()
    .default(true)
    .optional(),
})

/**
 * Update user schema (all fields optional)
 */
export const updateUserSchema = z.object({
  name: z
    .string()
    .min(3, 'Nama minimal 3 karakter')
    .max(255, 'Nama maksimal 255 karakter')
    .trim()
    .optional(),
  
  phone: phoneSchema,
  
  firstName: z
    .string()
    .min(1, 'Nama depan minimal 1 karakter')
    .max(100, 'Nama depan maksimal 100 karakter')
    .trim()
    .optional(),
  
  lastName: z
    .string()
    .min(1, 'Nama belakang minimal 1 karakter')
    .max(100, 'Nama belakang maksimal 100 karakter')
    .trim()
    .optional(),
  
  departmentId: z
    .string()
    .cuid('Department ID tidak valid')
    .optional()
    .nullable(),
  
  positionId: z
    .string()
    .cuid('Position ID tidak valid')
    .optional()
    .nullable(),
  
  location: z
    .string()
    .max(255, 'Lokasi maksimal 255 karakter')
    .trim()
    .optional(),
  
  timezone: z
    .enum(['WIB', 'WITA', 'WIT'])
    .optional(),
  
  language: z
    .enum(['id', 'en'])
    .optional(),
  
  workPhone: phoneSchema,
  
  personalPhone: phoneSchema,
  
  alternateEmail: emailSchema
    .optional(),
  
  address: z
    .string()
    .max(500, 'Alamat maksimal 500 karakter')
    .trim()
    .optional(),
  
  // Emergency contact
  emergencyContact: z
    .string()
    .max(255, 'Nama kontak darurat maksimal 255 karakter')
    .trim()
    .optional(),
  
  emergencyPhone: phoneSchema,
  
  emergencyRelationship: z
    .string()
    .max(50, 'Hubungan maksimal 50 karakter')
    .trim()
    .optional(),
  
  // Role can be changed
  userRole: z.nativeEnum(UserRole, {
    message: 'Role user tidak valid'
  }).optional(),
  
  // Status
  isActive: z
    .boolean()
    .optional(),
})

/**
 * Update password schema (for users updating their own password)
 */
export const updatePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Password lama wajib diisi'),
  
  newPassword: passwordSchema,
  
  confirmPassword: z
    .string()
    .min(1, 'Konfirmasi password wajib diisi'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Konfirmasi password tidak cocok',
  path: ['confirmPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'Password baru harus berbeda dengan password lama',
  path: ['newPassword'],
})

/**
 * Reset password schema (for admin resetting user password)
 */
export const resetPasswordSchema = z.object({
  newPassword: passwordSchema,
  
  confirmPassword: z
    .string()
    .min(1, 'Konfirmasi password wajib diisi'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Konfirmasi password tidak cocok',
  path: ['confirmPassword'],
})

/**
 * User filters schema
 */
export const userFiltersSchema = z.object({
  search: z
    .string()
    .optional(),
  
  userRole: z.nativeEnum(UserRole).optional(),
  
  isActive: z
    .boolean()
    .optional(),
  
  sppgId: z
    .string()
    .cuid()
    .optional(),
  
  page: z
    .number()
    .int()
    .min(1)
    .default(1)
    .optional(),
  
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(10)
    .optional(),
  
  sortBy: z
    .enum(['name', 'email', 'createdAt', 'lastLogin'])
    .default('createdAt')
    .optional(),
  
  sortOrder: z
    .enum(['asc', 'desc'])
    .default('desc')
    .optional(),
})

/**
 * Type inference helpers
 */
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type UserFilters = z.infer<typeof userFiltersSchema>
