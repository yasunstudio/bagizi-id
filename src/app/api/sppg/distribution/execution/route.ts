/**
 * @fileoverview Distribution Execution API Routes - List & Create
 * @version Next.js 15.5.4
 * @description Main API endpoints for execution operations with multi-tenant security
 * @author Bagizi-ID Development Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { hasPermission } from '@/lib/permissions'
import { db } from '@/lib/prisma'
import { startExecutionSchema, executionFilterSchema, paginationSchema } from '@/features/sppg/distribution/execution/schemas'
import { DistributionStatus ,  UserRole } from '@prisma/client'

/**
 * GET /api/sppg/distribution/execution
 * Fetch all executions with filtering and pagination
 */
export async function GET(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // Permission Check
      if (!hasPermission(session.user.userRole as UserRole, 'DISTRIBUTION_MANAGE')) {
        return NextResponse.json(
          { success: false, error: 'Insufficient permissions' },
          { status: 403 }
        )
      }

      // Parse Query Parameters
    const { searchParams } = new URL(request.url)
    
    const filters = {
      status: searchParams.getAll('status').length > 0 
        ? searchParams.getAll('status') as DistributionStatus[]
        : undefined,
      scheduleId: searchParams.get('scheduleId') || undefined,
      dateFrom: searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined,
      dateTo: searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined,
      hasIssues: searchParams.get('hasIssues') ? searchParams.get('hasIssues') === 'true' : undefined,
      search: searchParams.get('search') || undefined,
    }

    const pagination = {
      page: parseInt(searchParams.get('page') || '1'),
      pageSize: parseInt(searchParams.get('pageSize') || '20'),
    }

    // 4. Validate Filters & Pagination
    const validatedFilters = executionFilterSchema.parse(filters)
    const validatedPagination = paginationSchema.parse(pagination)

    // 5. Build Query Conditions (Multi-tenant Safe)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      schedule: {
        sppgId: session.user.sppgId!, // CRITICAL: Multi-tenant filtering
      },
    }

    if (validatedFilters.status) {
      where.status = Array.isArray(validatedFilters.status)
        ? { in: validatedFilters.status }
        : validatedFilters.status
    }

    if (validatedFilters.scheduleId) {
      where.scheduleId = validatedFilters.scheduleId
    }

    if (validatedFilters.dateFrom || validatedFilters.dateTo) {
      where.actualStartTime = {}
      if (validatedFilters.dateFrom) {
        where.actualStartTime.gte = validatedFilters.dateFrom
      }
      if (validatedFilters.dateTo) {
        where.actualStartTime.lte = validatedFilters.dateTo
      }
    }

    if (validatedFilters.hasIssues !== undefined) {
      if (validatedFilters.hasIssues) {
        where.issues = {
          some: {},
        }
      } else {
        where.issues = {
          none: {},
        }
      }
    }

    if (validatedFilters.search) {
      where.OR = [
        { notes: { contains: validatedFilters.search, mode: 'insensitive' } },
        { completionNotes: { contains: validatedFilters.search, mode: 'insensitive' } },
        { schedule: { routeName: { contains: validatedFilters.search, mode: 'insensitive' } } },
      ]
    }

    // 6. Fetch Data with Pagination
    const [executions, total] = await Promise.all([
      db.foodDistribution.findMany({
        where,
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
        orderBy: {
          actualStartTime: 'desc',
        },
        skip: (validatedPagination.page - 1) * validatedPagination.pageSize,
        take: validatedPagination.pageSize,
      }),
      db.foodDistribution.count({ where }),
    ])

    // 7. Calculate Pagination Info
    const hasMore = total > validatedPagination.page * validatedPagination.pageSize

    return NextResponse.json({
      success: true,
      data: {
        executions,
        total,
        page: validatedPagination.page,
        pageSize: validatedPagination.pageSize,
        hasMore,
      },
    })
  } catch (error) {
    console.error('GET /api/sppg/distribution/execution error:', error)
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: error.message 
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch executions',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
  })
}

/**
 * POST /api/sppg/distribution/execution
 * Start new execution from schedule
 */
export async function POST(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // Permission Check
      if (!hasPermission(session.user.userRole as UserRole, 'DISTRIBUTION_MANAGE')) {
        return NextResponse.json(
          { success: false, error: 'Insufficient permissions' },
          { status: 403 }
        )
      }

      // Parse & Validate Request Body
    const body = await request.json()
    const validated = startExecutionSchema.safeParse(body)
    
    if (!validated.success) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: validated.error.issues
      }, { status: 400 })
    }

    // 4. Verify Schedule Exists & Belongs to SPPG
    const schedule = await db.distributionSchedule.findUnique({
      where: { 
        id: validated.data.scheduleId,
        sppgId: session.user.sppgId!, // Multi-tenant safety
      },
      include: {
        production: {
          select: {
            id: true,
            batchNumber: true,
            actualPortions: true,
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
      },
    })

    if (!schedule) {
      return NextResponse.json({ 
        error: 'Schedule not found or access denied' 
      }, { status: 404 })
    }

    // 5. Business Logic Validation
    if (schedule.status !== 'PREPARED') {
      return NextResponse.json({ 
        error: 'Hanya schedule dengan status PREPARED yang dapat dimulai' 
      }, { status: 400 })
    }

    // Check if execution already exists for this schedule
    const existingExecution = await db.foodDistribution.findFirst({
      where: {
        scheduleId: validated.data.scheduleId,
        status: {
          in: ['SCHEDULED', 'PREPARING', 'IN_TRANSIT', 'DISTRIBUTING'],
        },
      },
    })

    if (existingExecution) {
      return NextResponse.json({ 
        error: 'Execution sudah berjalan untuk schedule ini' 
      }, { status: 400 })
    }

    // 5.5 Get default program for this SPPG
    const defaultProgram = await db.nutritionProgram.findFirst({
      where: { sppgId: session.user.sppgId! },
      orderBy: { createdAt: 'desc' },
    })

    if (!defaultProgram) {
      return NextResponse.json({ 
        error: 'No nutrition program found for this SPPG' 
      }, { status: 400 })
    }

    // 6. Create Execution
    const execution = await db.foodDistribution.create({
      data: {
        sppgId: session.user.sppgId!,
        programId: defaultProgram.id,
        scheduleId: validated.data.scheduleId,
        distributionDate: schedule.distributionDate,
        distributionCode: `EXEC-${schedule.id.slice(0, 8)}-${Date.now()}`,
        mealType: 'SNACK_PAGI', // Default snack, can be updated later
        distributionPoint: 'Default Point', // TODO: Get from schedule
        address: 'Default Address', // TODO: Get from schedule
        plannedRecipients: schedule.estimatedBeneficiaries,
        plannedStartTime: schedule.distributionDate,
        plannedEndTime: new Date(schedule.distributionDate.getTime() + 3 * 60 * 60 * 1000), // +3 hours
        distributorId: session.user.id,
        menuItems: {}, // TODO: Get from schedule
        totalPortions: schedule.production.actualPortions || 0,
        portionSize: schedule.production.menu.servingSize,
        status: 'PREPARING',
        actualStartTime: new Date(),
        notes: validated.data.notes,
        totalPortionsDelivered: 0,
        totalBeneficiariesReached: 0,
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

    // 7. Update Schedule Status
    await db.distributionSchedule.update({
      where: { id: validated.data.scheduleId },
      data: { status: 'IN_PROGRESS' },
    })

    return NextResponse.json({ 
      success: true, 
      data: execution 
    }, { status: 201 })
  } catch (error) {
    console.error('POST /api/sppg/distribution/execution error:', error)
    
    return NextResponse.json({ 
      success: false,
      error: 'Failed to start execution',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
  })
}
