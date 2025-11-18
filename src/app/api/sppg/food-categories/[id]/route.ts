/**
 * @fileoverview FoodCategory API Routes - GET, PUT, DELETE /api/sppg/food-categories/[id]
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * 
 * Individual Food Category Operations:
 * - GET: View single category with full relations
 * - PUT: Update category (SUPERADMIN only)
 * - DELETE: Soft delete category (SUPERADMIN only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { z } from 'zod'

const foodCategoryUpdateSchema = z.object({
  categoryCode: z.string().min(1).max(20).optional(),
  categoryName: z.string().min(1).max(100).optional(),
  categoryNameEn: z.string().max(100).optional(),
  description: z.string().optional(),
  parentId: z.string().nullable().optional(),
  primaryNutrient: z.string().max(50).optional(),
  servingSizeGram: z.number().positive().optional(),
  dailyServings: z.number().int().positive().optional(),
  colorCode: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  iconName: z.string().max(50).optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
})

/**
 * GET /api/sppg/food-categories/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withSppgAuth(request, async () => {
    try {
      const category = await db.foodCategory.findUnique({
        where: { id: params.id },
        include: {
          parent: {
            select: {
              id: true,
              categoryCode: true,
              categoryName: true,
              categoryNameEn: true,
            },
          },
          children: {
            where: { isActive: true },
            select: {
              id: true,
              categoryCode: true,
              categoryName: true,
              categoryNameEn: true,
              colorCode: true,
              iconName: true,
              sortOrder: true,
            },
            orderBy: { sortOrder: 'asc' },
          },
          _count: {
            select: {
              children: true,
              inventoryItems: true,
              nutritionMenus: true,
            },
          },
        },
      })

      if (!category) {
        return NextResponse.json(
          { success: false, error: 'Food category not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: category,
      })
    } catch (error) {
      console.error('[FoodCategory API] GET/:id error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch food category' },
        { status: 500 }
      )
    }
  })
}

/**
 * PUT /api/sppg/food-categories/[id]
 * @rbac Requires PLATFORM_SUPERADMIN role
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withSppgAuth(request, async (session) => {
    try {
      // Check permission
      if (session.user.userRole !== 'PLATFORM_SUPERADMIN') {
        return NextResponse.json(
          { success: false, error: 'Insufficient permissions' },
          { status: 403 }
        )
      }

      const body = await request.json()
      const validated = foodCategoryUpdateSchema.safeParse(body)

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

      const data = validated.data

      // Validate parent exists
      if (data.parentId) {
        const parentExists = await db.foodCategory.findUnique({
          where: { id: data.parentId },
        })

        if (!parentExists) {
          return NextResponse.json(
            { success: false, error: 'Parent category not found' },
            { status: 404 }
          )
        }

        // Prevent circular reference
        if (data.parentId === params.id) {
          return NextResponse.json(
            { success: false, error: 'Category cannot be its own parent' },
            { status: 400 }
          )
        }
      }

      const category = await db.foodCategory.update({
        where: { id: params.id },
        data,
        include: {
          parent: true,
          _count: {
            select: {
              children: true,
              inventoryItems: true,
              nutritionMenus: true,
            },
          },
        },
      })

      return NextResponse.json({
        success: true,
        data: category,
        message: 'Food category updated successfully',
      })
    } catch (error) {
      console.error('[FoodCategory API] PUT error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update food category' },
        { status: 500 }
      )
    }
  })
}

/**
 * DELETE /api/sppg/food-categories/[id]
 * Soft delete (set isActive = false)
 * @rbac Requires PLATFORM_SUPERADMIN role
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withSppgAuth(request, async (session) => {
    try {
      // Check permission
      if (session.user.userRole !== 'PLATFORM_SUPERADMIN') {
        return NextResponse.json(
          { success: false, error: 'Insufficient permissions' },
          { status: 403 }
        )
      }

      // Check if category has active children
      const childrenCount = await db.foodCategory.count({
        where: {
          parentId: params.id,
          isActive: true,
        },
      })

      if (childrenCount > 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Cannot delete category with active children',
          },
          { status: 400 }
        )
      }

      // Soft delete
      await db.foodCategory.update({
        where: { id: params.id },
        data: { isActive: false },
      })

      return NextResponse.json({
        success: true,
        message: 'Food category deleted successfully',
      })
    } catch (error) {
      console.error('[FoodCategory API] DELETE error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete food category' },
        { status: 500 }
      )
    }
  })
}
