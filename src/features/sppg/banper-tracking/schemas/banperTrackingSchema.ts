/**
 * @fileoverview Banper Tracking Validation Schemas
 * @version Next.js 15.5.4 / Zod Validation
 * @author Bagizi-ID Development Team
 */

import { z } from 'zod'
import { BgnRequestStatus } from '@prisma/client'

/**
 * Schema for creating new BANPER request
 * Required fields for initial submission
 */
export const createBanperRequestSchema = z.object({
  // Link to program (optional - can create standalone request)
  programId: z.string().cuid().optional().nullable(),
  
  // Budget request details (REQUIRED)
  requestedAmount: z.number()
    .min(1000000, 'Jumlah minimal Rp 1.000.000')
    .max(100000000000, 'Jumlah maksimal Rp 100 Miliar'),
  
  operationalPeriod: z.string()
    .min(3, 'Periode operasional harus diisi')
    .max(100, 'Periode operasional terlalu panjang'),
  
  totalBeneficiaries: z.number()
    .int('Jumlah penerima harus bilangan bulat')
    .min(1, 'Minimal 1 penerima manfaat')
    .max(1000000, 'Maksimal 1 juta penerima manfaat'),
  
  // Cost breakdown (REQUIRED for proposal)
  foodCostTotal: z.number()
    .min(0, 'Biaya makanan tidak boleh negatif'),
  
  operationalCost: z.number()
    .min(0, 'Biaya operasional tidak boleh negatif'),
  
  transportCost: z.number()
    .min(0, 'Biaya transportasi tidak boleh negatif')
    .optional()
    .nullable(),
  
  utilityCost: z.number()
    .min(0, 'Biaya utilitas tidak boleh negatif')
    .optional()
    .nullable(),
  
  staffCost: z.number()
    .min(0, 'Biaya tenaga kerja tidak boleh negatif')
    .optional()
    .nullable(),
  
  otherCosts: z.number()
    .min(0, 'Biaya lainnya tidak boleh negatif')
    .optional()
    .nullable(),
  
  dailyBudgetPerBeneficiary: z.number()
    .min(0, 'Anggaran harian tidak boleh negatif')
    .optional()
    .nullable(),
  
  operationalDays: z.number()
    .int('Hari operasional harus bilangan bulat')
    .min(1, 'Minimal 1 hari operasional')
    .max(365, 'Maksimal 365 hari operasional')
    .default(12)
    .optional(),
  
  // Beneficiary breakdown (optional JSON)
  beneficiaryBreakdown: z.any().optional().nullable(),
  
  // BGN Portal info (optional - filled after submission to BGN)
  bgnRequestNumber: z.string()
    .max(100, 'Nomor request terlalu panjang')
    .optional()
    .nullable(),
  
  bgnPortalUrl: z.string()
    .url('Format URL tidak valid')
    .optional()
    .nullable(),
  
  bgnSubmissionDate: z.date()
    .optional()
    .nullable(),
  
  // Documents (optional - can upload later)
  proposalDocumentUrl: z.string()
    .url('Format URL dokumen proposal tidak valid')
    .optional()
    .nullable(),
  
  rabDocumentUrl: z.string()
    .url('Format URL dokumen RAB tidak valid')
    .optional()
    .nullable(),
  
  supportingDocuments: z.array(z.string().url())
    .default([])
    .optional(),
  
  // Notes
  internalNotes: z.string()
    .max(2000, 'Catatan internal maksimal 2000 karakter')
    .optional()
    .nullable(),
  
  // Status (default DRAFT_LOCAL)
  bgnStatus: z.nativeEnum(BgnRequestStatus)
    .default(BgnRequestStatus.DRAFT_LOCAL)
    .optional(),
}).refine(
  (data) => {
    // Validate: Total breakdown should match requestedAmount (within 1% tolerance)
    const breakdown = 
      data.foodCostTotal +
      data.operationalCost +
      (data.transportCost ?? 0) +
      (data.utilityCost ?? 0) +
      (data.staffCost ?? 0) +
      (data.otherCosts ?? 0)
    
    const tolerance = data.requestedAmount * 0.01 // 1% tolerance
    const difference = Math.abs(breakdown - data.requestedAmount)
    
    return difference <= tolerance
  },
  {
    message: 'Total rincian biaya harus sama dengan jumlah yang diminta (toleransi 1%)',
    path: ['requestedAmount'],
  }
)

/**
 * Schema for updating BANPER request
 * All fields optional for partial updates
 */
export const updateBanperRequestSchema = createBanperRequestSchema.partial().extend({
  // BGN Status update fields (filled by admin after checking BGN portal)
  lastStatusUpdate: z.date().optional().nullable(),
  lastCheckedAt: z.date().optional().nullable(),
  
  // Disbursement info (filled when funds received)
  disbursedAmount: z.number()
    .min(0, 'Jumlah pencairan tidak boleh negatif')
    .optional()
    .nullable(),
  
  disbursedDate: z.date()
    .optional()
    .nullable(),
  
  bankReferenceNumber: z.string()
    .max(100, 'Nomor referensi bank terlalu panjang')
    .optional()
    .nullable(),
  
  bankAccountReceived: z.string()
    .max(50, 'Nomor rekening terlalu panjang')
    .optional()
    .nullable(),
  
  // BGN Approval info (reference from BGN portal/email)
  bgnApprovalNumber: z.string()
    .max(100, 'Nomor SK terlalu panjang')
    .optional()
    .nullable(),
  
  bgnApprovalDate: z.date()
    .optional()
    .nullable(),
  
  bgnApprovedByName: z.string()
    .max(200, 'Nama pejabat terlalu panjang')
    .optional()
    .nullable(),
  
  bgnApprovedByPosition: z.string()
    .max(200, 'Jabatan terlalu panjang')
    .optional()
    .nullable(),
  
  bgnApprovalDocumentUrl: z.string()
    .url('Format URL dokumen SK tidak valid')
    .optional()
    .nullable(),
  
  // BGN Review notes
  bgnReviewNotes: z.string()
    .max(2000, 'Catatan review maksimal 2000 karakter')
    .optional()
    .nullable(),
  
  bgnRejectionReason: z.string()
    .max(2000, 'Alasan penolakan maksimal 2000 karakter')
    .optional()
    .nullable(),
})

/**
 * Schema for submitting BANPER to BGN Portal
 * Requires complete budget breakdown and documents
 */
export const submitToBgnSchema = z.object({
  bgnRequestNumber: z.string()
    .min(5, 'Nomor request BGN harus diisi')
    .max(100, 'Nomor request terlalu panjang'),
  
  bgnPortalUrl: z.string()
    .url('Format URL portal BGN tidak valid'),
  
  bgnSubmissionDate: z.date(),
  
  // Require documents for submission
  proposalDocumentUrl: z.string()
    .url('Dokumen proposal harus di-upload')
    .min(1, 'Dokumen proposal harus di-upload'),
  
  rabDocumentUrl: z.string()
    .url('Dokumen RAB harus di-upload')
    .min(1, 'Dokumen RAB harus di-upload'),
})

/**
 * Schema for recording disbursement
 * Requires bank reference and amount
 */
export const recordDisbursementSchema = z.object({
  disbursedAmount: z.number()
    .min(1, 'Jumlah pencairan harus lebih dari 0'),
  
  disbursedDate: z.date(),
  
  bankReferenceNumber: z.string()
    .min(5, 'Nomor referensi bank harus diisi')
    .max(100, 'Nomor referensi terlalu panjang'),
  
  bankAccountReceived: z.string()
    .min(5, 'Nomor rekening harus diisi')
    .max(50, 'Nomor rekening terlalu panjang'),
})

// Type exports
export type CreateBanperRequestInput = z.infer<typeof createBanperRequestSchema>
export type UpdateBanperRequestInput = z.infer<typeof updateBanperRequestSchema>
export type SubmitToBgnInput = z.infer<typeof submitToBgnSchema>
export type RecordDisbursementInput = z.infer<typeof recordDisbursementSchema>
