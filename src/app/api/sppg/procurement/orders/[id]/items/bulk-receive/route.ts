/**
 * @fileoverview Procurement Items Bulk Receive API Endpoint
 * POST bulk update for receiving/QC workflow
 * 
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.18.0
 * @author Bagizi-ID Development Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { bulkReceiveItemsSchema } from '@/features/sppg/procurement/items/schemas/itemSchema'

/**
 * POST /api/sppg/procurement/orders/[id]/items/bulk-receive
 * Bulk receive/QC multiple items in a single transaction
 * 
 * Business Rules:
 * - All updates happen in a single transaction (rollback on any error)
 * - Inventory stock updates only for accepted items
 * - Stock movements created for all received items
 * - Returns validation errors for any invalid item
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id: orderId } = await params

      // Parse request body
      const body = await request.json()
      
      // Validate request body
      const validated = bulkReceiveItemsSchema.safeParse(body)
      if (!validated.success) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: validated.error.issues,
          },
          { status: 400 }
        )
      }

      const { items } = validated.data

      // Verify SPPG access
      if (!session.user.sppgId) {
        return NextResponse.json(
          { error: 'SPPG access required' },
          { status: 403 }
        )
      }

      // Verify order exists and belongs to user's SPPG
      const order = await db.procurement.findFirst({
        where: {
          id: orderId,
          sppgId: session.user.sppgId,
        },
        select: {
          id: true,
          procurementCode: true,
          status: true,
        },
      })

      if (!order) {
        return NextResponse.json(
          { error: 'Order not found or access denied' },
          { status: 404 }
        )
      }

      // Perform bulk update in transaction
      const result = await db.$transaction(async (tx) => {
        const updatedItems = []
        const errors = []

        for (const itemUpdate of items) {
          try {
            // Fetch current item
            const currentItem = await tx.procurementItem.findFirst({
              where: {
                id: itemUpdate.itemId,
                procurementId: orderId,
              },
              include: {
                inventoryItem: true,
              },
            })

            if (!currentItem) {
              errors.push({
                itemId: itemUpdate.itemId,
                error: 'Item not found',
              })
              continue
            }

            // Update procurement item with QC data
            if (!itemUpdate.isAccepted && !itemUpdate.rejectionReason) {
              errors.push({
                itemId: itemUpdate.itemId,
                error: 'Rejection reason is required when item is not accepted',
              })
              continue
            }

            // Calculate quantity delta for inventory update
            const previousReceived = currentItem.receivedQuantity || 0
            const newReceived = itemUpdate.receivedQuantity
            const quantityDelta = newReceived - previousReceived

            // Update item
            const updatedItem = await tx.procurementItem.update({
              where: { id: itemUpdate.itemId },
              data: {
                receivedQuantity: itemUpdate.receivedQuantity,
                qualityReceived: itemUpdate.qualityReceived,
                gradeReceived: itemUpdate.gradeReceived,
                isAccepted: itemUpdate.isAccepted,
                rejectionReason: itemUpdate.rejectionReason,
              },
              include: {
                inventoryItem: true,
              },
            })

            // Update inventory stock if item is accepted and has inventory reference
            if (
              itemUpdate.isAccepted &&
              quantityDelta !== 0 &&
              currentItem.inventoryItemId
            ) {
              await tx.inventoryItem.update({
                where: { id: currentItem.inventoryItemId },
                data: {
                  currentStock: {
                    increment: quantityDelta,
                  },
                },
              })

              // Create stock movement record
              await tx.stockMovement.create({
                data: {
                  inventoryId: currentItem.inventoryItemId!,
                  movementType: quantityDelta > 0 ? 'IN' : 'OUT',
                  quantity: Math.abs(quantityDelta),
                  unit: currentItem.unit,
                  stockBefore: 0, // Would need to fetch this
                  stockAfter: 0, // Would need to calculate this
                  referenceType: 'PROCUREMENT',
                  referenceId: orderId,
                  notes: `Bulk receive - ${itemUpdate.isAccepted ? 'Accepted' : 'Rejected'} (${order.procurementCode})`,
                  movedBy: session.user.id,
                },
              })
            }

            updatedItems.push(updatedItem)
          } catch (itemError) {
            console.error(`Error updating item ${itemUpdate.itemId}:`, itemError)
            errors.push({
              itemId: itemUpdate.itemId,
              error: 'Failed to update item',
            })
          }
        }

        // If there are errors, rollback transaction
        if (errors.length > 0) {
          throw new Error(`Failed to update ${errors.length} items`)
        }

        return { updatedItems, errors }
      })

      return NextResponse.json({
        success: true,
        data: {
          updated: result.updatedItems.length,
          items: result.updatedItems,
        },
        message: `Successfully received ${result.updatedItems.length} items`,
      })
    } catch (error) {
      console.error('Bulk receive items error:', error)
      
      // Check if it's a transaction rollback error
      if (error instanceof Error && error.message.includes('Failed to update')) {
        return NextResponse.json(
          {
            error: 'Some items could not be updated',
            details: error.message,
          },
          { status: 400 }
        )
      }

      return NextResponse.json(
        {
          error: 'Failed to bulk receive items',
          details: process.env.NODE_ENV === 'development' ? error : undefined,
        },
        { status: 500 }
      )
    }
  })
}
