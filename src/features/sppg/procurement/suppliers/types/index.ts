/**
 * @fileoverview Supplier Types - Independent Domain
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Enterprise Development Guidelines
 * 
 * ARCHITECTURAL NOTE:
 * Supplier is a SHARED MASTER DATA domain used by multiple modules:
 * - Procurement: Purchase orders and supplier management
 * - Inventory: Item sources and restocking
 * - Production: Raw materials tracking
 * - Quality: Supplier evaluations and performance
 * - Finance: Payment terms and credit management
 * - Contracts: Supplier agreements
 */

import type { SupplierType, QualityGrade } from '@prisma/client'

// ================================ CORE SUPPLIER TYPES ================================

/**
 * Supplier type matching Supplier Prisma model (comprehensive)
 */
export interface Supplier {
  id: string
  sppgId: string
  
  // Basic Supplier Information
  supplierCode: string
  supplierName: string
  businessName?: string | null // Legal business name
  supplierType: SupplierType
  category: string // "PROTEIN", "VEGETABLES", "DAIRY", "GRAINS"
  
  // Contact Information
  primaryContact: string // Contact person name
  phone: string
  email?: string | null
  whatsapp?: string | null
  website?: string | null
  
  // Address & Location
  address: string
  city: string
  province: string
  postalCode?: string | null
  coordinates?: string | null // GPS coordinates
  deliveryRadius?: number | null // Delivery radius in KM
  
  // Business Documentation
  businessLicense?: string | null // License number
  taxId?: string | null // NPWP
  hallaLicense?: string | null // Halal certification
  foodSafetyLicense?: string | null // Food safety certification
  
  // Financial & Terms
  paymentTerms: string
  creditLimit?: number | null
  currency: string
  bankAccount?: string | null
  bankName?: string | null
  
  // Supplier Performance & Rating
  overallRating: number // 0.0 - 5.0
  qualityRating: number
  deliveryRating: number
  priceCompetitiveness: number
  serviceRating: number
  
  // Performance Statistics
  totalOrders: number
  successfulDeliveries: number
  failedDeliveries: number
  averageDeliveryTime?: number | null // In hours
  onTimeDeliveryRate: number // Percentage
  totalPurchaseValue: number // Total IDR value
  
  // Supplier Capabilities
  minOrderValue?: number | null
  maxOrderCapacity?: number | null // Maximum order they can handle
  leadTimeHours?: number | null // Standard lead time
  deliveryDays: string[] // ["MONDAY", "TUESDAY"]
  specialties: string[] // Product specialties
  certifications: string[] // Various certifications
  
  // Supplier Status & Flags
  isActive: boolean
  isPreferred: boolean
  isBlacklisted: boolean
  blacklistReason?: string | null
  lastAuditDate?: Date | null
  nextAuditDue?: Date | null
  
  // Compliance & Quality
  isHalalCertified: boolean
  isFoodSafetyCertified: boolean
  isISOCertified: boolean
  complianceStatus: string // "PENDING", "VERIFIED", "EXPIRED"
  lastInspectionDate?: Date | null
  
  // Relationship Management
  partnershipLevel: string // "STANDARD", "PREFERRED", "STRATEGIC"
  contractStartDate?: Date | null
  contractEndDate?: Date | null
  relationshipManager?: string | null // Internal PIC
  
  // Digital Integration
  hasAPIIntegration: boolean
  apiEndpoint?: string | null
  supportsEDI: boolean // Electronic Data Interchange
  preferredOrderMethod: string // "PHONE", "EMAIL", "WHATSAPP", "API"
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
  lastContactDate?: Date | null
}

/**
 * Supplier with relations and computed metrics
 */
export interface SupplierWithDetails extends Supplier {
  sppg: {
    id: string
    name: string
  }
  procurements: Array<{
    id: string
    procurementCode: string
    totalAmount: number
    status: string
    procurementDate: Date
    deliveryStatus?: string
    paymentStatus: string
  }>
  evaluations?: SupplierEvaluation[]
  contracts?: SupplierContract[]
  products?: SupplierProduct[]
  
  // Computed metrics
  totalActiveContracts: number
  averageOrderValue: number
  lastOrderDate?: Date | null
  performanceScore: number // Overall performance 0-100
  
  // Count relations
  _count?: {
    procurements: number
    supplierContracts: number
    supplierProducts: number
  }
}

// ================================ SUPPLIER EVALUATION TYPES ================================

/**
 * Supplier Evaluation type for performance tracking
 */
export interface SupplierEvaluation {
  id: string
  supplierId: string
  sppgId: string
  
  // Evaluation Details
  evaluationType: string // "MONTHLY", "QUARTERLY", "ANNUAL", "POST_ORDER"
  evaluationPeriod: string // "2025-Q1", "2025-01"
  
  // Performance Scores (1-5 scale)
  qualityScore: number
  deliveryScore: number
  serviceScore: number
  priceScore: number
  complianceScore: number
  overallScore: number
  
  // Detailed Assessment
  strengths?: string | null
  weaknesses?: string | null
  recommendations?: string | null
  actionItems?: unknown | null // JSON
  
  // Evaluation Context
  orderVolume?: number | null
  orderValue?: number | null
  deliveryCount: number
  complaintCount: number
  
  // Evaluation Status
  status: string // "DRAFT", "COMPLETED", "APPROVED"
  evaluatedBy: string // User ID
  approvedBy?: string | null // Manager ID
  
  // Timestamps
  evaluationDate: Date
  createdAt: Date
  updatedAt: Date
}

// ================================ SUPPLIER CONTRACT TYPES ================================

/**
 * Supplier Contract type for contract management
 */
export interface SupplierContract {
  id: string
  supplierId: string
  sppgId: string
  
  // Contract Information
  contractNumber: string
  contractType: string // "FRAMEWORK", "SPOT", "LONG_TERM"
  contractStatus: string // "DRAFT", "ACTIVE", "EXPIRED", "TERMINATED"
  
  // Contract Terms
  startDate: Date
  endDate: Date
  autoRenew: boolean
  renewalPeriod?: number | null // Days for renewal notice
  
  // Financial Terms
  contractValue?: number | null
  paymentTerms: string
  currency: string
  priceAdjustment?: string | null // "FIXED", "CPI_LINKED", "NEGOTIABLE"
  
  // Performance Terms
  deliveryTimeframe: string
  qualityStandards?: string | null
  penaltyTerms?: string | null
  bonusTerms?: string | null
  
  // Legal & Compliance
  governingLaw?: string | null
  disputeResolution?: string | null
  confidentiality: boolean
  
  // Document Management
  contractDocument?: string | null // File path/URL
  signedBy?: string | null // Supplier representative
  witnessedBy?: string | null // Internal witness
  
  // Timestamps
  signedDate?: Date | null
  createdAt: Date
  updatedAt: Date
}

// ================================ SUPPLIER PRODUCT TYPES ================================

/**
 * Supplier Product Catalog type
 */
export interface SupplierProduct {
  id: string
  supplierId: string
  sppgId: string
  
  // Product Information
  productCode: string
  productName: string
  category: string
  subcategory?: string | null
  description?: string | null
  
  // Specifications
  unit: string // "KG", "PCS", "LITER"
  packagingType?: string | null
  shelfLife?: number | null // Days
  storageCondition?: string | null
  
  // Pricing
  basePrice: number
  currency: string
  pricePerUnit: number
  minimumOrder?: number | null
  maximumOrder?: number | null
  
  // Availability
  isAvailable: boolean
  leadTimeHours: number
  stockLevel: string // "AVAILABLE", "LIMITED", "OUT_OF_STOCK"
  
  // Quality Information
  hasHalalCert: boolean
  hasOrganicCert: boolean
  qualityGrade?: QualityGrade | null
  certifications: string[]
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
  lastPriceUpdate?: Date | null
}

// ================================ INPUT TYPES FOR CREATE/UPDATE ================================

/**
 * Input type for creating supplier
 */
export interface CreateSupplierInput {
  supplierName: string
  businessName?: string
  supplierType: SupplierType
  category: string
  primaryContact: string
  phone: string
  email?: string
  whatsapp?: string
  website?: string
  address: string
  city: string
  province: string
  postalCode?: string
  coordinates?: string
  deliveryRadius?: number
  paymentTerms?: string
  creditLimit?: number
  minOrderValue?: number
  maxOrderCapacity?: number
  leadTimeHours?: number
  deliveryDays?: string[]
  specialties?: string[]
  certifications?: string[]
  isHalalCertified?: boolean
  isFoodSafetyCertified?: boolean
  isISOCertified?: boolean
  preferredOrderMethod?: string
}

/**
 * Input type for updating supplier
 */
export interface UpdateSupplierInput extends Partial<CreateSupplierInput> {
  isActive?: boolean
  isPreferred?: boolean
  isBlacklisted?: boolean
  blacklistReason?: string
  complianceStatus?: string
  partnershipLevel?: string
  contractStartDate?: Date
  contractEndDate?: Date
  relationshipManager?: string
}

// ================================ FILTER & SEARCH TYPES ================================

/**
 * Supplier filter options for list queries
 */
export interface SupplierFilters {
  // Search
  search?: string
  
  // Basic filters
  supplierType?: SupplierType[]
  category?: string[]
  city?: string[]
  province?: string[]
  
  // Status filters
  isActive?: boolean
  isPreferred?: boolean
  isBlacklisted?: boolean
  
  // Performance filters
  minRating?: number
  maxRating?: number
  
  // Relationship filters
  partnershipLevel?: string[]
  complianceStatus?: string[]
  
  // Pagination & Sorting
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// ================================ API RESPONSE TYPES ================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  details?: unknown
}

/**
 * Paginated response type
 */
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

/**
 * Supplier statistics for dashboard
 */
export interface SupplierStatistics {
  total: number
  active: number
  inactive: number
  suspended: number
  preferred: number
  blacklisted: number
  averageRating: number
  topSuppliers: Array<{
    id: string
    name: string
    totalOrders: number
    totalValue: number
    rating: number
  }>
  categoryBreakdown: Array<{
    category: string
    count: number
    percentage: number
  }>
}

/**
 * Supplier page statistics (for list/overview page)
 * Simplified statistics for quick overview display
 */
export interface SupplierPageStatistics {
  // Primary counts
  total: number
  active: number
  inactive: number
  suspended: number

  // Percentage metrics
  activePercentage: number
  inactivePercentage: number

  // Detailed breakdown (aliases for UI compatibility)
  totalSuppliers: number
  activeSuppliers: number
  inactiveSuppliers: number
  blacklistedSuppliers: number

  // Order statistics
  pendingOrders: number
  totalOrders: number
}

/**
 * Supplier performance metrics
 */
export interface SupplierPerformanceMetrics {
  supplier: SupplierWithDetails
  performance: {
    totalOrders: number
    completedOrders: number
    cancelledOrders: number
    onTimeDeliveryRate: number
    averageDeliveryTime: number
    qualityMetrics: {
      averageQualityGrade: number
      acceptanceRate: number
      rejectionRate: number
    }
    financialMetrics: {
      totalPurchaseValue: number
      averageOrderValue: number
      outstandingAmount: number
    }
  }
  trends: {
    monthly: Array<{
      month: string
      orders: number
      amount: number
      onTimeRate: number
    }>
  }
  riskAssessment: {
    level: 'LOW' | 'MEDIUM' | 'HIGH'
    factors: string[]
    recommendations: string[]
  }
}

// ================================ EXPORTS ================================

export type {
  SupplierType,
  QualityGrade,
}
