/**
 * @fileoverview Auto-populate monitoring form data API endpoint
 * Aggregates data from multiple sources to auto-fill monitoring forms
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'

/**
 * GET /api/sppg/monitoring/auto-populate
 * 
 * Auto-populate monitoring form with aggregated data from:
 * - Program data (target beneficiaries, budget)
 * - Enrollment data (enrolled, active students)
 * - Production data (meals produced in last 7 days)
 * - Distribution data (meals distributed in last 7 days)
 * - Procurement data (budget utilized in last 7 days)
 * 
 * @param programId - Program ID to aggregate data for
 * @returns Pre-calculated monitoring metrics
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authentication Check
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Get programId from query params
    const { searchParams } = new URL(request.url)
    const programId = searchParams.get('programId')

    if (!programId) {
      return NextResponse.json(
        { success: false, error: 'programId is required' },
        { status: 400 }
      )
    }

    // 3. Verify program access (SPPG multi-tenancy)
    const program = await db.nutritionProgram.findFirst({
      where: {
        id: programId,
        sppgId: session.user.sppgId || undefined,
      },
      select: {
        id: true,
        name: true,
        targetRecipients: true,
        totalBudget: true,
        sppgId: true,
      },
    })

    if (!program) {
      return NextResponse.json(
        { success: false, error: 'Program not found or access denied' },
        { status: 404 }
      )
    }

    // 4. Calculate date range (last 7 days)
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 7)

    // 5. Get current week number
    const currentWeek = getWeekNumber(endDate)

    // 6. Aggregate enrollment data
    const enrollmentStats = await db.programSchoolEnrollment.aggregate({
      where: {
        programId,
        status: { in: ['ACTIVE', 'PENDING'] },
      },
      _count: {
        id: true,
      },
      _sum: {
        targetStudents: true,
        activeStudents: true,
      },
    })

    // 7. Aggregate production data (last 7 days)
    const productionStats = await db.foodProduction.aggregate({
      where: {
        programId,
        productionDate: {
          gte: startDate,
          lte: endDate,
        },
        status: 'COMPLETED',
      },
      _sum: {
        actualPortions: true,
        plannedPortions: true,
      },
      _count: true,
    })

    // 8. Aggregate distribution data (last 7 days)
    const distributionStats = await db.foodDistribution.aggregate({
      where: {
        programId,
        distributionDate: {
          gte: startDate,
          lte: endDate,
        },
        status: 'COMPLETED',
      },
      _sum: {
        totalPortions: true,
        actualRecipients: true,
      },
      _count: true,
    })

    // 9. Aggregate procurement costs (last 7 days)
    const procurementStats = await db.procurement.aggregate({
      where: {
        sppgId: program.sppgId,
        procurementDate: {
          gte: startDate,
          lte: endDate,
        },
        status: 'COMPLETED',
      },
      _sum: {
        totalAmount: true,
        paidAmount: true,
      },
    })

    // 10. Calculate metrics
    const targetRecipients = program.targetRecipients || 0
    const enrolledRecipients = enrollmentStats._sum.targetStudents || 0
    const activeRecipients = enrollmentStats._sum.activeStudents || 0
    const totalMealsProduced = productionStats._sum?.actualPortions || 0
    const totalMealsDistributed = distributionStats._sum?.totalPortions || 0
    const budgetAllocated = program.totalBudget || 0
    const budgetUtilized = procurementStats._sum?.paidAmount || 0

    // 11. Calculate additional metrics
    const attendanceRate = enrolledRecipients > 0 
      ? ((activeRecipients / enrolledRecipients) * 100)
      : 0

    const wastePercentage = totalMealsProduced > 0
      ? (((totalMealsProduced - totalMealsDistributed) / totalMealsProduced) * 100)
      : 0

    // 12. Return pre-calculated data
    return NextResponse.json({
      success: true,
      data: {
        // Time period
        monitoringDate: endDate,
        reportingWeek: currentWeek,
        dateRange: {
          start: startDate,
          end: endDate,
        },

        // Program info
        programId: program.id,
        programName: program.name,

        // Beneficiary metrics
        targetRecipients,
        enrolledRecipients,
        activeRecipients,
        attendanceRate: parseFloat(attendanceRate.toFixed(2)),

        // Production & Distribution metrics
        totalMealsProduced,
        totalMealsDistributed,
        wastePercentage: parseFloat(wastePercentage.toFixed(2)),
        
        // Count metrics
        productionCount: productionStats._count || 0,
        distributionCount: distributionStats._count || 0,

        // Budget metrics
        budgetAllocated,
        budgetUtilized,
        budgetUtilization: budgetAllocated > 0
          ? parseFloat(((budgetUtilized / budgetAllocated) * 100).toFixed(2))
          : 0,

        // Meta
        autoPopulatedAt: new Date(),
      },
    })
  } catch (error) {
    console.error('❌ Auto-populate monitoring error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to auto-populate monitoring data',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    )
  }
}

/**
 * Get ISO week number for a date
 * @param date - Date to get week number for
 * @returns Week number (1-53)
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}
