/**
 * @fileoverview API Route: Record Production Stock Usage
 * @description Automatically records stock usage when production is completed
 * @version Next.js 15.5.4 / Prisma ORM 6.17.1
 * @author Bagizi-ID Development Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { productionCostCalculator } from '@/services/production/ProductionCostCalculator'

// ============================================================================
// POST /api/sppg/production/:id/record-usage
// ============================================================================

/**
 * Record stock usage for a completed production
 * Creates ProductionStockUsage records for all ingredients used
 * 
 * @method POST
 * @route /api/sppg/production/:id/record-usage
 * @access SPPG Users with production permissions
 * @rbac Protected by withSppgAuth
 * @audit Automatic logging via middleware
 * 
 * @example
 * POST /api/sppg/production/prod_123/record-usage
 * {
 *   "actualPortions": 100,
 *   "recordedBy": "user_123"
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    const { id } = await params

    try {
      // Parse Request Body
      const body = await request.json()
      const { actualPortions, recordedBy } = body

      if (!actualPortions || actualPortions <= 0) {
        return NextResponse.json({ 
          error: 'actualPortions is required and must be greater than 0' 
        }, { status: 400 })
      }

      // Get Production with Menu & Ingredients
      const production = await db.foodProduction.findFirst({
        where: { 
          id,
          // Multi-tenant safety via direct sppgId
          sppgId: session.user.sppgId!
        },
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
      })

      if (!production) {
        return NextResponse.json({ 
          error: 'Production not found or access denied' 
        }, { status: 404 })
      }


      // Check if production is completed or in quality check
      if (production.status !== 'COMPLETED' && production.status !== 'QUALITY_CHECK') {
        return NextResponse.json({ 
          error: 'Can only record stock usage for productions in quality check or completed status',
          details: { currentStatus: production.status }
        }, { status: 400 })
      }

      // Check if stock usage already recorded
      const existingUsage = await db.productionStockUsage.findFirst({
        where: { productionId: id }
      })

      if (existingUsage) {
        return NextResponse.json({ 
          error: 'Stock usage already recorded for this production',
          details: { 
            recordedAt: existingUsage.createdAt,
            recordedBy: existingUsage.recordedBy
          }
        }, { status: 409 })
      }

      // Check if menu has ingredients
      if (!production.menu || !production.menu.ingredients.length) {
        return NextResponse.json({ 
          error: 'Production menu has no ingredients to record',
          details: { menuId: production.menuId }
        }, { status: 400 })
      }

      // Calculate actual quantities based on actualPortions
      const usageRecords = production.menu.ingredients.map((ingredient) => {
        // Convert menu quantities (per 100g or per serving) to actual usage
        // MenuIngredient.quantity is per portion, scale by actualPortions
        const actualQuantity = (ingredient.quantity * actualPortions) / 100

        return {
          productionId: production.id,
          inventoryItemId: ingredient.inventoryItemId,
          quantityUsed: actualQuantity,
          unit: ingredient.inventoryItem.unit,
          unitCostAtUse: ingredient.inventoryItem.costPerUnit || 0,
          totalCost: actualQuantity * (ingredient.inventoryItem.costPerUnit || 0),
          recordedBy: recordedBy || session.user.id,
          usedAt: new Date(), // Changed from recordedAt to match schema
          notes: null,
        }
      })

      // Create all stock usage records in transaction
      const createdRecords = await db.$transaction(
        usageRecords.map((record) =>
          db.productionStockUsage.create({
            data: record,
          })
        )
      )

      // Calculate total cost using ProductionCostCalculator
      const costSummary = await productionCostCalculator.calculateProductionCost(id)

      return NextResponse.json({ 
        success: true, 
        data: {
          recordsCreated: createdRecords.length,
          totalCost: costSummary.totalCost,
          costPerPortion: costSummary.costPerPortion,
          ingredients: createdRecords.map((record) => ({
            inventoryItemId: record.inventoryItemId,
            quantityUsed: record.quantityUsed,
            unit: record.unit,
            totalCost: record.totalCost,
          }))
        }
      }, { status: 201 })

    } catch (error) {
      console.error('POST /api/sppg/production/:id/record-usage error:', error)
      return NextResponse.json({ 
        error: 'Failed to record stock usage',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, { status: 500 })
    }
  })
}
