/**
 * @fileoverview Orders API - Cancel Order Endpoint
 * Handles order cancellation with refund tracking
 * 
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { z } from 'zod'

// ============================================================================
// Cancellation Schema
// ============================================================================

const cancellationSchema = z.object({
  cancellationReason: z.string()
    .min(10, 'Cancellation reason must be at least 10 characters')
    .max(1000, 'Cancellation reason maximum 1000 characters'),
  refundRequired: z.boolean()
    .default(false),
  refundAmount: z.number()
    .min(0, 'Refund amount must be non-negative')
    .optional(),
  cancelledBy: z.string()
    .max(200, 'Canceller name maximum 200 characters')
    .optional(),
})

// ============================================================================
// POST /api/sppg/procurement/orders/[id]/cancel - Cancel Order
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withSppgAuth(request, async (session) => {
    const sppgId = session.user.sppgId!

    // 3. Role Check - Only specific roles can cancel
    const cancellerRoles = [
      'SPPG_KEPALA',
      'SPPG_ADMIN',
      'SPPG_AKUNTAN',
      'PLATFORM_SUPERADMIN',
    ]
    
    if (!session.user.userRole || !cancellerRoles.includes(session.user.userRole)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Insufficient permissions to cancel orders',
          details: `Required roles: ${cancellerRoles.join(', ')}`,
        },
        { status: 403 }
      )
    }

    // 4. Verify Order Exists and Belongs to User's SPPG
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

    // 5. Check if Order Can Be Cancelled
    // Can cancel: APPROVED, ORDERED, PARTIALLY_RECEIVED
    const cancellableStatuses = ['APPROVED', 'ORDERED', 'PARTIALLY_RECEIVED']
    
    if (!cancellableStatuses.includes(existingOrder.status)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Order cannot be cancelled in current status',
          details: `Current status: ${existingOrder.status}. Cancellable statuses: ${cancellableStatuses.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // 6. Parse Request Body
    const body = await request.json()

    // 7. Validation
    const validated = cancellationSchema.safeParse(body)
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

    // 8. Validate refund amount if refund is required
    if (data.refundRequired && data.refundAmount) {
      if (data.refundAmount > existingOrder.paidAmount) {
        return NextResponse.json(
          {
            success: false,
            error: 'Refund amount cannot exceed paid amount',
            details: `Paid: ${existingOrder.paidAmount}, Requested refund: ${data.refundAmount}`,
          },
          { status: 400 }
        )
      }
    }

    // 9. Update Order Status (Transaction)
    const cancelledOrder = await db.$transaction(async (tx) => {
      // Update order status to CANCELLED
      const order = await tx.procurement.update({
        where: { id: params.id },
        data: {
          status: 'CANCELLED',
          // Store cancellation details in qualityNotes
          qualityNotes: `${existingOrder.qualityNotes || ''}\n\nCANCELLED by ${data.cancelledBy || session.user.name || session.user.email || 'Unknown'} at ${new Date().toISOString()}\nReason: ${data.cancellationReason}\nRefund Required: ${data.refundRequired ? 'Yes' : 'No'}${data.refundAmount ? `\nRefund Amount: ${data.refundAmount}` : ''}`.trim(),
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
      data: cancelledOrder,
      message: 'Order cancelled successfully',
    })
  })
}
