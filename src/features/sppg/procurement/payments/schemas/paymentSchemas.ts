/**
 * @fileoverview Payment Validation Schemas - Enterprise-grade Zod schemas
 * @version Next.js 15.5.4 / Zod 3.x / TypeScript 5.7.2
 * @author Bagizi-ID Development Team
 * @see {@link /docs/PROCUREMENT_ENTERPRISE_AUDIT_COMPLETE.md} Audit Documentation
 * 
 * VALIDATION STRATEGY:
 * - Form validation with user-friendly error messages (Indonesian)
 * - Server-side validation for security
 * - Type inference for TypeScript integration
 * - Reusable validation rules
 */

import { z } from 'zod'

// ================================ ENUM SCHEMAS ================================

/**
 * Payment status enum schema
 */
export const paymentStatusSchema = z.enum([
  'UNPAID',
  'PARTIALLY_PAID',
  'PAID',
  'OVERDUE',
  'CANCELLED',
])

/**
 * Payment method enum schema
 */
export const paymentMethodSchema = z.enum([
  'BANK_TRANSFER',
  'CASH',
  'CREDIT_CARD',
  'DEBIT_CARD',
  'CHECK',
  'OTHER',
])

/**
 * Payment term type enum schema
 */
export const paymentTermTypeSchema = z.enum([
  'IMMEDIATE',
  'NET_7',
  'NET_14',
  'NET_30',
  'NET_60',
  'NET_90',
  'CUSTOM',
])

/**
 * Aging category enum schema
 */
export const agingCategorySchema = z.enum([
  'CURRENT',
  'DAYS_31_60',
  'DAYS_61_90',
  'OVER_90',
])

// ================================ FORM SCHEMAS ================================

/**
 * Payment transaction create schema
 * For recording new payment
 */
export const paymentTransactionCreateSchema = z.object({
  procurementId: z.string().cuid('Invalid procurement ID'),
  
  paymentDate: z.string()
    .min(1, 'Tanggal pembayaran wajib diisi')
    .refine((val) => !isNaN(Date.parse(val)), 'Format tanggal tidak valid'),
  
  paymentMethod: paymentMethodSchema,
  
  amount: z.number()
    .positive('Jumlah pembayaran harus lebih dari 0')
    .max(1000000000, 'Jumlah pembayaran terlalu besar'),
  
  referenceNumber: z.string()
    .max(100, 'Nomor referensi maksimal 100 karakter')
    .transform(val => val === '' ? undefined : val)
    .optional(),
  
  bankName: z.string()
    .max(100, 'Nama bank maksimal 100 karakter')
    .transform(val => val === '' ? undefined : val)
    .optional(),
  
  accountNumber: z.string()
    .max(50, 'Nomor rekening maksimal 50 karakter')
    .transform(val => val === '' ? undefined : val)
    .optional(),
  
  receiptUrl: z.string()
    .url('URL bukti pembayaran tidak valid')
    .or(z.literal(''))
    .transform(val => val === '' ? undefined : val)
    .optional(),
  
  notes: z.string()
    .max(1000, 'Catatan maksimal 1000 karakter')
    .transform(val => val === '' ? undefined : val)
    .optional(),
}).refine(
  (data) => {
    // If payment method is BANK_TRANSFER, bank name should be provided
    if (data.paymentMethod === 'BANK_TRANSFER' && !data.bankName) {
      return false
    }
    return true
  },
  {
    message: 'Nama bank wajib diisi untuk metode transfer bank',
    path: ['bankName'],
  }
)

/**
 * Payment transaction update schema
 * For updating existing payment
 */
export const paymentTransactionUpdateSchema = paymentTransactionCreateSchema.partial().omit({
  procurementId: true,
})

/**
 * Payment reconciliation schema
 * For marking payment as reconciled
 */
export const paymentReconciliationSchema = z.object({
  procurementId: z.string().cuid('Invalid procurement ID'),
  
  reconciledAmount: z.number()
    .positive('Jumlah rekonsiliasi harus lebih dari 0')
    .max(1000000000, 'Jumlah terlalu besar'),
  
  reconciledBy: z.string()
    .cuid('Invalid user ID'),
  
  reconciledAt: z.string()
    .min(1, 'Tanggal rekonsiliasi wajib diisi')
    .refine((val) => !isNaN(Date.parse(val)), 'Format tanggal tidak valid'),
  
  reconciliationNotes: z.string()
    .max(1000, 'Catatan rekonsiliasi maksimal 1000 karakter')
    .optional(),
})

// ================================ FILTER SCHEMAS ================================

/**
 * Payment filters schema
 * For list queries with validation
 */
export const paymentFiltersSchema = z.object({
  // Search
  search: z.string()
    .max(200, 'Search query terlalu panjang')
    .optional(),
  
  // Status filters
  paymentStatus: z.array(paymentStatusSchema)
    .optional(),
  
  // Date filters
  dateFrom: z.string()
    .refine((val) => !val || !isNaN(Date.parse(val)), 'Format tanggal tidak valid')
    .optional(),
  
  dateTo: z.string()
    .refine((val) => !val || !isNaN(Date.parse(val)), 'Format tanggal tidak valid')
    .optional(),
  
  dueDateFrom: z.string()
    .refine((val) => !val || !isNaN(Date.parse(val)), 'Format tanggal tidak valid')
    .optional(),
  
  dueDateTo: z.string()
    .refine((val) => !val || !isNaN(Date.parse(val)), 'Format tanggal tidak valid')
    .optional(),
  
  // Supplier filter
  supplierId: z.string()
    .cuid('Invalid supplier ID')
    .optional(),
  
  // Amount filters
  minAmount: z.number()
    .nonnegative('Jumlah minimal tidak boleh negatif')
    .optional(),
  
  maxAmount: z.number()
    .positive('Jumlah maksimal harus lebih dari 0')
    .optional(),
  
  // Overdue only
  overdueOnly: z.boolean()
    .optional(),
  
  // Aging category
  agingCategory: z.array(agingCategorySchema)
    .optional(),
  
  // Pagination
  page: z.number()
    .int('Page harus berupa angka bulat')
    .positive('Page harus lebih dari 0')
    .optional()
    .default(1),
  
  limit: z.number()
    .int('Limit harus berupa angka bulat')
    .positive('Limit harus lebih dari 0')
    .max(100, 'Limit maksimal 100')
    .optional()
    .default(10),
  
  sortBy: z.string()
    .optional()
    .default('procurementDate'),
  
  sortOrder: z.enum(['asc', 'desc'])
    .optional()
    .default('desc'),
}).refine(
  (data) => {
    // If both minAmount and maxAmount are provided, min should be less than max
    if (data.minAmount !== undefined && data.maxAmount !== undefined) {
      return data.minAmount <= data.maxAmount
    }
    return true
  },
  {
    message: 'Jumlah minimal harus kurang dari atau sama dengan jumlah maksimal',
    path: ['minAmount'],
  }
).refine(
  (data) => {
    // If both dateFrom and dateTo are provided, from should be before to
    if (data.dateFrom && data.dateTo) {
      return new Date(data.dateFrom) <= new Date(data.dateTo)
    }
    return true
  },
  {
    message: 'Tanggal mulai harus sebelum tanggal akhir',
    path: ['dateFrom'],
  }
)

/**
 * Aging report filters schema
 */
export const agingReportFiltersSchema = z.object({
  // Supplier filter
  supplierId: z.string()
    .cuid('Invalid supplier ID')
    .optional(),
  
  // Aging category filter
  agingCategory: agingCategorySchema
    .optional(),
  
  // Minimum amount filter
  minAmount: z.number()
    .nonnegative('Jumlah minimal tidak boleh negatif')
    .optional(),
  
  // Sort options
  sortBy: z.enum(['supplierName', 'total', 'oldest'])
    .optional()
    .default('total'),
  
  sortOrder: z.enum(['asc', 'desc'])
    .optional()
    .default('desc'),
})

// ================================ QUERY PARAMETER SCHEMAS ================================

/**
 * Payment statistics query schema
 */
export const paymentStatsQuerySchema = z.object({
  dateFrom: z.string()
    .refine((val) => !val || !isNaN(Date.parse(val)), 'Format tanggal tidak valid')
    .optional(),
  
  dateTo: z.string()
    .refine((val) => !val || !isNaN(Date.parse(val)), 'Format tanggal tidak valid')
    .optional(),
  
  supplierId: z.string()
    .cuid('Invalid supplier ID')
    .optional(),
})

// ================================ TYPE EXPORTS ================================

/**
 * Infer TypeScript types from Zod schemas
 */
export type PaymentTransactionCreateInput = z.infer<typeof paymentTransactionCreateSchema>
export type PaymentTransactionUpdateInput = z.infer<typeof paymentTransactionUpdateSchema>
export type PaymentReconciliationInput = z.infer<typeof paymentReconciliationSchema>
export type PaymentFiltersInput = z.infer<typeof paymentFiltersSchema>
export type AgingReportFiltersInput = z.infer<typeof agingReportFiltersSchema>
export type PaymentStatsQueryInput = z.infer<typeof paymentStatsQuerySchema>

// ================================ VALIDATION HELPERS ================================

/**
 * Validate payment amount against procurement total
 */
export function validatePaymentAmount(
  paymentAmount: number,
  procurementTotal: number,
  alreadyPaid: number
): { valid: boolean; error?: string } {
  const remaining = procurementTotal - alreadyPaid
  
  if (paymentAmount <= 0) {
    return {
      valid: false,
      error: 'Jumlah pembayaran harus lebih dari 0',
    }
  }
  
  if (paymentAmount > remaining) {
    return {
      valid: false,
      error: `Jumlah pembayaran melebihi sisa tagihan (Rp ${remaining.toLocaleString('id-ID')})`,
    }
  }
  
  return { valid: true }
}

/**
 * Validate payment date (should not be in future)
 */
export function validatePaymentDate(paymentDate: string): { valid: boolean; error?: string } {
  const date = new Date(paymentDate)
  const now = new Date()
  
  if (date > now) {
    return {
      valid: false,
      error: 'Tanggal pembayaran tidak boleh di masa depan',
    }
  }
  
  return { valid: true }
}

/**
 * Validate reconciliation amount
 */
export function validateReconciliationAmount(
  reconciledAmount: number,
  totalPaid: number
): { valid: boolean; error?: string } {
  if (reconciledAmount !== totalPaid) {
    return {
      valid: false,
      error: `Jumlah rekonsiliasi (Rp ${reconciledAmount.toLocaleString('id-ID')}) tidak sesuai dengan total pembayaran (Rp ${totalPaid.toLocaleString('id-ID')})`,
    }
  }
  
  return { valid: true }
}
