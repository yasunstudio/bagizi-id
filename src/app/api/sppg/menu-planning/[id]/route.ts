/**
 * @fileoverview Menu Planning Detail API - Get, Update, Delete specific plan
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @see {@link /docs/copilot-instructions.md} Multi-tenant security patterns
 * @see {@link /docs/MENU_PLANNING_DOMAIN_IMPLEMENTATION.md} Implementation guide
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { hasPermission } from '@/lib/permissions'
import { UserRole } from '@prisma/client'
import { db } from '@/lib/prisma'
import { MenuPlanStatus, Prisma } from '@prisma/client'

// ================================ GET /api/sppg/menu-planning/[id] ================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      if (!hasPermission(session.user.userRole as UserRole, 'READ')) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
      }

      // 3. Extract planId
      const { id: planId } = await params

      // 4. Fetch plan with full details (multi-tenant security)
      const plan = await db.menuPlan.findFirst({
        where: {
          id: planId,
          sppgId: session.user.sppgId! // MANDATORY multi-tenant filter
        },
      include: {
        program: {
          select: {
            id: true,
            name: true,
            programCode: true,
            targetRecipients: true,
            budgetPerMeal: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            userRole: true
          }
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
            userRole: true
          }
        },
        submittedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
            userRole: true
          }
        },
        rejectedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
            userRole: true
          }
        },
        publishedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
            userRole: true
          }
        },
        assignments: {
          include: {
            menu: {
              select: {
                id: true,
                menuName: true,
                menuCode: true,
                mealType: true,
                servingSize: true,
                costPerServing: true,
                allergens: true,
                isHalal: true,
                isVegetarian: true,
                nutritionCalc: {
                  select: {
                    totalCalories: true,
                    totalProtein: true,
                    totalCarbs: true,
                    totalFat: true,
                    totalFiber: true
                  }
                }
              }
            }
          },
          orderBy: [
            { assignedDate: 'asc' },
            { mealType: 'asc' }
          ]
        },
        _count: {
          select: {
            assignments: true
          }
        }
      }
    })

    if (!plan) {
      return NextResponse.json({
        success: false,
        error: 'Menu plan not found or access denied'
      }, { status: 404 })
    }

    // 5. Calculate additional metrics
    const metrics = {
      totalAssignments: plan.assignments.length,
      totalPlannedPortions: plan.assignments.reduce(
        (sum, a) => sum + a.plannedPortions, 0
      ),
      totalEstimatedCost: plan.assignments.reduce(
        (sum, a) => sum + a.estimatedCost, 0
      ),
      averageCostPerPortion: plan.assignments.length > 0
        ? plan.assignments.reduce((sum, a) => sum + a.estimatedCost, 0) /
          plan.assignments.reduce((sum, a) => sum + a.plannedPortions, 0)
        : 0,
      dateRange: {
        start: plan.startDate,
        end: plan.endDate,
        days: plan.totalDays
      },
      coverage: {
        daysWithAssignments: new Set(
          plan.assignments.map(a => a.assignedDate.toISOString().split('T')[0])
        ).size,
        coveragePercentage: plan.totalDays > 0
          ? (new Set(
              plan.assignments.map(a => a.assignedDate.toISOString().split('T')[0])
            ).size / plan.totalDays) * 100
          : 0
      }
    }

    return NextResponse.json({
        success: true,
        data: {
          ...plan,
          metrics
        }
      })

    } catch (error) {
      console.error('GET /api/sppg/menu-planning/[id] error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch menu plan',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 })
    }
  })
}

// ================================ PUT /api/sppg/menu-planning/[id] ================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      if (!hasPermission(session.user.userRole as UserRole, 'WRITE')) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
      }

      // 3. Extract planId
      const { id: planId } = await params

      // 4. Parse request body
      const body = await request.json()

      // 5. Verify plan exists and belongs to user's SPPG
      const existingPlan = await db.menuPlan.findFirst({
        where: {
          id: planId,
          sppgId: session.user.sppgId!
        }
      })

      if (!existingPlan) {
        return NextResponse.json({
          success: false,
          error: 'Menu plan not found or access denied'
        }, { status: 404 })
      }

      // 6. Check if plan can be edited
      if (existingPlan.status === MenuPlanStatus.PUBLISHED) {
        return NextResponse.json({
          success: false,
          error: 'Cannot edit published plan. Create a new version instead.'
        }, { status: 400 })
      }

      if (existingPlan.status === MenuPlanStatus.ARCHIVED) {
        return NextResponse.json({
          success: false,
          error: 'Cannot edit archived plan'
        }, { status: 400 })
      }

      // 7. Build update data
      const updateData: {
        name?: string
        description?: string | null
        planningRules?: Prisma.InputJsonValue // Fixed: use Prisma JSON type
        startDate?: Date
        endDate?: Date
        totalDays?: number
        updatedAt?: Date
      } = {}

      if (body.name !== undefined) updateData.name = body.name
      if (body.description !== undefined) updateData.description = body.description
      if (body.planningRules !== undefined) updateData.planningRules = body.planningRules as Prisma.InputJsonValue

      // 8. Handle date changes
      if (body.startDate || body.endDate) {
        const startDate = body.startDate ? new Date(body.startDate) : existingPlan.startDate
        const endDate = body.endDate ? new Date(body.endDate) : existingPlan.endDate

        if (endDate <= startDate) {
          return NextResponse.json({
            success: false,
            error: 'End date must be after start date'
          }, { status: 400 })
        }

        updateData.startDate = startDate
        updateData.endDate = endDate
        updateData.totalDays = Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        )
      }

      // 9. Update plan
      const updatedPlan = await db.menuPlan.update({
        where: { id: planId },
        data: {
          ...updateData,
          updatedAt: new Date()
        },
        include: {
          program: {
            select: {
              id: true,
              name: true,
              programCode: true
            }
          },
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          _count: {
            select: {
              assignments: true
            }
          }
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Menu plan updated successfully',
        data: updatedPlan
      })

    } catch (error) {
      console.error('PUT /api/sppg/menu-planning/[id] error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to update menu plan',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 })
    }
  })
}

// ================================ DELETE /api/sppg/menu-planning/[id] ================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      // Use MENU_MANAGE instead of DELETE - Anyone who can manage menus should be able to delete menu plans
      if (!hasPermission(session.user.userRole as UserRole, 'MENU_MANAGE')) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
      }

      // 3. Extract planId
      const { id: planId } = await params

      // 4. Verify plan exists and belongs to user's SPPG
      const existingPlan = await db.menuPlan.findFirst({
        where: {
          id: planId,
          sppgId: session.user.sppgId!
        }
      })

      if (!existingPlan) {
        return NextResponse.json({
          success: false,
          error: 'Menu plan not found or access denied'
        }, { status: 404 })
      }

      // 5. Check if plan can be deleted
      if (existingPlan.status === MenuPlanStatus.PUBLISHED) {
        return NextResponse.json({
          success: false,
          error: 'Cannot delete published plan. Archive it instead.'
        }, { status: 400 })
      }

      // 6. Soft delete: Archive the plan instead of hard delete
      const archivedPlan = await db.menuPlan.update({
        where: { id: planId },
        data: {
          status: MenuPlanStatus.ARCHIVED,
          isArchived: true,
          isActive: false,
          archivedAt: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Menu plan archived successfully',
        data: {
          id: archivedPlan.id,
          status: archivedPlan.status,
          archivedAt: archivedPlan.archivedAt
        }
      })

    } catch (error) {
      console.error('DELETE /api/sppg/menu-planning/[id] error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to delete menu plan',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 })
    }
  })
}
