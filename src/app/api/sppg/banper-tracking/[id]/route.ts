/**
 * @fileoverview API endpoint untuk Banper Request Tracking by ID - GET, PATCH, DELETE
 * @version Next.js 15.5.4 / Auth.js v5 / Enterprise-Grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * RBAC Integration:
 * - GET: Protected by withSppgAuth (all SPPG roles)
 * - PATCH: Protected by withSppgAuth with role check
 * - DELETE: Protected by withSppgAuth with role check
 * - Automatic audit logging for all operations
 * - Multi-tenant: Banper tracking ownership verified
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { updateBanperRequestSchema } from '@/features/sppg/banper-tracking/schemas'
import { UserRole } from '@prisma/client'

/**
 * GET /api/sppg/banper-tracking/[id]
 * Fetch single banper tracking record by ID
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
      const tracking = await db.banperRequestTracking.findFirst({
        where: {
          id: id,
          program: {
            sppgId: session.user.sppgId!, // Multi-tenant security
          },
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
              budgetSource: true,
              budgetYear: true,
              totalBudget: true,
              foodBudget: true,
              operationalBudget: true,
              sppg: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
          budgetAllocations: {
            select: {
              id: true,
              source: true,
              fiscalYear: true,
              allocatedAmount: true,
              spentAmount: true,
              remainingAmount: true,
              status: true,
              dpaNumber: true,
              dpaDate: true,
            },
            orderBy: {
              dpaDate: 'desc',
            },
          },
        },
      })

      if (!tracking) {
        return NextResponse.json({ error: 'Banper tracking not found' }, { status: 404 })
      }

      return NextResponse.json({ success: true, data: tracking })
    } catch (error) {
      console.error('GET /api/sppg/banper-tracking/[id] error:', error)
      return NextResponse.json(
        {
          error: 'Failed to fetch banper tracking',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}

/**
 * PATCH /api/sppg/banper-tracking/[id]
 * Update banper tracking record
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

      // Verify tracking exists and belongs to SPPG
      const existingTracking = await db.banperRequestTracking.findFirst({
        where: {
          id: id,
          program: {
            sppgId: session.user.sppgId!,
          },
        },
      })

      if (!existingTracking) {
        return NextResponse.json({ error: 'Banper tracking not found' }, { status: 404 })
      }

      // Can only update if status is DRAFT_LOCAL or SUBMITTED_TO_BGN
      if (!['DRAFT_LOCAL', 'SUBMITTED_TO_BGN'].includes(existingTracking.bgnStatus)) {
        return NextResponse.json(
          { error: 'Cannot update tracking in current status' },
          { status: 400 }
        )
      }

      // Parse and validate request body
      const body = await request.json()
      const validated = updateBanperRequestSchema.safeParse(body)

      if (!validated.success) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: validated.error.issues,
          },
          { status: 400 }
        )
      }

      // Update tracking - filter out null values for Prisma compatibility
      const updateData: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(validated.data)) {
        if (value !== null && value !== undefined) {
          updateData[key] = value
        }
      }

      const tracking = await db.banperRequestTracking.update({
        where: { id: id },
        data: updateData,
        include: {
          program: {
            select: {
              id: true,
              name: true,
              programCode: true,
              sppg: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
        },
      })

      return NextResponse.json({ success: true, data: tracking })
    } catch (error) {
      console.error('PATCH /api/sppg/banper-tracking/[id] error:', error)
      return NextResponse.json(
        {
          error: 'Failed to update banper tracking',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}

/**
 * DELETE /api/sppg/banper-tracking/[id]
 * Delete banper tracking record
 * Only allowed if status is DRAFT
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

      // Verify tracking exists and belongs to SPPG
      const existingTracking = await db.banperRequestTracking.findFirst({
        where: {
          id: id,
          program: {
            sppgId: session.user.sppgId!,
          },
        },
      })

      if (!existingTracking) {
        return NextResponse.json({ error: 'Banper tracking not found' }, { status: 404 })
      }

      // Can only delete if status is DRAFT_LOCAL
      if (existingTracking.bgnStatus !== 'DRAFT_LOCAL') {
        return NextResponse.json(
          { error: 'Cannot delete tracking that has been submitted' },
          { status: 400 }
        )
      }

      // Delete tracking
      await db.banperRequestTracking.delete({
        where: { id: id },
      })

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('DELETE /api/sppg/banper-tracking/[id] error:', error)
      return NextResponse.json(
        {
          error: 'Failed to delete banper tracking',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}
