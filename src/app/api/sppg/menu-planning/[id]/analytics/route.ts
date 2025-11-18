/**
 * @fileoverview Menu Planning Analytics API - Nutrition balance, cost analysis, variety metrics
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @see {@link /docs/copilot-instructions.md} Multi-tenant security patterns
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { hasPermission } from '@/lib/permissions'
import { UserRole } from '@prisma/client'
import { db } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      if (!hasPermission(session.user.userRole as UserRole, 'READ')) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
      }

      const { id: planId } = await params

      // Verify plan exists and belongs to user's SPPG
      const plan = await db.menuPlan.findFirst({
        where: {
          id: planId,
          sppgId: session.user.sppgId!
        },
        include: {
          program: {
            select: {
              id: true,
              name: true,
              targetRecipients: true,
              allowedTargetGroups: true,
            }
          },
          assignments: {
            include: {
              menu: {
                include: {
                  ingredients: {
                    include: {
                      inventoryItem: true
                    }
                  },
                  nutritionCalc: true
                }
              }
            }
          }
        }
      })

      if (!plan) {
        return NextResponse.json({
          success: false,
          error: 'Menu plan not found or access denied'
        }, { status: 404 })
      }

      // Calculate nutrition analytics
      const nutritionByMealType: Record<string, {
        totalCalories: number
        totalProtein: number
        totalCarbs: number
        totalFat: number
        totalFiber: number
        count: number
      }> = {}

      const nutritionByDay: Record<string, {
        date: string
        totalCalories: number
        totalProtein: number
        totalCarbs: number
        totalFat: number
        mealTypes: string[]
      }> = {}

      plan.assignments.forEach(assignment => {
        const menu = assignment.menu
        const mealType = assignment.mealType
        const nutrition = menu.nutritionCalc

        // Skip if no nutrition data
        if (!nutrition) {
          return
        }

        // Aggregate by meal type
        if (!nutritionByMealType[mealType]) {
          nutritionByMealType[mealType] = {
            totalCalories: 0,
            totalProtein: 0,
            totalCarbs: 0,
            totalFat: 0,
            totalFiber: 0,
            count: 0
          }
        }

        nutritionByMealType[mealType].totalCalories += nutrition.totalCalories || 0
        nutritionByMealType[mealType].totalProtein += nutrition.totalProtein || 0
        nutritionByMealType[mealType].totalCarbs += nutrition.totalCarbs || 0
        nutritionByMealType[mealType].totalFat += nutrition.totalFat || 0
        nutritionByMealType[mealType].totalFiber += nutrition.totalFiber || 0
        nutritionByMealType[mealType].count += 1

        // Aggregate by day
        const dateKey = assignment.assignedDate.toISOString().split('T')[0]
        if (!nutritionByDay[dateKey]) {
          nutritionByDay[dateKey] = {
            date: dateKey,
            totalCalories: 0,
            totalProtein: 0,
            totalCarbs: 0,
            totalFat: 0,
            mealTypes: []
          }
        }

        nutritionByDay[dateKey].totalCalories += nutrition.totalCalories || 0
        nutritionByDay[dateKey].totalProtein += nutrition.totalProtein || 0
        nutritionByDay[dateKey].totalCarbs += nutrition.totalCarbs || 0
        nutritionByDay[dateKey].totalFat += nutrition.totalFat || 0
        if (!nutritionByDay[dateKey].mealTypes.includes(mealType)) {
          nutritionByDay[dateKey].mealTypes.push(mealType)
        }
      })

      // Calculate averages for meal types
      const nutritionAverages = Object.entries(nutritionByMealType).map(([mealType, data]) => ({
        mealType,
        avgCalories: data.count > 0 ? Math.round(data.totalCalories / data.count) : 0,
        avgProtein: data.count > 0 ? Math.round(data.totalProtein / data.count) : 0,
        avgCarbs: data.count > 0 ? Math.round(data.totalCarbs / data.count) : 0,
        avgFat: data.count > 0 ? Math.round(data.totalFat / data.count) : 0,
        avgFiber: data.count > 0 ? Math.round(data.totalFiber / data.count) : 0,
        totalMeals: data.count
      }))

      // Calculate cost analytics
      const costByMealType: Record<string, {
        totalCost: number
        count: number
      }> = {}

      const costByDay: Record<string, {
        date: string
        totalCost: number
        perBeneficiaryCost: number
      }> = {}

      plan.assignments.forEach(assignment => {
        const menu = assignment.menu
        const mealType = assignment.mealType
        const portions = assignment.plannedPortions || 0
        const costPerServing = menu.costPerServing || 0
        const totalCost = costPerServing * portions

        // Aggregate by meal type
        if (!costByMealType[mealType]) {
          costByMealType[mealType] = {
            totalCost: 0,
            count: 0
          }
        }
        costByMealType[mealType].totalCost += totalCost
        costByMealType[mealType].count += 1

        // Aggregate by day
        const dateKey = assignment.assignedDate.toISOString().split('T')[0]
        if (!costByDay[dateKey]) {
          costByDay[dateKey] = {
            date: dateKey,
            totalCost: 0,
            perBeneficiaryCost: 0
          }
        }
        costByDay[dateKey].totalCost += totalCost
      })

      // Calculate per-beneficiary cost for each day
      const targetBeneficiaries = plan.program.targetRecipients || 1
      Object.values(costByDay).forEach(day => {
        day.perBeneficiaryCost = Math.round(day.totalCost / targetBeneficiaries)
      })

      // Calculate total and average costs
      const totalPlanCost = Object.values(costByDay).reduce((sum, day) => sum + day.totalCost, 0)
      const avgDailyCost = Object.keys(costByDay).length > 0 
        ? Math.round(totalPlanCost / Object.keys(costByDay).length)
        : 0
      const avgCostPerBeneficiary = Math.round(totalPlanCost / targetBeneficiaries)

      // Calculate variety metrics
      const uniqueMenus = new Set(plan.assignments.map(a => a.menuId))
      const totalAssignments = plan.assignments.length
      const varietyScore = totalAssignments > 0 
        ? Math.round((uniqueMenus.size / totalAssignments) * 100)
        : 0

      // Ingredient diversity
      const allIngredients = new Set<string>()
      plan.assignments.forEach(assignment => {
        assignment.menu.ingredients?.forEach(ing => {
          if (ing.inventoryItemId) {
            allIngredients.add(ing.inventoryItemId)
          }
        })
      })

      // Generate compliance checks
      const dailyNutritionCompliance = Object.values(nutritionByDay).map(day => {
        const minCalories = 1800
        const maxCalories = 2500
        const minProtein = 50
        
        return {
          date: day.date,
          caloriesInRange: day.totalCalories >= minCalories && day.totalCalories <= maxCalories,
          proteinSufficient: day.totalProtein >= minProtein,
          mealTypesCovered: day.mealTypes.length,
          isCompliant: day.totalCalories >= minCalories && 
                       day.totalCalories <= maxCalories && 
                       day.totalProtein >= minProtein
        }
      })

      const complianceRate = dailyNutritionCompliance.length > 0
        ? Math.round((dailyNutritionCompliance.filter(d => d.isCompliant).length / dailyNutritionCompliance.length) * 100)
        : 0

      // Return comprehensive analytics
      return NextResponse.json({
        success: true,
        data: {
          planId: plan.id,
          planName: plan.name,
          dateRange: {
            startDate: plan.startDate,
            endDate: plan.endDate,
            totalDays: plan.totalDays
          },
          program: {
            name: plan.program.name,
            targetBeneficiaries: plan.program.targetRecipients,
            targetGroups: plan.program.allowedTargetGroups
          },
          nutrition: {
            byMealType: nutritionAverages,
            byDay: Object.values(nutritionByDay).sort((a, b) => a.date.localeCompare(b.date)),
            summary: {
              totalMeals: plan.assignments.length,
              mealTypesUsed: Object.keys(nutritionByMealType)
            }
          },
          cost: {
            byMealType: Object.entries(costByMealType).map(([mealType, data]) => ({
              mealType,
              totalCost: Math.round(data.totalCost),
              avgCostPerMeal: data.count > 0 ? Math.round(data.totalCost / data.count) : 0,
              mealCount: data.count
            })),
            byDay: Object.values(costByDay).sort((a, b) => a.date.localeCompare(b.date)),
            summary: {
              totalPlanCost: Math.round(totalPlanCost),
              avgDailyCost,
              avgCostPerBeneficiary,
              targetBeneficiaries
            }
          },
          variety: {
            uniqueMenus: uniqueMenus.size,
            totalAssignments,
            varietyScore,
            ingredientDiversity: allIngredients.size,
            recommendation: varietyScore < 50 
              ? 'Consider adding more menu variety to improve nutritional diversity'
              : varietyScore < 75
              ? 'Good variety, but room for improvement'
              : 'Excellent menu variety!'
          },
          compliance: {
            dailyChecks: dailyNutritionCompliance,
            overallRate: complianceRate,
            passedDays: dailyNutritionCompliance.filter(d => d.isCompliant).length,
            totalDays: dailyNutritionCompliance.length
          }
        }
      })

    } catch (error) {
      console.error('GET /api/sppg/menu-planning/[id]/analytics error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch analytics',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 })
    }
  })
}
