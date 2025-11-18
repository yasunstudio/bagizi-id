/**
 * @fileoverview Parallel Approval Workflow Helper Functions
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * PHASE 4.1: Parallel Approval Workflow
 * - Track individual approvals from multiple roles
 * - Validate all required approvers have approved
 * - Support escalation mechanism
 * 
 * PHASE 4.3: WhatsApp Notifications
 * - Send notifications on escalation
 */

import { db } from '@/lib/prisma'
import { sendEscalationNotification } from '@/lib/notification-service'
import type { UserRole } from '@prisma/client'

/**
 * Approval Check Result
 */
export interface ApprovalCheckResult {
  canProceed: boolean
  message: string
  details?: {
    requiresParallelApproval: boolean
    requiredRoles: string[]
    approvedRoles: string[]
    pendingRoles: string[]
    allApproved: boolean
    totalRequired: number
    totalApproved: number
  }
}

/**
 * Check if order requires parallel approval
 * 
 * @param sppgId - SPPG ID
 * @param orderAmount - Order total amount
 * @returns True if parallel approval required
 */
export async function requiresParallelApproval(
  sppgId: string,
  orderAmount: number
): Promise<boolean> {
  const settings = await db.procurementSettings.findUnique({
    where: { sppgId },
  })

  if (!settings || !settings.requireParallelApproval) {
    return false
  }

  // Check if order amount requires approval levels
  const approvalLevels = await db.procurementApprovalLevel.findMany({
    where: {
      settingsId: settings.id,
      minAmount: {
        lte: orderAmount,
      },
      OR: [
        { maxAmount: null },
        { maxAmount: { gte: orderAmount } },
      ],
    },
    orderBy: {
      level: 'asc',
    },
  })

  return approvalLevels.length > 1 // Parallel if multiple levels required
}

/**
 * Get required approver roles for an order
 * 
 * @param sppgId - SPPG ID
 * @param orderAmount - Order total amount
 * @returns Array of required UserRole values
 */
export async function getRequiredApprovers(
  sppgId: string,
  orderAmount: number
): Promise<UserRole[]> {
  const settings = await db.procurementSettings.findUnique({
    where: { sppgId },
    include: {
      approvalLevels: {
        where: {
          minAmount: {
            lte: orderAmount,
          },
          OR: [
            { maxAmount: null },
            { maxAmount: { gte: orderAmount } },
          ],
        },
        orderBy: {
          level: 'asc',
        },
      },
    },
  })

  if (!settings || !settings.requireParallelApproval) {
    return []
  }

  return settings.approvalLevels.map(level => level.requiredRole as UserRole)
}

/**
 * Record an approval action
 * 
 * @param procurementId - Procurement order ID
 * @param approverId - User ID performing approval
 * @param approverName - User name
 * @param approverRole - User role
 * @param action - APPROVED, REJECTED, ESCALATED
 * @param comments - Optional comments
 * @param ipAddress - IP address of request
 * @returns Created approval record
 */
export async function recordApproval(
  procurementId: string,
  approverId: string,
  approverName: string,
  approverRole: UserRole,
  action: 'APPROVED' | 'REJECTED' | 'ESCALATED',
  comments?: string,
  ipAddress?: string
) {
  return await db.procurementApprovalTracking.create({
    data: {
      procurementId,
      approverUserId: approverId,
      approverName,
      approverRole,
      action,
      comments: comments || null,
      ipAddress: ipAddress || null,
      approvedAt: new Date(),
    },
  })
}

/**
 * Check if all required approvals have been received
 * 
 * @param sppgId - SPPG ID
 * @param procurementId - Procurement order ID
 * @param orderAmount - Order total amount
 * @returns Approval check result with details
 * 
 * @example
 * ```typescript
 * const result = await checkAllApprovalsReceived('sppg-id', 'order-id', 50000000)
 * if (!result.canProceed) {
 *   return NextResponse.json({ 
 *     error: result.message,
 *     details: result.details 
 *   }, { status: 400 })
 * }
 * ```
 */
export async function checkAllApprovalsReceived(
  sppgId: string,
  procurementId: string,
  orderAmount: number
): Promise<ApprovalCheckResult> {
  // Check if parallel approval is required
  const needsParallel = await requiresParallelApproval(sppgId, orderAmount)
  
  if (!needsParallel) {
    return {
      canProceed: true,
      message: 'Parallel approval not required',
    }
  }

  // Get required approver roles
  const requiredRoles = await getRequiredApprovers(sppgId, orderAmount)
  
  if (requiredRoles.length === 0) {
    return {
      canProceed: true,
      message: 'No approval levels configured',
    }
  }

  // Get existing approvals
  const existingApprovals = await db.procurementApprovalTracking.findMany({
    where: {
      procurementId,
      action: 'APPROVED',
    },
  })

  const approvedRoles = existingApprovals.map(a => a.approverRole)
  const pendingRoles = requiredRoles.filter(role => !approvedRoles.includes(role))

  const allApproved = pendingRoles.length === 0

  return {
    canProceed: allApproved,
    message: allApproved
      ? 'All required approvals received'
      : `Pending approvals from: ${pendingRoles.join(', ')}`,
    details: {
      requiresParallelApproval: needsParallel,
      requiredRoles: requiredRoles.map(String),
      approvedRoles: approvedRoles.map(String),
      pendingRoles: pendingRoles.map(String),
      allApproved,
      totalRequired: requiredRoles.length,
      totalApproved: approvedRoles.length,
    },
  }
}

/**
 * Check if user has already approved this order
 * 
 * @param procurementId - Procurement order ID
 * @param userId - User ID to check
 * @returns True if user already approved
 */
export async function hasUserApproved(
  procurementId: string,
  userId: string
): Promise<boolean> {
  const existing = await db.procurementApprovalTracking.findFirst({
    where: {
      procurementId,
      approverUserId: userId,
      action: 'APPROVED',
    },
  })

  return existing !== null
}

/**
 * Get approval history for an order
 * 
 * @param procurementId - Procurement order ID
 * @returns Array of approval records ordered by date
 */
export async function getApprovalHistory(procurementId: string) {
  return await db.procurementApprovalTracking.findMany({
    where: {
      procurementId,
    },
    orderBy: {
      approvedAt: 'desc',
    },
  })
}

/**
 * Get pending approvals that need escalation
 * Finds orders pending approval beyond configured escalation days
 * 
 * @param sppgId - SPPG ID
 * @returns Array of orders needing escalation
 */
export async function getPendingEscalations(sppgId: string) {
  const settings = await db.procurementSettings.findUnique({
    where: { sppgId },
  })

  if (!settings || settings.approvalEscalationDays <= 0) {
    return []
  }

  const escalationDate = new Date()
  escalationDate.setDate(escalationDate.getDate() - settings.approvalEscalationDays)

  // Find orders pending approval for more than X days
  const pendingOrders = await db.procurement.findMany({
    where: {
      sppgId,
      status: 'PENDING_APPROVAL',
      procurementDate: {
        lte: escalationDate,
      },
    },
    include: {
      approvals: {
        orderBy: {
          approvedAt: 'desc',
        },
      },
    },
  })

  return pendingOrders
}

/**
 * Escalate order approval to higher authority
 * Records escalation action and updates order notes
 * 
 * @param procurementId - Procurement order ID
 * @param escalatedFrom - Original approver role
 * @param escalatedTo - Higher authority role
 * @param reason - Escalation reason
 * @param escalatedBy - System user ID or "SYSTEM"
 * @returns Created escalation record
 */
export async function escalateApproval(
  procurementId: string,
  escalatedFrom: string,
  escalatedTo: string,
  reason: string,
  escalatedBy: string = 'SYSTEM'
) {
  // Get procurement details for notification
  const procurement = await db.procurement.findUnique({
    where: { id: procurementId },
    include: {
      sppg: true,
    },
  })

  if (!procurement) {
    throw new Error('Procurement not found')
  }

  // Record escalation in approval tracking
  const escalationRecord = await db.procurementApprovalTracking.create({
    data: {
      procurementId,
      approverUserId: escalatedBy,
      approverName: 'System Auto-Escalation',
      approverRole: escalatedTo,
      action: 'ESCALATED',
      comments: reason,
      isEscalated: true,
      escalatedFrom,
      escalatedReason: reason,
      approvedAt: new Date(),
    },
  })

  // Update procurement notes with escalation info
  await db.procurement.update({
    where: { id: procurementId },
    data: {
      qualityNotes: `${procurement.qualityNotes || ''}\n\n[ESCALATED] ${new Date().toISOString()}\nFrom: ${escalatedFrom}\nTo: ${escalatedTo}\nReason: ${reason}`.trim(),
    },
  })

  // Send notifications (WhatsApp + Email) if configured
  try {
    // Get settings for notification config
    const settings = await db.procurementSettings.findUnique({
      where: { sppgId: procurement.sppgId },
    })

    if (settings?.approvalNotificationWhatsapp || settings?.approvalNotificationEmail) {
      // Find users with escalatedTo role who have phone or email
      const escalatedToUsers = await db.user.findMany({
        where: {
          sppgId: procurement.sppgId,
          userRole: escalatedTo as UserRole,
        },
        select: {
          phone: true,
          email: true,
          name: true,
        },
      })

      const recipients = escalatedToUsers
        .map(u => ({ phone: u.phone || undefined, email: u.email || undefined, name: u.name || 'Approver' }))
        .filter(r => r.phone || r.email)

      if (recipients.length > 0) {
        await sendEscalationNotification(procurement.sppgId, procurementId, recipients, reason)
      }
    }
  } catch (notificationError) {
    // Log but don't fail escalation if notification fails
    console.error('Failed to send escalation notification:', notificationError)
  }

  return escalationRecord
}

/**
 * Process all pending escalations for an SPPG
 * Finds and escalates all orders that have exceeded escalation days
 * 
 * @param sppgId - SPPG ID
 * @returns Array of escalated order IDs
 */
export async function processEscalations(sppgId: string): Promise<string[]> {
  const pendingOrders = await getPendingEscalations(sppgId)
  const escalatedOrderIds: string[] = []

  for (const order of pendingOrders) {
    try {
      // Get required approvers
      const requiredRoles = await getRequiredApprovers(sppgId, order.totalAmount)
      
      // Get approved roles
      const approvedRoles = order.approvals
        .filter(a => a.action === 'APPROVED')
        .map(a => a.approverRole)

      // Find pending roles
      const pendingRoles = requiredRoles.filter(role => !approvedRoles.includes(role))

      if (pendingRoles.length > 0) {
        // Escalate to next higher role (SPPG_KEPALA or PLATFORM_SUPERADMIN)
        const escalateToRole = 'SPPG_KEPALA'
        
        await escalateApproval(
          order.id,
          pendingRoles.join(', '),
          escalateToRole,
          `Auto-escalated after ${order.procurementDate.toISOString()} (exceeded escalation threshold)`,
          'SYSTEM'
        )

        escalatedOrderIds.push(order.id)
      }
    } catch (error) {
      console.error(`Error escalating order ${order.id}:`, error)
    }
  }

  return escalatedOrderIds
}
