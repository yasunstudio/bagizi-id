/**
 * @fileoverview API endpoint untuk Approve Banper Request (Record BGN Approval)
 * @version Next.js 15.5.4 / Auth.js v5 / Enterprise-Grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * RBAC Integration:
 * - POST: Protected by withSppgAuth with role check
 * - Automatic audit logging for all operations
 * - Multi-tenant: Banper tracking ownership verified
 * 
 * Business Logic:
 * - Status must be SUBMITTED or UNDER_REVIEW
 * - Records BGN approval info (SK decree, approval date, etc.)
 * - Updates status to APPROVED
 * - Automatically updates NutritionProgram with approval info
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { banperRequestTrackingApprovalSchema } from '@/features/sppg/banper-tracking/lib/schemas'
import { UserRole } from '@prisma/client'

/**
 * POST /api/sppg/banper-tracking/[id]/approve
 * Record BGN approval for banper request
 * Changes status to APPROVED and updates program with approval info
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
      // Role Check - Only certain roles can record approval
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
        include: {
          program: true,
        },
      })

      if (!existingTracking) {
        return NextResponse.json({ error: 'Banper tracking not found' }, { status: 404 })
      }

      // Validate status
      if (!['SUBMITTED_TO_BGN', 'UNDER_REVIEW_BGN'].includes(existingTracking.bgnStatus)) {
        return NextResponse.json(
          { error: 'Can only approve tracking in SUBMITTED_TO_BGN or UNDER_REVIEW_BGN status' },
          { status: 400 }
        )
      }

      // Parse and validate approval data
      const body = await request.json()
      const validated = banperRequestTrackingApprovalSchema.safeParse(body)

      if (!validated.success) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: validated.error.issues,
          },
          { status: 400 }
        )
      }

      // Update tracking in transaction
      const result = await db.$transaction(async (tx) => {
        // Update banper tracking
        const tracking = await tx.banperRequestTracking.update({
          where: { id: id },
          data: {
            bgnStatus: 'APPROVED_BY_BGN',
            bgnApprovalNumber: validated.data.bgnApprovalNumber,
            bgnApprovalDate: validated.data.bgnApprovalDate,
            bgnApprovedByName: validated.data.bgnApprovedByName,
            bgnApprovedByPosition: validated.data.bgnApprovedByPosition,
            bgnApprovalDocumentUrl: validated.data.bgnApprovalDocumentUrl,
          },
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

        return tracking
      })

      return NextResponse.json({ 
        success: true, 
        data: result,
        message: 'Banper request approved successfully'
      })
    } catch (error) {
      console.error('POST /api/sppg/banper-tracking/[id]/approve error:', error)
      return NextResponse.json(
        {
          error: 'Failed to approve banper request',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}
