/**
 * @fileoverview Get Approved Plans for Order Selection - GET endpoint
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * 
 * PURPOSE:
 * Returns list of APPROVED procurement plans with budget info
 * Used in order form dropdown to link orders to plans
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

// ================================ GET /api/sppg/procurement/plans/approved ================================

/**
 * Get approved procurement plans for order selection
 * Returns plans with budget tracking information
 */
export async function GET(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // Fetch approved plans with budget info
      const plans = await db.procurementPlan.findMany({
        where: {
          sppgId: session.user.sppgId!,
          approvalStatus: 'APPROVED',
        },
        select: {
          id: true,
          planName: true,
          planMonth: true,
          planYear: true,
          totalBudget: true,
          allocatedBudget: true,
          usedBudget: true,
          remainingBudget: true,
        },
        orderBy: [
          { planYear: 'desc' },
          { planMonth: 'desc' },
        ],
      })

      // Calculate additional info
      const plansWithInfo = plans.map(plan => ({
        ...plan,
        budgetUsagePercent: plan.totalBudget > 0 
          ? Math.round((plan.usedBudget / plan.totalBudget) * 100)
          : 0,
        hasRemainingBudget: plan.remainingBudget > 0,
      }))

      return NextResponse.json({
        success: true,
        data: plansWithInfo,
      })

    } catch (error) {
      console.error('GET /api/sppg/procurement/plans/approved error:', error)

      return NextResponse.json({
        success: false,
        error: 'Failed to fetch approved plans',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 })
    }
  })
}
