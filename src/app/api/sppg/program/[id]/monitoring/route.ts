/**
 * @fileoverview API endpoint untuk Program Monitoring - POST (create), GET (list)
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.18.0
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * RBAC Integration:
 * - POST: Protected by withSppgAuth (SPPG_ADMIN, SPPG_KEPALA, SPPG_AHLI_GIZI)
 * - GET: Protected by withSppgAuth (all SPPG roles)
 * - Automatic audit logging for all operations
 * - Multi-tenant: Program ownership verified via sppgId
 * 
 * CRITICAL: Multi-tenant security - verify program belongs to user's SPPG
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { createMonitoringSchema, monitoringFilterSchema } from '@/features/sppg/program/schemas'
import { UserRole, Prisma } from '@prisma/client'
import type { MonitoringStats } from '@/features/sppg/program/types'

/**
 * Helper function to calculate monitoring stats
 * Accepts monitoring data with minimal required fields
 */
function calculateMonitoringStats(
  monitoring: {
    budgetAllocated: number
    budgetUtilized: number
    totalMealsProduced: number
    totalMealsDistributed: number
    activeRecipients: number
    targetRecipients: number
    feedingDaysPlanned: number
    avgQualityScore: number | null
    customerSatisfaction: number | null
    hygieneScore: number | null
    temperatureCompliance: number | null
  }
): MonitoringStats {
  // Budget calculations
  const budgetUtilization = monitoring.budgetAllocated > 0
    ? (monitoring.budgetUtilized / monitoring.budgetAllocated) * 100
    : 0

  const savings = monitoring.budgetAllocated - monitoring.budgetUtilized

  // Cost calculations
  const costPerMeal = monitoring.totalMealsDistributed > 0
    ? monitoring.budgetUtilized / monitoring.totalMealsDistributed
    : 0

  const costPerRecipient = monitoring.activeRecipients > 0
    ? monitoring.budgetUtilized / monitoring.activeRecipients
    : 0

  // Production efficiency
  const productionEfficiency = monitoring.totalMealsProduced > 0 && monitoring.feedingDaysPlanned > 0
    ? (monitoring.totalMealsProduced / (monitoring.targetRecipients * monitoring.feedingDaysPlanned)) * 100
    : 0

  // Serving rate (distribution effectiveness)
  const servingRate = monitoring.totalMealsProduced > 0
    ? (monitoring.totalMealsDistributed / monitoring.totalMealsProduced) * 100
    : 0

  // Staff efficiency (optional - can be null)
  const hoursPerMeal = null // Field not in new schema

  // Calculate average quality score from existing metrics
  const qualityScores = [
    monitoring.avgQualityScore,
    monitoring.customerSatisfaction,
    monitoring.hygieneScore,
    monitoring.temperatureCompliance,
  ].filter((score): score is number => score !== null && score !== undefined)

  const averageQualityScore = qualityScores.length > 0
    ? qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length
    : monitoring.avgQualityScore || null

  // No separate logistics score in new schema
  const averageLogisticsScore = null

  // Health and safety score
  const healthScores = [
    monitoring.hygieneScore,
    monitoring.temperatureCompliance,
  ].filter((score): score is number => score !== null && score !== undefined)

  const averageHealthScore = healthScores.length > 0
    ? healthScores.reduce((sum, score) => sum + score, 0) / healthScores.length
    : null

  return {
    budgetUtilization,
    savings,
    costPerMeal,
    costPerRecipient,
    productionEfficiency,
    servingRate,
    hoursPerMeal,
    averageQualityScore,
    averageLogisticsScore,
    averageHealthScore,
  }
}

/**
 * POST /api/sppg/program/[id]/monitoring
 * Create new monitoring report for program
 * 
 * @rbac Protected by withSppgAuth - requires SPPG_ADMIN, SPPG_KEPALA, or SPPG_AHLI_GIZI role
 * @audit Automatic logging via middleware
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id: programId } = await params

      // Role check - only certain roles can create monitoring reports
      const allowedRoles: UserRole[] = [
        UserRole.SPPG_ADMIN,
        UserRole.SPPG_KEPALA,
        UserRole.SPPG_AHLI_GIZI,
        UserRole.SPPG_PRODUKSI_MANAGER,
      ]

      if (!session.user.userRole || !allowedRoles.includes(session.user.userRole as UserRole)) {
        return NextResponse.json(
          { error: 'Insufficient permissions to create monitoring report' },
          { status: 403 }
        )
      }

      // Verify program belongs to user's SPPG
      const program = await db.nutritionProgram.findFirst({
        where: {
          id: programId,
          sppgId: session.user.sppgId!,
        },
      })

      if (!program) {
        return NextResponse.json({ error: 'Program not found' }, { status: 404 })
      }

      // Parse and validate request body
      const body = await request.json()
      const validated = createMonitoringSchema.safeParse({
        ...body,
        programId,
        reportedById: session.user.id, // Auto-set to current user
      })

      if (!validated.success) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: validated.error.issues,
          },
          { status: 400 }
        )
      }

      const data = validated.data

      // Check for duplicate monitoring report (unique constraint)
      const existing = await db.programMonitoring.findUnique({
        where: {
          programId_monitoringDate: {
            programId,
            monitoringDate: new Date(data.monitoringDate),
          },
        },
      })

      if (existing) {
        return NextResponse.json(
          { error: 'Monitoring report already exists for this date' },
          { status: 409 }
        )
      }

      // Create monitoring report
      const monitoring = await db.programMonitoring.create({
        data: {
          programId,
          monitoringDate: new Date(data.monitoringDate),
          reportedById: data.reportedById,
          reportingWeek: data.reportingWeek,
          
          // Beneficiary metrics
          targetRecipients: data.targetRecipients,
          enrolledRecipients: data.enrolledRecipients,
          activeRecipients: data.activeRecipients,
          dropoutCount: data.dropoutCount,
          newEnrollments: data.newEnrollments,
          attendanceRate: data.attendanceRate,
          assessmentsCompleted: data.assessmentsCompleted || 0,
          improvedNutrition: data.improvedNutrition || 0,
          stableNutrition: data.stableNutrition || 0,
          worsenedNutrition: data.worsenedNutrition || 0,
          criticalCases: data.criticalCases || 0,
          feedingDaysPlanned: data.feedingDaysPlanned,
          feedingDaysCompleted: data.feedingDaysCompleted,
          menuVariety: data.menuVariety,
          stockoutDays: data.stockoutDays,
          qualityIssues: data.qualityIssues,
          totalMealsProduced: data.totalMealsProduced,
          totalMealsDistributed: data.totalMealsDistributed,
          wastePercentage: data.wastePercentage,
          
          // Budget
          budgetAllocated: data.budgetAllocated,
          budgetUtilized: data.budgetUtilized,
          
          // Quality & satisfaction
          avgQualityScore: data.avgQualityScore,
          customerSatisfaction: data.customerSatisfaction,
          complaintCount: data.complaintCount || 0,
          complimentCount: data.complimentCount || 0,
          foodSafetyIncidents: data.foodSafetyIncidents || 0,
          hygieneScore: data.hygieneScore,
          temperatureCompliance: data.temperatureCompliance,
          
          // Human resources
          staffAttendance: data.staffAttendance,
          trainingCompleted: data.trainingCompleted || 0,
          
          // Qualitative data (JSON)
          challenges: data.challenges ?? Prisma.JsonNull,
          achievements: data.achievements ?? Prisma.JsonNull,
          recommendations: data.recommendations ?? Prisma.JsonNull,
          feedback: data.feedback ?? Prisma.JsonNull,
        },
        include: {
          reportedBy: {
            select: {
              id: true,
              name: true,
              email: true,
              userRole: true,
            },
          },
          program: {
            select: {
              id: true,
              name: true,
              programType: true,
            },
          },
        },
      })

      // Calculate stats
      const stats = calculateMonitoringStats(monitoring)

      return NextResponse.json(
        {
          success: true,
          data: {
            ...monitoring,
            stats,
          },
        },
        { status: 201 }
      )
    } catch (error) {
      console.error('POST /api/sppg/program/[id]/monitoring error:', error)
      return NextResponse.json(
        { error: 'Failed to create monitoring report' },
        { status: 500 }
      )
    }
  })
}

/**
 * GET /api/sppg/program/[id]/monitoring
 * List all monitoring reports for program with filtering
 * 
 * @rbac Protected by withSppgAuth - requires valid SPPG session
 * @audit Automatic logging via middleware
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id: programId } = await params

      console.log('[MONITORING API] GET Request:', {
        programId,
        userEmail: session.user.email,
        userSppgId: session.user.sppgId
      })

      // Verify program belongs to user's SPPG
      const program = await db.nutritionProgram.findFirst({
        where: {
          id: programId,
          sppgId: session.user.sppgId!,
        },
      })

      console.log('[MONITORING API] Program found:', program ? 'YES' : 'NO')

      if (!program) {
        return NextResponse.json({ error: 'Program not found' }, { status: 404 })
      }

      // Parse and validate query params
      const { searchParams } = new URL(request.url)
      const filterParams = {
        programId,
        startDate: searchParams.get('startDate') || undefined,
        endDate: searchParams.get('endDate') || undefined,
        reportedById: searchParams.get('reportedById') || undefined,
        page: searchParams.get('page') || '1',
        limit: searchParams.get('limit') || '10',
      }

      const validated = monitoringFilterSchema.safeParse(filterParams)

      if (!validated.success) {
        return NextResponse.json(
          {
            error: 'Invalid filter parameters',
            details: validated.error.issues,
          },
          { status: 400 }
        )
      }

      const filters = validated.data

      // Build where clause
      const where: Prisma.ProgramMonitoringWhereInput = {
        programId,
      }

      if (filters.startDate || filters.endDate) {
        where.monitoringDate = {}
        if (filters.startDate) {
          where.monitoringDate.gte = new Date(filters.startDate)
        }
        if (filters.endDate) {
          where.monitoringDate.lte = new Date(filters.endDate)
        }
      }

      if (filters.reportedById) {
        where.reportedById = filters.reportedById
      }

      // Count total records
      const total = await db.programMonitoring.count({ where })

      console.log('[MONITORING API] Query:', {
        where,
        total
      })

      // Calculate pagination
      const page = filters.page || 1
      const limit = filters.limit || 10
      const skip = (page - 1) * limit
      const totalPages = Math.ceil(total / limit)

      // Fetch monitoring reports
      const monitoringReports = await db.programMonitoring.findMany({
        where,
        include: {
          reportedBy: {
            select: {
              id: true,
              name: true,
              email: true,
              userRole: true,
            },
          },
          program: {
            select: {
              id: true,
              name: true,
              programType: true,
            },
          },
        },
        orderBy: {
          monitoringDate: 'desc',
        },
        skip,
        take: limit,
      })

      // Add calculated stats to each report
      const reportsWithStats = monitoringReports.map((monitoring) => ({
        ...monitoring,
        stats: calculateMonitoringStats(monitoring),
      }))

      console.log('[MONITORING API] Returning:', {
        count: reportsWithStats.length,
        total,
        page,
        limit
      })

      return NextResponse.json({
        success: true,
        data: reportsWithStats,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      })
    } catch (error) {
      console.error('GET /api/sppg/program/[id]/monitoring error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch monitoring reports' },
        { status: 500 }
      )
    }
  })
}
