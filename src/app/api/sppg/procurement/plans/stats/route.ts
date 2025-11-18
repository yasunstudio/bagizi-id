/**
 * @fileoverview Procurement Plans Statistics - GET endpoint
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Enterprise Development Guidelines
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth, hasPermission } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

// ================================ GET /api/sppg/procurement/plans/stats ================================

/**
 * Get procurement plans statistics and overview
 * Returns counts by status, budget utilization, and trends
 */
export async function GET(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // Permission Check - User must have read permission
      if (!hasPermission(session.user.userRole, 'user:read')) {
        return NextResponse.json({
          success: false,
          error: 'Insufficient permissions'
        }, { status: 403 })
      }

      // Fetch all plans for this SPPG
      const plans = await db.procurementPlan.findMany({
        where: {
          sppgId: session.user.sppgId! // Multi-tenant isolation
        },
        include: {
          procurements: {
            select: {
              id: true,
              status: true,
              totalAmount: true
            }
          }
        }
      })

      // Calculate statistics
      const totalPlans = plans.length
      
      // Status breakdown (lowercase keys to match PlanStatsResponse)
      const statusBreakdown = {
        draft: plans.filter(p => p.approvalStatus === 'DRAFT').length,
        submitted: plans.filter(p => p.approvalStatus === 'SUBMITTED').length,
        underReview: plans.filter(p => p.approvalStatus === 'UNDER_REVIEW').length,
        approved: plans.filter(p => p.approvalStatus === 'APPROVED').length,
        rejected: plans.filter(p => p.approvalStatus === 'REJECTED').length,
        cancelled: plans.filter(p => p.approvalStatus === 'CANCELLED').length,
        details: [
          { approvalStatus: 'DRAFT', count: plans.filter(p => p.approvalStatus === 'DRAFT').length, totalBudget: plans.filter(p => p.approvalStatus === 'DRAFT').reduce((sum, p) => sum + Number(p.totalBudget), 0) },
          { approvalStatus: 'SUBMITTED', count: plans.filter(p => p.approvalStatus === 'SUBMITTED').length, totalBudget: plans.filter(p => p.approvalStatus === 'SUBMITTED').reduce((sum, p) => sum + Number(p.totalBudget), 0) },
          { approvalStatus: 'UNDER_REVIEW', count: plans.filter(p => p.approvalStatus === 'UNDER_REVIEW').length, totalBudget: plans.filter(p => p.approvalStatus === 'UNDER_REVIEW').reduce((sum, p) => sum + Number(p.totalBudget), 0) },
          { approvalStatus: 'APPROVED', count: plans.filter(p => p.approvalStatus === 'APPROVED').length, totalBudget: plans.filter(p => p.approvalStatus === 'APPROVED').reduce((sum, p) => sum + Number(p.totalBudget), 0) },
          { approvalStatus: 'REJECTED', count: plans.filter(p => p.approvalStatus === 'REJECTED').length, totalBudget: plans.filter(p => p.approvalStatus === 'REJECTED').reduce((sum, p) => sum + Number(p.totalBudget), 0) },
          { approvalStatus: 'CANCELLED', count: plans.filter(p => p.approvalStatus === 'CANCELLED').length, totalBudget: plans.filter(p => p.approvalStatus === 'CANCELLED').reduce((sum, p) => sum + Number(p.totalBudget), 0) }
        ]
      }

      // Budget statistics
      const totalBudget = plans.reduce((sum, p) => sum + Number(p.totalBudget), 0)
      const usedBudget = plans.reduce((sum, p) => sum + Number(p.usedBudget), 0)
      const remainingBudget = plans.reduce((sum, p) => sum + Number(p.remainingBudget), 0)
      const allocatedBudget = usedBudget // Allocated = Used for now
      const averageBudget = totalPlans > 0 ? totalBudget / totalPlans : 0

      // Calculate totals from plans
      const totalRecipients = plans.reduce((sum, p) => sum + Number(p.targetRecipients || 0), 0)
      const totalMeals = plans.reduce((sum, p) => sum + Number(p.targetMeals || 0), 0)

      // Category budget breakdown (sum of all plans)
      const budgetAllocation = {
        protein: plans.reduce((sum, p) => sum + (Number(p.proteinBudget) || 0), 0),
        carb: plans.reduce((sum, p) => sum + (Number(p.carbBudget) || 0), 0),
        vegetable: plans.reduce((sum, p) => sum + (Number(p.vegetableBudget) || 0), 0),
        fruit: plans.reduce((sum, p) => sum + (Number(p.fruitBudget) || 0), 0),
        other: plans.reduce((sum, p) => sum + (Number(p.otherBudget) || 0), 0),
        total: totalBudget
      }

      // Monthly trends (last 6 months)
      const currentDate = new Date()
      const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
        const date = new Date(currentDate)
        date.setMonth(date.getMonth() - i)
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const year = date.getFullYear()

        const monthPlans = plans.filter(
          p => p.planMonth === month && p.planYear === year
        )

        return {
          month,
          year,
          count: monthPlans.length,
          totalBudget: monthPlans.reduce((sum, p) => sum + Number(p.totalBudget), 0)
        }
      }).reverse()

      // Recent plans (last 5)
      const recentPlans = plans
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5)
        .map(p => ({
          id: p.id,
          planName: p.planName,
          planMonth: p.planMonth,
          planYear: p.planYear,
          approvalStatus: p.approvalStatus,
          totalBudget: Number(p.totalBudget),
          usedBudget: Number(p.usedBudget)
        }))

      // Success response (matches PlanStatsResponse interface)
      return NextResponse.json({
        success: true,
        data: {
          overview: {
            totalPlans,
            totalBudget,
            allocatedBudget,
            usedBudget,
            remainingBudget,
            averageBudget,
            totalRecipients,
            totalMeals
          },
          statusBreakdown,
          budgetAllocation,
          monthlyTrend,
          recentPlans
        }
      })

    } catch (error) {
      console.error('GET /api/sppg/procurement/plans/stats error:', error)

      return NextResponse.json({
        success: false,
        error: 'Failed to fetch procurement plans statistics',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 })
    }
  })
}
