/**
 * @fileoverview API endpoint untuk Submit Banper Request to BGN Portal
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
 * - Status must be DRAFT
 * - All required fields must be filled
 * - Updates status to SUBMITTED
 * - Records submission timestamp and user
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { banperRequestTrackingSubmitSchema } from '@/features/sppg/banper-tracking/lib/schemas'
import { UserRole } from '@prisma/client'

/**
 * POST /api/sppg/banper-tracking/[id]/submit
 * Submit banper request to BGN Portal
 * Changes status from DRAFT to SUBMITTED
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
      // Role Check - Only certain roles can submit
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
      if (existingTracking.bgnStatus !== 'DRAFT_LOCAL') {
        return NextResponse.json(
          { error: 'Can only submit tracking in DRAFT_LOCAL status' },
          { status: 400 }
        )
      }

      // Validate required fields are filled
      if (!existingTracking.requestedAmount || existingTracking.requestedAmount <= 0) {
        return NextResponse.json(
          { error: 'Requested amount is required' },
          { status: 400 }
        )
      }

      if (!existingTracking.operationalPeriod) {
        return NextResponse.json(
          { error: 'Operational period is required' },
          { status: 400 }
        )
      }

      // Parse and validate submission data
      const body = await request.json()
      const validated = banperRequestTrackingSubmitSchema.safeParse(body)

      if (!validated.success) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: validated.error.issues,
          },
          { status: 400 }
        )
      }

      // Update tracking with submission info
      const tracking = await db.banperRequestTracking.update({
        where: { id: id },
        data: {
          bgnStatus: 'SUBMITTED_TO_BGN',
          bgnSubmissionDate: validated.data.bgnSubmissionDate,
          bgnRequestNumber: validated.data.bgnRequestNumber,
          bgnPortalUrl: validated.data.bgnPortalUrl,
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

      return NextResponse.json({ 
        success: true, 
        data: tracking,
        message: 'Banper request submitted successfully'
      })
    } catch (error) {
      console.error('POST /api/sppg/banper-tracking/[id]/submit error:', error)
      return NextResponse.json(
        {
          error: 'Failed to submit banper request',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}
