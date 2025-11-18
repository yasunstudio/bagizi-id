/**
 * @fileoverview Procurement Orders Types - Enterprise-grade
 * @version Next.js 15.5.4 / Prisma 6.18.0 / TypeScript 5.7.2
 * @author Bagizi-ID Development Team
 * @see {@link /docs/PROCUREMENT_WORKFLOW_GUIDE.md} Procurement Documentation
 * 
 * TYPE SYSTEM PATTERN (Option B - Dual Type System):
 * - Form Input Types: Use string for dates (from input fields)
 * - API Response Types: Use Date objects (from database)
 * - Conversion happens at form submission and API response parsing
 */

import type { 
  QualityGrade, 
  ProcurementStatus, 
  ProcurementMethod,
  InventoryCategory 
} from '@prisma/client'

// ================================ ENUMS ================================

/**
 * Order approval status
 */
export type OrderApprovalStatus = 
  | 'PENDING_APPROVAL'  // Menunggu persetujuan
  | 'APPROVED'          // Disetujui
  | 'REJECTED'          // Ditolak
  | 'REVISION'          // Perlu revisi

/**
 * Order priority levels
 */
export type OrderPriority =
  | 'LOW'      // Prioritas rendah
  | 'MEDIUM'   // Prioritas sedang
  | 'HIGH'     // Prioritas tinggi
  | 'URGENT'   // Mendesak

/**
 * Delivery urgency
 */
export type DeliveryUrgency =
  | 'STANDARD'  // 7-14 hari
  | 'EXPRESS'   // 3-5 hari
  | 'IMMEDIATE' // 1-2 hari

// ================================ ORDER TYPES (API RESPONSE) ================================

/**
 * Procurement Order (main entity)
 * Maps to Procurement model from database
 * Uses Date objects (parsed from API response)
 */
export interface Order {
  id: string
  sppgId: string
  planId: string | null
  procurementCode: string
  procurementDate: Date
  expectedDelivery: Date | null
  actualDelivery: Date | null
  supplierId: string
  supplierName: string | null
  supplierContact: string | null
  purchaseMethod: ProcurementMethod
  paymentTerms: string | null
  subtotalAmount: number
  taxAmount: number
  discountAmount: number
  shippingCost: number
  totalAmount: number
  paidAmount: number
  paymentStatus: string
  paymentDue: Date | null
  status: ProcurementStatus
  deliveryStatus: string
  qualityGrade: QualityGrade | null
  qualityNotes: string | null
  receiptNumber: string | null
  receiptPhoto: string | null
  deliveryPhoto: string | null
  invoiceNumber: string | null
  deliveryMethod: string | null
  transportCost: number | null
  packagingType: string | null
  inspectedBy: string | null
  inspectedAt: Date | null
  acceptanceStatus: string | null
  rejectionReason: string | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Order with full details (relationships included)
 * Used in detail pages and comprehensive views
 */
export interface OrderWithDetails extends Order {
  items: OrderItem[]
  supplier: {
    id: string
    supplierName: string
    supplierCode: string
    supplierType: string
    contactPhone: string | null
    contactEmail: string | null
    contactAddress: string | null
  }
  plan?: {
    id: string
    planName: string
    planCode: string
    startDate: Date
    endDate: Date
  } | null
  sppg: {
    id: string
    sppgName: string
    sppgCode: string
  }
  qualityControls?: QualityControlSummary[]
  approvalTracking?: ApprovalTracking[]
}

/**
 * Approval Tracking Record
 * Maps to ProcurementApprovalTracking model
 */
export interface ApprovalTracking {
  id: string
  procurementId: string
  approvalLevelId: string | null
  approverUserId: string
  approverName: string
  approverRole: string
  action: 'APPROVED' | 'REJECTED' | 'ESCALATED'
  comments: string | null
  approvedAt: Date
  ipAddress: string | null
  isEscalated: boolean
  escalatedFrom: string | null
  escalatedReason: string | null
  createdAt: Date
}

/**
 * Order Item (procurement item details)
 * Maps to ProcurementItem model
 */
export interface OrderItem {
  id: string
  procurementId: string
  inventoryItemId: string | null
  itemName: string
  itemCode: string | null
  category: InventoryCategory
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
  caloriesPer100g: number | null
  proteinPer100g: number | null
  fatPer100g: number | null
  carbsPer100g: number | null
  notes: string | null
  inventoryItem?: {
    id: string
    itemName: string
    currentStock: number
    unit: string
  } | null
}

/**
 * Quality Control Summary (for orders list)
 */
export interface QualityControlSummary {
  id: string
  overallGrade: QualityGrade
  overallStatus: string
  inspectedBy: string
  inspectedAt: Date
  isApproved: boolean
}

// ================================ FORM INPUT TYPES (STRING DATES) ================================

/**
 * Order Form Input (for create/update forms)
 * Uses string for date fields (from date inputs)
 */
export interface OrderFormInput {
  planId?: string
  procurementDate: string          // ISO string from date input
  expectedDelivery?: string         // ISO string from date input
  supplierId: string
  supplierName?: string
  supplierContact?: string
  purchaseMethod: ProcurementMethod
  paymentTerms?: string
  paymentDue?: string               // ISO string from date input
  deliveryMethod?: string
  transportCost?: number
  packagingType?: string
  items: OrderItemFormInput[]
}

/**
 * Order Item Form Input
 */
export interface OrderItemFormInput {
  inventoryItemId?: string
  itemName: string
  itemCode?: string
  category: InventoryCategory
  brand?: string
  orderedQuantity: number
  unit: string
  pricePerUnit: number
  discountPercent?: number
  qualityStandard?: string
  gradeRequested?: string
  expiryDate?: string               // ISO string from date input
  storageRequirement?: string
  notes?: string
}

/**
 * Order Update Input (partial update)
 */
export interface OrderUpdateInput {
  expectedDelivery?: string
  supplierContact?: string
  paymentTerms?: string
  paymentDue?: string
  deliveryMethod?: string
  transportCost?: number
  packagingType?: string
  items?: OrderItemFormInput[]
}

// ================================ ACTION DTOs ================================

/**
 * Order Approval DTO
 */
export interface OrderApprovalInput {
  approvalStatus: OrderApprovalStatus
  approvedBy: string
  approvalNotes?: string
  approvalDate?: string
}

/**
 * Order Rejection DTO
 */
export interface OrderRejectionInput {
  rejectionReason: string
  rejectedBy: string
  alternativeAction?: string
}

/**
 * Order Cancellation DTO
 */
export interface OrderCancellationInput {
  cancellationReason: string
  cancelledBy: string
  refundRequired: boolean
}

// ================================ FILTER & SEARCH TYPES ================================

/**
 * Order filters (for list view)
 */
export interface OrderFilters {
  search?: string
  status?: ProcurementStatus[]
  deliveryStatus?: string[]
  paymentStatus?: string[]
  supplierId?: string
  planId?: string
  purchaseMethod?: ProcurementMethod[]
  dateFrom?: string
  dateTo?: string
  minAmount?: number
  maxAmount?: number
  priority?: OrderPriority
  approvalStatus?: OrderApprovalStatus[]
}

/**
 * Order sort options
 */
export type OrderSortField = 
  | 'procurementDate'
  | 'expectedDelivery'
  | 'totalAmount'
  | 'status'
  | 'supplierName'
  | 'procurementCode'

export interface OrderSort {
  field: OrderSortField
  direction: 'asc' | 'desc'
}

// ================================ PAGINATION ================================

/**
 * Paginated orders response
 */
export interface PaginatedOrders {
  orders: Order[]
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
  }
}

/**
 * Pagination params
 */
export interface PaginationParams {
  page?: number
  pageSize?: number
}

// ================================ STATISTICS ================================

/**
 * Order statistics (for dashboard/stats)
 */
export interface OrderStats {
  totalOrders: number
  totalAmount: number
  averageOrderValue: number
  byStatus: {
    status: ProcurementStatus
    count: number
    totalAmount: number
  }[]
  byPaymentStatus: {
    status: string
    count: number
    totalAmount: number
    paidAmount: number
  }[]
  bySupplier: {
    supplierId: string
    supplierName: string
    orderCount: number
    totalAmount: number
  }[]
  byMonth: {
    month: string
    orderCount: number
    totalAmount: number
  }[]
  recentOrders: Order[]
}

/**
 * Delivery metrics
 */
export interface DeliveryMetrics {
  onTimeDeliveries: number
  lateDeliveries: number
  pendingDeliveries: number
  averageDeliveryDays: number
  deliveryPerformance: number // percentage
}

// ================================ VALIDATION TYPES ================================

/**
 * Order validation result
 */
export interface OrderValidation {
  isValid: boolean
  errors: {
    field: string
    message: string
  }[]
  warnings?: {
    field: string
    message: string
  }[]
}

/**
 * Item availability check
 */
export interface ItemAvailability {
  itemId: string
  itemName: string
  isAvailable: boolean
  currentStock: number
  requestedQuantity: number
  canFulfill: boolean
}

// ================================ ACTIVITY LOG ================================

/**
 * Order activity/timeline entry
 */
export interface OrderActivity {
  id: string
  orderId: string
  activityType: 
    | 'CREATED'
    | 'UPDATED'
    | 'APPROVED'
    | 'REJECTED'
    | 'CANCELLED'
    | 'SENT_TO_SUPPLIER'
    | 'DELIVERY_SCHEDULED'
    | 'DELIVERED'
    | 'COMPLETED'
  description: string
  performedBy: string
  performedByName: string
  timestamp: Date
  metadata?: Record<string, unknown>
}

// ================================ APPROVED PLAN TYPES ================================

/**
 * Approved plan for order dropdown
 * Used for linking orders to procurement plans
 */
export interface ApprovedPlan {
  id: string
  planName: string
  planMonth: string
  planYear: number
  totalBudget: number
  allocatedBudget: number
  usedBudget: number
  remainingBudget: number
  budgetUsagePercent: number
  hasRemainingBudget: boolean
}

/**
 * Payment term for order dropdown
 * Used for selecting payment terms in orders
 */
export interface PaymentTerm {
  id: string
  code: string
  name: string
  description: string | null
  dueDays: number
  requireDP: boolean
  dpPercentage: number | null
  dpDueDays: number | null
  isDefault: boolean
  sortOrder: number
}

// ================================ EXPORT SUMMARY ================================

/**
 * Export type for reports
 */
export interface OrderExportData {
  order: Order
  items: OrderItem[]
  supplier: {
    name: string
    contact: string
    address: string
  }
  totals: {
    subtotal: number
    tax: number
    discount: number
    shipping: number
    total: number
  }
}
