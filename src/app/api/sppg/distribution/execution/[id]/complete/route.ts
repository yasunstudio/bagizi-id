/**
 * @fileoverview Distribution Execution Complete API Route
 * @version Next.js 15.5.4
 * @description API endpoint to complete execution with validation
 * @author Bagizi-ID Development Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { hasPermission } from '@/lib/permissions'
import { db } from '@/lib/prisma'
import { completeExecutionSchema } from '@/features/sppg/distribution/execution/schemas'
import { UserRole } from '@prisma/client'

/**
 * POST /api/sppg/distribution/execution/[id]/complete
 * Complete execution with final data
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id } = await params

      // Permission Check
      if (!hasPermission(session.user.userRole as UserRole, 'DISTRIBUTION_MANAGE')) {
        return NextResponse.json(
          { success: false, error: 'Insufficient permissions' },
          { status: 403 }
        )
      }

      // Verify Execution Exists & Belongs to SPPG
      const existingExecution = await db.foodDistribution.findFirst({
      where: { 
        id,
        schedule: {
          sppgId: session.user.sppgId!, // Multi-tenant safety
        },
      },
      include: {
        deliveries: true,
        issues: {
          where: {
            resolvedAt: null,
          },
        },
      },
    })

    if (!existingExecution) {
      return NextResponse.json({ 
        error: 'Execution not found or access denied' 
      }, { status: 404 })
    }

    // 4. Parse & Validate Request Body
    const body = await request.json()
    const validated = completeExecutionSchema.safeParse(body)
    
    if (!validated.success) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: validated.error.issues
      }, { status: 400 })
    }

    // 5. Business Logic Validation
    if (existingExecution.status === 'COMPLETED') {
      return NextResponse.json({ 
        error: 'Execution already completed' 
      }, { status: 400 })
    }

    if (existingExecution.status === 'CANCELLED') {
      return NextResponse.json({ 
        error: 'Cannot complete cancelled execution' 
      }, { status: 400 })
    }

    if (existingExecution.status === 'SCHEDULED') {
      return NextResponse.json({ 
        error: 'Execution belum dimulai' 
      }, { status: 400 })
    }

    // Check for unresolved issues
    if (existingExecution.issues.length > 0) {
      return NextResponse.json({ 
        error: `Masih ada ${existingExecution.issues.length} issue yang belum diselesaikan` 
      }, { status: 400 })
    }

    // Validate deliveries exist
    if (existingExecution.deliveries.length === 0) {
      return NextResponse.json({ 
        error: 'Tidak ada delivery yang tercatat untuk execution ini' 
      }, { status: 400 })
    }

    // 6. Complete Execution
    const execution = await db.foodDistribution.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        actualEndTime: validated.data.actualEndTime,
        totalPortionsDelivered: validated.data.totalPortionsDelivered,
        totalBeneficiariesReached: validated.data.totalBeneficiariesReached,
        completionNotes: validated.data.completionNotes,
      },
      include: {
        schedule: {
          include: {
            vehicleAssignments: {
              include: {
                vehicle: true,
              },
            },
          },
        },
        deliveries: {
          include: {
            school: { // ✅ UPDATED (Phase 3)
              select: {
                schoolName: true,
              },
            },
          },
        },
        issues: true,
      },
    })

    // 7. Update Schedule Status (if scheduleId exists)
    if (existingExecution.scheduleId) {
      await db.distributionSchedule.update({
        where: { id: existingExecution.scheduleId },
        data: { status: 'COMPLETED' },
      })
    }

    return NextResponse.json({ 
      success: true, 
      data: execution,
      message: 'Execution completed successfully'
    })
  } catch (error) {
    console.error('POST /api/sppg/distribution/execution/[id]/complete error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to complete execution',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
  })
}
