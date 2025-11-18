/**
 * @fileoverview Report Types for Procurement Dashboard
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

// Report Types
export type ReportType = 
  | 'cost-analysis' 
  | 'supplier-performance' 
  | 'menu-usage' 
  | 'budget-tracking'

// Report Filters
export interface ReportFilters {
  reportType: ReportType
  startDate: string // ISO string
  endDate: string // ISO string
  format?: 'json' | 'csv'
  programId?: string
  supplierId?: string
}

// Cost Analysis Row
export interface CostAnalysisRow {
  period: string
  totalProcurement: number
  totalProduction: number
  totalDistribution: number
  grandTotal: number
  costPerMeal: number
}

// Supplier Performance Row
export interface SupplierPerformanceRow {
  supplier: string
  totalOrders: number
  completedOrders: number
  totalValue: number
  avgDeliveryTime: number // days
  qualityScore: number // percentage
}

// Menu Usage Row
export interface MenuUsageRow {
  menuName: string
  timesProduced: number
  totalPortions: number
  avgCost: number
  popularity: number // percentage
}

// Budget Tracking Row
export interface BudgetTrackingRow {
  period: string
  plannedBudget: number
  usedBudget: number
  remaining: number
  utilizationRate: number // percentage
  variance: number
}

// Union type for all row types
export type ReportRow = 
  | CostAnalysisRow 
  | SupplierPerformanceRow 
  | MenuUsageRow 
  | BudgetTrackingRow

// API Response
export interface ReportResponse {
  success: boolean
  data?: ReportRow[]
  error?: string
}

// Program and Supplier types for filters
export interface Program {
  id: string
  programName: string
  programCode: string
}

export interface Supplier {
  id: string
  supplierName: string
}
