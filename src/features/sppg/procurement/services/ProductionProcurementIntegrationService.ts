/**
 * @fileoverview Production Procurement Integration Service
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * BUSINESS LOGIC:
 * - Validate production readiness based on procurement status
 * - Track stock usage with procurement item linkage
 * - Calculate accurate production costs from procurement data
 * - Monitor ingredient availability for production scheduling
 * - Generate production cost reports with procurement traceability
 */

import { db } from '@/lib/prisma'

/**
 * Interface for production readiness validation result
 */
interface ProductionReadinessResult {
  isReady: boolean
  readinessPercentage: number
  availableIngredients: Array<{
    itemName: string
    required: number
    available: number
    procured: number
    unit: string
    status: 'AVAILABLE' | 'PARTIAL' | 'UNAVAILABLE'
  }>
  missingIngredients: Array<{
    itemName: string
    required: number
    available: number
    shortfall: number
    unit: string
  }>
  recommendations: string[]
}

/**
 * Interface for stock usage with procurement cost tracking
 */
interface StockUsageWithCost {
  inventoryItemId: string
  itemName: string
  quantityUsed: number
  unit: string
  procurementItemId: string | null
  procurementCost: number // Cost from procurement item snapshot
  totalCost: number
}

/**
 * Interface for production cost breakdown
 */
interface ProductionCostBreakdown {
  totalIngredientCost: number
  totalLaborCost: number
  totalUtilityCost: number
  totalOtherCost: number
  totalProductionCost: number
  costPerMeal: number
  ingredientBreakdown: Array<{
    itemName: string
    quantity: number
    unit: string
    unitCost: number
    totalCost: number
    procurementSource: string | null // Procurement code if from procurement
  }>
}

/**
 * Production Procurement Integration Service
 * Handles integration between production and procurement
 */
export class ProductionProcurementIntegrationService {
  /**
   * Validate production readiness based on procurement
   * Check if all required ingredients are available from procurement or inventory
   * 
   * @param menuId - Menu ID for production
   * @param plannedPortions - Number of portions to produce
   * @param procurementPlanId - Optional procurement plan ID to check against
   * @param sppgId - SPPG ID for multi-tenant isolation
   * @returns Production readiness validation result
   */
  async validateProductionReadiness(
    menuId: string,
    plannedPortions: number,
    sppgId: string,
    procurementPlanId?: string
  ): Promise<ProductionReadinessResult> {
    // 1. Get menu with ingredients
    const menu = await db.nutritionMenu.findUnique({
      where: {
        id: menuId,
      },
      include: {
        ingredients: {
          include: {
            inventoryItem: true,
          },
        },
      },
    })

    if (!menu) {
      throw new Error('Menu not found')
    }

    // 2. Get procurement data if procurement plan provided
    const procuredItems: Map<string, number> = new Map()
    if (procurementPlanId) {
      const procurements = await db.procurement.findMany({
        where: {
          planId: procurementPlanId,
          sppgId, // ✅ Multi-tenant isolation
          status: 'COMPLETED', // Only completed procurements
        },
        include: {
          items: true,
        },
      })

      // Aggregate procured quantities
      for (const procurement of procurements) {
        for (const item of procurement.items) {
          if (item.inventoryItemId && item.isAccepted) {
            const current = procuredItems.get(item.inventoryItemId) || 0
            procuredItems.set(item.inventoryItemId, current + (item.receivedQuantity || 0))
          }
        }
      }
    }

    // 3. Check each ingredient
    const availableIngredients: ProductionReadinessResult['availableIngredients'] = []
    const missingIngredients: ProductionReadinessResult['missingIngredients'] = []
    let totalRequired = 0
    let totalAvailable = 0

    for (const ingredient of menu.ingredients) {
      const item = ingredient.inventoryItem
      const required = ingredient.quantity * plannedPortions
      const currentStock = item.currentStock
      const procured = procuredItems.get(item.id) || 0
      const available = currentStock + procured

      totalRequired += required

      let status: 'AVAILABLE' | 'PARTIAL' | 'UNAVAILABLE'
      if (available >= required) {
        status = 'AVAILABLE'
        totalAvailable += required
      } else if (available > 0) {
        status = 'PARTIAL'
        totalAvailable += available
      } else {
        status = 'UNAVAILABLE'
      }

      availableIngredients.push({
        itemName: item.itemName,
        required,
        available,
        procured,
        unit: item.unit,
        status,
      })

      if (available < required) {
        missingIngredients.push({
          itemName: item.itemName,
          required,
          available,
          shortfall: required - available,
          unit: item.unit,
        })
      }
    }

    // 4. Calculate readiness percentage
    const readinessPercentage = totalRequired > 0 ? (totalAvailable / totalRequired) * 100 : 0
    const isReady = missingIngredients.length === 0

    // 5. Generate recommendations
    const recommendations: string[] = []
    if (!isReady) {
      recommendations.push(
        `${missingIngredients.length} ingredient(s) tidak tersedia atau tidak mencukupi.`
      )
      
      if (procurementPlanId) {
        recommendations.push('Tunggu procurement selesai atau kurangi jumlah porsi produksi.')
      } else {
        recommendations.push('Buat procurement plan terlebih dahulu atau gunakan stok inventory yang ada.')
      }
    }

    if (readinessPercentage >= 80 && readinessPercentage < 100) {
      recommendations.push('Produksi dapat dilakukan dengan penyesuaian porsi atau resep alternatif.')
    }

    return {
      isReady,
      readinessPercentage,
      availableIngredients,
      missingIngredients,
      recommendations,
    }
  }

  /**
   * Record stock usage with procurement linkage
   * Track which procurement items were used in production for cost traceability
   * 
   * @param productionId - Food production ID
   * @param sppgId - SPPG ID for multi-tenant isolation
   * @returns Stock usage records with procurement cost
   */
  async recordStockUsageWithProcurement(
    productionId: string,
    sppgId: string
  ): Promise<StockUsageWithCost[]> {
    // 1. Get production with menu ingredients
    const production = await db.foodProduction.findUnique({
      where: {
        id: productionId,
        sppgId, // ✅ Multi-tenant isolation
      },
      include: {
        menu: {
          include: {
            ingredients: {
              include: {
                inventoryItem: true,
              },
            },
          },
        },
        procurementPlan: {
          include: {
            procurements: {
              where: {
                status: 'COMPLETED',
              },
              include: {
                items: true,
              },
            },
          },
        },
      },
    })

    if (!production) {
      throw new Error('Production not found')
    }

    const actualPortions = production.actualPortions || production.plannedPortions
    const usageRecords: StockUsageWithCost[] = []

    // 2. Process each ingredient
    for (const ingredient of production.menu.ingredients) {
      const item = ingredient.inventoryItem
      const quantityUsed = ingredient.quantity * actualPortions

      // 3. Find matching procurement item (FIFO - First In First Out)
      let procurementItemId: string | null = null
      let procurementCost = 0

      if (production.procurementPlan) {
        // Search in procurement items
        for (const procurement of production.procurementPlan.procurements) {
          for (const procItem of procurement.items) {
            if (
              procItem.inventoryItemId === item.id &&
              procItem.isAccepted &&
              (procItem.receivedQuantity || 0) > 0
            ) {
              // Use procurement item snapshot price
              procurementItemId = procItem.id
              procurementCost = procItem.pricePerUnit // ✅ Historical snapshot price
              break
            }
          }
          if (procurementItemId) break
        }
      }

      // Fallback to current inventory cost if no procurement found
      if (!procurementItemId) {
        procurementCost = item.costPerUnit || item.lastPrice || item.averagePrice || 0
      }

      const totalCost = quantityUsed * procurementCost

      // 4. Create usage record
      await db.productionStockUsage.create({
        data: {
          productionId,
          inventoryItemId: item.id,
          quantityUsed,
          unit: item.unit,
          unitCostAtUse: procurementCost, // ✅ Correct field name from schema
          totalCost,
          procurementItemId, // ✅ NEW: Link to procurement item
          usedAt: new Date(), // ✅ Correct field name from schema
          recordedBy: production.headCook, // ✅ Correct field name from schema
        },
      })

      usageRecords.push({
        inventoryItemId: item.id,
        itemName: item.itemName,
        quantityUsed,
        unit: item.unit,
        procurementItemId,
        procurementCost,
        totalCost,
      })

      // 5. Update inventory stock
      await db.inventoryItem.update({
        where: { id: item.id },
        data: {
          currentStock: {
            decrement: quantityUsed,
          },
        },
      })

      // 6. Create stock movement record
      await db.stockMovement.create({
        data: {
          inventoryId: item.id,
          movementType: 'OUT',
          quantity: quantityUsed,
          unit: item.unit,
          stockBefore: item.currentStock,
          stockAfter: item.currentStock - quantityUsed,
          unitCost: procurementCost,
          totalCost,
          referenceType: 'PRODUCTION',
          referenceId: productionId,
          referenceNumber: `PROD-${production.batchNumber}`, // ✅ Correct field name from schema
          movedBy: production.headCook, // ✅ Correct field name from schema
        },
      })
    }

    return usageRecords
  }

  /**
   * Calculate production cost from procurement data
   * Provides accurate cost breakdown with procurement traceability
   * 
   * @param productionId - Food production ID
   * @param sppgId - SPPG ID for multi-tenant isolation
   * @returns Production cost breakdown
   */
  async calculateProductionCost(
    productionId: string,
    sppgId: string
  ): Promise<ProductionCostBreakdown> {
    // 1. Get production with stock usage
    const production = await db.foodProduction.findUnique({
      where: {
        id: productionId,
        sppgId, // ✅ Multi-tenant isolation
      },
      include: {
        usageRecords: {
          include: {
            inventoryItem: true,
            procurementItem: {
              include: {
                procurement: {
                  select: {
                    procurementCode: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!production) {
      throw new Error('Production not found')
    }

    // 2. Calculate ingredient costs
    let totalIngredientCost = 0
    const ingredientBreakdown: ProductionCostBreakdown['ingredientBreakdown'] = []

    for (const usage of production.usageRecords) {
      const item = usage.inventoryItem
      const totalCost = usage.totalCost

      totalIngredientCost += totalCost

      ingredientBreakdown.push({
        itemName: item.itemName,
        quantity: usage.quantityUsed,
        unit: usage.unit,
        unitCost: usage.unitCostAtUse,
        totalCost,
        procurementSource: usage.procurementItem?.procurement.procurementCode || null,
      })
    }

    // 3. Get other costs (now fields exist in schema!)
    const totalLaborCost = production.laborCost || 0
    const totalUtilityCost = production.utilityCost || 0
    const totalOtherCost = production.otherCosts || 0

    // 4. Calculate total
    const totalProductionCost = totalIngredientCost + totalLaborCost + totalUtilityCost + totalOtherCost

    // 5. Calculate cost per meal
    const actualPortions = production.actualPortions || production.plannedPortions
    const costPerMeal = actualPortions > 0 ? totalProductionCost / actualPortions : 0

    // 6. Update production record with calculated costs
    await db.foodProduction.update({
      where: { id: productionId },
      data: {
        ingredientCost: totalIngredientCost,
        totalCost: totalProductionCost,
        costPerMeal,
      },
    })

    return {
      totalIngredientCost,
      totalLaborCost,
      totalUtilityCost,
      totalOtherCost,
      totalProductionCost,
      costPerMeal,
      ingredientBreakdown,
    }
  }

  /**
   * Get production cost summary for procurement plan
   * Aggregate production costs for all productions under a procurement plan
   * 
   * @param procurementPlanId - Procurement plan ID
   * @param sppgId - SPPG ID for multi-tenant isolation
   * @returns Aggregated production cost summary
   */
  async getProductionCostSummary(
    procurementPlanId: string,
    sppgId: string
  ): Promise<{
    totalProductions: number
    totalMealsProduced: number
    totalProductionCost: number
    averageCostPerMeal: number
    productions: Array<{
      productionCode: string
      menuName: string
      portions: number
      totalCost: number
      costPerMeal: number
      productionDate: Date
    }>
  }> {
    const productions = await db.foodProduction.findMany({
      where: {
        procurementPlanId,
        sppgId, // ✅ Multi-tenant isolation
      },
      include: {
        menu: {
          select: {
            menuName: true,
          },
        },
      },
    })

    let totalMealsProduced = 0
    let totalProductionCost = 0

    const productionDetails = productions.map((prod) => {
      const portions = prod.actualPortions || prod.plannedPortions
      totalMealsProduced += portions
      totalProductionCost += prod.totalCost || 0

      return {
        productionCode: prod.batchNumber, // ✅ Correct field name
        menuName: prod.menu.menuName,
        portions,
        totalCost: prod.totalCost || 0,
        costPerMeal: prod.costPerMeal || 0,
        productionDate: prod.productionDate,
      }
    })

    const averageCostPerMeal = totalMealsProduced > 0 ? totalProductionCost / totalMealsProduced : 0

    return {
      totalProductions: productions.length,
      totalMealsProduced,
      totalProductionCost,
      averageCostPerMeal,
      productions: productionDetails,
    }
  }

  /**
   * Get ingredient usage report with procurement traceability
   * Track which ingredients came from which procurement
   * 
   * @param procurementPlanId - Procurement plan ID
   * @param sppgId - SPPG ID for multi-tenant isolation
   * @returns Ingredient usage report
   */
  async getIngredientUsageReport(
    procurementPlanId: string,
    sppgId: string
  ): Promise<{
    ingredients: Array<{
      itemName: string
      totalUsed: number
      unit: string
      totalCost: number
      usageCount: number
      procurementSources: Array<{
        procurementCode: string
        quantity: number
        cost: number
      }>
    }>
  }> {
    // Get all productions with stock usages
    const productions = await db.foodProduction.findMany({
      where: {
        procurementPlanId,
        sppgId, // ✅ Multi-tenant isolation
      },
      include: {
        usageRecords: {
          include: {
            inventoryItem: true,
            procurementItem: {
              include: {
                procurement: {
                  select: {
                    procurementCode: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    // Aggregate by inventory item
    const ingredientMap = new Map<
      string,
      {
        itemName: string
        totalUsed: number
        unit: string
        totalCost: number
        usageCount: number
        procurementSources: Map<
          string,
          {
            procurementCode: string
            quantity: number
            cost: number
          }
        >
      }
    >()

    for (const production of productions) {
      for (const usage of production.usageRecords) {
        const item = usage.inventoryItem
        const key = item.id

        if (!ingredientMap.has(key)) {
          ingredientMap.set(key, {
            itemName: item.itemName,
            totalUsed: 0,
            unit: usage.unit,
            totalCost: 0,
            usageCount: 0,
            procurementSources: new Map(),
          })
        }

        const ingredient = ingredientMap.get(key)!
        ingredient.totalUsed += usage.quantityUsed
        ingredient.totalCost += usage.totalCost || 0
        ingredient.usageCount += 1

        // Track procurement source
        if (usage.procurementItem) {
          const procCode = usage.procurementItem.procurement.procurementCode
          if (!ingredient.procurementSources.has(procCode)) {
            ingredient.procurementSources.set(procCode, {
              procurementCode: procCode,
              quantity: 0,
              cost: 0,
            })
          }
          const source = ingredient.procurementSources.get(procCode)!
          source.quantity += usage.quantityUsed
          source.cost += usage.totalCost || 0
        }
      }
    }

    // Convert to array
    const ingredients = Array.from(ingredientMap.values()).map((ing) => ({
      itemName: ing.itemName,
      totalUsed: ing.totalUsed,
      unit: ing.unit,
      totalCost: ing.totalCost,
      usageCount: ing.usageCount,
      procurementSources: Array.from(ing.procurementSources.values()),
    }))

    return { ingredients }
  }
}

// Export singleton instance
export const productionProcurementIntegrationService = new ProductionProcurementIntegrationService()
