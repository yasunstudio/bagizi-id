/**
 * @fileoverview Payment Types - Enterprise-grade
 * @version Next.js 15.5.4 / Prisma 6.17.1 / TypeScript 5.7.2
 * @author Bagizi-ID Development Team
 * @see {@link /docs/PROCUREMENT_ENTERPRISE_AUDIT_COMPLETE.md} Audit Documentation
 * 
 * TYPE SYSTEM PATTERN (Option B - Dual Type System):
 * - Form Input Types: Use string for dates (from input fields)
 * - API Response Types: Use Date objects (from database)
 * - Conversion happens at form submission and API response parsing
 * 
 * BUSINESS CONTEXT:
 * Payment management tracks financial obligations to suppliers, including:
 * - Payment recording and reconciliation
 * - Overdue payment tracking
 * - Accounts payable aging analysis
 * - Payment terms enforcement
 * - Cash flow forecasting
 */

import type { ApiResponse } from '@/lib/api-utils'

// ================================ ENUMS ================================

/**
 * Payment status types
 */
export type PaymentStatus =
  | 'UNPAID'           // Belum dibayar
  | 'PARTIALLY_PAID'   // Dibayar sebagian
  | 'PAID'             // Lunas
  | 'OVERDUE'          // Terlambat
  | 'CANCELLED'        // Dibatalkan

/**
 * Payment method types
 */
export type PaymentMethod =
  | 'BANK_TRANSFER'    // Transfer bank
  | 'CASH'             // Tunai
  | 'CREDIT_CARD'      // Kartu kredit
  | 'DEBIT_CARD'       // Kartu debit
  | 'CHECK'            // Cek
  | 'OTHER'            // Lainnya

/**
 * Payment term types
 */
export type PaymentTermType =
  | 'IMMEDIATE'        // Bayar langsung (Cash on Delivery)
  | 'NET_7'            // Net 7 days
  | 'NET_14'           // Net 14 days
  | 'NET_30'           // Net 30 days
  | 'NET_60'           // Net 60 days
  | 'NET_90'           // Net 90 days
  | 'CUSTOM'           // Custom terms

/**
 * Aging categories for accounts payable
 */
export type AgingCategory =
  | 'CURRENT'          // 0-30 days
  | 'DAYS_31_60'       // 31-60 days
  | 'DAYS_61_90'       // 61-90 days
  | 'OVER_90'          // Over 90 days

// ================================ PAYMENT TYPES (API RESPONSE) ================================

/**
 * Payment record (extends Procurement fields)
 * Uses Date objects (parsed from API response)
 */
export interface Payment {
  // Procurement relationship
  procurementId: string
  procurementCode: string
  procurementDate: Date
  
  // Supplier information
  supplierId: string
  supplierName: string | null
  supplierContact: string | null
  
  // Financial details
  totalAmount: number        // Total procurement amount
  paidAmount: number         // Amount already paid
  remainingAmount: number    // Calculated: totalAmount - paidAmount
  paymentStatus: PaymentStatus
  paymentDue: Date | null    // Due date
  paymentTerms: string | null
  
  // Invoice details
  invoiceNumber: string | null
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
}

/**
 * Payment transaction record
 * Individual payment made against a procurement
 */
export interface PaymentTransaction {
  id: string
  procurementId: string
  paymentDate: Date
  paymentMethod: PaymentMethod
  amount: number
  referenceNumber: string | null   // Transaction reference
  bankName: string | null
  accountNumber: string | null
  receiptUrl: string | null        // Payment receipt/proof
  notes: string | null
  createdBy: string                // User who recorded payment
  createdByName: string | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Payment with full details (relationships included)
 * Used in detail pages and comprehensive views
 */
export interface PaymentWithDetails extends Payment {
  transactions: PaymentTransaction[]
  supplier: {
    id: string
    supplierName: string
    supplierCode: string
    contactPerson: string | null
    phone: string | null
    email: string | null
  }
  procurement: {
    id: string
    procurementCode: string
    procurementDate: Date
    expectedDelivery: Date | null
    actualDelivery: Date | null
    status: string
    deliveryStatus: string
  }
}

/**
 * Overdue payment information
 * Matches API response structure from /api/sppg/procurement/payments/overdue
 */
export interface OverduePayment {
  procurementId: string
  procurementCode: string
  supplierId: string
  supplierName: string
  supplierContact: string | null
  totalAmount: number
  paidAmount: number
  remainingAmount: number
  paymentStatus: PaymentStatus
  paymentDue: Date
  paymentTerms: string | null
  daysOverdue: number           // Calculated field
  agingCategory: AgingCategory  // Calculated field
  invoiceNumber: string | null
  lastPaymentDate: Date | null
  lastPaymentAmount: number | null
}

/**
 * Accounts payable aging report - single supplier data
 */
export interface AgingReportData {
  supplierId: string
  supplierName: string
  current: number           // 0-30 days
  days31to60: number        // 31-60 days
  days61to90: number        // 61-90 days
  over90: number            // Over 90 days
  total: number             // Total outstanding
  oldestInvoiceDate: Date | null
  contactPerson: string | null
  phone: string | null
}

/**
 * Aging Report Response - full report structure
 * Matches API response from /api/sppg/procurement/payments/aging
 */
export interface AgingReportResponse {
  generatedAt: Date
  summary: {
    totalOutstanding: number
    current: number
    days31to60: number
    days61to90: number
    over90: number
    totalSuppliers: number
    totalProcurements: number
  }
  supplierBreakdown: Array<{
    supplierId: string
    supplierName: string
    totalOutstanding: number
    current: number
    days31to60: number
    days61to90: number
    over90: number
    procurementCount: number
  }>
}

/**
 * Payment statistics summary
 * Matches API response structure from /api/sppg/procurement/payments/stats
 */
export interface PaymentStats {
  summary: {
    totalProcurements: number
    totalAmount: number
    totalPaid: number
    totalOutstanding: number
    totalOverdue: number
    overdueCount: number
  }
  aging: {
    current: number               // 0-30 days
    days31to60: number            // 31-60 days
    days61to90: number            // 61-90 days
    over90: number                // Over 90 days
  }
  dueSoon: {
    next7Days: number
    next30Days: number
  }
  trends: {
    thisMonth: {
      amount: number
      count: number
    }
    lastMonth: {
      amount: number
      count: number
    }
    yearToDate: {
      amount: number
      count: number
    }
    changeFromLastMonth: number
  }
  paymentMethods: Record<string, number>
  avgPaymentCycle: number
}

// ================================ FORM INPUT TYPES (STRING DATES) ================================

/**
 * Payment transaction form input
 * Uses string dates for form compatibility
 */
export interface PaymentTransactionFormInput {
  procurementId: string
  paymentDate: string              // ISO string from date picker
  paymentMethod: PaymentMethod
  amount: number
  referenceNumber?: string
  bankName?: string
  accountNumber?: string
  receiptUrl?: string              // File upload URL
  notes?: string
}

/**
 * Payment transaction update input
 */
export interface PaymentTransactionUpdateInput {
  paymentDate?: string
  paymentMethod?: PaymentMethod
  amount?: number
  referenceNumber?: string
  bankName?: string
  accountNumber?: string
  receiptUrl?: string
  notes?: string
}

/**
 * Payment reconciliation input
 * Used to mark payment as reconciled/verified
 */
export interface PaymentReconciliationInput {
  procurementId: string
  reconciledAmount: number
  reconciledBy: string
  reconciledAt: string             // ISO string
  reconciliationNotes?: string
}

// ================================ FILTER TYPES ================================

/**
 * Payment filters for list queries
 */
export interface PaymentFilters {
  // Search
  search?: string                  // Search in procurement code, supplier name, invoice number
  
  // Status filters
  paymentStatus?: PaymentStatus[]  // Filter by payment status
  
  // Date filters
  dateFrom?: string                // ISO string
  dateTo?: string                  // ISO string
  dueDateFrom?: string             // ISO string
  dueDateTo?: string               // ISO string
  
  // Supplier filter
  supplierId?: string
  
  // Amount filters
  minAmount?: number
  maxAmount?: number
  
  // Overdue only
  overdueOnly?: boolean
  
  // Aging category
  agingCategory?: AgingCategory[]
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * Payment filters with pagination
 * Combines payment filters with pagination parameters
 */
export interface PaymentFiltersWithPagination extends PaymentFilters, PaginationParams {}

/**
 * Payment statistics query parameters
 */
export interface PaymentStatsQuery {
  supplierId?: string
}

/**
 * Aging report filters
 */
export interface AgingReportFilters {
  supplierId?: string
}

// ================================ RESPONSE TYPES ================================

/**
 * Paginated payment list response
 */
export interface PaginatedPayments {
  payments: Payment[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * Payment statistics response
 */
export type PaymentStatsResponse = ApiResponse<PaymentStats>

/**
 * Payment list response
 */
export type PaymentListResponse = ApiResponse<PaginatedPayments>

/**
 * Payment detail response
 */
export type PaymentDetailResponse = ApiResponse<PaymentWithDetails>

/**
 * Payment transaction response
 */
export type PaymentTransactionResponse = ApiResponse<PaymentTransaction>

/**
 * Overdue payments response
 */
export type OverduePaymentsResponse = ApiResponse<OverduePayment[]>

/**
 * Aging report API response wrapper
 */
export type AgingReportApiResponse = ApiResponse<AgingReportResponse>

// ================================ UTILITY TYPES ================================

/**
 * Calculate payment status based on amounts and due date
 */
export function calculatePaymentStatus(
  totalAmount: number,
  paidAmount: number,
  paymentDue: Date | null
): PaymentStatus {
  const now = new Date()
  const isOverdue = paymentDue && paymentDue < now
  
  if (paidAmount === 0) {
    return isOverdue ? 'OVERDUE' : 'UNPAID'
  }
  
  if (paidAmount >= totalAmount) {
    return 'PAID'
  }
  
  return 'PARTIALLY_PAID'
}

/**
 * Calculate aging category based on due date
 */
export function calculateAgingCategory(paymentDue: Date | null): AgingCategory {
  if (!paymentDue) return 'CURRENT'
  
  const now = new Date()
  const daysOverdue = Math.floor((now.getTime() - paymentDue.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysOverdue <= 30) return 'CURRENT'
  if (daysOverdue <= 60) return 'DAYS_31_60'
  if (daysOverdue <= 90) return 'DAYS_61_90'
  return 'OVER_90'
}

/**
 * Calculate days overdue
 */
export function calculateDaysOverdue(paymentDue: Date | null): number {
  if (!paymentDue) return 0
  
  const now = new Date()
  const daysOverdue = Math.floor((now.getTime() - paymentDue.getTime()) / (1000 * 60 * 60 * 24))
  
  return Math.max(0, daysOverdue)
}

/**
 * Format payment status for display
 */
export function formatPaymentStatus(status: PaymentStatus): string {
  const statusLabels: Record<PaymentStatus, string> = {
    UNPAID: 'Belum Dibayar',
    PARTIALLY_PAID: 'Dibayar Sebagian',
    PAID: 'Lunas',
    OVERDUE: 'Terlambat',
    CANCELLED: 'Dibatalkan',
  }
  
  return statusLabels[status] || status
}

/**
 * Format payment method for display
 */
export function formatPaymentMethod(method: PaymentMethod): string {
  const methodLabels: Record<PaymentMethod, string> = {
    BANK_TRANSFER: 'Transfer Bank',
    CASH: 'Tunai',
    CREDIT_CARD: 'Kartu Kredit',
    DEBIT_CARD: 'Kartu Debit',
    CHECK: 'Cek',
    OTHER: 'Lainnya',
  }
  
  return methodLabels[method] || method
}

/**
 * Get payment status color for UI
 */
export function getPaymentStatusColor(status: PaymentStatus): string {
  const colors: Record<PaymentStatus, string> = {
    UNPAID: 'text-yellow-600 dark:text-yellow-500',
    PARTIALLY_PAID: 'text-blue-600 dark:text-blue-500',
    PAID: 'text-green-600 dark:text-green-500',
    OVERDUE: 'text-red-600 dark:text-red-500',
    CANCELLED: 'text-gray-600 dark:text-gray-500',
  }
  
  return colors[status] || 'text-gray-600'
}

/**
 * Get payment status badge variant
 */
export function getPaymentStatusBadgeVariant(status: PaymentStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  const variants: Record<PaymentStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    UNPAID: 'outline',
    PARTIALLY_PAID: 'secondary',
    PAID: 'default',
    OVERDUE: 'destructive',
    CANCELLED: 'outline',
  }
  
  return variants[status] || 'outline'
}
