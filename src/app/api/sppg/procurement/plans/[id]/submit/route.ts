/**
 * @fileoverview Submit Procurement Plan for Approval - POST endpoint
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Enterprise Development Guidelines
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth, hasPermission } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

// ================================ POST /api/sppg/procurement/plans/[id]/submit ================================

/**
 * Submit procurement plan for approval
 * Changes status from DRAFT → SUBMITTED
 * Only managers can submit plans
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id } = await params

      // Permission Check - User must have procurement create permission (to submit)
      if (!hasPermission(session.user.userRole, 'procurement:create')) {
        return NextResponse.json({
          success: false,
          error: 'Insufficient permissions - Only managers can submit procurement plans'
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

      // Validate plan can be submitted
      if (plan.approvalStatus !== 'DRAFT' && plan.approvalStatus !== 'REJECTED') {
        return NextResponse.json({
          success: false,
          error: `Cannot submit plan with status ${plan.approvalStatus}. Only DRAFT or REJECTED plans can be submitted.`
        }, { status: 400 })
      }

      // Validate plan has required data
      if (!plan.planName || !plan.totalBudget || plan.totalBudget <= 0) {
        return NextResponse.json({
          success: false,
          error: 'Plan must have a name and valid total budget before submission'
        }, { status: 400 })
      }

      // Parse request body for optional submission notes
      const body = await request.json().catch(() => ({}))
      const submissionNotes = body.submissionNotes

      // Update plan status to SUBMITTED
      const updatedPlan = await db.procurementPlan.update({
        where: { id },
        data: {
          approvalStatus: 'SUBMITTED',
          submittedAt: new Date(),
          submittedBy: session.user.id,
          submissionNotes: submissionNotes || null
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
        message: 'Procurement plan submitted for approval successfully'
      })

    } catch (error) {
      console.error('POST /api/sppg/procurement/plans/[id]/submit error:', error)

      return NextResponse.json({
        success: false,
        error: 'Failed to submit procurement plan',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 })
    }
  })
}
