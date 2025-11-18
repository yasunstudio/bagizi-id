/**
 * @fileoverview Distribution Execution API Routes - Individual Operations
 * @version Next.js 15.5.4
 * @description API endpoints for single execution operations (GET, PUT, DELETE)
 * @author Bagizi-ID Development Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { hasPermission } from '@/lib/permissions'
import { db } from '@/lib/prisma'
import { updateExecutionSchema } from '@/features/sppg/distribution/execution/schemas'
import { UserRole } from '@prisma/client'

/**
 * GET /api/sppg/distribution/execution/[id]
 * Fetch single execution by ID
 */
export async function GET(
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

      // Fetch Execution (Multi-tenant Safe)
    const execution = await db.foodDistribution.findFirst({
      where: { 
        id,
        schedule: {
          sppgId: session.user.sppgId!, // CRITICAL: Multi-tenant filtering
        },
      },
      include: {
        production: {
          select: {
            // Cost fields not yet implemented in FoodProduction schema
            // estimatedCost: true,
            // actualCost: true,
            // costPerPortion: true,
            plannedPortions: true,
            actualPortions: true,
            id: true,
            batchNumber: true,
          },
        },
        schedule: {
          include: {
            production: {
              select: {
                id: true,
                batchNumber: true,
                menu: {
                  select: {
                    id: true,
                    menuName: true,
                    servingSize: true,
                  }
                }
              }
            },
            vehicleAssignments: {
              include: {
                vehicle: true,
              },
            },
            distribution_deliveries: {
              include: {
                school: true, // ✅ UPDATED (Phase 3)
              },
            },
          },
        },
        vehicle: true, // Include vehicle information
        deliveries: {
          include: {
            school: { // ✅ UPDATED (Phase 3)
              select: {
                schoolName: true,
                schoolAddress: true,
                principalName: true,
                contactPhone: true,
              },
            },
          },
          orderBy: {
            estimatedArrival: 'asc',
          },
        },
        issues: {
          orderBy: {
            reportedAt: 'desc',
          },
        },
      },
    })

    if (!execution) {
      return NextResponse.json({ 
        error: 'Execution not found or access denied' 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      data: execution 
    })
  } catch (error) {
    console.error('GET /api/sppg/distribution/execution/[id] error:', error)
    
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch execution',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
  })
}

/**
 * PUT /api/sppg/distribution/execution/[id]
 * Update execution progress
 */
export async function PUT(
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
    })

    if (!existingExecution) {
      return NextResponse.json({ 
        error: 'Execution not found or access denied' 
      }, { status: 404 })
    }

    // 4. Parse & Validate Request Body
    const body = await request.json()
    const validated = updateExecutionSchema.safeParse(body)
    
    if (!validated.success) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: validated.error.issues
      }, { status: 400 })
    }

    // 5. Business Logic Validation
    if (existingExecution.status === 'COMPLETED') {
      return NextResponse.json({ 
        error: 'Cannot update completed execution' 
      }, { status: 400 })
    }

    if (existingExecution.status === 'CANCELLED') {
      return NextResponse.json({ 
        error: 'Cannot update cancelled execution' 
      }, { status: 400 })
    }

    // 6. Update Execution
    const execution = await db.foodDistribution.update({
      where: { id },
      data: validated.data,
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

    return NextResponse.json({ 
      success: true, 
      data: execution 
    })
  } catch (error) {
    console.error('PUT /api/sppg/distribution/execution/[id] error:', error)
    
    return NextResponse.json({ 
      success: false,
      error: 'Failed to update execution',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
  })
}

/**
 * DELETE /api/sppg/distribution/execution/[id]
 * Delete execution (only if not started)
 */
export async function DELETE(
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
      const execution = await db.foodDistribution.findFirst({
      where: { 
        id,
        schedule: {
          sppgId: session.user.sppgId!, // Multi-tenant safety
        },
      },
    })

    if (!execution) {
      return NextResponse.json({ 
        error: 'Execution not found or access denied' 
      }, { status: 404 })
    }

    // 4. Business Logic Validation
    if (execution.status !== 'SCHEDULED') {
      return NextResponse.json({ 
        error: 'Hanya execution dengan status SCHEDULED yang dapat dihapus' 
      }, { status: 400 })
    }

    // 5. Delete Execution
    await db.foodDistribution.delete({
      where: { id },
    })

    return NextResponse.json({ 
      success: true,
      message: 'Execution deleted successfully'
    })
  } catch (error) {
    console.error('DELETE /api/sppg/distribution/execution/[id] error:', error)
    
    return NextResponse.json({ 
      success: false,
      error: 'Failed to delete execution',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
  })
}
