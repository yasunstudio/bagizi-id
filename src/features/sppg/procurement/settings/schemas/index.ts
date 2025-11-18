/**
 * @fileoverview Procurement Settings Zod Validation Schemas
 * @version Next.js 15.5.4 / Zod 3.24.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * VALIDATION SCHEMAS:
 * - General settings validation
 * - Approval level validation
 * - Category validation
 * - Notification rule validation
 * - Payment term validation
 * - QC checklist validation
 */

import { z } from 'zod'

// ================================ GENERAL SETTINGS SCHEMA ================================

export const updateGeneralSettingsSchema = z.object({
  autoApproveThreshold: z.number().min(0).max(1000000000).optional(),
  requireQCPhotos: z.boolean().optional(),
  minQCPhotoCount: z.number().int().min(1).max(20).optional(),
  defaultPaymentTerm: z.string().min(2).max(50).optional(),
  enableWhatsappNotif: z.boolean().optional(),
  whatsappNumber: z.string().regex(/^(\+62|62|0)[0-9]{9,12}$/).nullable().optional(),
  enableEmailDigest: z.boolean().optional(),
  digestFrequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).optional(),
  budgetAlertEnabled: z.boolean().optional(),
  budgetAlertThreshold: z.number().min(0).max(100).optional(),
  accountingIntegration: z.boolean().optional(),
  inventoryAutoSync: z.boolean().optional(),
})

// ================================ APPROVAL LEVEL SCHEMA ================================

export const approvalLevelSchema = z.object({
  id: z.string().cuid().optional(),
  level: z.number().int().min(1).max(10),
  levelName: z.string().min(3, 'Level name minimum 3 characters').max(100),
  minAmount: z.number().min(0, 'Minimum amount must be >= 0'),
  maxAmount: z.number().min(0).nullable().optional(),
  requiredRole: z.string().min(2).max(50),
  isParallel: z.boolean().default(false).optional(),
  escalationDays: z.number().int().min(1).max(90).nullable().optional(),
  skipOnEmergency: z.boolean().default(false).optional(),
  isActive: z.boolean().default(true).optional(),
  sortOrder: z.number().int().min(0).default(0).optional(),
}).refine(
  (data) => {
    // If maxAmount exists, it must be greater than minAmount
    if (data.maxAmount !== null && data.maxAmount !== undefined) {
      return data.maxAmount > data.minAmount
    }
    return true
  },
  {
    message: 'maxAmount must be greater than minAmount',
    path: ['maxAmount'],
  }
)

// ================================ CATEGORY SCHEMA ================================

export const categorySchema = z.object({
  id: z.string().cuid().optional(),
  code: z.string()
    .min(2, 'Code minimum 2 characters')
    .max(50)
    .regex(/^[A-Z0-9_]+$/, 'Code must be uppercase letters, numbers, and underscores only'),
  name: z.string().min(3, 'Name minimum 3 characters').max(150),
  description: z.string().max(500).nullable().optional(),
  icon: z.string().max(50).nullable().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable().optional(),
  monthlyBudget: z.number().min(0).nullable().optional(),
  yearlyBudget: z.number().min(0).nullable().optional(),
  budgetAllocPct: z.number().min(0).max(100).nullable().optional(),
  requiresApproval: z.boolean().default(true).optional(),
  minApprovalAmount: z.number().min(0).nullable().optional(),
  customApprover: z.string().max(50).nullable().optional(),
  isActive: z.boolean().default(true).optional(),
  sortOrder: z.number().int().min(0).default(0).optional(),
})

// ================================ NOTIFICATION RULE SCHEMA ================================

export const notificationRuleSchema = z.object({
  id: z.string().cuid().optional(),
  eventType: z.string().min(2).max(100),
  eventName: z.string().min(3, 'Event name minimum 3 characters').max(150),
  description: z.string().max(500).nullable().optional(),
  channel: z.enum(['EMAIL', 'WHATSAPP', 'PUSH', 'SMS']),
  recipientRoles: z.array(z.string()).default([]).optional(),
  recipientEmails: z.array(z.string().email()).default([]).optional(),
  recipientPhones: z.array(z.string().regex(/^(\+62|62|0)[0-9]{9,12}$/)).default([]).optional(),
  template: z.string().nullable().optional(),
  delayMinutes: z.number().int().min(0).max(1440).default(0).optional(), // Max 24 hours
  retryOnFailure: z.boolean().default(true).optional(),
  maxRetries: z.number().int().min(0).max(10).default(3).optional(),
  conditionField: z.string().max(100).nullable().optional(),
  conditionOperator: z.enum(['>', '<', '>=', '<=', '==', '!=', 'contains', 'not_contains']).nullable().optional(),
  conditionValue: z.string().max(255).nullable().optional(),
  isEnabled: z.boolean().default(true).optional(),
  priority: z.number().int().min(1).max(10).default(5).optional(),
})

// ================================ PAYMENT TERM SCHEMA ================================

export const paymentTermSchema = z.object({
  id: z.string().cuid().optional(),
  code: z.string()
    .min(2, 'Code minimum 2 characters')
    .max(50)
    .regex(/^[A-Z0-9_]+$/, 'Code must be uppercase letters, numbers, and underscores only'),
  name: z.string().min(3, 'Name minimum 3 characters').max(100),
  description: z.string().max(500).nullable().optional(),
  dueDays: z.number().int().min(0, 'Due days must be >= 0').max(365),
  requireDP: z.boolean().default(false).optional(),
  dpPercentage: z.number().min(0).max(100).nullable().optional(),
  dpDueDays: z.number().int().min(0).max(90).nullable().optional(),
  allowLatePayment: z.boolean().default(true).optional(),
  lateFeeEnabled: z.boolean().default(false).optional(),
  lateFeePerDay: z.number().min(0).max(10).nullable().optional(), // Max 10% per day
  maxLateFee: z.number().min(0).nullable().optional(),
  autoRemindDays: z.number().int().min(1).max(30).nullable().optional(),
  autoEscalateDays: z.number().int().min(1).max(90).nullable().optional(),
  isDefault: z.boolean().default(false).optional(),
  isActive: z.boolean().default(true).optional(),
  sortOrder: z.number().int().min(0).default(0).optional(),
}).refine(
  (data) => {
    // If requireDP is true, dpPercentage must be provided
    if (data.requireDP && !data.dpPercentage) {
      return false
    }
    return true
  },
  {
    message: 'dpPercentage is required when requireDP is true',
    path: ['dpPercentage'],
  }
)

// ================================ QC CHECKLIST SCHEMA ================================

export const qcCheckItemSchema = z.object({
  item: z.string().min(2, 'Item minimum 2 characters').max(150),
  criteria: z.string().min(2, 'Criteria minimum 2 characters').max(300),
  weight: z.number().min(0).max(100),
  isMandatory: z.boolean(),
  acceptableRange: z.string().max(100).optional(),
  rejectionReason: z.string().max(300).optional(),
})

export const qcChecklistSchema = z.object({
  id: z.string().cuid().optional(),
  code: z.string()
    .min(2, 'Code minimum 2 characters')
    .max(50)
    .regex(/^[A-Z0-9_]+$/, 'Code must be uppercase letters, numbers, and underscores only'),
  name: z.string().min(3, 'Name minimum 3 characters').max(150),
  description: z.string().max(500).nullable().optional(),
  category: z.string().max(100).nullable().optional(),
  checkItems: z.array(qcCheckItemSchema).min(1, 'At least 1 check item required'),
  passThreshold: z.number().min(0).max(100).default(80).optional(),
  requirePhotos: z.boolean().default(true).optional(),
  minPhotos: z.number().int().min(0).max(20).default(3).optional(),
  maxPhotos: z.number().int().min(1).max(50).default(10).optional(),
  requireSignature: z.boolean().default(true).optional(),
  samplingEnabled: z.boolean().default(false).optional(),
  samplingPct: z.number().min(0).max(100).nullable().optional(),
  minSampleSize: z.number().int().min(1).nullable().optional(),
  autoRejectBelow: z.number().min(0).max(100).nullable().optional(),
  autoApproveAbove: z.number().min(0).max(100).nullable().optional(),
  isActive: z.boolean().default(true).optional(),
  sortOrder: z.number().int().min(0).default(0).optional(),
}).refine(
  (data) => {
    // Check if total weight of check items equals 100
    const totalWeight = data.checkItems.reduce((sum, item) => sum + item.weight, 0)
    return Math.abs(totalWeight - 100) < 0.01 // Allow small floating point errors
  },
  {
    message: 'Total weight of check items must equal 100',
    path: ['checkItems'],
  }
).refine(
  (data) => {
    // minPhotos must be <= maxPhotos
    if (data.requirePhotos && data.minPhotos && data.maxPhotos) {
      return data.minPhotos <= data.maxPhotos
    }
    return true
  },
  {
    message: 'minPhotos must be less than or equal to maxPhotos',
    path: ['minPhotos'],
  }
)

// ================================ COMPLETE UPDATE SCHEMA ================================

export const updateSettingsSchema = z.object({
  general: updateGeneralSettingsSchema.optional(),
  approvalLevels: z.array(approvalLevelSchema).optional(),
  categories: z.array(categorySchema).optional(),
  notificationRules: z.array(notificationRuleSchema).optional(),
  paymentTerms: z.array(paymentTermSchema).optional(),
  qcChecklists: z.array(qcChecklistSchema).optional(),
})

// ================================ EXPORT TYPES ================================

export type UpdateGeneralSettingsInput = z.infer<typeof updateGeneralSettingsSchema>
export type ApprovalLevelInput = z.infer<typeof approvalLevelSchema>
export type CategoryInput = z.infer<typeof categorySchema>
export type NotificationRuleInput = z.infer<typeof notificationRuleSchema>
export type PaymentTermInput = z.infer<typeof paymentTermSchema>
export type QCChecklistInput = z.infer<typeof qcChecklistSchema>
export type QCCheckItemInput = z.infer<typeof qcCheckItemSchema>
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>
