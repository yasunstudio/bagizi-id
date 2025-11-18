/**
 * @fileoverview Employee Statistics API Route
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * 
 * GET /api/sppg/employees/statistics - Get employee statistics
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

/**
 * GET /api/sppg/employees/statistics
 * Get comprehensive employee statistics for dashboard
 */
export async function GET(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    // 3. Fetch statistics
    const [
      total,
      active,
      inactive,
      byDepartment,
      byPosition,
      byEmploymentType,
      byEmploymentStatus,
      byGender,
      newHires,
      terminations,
    ] = await Promise.all([
      // Total employees
      db.employee.count({
        where: { sppgId: session.user.sppgId! },
      }),

      // Active employees
      db.employee.count({
        where: {
          sppgId: session.user.sppgId!,
          isActive: true,
        },
      }),

      // Inactive employees
      db.employee.count({
        where: {
          sppgId: session.user.sppgId!,
          isActive: false,
        },
      }),

      // By Department
      db.employee.groupBy({
        by: ['departmentId'],
        where: { sppgId: session.user.sppgId! },
        _count: true,
      }),

      // By Position
      db.employee.groupBy({
        by: ['positionId'],
        where: { sppgId: session.user.sppgId! },
        _count: true,
      }),

      // By Employment Type
      db.employee.groupBy({
        by: ['employmentType'],
        where: { sppgId: session.user.sppgId! },
        _count: true,
      }),

      // By Employment Status
      db.employee.groupBy({
        by: ['employmentStatus'],
        where: { sppgId: session.user.sppgId! },
        _count: true,
      }),

      // By Gender
      db.employee.groupBy({
        by: ['gender'],
        where: { sppgId: session.user.sppgId! },
        _count: true,
      }),

      // New hires this month
      db.employee.count({
        where: {
          sppgId: session.user.sppgId!,
          joinDate: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),

      // Terminations this month
      db.employee.count({
        where: {
          sppgId: session.user.sppgId!,
          terminationDate: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ])

    // 4. Fetch department and position names
    const departmentIds = byDepartment.map((d) => d.departmentId)
    const positionIds = byPosition.map((p) => p.positionId)

    const [departments, positions] = await Promise.all([
      db.department.findMany({
        where: {
          id: { in: departmentIds },
        },
        select: {
          id: true,
          departmentName: true,
        },
      }),
      db.position.findMany({
        where: {
          id: { in: positionIds },
        },
        select: {
          id: true,
          positionName: true,
        },
      }),
    ])

    // 5. Build statistics object
    const byDepartmentMap: Record<string, number> = {}
    byDepartment.forEach((item) => {
      const dept = departments.find((d) => d.id === item.departmentId)
      if (dept) {
        byDepartmentMap[dept.departmentName] = item._count
      }
    })

    const byPositionMap: Record<string, number> = {}
    byPosition.forEach((item) => {
      const pos = positions.find((p) => p.id === item.positionId)
      if (pos) {
        byPositionMap[pos.positionName] = item._count
      }
    })

    const statistics = {
      total,
      active,
      inactive,
      byDepartment: byDepartmentMap,
      byPosition: byPositionMap,
      byEmploymentType: {
        permanent: byEmploymentType.find((t) => t.employmentType === 'PERMANENT')?._count || 0,
        contract: byEmploymentType.find((t) => t.employmentType === 'CONTRACT')?._count || 0,
        temporary: byEmploymentType.find((t) => t.employmentType === 'TEMPORARY')?._count || 0,
        intern: byEmploymentType.find((t) => t.employmentType === 'INTERN')?._count || 0,
        freelance: byEmploymentType.find((t) => t.employmentType === 'FREELANCE')?._count || 0,
      },
      byEmploymentStatus: {
        active: byEmploymentStatus.find((s) => s.employmentStatus === 'ACTIVE')?._count || 0,
        probation: byEmploymentStatus.find((s) => s.employmentStatus === 'PROBATION')?._count || 0,
        terminated: byEmploymentStatus.find((s) => s.employmentStatus === 'TERMINATED')?._count || 0,
        resigned: byEmploymentStatus.find((s) => s.employmentStatus === 'RESIGNED')?._count || 0,
        retired: byEmploymentStatus.find((s) => s.employmentStatus === 'RETIRED')?._count || 0,
      },
      byGender: {
        male: byGender.find((g) => g.gender === 'MALE')?._count || 0,
        female: byGender.find((g) => g.gender === 'FEMALE')?._count || 0,
      },
      newHiresThisMonth: newHires,
      terminationsThisMonth: terminations,
    }

    // 6. Return statistics
    return NextResponse.json({
      success: true,
      data: statistics,
    })
  })
}
