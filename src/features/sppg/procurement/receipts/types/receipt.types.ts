/**
 * @fileoverview Receipt & Quality Control Types
 * @version Next.js 15.5.4 / Prisma / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/PROCUREMENT_WORKFLOW_GUIDE.md} Procurement Documentation
 */

import type { QualityGrade, ProcurementStatus } from '@prisma/client'

// ================================ ENUMS ================================

/**
 * Receipt status types
 */
export type ReceiptStatus = 
  | 'PENDING'       // Menunggu penerimaan
  | 'IN_PROGRESS'   // Sedang diperiksa
  | 'PARTIAL'       // Diterima sebagian
  | 'COMPLETED'     // Selesai diterima
  | 'REJECTED'      // Ditolak

/**
 * Quality check status
 */
export type QualityCheckStatus = 
  | 'PENDING'       // Menunggu QC
  | 'IN_PROGRESS'   // Sedang QC
  | 'PASSED'        // Lolos QC
  | 'FAILED'        // Gagal QC
  | 'CONDITIONAL'   // Conditional accept

/**
 * Acceptance decision
 */
export type AcceptanceDecision =
  | 'FULL_ACCEPT'        // Terima semua
  | 'PARTIAL_ACCEPT'     // Terima sebagian
  | 'CONDITIONAL_ACCEPT' // Terima dengan syarat
  | 'FULL_REJECT'        // Tolak semua

// ================================ RECEIPT TYPES ================================

/**
 * Receipt (uses existing Procurement model)
 * Maps to Procurement with deliveryStatus = 'DELIVERED' or 'PARTIAL'
 */
export interface Receipt {
  id: string
  sppgId: string
  procurementCode: string
  procurementDate: Date
  expectedDelivery: Date | null
  actualDelivery: Date | null
  supplierId: string
  supplierName: string | null
  receiptNumber: string | null
  receiptPhoto: string | null
  deliveryPhoto: string | null
  invoiceNumber: string | null
  deliveryMethod: string | null
  transportCost: number | null
  packagingType: string | null
  subtotalAmount: number
  taxAmount: number
  discountAmount: number
  shippingCost: number
  totalAmount: number
  status: ProcurementStatus
  deliveryStatus: string
  qualityGrade: QualityGrade | null
  qualityNotes: string | null
  inspectedBy: string | null
  inspectedAt: Date | null
  acceptanceStatus: string | null
  rejectionReason: string | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Receipt with items and relationships
 */
export interface ReceiptWithDetails extends Receipt {
  items: ReceiptItem[]
  supplier: {
    id: string
    supplierName: string
    supplierCode: string
    supplierType: string
    contactPhone: string | null
    contactEmail: string | null
  }
  sppg: {
    id: string
    name: string
    sppgCode: string
  }
}

/**
 * Receipt Item (uses ProcurementItem)
 */
export interface ReceiptItem {
  id: string
  procurementId: string
  inventoryItemId: string | null
  itemName: string
  itemCode: string | null
  category: string
  brand: string | null
  orderedQuantity: number
  receivedQuantity: number | null
  unit: string
  pricePerUnit: number
  totalPrice: number
  discountPercent: number
  discountAmount: number
  finalPrice: number
  qualityStandard: string | null
  qualityReceived: string | null
  gradeRequested: string | null
  gradeReceived: string | null
  expiryDate: Date | null
  batchNumber: string | null
  productionDate: Date | null
  storageRequirement: string | null
  isAccepted: boolean
  rejectionReason: string | null
  returnedQuantity: number
  notes: string | null
}

// ================================ QUALITY CONTROL TYPES ================================

/**
 * Quality Control Check
 * Uses fields: inspectedBy, inspectedAt, qualityGrade, qualityNotes
 */
export interface QualityControl {
  id: string
  receiptId: string // procurementId
  inspectedBy: string
  inspectedAt: Date
  overallGrade: QualityGrade
  notes: string | null
  items: QualityControlItem[]
}

/**
 * Quality Control per Item
 */
export interface QualityControlItem {
  itemId: string
  itemName: string
  orderedQuantity: number
  receivedQuantity: number
  qualityStandard: string | null
  qualityReceived: string | null
  gradeRequested: string | null
  gradeReceived: string | null
  isAccepted: boolean
  rejectionReason: string | null
  returnedQuantity: number
  checkPoints: QualityCheckPoint[]
}

/**
 * Quality check point details
 */
export interface QualityCheckPoint {
  aspect: string
  standard: string
  actual: string
  isPassed: boolean
  notes?: string
}

// ================================ INPUT TYPES ================================

/**
 * Create receipt form input (what user enters in form)
 * Dates are strings before Zod transformation
 */
export interface CreateReceiptFormInput {
  procurementId: string
  receiptNumber?: string
  actualDelivery: string // Form input as string
  deliveryMethod?: string
  transportCost?: number
  packagingType?: string
  receiptPhoto?: string
  deliveryPhoto?: string
  invoiceNumber?: string
  items: ReceiptItemFormInput[]
}

/**
 * Receipt item form input (what user enters in form)
 */
export interface ReceiptItemFormInput {
  itemId: string
  receivedQuantity: number
  batchNumber?: string
  expiryDate?: string // Form input as string
  productionDate?: string // Form input as string
  notes?: string
}

/**
 * Create receipt input (after Zod transformation - what API receives)
 * Dates are Date objects after transformation
 */
export interface CreateReceiptInput {
  procurementId: string
  receiptNumber?: string
  actualDelivery: Date // Transformed to Date
  deliveryMethod?: string
  transportCost?: number
  packagingType?: string
  receiptPhoto?: string
  deliveryPhoto?: string
  invoiceNumber?: string
  items: ReceiptItemInput[]
}

/**
 * Receipt item input (after Zod transformation - what API receives)
 */
export interface ReceiptItemInput {
  itemId: string
  receivedQuantity: number
  batchNumber?: string
  expiryDate?: Date // Transformed to Date
  productionDate?: Date // Transformed to Date
  notes?: string
}

/**
 * Quality control input
 */
export interface QualityControlInput {
  receiptId: string
  inspectedBy: string
  items: QualityItemInput[]
  overallNotes?: string
}

/**
 * Quality check per item
 */
export interface QualityItemInput {
  itemId: string
  qualityReceived: string
  gradeReceived: string
  isAccepted: boolean
  rejectionReason?: string
  returnedQuantity?: number
  checkPoints?: QualityCheckPoint[]
}

/**
 * Update receipt input
 */
export interface UpdateReceiptInput {
  receiptNumber?: string
  actualDelivery?: Date
  deliveryMethod?: string
  transportCost?: number
  packagingType?: string
  receiptPhoto?: string
  deliveryPhoto?: string
  invoiceNumber?: string
  acceptanceStatus?: string
  rejectionReason?: string
}

// ================================ RESPONSE TYPES ================================

/**
 * Receipt list item
 */
export interface ReceiptListItem {
  id: string
  procurementCode: string
  receiptNumber: string | null
  supplierName: string | null
  actualDelivery: Date | null
  totalAmount: number
  deliveryStatus: string
  qualityGrade: QualityGrade | null
  inspectedBy: string | null
  createdAt: Date
}

/**
 * Receipt statistics
 */
export interface ReceiptStats {
  totalReceipts: number
  pendingInspection: number
  qualityPassed: number
  qualityFailed: number
  partialReceipts: number
  totalValue: number
  averageQualityGrade: QualityGrade | null
}

/**
 * Quality report
 */
export interface QualityReport {
  period: string
  totalInspections: number
  passedCount: number
  failedCount: number
  conditionalCount: number
  passRate: number
  averageGrade: QualityGrade
  topIssues: Array<{
    issue: string
    count: number
    percentage: number
  }>
  supplierPerformance: Array<{
    supplierId: string
    supplierName: string
    totalReceipts: number
    passedCount: number
    failedCount: number
    passRate: number
    averageGrade: QualityGrade
  }>
}

// ================================ FILTER & SORT TYPES ================================

/**
 * Receipt filters - Form input (what user enters)
 */
export interface ReceiptFiltersFormInput {
  supplierId?: string
  deliveryStatus?: string
  qualityGrade?: QualityGrade | 'all'
  dateFrom?: string // Form input as string
  dateTo?: string // Form input as string
  inspectedBy?: string
  searchTerm?: string
}

/**
 * Receipt filters - API format (after transformation)
 */
export interface ReceiptFilters {
  supplierId?: string
  deliveryStatus?: string
  qualityGrade?: QualityGrade | 'all'
  dateFrom?: Date // Transformed to Date
  dateTo?: Date // Transformed to Date
  inspectedBy?: string
  searchTerm?: string
}

/**
 * Receipt sort options
 */
export type ReceiptSortField = 
  | 'actualDelivery'
  | 'procurementCode'
  | 'supplierName'
  | 'totalAmount'
  | 'qualityGrade'

export interface ReceiptSort {
  field: ReceiptSortField
  direction: 'asc' | 'desc'
}
