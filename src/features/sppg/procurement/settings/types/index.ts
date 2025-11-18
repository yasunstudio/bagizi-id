/**
 * @fileoverview Procurement Settings TypeScript Types
 * @version Next.js 15.5.4 / Prisma 6.18.0
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * TYPE DEFINITIONS:
 * - ProcurementSettings: Main settings entity
 * - ApprovalLevel: Multi-level approval workflow
 * - ProcurementCategory: Custom categories
 * - NotificationRule: Event-based notifications
 * - PaymentTerm: Payment configurations
 * - QCChecklist: Quality control templates
 */

import type {
  ProcurementSettings as PrismaProcurementSettings,
  ProcurementApprovalLevel,
  ProcurementCategory,
  ProcurementNotificationRule,
  ProcurementPaymentTerm,
  ProcurementQCChecklist,
} from '@prisma/client'

// ================================ MAIN SETTINGS TYPE ================================

/**
 * Full procurement settings with all relations
 */
export interface ProcurementSettingsDetail extends PrismaProcurementSettings {
  approvalLevels: ProcurementApprovalLevel[]
  customCategories: ProcurementCategory[]
  notificationRules: ProcurementNotificationRule[]
  paymentTerms: ProcurementPaymentTerm[]
  qcChecklists: ProcurementQCChecklist[]
}

/**
 * Settings summary without relations (for listings)
 */
export type ProcurementSettingsSummary = PrismaProcurementSettings

// ================================ REQUEST/RESPONSE TYPES ================================

/**
 * Request to update general settings
 */
export interface UpdateGeneralSettingsRequest {
  autoApproveThreshold?: number
  requireQCPhotos?: boolean
  minQCPhotoCount?: number
  defaultPaymentTerm?: string
  enableWhatsappNotif?: boolean
  whatsappNumber?: string | null
  enableEmailDigest?: boolean
  digestFrequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY'
  budgetAlertEnabled?: boolean
  budgetAlertThreshold?: number
  accountingIntegration?: boolean
  inventoryAutoSync?: boolean
}

/**
 * Request to create/update approval level
 */
export interface ApprovalLevelInput {
  id?: string
  level: number
  levelName: string
  minAmount: number
  maxAmount?: number | null
  requiredRole: string
  isParallel?: boolean
  escalationDays?: number | null
  skipOnEmergency?: boolean
  isActive?: boolean
  sortOrder?: number
}

/**
 * Request to create/update category
 */
export interface CategoryInput {
  id?: string
  code: string
  name: string
  description?: string | null
  icon?: string | null
  color?: string | null
  monthlyBudget?: number | null
  yearlyBudget?: number | null
  budgetAllocPct?: number | null
  requiresApproval?: boolean
  minApprovalAmount?: number | null
  customApprover?: string | null
  isActive?: boolean
  sortOrder?: number
}

/**
 * Request to create/update notification rule
 */
export interface NotificationRuleInput {
  id?: string
  eventType: string
  eventName: string
  description?: string | null
  channel: string
  recipientRoles?: string[]
  recipientEmails?: string[]
  recipientPhones?: string[]
  template?: string | null
  delayMinutes?: number
  retryOnFailure?: boolean
  maxRetries?: number
  conditionField?: string | null
  conditionOperator?: string | null
  conditionValue?: string | null
  isEnabled?: boolean
  priority?: number
}

/**
 * Request to create/update payment term
 */
export interface PaymentTermInput {
  id?: string
  code: string
  name: string
  description?: string | null
  dueDays: number
  requireDP?: boolean
  dpPercentage?: number | null
  dpDueDays?: number | null
  allowLatePayment?: boolean
  lateFeeEnabled?: boolean
  lateFeePerDay?: number | null
  maxLateFee?: number | null
  autoRemindDays?: number | null
  autoEscalateDays?: number | null
  isDefault?: boolean
  isActive?: boolean
  sortOrder?: number
}

/**
 * Quality Control check item structure
 */
export interface QCCheckItem {
  item: string
  criteria: string
  weight: number
  isMandatory: boolean
  acceptableRange?: string
  rejectionReason?: string
}

/**
 * Request to create/update QC checklist
 */
export interface QCChecklistInput {
  id?: string
  code: string
  name: string
  description?: string | null
  category?: string | null
  checkItems: QCCheckItem[]
  passThreshold?: number
  requirePhotos?: boolean
  minPhotos?: number
  maxPhotos?: number
  requireSignature?: boolean
  samplingEnabled?: boolean
  samplingPct?: number | null
  minSampleSize?: number | null
  autoRejectBelow?: number | null
  autoApproveAbove?: number | null
  isActive?: boolean
  sortOrder?: number
}

/**
 * Complete settings update request
 */
export interface UpdateSettingsRequest {
  general?: UpdateGeneralSettingsRequest
  approvalLevels?: ApprovalLevelInput[]
  categories?: CategoryInput[]
  notificationRules?: NotificationRuleInput[]
  paymentTerms?: PaymentTermInput[]
  qcChecklists?: QCChecklistInput[]
}

// ================================ RESPONSE TYPES ================================

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * Settings API response
 */
export type SettingsResponse = ApiResponse<ProcurementSettingsDetail>

/**
 * Update response
 */
export type UpdateSettingsResponse = ApiResponse<ProcurementSettingsDetail>

// ================================ ENUMS & CONSTANTS ================================

/**
 * Digest frequency options
 */
export const DIGEST_FREQUENCIES = ['DAILY', 'WEEKLY', 'MONTHLY'] as const
export type DigestFrequency = (typeof DIGEST_FREQUENCIES)[number]

/**
 * Notification channels
 */
export const NOTIFICATION_CHANNELS = ['EMAIL', 'WHATSAPP', 'PUSH', 'SMS'] as const
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number]

/**
 * Common procurement event types
 */
export const PROCUREMENT_EVENTS = {
  ORDER_SUBMITTED: 'ORDER_SUBMITTED',
  ORDER_APPROVED: 'ORDER_APPROVED',
  ORDER_REJECTED: 'ORDER_REJECTED',
  PAYMENT_DUE: 'PAYMENT_DUE',
  PAYMENT_OVERDUE: 'PAYMENT_OVERDUE',
  DELIVERY_SCHEDULED: 'DELIVERY_SCHEDULED',
  DELIVERY_COMPLETED: 'DELIVERY_COMPLETED',
  QC_FAILED: 'QC_FAILED',
  LOW_STOCK: 'LOW_STOCK',
  BUDGET_THRESHOLD: 'BUDGET_THRESHOLD',
} as const

/**
 * Payment term codes
 */
export const PAYMENT_TERM_CODES = {
  COD: 'COD',
  NET_7: 'NET_7',
  NET_14: 'NET_14',
  NET_30: 'NET_30',
  NET_60: 'NET_60',
  TEMPO_14: 'TEMPO_14',
  TEMPO_30: 'TEMPO_30',
} as const

/**
 * Condition operators for notification rules
 */
export const CONDITION_OPERATORS = ['>', '<', '>=', '<=', '==', '!=', 'contains', 'not_contains'] as const
export type ConditionOperator = (typeof CONDITION_OPERATORS)[number]
