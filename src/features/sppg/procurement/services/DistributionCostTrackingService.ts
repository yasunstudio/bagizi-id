/**
 * @fileoverview Distribution Cost Tracking Service
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * BUSINESS LOGIC:
 * - Track complete cost flow: Procurement → Production → Distribution
 * - Calculate accurate cost per meal delivered
 * - Monitor budget utilization in real-time
 * - Generate cost variance reports
 * - Track distribution efficiency metrics
 * 
 * COST FLOW:
 * 1. Procurement Cost: Raw ingredient costs from procurement
 * 2. Production Cost: Ingredients + Labor + Utilities + Other
 * 3. Distribution Cost: Transportation + Packaging + Labor
 * 4. Total Cost Per Meal: Sum of all costs / meals delivered
 */

import { db } from '@/lib/prisma'

/**
 * Interface for complete cost breakdown
 */
interface CompleteCostBreakdown {
  procurementCost: number
  productionCost: number
  distributionCost: number
  totalCost: number
  mealsDelivered: number
  costPerMeal: number
  breakdown: {
    procurement: {
      rawIngredients: number
      shipping: number
      otherCosts: number
    }
    production: {
      ingredients: number
      labor: number
      utilities: number
      otherCosts: number
    }
    distribution: {
      transportation: number
      packaging: number
      labor: number
      otherCosts: number
    }
  }
}

/**
 * Interface for budget tracking update
 */
interface BudgetTrackingUpdate {
  allocatedBudget: number
  spentBudget: number
  remainingBudget: number
  utilizationRate: number
  categorySpending: {
    protein: number
    carbs: number
    vegetables: number
    fruits: number
    other: number
  }
  isOverBudget: boolean
  projectedOverrun: number
}

/**
 * Interface for cost variance analysis
 */
interface CostVarianceAnalysis {
  plannedCost: number
  actualCost: number
  variance: number
  variancePercentage: number
  variances: Array<{
    category: string
    planned: number
    actual: number
    variance: number
    variancePercentage: number
  }>
  insights: string[]
}

/**
 * Distribution Cost Tracking Service
 * Handles complete cost flow tracking from procurement to distribution
 */
export class DistributionCostTrackingService {
  /**
   * Calculate distribution costs with full traceability
   * Links distribution back to production and procurement for complete cost picture
   * 
   * @param distributionId - Distribution ID
   * @param sppgId - SPPG ID for multi-tenant isolation
   * @returns Complete cost breakdown
   */
  async calculateDistributionCosts(
    distributionId: string,
    sppgId: string
  ): Promise<CompleteCostBreakdown> {
    // 1. Get distribution with all related data
    const distribution = await db.foodDistribution.findUnique({
      where: {
        id: distributionId,
        sppgId, // ✅ Multi-tenant isolation
      },
      include: {
        production: {
          include: {
            usageRecords: {
              include: {
                procurementItem: {
                  include: {
                    procurement: true,
                  },
                },
              },
            },
            procurementPlan: {
              include: {
                procurements: {
                  include: {
                    items: true,
                  },
                },
              },
            },
          },
        },
        procurementPlan: true,
      },
    })

    if (!distribution) {
      throw new Error('Distribution not found')
    }

    const mealsDelivered = distribution.actualRecipients || distribution.plannedRecipients

    // 2. Calculate Procurement Cost
    let totalProcurementCost = 0
    let procurementRawIngredients = 0
    let procurementShipping = 0
    let procurementOther = 0

    if (distribution.production) {
      // Get procurement cost from production's stock usage
      for (const usage of distribution.production.usageRecords) {
        procurementRawIngredients += usage.totalCost || 0
      }

      // Get shipping and other costs from procurement plan
      if (distribution.production.procurementPlan) {
        for (const procurement of distribution.production.procurementPlan.procurements) {
          procurementShipping += procurement.shippingCost || 0
          procurementOther += procurement.transportCost || 0
        }
      }

      totalProcurementCost = procurementRawIngredients + procurementShipping + procurementOther
    }

    // 3. Calculate Production Cost
    const production = distribution.production
    const productionIngredients = production?.ingredientCost || 0
    const productionLabor = production?.laborCost || 0
    const productionUtilities = production?.utilityCost || 0
    const productionOther = production?.otherCosts || 0
    const totalProductionCost = production?.totalCost || 0

    // 4. Calculate Distribution Cost
    const distributionTransportation = distribution.transportCost || 0
    const distributionPackaging = distribution.packagingCost || 0
    const distributionLabor = distribution.laborCost || 0
    const distributionOther = distribution.otherCosts || 0
    const totalDistributionCost =
      distributionTransportation + distributionPackaging + distributionLabor + distributionOther

    // 5. Calculate Total Cost
    const totalCost = totalProcurementCost + totalProductionCost + totalDistributionCost
    const costPerMeal = mealsDelivered > 0 ? totalCost / mealsDelivered : 0

    // 6. Update distribution record with cost data
    await db.foodDistribution.update({
      where: { id: distributionId },
      data: {
        totalProcurementCost,
        totalProductionCost,
        totalDistributionCost,
        totalCostPerMeal: costPerMeal,
      },
    })

    return {
      procurementCost: totalProcurementCost,
      productionCost: totalProductionCost,
      distributionCost: totalDistributionCost,
      totalCost,
      mealsDelivered,
      costPerMeal,
      breakdown: {
        procurement: {
          rawIngredients: procurementRawIngredients,
          shipping: procurementShipping,
          otherCosts: procurementOther,
        },
        production: {
          ingredients: productionIngredients,
          labor: productionLabor,
          utilities: productionUtilities,
          otherCosts: productionOther,
        },
        distribution: {
          transportation: distributionTransportation,
          packaging: distributionPackaging,
          labor: distributionLabor,
          otherCosts: distributionOther,
        },
      },
    }
  }

  /**
   * Track cost per meal across all distributions
   * Provides aggregated cost metrics for a procurement plan
   * 
   * @param procurementPlanId - Procurement plan ID
   * @param sppgId - SPPG ID for multi-tenant isolation
   * @returns Cost per meal tracking data
   */
  async trackCostPerMeal(
    procurementPlanId: string,
    sppgId: string
  ): Promise<{
    totalDistributions: number
    totalMealsDelivered: number
    totalCost: number
    averageCostPerMeal: number
    lowestCostPerMeal: number
    highestCostPerMeal: number
    distributions: Array<{
      distributionCode: string
      deliveryDate: Date
      mealsDelivered: number
      totalCost: number
      costPerMeal: number
      schoolName: string
    }>
  }> {
    const distributions = await db.foodDistribution.findMany({
      where: {
        procurementPlanId,
        sppgId, // ✅ Multi-tenant isolation
      },
      include: {
        school: {
          select: {
            schoolName: true,
          },
        },
      },
    })

    let totalMealsDelivered = 0
    let totalCost = 0
    let lowestCostPerMeal = Number.MAX_VALUE
    let highestCostPerMeal = 0

    const distributionDetails = distributions.map((dist) => {
      const mealsDelivered = dist.actualRecipients || dist.plannedRecipients
      const distCost =
        (dist.totalProcurementCost || 0) +
        (dist.totalProductionCost || 0) +
        (dist.totalDistributionCost || 0)
      const costPerMeal = dist.totalCostPerMeal || 0

      totalMealsDelivered += mealsDelivered
      totalCost += distCost

      if (costPerMeal > 0) {
        if (costPerMeal < lowestCostPerMeal) lowestCostPerMeal = costPerMeal
        if (costPerMeal > highestCostPerMeal) highestCostPerMeal = costPerMeal
      }

      return {
        distributionCode: dist.distributionCode,
        deliveryDate: dist.distributionDate,
        mealsDelivered,
        totalCost: distCost,
        costPerMeal,
        schoolName: dist.school?.schoolName || 'N/A',
      }
    })

    const averageCostPerMeal = totalMealsDelivered > 0 ? totalCost / totalMealsDelivered : 0

    return {
      totalDistributions: distributions.length,
      totalMealsDelivered,
      totalCost,
      averageCostPerMeal,
      lowestCostPerMeal: lowestCostPerMeal === Number.MAX_VALUE ? 0 : lowestCostPerMeal,
      highestCostPerMeal,
      distributions: distributionDetails,
    }
  }

  /**
   * Update budget tracking with actual spending
   * Real-time budget monitoring and utilization tracking
   * 
   * @param procurementPlanId - Procurement plan ID
   * @param sppgId - SPPG ID for multi-tenant isolation
   * @returns Updated budget tracking data
   */
  async updateBudgetTracking(
    procurementPlanId: string,
    sppgId: string
  ): Promise<BudgetTrackingUpdate> {
    // 1. Get procurement plan with budget info
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
        productions: true,
        distributions: true,
      },
    })

    if (!plan) {
      throw new Error('Procurement plan not found')
    }

    // 2. Calculate actual spending
    let totalSpent = 0
    const categorySpending = {
      protein: 0,
      carbs: 0,
      vegetables: 0,
      fruits: 0,
      other: 0,
    }

    // Procurement spending by category
    for (const procurement of plan.procurements) {
      for (const item of procurement.items) {
        const itemCost = item.finalPrice

        totalSpent += itemCost

        // Categorize spending
        switch (item.category) {
          case 'PROTEIN':
            categorySpending.protein += itemCost
            break
          case 'KARBOHIDRAT':
            categorySpending.carbs += itemCost
            break
          case 'SAYURAN':
            categorySpending.vegetables += itemCost
            break
          case 'BUAH':
            categorySpending.fruits += itemCost
            break
          default:
            categorySpending.other += itemCost
        }
      }
    }

    // Add production costs
    for (const production of plan.productions) {
      totalSpent += production.totalCost || 0
    }

    // Add distribution costs
    for (const distribution of plan.distributions) {
      totalSpent +=
        (distribution.totalDistributionCost || 0) +
        (distribution.transportCost || 0) +
        (distribution.packagingCost || 0) +
        (distribution.laborCost || 0) +
        (distribution.otherCosts || 0)
    }

    // 3. Calculate budget metrics
    const allocatedBudget = plan.totalBudget
    const remainingBudget = allocatedBudget - totalSpent
    const utilizationRate = allocatedBudget > 0 ? (totalSpent / allocatedBudget) * 100 : 0
    const isOverBudget = totalSpent > allocatedBudget
    const projectedOverrun = isOverBudget ? totalSpent - allocatedBudget : 0

    // 4. Update procurement plan
    await db.procurementPlan.update({
      where: { id: procurementPlanId },
      data: {
        usedBudget: totalSpent,
        remainingBudget,
        proteinBudget: categorySpending.protein,
        carbBudget: categorySpending.carbs,
        vegetableBudget: categorySpending.vegetables,
        fruitBudget: categorySpending.fruits,
        otherBudget: categorySpending.other,
      },
    })

    // 5. Update monthly budget tracking
    await this.updateMonthlyBudgetTracking(sppgId, plan.planMonth, plan.planYear)

    return {
      allocatedBudget,
      spentBudget: totalSpent,
      remainingBudget,
      utilizationRate,
      categorySpending,
      isOverBudget,
      projectedOverrun,
    }
  }

  /**
   * Calculate cost variance (planned vs actual)
   * Analyze cost differences and provide insights
   * 
   * @param procurementPlanId - Procurement plan ID
   * @param sppgId - SPPG ID for multi-tenant isolation
   * @returns Cost variance analysis
   */
  async calculateCostVariance(
    procurementPlanId: string,
    sppgId: string
  ): Promise<CostVarianceAnalysis> {
    const plan = await db.procurementPlan.findUnique({
      where: {
        id: procurementPlanId,
        sppgId, // ✅ Multi-tenant isolation
      },
    })

    if (!plan) {
      throw new Error('Procurement plan not found')
    }

    // Get actual spending
    const budgetUpdate = await this.updateBudgetTracking(procurementPlanId, sppgId)

    const plannedCost = plan.totalBudget
    const actualCost = budgetUpdate.spentBudget
    const variance = actualCost - plannedCost
    const variancePercentage = plannedCost > 0 ? (variance / plannedCost) * 100 : 0

    // Calculate variances by category
    const variances: CostVarianceAnalysis['variances'] = [
      {
        category: 'Protein',
        planned: plan.proteinBudget || 0,
        actual: budgetUpdate.categorySpending.protein,
        variance: budgetUpdate.categorySpending.protein - (plan.proteinBudget || 0),
        variancePercentage:
          plan.proteinBudget && plan.proteinBudget > 0
            ? ((budgetUpdate.categorySpending.protein - plan.proteinBudget) / plan.proteinBudget) * 100
            : 0,
      },
      {
        category: 'Carbohydrates',
        planned: plan.carbBudget || 0,
        actual: budgetUpdate.categorySpending.carbs,
        variance: budgetUpdate.categorySpending.carbs - (plan.carbBudget || 0),
        variancePercentage:
          plan.carbBudget && plan.carbBudget > 0
            ? ((budgetUpdate.categorySpending.carbs - plan.carbBudget) / plan.carbBudget) * 100
            : 0,
      },
      {
        category: 'Vegetables',
        planned: plan.vegetableBudget || 0,
        actual: budgetUpdate.categorySpending.vegetables,
        variance: budgetUpdate.categorySpending.vegetables - (plan.vegetableBudget || 0),
        variancePercentage:
          plan.vegetableBudget && plan.vegetableBudget > 0
            ? ((budgetUpdate.categorySpending.vegetables - plan.vegetableBudget) / plan.vegetableBudget) * 100
            : 0,
      },
      {
        category: 'Fruits',
        planned: plan.fruitBudget || 0,
        actual: budgetUpdate.categorySpending.fruits,
        variance: budgetUpdate.categorySpending.fruits - (plan.fruitBudget || 0),
        variancePercentage:
          plan.fruitBudget && plan.fruitBudget > 0
            ? ((budgetUpdate.categorySpending.fruits - plan.fruitBudget) / plan.fruitBudget) * 100
            : 0,
      },
    ]

    // Generate insights
    const insights: string[] = []

    if (budgetUpdate.isOverBudget) {
      insights.push(`Budget overrun sebesar Rp ${budgetUpdate.projectedOverrun.toLocaleString('id-ID')}`)
    }

    // Check significant variances
    const significantVariances = variances.filter((v) => Math.abs(v.variancePercentage) > 20)
    if (significantVariances.length > 0) {
      insights.push(
        `${significantVariances.length} kategori memiliki variance signifikan (>20%): ${significantVariances.map((v) => v.category).join(', ')}`
      )
    }

    if (variance < 0) {
      insights.push(`Penghematan sebesar Rp ${Math.abs(variance).toLocaleString('id-ID')} dari budget`)
    }

    return {
      plannedCost,
      actualCost,
      variance,
      variancePercentage,
      variances,
      insights,
    }
  }

  /**
   * Get distribution efficiency metrics
   * Measure efficiency of distribution operations
   * 
   * @param procurementPlanId - Procurement plan ID
   * @param sppgId - SPPG ID for multi-tenant isolation
   * @returns Distribution efficiency metrics
   */
  async getDistributionEfficiencyMetrics(
    procurementPlanId: string,
    sppgId: string
  ): Promise<{
    totalDistributions: number
    onTimeDeliveries: number
    lateDeliveries: number
    onTimePercentage: number
    averageDeliveryTime: number // in hours
    averageCostPerDistribution: number
    totalMealsDelivered: number
    averageMealsPerDistribution: number
  }> {
    const distributions = await db.foodDistribution.findMany({
      where: {
        procurementPlanId,
        sppgId, // ✅ Multi-tenant isolation
      },
    })

    let onTimeDeliveries = 0
    let lateDeliveries = 0
    let totalDeliveryTime = 0
    let totalCost = 0
    let totalMealsDelivered = 0

    for (const dist of distributions) {
      // Check on-time delivery (comparing with planned date - simplified logic)
      if (dist.distributionDate && dist.createdAt) {
        // Consider on-time if delivered within 24 hours of creation
        const timeDiff = dist.distributionDate.getTime() - dist.createdAt.getTime()
        if (timeDiff <= 24 * 60 * 60 * 1000) {
          onTimeDeliveries++
        } else {
          lateDeliveries++
        }
      } else {
        lateDeliveries++
      }

      // Calculate delivery time (assuming production to delivery)
      if (dist.distributionDate) {
        // This would need production date - simplified here
        totalDeliveryTime += 24 // Default 24 hours
      }

      // Sum costs
      totalCost +=
        (dist.totalProcurementCost || 0) +
        (dist.totalProductionCost || 0) +
        (dist.totalDistributionCost || 0)

      // Sum meals
      totalMealsDelivered += dist.actualRecipients || dist.plannedRecipients
    }

    const totalDistributions = distributions.length
    const onTimePercentage = totalDistributions > 0 ? (onTimeDeliveries / totalDistributions) * 100 : 0
    const averageDeliveryTime = totalDistributions > 0 ? totalDeliveryTime / totalDistributions : 0
    const averageCostPerDistribution = totalDistributions > 0 ? totalCost / totalDistributions : 0
    const averageMealsPerDistribution = totalDistributions > 0 ? totalMealsDelivered / totalDistributions : 0

    return {
      totalDistributions,
      onTimeDeliveries,
      lateDeliveries,
      onTimePercentage,
      averageDeliveryTime,
      averageCostPerDistribution,
      totalMealsDelivered,
      averageMealsPerDistribution,
    }
  }

  /**
   * Update monthly budget tracking
   * Private helper to update BudgetTracking table
   * 
   * @param sppgId - SPPG ID
   * @param month - Month string (e.g., "2025-01")
   * @param year - Year number
   */
  private async updateMonthlyBudgetTracking(sppgId: string, month: string, year: number): Promise<void> {
    // Parse month
    const monthNumber = parseInt(month.split('-')[1])

    // Get all procurement plans for this month
    const plans = await db.procurementPlan.findMany({
      where: {
        sppgId,
        planMonth: month,
        planYear: year,
      },
    })

    let totalAllocated = 0
    let totalSpent = 0
    let proteinSpent = 0
    let carbsSpent = 0
    let vegetablesSpent = 0
    let fruitsSpent = 0
    let otherSpent = 0

    for (const plan of plans) {
      totalAllocated += plan.totalBudget
      totalSpent += plan.usedBudget
      proteinSpent += plan.proteinBudget || 0
      carbsSpent += plan.carbBudget || 0
      vegetablesSpent += plan.vegetableBudget || 0
      fruitsSpent += plan.fruitBudget || 0
      otherSpent += plan.otherBudget || 0
    }

    const remainingBudget = totalAllocated - totalSpent
    const utilizationRate = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0

    // Upsert budget tracking
    await db.budgetTracking.upsert({
      where: {
        sppgId_month_year: {
          sppgId,
          month: monthNumber,
          year,
        },
      },
      update: {
        spentBudget: totalSpent,
        remainingBudget,
        proteinSpent,
        carbsSpent,
        vegetablesSpent,
        fruitsSpent,
        otherSpent,
        utilizationRate,
        lastCalculated: new Date(),
      },
      create: {
        sppgId,
        month: monthNumber,
        year,
        allocatedBudget: totalAllocated,
        spentBudget: totalSpent,
        remainingBudget,
        proteinSpent,
        carbsSpent,
        vegetablesSpent,
        fruitsSpent,
        otherSpent,
        utilizationRate,
      },
    })
  }
}

// Export singleton instance
export const distributionCostTrackingService = new DistributionCostTrackingService()
