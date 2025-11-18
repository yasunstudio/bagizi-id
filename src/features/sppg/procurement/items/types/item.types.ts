/**
 * @fileoverview Procurement Item Types
 * @version Next.js 15.5.4 / TypeScript 5.x
 * @author Bagizi-ID Development Team
 */

import type { InventoryCategory } from '@prisma/client'

// ============================================================================
// API Response Types
// ============================================================================

export interface ProcurementItemResponse {
  id: string
  procurementId: string
  inventoryItemId: string | null
  
  // Historical Snapshot
  itemName: string
  itemCode: string | null
  category: InventoryCategory
  brand: string | null
  
  // Quantities
  orderedQuantity: number
  receivedQuantity: number | null
  unit: string
  returnedQuantity: number
  
  // Pricing
  pricePerUnit: number
  totalPrice: number
  discountPercent: number
  discountAmount: number
  finalPrice: number
  
  // Quality
  qualityStandard: string | null
  qualityReceived: string | null
  gradeRequested: string | null
  gradeReceived: string | null
  isAccepted: boolean
  rejectionReason: string | null
  
  // Product Details
  expiryDate: Date | null
  batchNumber: string | null
  productionDate: Date | null
  storageRequirement: string | null
  
  // Nutritional Snapshot
  caloriesPer100g: number | null
  proteinPer100g: number | null
  fatPer100g: number | null
  carbsPer100g: number | null
  
  notes: string | null
  
  // Relations
  inventoryItem?: {
    id: string
    itemName: string
    itemCode: string
    category: InventoryCategory
    currentStock: number
    minStockLevel: number
    unit: string
  } | null
  
  procurement?: {
    id: string
    procurementCode: string
    procurementDate: Date
    status: string
    supplierName: string | null
  }
}

// ============================================================================
// Form Input Types
// ============================================================================

export interface CreateProcurementItemInput {
  inventoryItemId: string
  orderedQuantity: number
  pricePerUnit: number
  discountPercent?: number
  qualityStandard?: string
  gradeRequested?: string
  expiryDate?: Date
  storageRequirement?: string
  notes?: string
}

export interface UpdateProcurementItemInput {
  receivedQuantity?: number
  qualityReceived?: string
  gradeReceived?: string
  isAccepted?: boolean
  rejectionReason?: string
  returnedQuantity?: number
  batchNumber?: string
  productionDate?: Date
  notes?: string
}

// ============================================================================
// List & Filter Types
// ============================================================================

export interface ProcurementItemFilters {
  category?: InventoryCategory
  isAccepted?: boolean
  hasQualityIssues?: boolean
  search?: string
}

export interface ProcurementItemStats {
  totalItems: number
  totalValue: number
  totalDiscount: number
  acceptedItems: number
  rejectedItems: number
  averageDiscount: number
  itemsByCategory: Record<InventoryCategory, number>
}
