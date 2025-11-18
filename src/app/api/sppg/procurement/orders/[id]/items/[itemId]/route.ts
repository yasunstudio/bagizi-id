/**
 * @fileoverview Procurement Item API - Single Item Operations
 * GET: Get item detail
 * PUT: Update item (receiving/QC)
 * DELETE: Remove item from order
 * 
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.18.0
 * @author Bagizi-ID Development Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { updateItemSchema } from '@/features/sppg/procurement/items/schemas/itemSchema'

// ============================================================================
// GET /api/sppg/procurement/orders/[id]/items/[itemId] - Get Item Detail
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id: orderId, itemId } = await params

      // Verify item exists and belongs to SPPG
      const item = await db.procurementItem.findFirst({
        where: {
          id: itemId,
          procurementId: orderId,
          procurement: {
            sppgId: session.user.sppgId!, // Multi-tenant check
          },
        },
        include: {
          inventoryItem: {
            select: {
              id: true,
              itemName: true,
              itemCode: true,
              category: true,
              currentStock: true,
              minStock: true,
              unit: true,
              brand: true,
              calories: true,
              protein: true,
              fat: true,
              carbohydrates: true,
            },
          },
          procurement: {
            select: {
              id: true,
              procurementCode: true,
              procurementDate: true,
              status: true,
              supplierName: true,
              expectedDelivery: true,
              actualDelivery: true,
            },
          },
          productionUsages: {
            select: {
              id: true,
              quantityUsed: true,
              production: {
                select: {
                  productionDate: true,
                },
              },
            },
            take: 5,
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      })

      if (!item) {
        return NextResponse.json(
          { success: false, error: 'Item not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: item,
      })
    } catch (error) {
      console.error('[GET /api/sppg/procurement/orders/[id]/items/[itemId]] Error:', error)
      
      return NextResponse.json(
        { success: false, error: 'Failed to fetch item' },
        { status: 500 }
      )
    }
  })
}

// ============================================================================
// PUT /api/sppg/procurement/orders/[id]/items/[itemId] - Update Item
// ============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id: orderId, itemId } = await params

      // Verify item exists and belongs to SPPG
      const existingItem = await db.procurementItem.findFirst({
        where: {
          id: itemId,
          procurementId: orderId,
          procurement: {
            sppgId: session.user.sppgId!,
          },
        },
        include: {
          procurement: true,
        },
      })

      if (!existingItem) {
        return NextResponse.json(
          { success: false, error: 'Item not found' },
          { status: 404 }
        )
      }

      // Parse and validate request body
      const body = await request.json()
      const validated = updateItemSchema.parse(body)

      // Validation: returned quantity cannot exceed received quantity
      if (validated.returnedQuantity && validated.receivedQuantity) {
        if (validated.returnedQuantity > validated.receivedQuantity) {
          return NextResponse.json(
            { success: false, error: 'Returned quantity cannot exceed received quantity' },
            { status: 400 }
          )
        }
      }

      // Validation: rejection reason required if not accepted
      if (validated.isAccepted === false && !validated.rejectionReason) {
        return NextResponse.json(
          { success: false, error: 'Rejection reason required when item is not accepted' },
          { status: 400 }
        )
      }

      // Update item
      const updatedItem = await db.procurementItem.update({
        where: { id: itemId },
        data: validated,
        include: {
          inventoryItem: {
            select: {
              id: true,
              itemName: true,
              itemCode: true,
              category: true,
              currentStock: true,
              minStock: true,
              unit: true,
            },
          },
          procurement: {
            select: {
              id: true,
              procurementCode: true,
              procurementDate: true,
              status: true,
              supplierName: true,
            },
          },
        },
      })

      // If item was fully received and accepted, update inventory stock
      if (
        validated.receivedQuantity && 
        validated.isAccepted === true && 
        existingItem.inventoryItemId
      ) {
        await db.inventoryItem.update({
          where: { id: existingItem.inventoryItemId },
          data: {
            currentStock: {
              increment: validated.receivedQuantity - (existingItem.receivedQuantity || 0),
            },
          },
        })

        // Create stock movement record
        await db.stockMovement.create({
          data: {
            inventoryId: existingItem.inventoryItemId,
            movementType: 'IN',
            quantity: validated.receivedQuantity - (existingItem.receivedQuantity || 0),
            unit: existingItem.unit,
            stockBefore: 0, // Would need to fetch this
            stockAfter: 0, // Would need to calculate this
            referenceType: 'PROCUREMENT',
            referenceId: orderId,
            notes: `Received from procurement ${existingItem.procurement.procurementCode}`,
            movedBy: session.user.id,
          },
        })
      }

      return NextResponse.json({
        success: true,
        data: updatedItem,
        message: 'Item updated successfully',
      })
    } catch (error) {
      console.error('[PUT /api/sppg/procurement/orders/[id]/items/[itemId]] Error:', error)
      
      if (error instanceof Error && error.message.includes('Zod')) {
        return NextResponse.json(
          { success: false, error: 'Validation failed', details: error.message },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { success: false, error: 'Failed to update item' },
        { status: 500 }
      )
    }
  })
}

// ============================================================================
// DELETE /api/sppg/procurement/orders/[id]/items/[itemId] - Delete Item
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id: orderId, itemId } = await params

      // Verify item exists and belongs to SPPG
      const item = await db.procurementItem.findFirst({
        where: {
          id: itemId,
          procurementId: orderId,
          procurement: {
            sppgId: session.user.sppgId!,
          },
        },
        include: {
          procurement: true,
        },
      })

      if (!item) {
        return NextResponse.json(
          { success: false, error: 'Item not found' },
          { status: 404 }
        )
      }

      // Only allow deletion from DRAFT or PENDING orders
      if (!['DRAFT', 'PENDING'].includes(item.procurement.status)) {
        return NextResponse.json(
          { success: false, error: 'Cannot delete items from orders with status: ' + item.procurement.status },
          { status: 400 }
        )
      }

      // Check if item has been used in production
      const usageCount = await db.productionStockUsage.count({
        where: { procurementItemId: itemId },
      })

      if (usageCount > 0) {
        return NextResponse.json(
          { success: false, error: 'Cannot delete item that has been used in production' },
          { status: 400 }
        )
      }

      // Delete item
      await db.procurementItem.delete({
        where: { id: itemId },
      })

      // Update order totals
      const remainingItems = await db.procurementItem.findMany({
        where: { procurementId: orderId },
      })

      const updatedSubtotal = remainingItems.reduce((sum, item) => sum + item.totalPrice, 0)
      const updatedDiscount = remainingItems.reduce((sum, item) => sum + item.discountAmount, 0)
      const updatedTotal = remainingItems.reduce((sum, item) => sum + item.finalPrice, 0)

      await db.procurement.update({
        where: { id: orderId },
        data: {
          subtotalAmount: updatedSubtotal,
          discountAmount: updatedDiscount,
          totalAmount: updatedTotal + item.procurement.taxAmount + item.procurement.shippingCost,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Item deleted successfully',
      })
    } catch (error) {
      console.error('[DELETE /api/sppg/procurement/orders/[id]/items/[itemId]] Error:', error)
      
      return NextResponse.json(
        { success: false, error: 'Failed to delete item' },
        { status: 500 }
      )
    }
  })
}
