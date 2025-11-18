/**
 * @fileoverview Receipt & Quality Control Zod Schemas
 * @version Next.js 15.5.4 / Zod / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/PROCUREMENT_WORKFLOW_GUIDE.md} Procurement Documentation
 */

import { z } from 'zod'
import { QualityGrade } from '@prisma/client'

// ================================ ENUMS ================================

export const receiptStatusSchema = z.enum([
  'PENDING',
  'IN_PROGRESS',
  'PARTIAL',
  'COMPLETED',
  'REJECTED'
])

export const qualityCheckStatusSchema = z.enum([
  'PENDING',
  'IN_PROGRESS',
  'PASSED',
  'FAILED',
  'CONDITIONAL'
])

export const acceptanceDecisionSchema = z.enum([
  'FULL_ACCEPT',
  'PARTIAL_ACCEPT',
  'CONDITIONAL_ACCEPT',
  'FULL_REJECT'
])

export const qualityGradeSchema = z.nativeEnum(QualityGrade)

// ================================ FORM SCHEMAS (NO TRANSFORMS - FOR REACT HOOK FORM) ================================

/**
 * Form schema for receipt items - keeps dates as strings for form inputs
 * Used with React Hook Form - NO transformations
 */
export const receiptItemFormSchema = z.object({
  itemId: z.string().cuid('Invalid item ID'),
  receivedQuantity: z.number()
    .min(0, 'Jumlah diterima harus positif')
    .max(999999, 'Jumlah diterima terlalu besar'),
  batchNumber: z.string()
    .max(50, 'Nomor batch maksimal 50 karakter')
    .optional(),
  expiryDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  productionDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  notes: z.string()
    .max(500, 'Catatan maksimal 500 karakter')
    .optional()
})

/**
 * Form schema for creating receipts - keeps dates as strings for form inputs
 * Used with React Hook Form - NO date transformations
 */
export const createReceiptFormSchema = z.object({
  procurementId: z.string().cuid('Invalid procurement ID'),
  receiptNumber: z.string()
    .min(3, 'Nomor tanda terima minimal 3 karakter')
    .max(50, 'Nomor tanda terima maksimal 50 karakter')
    .optional(),
  actualDelivery: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/, 'Format tanggal tidak valid'),
  deliveryMethod: z.string()
    .max(100, 'Metode pengiriman maksimal 100 karakter')
    .optional(),
  transportCost: z.number()
    .min(0, 'Biaya transport harus positif')
    .max(999999999, 'Biaya transport terlalu besar')
    .optional(),
  packagingType: z.string()
    .max(100, 'Jenis kemasan maksimal 100 karakter')
    .optional(),
  receiptPhoto: z.string()
    .url('URL foto tanda terima tidak valid')
    .optional(),
  deliveryPhoto: z.string()
    .url('URL foto pengiriman tidak valid')
    .optional(),
  invoiceNumber: z.string()
    .max(50, 'Nomor invoice maksimal 50 karakter')
    .optional(),
  items: z.array(receiptItemFormSchema)
    .min(1, 'Minimal harus ada 1 item')
    .max(100, 'Maksimal 100 item per penerimaan')
})

// ================================ API SCHEMAS (WITH TRANSFORMS - FOR API ROUTES) ================================

export const receiptItemInputSchema = z.object({
  itemId: z.string().cuid('Invalid item ID'),
  receivedQuantity: z.number()
    .min(0, 'Jumlah diterima harus positif')
    .max(999999, 'Jumlah diterima terlalu besar'),
  batchNumber: z.string()
    .max(50, 'Nomor batch maksimal 50 karakter')
    .optional(),
  expiryDate: z.string()
    .transform((val) => val ? new Date(val) : undefined)
    .refine((date) => !date || !isNaN(date.getTime()), {
      message: 'Tanggal kedaluwarsa tidak valid'
    })
    .optional(),
  productionDate: z.string()
    .transform((val) => val ? new Date(val) : undefined)
    .refine((date) => !date || !isNaN(date.getTime()), {
      message: 'Tanggal produksi tidak valid'
    })
    .optional(),
  notes: z.string()
    .max(500, 'Catatan maksimal 500 karakter')
    .optional()
})

// ================================ CREATE RECEIPT SCHEMA ================================

export const createReceiptSchema = z.object({
  procurementId: z.string().cuid('Invalid procurement ID'),
  receiptNumber: z.string()
    .min(3, 'Nomor tanda terima minimal 3 karakter')
    .max(50, 'Nomor tanda terima maksimal 50 karakter')
    .optional(),
  actualDelivery: z.string()
    .transform((val) => new Date(val))
    .refine((date) => !isNaN(date.getTime()), {
      message: 'Tanggal penerimaan tidak valid'
    }),
  deliveryMethod: z.string()
    .max(100, 'Metode pengiriman maksimal 100 karakter')
    .optional(),
  transportCost: z.number()
    .min(0, 'Biaya transport harus positif')
    .max(999999999, 'Biaya transport terlalu besar')
    .optional(),
  packagingType: z.string()
    .max(100, 'Jenis kemasan maksimal 100 karakter')
    .optional(),
  receiptPhoto: z.string()
    .url('URL foto tanda terima tidak valid')
    .optional(),
  deliveryPhoto: z.string()
    .url('URL foto pengiriman tidak valid')
    .optional(),
  invoiceNumber: z.string()
    .max(50, 'Nomor invoice maksimal 50 karakter')
    .optional(),
  items: z.array(receiptItemInputSchema)
    .min(1, 'Minimal harus ada 1 item')
    .max(100, 'Maksimal 100 item per penerimaan')
}).refine(
  (data) => {
    // Validate expiry date is after production date
    if (data.items) {
      return data.items.every(item => {
        if (item.productionDate && item.expiryDate) {
          return item.expiryDate > item.productionDate
        }
        return true
      })
    }
    return true
  },
  {
    message: 'Tanggal kadaluarsa harus setelah tanggal produksi',
    path: ['items']
  }
)

// ================================ UPDATE RECEIPT SCHEMA ================================

export const updateReceiptSchema = z.object({
  receiptNumber: z.string()
    .min(3, 'Nomor tanda terima minimal 3 karakter')
    .max(50, 'Nomor tanda terima maksimal 50 karakter')
    .optional(),
  actualDelivery: z.coerce.date().optional(),
  deliveryMethod: z.string()
    .max(100, 'Metode pengiriman maksimal 100 karakter')
    .optional(),
  transportCost: z.number()
    .min(0, 'Biaya transport harus positif')
    .max(999999999, 'Biaya transport terlalu besar')
    .optional(),
  packagingType: z.string()
    .max(100, 'Jenis kemasan maksimal 100 karakter')
    .optional(),
  receiptPhoto: z.string()
    .url('URL foto tanda terima tidak valid')
    .optional(),
  deliveryPhoto: z.string()
    .url('URL foto pengiriman tidak valid')
    .optional(),
  invoiceNumber: z.string()
    .max(50, 'Nomor invoice maksimal 50 karakter')
    .optional(),
  acceptanceStatus: z.string()
    .max(50, 'Status penerimaan maksimal 50 karakter')
    .optional(),
  rejectionReason: z.string()
    .max(500, 'Alasan penolakan maksimal 500 karakter')
    .optional()
})

// ================================ QUALITY CONTROL SCHEMAS ================================

export const qualityCheckPointSchema = z.object({
  aspect: z.string()
    .min(2, 'Aspek minimal 2 karakter')
    .max(100, 'Aspek maksimal 100 karakter'),
  standard: z.string()
    .min(2, 'Standar minimal 2 karakter')
    .max(200, 'Standar maksimal 200 karakter'),
  actual: z.string()
    .min(1, 'Kondisi aktual wajib diisi')
    .max(200, 'Kondisi aktual maksimal 200 karakter'),
  isPassed: z.boolean(),
  notes: z.string()
    .max(300, 'Catatan maksimal 300 karakter')
    .optional()
})

export const qualityItemInputSchema = z.object({
  itemId: z.string().cuid('Invalid item ID'),
  qualityReceived: z.string()
    .min(2, 'Kualitas diterima minimal 2 karakter')
    .max(100, 'Kualitas diterima maksimal 100 karakter'),
  gradeReceived: z.string()
    .min(1, 'Grade diterima minimal 1 karakter')
    .max(10, 'Grade diterima maksimal 10 karakter'),
  isAccepted: z.boolean(),
  rejectionReason: z.string()
    .max(500, 'Alasan penolakan maksimal 500 karakter')
    .optional(),
  returnedQuantity: z.number()
    .min(0, 'Jumlah dikembalikan harus positif')
    .max(999999, 'Jumlah dikembalikan terlalu besar')
    .optional()
    .default(0),
  checkPoints: z.array(qualityCheckPointSchema)
    .min(1, 'Minimal harus ada 1 poin pemeriksaan')
    .max(20, 'Maksimal 20 poin pemeriksaan')
    .optional()
}).refine(
  (data) => {
    // If rejected, must have rejection reason
    if (!data.isAccepted && !data.rejectionReason) {
      return false
    }
    return true
  },
  {
    message: 'Alasan penolakan wajib diisi jika item ditolak',
    path: ['rejectionReason']
  }
)

export const qualityControlInputSchema = z.object({
  receiptId: z.string().cuid('Invalid receipt ID'),
  inspectedBy: z.string()
    .min(3, 'Nama pemeriksa minimal 3 karakter')
    .max(100, 'Nama pemeriksa maksimal 100 karakter'),
  items: z.array(qualityItemInputSchema)
    .min(1, 'Minimal harus ada 1 item yang diperiksa')
    .max(100, 'Maksimal 100 item per pemeriksaan'),
  overallNotes: z.string()
    .max(1000, 'Catatan keseluruhan maksimal 1000 karakter')
    .optional()
})

// ================================ FILTER SCHEMAS ================================

/**
 * Form schema for receipt filters - keeps dates as strings
 * Used with React Hook Form - NO date transformations
 */
export const receiptFiltersFormSchema = z.object({
  supplierId: z.string().cuid().optional(),
  deliveryStatus: z.string().max(50).optional(),
  qualityGrade: z.union([qualityGradeSchema, z.literal('all')]).optional(),
  dateFrom: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  dateTo: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  inspectedBy: z.string().max(100).optional(),
  searchTerm: z.string().max(100).optional()
})

/**
 * API schema for receipt filters - transforms dates to Date objects
 * Used for API routes with date transformations
 */
export const receiptFiltersSchema = z.object({
  supplierId: z.string().cuid().optional(),
  deliveryStatus: z.string().max(50).optional(),
  qualityGrade: z.union([qualityGradeSchema, z.literal('all')]).optional(),
  dateFrom: z.string()
    .transform((val) => val ? new Date(val) : undefined)
    .refine((date) => !date || !isNaN(date.getTime()), {
      message: 'Tanggal mulai tidak valid'
    })
    .optional(),
  dateTo: z.string()
    .transform((val) => val ? new Date(val) : undefined)
    .refine((date) => !date || !isNaN(date.getTime()), {
      message: 'Tanggal akhir tidak valid'
    })
    .optional(),
  inspectedBy: z.string().max(100).optional(),
  searchTerm: z.string().max(100).optional()
}).refine(
  (data) => {
    // Validate date range
    if (data.dateFrom && data.dateTo) {
      return data.dateTo >= data.dateFrom
    }
    return true
  },
  {
    message: 'Tanggal akhir harus setelah tanggal awal',
    path: ['dateTo']
  }
)

export const receiptSortSchema = z.object({
  field: z.enum([
    'actualDelivery',
    'procurementCode',
    'supplierName',
    'totalAmount',
    'qualityGrade'
  ]),
  direction: z.enum(['asc', 'desc'])
})

// ================================ TYPE INFERENCE ================================

export type ReceiptItemInputSchema = z.infer<typeof receiptItemInputSchema>
export type CreateReceiptSchema = z.infer<typeof createReceiptSchema>
export type UpdateReceiptSchema = z.infer<typeof updateReceiptSchema>
export type QualityCheckPointSchema = z.infer<typeof qualityCheckPointSchema>
export type QualityItemInputSchema = z.infer<typeof qualityItemInputSchema>
export type QualityControlInputSchema = z.infer<typeof qualityControlInputSchema>
export type ReceiptFiltersSchema = z.infer<typeof receiptFiltersSchema>
export type ReceiptSortSchema = z.infer<typeof receiptSortSchema>
