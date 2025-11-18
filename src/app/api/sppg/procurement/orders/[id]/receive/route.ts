/**
 * @fileoverview Receive Order API Endpoint
 * Handles receiving procurement orders with QC validation
 * RBAC Integration: Protected by withSppgAuth wrapper
 * 
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { z } from 'zod'
import { 
  validateQCPhotos, 
  getQCChecklists, 
  validateQCChecklist 
} from '@/lib/qc-validation'

// ============================================================================
// Validation Schema
// ============================================================================

const receiveItemSchema = z.object({
  procurementItemId: z.string().cuid(),
  receivedQuantity: z.number().positive(),
  isAccepted: z.boolean().default(true),
  rejectionReason: z.string().optional(),
  returnedQuantity: z.number().min(0).default(0),
  qualityReceived: z.string().optional(),
  gradeReceived: z.string().optional(),
  batchNumber: z.string().optional(),
  productionDate: z.string().optional(),
  notes: z.string().optional(),
})

const qcChecklistItemSchema = z.object({
  checkpointName: z.string(),
  isPassed: z.boolean(),
  notes: z.string().optional(),
})

const receiveOrderSchema = z.object({
  items: z.array(receiveItemSchema),
  qcPhotos: z.array(z.string()).optional(), // Array of photo URLs
  qcChecklist: z.array(qcChecklistItemSchema).optional(),
  qcNotes: z.string().optional(),
  receivedBy: z.string().optional(),
  deliveryNote: z.string().optional(),
})

// ============================================================================
// POST /api/sppg/procurement/orders/[id]/receive - Receive Order
// ============================================================================

/**
 * @rbac Protected by withSppgAuth
 * @audit Automatic logging
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withSppgAuth(request, async (session) => {
    try {
      // Parse Request Body
      const body = await request.json()

      // Validation with Zod
      const validated = receiveOrderSchema.safeParse(body)
      if (!validated.success) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation failed',
            details: validated.error.format(),
          },
          { status: 400 }
        )
      }

      const data = validated.data

      // Fetch existing order with items
      const existingOrder = await db.procurement.findUnique({
        where: { 
          id: params.id,
          sppgId: session.user.sppgId!,
        },
        include: {
          items: true,
        },
      })

      if (!existingOrder) {
        return NextResponse.json(
          { success: false, error: 'Order not found' },
          { status: 404 }
        )
      }

      // Check if order can be received
      if (!['APPROVED', 'ORDERED', 'PARTIALLY_RECEIVED'].includes(existingOrder.status)) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Cannot receive order with status: ${existingOrder.status}` 
          },
          { status: 400 }
        )
      }

      // ============================================================================
      // Phase 2.1: Validate QC Photos Requirement
      // ============================================================================
      
      const qcPhotoValidation = await validateQCPhotos(
        session.user.sppgId!,
        data.qcPhotos || []
      )

      if (!qcPhotoValidation.isValid) {
        return NextResponse.json(
          {
            success: false,
            error: 'QC photo requirements not met',
            details: qcPhotoValidation,
          },
          { status: 400 }
        )
      }

      // ============================================================================
      // Phase 2.2: Validate QC Checklist Templates
      // ============================================================================
      
      // Get category from first item (assuming single category per order)
      const firstItem = existingOrder.items[0]
      const category = firstItem?.category

      let qcChecklistValidation = null
      let qcChecklistTemplates = null

      if (category) {
        // Fetch QC checklist templates for this category
        qcChecklistTemplates = await getQCChecklists(
          session.user.sppgId!,
          category
        )

        // If templates exist, validate checklist data
        if (qcChecklistTemplates.length > 0 && data.qcChecklist) {
          // Convert checklist array to Record<string, string | boolean>
          const checklistRecord: Record<string, string | boolean> = {}
          data.qcChecklist.forEach((item, index) => {
            checklistRecord[`checkpoint_${index}_name`] = item.checkpointName
            checklistRecord[`checkpoint_${index}_passed`] = item.isPassed
            if (item.notes) {
              checklistRecord[`checkpoint_${index}_notes`] = item.notes
            }
          })

          qcChecklistValidation = await validateQCChecklist(
            session.user.sppgId!,
            category,
            checklistRecord
          )

          if (!qcChecklistValidation.isValid) {
            return NextResponse.json(
              {
                success: false,
                error: 'QC checklist requirements not met',
                details: qcChecklistValidation,
              },
              { status: 400 }
            )
          }
        }
      }

      // ============================================================================
      // Process Receiving Transaction
      // ============================================================================

      const result = await db.$transaction(async (tx) => {
        // Update procurement items with received quantities
        for (const item of data.items) {
          const procurementItem = existingOrder.items.find(i => i.id === item.procurementItemId)
          
          if (!procurementItem) {
            throw new Error(`Procurement item ${item.procurementItemId} not found`)
          }

          const previousReceived = procurementItem.receivedQuantity || 0
          const newTotalReceived = previousReceived + item.receivedQuantity
          const acceptedQuantity = item.isAccepted ? item.receivedQuantity : 0

          await tx.procurementItem.update({
            where: { id: item.procurementItemId },
            data: {
              receivedQuantity: newTotalReceived,
              isAccepted: item.isAccepted,
              rejectionReason: item.rejectionReason || null,
              returnedQuantity: item.returnedQuantity,
              qualityReceived: item.qualityReceived || null,
              gradeReceived: item.gradeReceived || null,
              batchNumber: item.batchNumber || null,
              productionDate: item.productionDate ? new Date(item.productionDate) : null,
              notes: item.notes || null,
            },
          })

          // Update inventory if accepted
          if (item.isAccepted && acceptedQuantity > 0 && procurementItem.inventoryItemId) {
            const inventoryItem = await tx.inventoryItem.findUnique({
              where: { id: procurementItem.inventoryItemId },
            })

            if (inventoryItem) {
              const newStock = inventoryItem.currentStock + acceptedQuantity

              await tx.inventoryItem.update({
                where: { id: procurementItem.inventoryItemId },
                data: {
                  currentStock: newStock,
                },
              })

              // Create stock movement record
              await tx.stockMovement.create({
                data: {
                  inventoryId: procurementItem.inventoryItemId,
                  movementType: 'IN',
                  quantity: acceptedQuantity,
                  unit: procurementItem.unit,
                  stockBefore: inventoryItem.currentStock,
                  stockAfter: newStock,
                  unitCost: procurementItem.pricePerUnit,
                  totalCost: acceptedQuantity * procurementItem.pricePerUnit,
                  referenceType: 'PROCUREMENT',
                  referenceId: existingOrder.id,
                  referenceNumber: existingOrder.procurementCode,
                  batchNumber: item.batchNumber || null,
                  notes: `Received from procurement order ${existingOrder.procurementCode}`,
                  movedBy: session.user.id,
                  movedAt: new Date(),
                },
              })
            }
          }
        }

        // Determine new order status
        const allItems = existingOrder.items
        const allReceived = allItems.every(item => {
          const matchingInput = data.items.find(i => i.procurementItemId === item.id)
          if (!matchingInput) return false
          
          const totalReceived = (item.receivedQuantity || 0) + matchingInput.receivedQuantity
          return totalReceived >= item.orderedQuantity
        })

        const newStatus = allReceived ? 'FULLY_RECEIVED' : 'PARTIALLY_RECEIVED'

        // Update procurement order
        const updatedOrder = await tx.procurement.update({
          where: { id: params.id },
          data: {
            status: newStatus,
            deliveryStatus: allReceived ? 'COMPLETED' : 'PARTIAL',
            qualityNotes: data.qcNotes || null,
          },
          include: {
            items: true,
          },
        })

        // Create Procurement Quality Control record with checklist
        const qcRecord = await tx.procurementQualityControl.create({
          data: {
            procurementId: existingOrder.id,
            inspectedBy: data.receivedBy || session.user.name || 'Unknown',
            inspectedAt: new Date(),
            overallGrade: qcChecklistValidation?.isValid ? 'GOOD' : 'FAIR',
            overallStatus: qcChecklistValidation?.isValid ? 'PASSED' : 'PENDING',
            overallNotes: data.qcNotes || null,
            isApproved: qcChecklistValidation?.isValid || false,
          },
        })

        // Store QC checklist and photos in separate JSON field (could be in notes)
        const qcDetails = {
          photos: data.qcPhotos || [],
          checklist: data.qcChecklist || [],
          templates: qcChecklistTemplates,
        }

        // Create audit log
        await tx.auditLog.create({
          data: {
            sppgId: session.user.sppgId!,
            userId: session.user.id,
            userName: session.user.name || undefined,
            userEmail: session.user.email || undefined,
            action: 'UPDATE',
            entityType: 'PROCUREMENT',
            entityId: existingOrder.id,
            description: `Received procurement order ${existingOrder.procurementCode}`,
            oldValues: {
              status: existingOrder.status,
            },
            newValues: {
              status: newStatus,
              receivedItems: data.items.length,
              qcPhotos: data.qcPhotos?.length || 0,
              qcChecklistItems: data.qcChecklist?.length || 0,
              qcDetails,
            },
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown',
          },
        })

        return {
          order: updatedOrder,
          qcRecord,
          qcValidation: {
            photos: qcPhotoValidation,
            checklist: qcChecklistValidation,
          },
        }
      })

      // Return Success Response
      return NextResponse.json(
        {
          success: true,
          data: result,
          message: `Order received successfully. Status: ${result.order.status}`,
        },
        { status: 200 }
      )
    } catch (error) {
      console.error('POST /api/sppg/procurement/orders/[id]/receive error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to receive order',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}
