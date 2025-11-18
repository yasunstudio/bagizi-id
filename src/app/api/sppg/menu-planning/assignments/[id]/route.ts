/**
 * @fileoverview Menu Planning Assignment Detail API - Update and delete operations
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @see {@link /docs/copilot-instructions.md} Multi-tenant security patterns
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { hasPermission } from '@/lib/permissions'
import { UserRole } from '@prisma/client'
import { db } from '@/lib/prisma'
import { MealType } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      if (!hasPermission(session.user.userRole as UserRole, 'READ')) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
      }

      const { id: assignmentId } = await params

      const assignment = await db.menuAssignment.findFirst({
        where: {
          id: assignmentId,
          menuPlan: {
            sppgId: session.user.sppgId!
          }
        },
        include: {
          menu: {
            select: {
              id: true,
              menuName: true,
              menuCode: true,
              mealType: true,
              costPerServing: true,
              servingSize: true
            }
          },
          menuPlan: {
            select: {
              id: true,
              name: true,
              status: true,
              startDate: true,
              endDate: true,
              program: {
                select: {
                  id: true,
                  name: true,
                  targetRecipients: true
                }
              }
            }
          }
        }
      })

      if (!assignment) {
        return NextResponse.json({
          success: false,
          error: 'Assignment not found or access denied'
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        data: assignment
      })

    } catch (error) {
      console.error('GET /api/sppg/menu-planning/assignments/[id] error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch assignment',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 })
    }
  })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      if (!hasPermission(session.user.userRole as UserRole, 'WRITE')) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
      }

      const { id: assignmentId } = await params

      // Parse request body
      const body = await request.json()
      const { 
        menuId, 
        date, 
        mealType, 
        plannedPortions,
        notes 
      } = body

      // Verify assignment exists and belongs to user's SPPG
      const assignment = await db.menuAssignment.findFirst({
        where: {
          id: assignmentId,
          menuPlan: {
            sppgId: session.user.sppgId!
          }
        },
        include: {
          menuPlan: true
        }
      })

      if (!assignment) {
        return NextResponse.json({
          success: false,
          error: 'Assignment not found or access denied'
        }, { status: 404 })
      }

      // Validate plan is not published or archived
    if (['PUBLISHED', 'ARCHIVED'].includes(assignment.menuPlan.status)) {
      return NextResponse.json({
        success: false,
        error: `Cannot update assignment for ${assignment.menuPlan.status.toLowerCase()} plan`
        }, { status: 400 })
      }

      // Build update data
      const updateData: {
        menuId?: string
        assignedDate?: Date
        mealType?: MealType
        plannedPortions?: number
        notes?: string | null
        updatedAt: Date
      } = {
        updatedAt: new Date()
      }

      if (menuId) {
        // Verify menu exists and belongs to same SPPG
        const menu = await db.nutritionMenu.findFirst({
          where: {
            id: menuId,
            program: {
              sppgId: session.user.sppgId!
            }
          }
        })

        if (!menu) {
          return NextResponse.json({
            success: false,
            error: 'Menu not found or access denied'
          }, { status: 404 })
        }

        updateData.menuId = menuId
      }

      if (date) {
        const newDate = new Date(date)
        
        // Validate date is within plan range
        if (newDate < assignment.menuPlan.startDate || newDate > assignment.menuPlan.endDate) {
          return NextResponse.json({
            success: false,
            error: `Date must be between ${assignment.menuPlan.startDate.toISOString().split('T')[0]} and ${assignment.menuPlan.endDate.toISOString().split('T')[0]}`
          }, { status: 400 })
        }

        updateData.assignedDate = newDate
      }

      if (mealType) {
        // Validate meal type
        if (!Object.values(MealType).includes(mealType)) {
          return NextResponse.json({
            success: false,
            error: `Invalid mealType. Must be one of: ${Object.values(MealType).join(', ')}`
          }, { status: 400 })
        }

        updateData.mealType = mealType
      }

      // Check for duplicate assignment if date or mealType changed
      if (updateData.assignedDate || updateData.mealType) {
        const checkDate = updateData.assignedDate || assignment.assignedDate
        const checkMealType = updateData.mealType || assignment.mealType

        const duplicate = await db.menuAssignment.findFirst({
          where: {
            menuPlanId: assignment.menuPlanId,
            assignedDate: checkDate,
            mealType: checkMealType,
            id: {
              not: assignmentId
            }
          }
        })

        if (duplicate) {
          return NextResponse.json({
            success: false,
            error: `Assignment already exists for ${checkMealType} on ${checkDate.toISOString().split('T')[0]}`
          }, { status: 409 })
        }
      }

      if (plannedPortions !== undefined) {
        updateData.plannedPortions = plannedPortions
      }

      if (notes !== undefined) {
        updateData.notes = notes
      }

      // Update assignment
      const updatedAssignment = await db.menuAssignment.update({
        where: { id: assignmentId },
        data: updateData,
        include: {
          menu: {
            select: {
              id: true,
              menuName: true,
              menuCode: true,
              mealType: true,
              costPerServing: true
            }
          },
          menuPlan: {
            select: {
              id: true,
              name: true,
              status: true
            }
          }
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Assignment updated successfully',
        data: updatedAssignment
      })

    } catch (error) {
      console.error('PUT /api/sppg/menu-planning/assignments/[id] error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to update assignment',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 })
    }
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      // Use MENU_MANAGE instead of DELETE - Anyone who can manage menus should be able to delete menu assignments
      if (!hasPermission(session.user.userRole as UserRole, 'MENU_MANAGE')) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
      }

      const { id: assignmentId } = await params

      // Verify assignment exists and belongs to user's SPPG
      const assignment = await db.menuAssignment.findFirst({
        where: {
          id: assignmentId,
          menuPlan: {
            sppgId: session.user.sppgId!
          }
        },
        include: {
          menuPlan: true
        }
      })

      if (!assignment) {
        return NextResponse.json({
          success: false,
          error: 'Assignment not found or access denied'
        }, { status: 404 })
      }

      // Validate plan is not published or archived
      if (['PUBLISHED', 'ARCHIVED'].includes(assignment.menuPlan.status)) {
        return NextResponse.json({
          success: false,
          error: `Cannot delete assignment from ${assignment.menuPlan.status.toLowerCase()} plan`
        }, { status: 400 })
      }

      // Delete assignment
      await db.menuAssignment.delete({
        where: { id: assignmentId }
      })

      return NextResponse.json({
        success: true,
        message: 'Assignment deleted successfully'
      })

    } catch (error) {
      console.error('DELETE /api/sppg/menu-planning/assignments/[id] error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to delete assignment',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 })
    }
  })
}
