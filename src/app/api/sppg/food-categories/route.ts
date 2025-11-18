/**
 * @fileoverview FoodCategory API Routes - GET & POST /api/sppg/food-categories
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} API-First Architecture
 * @see {@link /docs/MENU_MODULE_COMPLETE_AUDIT.md} Menu Module Implementation
 * 
 * Hierarchical Food Category System:
 * - Platform-wide master data (managed by SUPERADMIN)
 * - Supports parent-child relationships for category hierarchy
 * - Used by both NutritionMenu and InventoryItem
 * 
 * RBAC Integration:
 * - GET: Protected by withSppgAuth (all SPPG roles can view)
 * - POST: Requires PLATFORM_SUPERADMIN role (platform-wide master data)
 * - Automatic audit logging for all operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { z } from 'zod'

/**
 * Query Parameters Schema for GET /api/sppg/food-categories
 */
const foodCategoryQuerySchema = z.object({
  parentId: z.string().optional(),
  isActive: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
  includeChildren: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
  search: z.string().optional(),
})

/**
 * Request Body Schema for POST /api/sppg/food-categories
 */
const foodCategoryCreateSchema = z.object({
  categoryCode: z.string().min(1).max(20),
  categoryName: z.string().min(1).max(100),
  categoryNameEn: z.string().max(100).optional(),
  description: z.string().optional(),
  parentId: z.string().optional(),
  primaryNutrient: z.string().max(50).optional(),
  servingSizeGram: z.number().positive().optional(),
  dailyServings: z.number().int().positive().optional(),
  colorCode: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  iconName: z.string().max(50).optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
})

/**
 * GET /api/sppg/food-categories
 * Fetch all food categories with optional filtering and hierarchy
 * 
 * Query Parameters:
 * - parentId?: string - Filter by parent category (null for root categories)
 * - isActive?: boolean - Filter by active status (default: true)
 * - includeChildren?: boolean - Include children in response (default: true)
 * - search?: string - Search by category name
 * 
 * Returns:
 * - Flat list or hierarchical tree of food categories
 * - Each category includes parent and children relations
 * 
 * @rbac Protected by withSppgAuth - all SPPG roles can view
 * @audit Automatic logging via middleware
 */
export async function GET(request: NextRequest) {
  return withSppgAuth(request, async () => {
    try {
      // 1. Parse Query Parameters
      const { searchParams } = new URL(request.url)
      const queryParams = {
        parentId: searchParams.get('parentId') || undefined,
        isActive: searchParams.get('isActive') || 'true',
        includeChildren: searchParams.get('includeChildren') || 'true',
        search: searchParams.get('search') || undefined,
      }

      const validated = foodCategoryQuerySchema.safeParse(queryParams)
      if (!validated.success) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid query parameters',
            details: validated.error.issues,
          },
          { status: 400 }
        )
      }

      const query = validated.data

      // 2. Build Query Conditions
      const whereConditions: Prisma.FoodCategoryWhereInput = {}

      // Filter by parent
      if (queryParams.parentId === 'null' || queryParams.parentId === '') {
        whereConditions.parentId = null // Root categories only
      } else if (query.parentId) {
        whereConditions.parentId = query.parentId
      }

      // Filter by active status
      if (query.isActive !== undefined) {
        whereConditions.isActive = query.isActive
      }

      // Search by name
      if (query.search) {
        whereConditions.OR = [
          { categoryName: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
          { categoryNameEn: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
          { categoryCode: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
        ]
      }

      // 3. Fetch Categories
      const categories = await db.foodCategory.findMany({
        where: whereConditions,
        include: {
          parent: query.includeChildren ? {
            select: {
              id: true,
              categoryCode: true,
              categoryName: true,
              categoryNameEn: true,
            },
          } : false,
          children: query.includeChildren ? {
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
          } : false,
          _count: {
            select: {
              children: true,
              inventoryItems: true,
              nutritionMenus: true,
            },
          },
        },
        orderBy: [
          { sortOrder: 'asc' },
          { categoryName: 'asc' },
        ],
      })

      // 4. Build Hierarchical Structure (if root categories requested)
      const isRootQuery = queryParams.parentId === 'null' || queryParams.parentId === '' || !queryParams.parentId
      const includeChildren = query.includeChildren

      return NextResponse.json({
        success: true,
        data: {
          categories,
          total: categories.length,
          isHierarchical: isRootQuery && includeChildren,
        },
      })
    } catch (error) {
      console.error('[FoodCategory API] GET error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch food categories',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}

/**
 * POST /api/sppg/food-categories
 * Create a new food category
 * 
 * Request Body:
 * - categoryCode: string (unique)
 * - categoryName: string
 * - categoryNameEn?: string (optional)
 * - description?: string
 * - parentId?: string (for hierarchical structure)
 * - primaryNutrient?: string (e.g., "Protein", "Karbohidrat")
 * - servingSizeGram?: number
 * - dailyServings?: number
 * - colorCode?: string (hex color)
 * - iconName?: string
 * - sortOrder?: number (default: 0)
 * 
 * @rbac Requires PLATFORM_SUPERADMIN role
 * @audit Automatic logging via middleware
 */
export async function POST(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // 1. Check SUPERADMIN Permission
      if (session.user.userRole !== 'PLATFORM_SUPERADMIN') {
        return NextResponse.json(
          {
            success: false,
            error: 'Insufficient permissions. Only SUPERADMIN can create food categories.',
          },
          { status: 403 }
        )
      }

      // 2. Parse and Validate Request Body
      const body = await request.json()
      const validated = foodCategoryCreateSchema.safeParse(body)

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

      // 3. Validate Parent Exists (if provided)
      if (data.parentId) {
        const parentExists = await db.foodCategory.findUnique({
          where: { id: data.parentId },
          select: { id: true, isActive: true },
        })

        if (!parentExists) {
          return NextResponse.json(
            {
              success: false,
              error: 'Parent category not found',
            },
            { status: 404 }
          )
        }

        if (!parentExists.isActive) {
          return NextResponse.json(
            {
              success: false,
              error: 'Parent category is not active',
            },
            { status: 400 }
          )
        }
      }

      // 4. Check Duplicate categoryCode
      const existingCode = await db.foodCategory.findUnique({
        where: { categoryCode: data.categoryCode },
      })

      if (existingCode) {
        return NextResponse.json(
          {
            success: false,
            error: 'Category code already exists',
          },
          { status: 409 }
        )
      }

      // 5. Create Food Category
      const category = await db.foodCategory.create({
        data,
        include: {
          parent: {
            select: {
              id: true,
              categoryCode: true,
              categoryName: true,
            },
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

      return NextResponse.json(
        {
          success: true,
          data: category,
          message: 'Food category created successfully',
        },
        { status: 201 }
      )
    } catch (error) {
      console.error('[FoodCategory API] POST error:', error)

      // Handle Prisma unique constraint violations
      interface PrismaError extends Error {
        code?: string
      }
      
      if ((error as PrismaError).code === 'P2002') {
        return NextResponse.json(
          {
            success: false,
            error: 'Category code already exists',
          },
          { status: 409 }
        )
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create food category',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}
