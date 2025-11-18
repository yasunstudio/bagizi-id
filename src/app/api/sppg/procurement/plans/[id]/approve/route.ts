/**
 * @fileoverview Approve Procurement Plan - POST endpoint
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Enterprise Development Guidelines
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth, hasPermission } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

// ================================ POST /api/sppg/procurement/plans/[id]/approve ================================

/**
 * Approve procurement plan
 * Changes status from SUBMITTED → APPROVED
 * Only Kepala SPPG or authorized approvers can approve
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('=== APPROVE ENDPOINT CALLED ===')
    
    return withSppgAuth(request, async (session) => {
      try {
        const { id } = await params

        // Debug logging
        console.log('=== APPROVE PLAN DEBUG ===')
        console.log('Plan ID:', id)
        console.log('User Role:', session.user.userRole)
        console.log('User Email:', session.user.email)
        console.log('User SPPG ID:', session.user.sppgId)
        console.log('Has Permission:', hasPermission(session.user.userRole, 'approval:approve'))
        console.log('========================')

      // Permission Check - User must have approval permission
      if (!hasPermission(session.user.userRole, 'approval:approve')) {
        console.error('Permission denied for role:', session.user.userRole)
        return NextResponse.json({
          success: false,
          error: 'Insufficient permissions - Only Kepala SPPG can approve procurement plans'
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

      // Validate plan can be approved
      if (plan.approvalStatus !== 'SUBMITTED') {
        console.error('Invalid status for approval:', plan.approvalStatus)
        return NextResponse.json({
          success: false,
          error: `Cannot approve plan with status ${plan.approvalStatus}. Only SUBMITTED plans can be approved.`
        }, { status: 400 })
      }

      // Parse request body for optional approval notes
      const body = await request.json().catch(() => ({}))
      const approvalNotes = body.approvalNotes

      console.log('Approval Notes:', approvalNotes)
      console.log('Updating plan to APPROVED...')

      // Update plan status to APPROVED
      const updatedPlan = await db.procurementPlan.update({
        where: { id },
        data: {
          approvalStatus: 'APPROVED',
          approvedAt: new Date(),
          approvedBy: session.user.id,
          approvalNotes: approvalNotes || null
        }
      })

      console.log('Plan approved successfully:', updatedPlan.id)

      // Fetch complete data with relations
      const planWithRelations = await db.procurementPlan.findUnique({
        where: { id: updatedPlan.id },
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
      console.log('Plan approved successfully:', updatedPlan.id)
      return NextResponse.json({
        success: true,
        data: planWithRelations,
        message: 'Procurement plan approved successfully'
      })

    } catch (error) {
      console.error('POST /api/sppg/procurement/plans/[id]/approve error:', error)
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')

      return NextResponse.json({
        success: false,
        error: 'Failed to approve procurement plan',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 })
    }
  })
  } catch (outerError) {
    console.error('=== OUTER ERROR IN APPROVE ENDPOINT ===')
    console.error('Outer error:', outerError)
    console.error('Outer error message:', outerError instanceof Error ? outerError.message : 'Unknown')
    console.error('Outer error stack:', outerError instanceof Error ? outerError.stack : 'No stack')
    
    return NextResponse.json({
      success: false,
      error: 'Server error in approve endpoint',
      details: process.env.NODE_ENV === 'development' ? outerError : undefined
    }, { status: 500 })
  }
}
