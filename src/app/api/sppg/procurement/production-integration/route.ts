/**
 * @fileoverview Production Integration API - Validate Readiness & Record Stock Usage
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * POST /api/sppg/procurement/production-integration
 * 
 * Validates production readiness and records stock usage:
 * - Check procurement item availability
 * - Validate inventory stock levels
 * - Create FoodProduction with cost tracking
 * - Record ProductionStockUsage (ingredient consumption)
 * - Update inventory currentStock levels
 * - Calculate REAL costs from actual usage
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
import { UserRole, ProductionStatus } from '@prisma/client'

// ============================================================================
// Request Validation Schema
// ============================================================================

const productionIntegrationSchema = z.object({
  programId: z.string().cuid('Invalid program ID'),
  menuId: z.string().cuid('Invalid menu ID'),
  procurementPlanId: z.string().cuid('Invalid procurement plan ID').optional(),
  productionDate: z.string().datetime('Invalid date format'),
  batchNumber: z.string().min(3, 'Batch number must be at least 3 characters'),
  plannedPortions: z.number().int().positive('Planned portions must be positive'),
  actualPortions: z.number().int().positive('Actual portions must be positive').optional(),
  headCook: z.string().min(1, 'Head cook is required'),
  assistantCooks: z.array(z.string()).default([]),
  supervisorId: z.string().cuid().optional(),
  plannedStartTime: z.string().datetime('Invalid start time format'),
  plannedEndTime: z.string().datetime('Invalid end time format'),
  actualStartTime: z.string().datetime('Invalid start time format').optional(),
  actualEndTime: z.string().datetime('Invalid end time format').optional(),
  // Cost data
  laborCost: z.number().nonnegative('Labor cost must be non-negative').default(0),
  utilityCost: z.number().nonnegative('Utility cost must be non-negative').default(0),
  otherCosts: z.number().nonnegative('Other costs must be non-negative').default(0),
  // Stock usage records
  stockUsage: z.array(z.object({
    inventoryItemId: z.string().cuid('Invalid inventory item ID'),
    procurementItemId: z.string().cuid('Invalid procurement item ID').optional(),
    quantityUsed: z.number().positive('Quantity used must be positive'),
    notes: z.string().optional(),
  })).min(1, 'At least one stock usage record is required'),
  notes: z.string().optional(),
})

// ============================================================================
// Response Types
// ============================================================================

interface StockUsageRecord {
  inventoryItemId: string
  itemName: string
  quantityUsed: number
  unit: string
  unitCostAtUse: number
  totalCost: number
}

interface ProductionCostBreakdown {
  ingredientCost: number
  laborCost: number
  utilityCost: number
  otherCosts: number
  totalCost: number
  costPerMeal: number
}

// ============================================================================
// POST Handler - Create Production with Stock Usage Tracking
// ============================================================================

/**
 * POST /api/sppg/procurement/production-integration
 * 
 * Creates a food production record with complete cost tracking
 * Validates stock availability and records ingredient usage
 * Updates inventory levels and calculates real costs
 * 
 * @param request - NextRequest with production details and stock usage
 * @returns Promise<NextResponse> - Production record with cost breakdown
 * @rbac Protected by withSppgAuth - requires PRODUCTION_MANAGE permission
 */
export async function POST(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // 1. Permission check
      if (!hasPermission(session.user.userRole as UserRole, 'PRODUCTION_MANAGE')) {
        return NextResponse.json({ 
          success: false,
          error: 'Insufficient permissions',
          message: 'You do not have permission to manage production'
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
      const validated = productionIntegrationSchema.safeParse(body)

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

      const data = validated.data

      // 4. Verify program ownership
      const program = await db.nutritionProgram.findFirst({
        where: {
          id: data.programId,
          sppgId
        }
      })

      if (!program) {
        return NextResponse.json(
          { success: false, error: 'Program not found or access denied' },
          { status: 404 }
        )
      }

      // 5. Verify menu ownership
      const menu = await db.nutritionMenu.findFirst({
        where: {
          id: data.menuId,
          program: {
            sppgId
          }
        },
        select: {
          id: true,
          menuName: true,
          servingSize: true
        }
      })

      if (!menu) {
        return NextResponse.json(
          { success: false, error: 'Menu not found or access denied' },
          { status: 404 }
        )
      }

      // 6. Check for duplicate batch number
      const existingBatch = await db.foodProduction.findFirst({
        where: {
          batchNumber: data.batchNumber,
          sppgId
        }
      })

      if (existingBatch) {
        return NextResponse.json(
          {
            success: false,
            error: 'Batch number already exists',
            details: { existingBatchId: existingBatch.id }
          },
          { status: 409 }
        )
      }

      // 7. Validate stock availability and get costs
      const stockUsageRecords: StockUsageRecord[] = []
      let totalIngredientCost = 0

      for (const usage of data.stockUsage) {
        // Fetch inventory item with current stock and cost
        const inventoryItem = await db.inventoryItem.findFirst({
          where: {
            id: usage.inventoryItemId,
            sppgId
          },
          select: {
            id: true,
            itemName: true,
            currentStock: true,
            unit: true,
            costPerUnit: true
          }
        })

        if (!inventoryItem) {
          return NextResponse.json(
            {
              success: false,
              error: `Inventory item not found: ${usage.inventoryItemId}`
            },
            { status: 404 }
          )
        }

        // Check if sufficient stock is available
        if (inventoryItem.currentStock < usage.quantityUsed) {
          return NextResponse.json(
            {
              success: false,
              error: `Insufficient stock for ${inventoryItem.itemName}`,
              details: {
                itemName: inventoryItem.itemName,
                available: inventoryItem.currentStock,
                requested: usage.quantityUsed,
                unit: inventoryItem.unit
              }
            },
            { status: 400 }
          )
        }

        // Calculate cost for this ingredient
        const unitCost = inventoryItem.costPerUnit || 0
        const itemCost = usage.quantityUsed * unitCost
        totalIngredientCost += itemCost

        stockUsageRecords.push({
          inventoryItemId: inventoryItem.id,
          itemName: inventoryItem.itemName,
          quantityUsed: usage.quantityUsed,
          unit: inventoryItem.unit,
          unitCostAtUse: unitCost,
          totalCost: itemCost
        })
      }

      // 8. Calculate total costs
      const totalCost = totalIngredientCost + data.laborCost + data.utilityCost + data.otherCosts
      const portions = data.actualPortions || data.plannedPortions
      const costPerMeal = portions > 0 ? totalCost / portions : 0

      // 9. Create production record in a transaction
      const production = await db.$transaction(async (tx) => {
        // Create FoodProduction
        const newProduction = await tx.foodProduction.create({
          data: {
            sppgId,
            programId: data.programId,
            menuId: data.menuId,
            procurementPlanId: data.procurementPlanId,
            productionDate: new Date(data.productionDate),
            batchNumber: data.batchNumber,
            plannedPortions: data.plannedPortions,
            actualPortions: data.actualPortions,
            headCook: data.headCook,
            assistantCooks: data.assistantCooks,
            supervisorId: data.supervisorId,
            plannedStartTime: new Date(data.plannedStartTime),
            plannedEndTime: new Date(data.plannedEndTime),
            actualStartTime: data.actualStartTime ? new Date(data.actualStartTime) : undefined,
            actualEndTime: data.actualEndTime ? new Date(data.actualEndTime) : undefined,
            status: data.actualPortions ? ProductionStatus.COMPLETED : ProductionStatus.PREPARING,
            notes: data.notes,
            // Cost tracking
            laborCost: data.laborCost,
            utilityCost: data.utilityCost,
            otherCosts: data.otherCosts,
            ingredientCost: totalIngredientCost,
            totalCost,
            costPerMeal,
          }
        })

        // Create stock usage records
        for (const usage of data.stockUsage) {
          const record = stockUsageRecords.find(r => r.inventoryItemId === usage.inventoryItemId)!

          await tx.productionStockUsage.create({
            data: {
              productionId: newProduction.id,
              inventoryItemId: usage.inventoryItemId,
              procurementItemId: usage.procurementItemId,
              quantityUsed: usage.quantityUsed,
              unit: record.unit,
              unitCostAtUse: record.unitCostAtUse,
              totalCost: record.totalCost,
              recordedBy: session.user.id,
              notes: usage.notes,
            }
          })

          // Update inventory current stock
          await tx.inventoryItem.update({
            where: { id: usage.inventoryItemId },
            data: {
              currentStock: {
                decrement: usage.quantityUsed
              }
            }
          })
        }

        return newProduction
      })

      // 10. Prepare cost breakdown
      const costBreakdown: ProductionCostBreakdown = {
        ingredientCost: totalIngredientCost,
        laborCost: data.laborCost,
        utilityCost: data.utilityCost,
        otherCosts: data.otherCosts,
        totalCost,
        costPerMeal
      }

      // 11. Return success response
      return NextResponse.json(
        {
          success: true,
          data: {
            production: {
              id: production.id,
              batchNumber: production.batchNumber,
              programId: production.programId,
              menuId: production.menuId,
              menuName: menu.menuName,
              productionDate: production.productionDate.toISOString(),
              plannedPortions: production.plannedPortions,
              actualPortions: production.actualPortions,
              status: production.status,
              createdAt: production.createdAt.toISOString(),
            },
            costBreakdown,
            stockUsage: stockUsageRecords,
            summary: {
              totalIngredientsUsed: stockUsageRecords.length,
              totalQuantityUsed: stockUsageRecords.reduce((sum, r) => sum + r.quantityUsed, 0),
              estimatedYield: portions,
            }
          }
        },
        { status: 201 }
      )

    } catch (error) {
      console.error('[Production Integration] Error:', {
        error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'N/A',
      })
      
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create production record',
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
          details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined
        },
        { status: 500 }
      )
    }
  })
}
