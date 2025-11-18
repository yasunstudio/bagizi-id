/**
 * @fileoverview HRD Department Zod Schemas
 * @version Next.js 15.5.4 / Zod 3.x
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Validation Guidelines
 * 
 * Zod validation schemas for Department CRUD operations
 * Supports hierarchical department structure with budget tracking
 */

import { z } from 'zod'

/**
 * Phone number schema (Indonesian format)
 * Accepts: 08xx, +628xx, 628xx, or landline formats
 */
const phoneSchema = z
  .string()
  .regex(/^(\+?62|0)\d{8,13}$/, 'Format nomor telepon tidak valid')
  .optional()

/**
 * Email schema with validation
 */
const emailSchema = z
  .string()
  .email('Format email tidak valid')
  .toLowerCase()
  .optional()

/**
 * Department filters schema for list queries
 */
export const departmentFiltersSchema = z.object({
  search: z.string().optional(),
  parentId: z.string().cuid().optional(),
  managerId: z.string().cuid().optional(),
  isActive: z.boolean().optional(),
  hasParent: z.boolean().optional(), // Filter root departments (null parent) or child departments
})

/**
 * Department input schema for create/update
 * Used in POST /api/sppg/departments and PUT /api/sppg/departments/[id]
 */
/**
 * Department base schema (without refinement)
 * Used as base for update schema to avoid Zod refinement + .partial() incompatibility
 */
const departmentBaseSchema = z.object({
  departmentCode: z
    .string()
    .min(2, 'Kode departemen minimal 2 karakter')
    .max(20, 'Kode departemen maksimal 20 karakter')
    .regex(/^[A-Z0-9-_]+$/, 'Kode departemen hanya boleh huruf besar, angka, dan dash')
    .transform((val) => val.toUpperCase()),
  
  departmentName: z
    .string()
    .min(3, 'Nama departemen minimal 3 karakter')
    .max(255, 'Nama departemen maksimal 255 karakter'),
  
  description: z
    .string()
    .max(1000, 'Deskripsi maksimal 1000 karakter')
    .optional()
    .or(z.literal('')),
  
  parentId: z
    .string()
    .cuid('Format parent ID tidak valid')
    .optional()
    .nullable(),
  
  managerId: z
    .string()
    .cuid('Format manager ID tidak valid')
    .optional()
    .nullable(),
  
  budgetAllocated: z
    .number()
    .nonnegative('Budget tidak boleh negatif')
    .optional()
    .nullable(),
  
  maxEmployees: z
    .number()
    .int('Jumlah maksimal karyawan harus bilangan bulat')
    .positive('Jumlah maksimal karyawan harus positif')
    .optional()
    .nullable(),
  
  email: emailSchema,
  
  phone: phoneSchema,
  
  location: z
    .string()
    .max(500, 'Lokasi maksimal 500 karakter')
    .optional()
    .or(z.literal('')),
  
  isActive: z.boolean(),
})

/**
 * Department creation schema with refinement
 * Used in POST /api/sppg/departments and forms
 */
export const departmentSchema = departmentBaseSchema.refine((data) => {
  // Validation: If maxEmployees is set, it should be at least 1
  if (data.maxEmployees !== null && data.maxEmployees !== undefined && data.maxEmployees < 1) {
    return false
  }
  return true
}, {
  message: 'Jumlah maksimal karyawan minimal 1',
  path: ['maxEmployees'],
})

/**
 * Department update schema (all fields optional, no refinement)
 * Used in PUT /api/sppg/departments/[id]
 * Uses base schema to avoid Zod's "refined schemas cannot be extended" error
 */
export const departmentUpdateSchema = departmentBaseSchema.partial()

/**
 * Department response schema with computed fields
 * Used for API responses
 * Uses base schema to avoid Zod's "refined schemas cannot be extended" error
 */
export const departmentResponseSchema = departmentBaseSchema.extend({
  id: z.string().cuid(),
  sppgId: z.string().cuid(),
  currentEmployees: z.number().int().nonnegative().default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
})

/**
 * Hierarchical department tree node
 * Type annotation for recursive schema
 */
type TreeNodeType = {
  id: string
  departmentCode: string
  departmentName: string
  currentEmployees: number
  maxEmployees: number | null
  isActive: boolean
  children: TreeNodeType[]
}

export const departmentTreeNodeSchema: z.ZodType<TreeNodeType> = z.object({
  id: z.string().cuid(),
  departmentCode: z.string(),
  departmentName: z.string(),
  currentEmployees: z.number(),
  maxEmployees: z.number().nullable(),
  isActive: z.boolean(),
  children: z.lazy(() => z.array(departmentTreeNodeSchema)),
})

/**
 * Type exports for TypeScript
 */
export type DepartmentFilters = z.infer<typeof departmentFiltersSchema>
export type DepartmentInput = z.infer<typeof departmentSchema>
export type DepartmentUpdate = z.infer<typeof departmentUpdateSchema>
export type DepartmentResponse = z.infer<typeof departmentResponseSchema>
export type DepartmentTreeNode = z.infer<typeof departmentTreeNodeSchema>
