/**
 * @fileoverview Orders API - Statistics Endpoint
 * Provides order statistics and analytics
 * 
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

// ============================================================================
// GET /api/sppg/procurement/orders/stats - Get Order Statistics
// ============================================================================

export async function GET(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    // 3. Parse Query Parameters
    const { searchParams } = new URL(request.url)
    const dateFrom = searchParams.get('dateFrom') || undefined
    const dateTo = searchParams.get('dateTo') || undefined

    // 4. Build WHERE Clause
    const where: {
      sppgId: string
      procurementDate?: {
        gte?: Date
        lte?: Date
      }
    } = {
      sppgId: session.user.sppgId!,
    }

    // Date range filter
    if (dateFrom || dateTo) {
      where.procurementDate = {}
      if (dateFrom) {
        where.procurementDate.gte = new Date(dateFrom)
      }
      if (dateTo) {
        where.procurementDate.lte = new Date(dateTo)
      }
    }

    // 5. Fetch Statistics
    const [
      totalOrders,
      statusBreakdown,
      paymentBreakdown,
      financialSummary,
      recentOrders,
    ] = await Promise.all([
      // Total orders count
      db.procurement.count({ where }),

      // Status breakdown
      db.procurement.groupBy({
        by: ['status'],
        where,
        _count: {
          id: true,
        },
        _sum: {
          totalAmount: true,
        },
      }),

      // Payment status breakdown
      db.procurement.groupBy({
        by: ['paymentStatus'],
        where,
        _count: {
          id: true,
        },
        _sum: {
          totalAmount: true,
          paidAmount: true,
        },
      }),

      // Financial summary
      db.procurement.aggregate({
        where,
        _sum: {
          totalAmount: true,
          paidAmount: true,
          subtotalAmount: true,
          taxAmount: true,
          discountAmount: true,
          shippingCost: true,
        },
        _avg: {
          totalAmount: true,
        },
      }),

      // Recent orders (last 5)
      db.procurement.findMany({
        where,
        select: {
          id: true,
          procurementCode: true,
          procurementDate: true,
          status: true,
          totalAmount: true,
          supplierName: true,
        },
        orderBy: {
          procurementDate: 'desc',
        },
        take: 5,
      }),
    ])

    // 6. Format Status Breakdown
    const statusStats = statusBreakdown.map((item) => ({
      status: item.status,
      count: item._count.id,
      totalAmount: item._sum.totalAmount || 0,
    }))

    // 7. Format Payment Breakdown
    const paymentStats = paymentBreakdown.map((item) => ({
      paymentStatus: item.paymentStatus,
      count: item._count.id,
      totalAmount: item._sum.totalAmount || 0,
      paidAmount: item._sum.paidAmount || 0,
      unpaidAmount: (item._sum.totalAmount || 0) - (item._sum.paidAmount || 0),
    }))

    // 8. Calculate Key Metrics
    const totalAmount = financialSummary._sum.totalAmount || 0
    const averageOrderValue = financialSummary._avg.totalAmount || 0

    // 9. Return Statistics in expected format
    return NextResponse.json({
      success: true,
      data: {
        totalOrders,
        totalAmount,
        averageOrderValue,
        byStatus: statusStats, // Array format as expected by OrderStats interface
        byPaymentStatus: paymentStats,
        bySupplier: [], // TODO: Implement supplier breakdown
        byMonth: [], // TODO: Implement monthly breakdown
        recentOrders,
      },
    })
  })
}
