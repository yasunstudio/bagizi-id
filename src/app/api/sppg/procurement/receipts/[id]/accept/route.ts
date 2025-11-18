/**
 * @fileoverview Accept Receipt API Route
 * @version Next.js 15.5.4 / API Routes / Enterprise-grade
 * @author Bagizi-ID Development Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

// ================================ POST - Accept Receipt ================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withSppgAuth(request, async (session) => {
    // Verify Receipt exists and belongs to SPPG
    const receipt = await db.procurement.findFirst({
      where: {
        id: params.id,
        sppgId: session.user.sppgId!,
      },
      include: {
        items: {
          include: {
            inventoryItem: true,
          },
        },
        qualityControls: {
          include: {
            items: {
              include: {
                checkPoints: true,
              },
            },
          },
          orderBy: {
            inspectedAt: 'desc',
          },
          take: 1,
        },
      },
    })

    if (!receipt) {
      return NextResponse.json(
        { error: 'Receipt not found or access denied' },
        { status: 404 }
      )
    }

    // Check if QC has been done
    if (receipt.qualityControls.length === 0) {
      return NextResponse.json(
        { error: 'Quality control must be completed before acceptance' },
        { status: 400 }
      )
    }

    const latestQC = receipt.qualityControls[0]

    // Check if QC is approved
    if (!latestQC.isApproved) {
      return NextResponse.json(
        { error: 'Quality control must be approved before acceptance' },
        { status: 400 }
      )
    }

    // Accept Receipt and Update Inventory
    await db.$transaction(async (tx) => {
      // Update procurement status
      await tx.procurement.update({
        where: { id: params.id },
        data: {
          status: 'COMPLETED',
          deliveryStatus: 'DELIVERED',
          qualityGrade: latestQC.overallGrade,
          qualityNotes: latestQC.overallNotes,
        },
      })

      // Update inventory for accepted items only (based on QC)
      for (const qcItem of latestQC.items) {
        if (qcItem.isAccepted && qcItem.acceptedQuantity > 0) {
          // Find corresponding procurement item
          const procItem = receipt.items.find((item) => item.id === qcItem.procurementItemId)
          
          if (procItem && procItem.inventoryItemId) {
            // Get current inventory stock
            const inventory = await tx.inventoryItem.findUnique({
              where: { id: procItem.inventoryItemId },
            })

            if (inventory) {
              const stockBefore = inventory.currentStock || 0
              const stockAfter = stockBefore + qcItem.acceptedQuantity

              // Create stock movement
              await tx.stockMovement.create({
                data: {
                  inventoryId: procItem.inventoryItemId,
                  movementType: 'IN',
                  quantity: qcItem.acceptedQuantity,
                  unit: inventory.unit,
                  stockBefore,
                  stockAfter,
                  unitCost: procItem.pricePerUnit,
                  totalCost: procItem.pricePerUnit * qcItem.acceptedQuantity,
                  referenceType: 'PROCUREMENT',
                  referenceId: receipt.id,
                  referenceNumber: receipt.procurementCode,
                  batchNumber: procItem.batchNumber || undefined,
                  expiryDate: procItem.expiryDate || undefined,
                  notes: `Accepted from QC: ${qcItem.itemName} (Grade: ${qcItem.qualityGrade})`,
                  movedBy: session.user.id,
                },
              })

              // Update inventory current stock
              await tx.inventoryItem.update({
                where: { id: procItem.inventoryItemId },
                data: {
                  currentStock: stockAfter,
                },
              })
            }
          }
        }
      }
    })

    // Log Activity
    await db.auditLog.create({
      data: {
        sppgId: session.user.sppgId!,
        userId: session.user.id,
        action: 'UPDATE',
        entityType: 'PROCUREMENT',
        entityId: receipt.id,
        description: `Penerimaan barang diterima: ${receipt.procurementCode}`,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Penerimaan barang berhasil diterima',
    })
  })
}
