/**
 * @fileoverview Individual Receipt API Routes - GET, PUT, DELETE
 * @version Next.js 15.5.4 / API Routes / Enterprise-grade
 * @author Bagizi-ID Development Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { updateReceiptSchema } from '@/features/sppg/procurement/receipts/schemas'
import { ZodError } from 'zod'

// ================================ GET - Get Receipt by ID ================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withSppgAuth(request, async (session) => {
    // Fetch Receipt with Details
    const receipt = await db.procurement.findFirst({
      where: {
        id: params.id,
        sppgId: session.user.sppgId!, // Multi-tenant safety
        deliveryStatus: {
          in: ['DELIVERED', 'PARTIAL'],
        },
      },
      include: {
        supplier: {
          select: {
            id: true,
            supplierName: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            province: true,
            postalCode: true,
            primaryContact: true,
          },
        },
        items: {
          include: {
            inventoryItem: {
              select: {
                id: true,
                itemName: true,
                unit: true,
                category: true,
              },
            },
          },
        },
      },
    })

    if (!receipt) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: receipt,
    })
  })
}

// ================================ PUT - Update Receipt ================================

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withSppgAuth(request, async (session) => {
    // Parse Request Body
    const body = await request.json()

    // Validate with Zod
    const validated = updateReceiptSchema.parse(body)

    // 5. Verify Receipt exists and belongs to SPPG
    const existingReceipt = await db.procurement.findFirst({
      where: {
        id: params.id,
        sppgId: session.user.sppgId!,
      },
      include: {
        items: true,
      },
    })

    if (!existingReceipt) {
      return NextResponse.json(
        { error: 'Receipt not found or access denied' },
        { status: 404 }
      )
    }

    // 6. Update Receipt with Transaction
    const updatedReceipt = await db.$transaction(async (tx: Prisma.TransactionClient) => {
      // Update procurement/receipt data
      const updated = await tx.procurement.update({
        where: { id: params.id },
        data: {
          ...(validated.actualDelivery && { actualDelivery: validated.actualDelivery }),
          ...(validated.receiptNumber && { receiptNumber: validated.receiptNumber }),
          ...(validated.receiptPhoto && { receiptPhoto: validated.receiptPhoto }),
          ...(validated.deliveryPhoto && { deliveryPhoto: validated.deliveryPhoto }),
          ...(validated.deliveryMethod && { deliveryMethod: validated.deliveryMethod }),
          ...(validated.transportCost !== undefined && { transportCost: validated.transportCost }),
          ...(validated.packagingType && { packagingType: validated.packagingType }),
          ...(validated.invoiceNumber && { invoiceNumber: validated.invoiceNumber }),
          ...(validated.acceptanceStatus && { acceptanceStatus: validated.acceptanceStatus }),
          ...(validated.rejectionReason && { rejectionReason: validated.rejectionReason }),
        },
        include: {
          supplier: {
            select: {
              id: true,
              supplierName: true,
              email: true,
              phone: true,
            },
          },
          items: {
            include: {
              inventoryItem: {
                select: {
                  id: true,
                  itemName: true,
                  unit: true,
                },
              },
            },
          },
        },
      })

      return updated
    })

    // 7. Log Activity
    await db.auditLog.create({
      data: {
        sppgId: session.user.sppgId!,
        userId: session.user.id,
        action: 'UPDATE',
        entityType: 'RECEIPT',
        entityId: updatedReceipt.id,
        description: `Penerimaan barang diupdate: ${updatedReceipt.procurementCode}`,
        metadata: {
          receiptNumber: validated.receiptNumber,
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedReceipt,
      message: 'Penerimaan barang berhasil diupdate',
    })
  })
}

// ================================ DELETE - Delete Receipt ================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withSppgAuth(request, async (session) => {
    // SPPG Access Check
    if (!session.user.sppgId) {
      return NextResponse.json({ error: 'SPPG access required' }, { status: 403 })
    }

    // 3. Verify Receipt exists and belongs to SPPG
    const receipt = await db.procurement.findFirst({
      where: {
        id: params.id,
        sppgId: session.user.sppgId!,
      },
      // TODO: Add qualityControl relation when schema supports it
      // include: { qualityControl: true }
    })

    if (!receipt) {
      return NextResponse.json(
        { error: 'Receipt not found or access denied' },
        { status: 404 }
      )
    }

    // 4. Check if receipt can be deleted
    // TODO: Add QC check when schema supports it
    // const hasAcceptedQC = receipt.qualityControl?.some((qc) => qc.overallNotes)
    // if (hasAcceptedQC) {
    //   return NextResponse.json({ error: 'Cannot delete receipt with completed QC' }, { status: 400 })
    // }

    // 5. Delete Receipt (revert procurement to pending delivery)
    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      // TODO: Delete quality control records when schema supports it

      // Reset procurement to pending delivery
      await tx.procurement.update({
        where: { id: params.id },
        data: {
          deliveryStatus: 'PENDING',
          actualDelivery: null,
          receiptNumber: null,
          receiptPhoto: null,
          deliveryPhoto: null,
        },
      })

      // Reset item quantities
      await tx.procurementItem.updateMany({
        where: { procurementId: params.id },
        data: {
          receivedQuantity: null,
          batchNumber: null,
          expiryDate: null,
        },
      })
    })

    // Log Activity
    await db.auditLog.create({
      data: {
        sppgId: session.user.sppgId!,
        userId: session.user.id,
        action: 'DELETE',
        entityType: 'RECEIPT',
        entityId: receipt.id,
        description: `Penerimaan barang dihapus: ${receipt.procurementCode}`,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Penerimaan barang berhasil dihapus',
    })
  })
}
