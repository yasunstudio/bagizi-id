/**
 * @fileoverview Orders API Routes - Individual Order Operations
 * Handles GET, PATCH, DELETE for specific order
 * 
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { updateOrderFormSchema } from '@/features/sppg/procurement/orders/schemas'

// ============================================================================
// GET /api/sppg/procurement/orders/[id] - Get Single Order
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withSppgAuth(request, async (session) => {
    try {
      console.log('🔍 GET /api/sppg/procurement/orders/[id]')
      console.log('🔍 Order ID:', params.id)
      console.log('🔍 SPPG ID:', session.user.sppgId)
      
      // Debug: Check if order exists at all (without tenant filter)
      const anyOrder = await db.procurement.findUnique({
        where: { id: params.id },
        select: { id: true, sppgId: true, procurementCode: true }
      })
      console.log('🔍 Order exists in DB:', anyOrder ? 'YES' : 'NO')
      if (anyOrder) {
        console.log('🔍 Order belongs to SPPG:', anyOrder.sppgId)
        console.log('🔍 Does it match current user?', anyOrder.sppgId === session.user.sppgId)
      }
      
      // 3. Fetch Order with Multi-tenant Filter
      const order = await db.procurement.findFirst({
      where: {
        id: params.id,
        sppgId: session.user.sppgId!, // CRITICAL: Multi-tenant filtering
      },
      include: {
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
        plan: {
          select: {
            id: true,
            planName: true,
          },
        },
        supplier: {
          select: {
            id: true,
            supplierName: true,
            primaryContact: true,
            phone: true,
            email: true,
          },
        },
        qualityControls: {
          orderBy: {
            inspectedAt: 'desc',
          },
          take: 1,
        },
        approvals: {
          orderBy: {
            approvedAt: 'desc',
          },
        },
      },
    })

    // 4. Check if Order Exists
    if (!order) {
      console.log('❌ Order not found')
      console.log('❌ Searched with ID:', params.id, 'and SPPG:', session.user.sppgId)
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    // 5. Return Order
    console.log('✅ Order found:', order.procurementCode)
    return NextResponse.json({
      success: true,
      data: order,
    })
    } catch (error) {
      console.error('❌ Error in GET /api/sppg/procurement/orders/[id]:', error)
      console.error('❌ Error message:', error instanceof Error ? error.message : String(error))
      console.error('❌ Error stack:', error instanceof Error ? error.stack : 'N/A')
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch order',
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
          details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined
        },
        { status: 500 }
      )
    }
  })
}

// ============================================================================
// PATCH /api/sppg/procurement/orders/[id] - Update Order
// ============================================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withSppgAuth(request, async (session) => {
    const sppgId = session.user.sppgId!

    // 3. Verify Order Exists and Belongs to User's SPPG
    const existingOrder = await db.procurement.findFirst({
      where: {
        id: params.id,
        sppgId,
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

    // 4. Check if Order Can Be Updated (Only DRAFT or PENDING_APPROVAL)
    if (!['DRAFT', 'PENDING_APPROVAL'].includes(existingOrder.status)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Order cannot be updated in current status',
          details: `Status: ${existingOrder.status}`,
        },
        { status: 400 }
      )
    }

    // 5. Parse Request Body
    const body = await request.json()

    // 6. Validation
    const validated = updateOrderFormSchema.safeParse(body)
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

    // 7. Convert string dates to Date objects if provided
    const procurementDate = data.procurementDate ? new Date(data.procurementDate) : undefined
    const expectedDelivery = data.expectedDelivery ? new Date(data.expectedDelivery) : undefined
    const paymentDue = data.paymentDue ? new Date(data.paymentDue) : undefined

    // 8. Calculate totals if items are updated
    let subtotalAmount: number | undefined
    let taxAmount: number | undefined
    let discountAmount: number | undefined
    let shippingCost: number | undefined
    let totalAmount: number | undefined

    if (data.items && data.items.length > 0) {
      subtotalAmount = data.items.reduce((sum, item) => {
        return sum + (item.orderedQuantity * item.pricePerUnit)
      }, 0)

      taxAmount = subtotalAmount * 0.11 // 11% PPN
      discountAmount = 0
      shippingCost = data.transportCost || 0
      totalAmount = subtotalAmount + taxAmount - discountAmount + shippingCost
    }

    // 9. Update Order with Items (Transaction)
    const updatedOrder = await db.$transaction(async (tx) => {
      // Update main order
      const order = await tx.procurement.update({
        where: { id: params.id },
        data: {
          ...(data.planId !== undefined && { planId: data.planId || null }),
          ...(procurementDate && { procurementDate }),
          ...(expectedDelivery !== undefined && { expectedDelivery }),
          ...(data.supplierId && { supplierId: data.supplierId }),
          ...(data.supplierName !== undefined && { supplierName: data.supplierName || null }),
          ...(data.supplierContact !== undefined && { supplierContact: data.supplierContact || null }),
          ...(data.purchaseMethod && { purchaseMethod: data.purchaseMethod }),
          ...(data.paymentTerms !== undefined && { paymentTerms: data.paymentTerms || null }),
          ...(paymentDue !== undefined && { paymentDue }),
          ...(data.deliveryMethod !== undefined && { deliveryMethod: data.deliveryMethod || null }),
          ...(data.transportCost !== undefined && { transportCost: data.transportCost || null }),
          ...(data.packagingType !== undefined && { packagingType: data.packagingType || null }),
          ...(subtotalAmount !== undefined && { subtotalAmount }),
          ...(taxAmount !== undefined && { taxAmount }),
          ...(discountAmount !== undefined && { discountAmount }),
          ...(shippingCost !== undefined && { shippingCost }),
          ...(totalAmount !== undefined && { totalAmount }),
        },
        include: {
          items: {
            include: {
              inventoryItem: true,
            },
          },
          plan: true,
          supplier: true,
        },
      })

      // Update items if provided
      if (data.items && data.items.length > 0) {
        // Delete existing items
        await tx.procurementItem.deleteMany({
          where: { procurementId: params.id },
        })

        // Create new items
        await tx.procurementItem.createMany({
          data: data.items.map((item) => {
            const itemTotal = item.orderedQuantity * item.pricePerUnit
            const discount = itemTotal * (item.discountPercent || 0) / 100

            return {
              procurementId: params.id,
              inventoryItemId: item.inventoryItemId || undefined,
              itemName: item.itemName,
              itemCode: item.itemCode || undefined,
              category: item.category,
              brand: item.brand || undefined,
              orderedQuantity: item.orderedQuantity,
              unit: item.unit,
              pricePerUnit: item.pricePerUnit,
              totalPrice: itemTotal,
              discountPercent: item.discountPercent || 0,
              discountAmount: discount,
              finalPrice: itemTotal - discount,
              qualityStandard: item.qualityStandard || undefined,
              gradeRequested: item.gradeRequested || undefined,
              expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined,
              storageRequirement: item.storageRequirement || undefined,
              notes: item.notes || undefined,
            }
          }),
        })
      }

      // Create audit log
      await tx.auditLog.create({
        data: {
          sppgId,
          userId: session.user.id,
          action: 'UPDATE',
          entityType: 'PROCUREMENT',
          entityId: params.id,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      })

      return order
    })

    // 10. Return Success Response
    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: 'Order updated successfully',
    })
  })
}

// ============================================================================
// DELETE /api/sppg/procurement/orders/[id] - Delete Order (Soft Delete)
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withSppgAuth(request, async (session) => {
    const sppgId = session.user.sppgId!

    // 3. Verify Order Exists and Belongs to User's SPPG
    const existingOrder = await db.procurement.findFirst({
      where: {
        id: params.id,
        sppgId,
      },
    })

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    // 4. Check if Order Can Be Deleted (Only DRAFT)
    if (existingOrder.status !== 'DRAFT') {
      return NextResponse.json(
        {
          success: false,
          error: 'Only DRAFT orders can be deleted',
          details: `Current status: ${existingOrder.status}`,
        },
        { status: 400 }
      )
    }

    // 5. Delete Order (Hard delete - cascade will delete items)
    await db.$transaction(async (tx) => {
      // Delete order (items will cascade)
      await tx.procurement.delete({
        where: { id: params.id },
      })

      // Create audit log
      await tx.auditLog.create({
        data: {
          sppgId,
          userId: session.user.id,
          action: 'DELETE',
          entityType: 'PROCUREMENT',
          entityId: params.id,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      })
    })

    // 6. Return Success Response
    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully',
    })
  })
}
