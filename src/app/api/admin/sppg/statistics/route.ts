/**
 * Admin SPPG Statistics API Endpoint
 * Provides comprehensive statistics for admin dashboard
 * 
 * @route GET /api/admin/sppg/statistics
 * 
 * @version Next.js 15.5.4 / Prisma 6.18.0
 * @author Bagizi-ID Development Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

/**
 * GET /api/admin/sppg/statistics
 * Get comprehensive SPPG statistics for admin dashboard
 * 
 * @access Platform Admin (SUPERADMIN, SUPPORT, ANALYST) - automatic via withAdminAuth
 */
export async function GET(request: NextRequest) {
  return withAdminAuth(request, async () => {
    try {
      // Gather statistics in parallel
    const [
      totalSppg,
      activeSppg,
      inactiveSppg,
      suspendedSppg,
      demoSppg,
      sppgByOrgType,
      sppgByProvince,
      totalUsers,
      totalPrograms,
      totalBeneficiaries,
      recentSppg,
    ] = await Promise.all([
      // Total SPPG count
      db.sPPG.count(),

      // Active SPPG count
      db.sPPG.count({
        where: { status: 'ACTIVE' }
      }),

      // Inactive SPPG count
      db.sPPG.count({
        where: { status: 'INACTIVE' }
      }),

      // Suspended SPPG count
      db.sPPG.count({
        where: { status: 'SUSPENDED' }
      }),

      // Demo account count
      db.sPPG.count({
        where: { isDemoAccount: true }
      }),

      // SPPG by organization type
      db.sPPG.groupBy({
        by: ['organizationType'],
        _count: {
          id: true
        }
      }),

      // SPPG by province (top 10)
      db.sPPG.groupBy({
        by: ['provinceId'],
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 10
      }),

      // Total users across all SPPG
      db.user.count(),

      // Total nutrition programs
      db.nutritionProgram.count(),

      // Total beneficiaries
      db.school.count(), // ✅ UPDATED (Phase 3)

      // Recent SPPG (last 5)
      db.sPPG.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          code: true,
          name: true,
          organizationType: true,
          status: true,
          createdAt: true,
          province: {
            select: {
              name: true
            }
          }
        }
      })
    ])

    // 4. Fetch province names for top provinces
    const provinceIds = sppgByProvince.map(p => p.provinceId)
    const provinces = await db.province.findMany({
      where: {
        id: { in: provinceIds }
      },
      select: {
        id: true,
        name: true
      }
    })

    // 5. Map province names to stats
    const sppgByProvinceWithNames = sppgByProvince.map(stat => {
      const province = provinces.find(p => p.id === stat.provinceId)
      return {
        provinceId: stat.provinceId,
        provinceName: province?.name || 'Unknown',
        count: stat._count.id
      }
    })

    // 6. Calculate averages
    const averageUsersPerSppg = totalSppg > 0 ? totalUsers / totalSppg : 0
    const averageProgramsPerSppg = totalSppg > 0 ? totalPrograms / totalSppg : 0
    const averageBeneficiariesPerSppg = totalSppg > 0 ? totalBeneficiaries / totalSppg : 0

    // 7. Prepare response
    const statistics = {
      totals: {
        totalSppg,
        activeSppg,
        inactiveSppg,
        suspendedSppg,
        demoSppg,
        productionSppg: totalSppg - demoSppg,
      },
      byOrganizationType: sppgByOrgType.map(stat => ({
        organizationType: stat.organizationType,
        count: stat._count.id
      })),
      byProvince: sppgByProvinceWithNames,
      aggregates: {
        totalUsers,
        totalPrograms,
        totalBeneficiaries,
        averageUsersPerSppg: Math.round(averageUsersPerSppg * 100) / 100,
        averageProgramsPerSppg: Math.round(averageProgramsPerSppg * 100) / 100,
        averageBeneficiariesPerSppg: Math.round(averageBeneficiariesPerSppg * 100) / 100,
      },
      recent: recentSppg,
      generatedAt: new Date().toISOString(),
    }

    // Return statistics
    return NextResponse.json({
      success: true,
      data: statistics
    })

    } catch (error) {
      console.error('[GET /api/admin/sppg/statistics] Error:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch statistics',
          details: error instanceof Error ? error.message : undefined
        },
        { status: 500 }
      )
    }
  })
}
