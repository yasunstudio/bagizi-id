/**
 * @fileoverview Menu Planning Assignment API - Update & Delete Assignment
 * @description PUT and DELETE endpoints for individual assignments
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { hasPermission } from '@/lib/permissions'
import { UserRole } from '@prisma/client'
import { db } from '@/lib/prisma'
import { z } from 'zod'
import { MealType } from '@prisma/client'
import { recalculateMenuPlanMetrics } from '@/lib/menu-planning/calculations'

/**
 * Assignment Update Schema
 * Allows partial updates of assignment fields
 */
const assignmentUpdateSchema = z.object({
  assignmentDate: z.string().datetime('Invalid date format').optional(),
  mealType: z.nativeEnum(MealType).optional(),
  menuId: z.string().cuid('Invalid menu ID').optional(),
  plannedPortions: z.number().int().positive('Portions must be positive').optional(),
  estimatedCost: z.number().positive('Cost must be positive').optional(),
  notes: z.string().max(500, 'Notes too long').optional().nullable(),
})

type AssignmentUpdateInput = z.infer<typeof assignmentUpdateSchema>

/**
 * GET /api/sppg/menu-planning/[id]/assignments/[assignmentId]
 * Get assignment detail
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; assignmentId: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      if (!hasPermission(session.user.userRole as UserRole, 'READ')) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
      }

      const { id: planId, assignmentId } = await params

      const assignment = await db.menuAssignment.findFirst({
        where: {
          id: assignmentId,
          menuPlanId: planId,
          menuPlan: { sppgId: session.user.sppgId! }
        },
        include: {
          menu: true,
          menuPlan: { select: { id: true, name: true, status: true } }
        }
      })

      if (!assignment) {
        return NextResponse.json({ success: false, error: 'Assignment not found' }, { status: 404 })
      }

      return NextResponse.json({ success: true, data: assignment })
    } catch (error) {
      console.error('Get assignment error:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch assignment' }, { status: 500 })
    }
  })
}

/**
 * PUT /api/sppg/menu-planning/[id]/assignments/[assignmentId]
 * Update existing menu assignment
 * 
 * @security Multi-tenant (sppgId check), only DRAFT plans can be edited
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; assignmentId: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      if (!hasPermission(session.user.userRole as UserRole, 'WRITE')) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
      }

      const { id: planId, assignmentId } = await params

      // Verify Assignment Exists & Ownership
      const existingAssignment = await db.menuAssignment.findFirst({
        where: {
          id: assignmentId,
          menuPlanId: planId,
          menuPlan: {
            program: {
              sppgId: session.user.sppgId!, // Multi-tenant filter
            },
          },
        },
        include: {
          menuPlan: {
            select: {
              id: true,
              status: true,
              startDate: true,
              endDate: true,
            },
          },
        },
      })

      if (!existingAssignment) {
        return NextResponse.json(
          { success: false, error: 'Assignment not found or access denied' },
          { status: 404 }
        )
      }

      // Business Rule: Only allow editing DRAFT plans
      if (existingAssignment.menuPlan.status !== 'DRAFT') {
        return NextResponse.json(
          {
            success: false,
            error: `Cannot edit assignment in ${existingAssignment.menuPlan.status} plan. Only DRAFT plans can be edited.`,
          },
          { status: 400 }
        )
      }

      // Parse and Validate Request Body
      const body = await request.json()
      const validated = assignmentUpdateSchema.safeParse(body)

      if (!validated.success) {
        return NextResponse.json(
          {
            success: false,
          error: 'Validation failed',
          details: validated.error.issues,
        },
        { status: 400 }
      )
    }

    const input: AssignmentUpdateInput = validated.data

    // 6. Validate Date Range (if date is being updated)
    if (input.assignmentDate) {
      const assignmentDate = new Date(input.assignmentDate)
      const planStartDate = new Date(existingAssignment.menuPlan.startDate)
      const planEndDate = new Date(existingAssignment.menuPlan.endDate)

      planStartDate.setHours(0, 0, 0, 0)
      planEndDate.setHours(23, 59, 59, 999)
      assignmentDate.setHours(0, 0, 0, 0)

      if (assignmentDate < planStartDate || assignmentDate > planEndDate) {
        return NextResponse.json(
          {
            success: false,
            error: `Assignment date must be within plan range`,
          },
          { status: 400 }
        )
      }

      // Check for duplicate (if date or meal type changed)
      if (input.assignmentDate || input.mealType) {
        const duplicateCheck = await db.menuAssignment.findFirst({
          where: {
            menuPlanId: planId,
            id: { not: assignmentId },
            assignedDate: input.assignmentDate ? assignmentDate : existingAssignment.assignedDate,
            mealType: input.mealType || existingAssignment.mealType,
          },
        })

        if (duplicateCheck) {
          return NextResponse.json(
            { success: false, error: 'Assignment already exists for this date and meal type' },
            { status: 409 }
          )
        }
      }
    }

    // 7. Validate Menu (if menu is being updated)
    if (input.menuId) {
      const menu = await db.nutritionMenu.findFirst({
        where: {
          id: input.menuId,
          program: {
            sppgId: session.user.sppgId!,
          },
        },
        select: {
          id: true,
          menuName: true,
          mealType: true,
          costPerServing: true,
        },
      })

      if (!menu) {
        return NextResponse.json(
          { success: false, error: 'Menu not found or access denied' },
          { status: 404 }
        )
      }

      // Menu meal type should match assignment meal type
      const assignmentMealType = input.mealType ?? existingAssignment.mealType
      if (menu.mealType !== assignmentMealType) {
        return NextResponse.json(
          {
            success: false,
            error: `Menu "${menu.menuName}" is for ${menu.mealType}, but assignment is for ${assignmentMealType}`,
          },
          { status: 400 }
        )
      }

      // Recalculate cost if menu or portions changed
      if (!input.estimatedCost && (input.menuId || input.plannedPortions)) {
        const portions = input.plannedPortions ?? existingAssignment.plannedPortions
        input.estimatedCost = (menu.costPerServing ?? 0) * portions
      }
    } else if (input.plannedPortions && !input.estimatedCost) {
      // Recalculate cost if only portions changed
      const menu = await db.nutritionMenu.findUnique({
        where: { id: existingAssignment.menuId },
        select: { costPerServing: true },
      })
      if (menu) {
        input.estimatedCost = (menu.costPerServing ?? 0) * input.plannedPortions
      }
    }

    // 8. Update Assignment
    const updatedAssignment = await db.menuAssignment.update({
      where: { id: assignmentId },
      data: {
        ...(input.assignmentDate && { assignmentDate: new Date(input.assignmentDate) }),
        ...(input.mealType && { mealType: input.mealType }),
        ...(input.menuId && { menuId: input.menuId }),
        ...(input.plannedPortions && { plannedPortions: input.plannedPortions }),
        ...(input.estimatedCost !== undefined && { estimatedCost: input.estimatedCost }),
        ...(input.notes !== undefined && { notes: input.notes }),
        updatedAt: new Date(),
      },
      include: {
        menu: {
          select: {
            id: true,
            menuName: true,
            menuCode: true,
            mealType: true,
            servingSize: true,
            costPerServing: true,
          },
        },
      },
    })

      // Recalculate Plan Metrics
      try {
        await recalculateMenuPlanMetrics(planId)
      } catch (recalcError) {
        console.error('⚠️ Metrics recalculation failed (non-critical):', recalcError)
      }

      return NextResponse.json({
        success: true,
        message: 'Assignment updated successfully',
        data: updatedAssignment,
      })

    } catch (error) {
      console.error('Update assignment error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update assignment',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
        { status: 500 }
      )
    }
  })
}

/**
 * DELETE /api/sppg/menu-planning/[id]/assignments/[assignmentId]
 * Delete menu assignment
 * 
 * @security Multi-tenant (sppgId check), only DRAFT plans can be edited
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; assignmentId: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      // Use MENU_MANAGE instead of DELETE - Anyone who can manage menus should be able to delete menu assignments
      if (!hasPermission(session.user.userRole as UserRole, 'MENU_MANAGE')) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
      }

      const { id: planId, assignmentId } = await params

      // Verify Assignment Exists & Ownership
      const existingAssignment = await db.menuAssignment.findFirst({
        where: {
          id: assignmentId,
          menuPlanId: planId,
          menuPlan: {
            sppgId: session.user.sppgId!,
          },
        },
        include: {
          menuPlan: {
            select: {
              status: true,
            },
          },
        },
      })

      if (!existingAssignment) {
        return NextResponse.json(
          { success: false, error: 'Assignment not found or access denied' },
          { status: 404 }
        )
      }

      // Business Rule: Only allow deleting from DRAFT plans
      if (existingAssignment.menuPlan.status !== 'DRAFT') {
        return NextResponse.json(
          {
            success: false,
            error: `Cannot delete assignment from ${existingAssignment.menuPlan.status} plan. Only DRAFT plans can be edited.`,
          },
          { status: 400 }
        )
      }

      // Delete Assignment
      await db.menuAssignment.delete({
        where: { id: assignmentId },
      })

      // Recalculate Plan Metrics
      try {
        await recalculateMenuPlanMetrics(planId)
      } catch (recalcError) {
        console.error('⚠️ Metrics recalculation failed (non-critical):', recalcError)
      }

      return NextResponse.json({
        success: true,
        message: 'Assignment deleted successfully',
      })

    } catch (error) {
      console.error('Delete assignment error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to delete assignment',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
        { status: 500 }
      )
    }
  })
}
