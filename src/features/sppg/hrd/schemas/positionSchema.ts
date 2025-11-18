/**
 * @fileoverview Position Zod Validation Schemas
 * Comprehensive validation schemas for Position management with enterprise patterns
 * @version Next.js 15.5.4 / Zod 3.x / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { z } from 'zod'
import { EmployeeLevel } from '@prisma/client'

/**
 * Position Filters Schema
 * Validates query parameters for position list filtering
 * 
 * @example
 * ```typescript
 * const filters = positionFiltersSchema.parse({
 *   search: 'Manager',
 *   departmentId: 'clxxx123',
 *   level: 'MANAGER',
 *   isActive: true
 * })
 * ```
 */
export const positionFiltersSchema = z.object({
  search: z.string().optional(),
  departmentId: z.string().cuid().optional(),
  level: z.nativeEnum(EmployeeLevel).optional(),
  isActive: z.boolean().optional(),
  minSalaryRange: z.number().min(0).optional(),
  maxSalaryRange: z.number().min(0).optional(),
})

/**
 * Position base schema (without refinement)
 * Used as base to avoid Zod refinement + .partial() incompatibility
 */
const positionBaseSchema = z.object({
  departmentId: z.string().cuid({ message: 'Department ID tidak valid' }),
  positionCode: z
    .string()
    .min(2, 'Kode posisi minimal 2 karakter')
    .max(20, 'Kode posisi maksimal 20 karakter')
    .regex(/^[A-Z0-9-_]+$/, 'Kode posisi harus huruf besar, angka, dash, atau underscore')
    .transform((val) => val.toUpperCase()),
  positionName: z
    .string()
    .min(3, 'Nama posisi minimal 3 karakter')
    .max(255, 'Nama posisi maksimal 255 karakter'),
  jobDescription: z.string().optional().nullable(),
  requirements: z
    .array(z.string().min(1, 'Requirement tidak boleh kosong'))
    .default([])
    .optional(),
  responsibilities: z
    .array(z.string().min(1, 'Responsibility tidak boleh kosong'))
    .default([])
    .optional(),
  level: z.nativeEnum(EmployeeLevel, {
    message: 'Level karyawan tidak valid',
  }).default(EmployeeLevel.STAFF),
  reportsTo: z.string().cuid().optional().nullable(),
  minSalary: z
    .number()
    .min(0, 'Minimal salary tidak boleh negatif')
    .optional()
    .nullable(),
  maxSalary: z
    .number()
    .min(0, 'Maksimal salary tidak boleh negatif')
    .optional()
    .nullable(),
  currency: z.string().length(3, 'Kode currency harus 3 karakter').default('IDR'),
  maxOccupants: z
    .number()
    .int('Maksimal occupants harus bilangan bulat')
    .min(1, 'Maksimal occupants minimal 1')
    .default(1),
  isActive: z.boolean().default(true),
})

/**
 * Position Create Schema
 * Validates input for creating new positions with refinement
 * 
 * Validation Rules:
 * - positionCode: 2-20 chars, uppercase, alphanumeric with dash/underscore
 * - positionName: 3-255 chars, required
 * - departmentId: Valid CUID, required
 * - level: EmployeeLevel enum (STAFF, SUPERVISOR, MANAGER, etc.)
 * - minSalary: Non-negative or null
 * - maxSalary: Non-negative or null
 * - maxOccupants: Positive integer, minimum 1
 * - requirements: Array of strings (optional)
 * - responsibilities: Array of strings (optional)
 * - Cross-validation: maxSalary must be >= minSalary
 * 
 * @example
 * ```typescript
 * const position = positionSchema.parse({
 *   departmentId: 'clxxx123',
 *   positionCode: 'MGR-001',
 *   positionName: 'Department Manager',
 *   level: 'MANAGER',
 *   minSalary: 8000000,
 *   maxSalary: 12000000,
 *   requirements: ['Bachelor degree', '5 years experience'],
 *   responsibilities: ['Lead team', 'Manage budget']
 * })
 * ```
 */
export const positionSchema = positionBaseSchema.refine(
  (data) => {
    // Validate salary range if both are provided
    if (
      data.minSalary !== null &&
      data.minSalary !== undefined &&
      data.maxSalary !== null &&
      data.maxSalary !== undefined
    ) {
      return data.minSalary <= data.maxSalary
    }
    return true
  },
  {
    message: 'Maksimal salary harus lebih besar atau sama dengan minimal salary',
    path: ['maxSalary'],
  }
)

/**
 * Position Update Schema
 * Validates input for updating existing positions
 * All fields are optional (partial update support)
 * Uses base schema to avoid Zod's "refined schemas cannot be extended" error
 * 
 * @example
 * ```typescript
 * const updates = positionUpdateSchema.parse({
 *   positionName: 'Senior Manager',
 *   level: 'SENIOR_MANAGER',
 *   maxSalary: 15000000
 * })
 * ```
 */
export const positionUpdateSchema = positionBaseSchema.partial()

/**
 * Type inference from schemas
 * Automatically inferred TypeScript types from Zod schemas
 */
export type PositionFilters = z.infer<typeof positionFiltersSchema>
export type PositionInput = z.infer<typeof positionSchema>
export type PositionUpdate = z.infer<typeof positionUpdateSchema>
