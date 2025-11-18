/**
 * @fileoverview API endpoint untuk Disburse Banper Budget
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
 * - Status must be APPROVED
 * - Records disbursement info (SP2D, transfer date, etc.)
 * - Updates status to DISBURSED
 * - Creates ProgramBudgetAllocation record automatically
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { banperRequestTrackingDisbursementSchema } from '@/features/sppg/banper-tracking/lib/schemas'
import { UserRole } from '@prisma/client'

/**
 * POST /api/sppg/banper-tracking/[id]/disburse
 * Record budget disbursement for approved banper request
 * Changes status to DISBURSED and creates budget allocation
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
      // Role Check - Only certain roles can record disbursement
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
        include: {
          program: {
            select: {
              id: true,
              name: true,
              programCode: true,
              budgetSource: true,
              budgetYear: true,
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

      if (!existingTracking) {
        return NextResponse.json({ error: 'Banper tracking not found' }, { status: 404 })
      }

      // Validate status
      if (existingTracking.bgnStatus !== 'APPROVED_BY_BGN') {
        return NextResponse.json(
          { error: 'Can only record disbursement for approved requests' },
          { status: 400 }
        )
      }

      // Verify SPPG exists
      const sppg = await db.sPPG.findFirst({
        where: {
          id: session.user.sppgId!,
          status: 'ACTIVE',
        },
      })

      if (!sppg) {
        return NextResponse.json({ error: 'SPPG not found or inactive' }, { status: 403 })
      }

      // Parse and validate disbursement data
      const body = await request.json()
      const validated = banperRequestTrackingDisbursementSchema.safeParse(body)

      if (!validated.success) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: validated.error.issues,
          },
          { status: 400 }
        )
      }

      // Update tracking and create allocation in transaction
      const result = await db.$transaction(async (tx) => {
        // Update banper tracking
        const tracking = await tx.banperRequestTracking.update({
          where: { id: id },
          data: {
            bgnStatus: 'DISBURSED',
            disbursedAmount: validated.data.disbursedAmount,
            disbursedDate: validated.data.disbursedDate || new Date(),
            bankReferenceNumber: validated.data.bankReferenceNumber,
            bankAccountReceived: validated.data.bankAccountReceived,
          },
        })

        // Create ProgramBudgetAllocation
        const allocation = await tx.programBudgetAllocation.create({
          data: {
            programId: existingTracking.programId!,
            sppgId: session.user.sppgId!,
            banperTrackingId: id,
            source: existingTracking.program?.budgetSource || 'APBN_PUSAT',
            fiscalYear: existingTracking.program?.budgetYear || new Date().getFullYear(),
            allocatedAmount: validated.data.disbursedAmount,
            spentAmount: 0,
            remainingAmount: validated.data.disbursedAmount,
            status: 'ACTIVE',
            allocatedDate: validated.data.disbursedDate || new Date(),
            allocatedBy: session.user.name || session.user.email,
            decreeNumber: existingTracking.bgnApprovalNumber,
            decreeDate: existingTracking.bgnApprovalDate,
            notes: `Auto-created from banper disbursement ${tracking.id}`,
          },
        })

        return { tracking, allocation }
      })

      return NextResponse.json({ 
        success: true, 
        data: result.tracking,
        allocation: result.allocation,
        message: 'Budget disbursed and allocation created successfully'
      })
    } catch (error) {
      console.error('POST /api/sppg/banper-tracking/[id]/disburse error:', error)
      return NextResponse.json(
        {
          error: 'Failed to record disbursement',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}
