/**
 * @fileoverview API endpoint untuk Budget Transactions - GET & POST
 * @version Next.js 15.5.4 / Auth.js v5 / Enterprise-Grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * RBAC Integration:
 * - GET: Protected by withSppgAuth (all SPPG roles)
 * - POST: Protected by withSppgAuth with role check
 * - Automatic audit logging for all operations
 * - Multi-tenant: Budget transactions filtered by session.user.sppgId
 * 
 * CRITICAL: Multi-tenant security with sppgId filtering
 * CRITICAL: Auto-update ProgramBudgetAllocation.usedAmount on transaction create
 * CRITICAL: Auto-generate transactionCode on creation
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { budgetTransactionCreateSchema } from '@/features/sppg/banper-tracking/lib/schemas'
import { UserRole, Prisma, BudgetTransactionCategory } from '@prisma/client'

/**
 * GET /api/sppg/budget-transactions
 * Fetch all budget transactions untuk SPPG user
 * Auto-filtered by sppgId (multi-tenant security)
 * 
 * @rbac Protected by withSppgAuth - requires valid SPPG session
 * @audit Automatic logging via middleware
 */
export async function GET(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // Parse query parameters for filtering
      const { searchParams } = new URL(request.url)
      const categoryParam = searchParams.get('category')
      const programId = searchParams.get('programId')
      const allocationId = searchParams.get('allocationId')
      const startDate = searchParams.get('startDate')
      const endDate = searchParams.get('endDate')
      const search = searchParams.get('search')

      // Validate enum value
      const category = categoryParam && Object.values(BudgetTransactionCategory).includes(categoryParam as BudgetTransactionCategory)
        ? (categoryParam as BudgetTransactionCategory)
        : undefined

      // Build where clause with multi-tenant filtering
      const where: Prisma.BudgetTransactionWhereInput = {
        allocation: {
          sppgId: session.user.sppgId!, // MANDATORY multi-tenant filter
        },
        ...(category && { transactionCategory: category }),
        ...(programId && { allocation: { programId } }),
        ...(allocationId && { allocationId }),
        ...(startDate && endDate && {
          transactionDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
        ...(search && {
          OR: [
            { transactionNumber: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
            { receiptNumber: { contains: search, mode: 'insensitive' as const } },
          ],
        }),
      }

      // Fetch transactions
      const transactions = await db.budgetTransaction.findMany({
        where,
        orderBy: [
          { transactionDate: 'desc' }, // Newest first
        ],
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

      return NextResponse.json({ success: true, data: transactions })
    } catch (error) {
      console.error('GET /api/sppg/budget-transactions error:', error)
      return NextResponse.json(
        {
          error: 'Failed to fetch budget transactions',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}

/**
 * POST /api/sppg/budget-transactions
 * Create new budget transaction
 * Auto-populate: transactionCode, transactionDate
 * Auto-update: ProgramBudgetAllocation.usedAmount and remainingAmount
 * 
 * @rbac Protected by withSppgAuth with role validation
 * @audit Automatic logging via middleware
 */
export async function POST(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // Role Check - Only certain roles can create budget transactions
      const allowedRoles: UserRole[] = [
        'PLATFORM_SUPERADMIN',
        'SPPG_KEPALA',
        'SPPG_ADMIN',
        'SPPG_AKUNTAN',
      ]

      if (!session.user.userRole || !allowedRoles.includes(session.user.userRole as UserRole)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }

      // Verify SPPG exists and is active
      const sppg = await db.sPPG.findFirst({
        where: {
          id: session.user.sppgId!,
          status: 'ACTIVE',
        },
      })

      if (!sppg) {
        return NextResponse.json({ error: 'SPPG not found or inactive' }, { status: 403 })
      }

      // Parse and validate request body
      const body = await request.json()
      const validated = budgetTransactionCreateSchema.safeParse(body)

      if (!validated.success) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: validated.error.issues,
          },
          { status: 400 }
        )
      }

      // Verify budget allocation belongs to SPPG and has sufficient funds
      const allocation = await db.programBudgetAllocation.findFirst({
        where: {
          id: validated.data.allocationId,
          sppgId: session.user.sppgId!,
        },
      })

      if (!allocation) {
        return NextResponse.json(
          { error: 'Budget allocation not found or access denied' },
          { status: 404 }
        )
      }

      // Check allocation status
      if (allocation.status !== 'ACTIVE') {
        return NextResponse.json(
          { error: 'Budget allocation is not active' },
          { status: 400 }
        )
      }

      // Check sufficient funds
      if (allocation.remainingAmount < validated.data.amount) {
        return NextResponse.json(
          { 
            error: 'Insufficient budget',
            details: {
              requested: validated.data.amount,
              available: allocation.remainingAmount,
            }
          },
          { status: 400 }
        )
      }

      // Verify related entities if provided
      if (validated.data.procurementId) {
        const procurement = await db.procurement.findFirst({
          where: {
            id: validated.data.procurementId,
            sppgId: session.user.sppgId!,
          },
        })
        if (!procurement) {
          return NextResponse.json(
            { error: 'Procurement not found or access denied' },
            { status: 404 }
          )
        }
      }

      if (validated.data.productionId) {
        const production = await db.foodProduction.findFirst({
          where: {
            id: validated.data.productionId,
            sppgId: session.user.sppgId!,
          },
        })
        if (!production) {
          return NextResponse.json(
            { error: 'Production not found or access denied' },
            { status: 404 }
          )
        }
      }

      if (validated.data.distributionId) {
        const distribution = await db.foodDistribution.findFirst({
          where: {
            id: validated.data.distributionId,
            sppgId: session.user.sppgId!,
          },
        })
        if (!distribution) {
          return NextResponse.json(
            { error: 'Distribution not found or access denied' },
            { status: 404 }
          )
        }
      }

      // Create transaction and update allocation in a transaction
      const result = await db.$transaction(async (tx) => {
        // Generate unique transactionNumber
        const timestamp = Date.now().toString().slice(-8)
        const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
        const transactionNumber = `TXN-${sppg.code}-${timestamp}-${randomSuffix}`

        // Create budget transaction
        const transaction = await tx.budgetTransaction.create({
          data: {
            ...validated.data,
            sppgId: session.user.sppgId!,
            transactionNumber,
            transactionDate: validated.data.transactionDate || new Date(),
            createdBy: session.user.name || session.user.email,
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

        // Update allocation amounts
        await tx.programBudgetAllocation.update({
          where: { id: validated.data.allocationId },
          data: {
            spentAmount: {
              increment: validated.data.amount,
            },
            remainingAmount: {
              decrement: validated.data.amount,
            },
            lastSpentAt: new Date(),
          },
        })

        return transaction
      })

      return NextResponse.json({ success: true, data: result }, { status: 201 })
    } catch (error) {
      console.error('POST /api/sppg/budget-transactions error:', error)
      return NextResponse.json(
        {
          error: 'Failed to create budget transaction',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}
