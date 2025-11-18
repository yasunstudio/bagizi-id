/**
 * @fileoverview API endpoint untuk Budget Transactions by ID - GET, PATCH, DELETE
 * @version Next.js 15.5.4 / Auth.js v5 / Enterprise-Grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * RBAC Integration:
 * - GET: Protected by withSppgAuth (all SPPG roles)
 * - PATCH: Protected by withSppgAuth with role check
 * - DELETE: Protected by withSppgAuth with role check
 * - Automatic audit logging for all operations
 * - Multi-tenant: Budget transaction ownership verified
 * 
 * CRITICAL: Auto-sync ProgramBudgetAllocation amounts on update/delete
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { budgetTransactionUpdateSchema } from '@/features/sppg/banper-tracking/lib/schemas'
import { UserRole } from '@prisma/client'

/**
 * GET /api/sppg/budget-transactions/[id]
 * Fetch single budget transaction by ID
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
      const transaction = await db.budgetTransaction.findFirst({
        where: {
          id: id,
          allocation: {
            sppgId: session.user.sppgId!, // Multi-tenant security
          },
        },
        include: {
          allocation: {
            select: {
              id: true,
              source: true,
              fiscalYear: true,
              allocatedAmount: true,
              spentAmount: true,
              remainingAmount: true,
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

      if (!transaction) {
        return NextResponse.json({ error: 'Budget transaction not found' }, { status: 404 })
      }

      return NextResponse.json({ success: true, data: transaction })
    } catch (error) {
      console.error('GET /api/sppg/budget-transactions/[id] error:', error)
      return NextResponse.json(
        {
          error: 'Failed to fetch budget transaction',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}

/**
 * PATCH /api/sppg/budget-transactions/[id]
 * Update budget transaction
 * If amount changes, auto-sync ProgramBudgetAllocation
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

      // Verify transaction exists and belongs to SPPG
      const existingTransaction = await db.budgetTransaction.findFirst({
        where: {
          id: id,
          allocation: {
            sppgId: session.user.sppgId!,
          },
        },
        include: {
          allocation: true,
        },
      })

      if (!existingTransaction) {
        return NextResponse.json({ error: 'Budget transaction not found' }, { status: 404 })
      }

      // Parse and validate request body
      const body = await request.json()
      const validated = budgetTransactionUpdateSchema.safeParse(body)

      if (!validated.success) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: validated.error.issues,
          },
          { status: 400 }
        )
      }

      // If amount is being updated, check if new amount is valid
      if (validated.data.amount && validated.data.amount !== existingTransaction.amount) {
        const amountDifference = validated.data.amount - existingTransaction.amount
        const newRemainingAmount = existingTransaction.allocation.remainingAmount - amountDifference

        if (newRemainingAmount < 0) {
          return NextResponse.json(
            { 
              error: 'Insufficient budget for updated amount',
              details: {
                requested: validated.data.amount,
                current: existingTransaction.amount,
                available: existingTransaction.allocation.remainingAmount + existingTransaction.amount,
              }
            },
            { status: 400 }
          )
        }

        // Update transaction and allocation in a transaction
        const result = await db.$transaction(async (tx) => {
          // Update budget transaction
          const transaction = await tx.budgetTransaction.update({
            where: { id: id },
            data: validated.data,
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

          // Update allocation amounts
          await tx.programBudgetAllocation.update({
            where: { id: existingTransaction.allocationId },
            data: {
              spentAmount: {
                increment: amountDifference,
              },
              remainingAmount: {
                decrement: amountDifference,
              },
              lastSpentAt: new Date(),
            },
          })

          return transaction
        })

        return NextResponse.json({ success: true, data: result })
      }

      // No amount change, just update other fields
      const transaction = await db.budgetTransaction.update({
        where: { id: id },
        data: validated.data,
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

      return NextResponse.json({ success: true, data: transaction })
    } catch (error) {
      console.error('PATCH /api/sppg/budget-transactions/[id] error:', error)
      return NextResponse.json(
        {
          error: 'Failed to update budget transaction',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}

/**
 * DELETE /api/sppg/budget-transactions/[id]
 * Delete budget transaction
 * Auto-adjust ProgramBudgetAllocation amounts
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

      // Delete transaction and update allocation in a transaction
      await db.$transaction(async (tx) => {
        // Delete transaction
        await tx.budgetTransaction.delete({
          where: { id: id },
        })

        // Restore allocation amounts
        await tx.programBudgetAllocation.update({
          where: { id: existingTransaction.allocationId },
          data: {
            spentAmount: {
              decrement: existingTransaction.amount,
            },
            remainingAmount: {
              increment: existingTransaction.amount,
            },
          },
        })
      })

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('DELETE /api/sppg/budget-transactions/[id] error:', error)
      return NextResponse.json(
        {
          error: 'Failed to delete budget transaction',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}
