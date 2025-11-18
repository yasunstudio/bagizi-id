/**
 * @fileoverview Dashboard statistics API endpoint - Real-time SPPG statistics
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @author Bagizi-ID Development Team
 * 
 * RBAC Integration:
 * - GET: Protected by withSppgAuth (all SPPG roles)
 * - Automatic audit logging for dashboard access
 * - Multi-tenant: Statistics filtered by session.user.sppgId
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

/**
 * GET /api/sppg/dashboard/stats
 * Fetch real-time dashboard statistics for authenticated SPPG
 * 
 * @rbac Protected by withSppgAuth - requires valid SPPG session
 * @audit Automatic logging via middleware
 */
export async function GET(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      const sppgId = session.user.sppgId

      // Fetch real dashboard statistics
    
    // Active Programs Count
    const activeProgramsCount = await db.nutritionProgram.count({
      where: {
        sppgId: sppgId!,
        status: 'ACTIVE'
      }
    })

    // New Programs This Week
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    const newProgramsThisWeek = await db.nutritionProgram.count({
      where: {
        sppgId: sppgId!,
        createdAt: {
          gte: oneWeekAgo
        }
      }
    })

    // Active Menus Count
    const activeMenusCount = await db.nutritionMenu.count({
      where: {
        program: {
          sppgId: sppgId!
        }
      }
    })

    // New Menus This Week
    const newMenusThisWeek = await db.nutritionMenu.count({
      where: {
        program: {
          sppgId: sppgId!
        },
        createdAt: {
          gte: oneWeekAgo
        }
      }
    })

    // Total Beneficiary Organizations
    const totalOrganizations = await db.beneficiaryOrganization.count({
      where: {
        sppgId: sppgId!
      }
    })

    // New Organizations This Week
    const newOrganizationsThisWeek = await db.beneficiaryOrganization.count({
      where: {
        sppgId: sppgId!,
        createdAt: {
          gte: oneWeekAgo
        }
      }
    })

    // Get all organizations to count by type
    const allOrganizations = await db.beneficiaryOrganization.findMany({
      where: {
        sppgId: sppgId!
      },
      select: {
        type: true,
        maleMembers: true,
        femaleMembers: true
      }
    })

    // Count by Organization Type
    const organizationsByType = allOrganizations.reduce((acc, org) => {
      acc[org.type] = (acc[org.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Calculate total members across all organizations
    const totalMembers = allOrganizations.reduce(
      (sum, org) => sum + (org.maleMembers || 0) + (org.femaleMembers || 0),
      0
    )

    // Total Beneficiaries Recipients (Sum of targetRecipients from programs)
    const programsWithRecipients = await db.nutritionProgram.findMany({
      where: {
        sppgId: sppgId!,
        status: 'ACTIVE'
      },
      select: {
        targetRecipients: true
      }
    })

    const totalBeneficiaries = programsWithRecipients.reduce(
      (sum, program) => sum + (program.targetRecipients || 0),
      0
    )

    // Pending Distributions (Today's distributions not yet completed)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const pendingDistributions = await db.foodDistribution.count({
      where: {
        sppgId: sppgId!,
        distributionDate: {
          gte: today
        },
        status: {
          in: ['SCHEDULED', 'PREPARING', 'IN_TRANSIT', 'DISTRIBUTING']
        }
      }
    })

    // Completed Distributions This Week
    const completedDistributionsThisWeek = await db.foodDistribution.count({
      where: {
        sppgId: sppgId!,
        distributionDate: {
          gte: oneWeekAgo
        },
        status: 'COMPLETED'
      }
    })

    // Budget Utilization
    const totalBudget = await db.nutritionProgram.aggregate({
      where: {
        sppgId: sppgId!,
        status: 'ACTIVE'
      },
      _sum: {
        totalBudget: true
      }
    })

    // Total Procurement Costs This Month
    const firstDayOfMonth = new Date()
    firstDayOfMonth.setDate(1)
    firstDayOfMonth.setHours(0, 0, 0, 0)

    const monthlyProcurementCost = await db.procurement.aggregate({
      where: {
        sppgId: sppgId!,
        procurementDate: {
          gte: firstDayOfMonth
        },
        status: {
          in: ['APPROVED', 'COMPLETED']
        }
      },
      _sum: {
        totalAmount: true
      }
    })

    const budget = totalBudget._sum?.totalBudget || 0
    const spent = monthlyProcurementCost._sum?.totalAmount || 0
    const budgetPercentage = budget > 0 ? Math.round((spent / budget) * 100) : 0

    // 5. Build response
    const stats = {
      activePrograms: {
        current: activeProgramsCount,
        newThisWeek: newProgramsThisWeek,
        percentage: newProgramsThisWeek > 0 
          ? Math.round((newProgramsThisWeek / Math.max(activeProgramsCount, 1)) * 100)
          : 0
      },
      activeMenus: {
        current: activeMenusCount,
        newThisWeek: newMenusThisWeek,
        percentage: newMenusThisWeek > 0
          ? Math.round((newMenusThisWeek / Math.max(activeMenusCount, 1)) * 100)
          : 0
      },
      totalBeneficiaries: {
        current: totalMembers, // Total members from all organizations
        organizations: totalOrganizations,
        newOrganizations: newOrganizationsThisWeek,
        byType: organizationsByType,
        percentage: newOrganizationsThisWeek > 0
          ? Math.round((newOrganizationsThisWeek / Math.max(totalOrganizations, 1)) * 100)
          : 0
      },
      pendingDistributions: {
        current: pendingDistributions,
        completedThisWeek: completedDistributionsThisWeek,
        percentage: completedDistributionsThisWeek > 0
          ? Math.round((completedDistributionsThisWeek / (pendingDistributions + completedDistributionsThisWeek)) * 100)
          : 0
      },
      budgetUtilization: {
        percentage: budgetPercentage,
        spent,
        remaining: budget - spent,
        total: budget
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: stats
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Dashboard stats API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch dashboard statistics',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
  })
}
