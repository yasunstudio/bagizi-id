/**
 * @fileoverview Orders API - Reject Order Endpoint
 * Handles order rejection workflow with reason tracking
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
// Rejection Schema
// ============================================================================

const rejectionSchema = z.object({
  rejectionReason: z.string()
    .min(10, 'Rejection reason must be at least 10 characters')
    .max(1000, 'Rejection reason maximum 1000 characters'),
  alternativeAction: z.string()
    .max(500, 'Alternative action maximum 500 characters')
    .optional(),
  rejectedBy: z.string()
    .max(200, 'Rejector name maximum 200 characters')
    .optional(),
})

// ============================================================================
// POST /api/sppg/procurement/orders/[id]/reject - Reject Order
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withSppgAuth(request, async (session) => {
    const sppgId = session.user.sppgId!

    // 3. Role Check - Only specific roles can reject
    const rejectorRoles = [
      'SPPG_KEPALA',
      'SPPG_ADMIN',
      'SPPG_AKUNTAN',
      'PLATFORM_SUPERADMIN',
    ]
    
    if (!session.user.userRole || !rejectorRoles.includes(session.user.userRole)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Insufficient permissions to reject orders',
          details: `Required roles: ${rejectorRoles.join(', ')}`,
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

    // 5. Check if Order Can Be Rejected (Only PENDING_APPROVAL)
    if (existingOrder.status !== 'PENDING_APPROVAL') {
      return NextResponse.json(
        {
          success: false,
          error: 'Only orders with PENDING_APPROVAL status can be rejected',
          details: `Current status: ${existingOrder.status}`,
        },
        { status: 400 }
      )
    }

    // 6. Parse Request Body
    const body = await request.json()

    // 7. Validation
    const validated = rejectionSchema.safeParse(body)
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

    // 8. Update Order Status (Transaction)
    const rejectedOrder = await db.$transaction(async (tx) => {
      // Update order status to REJECTED
      const order = await tx.procurement.update({
        where: { id: params.id },
        data: {
          status: 'REJECTED',
          rejectionReason: data.rejectionReason,
          // Store rejection details in qualityNotes
          qualityNotes: `${existingOrder.qualityNotes || ''}\n\nREJECTED by ${data.rejectedBy || session.user.name || session.user.email || 'Unknown'} at ${new Date().toISOString()}\nReason: ${data.rejectionReason}\n${data.alternativeAction ? `Alternative Action: ${data.alternativeAction}` : ''}`.trim(),
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

    // 9. Return Success Response
    return NextResponse.json({
      success: true,
      data: rejectedOrder,
      message: 'Order rejected successfully',
    })
  })
}
