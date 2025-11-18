/**
 * @fileoverview Menu Plans API Endpoints
 * @version Next.js 15.5.4 / App Router
 * @author Bagizi-ID Development Team
 * @route /api/sppg/menu/plans
 * 
 * PURPOSE:
 * - Fetch approved menu plans for procurement plan generation
 * - Support filtering by status and archived state
 * - Multi-tenant safe with sppgId filtering
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { MenuPlanStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    // 1. Authentication check
    const session = await auth()
    if (!session?.user?.sppgId) {
      return Response.json(
        { error: 'Unauthorized - SPPG access required' },
        { status: 401 }
      )
    }

    // 2. Parse query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as MenuPlanStatus | null
    const isArchived = searchParams.get('isArchived') === 'true'

    // 3. Build where clause with multi-tenant filtering
    const where = {
      sppgId: session.user.sppgId, // CRITICAL: Multi-tenant isolation
      isArchived: isArchived,
      ...(status && { status }), // Conditional status filter
    }

    // 4. Fetch menu plans from database
    const menuPlans = await db.menuPlan.findMany({
      where,
      select: {
        id: true,
        programId: true,
        name: true,
        description: true,
        startDate: true,
        endDate: true,
        status: true,
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
            menu: {
              select: {
                id: true,
                menuName: true,
                menuCode: true,
                mealType: true,
                costPerServing: true,
              },
            },
          },
          orderBy: {
            assignedDate: 'asc',
          },
        },
      },
      orderBy: [
        { status: 'asc' },
        { startDate: 'desc' },
      ],
    })

    return Response.json(
      {
        success: true,
        data: menuPlans,
        meta: {
          total: menuPlans.length,
          sppgId: session.user.sppgId,
          filters: {
            status: status || 'all',
            isArchived,
          },
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('GET /api/sppg/menu/plans error:', error)
    return Response.json(
      {
        error: 'Failed to fetch menu plans',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
}
