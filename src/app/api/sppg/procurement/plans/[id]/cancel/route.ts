/**
 * @fileoverview Cancel Procurement Plan - POST endpoint
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Enterprise Development Guidelines
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth, hasPermission } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { z } from 'zod'

// Request body schema
const cancelSchema = z.object({
  cancellationReason: z.string().min(10, 'Cancellation reason must be at least 10 characters')
})

// ================================ POST /api/sppg/procurement/plans/[id]/cancel ================================

/**
 * Cancel procurement plan
 * Changes status from any → CANCELLED
 * Can be done by managers or Kepala SPPG
 * Requires cancellation reason
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id } = await params

      // Permission Check - User must have procurement delete permission
      if (!hasPermission(session.user.userRole, 'procurement:delete')) {
        return NextResponse.json({
          success: false,
          error: 'Insufficient permissions - Only managers can cancel procurement plans'
        }, { status: 403 })
      }

      // Fetch plan with multi-tenant check
      const plan = await db.procurementPlan.findFirst({
        where: {
          id,
          sppgId: session.user.sppgId! // Multi-tenant isolation
        },
        include: {
          procurements: {
            select: {
              id: true,
              status: true
            }
          }
        }
      })

      if (!plan) {
        return NextResponse.json({
          success: false,
          error: 'Procurement plan not found or access denied'
        }, { status: 404 })
      }

      // Validate plan can be cancelled
      if (plan.approvalStatus === 'CANCELLED') {
        return NextResponse.json({
          success: false,
          error: 'Plan is already cancelled'
        }, { status: 400 })
      }

      // Check for active procurements
      const hasActiveProcurements = plan.procurements.some(
        p => p.status !== 'CANCELLED' && p.status !== 'DRAFT' && p.status !== 'REJECTED'
      )

      if (hasActiveProcurements) {
        return NextResponse.json({
          success: false,
          error: 'Cannot cancel plan with active procurements. Cancel or complete all procurements first.'
        }, { status: 403 })
      }

      // Parse and validate request body
      const body = await request.json()
      const validated = cancelSchema.parse(body)

      // Update plan status to CANCELLED
      const updatedPlan = await db.procurementPlan.update({
        where: { id },
        data: {
          approvalStatus: 'CANCELLED',
          cancellationReason: validated.cancellationReason
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
        message: 'Procurement plan cancelled successfully'
      })

    } catch (error) {
      console.error('POST /api/sppg/procurement/plans/[id]/cancel error:', error)

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
        error: 'Failed to cancel procurement plan',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 })
    }
  })
}
