/**
 * @fileoverview API endpoint untuk single Program Monitoring - GET, PATCH, DELETE
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.18.0
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * RBAC Integration:
 * - GET: Protected by withSppgAuth (all SPPG roles)
 * - PATCH: Protected by withSppgAuth (SPPG_ADMIN, SPPG_KEPALA, SPPG_AHLI_GIZI)
 * - DELETE: Protected by withSppgAuth (SPPG_ADMIN, SPPG_KEPALA)
 * - Automatic audit logging for all operations
 * - Multi-tenant: Monitoring report ownership verified via program.sppgId
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { updateMonitoringSchema } from '@/features/sppg/program/schemas'
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
 * GET /api/sppg/program/[id]/monitoring/[monitoringId]
 * Fetch single monitoring report by ID
 * 
 * @rbac Protected by withSppgAuth - requires valid SPPG session
 * @audit Automatic logging via middleware
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; monitoringId: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id: programId, monitoringId } = await params

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

      // Fetch monitoring report
      const monitoring = await db.programMonitoring.findFirst({
        where: {
          id: monitoringId,
          programId,
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

      // Return 404 if not found
      if (!monitoring) {
        return NextResponse.json({ error: 'Monitoring report not found' }, { status: 404 })
      }

      // Calculate stats
      const stats = calculateMonitoringStats(monitoring)

      return NextResponse.json({
        success: true,
        data: {
          ...monitoring,
          stats,
        },
      })
    } catch (error) {
      console.error('GET /api/sppg/program/[id]/monitoring/[monitoringId] error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch monitoring report' },
        { status: 500 }
      )
    }
  })
}

/**
 * PATCH /api/sppg/program/[id]/monitoring/[monitoringId]
 * Update existing monitoring report
 * 
 * @rbac Protected by withSppgAuth - requires SPPG_ADMIN, SPPG_KEPALA, or SPPG_AHLI_GIZI role
 * @audit Automatic logging via middleware
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; monitoringId: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id: programId, monitoringId } = await params

      // Role check
      const allowedRoles: UserRole[] = [
        UserRole.SPPG_ADMIN,
        UserRole.SPPG_KEPALA,
        UserRole.SPPG_AHLI_GIZI,
        UserRole.SPPG_PRODUKSI_MANAGER,
      ]

      if (!session.user.userRole || !allowedRoles.includes(session.user.userRole as UserRole)) {
        return NextResponse.json(
          { error: 'Insufficient permissions to update monitoring report' },
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

      // Check if monitoring report exists
      const existing = await db.programMonitoring.findFirst({
        where: {
          id: monitoringId,
          programId,
        },
      })

      if (!existing) {
        return NextResponse.json({ error: 'Monitoring report not found' }, { status: 404 })
      }

      // Parse and validate request body
      const body = await request.json()
      const validated = updateMonitoringSchema.safeParse(body)

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

      // Update monitoring report
      const monitoring = await db.programMonitoring.update({
        where: {
          id: monitoringId,
        },
        data: {
          ...(data.monitoringDate && { monitoringDate: new Date(data.monitoringDate) }),
          ...(data.reportingWeek !== undefined && { reportingWeek: data.reportingWeek }),
          
          // Beneficiary metrics
          ...(data.targetRecipients !== undefined && { targetRecipients: data.targetRecipients }),
          ...(data.enrolledRecipients !== undefined && { enrolledRecipients: data.enrolledRecipients }),
          ...(data.activeRecipients !== undefined && { activeRecipients: data.activeRecipients }),
          ...(data.dropoutCount !== undefined && { dropoutCount: data.dropoutCount }),
          ...(data.newEnrollments !== undefined && { newEnrollments: data.newEnrollments }),
          ...(data.attendanceRate !== undefined && { attendanceRate: data.attendanceRate }),
          ...(data.assessmentsCompleted !== undefined && { assessmentsCompleted: data.assessmentsCompleted }),
          ...(data.improvedNutrition !== undefined && { improvedNutrition: data.improvedNutrition }),
          ...(data.stableNutrition !== undefined && { stableNutrition: data.stableNutrition }),
          ...(data.worsenedNutrition !== undefined && { worsenedNutrition: data.worsenedNutrition }),
          ...(data.criticalCases !== undefined && { criticalCases: data.criticalCases }),
          ...(data.feedingDaysPlanned !== undefined && { feedingDaysPlanned: data.feedingDaysPlanned }),
          ...(data.feedingDaysCompleted !== undefined && { feedingDaysCompleted: data.feedingDaysCompleted }),
          ...(data.menuVariety !== undefined && { menuVariety: data.menuVariety }),
          ...(data.stockoutDays !== undefined && { stockoutDays: data.stockoutDays }),
          ...(data.qualityIssues !== undefined && { qualityIssues: data.qualityIssues }),
          ...(data.totalMealsProduced !== undefined && { totalMealsProduced: data.totalMealsProduced }),
          ...(data.totalMealsDistributed !== undefined && { totalMealsDistributed: data.totalMealsDistributed }),
          ...(data.wastePercentage !== undefined && { wastePercentage: data.wastePercentage }),
          
          // Budget
          ...(data.budgetAllocated !== undefined && { budgetAllocated: data.budgetAllocated }),
          ...(data.budgetUtilized !== undefined && { budgetUtilized: data.budgetUtilized }),
          
          // Quality & satisfaction
          ...(data.avgQualityScore !== undefined && { avgQualityScore: data.avgQualityScore }),
          ...(data.customerSatisfaction !== undefined && { customerSatisfaction: data.customerSatisfaction }),
          ...(data.complaintCount !== undefined && { complaintCount: data.complaintCount }),
          ...(data.complimentCount !== undefined && { complimentCount: data.complimentCount }),
          ...(data.foodSafetyIncidents !== undefined && { foodSafetyIncidents: data.foodSafetyIncidents }),
          ...(data.hygieneScore !== undefined && { hygieneScore: data.hygieneScore }),
          ...(data.temperatureCompliance !== undefined && { temperatureCompliance: data.temperatureCompliance }),
          
          // Human resources
          ...(data.staffAttendance !== undefined && { staffAttendance: data.staffAttendance }),
          ...(data.trainingCompleted !== undefined && { trainingCompleted: data.trainingCompleted }),
          
          // Qualitative data (JSON) - handle null with Prisma.JsonNull
          ...(data.challenges !== undefined && { challenges: data.challenges ?? Prisma.JsonNull }),
          ...(data.achievements !== undefined && { achievements: data.achievements ?? Prisma.JsonNull }),
          ...(data.recommendations !== undefined && { recommendations: data.recommendations ?? Prisma.JsonNull }),
          ...(data.feedback !== undefined && { feedback: data.feedback ?? Prisma.JsonNull }),
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

      return NextResponse.json({
        success: true,
        data: {
          ...monitoring,
          stats,
        },
      })
    } catch (error) {
      console.error('PATCH /api/sppg/program/[id]/monitoring/[monitoringId] error:', error)
      return NextResponse.json(
        { error: 'Failed to update monitoring report' },
        { status: 500 }
      )
    }
  })
}

/**
 * DELETE /api/sppg/program/[id]/monitoring/[monitoringId]
 * Delete monitoring report
 * 
 * @rbac Protected by withSppgAuth - requires SPPG_ADMIN or SPPG_KEPALA role
 * @audit Automatic logging via middleware
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; monitoringId: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id: programId, monitoringId } = await params

      // Role check - only admin and kepala can delete
      const allowedRoles: UserRole[] = [UserRole.SPPG_ADMIN, UserRole.SPPG_KEPALA]

      if (!session.user.userRole || !allowedRoles.includes(session.user.userRole as UserRole)) {
        return NextResponse.json(
          { error: 'Insufficient permissions to delete monitoring report' },
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

      // Check if monitoring report exists
      const existing = await db.programMonitoring.findFirst({
        where: {
          id: monitoringId,
          programId,
        },
      })

      if (!existing) {
        return NextResponse.json({ error: 'Monitoring report not found' }, { status: 404 })
      }

      // Delete monitoring report
      await db.programMonitoring.delete({
        where: {
          id: monitoringId,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Monitoring report deleted successfully',
      })
    } catch (error) {
      console.error('DELETE /api/sppg/program/[id]/monitoring/[monitoringId] error:', error)
      return NextResponse.json(
        { error: 'Failed to delete monitoring report' },
        { status: 500 }
      )
    }
  })
}
