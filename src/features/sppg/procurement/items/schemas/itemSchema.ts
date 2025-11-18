/**
 * @fileoverview Procurement Item Validation Schemas
 * @version Zod validation with Prisma integration
 * @author Bagizi-ID Development Team
 */

import { z } from 'zod'
import { InventoryCategory } from '@prisma/client'

// ============================================================================
// Create Item Schema
// ============================================================================

export const createItemSchema = z.object({
  inventoryItemId: z.string().cuid('Invalid inventory item ID'),
  
  orderedQuantity: z
    .number()
    .positive('Ordered quantity must be positive')
    .max(100000, 'Ordered quantity too large'),
  
  pricePerUnit: z
    .number()
    .nonnegative('Price must be non-negative')
    .max(100000000, 'Price too large'),
  
  discountPercent: z
    .number()
    .min(0, 'Discount cannot be negative')
    .max(100, 'Discount cannot exceed 100%')
    .optional()
    .default(0),
  
  qualityStandard: z
    .string()
    .max(200, 'Quality standard too long')
    .optional(),
  
  gradeRequested: z
    .string()
    .max(50, 'Grade too long')
    .optional(),
  
  expiryDate: z
    .string()
    .or(z.date())
    .optional()
    .transform((val) => val ? (typeof val === 'string' ? new Date(val) : val) : undefined),
  
  storageRequirement: z
    .string()
    .max(500, 'Storage requirement too long')
    .optional(),
  
  notes: z
    .string()
    .max(2000, 'Notes too long')
    .optional(),
})

export type CreateItemInput = z.infer<typeof createItemSchema>

// ============================================================================
// Update Item Schema (Receiving/QC)
// ============================================================================

export const updateItemSchema = z.object({
  receivedQuantity: z
    .number()
    .nonnegative('Received quantity cannot be negative')
    .max(100000, 'Received quantity too large')
    .optional(),
  
  qualityReceived: z
    .string()
    .max(200, 'Quality received description too long')
    .optional(),
  
  gradeReceived: z
    .string()
    .max(50, 'Grade too long')
    .optional(),
  
  isAccepted: z
    .boolean()
    .optional(),
  
  rejectionReason: z
    .string()
    .max(1000, 'Rejection reason too long')
    .optional(),
  
  returnedQuantity: z
    .number()
    .nonnegative('Returned quantity cannot be negative')
    .max(100000, 'Returned quantity too large')
    .optional()
    .default(0),
  
  batchNumber: z
    .string()
    .max(100, 'Batch number too long')
    .optional(),
  
  productionDate: z
    .string()
    .or(z.date())
    .optional()
    .transform((val) => val ? (typeof val === 'string' ? new Date(val) : val) : undefined),
  
  notes: z
    .string()
    .max(2000, 'Notes too long')
    .optional(),
})

export type UpdateItemInput = z.infer<typeof updateItemSchema>

// ============================================================================
// Bulk Update Schema
// ============================================================================

export const bulkReceiveItemsSchema = z.object({
  items: z.array(
    z.object({
      itemId: z.string().cuid('Invalid item ID'),
      receivedQuantity: z.number().nonnegative(),
      isAccepted: z.boolean(),
      qualityReceived: z.string().optional(),
      gradeReceived: z.string().optional(),
      rejectionReason: z.string().optional(),
    })
  ).min(1, 'At least one item required'),
})

export type BulkReceiveItemsInput = z.infer<typeof bulkReceiveItemsSchema>

// ============================================================================
// Filter Schema
// ============================================================================

export const itemFilterSchema = z.object({
  category: z.nativeEnum(InventoryCategory).optional(),
  isAccepted: z
    .string()
    .optional()
    .nullable()
    .transform((val) => {
      if (!val || val === 'null' || val === 'undefined') return undefined
      return val === 'true' ? true : val === 'false' ? false : undefined
    }),
  hasQualityIssues: z
    .string()
    .optional()
    .nullable()
    .transform((val) => {
      if (!val || val === 'null' || val === 'undefined') return undefined
      return val === 'true'
    }),
  search: z.string().optional().nullable(),
})

export type ItemFilterInput = z.infer<typeof itemFilterSchema>
