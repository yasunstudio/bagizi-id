/**
 * @fileoverview API endpoint untuk Approve Budget Transaction
 * @version Next.js 15.5.4 / Auth.js v5 / Enterprise-Grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * RBAC Integration:
 * - POST: Protected by withSppgAuth with role check
 * - Automatic audit logging for all operations
 * - Multi-tenant: Budget transaction ownership verified
 * 
 * Business Logic:
 * - Records approval info (approver, timestamp, notes)
 * - For audit trail and financial compliance
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

/**
 * POST /api/sppg/budget-transactions/[id]/approve
 * Approve budget transaction for audit trail
 * 
 * @rbac Protected by withSppgAuth with role validation
 * @audit Automatic logging via middleware
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id } = await params
      // Role Check - Only certain roles can approve transactions
      const allowedRoles: UserRole[] = [
        'PLATFORM_SUPERADMIN',
        'SPPG_KEPALA',
        'SPPG_ADMIN',
        'SPPG_AKUNTAN',
      ]

      if (!session.user.userRole || !allowedRoles.includes(session.user.userRole as UserRole)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }

      // Verify transaction exists and belongs to SPPG
      const existingTransaction = await db.budgetTransaction.findFirst({
        where: {
          id: id,
          allocation: {
            sppgId: session.user.sppgId!,
          },
        },
      })

      if (!existingTransaction) {
        return NextResponse.json({ error: 'Budget transaction not found' }, { status: 404 })
      }

      // Parse request body for optional approval notes
      const body = await request.json()
      const approvalNotes = body.approvalNotes as string | undefined

      // Update transaction with approval info
      const transaction = await db.budgetTransaction.update({
        where: { id: id },
        data: {
          approvedBy: session.user.name || session.user.email,
          approvedAt: new Date(),
          notes: approvalNotes || existingTransaction.notes,
        },
        include: {
          allocation: {
            select: {
              id: true,
              source: true,
              program: {
                select: {
                  id: true,
                  name: true,
                  programCode: true,
                },
              },
            },
          },
        },
      })

      return NextResponse.json({ 
        success: true, 
        data: transaction,
        message: 'Transaction approved successfully'
      })
    } catch (error) {
      console.error('POST /api/sppg/budget-transactions/[id]/approve error:', error)
      return NextResponse.json(
        {
          error: 'Failed to approve transaction',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}
