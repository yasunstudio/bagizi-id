/**
 * @fileoverview Zod Validation Schemas for Banper Request Tracking
 * @version Next.js 15.5.4 / Zod 3.24.1
 * @author Bagizi-ID Development Team
 */

import { z } from 'zod'
import {
  BgnRequestStatus,
  BudgetSource,
  BudgetAllocationStatus,
  BudgetTransactionCategory,
} from '@prisma/client'

// Enum Schemas
export const bgnRequestStatusSchema = z.nativeEnum(BgnRequestStatus)
export const budgetSourceSchema = z.nativeEnum(BudgetSource)
export const budgetAllocationStatusSchema = z.nativeEnum(BudgetAllocationStatus)
export const budgetTransactionCategorySchema = z.nativeEnum(BudgetTransactionCategory)

// Banper Request Tracking Schemas
export const banperRequestTrackingCreateSchema = z.object({
  programId: z.string().cuid().optional().nullable(),
  requestedAmount: z.number().positive('Jumlah anggaran harus positif'),
  operationalPeriod: z.string().min(1, 'Periode operasional wajib diisi'),
  totalBeneficiaries: z.number().int().positive('Jumlah penerima manfaat harus positif'),
  beneficiaryBreakdown: z.record(z.string(), z.unknown()).optional().nullable(),
  foodCostTotal: z.number().nonnegative('Biaya makanan tidak boleh negatif'),
  operationalCost: z.number().nonnegative('Biaya operasional tidak boleh negatif'),
  transportCost: z.number().nonnegative().optional().nullable(),
  utilityCost: z.number().nonnegative().optional().nullable(),
  staffCost: z.number().nonnegative().optional().nullable(),
  otherCosts: z.number().nonnegative().optional().nullable(),
  dailyBudgetPerBeneficiary: z.number().positive().optional().nullable(),
  operationalDays: z.number().int().positive().optional().nullable(),
  proposalDocumentUrl: z.string().url().optional().nullable(),
  rabDocumentUrl: z.string().url().optional().nullable(),
  supportingDocuments: z.array(z.string().url()).optional().default([]),
  internalNotes: z.string().max(2000).optional().nullable(),
})

export const banperRequestTrackingSubmitSchema = z.object({
  bgnRequestNumber: z.string().min(1, 'Nomor permohonan BGN wajib diisi'),
  bgnPortalUrl: z.string().url().optional().nullable(),
  bgnSubmissionDate: z.coerce.date(),
})

export const banperRequestTrackingApprovalSchema = z.object({
  bgnApprovalNumber: z.string().min(1),
  bgnApprovalDate: z.coerce.date(),
  bgnApprovedByName: z.string().min(1),
  bgnApprovedByPosition: z.string().min(1),
  bgnApprovalDocumentUrl: z.string().url().optional().nullable(),
})

export const banperRequestTrackingDisbursementSchema = z.object({
  disbursedAmount: z.number().positive(),
  disbursedDate: z.coerce.date(),
  bankReferenceNumber: z.string().min(1),
  bankAccountReceived: z.string().min(1),
})

export const banperRequestTrackingUpdateSchema = banperRequestTrackingCreateSchema.partial()

// Program Budget Allocation Schemas
export const programBudgetAllocationCreateSchema = z.object({
  programId: z.string().cuid(),
  source: budgetSourceSchema,
  banperTrackingId: z.string().cuid().optional().nullable(),
  allocatedAmount: z.number().positive(),
  allocatedDate: z.coerce.date(),
  fiscalYear: z.number().int().min(2020).max(2100),
  decreeNumber: z.string().min(1).optional().nullable(),
  decreeDate: z.coerce.date().optional().nullable(),
  decreeUrl: z.string().url().optional().nullable(),
  dpaNumber: z.string().min(1).optional().nullable(),
  dpaDate: z.coerce.date().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
})

export const programBudgetAllocationUpdateSchema = programBudgetAllocationCreateSchema
  .omit({ programId: true, allocatedAmount: true })
  .partial()
  .extend({ status: budgetAllocationStatusSchema.optional() })

// Budget Transaction Schemas
export const budgetTransactionCreateSchema = z.object({
  allocationId: z.string().cuid(),
  programId: z.string().cuid(),
  category: budgetTransactionCategorySchema,
  amount: z.number().positive(),
  transactionDate: z.coerce.date(),
  description: z.string().min(1).max(500),
  procurementId: z.string().cuid().optional().nullable(),
  productionId: z.string().cuid().optional().nullable(),
  distributionId: z.string().cuid().optional().nullable(),
  receiptNumber: z.string().min(1).optional().nullable(),
  receiptUrl: z.string().url().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
})

export const budgetTransactionUpdateSchema = budgetTransactionCreateSchema
  .omit({ allocationId: true, programId: true })
  .partial()

// Type Exports
export type BanperRequestTrackingCreateInput = z.infer<typeof banperRequestTrackingCreateSchema>
export type BanperRequestTrackingSubmitInput = z.infer<typeof banperRequestTrackingSubmitSchema>
export type BanperRequestTrackingApprovalInput = z.infer<typeof banperRequestTrackingApprovalSchema>
export type BanperRequestTrackingDisbursementInput = z.infer<typeof banperRequestTrackingDisbursementSchema>
export type BanperRequestTrackingUpdateInput = z.infer<typeof banperRequestTrackingUpdateSchema>
export type ProgramBudgetAllocationCreateInput = z.infer<typeof programBudgetAllocationCreateSchema>
export type ProgramBudgetAllocationUpdateInput = z.infer<typeof programBudgetAllocationUpdateSchema>
export type BudgetTransactionCreateInput = z.infer<typeof budgetTransactionCreateSchema>
export type BudgetTransactionUpdateInput = z.infer<typeof budgetTransactionUpdateSchema>