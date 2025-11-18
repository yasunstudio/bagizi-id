/**
 * @fileoverview Procurement Order Escalation Endpoint
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * Endpoint to manually escalate pending order approval to higher authority
 * Validates user permissions and records escalation action
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { escalateApproval, getRequiredApprovers } from '@/lib/approval-workflow'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authentication Check
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. SPPG Access Check
    const sppgId = session.user.sppgId
    if (!sppgId) {
      return Response.json({ error: 'SPPG access required' }, { status: 403 })
    }

    // 3. Parse Request Body
    const body = await request.json()
    const { escalateToRole, reason } = body

    if (!escalateToRole || !reason) {
      return Response.json(
        { error: 'escalateToRole and reason are required' },
        { status: 400 }
      )
    }

    // 4. Fetch Order
    const order = await db.procurement.findFirst({
      where: {
        id: params.id,
        sppgId,
      },
      include: {
        approvals: true,
      },
    })

    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 })
    }

    // 5. Check if order is pending approval
    if (order.status !== 'PENDING_APPROVAL') {
      return Response.json(
        { error: 'Only pending orders can be escalated' },
        { status: 400 }
      )
    }

    // 6. Role validation - only certain roles can escalate
    const canEscalate = session.user.userRole && [
      'SPPG_KEPALA',
      'SPPG_ADMIN',
      'PLATFORM_SUPERADMIN',
    ].includes(session.user.userRole)

    if (!canEscalate) {
      return Response.json(
        { error: 'Insufficient permissions to escalate orders' },
        { status: 403 }
      )
    }

    // 7. Get current pending roles
    const requiredRoles = await getRequiredApprovers(sppgId, order.totalAmount)
    const approvedRoles = order.approvals
      .filter(a => a.action === 'APPROVED')
      .map(a => a.approverRole)
    const pendingRoles = requiredRoles.filter(role => !approvedRoles.includes(role))

    // 8. Perform escalation
    const escalationRecord = await escalateApproval(
      order.id,
      pendingRoles.join(', '),
      escalateToRole,
      reason,
      session.user.id
    )

    // 9. Return success response
    return Response.json({
      success: true,
      data: {
        orderId: order.id,
        escalation: {
          from: pendingRoles,
          to: escalateToRole,
          reason,
          escalatedBy: session.user.name,
          escalatedAt: escalationRecord.approvedAt,
        },
      },
    })
  } catch (error) {
    console.error('Escalate order error:', error)
    return Response.json(
      {
        error: 'Failed to escalate order',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
}
