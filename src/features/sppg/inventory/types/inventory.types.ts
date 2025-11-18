/**
 * @fileoverview Inventory Management Type Definitions
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { InventoryCategory } from '@prisma/client'
import type { StockMovement } from './stock-movement.types'

/**
 * Inventory Item Interface
 * Represents a single inventory item with stock tracking
 */
export interface InventoryItem {
  id: string
  sppgId: string
  itemName: string
  itemCode: string | null
  brand: string | null
  category: InventoryCategory
  foodCategoryId: string | null
  unit: string
  currentStock: number
  minStock: number
  maxStock: number
  reorderQuantity: number | null
  lastPrice: number | null
  averagePrice: number | null
  costPerUnit: number | null
  preferredSupplierId: string | null
  legacySupplierName: string | null
  supplierContact: string | null
  leadTime: number | null
  storageLocation: string
  storageCondition: string | null
  hasExpiry: boolean
  shelfLife: number | null
  calories: number | null
  protein: number | null
  carbohydrates: number | null
  fat: number | null
  fiber: number | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  preferredSupplier?: {
    id: string
    supplierName: string
    supplierCode: string
  } | null
  foodCategory?: {
    id: string
    categoryCode: string
    categoryName: string
    colorCode: string | null
    iconName: string | null
  } | null
}

/**
 * Create Inventory Item Input
 */
export interface CreateInventoryInput {
  itemName: string
  itemCode?: string
  brand?: string
  category: InventoryCategory
  foodCategoryId?: string
  unit: string
  currentStock?: number
  minStock: number
  maxStock: number
  reorderQuantity?: number
  lastPrice?: number
  costPerUnit?: number
  preferredSupplierId?: string
  legacySupplierName?: string
  supplierContact?: string
  leadTime?: number
  storageLocation: string
  storageCondition?: string
  hasExpiry?: boolean
  shelfLife?: number
  calories?: number
  protein?: number
  carbohydrates?: number
  fat?: number
  fiber?: number
  isActive?: boolean
}

/**
 * Update Inventory Item Input
 */
export interface UpdateInventoryInput extends Partial<CreateInventoryInput> {
  id: string
}

/**
 * Inventory Item with Relationships
 */
export interface InventoryItemDetail extends InventoryItem {
  preferredSupplier: {
    id: string
    supplierName: string
    supplierCode: string
    supplierType: string
    phone: string | null
    email: string | null
  } | null
  stockMovements?: StockMovement[]
  _count?: {
    stockMovements: number
    menuIngredients: number
    procurementItems: number
  }
}

/**
 * Inventory Filters
 */
export interface InventoryFilters {
  category?: InventoryCategory
  stockStatus?: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'ALL'
  storageLocation?: string
  supplierId?: string
  isActive?: boolean
  search?: string
  page?: number
  pageSize?: number
}

/**
 * Stock Status Type
 */
export type StockStatus = 'GOOD' | 'LOW' | 'OUT' | 'CRITICAL'

/**
 * Stock Level Info
 */
export interface StockLevelInfo {
  status: StockStatus
  percentage: number
  color: 'success' | 'warning' | 'destructive' | 'secondary'
  label: string
  description: string
}

/**
 * Inventory Statistics
 */
export interface InventoryStats {
  totalItems: number
  activeItems: number
  inactiveItems: number
  lowStockItems: number
  outOfStockItems: number
  totalStockValue: number
  averageStockValue: number
  categoryCounts: Record<InventoryCategory, number>
  categoryValues: Record<InventoryCategory, number>
}

/**
 * Low Stock Item
 */
export interface LowStockItem {
  id: string
  itemName: string
  itemCode: string | null
  category: InventoryCategory
  currentStock: number
  minStock: number
  maxStock: number
  reorderQuantity: number | null
  unit: string
  stockPercentage: number
  needsReorder: boolean
  suggestedReorderQty: number
  preferredSupplier?: {
    id: string
    supplierName: string
    phone: string | null
  } | null
}

/**
 * Inventory Item Response (API)
 */
export interface InventoryItemResponse {
  success: boolean
  data?: InventoryItem
  error?: string
  details?: Record<string, unknown>
}

/**
 * Inventory List Response (API)
 */
export interface InventoryListResponse {
  success: boolean
  data?: InventoryItem[]
  pagination?: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
  error?: string
}

/**
 * Inventory Stats Response (API)
 */
export interface InventoryStatsResponse {
  success: boolean
  data?: InventoryStats
  error?: string
}
