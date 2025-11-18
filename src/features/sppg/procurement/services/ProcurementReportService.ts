/**
 * @fileoverview Procurement Report Service
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * BUSINESS LOGIC:
 * - Generate comprehensive procurement reports using snapshot fields
 * - Supplier purchase reports with historical data tracking
 * - Item analysis reports by category
 * - Budget tracking and utilization reports
 * - Cost flow reports (procurement → production → distribution)
 * - Reconciliation reports for data changes
 * 
 * CRITICAL DESIGN PATTERNS:
 * - ✅ Always use snapshot fields (supplierName, itemName, pricePerUnit) for historical accuracy
 * - ✅ Group by reference IDs (supplierId, inventoryItemId), NOT snapshot names
 * - ✅ Track and indicate data changes (supplier name changes, price changes)
 * - ✅ Provide reconciliation reports for audit trail
 */

import { db } from '@/lib/prisma'
import { InventoryCategory, Prisma } from '@prisma/client'

/**
 * Interface for supplier purchase report data
 */
interface SupplierPurchaseReport {
  supplierId: string
  currentSupplierName: string // Current name from Supplier table
  totalPurchases: number
  totalAmount: number
  totalItems: number
  averageOrderValue: number
  purchases: Array<{
    procurementCode: string
    procurementDate: Date
    supplierNameAtPurchase: string // ✅ Historical snapshot
    supplierContactAtPurchase: string | null // ✅ Historical snapshot
    totalAmount: number
    paymentStatus: string
    hasNameChange: boolean // Indicates if supplier name changed
  }>
}

/**
 * Interface for item analysis report
 */
interface ItemAnalysisReport {
  category: InventoryCategory
  totalItems: number
  totalQuantity: number
  totalCost: number
  averagePrice: number
  items: Array<{
    inventoryItemId: string | null
    currentItemName: string // Current name from InventoryItem table
    itemNameAtPurchase: string // ✅ Historical snapshot
    priceAtPurchase: number // ✅ Historical snapshot
    currentPrice: number // Current price from InventoryItem
    totalQuantity: number
    totalCost: number
    purchaseCount: number
    hasPriceChange: boolean // Indicates if price changed
    hasNameChange: boolean // Indicates if item name changed
  }>
}

/**
 * Interface for cost flow report
 */
interface CostFlowReport {
  procurementPlanId: string
  planName: string
  period: string
  flow: {
    procurement: {
      totalCost: number
      itemCount: number
      supplierCount: number
    }
    production: {
      totalCost: number
      productionCount: number
      mealsProduced: number
      costPerMeal: number
    }
    distribution: {
      totalCost: number
      distributionCount: number
      mealsDelivered: number
      costPerMeal: number
    }
    summary: {
      totalCostAllStages: number
      finalCostPerMeal: number
      efficiencyRate: number // How much of procurement cost reached distribution
    }
  }
}

/**
 * Interface for reconciliation report (data changes tracking)
 */
interface ReconciliationReport {
  reportDate: Date
  supplierChanges: Array<{
    supplierId: string
    currentName: string
    procurementsWithDifferentName: Array<{
      procurementCode: string
      historicalName: string
      procurementDate: Date
    }>
  }>
  itemChanges: Array<{
    inventoryItemId: string
    currentName: string
    currentPrice: number
    procurementsWithDifferences: Array<{
      procurementCode: string
      historicalName: string
      historicalPrice: number
      procurementDate: Date
    }>
  }>
  summary: {
    totalSupplierNameChanges: number
    totalItemNameChanges: number
    totalPriceChanges: number
  }
}

/**
 * Procurement Report Service
 * Generates comprehensive reports with historical accuracy using snapshot fields
 */
export class ProcurementReportService {
  /**
   * Generate supplier purchase report
   * Groups by supplierId (NOT snapshot name), tracks historical name changes
   * 
   * @param sppgId - SPPG ID for multi-tenant isolation
   * @param filters - Report filters
   * @returns Supplier purchase report with historical tracking
   */
  async generateSupplierPurchaseReport(
    sppgId: string,
    filters: {
      startDate?: Date
      endDate?: Date
      supplierId?: string
    }
  ): Promise<SupplierPurchaseReport[]> {
    // Build where clause
    const where: Prisma.ProcurementWhereInput = {
      sppgId, // ✅ Multi-tenant isolation
      ...(filters.supplierId && { supplierId: filters.supplierId }),
      ...(filters.startDate && {
        procurementDate: {
          gte: filters.startDate,
        },
      }),
      ...(filters.endDate && {
        procurementDate: {
          lte: filters.endDate,
        },
      }),
    }

    // Fetch procurements with snapshot fields
    const procurements = await db.procurement.findMany({
      where,
      select: {
        id: true,
        procurementCode: true,
        procurementDate: true,
        supplierId: true,
        supplierName: true, // ✅ Historical snapshot
        supplierContact: true, // ✅ Historical snapshot
        totalAmount: true,
        paymentStatus: true,
        supplier: {
          // ✅ Current data for comparison
          select: {
            id: true,
            supplierName: true,
          },
        },
        items: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        procurementDate: 'desc',
      },
    })

    // Group by supplierId (NOT by snapshot name!)
    const supplierMap = new Map<string, SupplierPurchaseReport>()

    for (const proc of procurements) {
      const supplierId = proc.supplierId

      if (!supplierMap.has(supplierId)) {
        supplierMap.set(supplierId, {
          supplierId,
          currentSupplierName: proc.supplier?.supplierName || 'Unknown', // Current name from relation
          totalPurchases: 0,
          totalAmount: 0,
          totalItems: 0,
          averageOrderValue: 0,
          purchases: [],
        })
      }

      const report = supplierMap.get(supplierId)!
      report.totalPurchases++
      report.totalAmount += proc.totalAmount
      report.totalItems += proc.items?.length || 0

      // Check if name changed
      const hasNameChange = proc.supplierName !== proc.supplier?.supplierName

      report.purchases.push({
        procurementCode: proc.procurementCode,
        procurementDate: proc.procurementDate,
        supplierNameAtPurchase: proc.supplierName || proc.supplier?.supplierName || 'Unknown', // ✅ Use snapshot
        supplierContactAtPurchase: proc.supplierContact, // ✅ Use snapshot
        totalAmount: proc.totalAmount,
        paymentStatus: proc.paymentStatus,
        hasNameChange, // ✅ Indicate data change
      })
    }

    // Calculate averages
    const reports = Array.from(supplierMap.values())
    for (const report of reports) {
      report.averageOrderValue = report.totalPurchases > 0 ? report.totalAmount / report.totalPurchases : 0
    }

    return reports.sort((a, b) => b.totalAmount - a.totalAmount)
  }

  /**
   * Generate item analysis report by category
   * Groups by inventoryItemId, tracks historical name and price changes
   * 
   * @param sppgId - SPPG ID for multi-tenant isolation
   * @param filters - Report filters
   * @returns Item analysis report with historical tracking
   */
  async generateItemAnalysisReport(
    sppgId: string,
    filters: {
      startDate?: Date
      endDate?: Date
      category?: InventoryCategory
    }
  ): Promise<ItemAnalysisReport[]> {
    // Build where clause
    const procurementWhere: Prisma.ProcurementWhereInput = {
      sppgId, // ✅ Multi-tenant isolation
      ...(filters.startDate && {
        procurementDate: {
          gte: filters.startDate,
        },
      }),
      ...(filters.endDate && {
        procurementDate: {
          lte: filters.endDate,
        },
      }),
    }

    const itemWhere: Prisma.ProcurementItemWhereInput = {
      ...(filters.category && { category: filters.category }),
    }

    // Fetch procurement items with snapshot fields
    const procurementItems = await db.procurementItem.findMany({
      where: {
        ...itemWhere,
        procurement: procurementWhere,
      },
      select: {
        inventoryItemId: true,
        itemName: true, // ✅ Historical snapshot
        itemCode: true, // ✅ Historical snapshot
        category: true, // ✅ Historical snapshot
        pricePerUnit: true, // ✅ Historical snapshot
        orderedQuantity: true,
        receivedQuantity: true,
        finalPrice: true,
        procurement: {
          select: {
            procurementCode: true,
            procurementDate: true,
          },
        },
        inventoryItem: {
          // ✅ Current data for comparison
          select: {
            itemName: true,
            costPerUnit: true,
          },
        },
      },
    })

    // Group by category
    const categoryMap = new Map<InventoryCategory, ItemAnalysisReport>()

    for (const item of procurementItems) {
      const category = item.category

      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          category,
          totalItems: 0,
          totalQuantity: 0,
          totalCost: 0,
          averagePrice: 0,
          items: [],
        })
      }

      const report = categoryMap.get(category)!
      const quantity = item.receivedQuantity || item.orderedQuantity

      report.totalQuantity += quantity
      report.totalCost += item.finalPrice

      // Group items by inventoryItemId within category
      const existingItem = report.items.find((i) => i.inventoryItemId === item.inventoryItemId)

      const currentName = item.inventoryItem?.itemName || item.itemName
      const currentPrice = item.inventoryItem?.costPerUnit || item.pricePerUnit
      const hasNameChange = item.inventoryItem ? item.itemName !== item.inventoryItem.itemName : false
      const hasPriceChange = item.inventoryItem ? item.pricePerUnit !== item.inventoryItem.costPerUnit : false

      if (existingItem) {
        existingItem.totalQuantity += quantity
        existingItem.totalCost += item.finalPrice
        existingItem.purchaseCount++
      } else {
        report.totalItems++
        report.items.push({
          inventoryItemId: item.inventoryItemId,
          currentItemName: currentName, // Current name
          itemNameAtPurchase: item.itemName, // ✅ Historical snapshot
          priceAtPurchase: item.pricePerUnit, // ✅ Historical snapshot
          currentPrice, // Current price
          totalQuantity: quantity,
          totalCost: item.finalPrice,
          purchaseCount: 1,
          hasPriceChange, // ✅ Indicate price change
          hasNameChange, // ✅ Indicate name change
        })
      }
    }

    // Calculate averages
    const reports = Array.from(categoryMap.values())
    for (const report of reports) {
      report.averagePrice = report.totalQuantity > 0 ? report.totalCost / report.totalQuantity : 0
      // Sort items by total cost descending
      report.items.sort((a, b) => b.totalCost - a.totalCost)
    }

    return reports
  }

  /**
   * Generate cost flow report
   * Track costs from procurement → production → distribution
   * 
   * @param procurementPlanId - Procurement plan ID
   * @param sppgId - SPPG ID for multi-tenant isolation
   * @returns Complete cost flow report
   */
  async generateCostFlowReport(procurementPlanId: string, sppgId: string): Promise<CostFlowReport> {
    // Get procurement plan with all related data
    const plan = await db.procurementPlan.findUnique({
      where: {
        id: procurementPlanId,
        sppgId, // ✅ Multi-tenant isolation
      },
      include: {
        procurements: {
          include: {
            items: true,
          },
        },
        productions: {
          include: {
            usageRecords: true,
          },
        },
        distributions: true,
      },
    })

    if (!plan) {
      throw new Error('Procurement plan not found')
    }

    // Calculate procurement stage
    const uniqueSuppliers = new Set(plan.procurements.map((p) => p.supplierId))
    const totalProcurementCost = plan.procurements.reduce((sum, p) => sum + p.totalAmount, 0)
    const totalProcurementItems = plan.procurements.reduce((sum, p) => sum + p.items.length, 0)

    // Calculate production stage
    const totalProductionCost = plan.productions.reduce((sum, p) => sum + (p.totalCost || 0), 0)
    const totalMealsProduced = plan.productions.reduce(
      (sum, p) => sum + (p.actualPortions || p.plannedPortions),
      0
    )
    const productionCostPerMeal = totalMealsProduced > 0 ? totalProductionCost / totalMealsProduced : 0

    // Calculate distribution stage
    const totalDistributionCost = plan.distributions.reduce(
      (sum, d) =>
        sum +
        (d.totalDistributionCost || 0) +
        (d.transportCost || 0) +
        (d.packagingCost || 0) +
        (d.laborCost || 0) +
        (d.otherCosts || 0),
      0
    )
    const totalMealsDelivered = plan.distributions.reduce(
      (sum, d) => sum + (d.actualRecipients || d.plannedRecipients),
      0
    )
    const distributionCostPerMeal = totalMealsDelivered > 0 ? totalDistributionCost / totalMealsDelivered : 0

    // Calculate summary
    const totalCostAllStages = totalProcurementCost + totalProductionCost + totalDistributionCost
    const finalCostPerMeal = totalMealsDelivered > 0 ? totalCostAllStages / totalMealsDelivered : 0
    const efficiencyRate =
      totalProcurementCost > 0 ? (totalDistributionCost / totalProcurementCost) * 100 : 0

    return {
      procurementPlanId: plan.id,
      planName: plan.planName,
      period: `${plan.planMonth} ${plan.planYear}`,
      flow: {
        procurement: {
          totalCost: totalProcurementCost,
          itemCount: totalProcurementItems,
          supplierCount: uniqueSuppliers.size,
        },
        production: {
          totalCost: totalProductionCost,
          productionCount: plan.productions.length,
          mealsProduced: totalMealsProduced,
          costPerMeal: productionCostPerMeal,
        },
        distribution: {
          totalCost: totalDistributionCost,
          distributionCount: plan.distributions.length,
          mealsDelivered: totalMealsDelivered,
          costPerMeal: distributionCostPerMeal,
        },
        summary: {
          totalCostAllStages,
          finalCostPerMeal,
          efficiencyRate,
        },
      },
    }
  }

  /**
   * Generate reconciliation report
   * Identifies all data changes (supplier names, item names, prices)
   * 
   * @param sppgId - SPPG ID for multi-tenant isolation
   * @param filters - Report filters
   * @returns Reconciliation report with all data changes
   */
  async generateReconciliationReport(
    sppgId: string,
    filters: {
      startDate?: Date
      endDate?: Date
    }
  ): Promise<ReconciliationReport> {
    // Build where clause
    const where: Prisma.ProcurementWhereInput = {
      sppgId, // ✅ Multi-tenant isolation
      ...(filters.startDate && {
        procurementDate: {
          gte: filters.startDate,
        },
      }),
      ...(filters.endDate && {
        procurementDate: {
          lte: filters.endDate,
        },
      }),
    }

    // Fetch procurements with snapshot fields
    const procurements = await db.procurement.findMany({
      where,
      select: {
        procurementCode: true,
        procurementDate: true,
        supplierId: true,
        supplierName: true, // ✅ Historical snapshot
        supplier: {
          // ✅ Current data
          select: {
            id: true,
            supplierName: true,
          },
        },
        items: {
          select: {
            inventoryItemId: true,
            itemName: true, // ✅ Historical snapshot
            pricePerUnit: true, // ✅ Historical snapshot
            inventoryItem: {
              // ✅ Current data
              select: {
                itemName: true,
                costPerUnit: true,
              },
            },
          },
        },
      },
    })

    // Track supplier name changes
    const supplierChangesMap = new Map<
      string,
      {
        supplierId: string
        currentName: string
        procurementsWithDifferentName: ReconciliationReport['supplierChanges'][0]['procurementsWithDifferentName']
      }
    >()

    // Track item changes
    const itemChangesMap = new Map<
      string,
      {
        inventoryItemId: string
        currentName: string
        currentPrice: number
        procurementsWithDifferences: ReconciliationReport['itemChanges'][0]['procurementsWithDifferences']
      }
    >()

    let totalSupplierNameChanges = 0
    let totalItemNameChanges = 0
    let totalPriceChanges = 0

    for (const proc of procurements) {
      // Check supplier name change
      if (proc.supplierName && proc.supplierName !== proc.supplier?.supplierName) {
        if (!supplierChangesMap.has(proc.supplierId)) {
          supplierChangesMap.set(proc.supplierId, {
            supplierId: proc.supplierId,
            currentName: proc.supplier?.supplierName || 'Unknown',
            procurementsWithDifferentName: [],
          })
        }

        const supplierChange = supplierChangesMap.get(proc.supplierId)!
        supplierChange.procurementsWithDifferentName.push({
          procurementCode: proc.procurementCode,
          historicalName: proc.supplierName,
          procurementDate: proc.procurementDate,
        })
        totalSupplierNameChanges++
      }

      // Check item changes
      for (const item of proc.items || []) {
        if (!item.inventoryItemId || !item.inventoryItem) continue

        const hasNameChange = item.itemName !== item.inventoryItem.itemName
        const hasPriceChange = item.pricePerUnit !== (item.inventoryItem.costPerUnit || 0)

        if (hasNameChange || hasPriceChange) {
          if (!itemChangesMap.has(item.inventoryItemId)) {
            itemChangesMap.set(item.inventoryItemId, {
              inventoryItemId: item.inventoryItemId,
              currentName: item.inventoryItem.itemName,
              currentPrice: item.inventoryItem.costPerUnit || 0,
              procurementsWithDifferences: [],
            })
          }

          const itemChange = itemChangesMap.get(item.inventoryItemId)!
          itemChange.procurementsWithDifferences.push({
            procurementCode: proc.procurementCode,
            historicalName: item.itemName,
            historicalPrice: item.pricePerUnit,
            procurementDate: proc.procurementDate,
          })

          if (hasNameChange) totalItemNameChanges++
          if (hasPriceChange) totalPriceChanges++
        }
      }
    }

    return {
      reportDate: new Date(),
      supplierChanges: Array.from(supplierChangesMap.values()),
      itemChanges: Array.from(itemChangesMap.values()),
      summary: {
        totalSupplierNameChanges,
        totalItemNameChanges,
        totalPriceChanges,
      },
    }
  }

  /**
   * Generate summary report
   * High-level overview with key metrics
   * 
   * @param sppgId - SPPG ID for multi-tenant isolation
   * @param period - Report period (e.g., "2025-01" for monthly)
   * @returns Summary report
   */
  async generateSummaryReport(
    sppgId: string,
    period: {
      startDate: Date
      endDate: Date
    }
  ): Promise<{
    period: string
    procurement: {
      totalOrders: number
      totalAmount: number
      totalSuppliers: number
      averageOrderValue: number
    }
    production: {
      totalProductions: number
      totalMeals: number
      averageCostPerMeal: number
    }
    distribution: {
      totalDistributions: number
      totalMeals: number
      averageCostPerMeal: number
    }
    budget: {
      allocated: number
      spent: number
      remaining: number
      utilizationRate: number
    }
  }> {
    // Procurement metrics
    const procurements = await db.procurement.findMany({
      where: {
        sppgId,
        procurementDate: {
          gte: period.startDate,
          lte: period.endDate,
        },
      },
    })

    const uniqueSuppliers = new Set(procurements.map((p) => p.supplierId))
    const totalProcurementAmount = procurements.reduce((sum, p) => sum + p.totalAmount, 0)
    const avgOrderValue = procurements.length > 0 ? totalProcurementAmount / procurements.length : 0

    // Production metrics
    const productions = await db.foodProduction.findMany({
      where: {
        sppgId,
        productionDate: {
          gte: period.startDate,
          lte: period.endDate,
        },
      },
    })

    const totalMealsProduced = productions.reduce((sum, p) => sum + (p.actualPortions || p.plannedPortions), 0)
    const totalProductionCost = productions.reduce((sum, p) => sum + (p.totalCost || 0), 0)
    const avgProductionCostPerMeal = totalMealsProduced > 0 ? totalProductionCost / totalMealsProduced : 0

    // Distribution metrics
    const distributions = await db.foodDistribution.findMany({
      where: {
        sppgId,
        distributionDate: {
          gte: period.startDate,
          lte: period.endDate,
        },
      },
    })

    const totalMealsDelivered = distributions.reduce((sum, d) => sum + (d.actualRecipients || d.plannedRecipients), 0)
    const totalDistributionCost = distributions.reduce(
      (sum, d) =>
        sum +
        (d.totalProcurementCost || 0) +
        (d.totalProductionCost || 0) +
        (d.totalDistributionCost || 0),
      0
    )
    const avgDistributionCostPerMeal = totalMealsDelivered > 0 ? totalDistributionCost / totalMealsDelivered : 0

    // Budget metrics (for the month)
    const monthYear = period.startDate.toISOString().split('T')[0].slice(0, 7) // "2025-01"
    const plans = await db.procurementPlan.findMany({
      where: {
        sppgId,
        planMonth: monthYear,
      },
    })

    const totalBudgetAllocated = plans.reduce((sum, p) => sum + p.totalBudget, 0)
    const totalBudgetSpent = plans.reduce((sum, p) => sum + p.usedBudget, 0)
    const remainingBudget = totalBudgetAllocated - totalBudgetSpent
    const utilizationRate = totalBudgetAllocated > 0 ? (totalBudgetSpent / totalBudgetAllocated) * 100 : 0

    return {
      period: `${period.startDate.toLocaleDateString('id-ID')} - ${period.endDate.toLocaleDateString('id-ID')}`,
      procurement: {
        totalOrders: procurements.length,
        totalAmount: totalProcurementAmount,
        totalSuppliers: uniqueSuppliers.size,
        averageOrderValue: avgOrderValue,
      },
      production: {
        totalProductions: productions.length,
        totalMeals: totalMealsProduced,
        averageCostPerMeal: avgProductionCostPerMeal,
      },
      distribution: {
        totalDistributions: distributions.length,
        totalMeals: totalMealsDelivered,
        averageCostPerMeal: avgDistributionCostPerMeal,
      },
      budget: {
        allocated: totalBudgetAllocated,
        spent: totalBudgetSpent,
        remaining: remainingBudget,
        utilizationRate,
      },
    }
  }
}

// Export singleton instance
export const procurementReportService = new ProcurementReportService()
