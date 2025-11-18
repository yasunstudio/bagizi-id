/**
 * @fileoverview API endpoint untuk Budget Allocations by ID - GET, PATCH, DELETE
 * @version Next.js 15.5.4 / Auth.js v5 / Enterprise-Grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * RBAC Integration:
 * - GET: Protected by withSppgAuth (all SPPG roles)
 * - PATCH: Protected by withSppgAuth with role check
 * - DELETE: Protected by withSppgAuth with role check
 * - Automatic audit logging for all operations
 * - Multi-tenant: Budget allocation ownership verified
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { programBudgetAllocationUpdateSchema } from '@/features/sppg/banper-tracking/lib/schemas'
import { UserRole } from '@prisma/client'

/**
 * GET /api/sppg/budget-allocations/[id]
 * Fetch single budget allocation by ID
 * 
 * @rbac Protected by withSppgAuth
 * @audit Automatic logging via middleware
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id } = await params
      const allocation = await db.programBudgetAllocation.findFirst({
        where: {
          id: id,
          sppgId: session.user.sppgId!, // Multi-tenant security
        },
        include: {
          program: {
            select: {
              id: true,
              name: true,
              programCode: true,
              programType: true,
              startDate: true,
              endDate: true,
              allowedTargetGroups: true,
              targetRecipients: true,
            },
          },
          sppg: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          banperTracking: {
            select: {
              id: true,
              bgnRequestNumber: true,
              bgnStatus: true,
              requestedAmount: true,
              disbursedAmount: true,
            },
          },
          transactions: {
            select: {
              id: true,
              transactionNumber: true,
              category: true,
              amount: true,
              transactionDate: true,
              description: true,
            },
            orderBy: {
              transactionDate: 'desc',
            },
          },
        },
      })

      if (!allocation) {
        return NextResponse.json({ error: 'Budget allocation not found' }, { status: 404 })
      }

      return NextResponse.json({ success: true, data: allocation })
    } catch (error) {
      console.error('GET /api/sppg/budget-allocations/[id] error:', error)
      return NextResponse.json(
        {
          error: 'Failed to fetch budget allocation',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}

/**
 * PATCH /api/sppg/budget-allocations/[id]
 * Update budget allocation
 * Cannot update usedAmount/remainingAmount directly (auto-calculated from transactions)
 * 
 * @rbac Protected by withSppgAuth with role validation
 * @audit Automatic logging via middleware
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id } = await params
      // Role Check
      const allowedRoles: UserRole[] = [
        'PLATFORM_SUPERADMIN',
        'SPPG_KEPALA',
        'SPPG_ADMIN',
        'SPPG_AKUNTAN',
      ]

      if (!session.user.userRole || !allowedRoles.includes(session.user.userRole as UserRole)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }

      // Verify allocation exists and belongs to SPPG
      const existingAllocation = await db.programBudgetAllocation.findFirst({
        where: {
          id: id,
          sppgId: session.user.sppgId!,
        },
      })

      if (!existingAllocation) {
        return NextResponse.json({ error: 'Budget allocation not found' }, { status: 404 })
      }

      // Parse and validate request body
      const body = await request.json()
      const validated = programBudgetAllocationUpdateSchema.safeParse(body)

      if (!validated.success) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: validated.error.issues,
          },
          { status: 400 }
        )
      }

      // Update allocation (no recalculation needed for partial update)
      const allocation = await db.programBudgetAllocation.update({
        where: { id: id },
        data: validated.data,
        include: {
          program: {
            select: {
              id: true,
              name: true,
              programCode: true,
            },
          },
          sppg: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      })

      return NextResponse.json({ success: true, data: allocation })
    } catch (error) {
      console.error('PATCH /api/sppg/budget-allocations/[id] error:', error)
      return NextResponse.json(
        {
          error: 'Failed to update budget allocation',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}

/**
 * DELETE /api/sppg/budget-allocations/[id]
 * Delete budget allocation
 * Only allowed if no transactions exist
 * 
 * @rbac Protected by withSppgAuth with role validation
 * @audit Automatic logging via middleware
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id } = await params
      // Role Check
      const allowedRoles: UserRole[] = [
        'PLATFORM_SUPERADMIN',
        'SPPG_KEPALA',
        'SPPG_ADMIN',
      ]

      if (!session.user.userRole || !allowedRoles.includes(session.user.userRole as UserRole)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }

      // Verify allocation exists and belongs to SPPG
      const existingAllocation = await db.programBudgetAllocation.findFirst({
        where: {
          id: id,
          sppgId: session.user.sppgId!,
        },
        include: {
          _count: {
            select: {
              transactions: true,
            },
          },
        },
      })

      if (!existingAllocation) {
        return NextResponse.json({ error: 'Budget allocation not found' }, { status: 404 })
      }

      // Cannot delete if transactions exist
      if (existingAllocation._count.transactions > 0) {
        return NextResponse.json(
          { error: 'Cannot delete allocation with existing transactions' },
          { status: 400 }
        )
      }

      // Delete allocation
      await db.programBudgetAllocation.delete({
        where: { id: id },
      })

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('DELETE /api/sppg/budget-allocations/[id] error:', error)
      return NextResponse.json(
        {
          error: 'Failed to delete budget allocation',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}
