/**
 * @fileoverview API endpoint untuk Program Budget Allocations - GET & POST
 * @version Next.js 15.5.4 / Auth.js v5 / Enterprise-Grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * RBAC Integration:
 * - GET: Protected by withSppgAuth (all SPPG roles)
 * - POST: Protected by withSppgAuth with role check
 * - Automatic audit logging for all operations
 * - Multi-tenant: Budget allocations filtered by session.user.sppgId
 * 
 * CRITICAL: Multi-tenant security with sppgId filtering
 * CRITICAL: Auto-generate allocationCode on creation
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { programBudgetAllocationCreateSchema } from '@/features/sppg/banper-tracking/lib/schemas'
import { UserRole, Prisma, BudgetAllocationStatus } from '@prisma/client'

/**
 * GET /api/sppg/budget-allocations
 * Fetch all budget allocations untuk SPPG user
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
      const statusParam = searchParams.get('status')
      const programId = searchParams.get('programId')
      const fiscalYear = searchParams.get('fiscalYear')
      const search = searchParams.get('search')

      // Validate enum value
      const status = statusParam && Object.values(BudgetAllocationStatus).includes(statusParam as BudgetAllocationStatus)
        ? (statusParam as BudgetAllocationStatus)
        : undefined

      // Build where clause with multi-tenant filtering
      const where: Prisma.ProgramBudgetAllocationWhereInput = {
        sppgId: session.user.sppgId!,
        ...(statusParam && status && { status }),
        ...(fiscalYear && { fiscalYear: parseInt(fiscalYear) }),
        ...(programId && { programId }),
        ...(search && {
          OR: [
            { dpaNumber: { contains: search, mode: 'insensitive' as const } },
            { decreeNumber: { contains: search, mode: 'insensitive' as const } },
          ],
        }),
      }

      // Fetch budget allocations with relations
      const allocations = await db.programBudgetAllocation.findMany({
        where,
        orderBy: [
          { status: 'asc' }, // Active first
          { fiscalYear: 'desc' }, // Recent fiscal year first
          { allocatedDate: 'desc' }, // Newest first
        ],
        include: {
          program: {
            select: {
              id: true,
              name: true,
              programCode: true,
              programType: true,
              startDate: true,
              endDate: true,
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
          _count: {
            select: {
              transactions: true,
            },
          },
        },
      })

      return NextResponse.json({ success: true, data: allocations })
    } catch (error) {
      console.error('GET /api/sppg/budget-allocations error:', error)
      return NextResponse.json(
        {
          error: 'Failed to fetch budget allocations',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}

/**
 * POST /api/sppg/budget-allocations
 * Create new budget allocation
 * Auto-populate: allocationCode, usedAmount (0), remainingAmount (= allocatedAmount)
 * 
 * @rbac Protected by withSppgAuth with role validation
 * @audit Automatic logging via middleware
 */
export async function POST(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // Role Check - Only certain roles can create budget allocations
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
      const validated = programBudgetAllocationCreateSchema.safeParse(body)

      if (!validated.success) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: validated.error.issues,
          },
          { status: 400 }
        )
      }

      // Verify program belongs to SPPG
      const program = await db.nutritionProgram.findFirst({
        where: {
          id: validated.data.programId,
          sppgId: session.user.sppgId!,
        },
      })

      if (!program) {
        return NextResponse.json(
          { error: 'Program not found or access denied' },
          { status: 404 }
        )
      }

      // Verify banper tracking if provided
      if (validated.data.banperTrackingId) {
        const banperTracking = await db.banperRequestTracking.findFirst({
          where: {
            id: validated.data.banperTrackingId,
            programId: validated.data.programId,
            program: {
              sppgId: session.user.sppgId!,
            },
          },
        })

        if (!banperTracking) {
          return NextResponse.json(
            { error: 'Banper tracking not found or access denied' },
            { status: 404 }
          )
        }
      }

      // Create budget allocation with auto-populated fields
      const allocation = await db.programBudgetAllocation.create({
        data: {
          ...validated.data,
          sppgId: session.user.sppgId!, // Multi-tenant safety
          spentAmount: 0,
          remainingAmount: validated.data.allocatedAmount,
          status: 'ACTIVE',
          allocatedBy: session.user.name || session.user.email,
        },
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

      return NextResponse.json({ success: true, data: allocation }, { status: 201 })
    } catch (error) {
      console.error('POST /api/sppg/budget-allocations error:', error)
      return NextResponse.json(
        {
          error: 'Failed to create budget allocation',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}
