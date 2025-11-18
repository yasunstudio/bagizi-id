/**
 * @fileoverview Receipt Statistics API Route
 * @version Next.js 15.5.4 / API Routes / Enterprise-grade
 * @author Bagizi-ID Development Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

// ================================ GET - Get Receipt Statistics ================================

export async function GET(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    // Calculate Statistics
    const [
      totalReceipts,
      pendingQC,
      completedToday,
      rejectedCount,
      recentReceipts,
    ] = await Promise.all([
      // Total receipts
      db.procurement.count({
        where: {
          sppgId: session.user.sppgId!,
          deliveryStatus: {
            in: ['DELIVERED', 'PARTIAL'],
          },
        },
      }),

      // Pending quality control
      db.procurement.count({
        where: {
          sppgId: session.user.sppgId!,
          deliveryStatus: 'DELIVERED',
        },
      }),

      // Completed today
      db.procurement.count({
        where: {
          sppgId: session.user.sppgId!,
          deliveryStatus: 'DELIVERED',
          status: 'COMPLETED',
          updatedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),

      // Rejected receipts
      db.procurement.count({
        where: {
          sppgId: session.user.sppgId!,
          deliveryStatus: 'CANCELLED',
          rejectionReason: {
            not: null,
          },
        },
      }),

      // Recent receipts for quick overview
      db.procurement.findMany({
        where: {
          sppgId: session.user.sppgId!,
          deliveryStatus: {
            in: ['DELIVERED', 'PARTIAL'],
          },
        },
        include: {
          supplier: {
            select: {
              supplierName: true,
            },
          },
        },
        orderBy: {
          actualDelivery: 'desc',
        },
        take: 5,
      }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        totalReceipts,
        pendingQC,
        completedToday,
        rejectedCount,
        recentReceipts,
      },
    })
  })
}
