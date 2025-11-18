/**
 * @fileoverview Pending Procurements API Route
 * @version Next.js 15.5.4 / API Routes / Enterprise-grade
 * @author Bagizi-ID Development Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

// ================================ GET - Get Pending Procurements ================================

export async function GET(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    // Get Pending Procurements (approved but not yet delivered)
    const pendingProcurements = await db.procurement.findMany({
      where: {
        sppgId: session.user.sppgId!,
        status: 'APPROVED',
        deliveryStatus: {
          in: ['PENDING', 'ON_DELIVERY'],
        },
      },
      include: {
        supplier: {
          select: {
            id: true,
            supplierName: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            inventoryItem: {
              select: {
                id: true,
                itemName: true,
                unit: true,
              },
            },
          },
        },
      },
      orderBy: {
        expectedDelivery: 'asc',
      },
    })

    return NextResponse.json({
      success: true,
      data: pendingProcurements,
    })
  })
}
