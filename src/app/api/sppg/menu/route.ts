/**
 * @fileoverview Menu API endpoints - Main CRUD operations
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/domain-menu-workflow.md} Menu Domain Documentation
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { hasPermission } from '@/lib/permissions'
import { 
  menuCreateSchema, 
  menuFiltersSchema,
  type MenuCreateInput
} from '@/features/sppg/menu/schemas'

// ================================ GET /api/sppg/menu ================================

export async function GET(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // Permission Check
      if (!session.user.userRole || !hasPermission(session.user.userRole as UserRole, 'READ')) {
        return NextResponse.json({ 
          success: false, 
          error: 'Insufficient permissions' 
        }, { status: 403 })
      }

      // Parse and validate query parameters
      const url = new URL(request.url)
      const queryParams = Object.fromEntries(url.searchParams)
      
      // Convert string values to appropriate types
      const processedParams = {
        ...queryParams,
        page: queryParams.page ? parseInt(queryParams.page) : undefined,
        limit: queryParams.limit ? parseInt(queryParams.limit) : undefined,
        isActive: queryParams.isActive ? queryParams.isActive === 'true' : undefined,
        hasNutritionCalc: queryParams.hasNutritionCalc ? queryParams.hasNutritionCalc === 'true' : undefined,
        hasCostCalc: queryParams.hasCostCalc ? queryParams.hasCostCalc === 'true' : undefined,
        meetsAKG: queryParams.meetsAKG ? queryParams.meetsAKG === 'true' : undefined,
      }

      const filters = menuFiltersSchema.parse(processedParams)

      // Build database query with multi-tenant filtering
      const where = {
        // Multi-tenant: Only get menus from user's SPPG
        program: {
          sppgId: session.user.sppgId!
        },
      // Apply filters
      ...(filters.search && {
        OR: [
          { menuName: { contains: filters.search, mode: 'insensitive' as const } },
          { menuCode: { contains: filters.search, mode: 'insensitive' as const } },
          { description: { contains: filters.search, mode: 'insensitive' as const } }
        ]
      }),
      ...(filters.mealType && { mealType: filters.mealType }),
      ...(filters.isActive !== undefined && { isActive: filters.isActive }),
      ...(filters.programId && { programId: filters.programId }),
      ...(filters.hasNutritionCalc && {
        nutritionCalc: filters.hasNutritionCalc ? { isNot: null } : { is: null }
      }),
      ...(filters.hasCostCalc && {
        costCalc: filters.hasCostCalc ? { isNot: null } : { is: null }
      }),
      ...(filters.meetsAKG !== undefined && {
        nutritionCalc: {
          meetsAKG: filters.meetsAKG
        }
      })
    } as const

    // 5. Execute queries with pagination
    const [menus, total] = await Promise.all([
      db.nutritionMenu.findMany({
        where,
        include: {
          program: {
            select: {
              id: true,
              name: true,
              sppgId: true
            }
          },
          foodCategory: {
            select: {
              id: true,
              categoryCode: true,
              categoryName: true,
              colorCode: true,
              iconName: true
            }
          },
          ingredients: {
            select: {
              id: true,
              inventoryItemId: true,
              quantity: true,
              preparationNotes: true,
              inventoryItem: {
                select: {
                  id: true,
                  itemName: true,
                  unit: true,
                  costPerUnit: true
                }
              }
            }
          },
          nutritionCalc: {
            select: {
              meetsAKG: true,
              totalCalories: true,
              totalProtein: true,
              totalCarbs: true,      // ← Added for carbohydrates display
              totalFat: true,        // ← Added for fat display
              totalFiber: true,      // ← Added for fiber display
              calculatedAt: true
            }
          },
          costCalc: {
            select: {
              costPerPortion: true,
              grandTotalCost: true,
              calculatedAt: true
            }
          },
          _count: {
            select: {
              ingredients: true,
              recipeSteps: true
            }
          }
        },
        orderBy: {
          [filters.sortBy]: filters.sortOrder
        },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit
      }),
      
      db.nutritionMenu.count({ where })
    ])

    // 6. Calculate pagination metadata
    const totalPages = Math.ceil(total / filters.limit)

    // 7. Return success response (aligned with MenuListResponse interface)
    return NextResponse.json({
      success: true,
      data: {
        menus,
        total,              // ← Direct field for easy access
        page: filters.page,
        limit: filters.limit,
        totalPages,
        pagination: {       // ← Keep nested for backward compatibility
          total,
          page: filters.page,
          limit: filters.limit,
          totalPages,
          hasNext: filters.page < totalPages,
          hasPrev: filters.page > 1
        },
        filters: {
          applied: filters,
          totalResults: total
        }
      }
    })

    } catch (error) {
      console.error('GET /api/sppg/menu error:', error)
      
      // Handle validation errors
      if (error instanceof Error && error.name === 'ZodError') {
        return NextResponse.json({
          success: false,
          error: 'Invalid filter parameters',
          details: error.message
        }, { status: 400 })
      }

      return NextResponse.json({
        success: false,
        error: 'Failed to fetch menus',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 })
    }
  })
}

// ================================ POST /api/sppg/menu ================================

export async function POST(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // Permission Check
      if (!session.user.userRole || !hasPermission(session.user.userRole as UserRole, 'WRITE')) {
        return NextResponse.json({
          success: false,
          error: 'Insufficient permissions for menu management'
        }, { status: 403 })
      }

      // Parse and validate request body
      const body = await request.json()
      const validated = menuCreateSchema.parse(body) as MenuCreateInput

      // Verify program belongs to user's SPPG
      const program = await db.nutritionProgram.findFirst({
        where: {
          id: validated.programId,
          sppgId: session.user.sppgId! // Multi-tenant safety
        }
      })

      if (!program) {
        return NextResponse.json({
          success: false,
          error: 'Program not found or access denied'
      }, { status: 404 })
    }

    // 6. Check for duplicate menu code within the program
    const existingMenu = await db.nutritionMenu.findFirst({
      where: {
        programId: validated.programId,
        menuCode: validated.menuCode
      }
    })

    if (existingMenu) {
      return NextResponse.json({
        success: false,
        error: 'Menu code already exists in this program',
        details: { field: 'menuCode', code: 'DUPLICATE_CODE' }
      }, { status: 409 })
    }

    // 7. Calculate total cost from ingredient costs if not provided
    let costPerServing = validated.costPerServing || 0
    
    // If no cost provided, set default based on meal type
    if (!costPerServing) {
      const defaultCosts = {
        SARAPAN: 5000,
        MAKAN_SIANG: 8000,
        SNACK_PAGI: 3000,
        SNACK_SORE: 3000,
        MAKAN_MALAM: 8000
      }
      costPerServing = defaultCosts[validated.mealType] || 5000
    }

    // 8. Create menu with all required fields
    const menu = await db.nutritionMenu.create({
      data: {
        ...validated,
        costPerServing,
        // Generate menu code if not provided
        menuCode: validated.menuCode || `${validated.mealType.slice(0, 2)}-${Date.now().toString().slice(-6)}`
      },
      include: {
        program: {
          select: {
            id: true,
            name: true,
            sppgId: true
          }
        },
        foodCategory: {
          select: {
            id: true,
            categoryCode: true,
            categoryName: true,
            colorCode: true,
            iconName: true
          }
        },
        _count: {
          select: {
            ingredients: true,
            recipeSteps: true
          }
        }
      }
    })

    // 9. Log activity for audit trail
    console.log(`Menu created: ${menu.id} by user ${session.user.id} in SPPG ${session.user.sppgId}`)

    // 10. Return success response
    return NextResponse.json({
      success: true,
      data: {
        menu,
        message: 'Menu berhasil dibuat'
      }
    }, { status: 201 })

    } catch (error) {
      console.error('POST /api/sppg/menu error:', error)
      
      // Handle validation errors
      if (error instanceof Error && error.name === 'ZodError') {
        return NextResponse.json({
          success: false,
          error: 'Validation failed',
          details: error.message
        }, { status: 400 })
      }

      // Handle Prisma errors
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        return NextResponse.json({
          success: false,
          error: 'Menu with this code already exists',
          details: { field: 'menuCode', code: 'UNIQUE_VIOLATION' }
        }, { status: 409 })
      }

      return NextResponse.json({
        success: false,
        error: 'Failed to create menu',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 })
    }
  })
}
