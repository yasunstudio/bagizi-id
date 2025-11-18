/**
 * @fileoverview Procurement Orders Zod Schemas - Enterprise-grade
 * @version Next.js 15.5.4 / Zod 3.24.1 / TypeScript 5.7.2
 * @author Bagizi-ID Development Team
 * @see {@link /docs/PROCUREMENT_WORKFLOW_GUIDE.md} Procurement Documentation
 * 
 * VALIDATION STRATEGY (Option B - Dual Type System):
 * - Form Schemas: Keep dates as strings (NO transforms) for React Hook Form
 * - API Schemas: Transform strings to Date objects for database operations
 * - Conversion happens explicitly at form submission boundary
 */

import { z } from 'zod'
import { ProcurementMethod, InventoryCategory, QualityGrade } from '@prisma/client'

// ================================ ENUMS ================================

export const orderApprovalStatusSchema = z.enum([
  'PENDING_APPROVAL',
  'APPROVED',
  'REJECTED',
  'REVISION'
])

export const orderPrioritySchema = z.enum([
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT'
])

export const deliveryUrgencySchema = z.enum([
  'STANDARD',
  'EXPRESS',
  'IMMEDIATE'
])

export const procurementMethodSchema = z.nativeEnum(ProcurementMethod)
export const inventoryCategorySchema = z.nativeEnum(InventoryCategory)
export const qualityGradeSchema = z.nativeEnum(QualityGrade)

// ================================ FORM SCHEMAS (NO TRANSFORMS - FOR REACT HOOK FORM) ================================

/**
 * Form schema for order items - keeps dates as strings for form inputs
 * Used with React Hook Form - NO transformations
 */
export const orderItemFormSchema = z.object({
  inventoryItemId: z.string()
    .optional()
    .or(z.literal('').transform(() => undefined)),
  itemName: z.string()
    .min(2, 'Nama item minimal 2 karakter')
    .max(200, 'Nama item maksimal 200 karakter'),
  itemCode: z.string()
    .max(50, 'Kode item maksimal 50 karakter')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  category: inventoryCategorySchema,
  brand: z.string()
    .max(100, 'Nama brand maksimal 100 karakter')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  orderedQuantity: z.number()
    .min(0.01, 'Jumlah pesanan harus lebih dari 0')
    .max(999999, 'Jumlah pesanan terlalu besar'),
  unit: z.string()
    .min(1, 'Satuan harus diisi')
    .max(20, 'Satuan maksimal 20 karakter'),
  pricePerUnit: z.number()
    .min(0, 'Harga per unit harus positif')
    .max(999999999, 'Harga per unit terlalu besar'),
  discountPercent: z.number()
    .min(0, 'Diskon tidak boleh negatif')
    .max(100, 'Diskon maksimal 100%')
    .default(0),
  qualityStandard: z.string()
    .max(200, 'Standar kualitas maksimal 200 karakter')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  gradeRequested: z.string()
    .max(50, 'Grade yang diminta maksimal 50 karakter')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  expiryDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  storageRequirement: z.string()
    .max(200, 'Persyaratan penyimpanan maksimal 200 karakter')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  notes: z.string()
    .max(500, 'Catatan maksimal 500 karakter')
    .optional()
    .or(z.literal('').transform(() => undefined))
})

/**
 * Form schema for creating orders - keeps dates as strings for form inputs
 * Used with React Hook Form - NO date transformations
 */
export const createOrderFormSchema = z.object({
  planId: z.string()
    .optional()
    .or(z.literal('').transform(() => undefined)),
  procurementDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
  expectedDelivery: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  supplierId: z.string()
    .min(1, 'Supplier harus dipilih'),
  supplierName: z.string()
    .max(200, 'Nama supplier maksimal 200 karakter')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  supplierContact: z.string()
    .max(100, 'Kontak supplier maksimal 100 karakter')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  purchaseMethod: procurementMethodSchema,
  paymentTerms: z.string()
    .max(500, 'Syarat pembayaran maksimal 500 karakter')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  paymentDue: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  deliveryMethod: z.string()
    .max(100, 'Metode pengiriman maksimal 100 karakter')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  transportCost: z.number()
    .min(0, 'Biaya transport harus positif')
    .max(999999999, 'Biaya transport terlalu besar')
    .optional(),
  packagingType: z.string()
    .max(100, 'Jenis kemasan maksimal 100 karakter')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  items: z.array(orderItemFormSchema)
    .min(1, 'Minimal harus ada 1 item')
    .max(100, 'Maksimal 100 item per order')
})

/**
 * Form schema for updating orders - all fields optional
 */
export const updateOrderFormSchema = createOrderFormSchema.partial().extend({
  items: z.array(orderItemFormSchema)
    .min(1, 'Minimal harus ada 1 item')
    .max(100, 'Maksimal 100 item per order')
    .optional()
})

/**
 * Form schema for order filters (list view)
 */
export const orderFiltersFormSchema = z.object({
  search: z.string().max(200, 'Pencarian maksimal 200 karakter').optional(),
  status: z.array(z.string()).optional(),
  deliveryStatus: z.array(z.string()).optional(),
  paymentStatus: z.array(z.string()).optional(),
  supplierId: z.string().cuid('Invalid supplier ID').optional(),
  planId: z.string().cuid('Invalid plan ID').optional(),
  purchaseMethod: z.array(procurementMethodSchema).optional(),
  dateFrom: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  dateTo: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  minAmount: z.number()
    .min(0, 'Jumlah minimal harus positif')
    .optional(),
  maxAmount: z.number()
    .min(0, 'Jumlah maksimal harus positif')
    .optional(),
  priority: orderPrioritySchema.optional(),
  approvalStatus: z.array(orderApprovalStatusSchema).optional()
})

// ================================ API SCHEMAS (WITH TRANSFORMS - FOR API ENDPOINTS) ================================

/**
 * API schema for order items - transforms string dates to Date objects
 * Used in API endpoints for database operations
 */
export const orderItemApiSchema = orderItemFormSchema.extend({
  expiryDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .transform((val) => new Date(val))
    .optional()
    .or(z.literal('').transform(() => undefined))
})

/**
 * API schema for creating orders - transforms string dates to Date objects
 * Used in POST /api/sppg/procurement/orders
 */
export const createOrderApiSchema = z.object({
  planId: z.string().cuid().optional(),
  procurementDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .transform((val) => new Date(val)),
  expectedDelivery: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .transform((val) => new Date(val))
    .optional()
    .or(z.literal('').transform(() => undefined)),
  supplierId: z.string().min(1),
  supplierName: z.string().max(200).optional(),
  supplierContact: z.string().max(100).optional(),
  purchaseMethod: procurementMethodSchema,
  paymentTerms: z.string().max(500).optional(),
  paymentDue: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .transform((val) => new Date(val))
    .optional()
    .or(z.literal('').transform(() => undefined)),
  deliveryMethod: z.string().max(100).optional(),
  transportCost: z.number().min(0).optional(),
  packagingType: z.string().max(100).optional(),
  items: z.array(orderItemApiSchema)
    .min(1)
    .max(100)
})

/**
 * API schema for updating orders - all fields optional
 */
export const updateOrderApiSchema = createOrderApiSchema.partial()

/**
 * API schema for order filters
 */
export const orderFiltersApiSchema = z.object({
  search: z.string().max(200).optional(),
  status: z.array(z.string()).optional(),
  deliveryStatus: z.array(z.string()).optional(),
  paymentStatus: z.array(z.string()).optional(),
  supplierId: z.string().cuid().optional(),
  planId: z.string().cuid().optional(),
  purchaseMethod: z.array(procurementMethodSchema).optional(),
  dateFrom: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .transform((val) => new Date(val))
    .optional()
    .or(z.literal('').transform(() => undefined)),
  dateTo: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .transform((val) => new Date(val))
    .optional()
    .or(z.literal('').transform(() => undefined)),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
  priority: orderPrioritySchema.optional(),
  approvalStatus: z.array(orderApprovalStatusSchema).optional()
})

// ================================ ACTION SCHEMAS ================================

/**
 * Schema for order approval
 */
export const approveOrderSchema = z.object({
  approvalNotes: z.string()
    .max(1000, 'Catatan persetujuan maksimal 1000 karakter')
    .optional(),
  expectedDelivery: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD')
    .optional()
})

/**
 * Schema for order rejection
 */
export const rejectOrderSchema = z.object({
  rejectionReason: z.string()
    .min(10, 'Alasan penolakan minimal 10 karakter')
    .max(1000, 'Alasan penolakan maksimal 1000 karakter'),
  alternativeAction: z.string()
    .max(500, 'Tindakan alternatif maksimal 500 karakter')
    .optional()
})

/**
 * Schema for order cancellation
 */
export const cancelOrderSchema = z.object({
  cancellationReason: z.string()
    .min(10, 'Alasan pembatalan minimal 10 karakter')
    .max(1000, 'Alasan pembatalan maksimal 1000 karakter'),
  refundRequired: z.boolean()
    .default(false)
})

// ================================ VALIDATION HELPERS ================================

/**
 * Validate order total calculations
 */
export const validateOrderTotals = (items: z.infer<typeof orderItemFormSchema>[]) => {
  const subtotal = items.reduce((sum, item) => {
    const itemTotal = item.orderedQuantity * item.pricePerUnit
    const discount = item.discountPercent ? (itemTotal * item.discountPercent) / 100 : 0
    return sum + (itemTotal - discount)
  }, 0)

  return {
    subtotal,
    isValid: subtotal > 0,
    itemCount: items.length
  }
}

/**
 * Validate delivery date (must be in future)
 */
export const validateDeliveryDate = (deliveryDate: string, orderDate: string) => {
  const delivery = new Date(deliveryDate)
  const order = new Date(orderDate)
  
  return {
    isValid: delivery >= order,
    message: delivery < order 
      ? 'Tanggal pengiriman tidak boleh sebelum tanggal order' 
      : undefined
  }
}

/**
 * Validate payment due date
 */
export const validatePaymentDue = (paymentDue: string, orderDate: string) => {
  const due = new Date(paymentDue)
  const order = new Date(orderDate)
  
  return {
    isValid: due >= order,
    message: due < order 
      ? 'Tanggal jatuh tempo tidak boleh sebelum tanggal order' 
      : undefined
  }
}

// ================================ TYPE EXPORTS ================================

export type CreateOrderFormInput = z.infer<typeof createOrderFormSchema>
export type UpdateOrderFormInput = z.infer<typeof updateOrderFormSchema>
export type OrderItemFormInput = z.infer<typeof orderItemFormSchema>
export type OrderFiltersFormInput = z.infer<typeof orderFiltersFormSchema>
export type ApproveOrderInput = z.infer<typeof approveOrderSchema>
export type RejectOrderInput = z.infer<typeof rejectOrderSchema>
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>

export type CreateOrderApiInput = z.infer<typeof createOrderApiSchema>
export type UpdateOrderApiInput = z.infer<typeof updateOrderApiSchema>
export type OrderItemApiInput = z.infer<typeof orderItemApiSchema>
export type OrderFiltersApiInput = z.infer<typeof orderFiltersApiSchema>
