/**
 * @fileoverview Menu Integration API - Generate Procurement from Menu Plan
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * POST /api/sppg/procurement/menu-integration
 * 
 * Generates a procurement plan from an approved menu plan with:
 * - Ingredient aggregation across all menu assignments
 * - Supplier matching and pricing
 * - Budget calculation with cost tracking
 * - Auto-generated procurement items
 * 
 * Security:
 * - Protected by withSppgAuth wrapper
 * - Multi-tenant filtering by sppgId
 * - Ownership verification before operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withSppgAuth } from '@/lib/api-middleware'
import { hasPermission } from '@/lib/permissions'
import { db } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

// ============================================================================
// Request Validation Schema
// ============================================================================

const menuIntegrationSchema = z.object({
  menuPlanId: z.string().cuid('Invalid menu plan ID'),
  planName: z.string().min(3, 'Plan name must be at least 3 characters'),
  notes: z.string().optional(),
})

// ============================================================================
// Response Types
// ============================================================================

interface IngredientAggregate {
  inventoryItemId: string
  inventoryItemName: string
  unit: string
  totalQuantity: number
  estimatedCost: number
  menuCount: number // How many menus use this ingredient
}

// ============================================================================
// POST Handler - Generate Procurement from Menu Plan
// ============================================================================

/**
 * POST /api/sppg/procurement/menu-integration
 * 
 * Generates a procurement plan from an approved menu plan
 * Aggregates ingredients across all menu assignments
 * Calculates costs from inventory prices × quantities
 * 
 * @param request - NextRequest with menu plan ID and plan name
 * @returns Promise<NextResponse> - Procurement plan with summary
 * @rbac Protected by withSppgAuth - requires PROCUREMENT_MANAGE permission
 */
export async function POST(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // 1. Permission check
      if (!hasPermission(session.user.userRole as UserRole, 'PROCUREMENT_MANAGE')) {
        return NextResponse.json({ 
          success: false,
          error: 'Insufficient permissions',
          message: 'You do not have permission to create procurement plans'
        }, { status: 403 })
      }

      const sppgId = session.user.sppgId!

      // 2. Verify SPPG is active
      const sppg = await db.sPPG.findUnique({
        where: { id: sppgId },
        select: { status: true }
      })

      if (!sppg || sppg.status !== 'ACTIVE') {
        return NextResponse.json(
          {
            success: false,
            error: 'SPPG is not active'
          },
          { status: 403 }
        )
      }

      // 3. Parse and validate request body
      const body = await request.json()
      const validated = menuIntegrationSchema.safeParse(body)

      if (!validated.success) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation failed',
            details: validated.error.issues
          },
          { status: 400 }
        )
      }

      const { menuPlanId, planName, notes } = validated.data

      // 4. Fetch Menu Plan with assignments and verify ownership
      const menuPlan = await db.menuPlan.findFirst({
        where: {
          id: menuPlanId,
          sppgId, // CRITICAL: Multi-tenant isolation!
        },
        include: {
          assignments: {
            include: {
              menu: {
                include: {
                  ingredients: {
                    include: {
                      inventoryItem: true
                    }
                  }
                }
              }
            }
          }
        }
      })

      if (!menuPlan) {
        return NextResponse.json(
          { success: false, error: 'Menu plan not found or access denied' },
          { status: 404 }
        )
      }

      // 5. Verify menu plan is approved
      if (menuPlan.status !== 'APPROVED' && menuPlan.status !== 'ACTIVE') {
        return NextResponse.json(
          {
            success: false,
            error: `Menu plan must be APPROVED or ACTIVE (current: ${menuPlan.status})`
          },
          { status: 400 }
        )
      }

      // 6. Check if procurement plan already exists for this menu plan
      const existingPlan = await db.procurementPlan.findFirst({
        where: {
          menuPlanId,
          sppgId
        }
      })

      if (existingPlan) {
        return NextResponse.json(
          {
            success: false,
            error: 'Procurement plan already exists for this menu plan',
            details: { existingPlanId: existingPlan.id }
          },
          { status: 409 }
        )
      }

      // 7. Aggregate ingredients from all menu assignments
      const ingredientMap = new Map<string, IngredientAggregate>()

      for (const assignment of menuPlan.assignments) {
        const menu = assignment.menu
        const portionSize = menu.servingSize || 200
        const totalPortions = assignment.plannedPortions

        for (const ingredient of menu.ingredients) {
          const quantityPerPortion = ingredient.quantity / portionSize
          const totalQuantity = quantityPerPortion * totalPortions

          const inventoryItem = ingredient.inventoryItem
          const costPerUnit = inventoryItem.costPerUnit || 0
          const ingredientCost = totalQuantity * costPerUnit

          const existingAggregate = ingredientMap.get(inventoryItem.id)

          if (existingAggregate) {
            // Update existing aggregate
            existingAggregate.totalQuantity += totalQuantity
            existingAggregate.estimatedCost += ingredientCost
            existingAggregate.menuCount += 1
          } else {
            // Create new aggregate
            ingredientMap.set(inventoryItem.id, {
              inventoryItemId: inventoryItem.id,
              inventoryItemName: inventoryItem.itemName,
              unit: inventoryItem.unit,
              totalQuantity,
              estimatedCost: ingredientCost,
              menuCount: 1
            })
          }
        }
      }

      const aggregatedIngredients = Array.from(ingredientMap.values())

      // 8. Calculate totals
      const totalBudget = aggregatedIngredients.reduce((sum: number, item) => sum + item.estimatedCost, 0)
      const totalRecipients = menuPlan.assignments.reduce((sum: number, a) => sum + a.plannedPortions, 0)
      const totalMeals = menuPlan.assignments.length * totalRecipients
      const costPerMeal = totalMeals > 0 ? totalBudget / totalMeals : 0

      // 9. Get plan period from menu plan
      const planPeriod = await db.menuPlan.findUnique({
        where: { id: menuPlanId },
        select: { 
          startDate: true,
          endDate: true
        }
      })

      if (!planPeriod) {
        return NextResponse.json(
          { success: false, error: 'Failed to get plan period' },
          { status: 500 }
        )
      }

      const startDate = planPeriod.startDate
      const planMonth = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`
      
      // 10. Create Procurement Plan
      const procurementPlan = await db.procurementPlan.create({
        data: {
          sppgId,
          menuPlanId,
          planName,
          planMonth,
          planYear: startDate.getFullYear(),
          planQuarter: Math.ceil((startDate.getMonth() + 1) / 3),
          totalBudget,
          allocatedBudget: 0,
          usedBudget: 0,
          remainingBudget: totalBudget,
          targetRecipients: totalRecipients,
          targetMeals: totalMeals,
          costPerMeal,
          approvalStatus: 'DRAFT',
          submittedBy: session.user.id,
          notes,
          autoGeneratedItems: JSON.parse(JSON.stringify(aggregatedIngredients)), // Store as JSON
          menuBasedBudget: totalBudget,
        }
      })

      // 11. Return success response
      return NextResponse.json(
        {
          success: true,
          data: {
            procurementPlan: {
              id: procurementPlan.id,
              planName: procurementPlan.planName,
              menuPlanId: procurementPlan.menuPlanId!,
              totalBudget: procurementPlan.totalBudget,
              targetRecipients: procurementPlan.targetRecipients,
              targetMeals: procurementPlan.targetMeals,
              costPerMeal: procurementPlan.costPerMeal || 0,
              autoGeneratedItems: aggregatedIngredients,
              createdAt: procurementPlan.createdAt.toISOString(),
            },
            summary: {
              totalIngredients: aggregatedIngredients.length,
              totalMenus: new Set(menuPlan.assignments.map((a) => a.menuId)).size,
              totalAssignments: menuPlan.assignments.length,
              estimatedCostPerMeal: costPerMeal,
            }
          }
        },
        { status: 201 }
      )

    } catch (error) {
      console.error('[Menu Integration] Error:', {
        error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'N/A',
      })
      
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to generate procurement plan from menu',
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
          details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined
        },
        { status: 500 }
      )
    }
  })
}
