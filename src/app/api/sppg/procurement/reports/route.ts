/**
 * @fileoverview Procurement Reports API - Comprehensive Reporting & Analytics
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * GET /api/sppg/procurement/reports
 * 
 * Generates comprehensive procurement reports with:
 * - Cost analysis across procurement → production → distribution
 * - Supplier performance metrics
 * - Menu usage and popularity analysis
 * - Budget vs actual cost comparisons
 * - Trend analysis over time periods
 * - Export support (JSON, CSV)
 * 
 * Query Parameters:
 * - reportType: cost-analysis | supplier-performance | menu-usage | budget-tracking
 * - startDate: ISO datetime
 * - endDate: ISO datetime
 * - format: json | csv
 * - programId: Filter by program (optional)
 * - supplierId: Filter by supplier (optional)
 * 
 * Security:
 * - Protected by withSppgAuth wrapper
 * - Multi-tenant filtering by sppgId
 * - Read-only operations (safe for all SPPG roles)
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

// ============================================================================
// Report Types
// ============================================================================

type ReportType = 'cost-analysis' | 'supplier-performance' | 'menu-usage' | 'budget-tracking'
type ReportFormat = 'json' | 'csv'

interface CostAnalysisData {
  period: string
  totalProcurementCost: number
  totalProductionCost: number
  totalDistributionCost: number
  grandTotalCost: number
  totalMeals: number
  costPerMeal: number
  budgetUtilization: number // percentage
}

interface SupplierPerformanceData {
  supplierId: string
  supplierName: string
  totalOrders: number
  completedOrders: number
  totalValue: number
  averageDeliveryTime: number // days
  qualityScore: number // percentage
  reliabilityScore: number // percentage
}

interface MenuUsageData {
  menuId: string
  menuName: string
  timesProduced: number
  totalPortions: number
  averageCost: number
  popularity: number // percentage based on frequency
}

interface BudgetTrackingData {
  period: string
  plannedBudget: number
  allocatedBudget: number
  usedBudget: number
  remainingBudget: number
  utilizationRate: number // percentage
  variance: number // difference from planned
  variancePercentage: number
}

// ============================================================================
// GET Handler - Generate Reports
// ============================================================================

/**
 * GET /api/sppg/procurement/reports
 * 
 * Generates comprehensive procurement reports based on query parameters
 * Supports multiple report types and export formats
 * 
 * @param request - NextRequest with query parameters
 * @returns Promise<NextResponse> - Report data or CSV download
 * @rbac Protected by withSppgAuth - all SPPG roles can access
 */
export async function GET(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      const sppgId = session.user.sppgId!
      const { searchParams } = new URL(request.url)

      // Parse query parameters
      const reportType = (searchParams.get('reportType') || 'cost-analysis') as ReportType
      const format = (searchParams.get('format') || 'json') as ReportFormat
      const startDateParam = searchParams.get('startDate')
      const endDateParam = searchParams.get('endDate')
      const programId = searchParams.get('programId')
      const supplierId = searchParams.get('supplierId')

      // Validate date range
      if (!startDateParam || !endDateParam) {
        return NextResponse.json(
          {
            success: false,
            error: 'Start date and end date are required',
            message: 'Please provide startDate and endDate query parameters'
          },
          { status: 400 }
        )
      }

      const startDate = new Date(startDateParam)
      const endDate = new Date(endDateParam)

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid date format',
            message: 'Please provide dates in ISO format (YYYY-MM-DD)'
          },
          { status: 400 }
        )
      }

      if (startDate > endDate) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid date range',
            message: 'Start date must be before or equal to end date'
          },
          { status: 400 }
        )
      }

      // Generate report based on type
      let reportData: unknown

      switch (reportType) {
        case 'cost-analysis':
          reportData = await generateCostAnalysisReport(sppgId, startDate, endDate, programId)
          break
        
        case 'supplier-performance':
          reportData = await generateSupplierPerformanceReport(sppgId, startDate, endDate, supplierId)
          break
        
        case 'menu-usage':
          reportData = await generateMenuUsageReport(sppgId, startDate, endDate, programId)
          break
        
        case 'budget-tracking':
          reportData = await generateBudgetTrackingReport(sppgId, startDate, endDate, programId)
          break
        
        default:
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid report type',
              message: 'Supported types: cost-analysis, supplier-performance, menu-usage, budget-tracking'
            },
            { status: 400 }
          )
      }

      // Format response
      if (format === 'csv') {
        const csv = convertToCSV(reportData)
        return new NextResponse(csv, {
          status: 200,
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="procurement-report-${reportType}-${Date.now()}.csv"`
          }
        })
      }

      // JSON response (default)
      return NextResponse.json(
        {
          success: true,
          data: {
            reportType,
            period: {
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString()
            },
            filters: {
              programId: programId || null,
              supplierId: supplierId || null
            },
            generatedAt: new Date().toISOString(),
            reportData
          }
        },
        { status: 200 }
      )

    } catch (error) {
      console.error('[Procurement Reports] Error:', {
        error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'N/A',
      })
      
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to generate report',
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
          details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined
        },
        { status: 500 }
      )
    }
  })
}

// ============================================================================
// Report Generation Functions
// ============================================================================

/**
 * Generate cost analysis report
 * Aggregates costs across procurement, production, and distribution
 */
async function generateCostAnalysisReport(
  sppgId: string,
  startDate: Date,
  endDate: Date,
  programId?: string | null
): Promise<CostAnalysisData[]> {
  // Fetch productions with cost data
  const productions = await db.foodProduction.findMany({
    where: {
      sppgId,
      productionDate: {
        gte: startDate,
        lte: endDate
      },
      ...(programId && { programId })
    },
    select: {
      productionDate: true,
      totalCost: true,
      costPerMeal: true,
      actualPortions: true,
      plannedPortions: true
    }
  })

  // Fetch distributions with cost data
  const distributions = await db.foodDistribution.findMany({
    where: {
      sppgId,
      distributionDate: {
        gte: startDate,
        lte: endDate
      },
      ...(programId && { programId })
    },
    select: {
      distributionDate: true,
      totalProductionCost: true,
      totalDistributionCost: true,
      totalCostPerMeal: true,
      actualRecipients: true,
      plannedRecipients: true
    }
  })

  // Group by month
  const costsByMonth = new Map<string, {
    productionCost: number
    distributionCost: number
    totalMeals: number
  }>()

  // Aggregate production costs
  for (const production of productions) {
    const monthKey = `${production.productionDate.getFullYear()}-${String(production.productionDate.getMonth() + 1).padStart(2, '0')}`
    const existing = costsByMonth.get(monthKey) || { productionCost: 0, distributionCost: 0, totalMeals: 0 }
    
    existing.productionCost += production.totalCost || 0
    existing.totalMeals += production.actualPortions || production.plannedPortions || 0
    
    costsByMonth.set(monthKey, existing)
  }

  // Aggregate distribution costs
  for (const distribution of distributions) {
    const monthKey = `${distribution.distributionDate.getFullYear()}-${String(distribution.distributionDate.getMonth() + 1).padStart(2, '0')}`
    const existing = costsByMonth.get(monthKey) || { productionCost: 0, distributionCost: 0, totalMeals: 0 }
    
    existing.distributionCost += (distribution.totalDistributionCost || 0)
    existing.totalMeals += distribution.actualRecipients || distribution.plannedRecipients || 0
    
    costsByMonth.set(monthKey, existing)
  }

  // Convert to array and calculate totals
  const report: CostAnalysisData[] = []
  const entries = Array.from(costsByMonth.entries())
  
  for (const [period, data] of entries) {
    const grandTotalCost = data.productionCost + data.distributionCost
    const costPerMeal = data.totalMeals > 0 ? grandTotalCost / data.totalMeals : 0
    
    report.push({
      period,
      totalProcurementCost: 0, // Not directly tracked, embedded in production cost
      totalProductionCost: data.productionCost,
      totalDistributionCost: data.distributionCost,
      grandTotalCost,
      totalMeals: data.totalMeals,
      costPerMeal,
      budgetUtilization: 0 // Would need budget data to calculate
    })
  }

  return report.sort((a, b) => a.period.localeCompare(b.period))
}

/**
 * Generate supplier performance report
 */
async function generateSupplierPerformanceReport(
  sppgId: string,
  startDate: Date,
  endDate: Date,
  supplierId?: string | null
): Promise<SupplierPerformanceData[]> {
  const procurements = await db.procurement.findMany({
    where: {
      sppgId,
      procurementDate: {
        gte: startDate,
        lte: endDate
      },
      ...(supplierId && { supplierId })
    },
    select: {
      id: true,
      supplierId: true,
      supplierName: true,
      status: true,
      totalAmount: true,
      procurementDate: true,
      actualDelivery: true,
      expectedDelivery: true
    }
  })

  // Group by supplier
  const supplierStats = new Map<string, {
    supplierName: string
    totalOrders: number
    completedOrders: number
    totalValue: number
    deliveryTimes: number[]
  }>()

  for (const procurement of procurements) {
    const supplierName = procurement.supplierName || 'Unknown Supplier'
    
    const existing = supplierStats.get(procurement.supplierId) || {
      supplierName,
      totalOrders: 0,
      completedOrders: 0,
      totalValue: 0,
      deliveryTimes: []
    }

    existing.totalOrders++
    if (procurement.status === 'COMPLETED' || procurement.status === 'FULLY_RECEIVED') {
      existing.completedOrders++
    }
    existing.totalValue += procurement.totalAmount || 0

    // Calculate delivery time if both dates are available
    if (procurement.actualDelivery && procurement.expectedDelivery) {
      const days = Math.ceil((procurement.actualDelivery.getTime() - procurement.expectedDelivery.getTime()) / (1000 * 60 * 60 * 24))
      existing.deliveryTimes.push(days)
    }

    supplierStats.set(procurement.supplierId, existing)
  }

  // Convert to report format
  const report: SupplierPerformanceData[] = []
  const entries = Array.from(supplierStats.entries())
  
  for (const [supplierId, data] of entries) {
    const averageDeliveryTime = data.deliveryTimes.length > 0
      ? data.deliveryTimes.reduce((sum, t) => sum + t, 0) / data.deliveryTimes.length
      : 0
    
    const reliabilityScore = data.totalOrders > 0
      ? (data.completedOrders / data.totalOrders) * 100
      : 0

    report.push({
      supplierId,
      supplierName: data.supplierName,
      totalOrders: data.totalOrders,
      completedOrders: data.completedOrders,
      totalValue: data.totalValue,
      averageDeliveryTime,
      qualityScore: 85, // Placeholder - would need quality control data
      reliabilityScore
    })
  }

  return report.sort((a, b) => b.totalValue - a.totalValue)
}

/**
 * Generate menu usage report
 */
async function generateMenuUsageReport(
  sppgId: string,
  startDate: Date,
  endDate: Date,
  programId?: string | null
): Promise<MenuUsageData[]> {
  const productions = await db.foodProduction.findMany({
    where: {
      sppgId,
      productionDate: {
        gte: startDate,
        lte: endDate
      },
      ...(programId && { programId })
    },
    include: {
      menu: {
        select: {
          id: true,
          menuName: true
        }
      }
    }
  })

  // Group by menu
  const menuStats = new Map<string, {
    menuName: string
    timesProduced: number
    totalPortions: number
    totalCost: number
  }>()

  for (const production of productions) {
    const existing = menuStats.get(production.menuId) || {
      menuName: production.menu.menuName,
      timesProduced: 0,
      totalPortions: 0,
      totalCost: 0
    }

    existing.timesProduced++
    existing.totalPortions += production.actualPortions || production.plannedPortions || 0
    existing.totalCost += production.totalCost || 0

    menuStats.set(production.menuId, existing)
  }

  // Calculate total productions for popularity percentage
  const totalProductions = productions.length

  // Convert to report format
  const report: MenuUsageData[] = []
  const entries = Array.from(menuStats.entries())
  
  for (const [menuId, data] of entries) {
    const averageCost = data.timesProduced > 0 ? data.totalCost / data.timesProduced : 0
    const popularity = totalProductions > 0 ? (data.timesProduced / totalProductions) * 100 : 0

    report.push({
      menuId,
      menuName: data.menuName,
      timesProduced: data.timesProduced,
      totalPortions: data.totalPortions,
      averageCost,
      popularity
    })
  }

  return report.sort((a, b) => b.timesProduced - a.timesProduced)
}

/**
 * Generate budget tracking report
 */
async function generateBudgetTrackingReport(
  sppgId: string,
  startDate: Date,
  endDate: Date,
  programId?: string | null
): Promise<BudgetTrackingData[]> {
  const procurementPlans = await db.procurementPlan.findMany({
    where: {
      sppgId,
      createdAt: {
        gte: startDate,
        lte: endDate
      },
      ...(programId && { programId })
    },
    select: {
      planMonth: true,
      totalBudget: true,
      allocatedBudget: true,
      usedBudget: true,
      remainingBudget: true
    }
  })

  // Group by month
  const budgetByMonth = new Map<string, {
    plannedBudget: number
    allocatedBudget: number
    usedBudget: number
    remainingBudget: number
  }>()

  for (const plan of procurementPlans) {
    const monthKey = plan.planMonth
    const existing = budgetByMonth.get(monthKey) || {
      plannedBudget: 0,
      allocatedBudget: 0,
      usedBudget: 0,
      remainingBudget: 0
    }

    existing.plannedBudget += plan.totalBudget || 0
    existing.allocatedBudget += plan.allocatedBudget || 0
    existing.usedBudget += plan.usedBudget || 0
    existing.remainingBudget += plan.remainingBudget || 0

    budgetByMonth.set(monthKey, existing)
  }

  // Convert to report format
  const report: BudgetTrackingData[] = []
  const entries = Array.from(budgetByMonth.entries())
  
  for (const [period, data] of entries) {
    const utilizationRate = data.plannedBudget > 0
      ? (data.usedBudget / data.plannedBudget) * 100
      : 0
    
    const variance = data.usedBudget - data.plannedBudget
    const variancePercentage = data.plannedBudget > 0
      ? (variance / data.plannedBudget) * 100
      : 0

    report.push({
      period,
      plannedBudget: data.plannedBudget,
      allocatedBudget: data.allocatedBudget,
      usedBudget: data.usedBudget,
      remainingBudget: data.remainingBudget,
      utilizationRate,
      variance,
      variancePercentage
    })
  }

  return report.sort((a, b) => a.period.localeCompare(b.period))
}

/**
 * Convert report data to CSV format
 */
function convertToCSV(data: unknown): string {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return 'No data available'
  }

  // Get headers from first object
  const headers = Object.keys(data[0])
  
  // Create CSV rows
  const rows = data.map((row: Record<string, unknown>) => 
    headers.map(header => {
      const value = row[header]
      // Escape and quote string values
      if (typeof value === 'string') {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    }).join(',')
  )

  // Combine headers and rows
  return [headers.join(','), ...rows].join('\n')
}
