/**
 * @fileoverview Reject Procurement Plan - POST endpoint
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Enterprise Development Guidelines
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth, hasPermission } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { z } from 'zod'

// Request body schema
const rejectSchema = z.object({
  rejectionReason: z.string().min(10, 'Rejection reason must be at least 10 characters')
})

// ================================ POST /api/sppg/procurement/plans/[id]/reject ================================

/**
 * Reject procurement plan
 * Changes status from SUBMITTED → REJECTED
 * Only Kepala SPPG or authorized approvers can reject
 * Requires rejection reason
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id } = await params

      // Permission Check - User must have approval permission
      if (!hasPermission(session.user.userRole, 'approval:approve')) {
        return NextResponse.json({
          success: false,
          error: 'Insufficient permissions - Only Kepala SPPG can reject procurement plans'
        }, { status: 403 })
      }

      // Fetch plan with multi-tenant check
      const plan = await db.procurementPlan.findFirst({
        where: {
          id,
          sppgId: session.user.sppgId! // Multi-tenant isolation
        }
      })

      if (!plan) {
        return NextResponse.json({
          success: false,
          error: 'Procurement plan not found or access denied'
        }, { status: 404 })
      }

      // Validate plan can be rejected
      if (plan.approvalStatus !== 'SUBMITTED') {
        return NextResponse.json({
          success: false,
          error: `Cannot reject plan with status ${plan.approvalStatus}. Only SUBMITTED plans can be rejected.`
        }, { status: 400 })
      }

      // Parse and validate request body
      const body = await request.json()
      const validated = rejectSchema.parse(body)

      // Update plan status to REJECTED
      const updatedPlan = await db.procurementPlan.update({
        where: { id },
        data: {
          approvalStatus: 'REJECTED',
          rejectionReason: validated.rejectionReason
        },
        include: {
          sppg: {
            select: {
              id: true,
              name: true
            }
          },
          program: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })

      // Success response
      return NextResponse.json({
        success: true,
        data: updatedPlan,
        message: 'Procurement plan rejected successfully'
      })

    } catch (error) {
      console.error('POST /api/sppg/procurement/plans/[id]/reject error:', error)

      // Validation error
      if (error instanceof z.ZodError) {
        return NextResponse.json({
          success: false,
          error: 'Validation failed',
          details: error.issues
        }, { status: 400 })
      }

      return NextResponse.json({
        success: false,
        error: 'Failed to reject procurement plan',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 })
    }
  })
}
