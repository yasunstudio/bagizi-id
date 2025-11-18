/**
 * @fileoverview Orders API - Approve Order Endpoint
 * Handles order approval workflow with status transition
 * 
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { z } from 'zod'
import type { UserRole } from '@prisma/client'
import {
  requiresParallelApproval,
  recordApproval,
  checkAllApprovalsReceived,
  hasUserApproved,
} from '@/lib/approval-workflow'
import { createNotificationService } from '@/lib/notification-service'

// ============================================================================
// Approval Schema
// ============================================================================

const approvalSchema = z.object({
  approvalNotes: z.string()
    .min(1, 'Approval notes are required')
    .max(500, 'Approval notes maximum 500 characters'),
  approvedBy: z.string()
    .min(1, 'Approver name is required')
    .max(200, 'Approver name maximum 200 characters')
    .optional(),
})

// ============================================================================
// POST /api/sppg/procurement/orders/[id]/approve - Approve Order
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withSppgAuth(request, async (session) => {
    const sppgId = session.user.sppgId!

    // 3. Verify Order Exists and Belongs to User's SPPG (moved up for efficiency)
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

    // ============================================================================
    // Phase 1.2 & 1.4: Fetch Approval Levels from Settings
    // ============================================================================
    const settings = await db.procurementSettings.findUnique({
      where: { sppgId },
      include: {
        approvalLevels: {
          where: { isActive: true },
          orderBy: { level: 'asc' }
        }
      }
    })

    // Find required approval level based on order amount
    const requiredLevel = settings?.approvalLevels.find(level => 
      existingOrder.totalAmount >= level.minAmount &&
      (!level.maxAmount || existingOrder.totalAmount <= level.maxAmount)
    )

    // Dynamic role validation based on approval levels
    if (requiredLevel) {
      // Use approval level's required role
      if (session.user.userRole !== requiredLevel.requiredRole && 
          session.user.userRole !== 'PLATFORM_SUPERADMIN') {
        return NextResponse.json(
          {
            success: false,
            error: `This order requires approval from: ${requiredLevel.requiredRole}`,
            details: {
              orderAmount: existingOrder.totalAmount,
              approvalLevel: requiredLevel.levelName,
              requiredRole: requiredLevel.requiredRole,
              yourRole: session.user.userRole,
              amountRange: `${requiredLevel.minAmount} - ${requiredLevel.maxAmount || '∞'}`
            }
          },
          { status: 403 }
        )
      }
      console.log(`[Approval Level] Order ${existingOrder.procurementCode}: Level ${requiredLevel.level} (${requiredLevel.levelName}) by ${session.user.userRole}`)
    } else {
      // Fallback to default roles if no approval level configured
      const defaultApproverRoles = [
        'SPPG_KEPALA',
        'SPPG_ADMIN',
        'SPPG_AKUNTAN',
        'PLATFORM_SUPERADMIN',
      ]
      
      if (!session.user.userRole || !defaultApproverRoles.includes(session.user.userRole)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Insufficient permissions to approve orders',
            details: `Required roles: ${defaultApproverRoles.join(', ')} (No approval levels configured)`,
          },
          { status: 403 }
        )
      }
      console.log(`[Default Approval] Order ${existingOrder.procurementCode}: No approval levels, using default roles`)
    }

    // 4. Check if Order Can Be Approved (Only PENDING_APPROVAL)
    if (existingOrder.status !== 'PENDING_APPROVAL') {
      return NextResponse.json(
        {
          success: false,
          error: 'Only orders with PENDING_APPROVAL status can be approved',
          details: `Current status: ${existingOrder.status}`,
        },
        { status: 400 }
      )
    }

    // 5. Parse Request Body
    const body = await request.json()

    // 6. Validation
    const validated = approvalSchema.safeParse(body)
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

    // ============================================================================
    // Phase 4.1: Parallel Approval Workflow
    // ============================================================================
    
    // Check if user has already approved
    const alreadyApproved = await hasUserApproved(params.id, session.user.id)
    if (alreadyApproved) {
      return NextResponse.json(
        {
          success: false,
          error: 'You have already approved this order',
        },
        { status: 400 }
      )
    }

    // Check if parallel approval is required
    const needsParallel = await requiresParallelApproval(sppgId, existingOrder.totalAmount)

    // Record this approval
    await recordApproval(
      params.id,
      session.user.id,
      session.user.name || session.user.email || 'Unknown',
      session.user.userRole! as UserRole,
      'APPROVED',
      data.approvalNotes,
      request.headers.get('x-forwarded-for') || undefined
    )

    // Check if all required approvals received
    const approvalCheck = await checkAllApprovalsReceived(
      sppgId,
      params.id,
      existingOrder.totalAmount
    )

    // Determine new status based on parallel approval requirements
    const newStatus = needsParallel && !approvalCheck.canProceed
      ? 'PENDING_APPROVAL' // Keep pending until all approvals received
      : 'APPROVED' // Proceed to approved

    // 8. Update Order Status (Transaction)
    const approvedOrder = await db.$transaction(async (tx) => {
      // Update order status based on parallel approval requirements
      const order = await tx.procurement.update({
        where: { id: params.id },
        data: {
          status: newStatus,
          // Store approval info in qualityNotes temporarily
          qualityNotes: `${existingOrder.qualityNotes || ''}\n\nAPPROVAL by ${data.approvedBy || session.user.name || session.user.email || 'Unknown'} (${session.user.userRole}) at ${new Date().toISOString()}\nNotes: ${data.approvalNotes}${needsParallel && !approvalCheck.canProceed ? `\n[Parallel Approval] Pending: ${approvalCheck.details?.pendingRoles.join(', ')}` : '\n[APPROVED] All required approvals received'}`.trim(),
        },
        include: {
          items: {
            include: {
              inventoryItem: true,
            },
          },
          plan: true,
          supplier: true,
          approvals: {
            orderBy: {
              approvedAt: 'desc',
            },
          },
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

    // 9. Send WhatsApp Notification (Phase 4.3)
    try {
      const notificationService = await createNotificationService(sppgId)
      if (notificationService && approvedOrder.status === 'APPROVED') {
        // Get SPPG admin users to notify about approval (phone or email)
        const adminUsers = await db.user.findMany({
          where: {
            sppgId,
            userRole: {
              in: ['SPPG_ADMIN', 'SPPG_KEPALA'],
            },
          },
          select: { phone: true, email: true, name: true },
        })

        const recipients = adminUsers
          .map(u => ({ phone: u.phone || undefined, email: u.email || undefined, name: u.name || 'Admin' }))
          .filter(r => r.phone || r.email)

        if (recipients.length > 0) {
          await notificationService.send({
            type: 'APPROVAL_GRANTED',
            sppgId,
            recipients,
            metadata: {
              orderId: approvedOrder.id,
              orderCode: approvedOrder.procurementCode,
              totalAmount: approvedOrder.totalAmount,
              approverName: session.user.name || 'Approver',
            },
          })
        }
      }
    } catch (notificationError) {
      // Log but don't fail approval if notification fails
      console.error('Failed to send approval notification:', notificationError)
    }

    // 10. Return Success Response with Parallel Approval Details
    const responseMessage = needsParallel && !approvalCheck.canProceed
      ? `Approval recorded. Pending approvals from: ${approvalCheck.details?.pendingRoles.join(', ')}`
      : 'Order approved successfully'

    return NextResponse.json({
      success: true,
      message: responseMessage,
      data: {
        order: approvedOrder,
        parallelApproval: needsParallel ? {
          enabled: true,
          allApproved: approvalCheck.canProceed,
          approvalDetails: approvalCheck.details,
        } : {
          enabled: false,
        },
      },
    })
  })
}
