/**
 * @fileoverview Menu Plan Detail API Endpoint
 * @version Next.js 15.5.4 / App Router
 * @author Bagizi-ID Development Team
 * @route /api/sppg/menu/plans/[id]
 * 
 * PURPOSE:
 * - Fetch single menu plan with assignments and menu details
 * - Used for procurement plan auto-population
 * - Multi-tenant safe with sppgId validation
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authentication check
    const session = await auth()
    if (!session?.user?.sppgId) {
      return Response.json(
        { error: 'Unauthorized - SPPG access required' },
        { status: 401 }
      )
    }

    // 2. Fetch menu plan with full details
    const menuPlan = await db.menuPlan.findFirst({
      where: { 
        id: params.id,
        sppgId: session.user.sppgId, // CRITICAL: Multi-tenant isolation
      },
      select: {
        id: true,
        programId: true,
        sppgId: true,
        name: true,
        description: true,
        startDate: true,
        endDate: true,
        status: true,
        isDraft: true,
        isActive: true,
        isArchived: true,
        totalDays: true,
        totalMenus: true,
        totalEstimatedCost: true,
        averageCostPerDay: true,
        nutritionScore: true,
        varietyScore: true,
        costEfficiency: true,
        meetsNutritionStandards: true,
        meetsbudgetConstraints: true,
        approvedAt: true,
        createdAt: true,
        updatedAt: true,
        program: {
          select: {
            id: true,
            name: true,
            programCode: true,
            targetRecipients: true,
          },
        },
        assignments: {
          select: {
            id: true,
            menuId: true,
            assignedDate: true,
            mealType: true,
            plannedPortions: true,
            estimatedCost: true,
            calories: true,
            protein: true,
            carbohydrates: true,
            fat: true,
            menu: {
              select: {
                id: true,
                menuName: true,
                menuCode: true,
                mealType: true,
                servingSize: true,
                costPerServing: true,
                ingredients: {
                  select: {
                    id: true,
                    quantity: true,
                    inventoryItemId: true,
                    inventoryItem: {
                      select: {
                        id: true,
                        itemName: true,
                        category: true,
                        unit: true,
                        costPerUnit: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: {
            assignedDate: 'asc',
          },
        },
      },
    })

    // 3. Check if menu plan exists
    if (!menuPlan) {
      return Response.json(
        { error: 'Menu plan not found or access denied' },
        { status: 404 }
      )
    }

    return Response.json(
      {
        success: true,
        data: menuPlan,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('GET /api/sppg/menu/plans/[id] error:', error)
    return Response.json(
      {
        error: 'Failed to fetch menu plan',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
}
