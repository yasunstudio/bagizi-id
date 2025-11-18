/**
 * @fileoverview Procurement Items Statistics API Endpoint
 * GET aggregated statistics for order items
 * 
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.18.0
 * @author Bagizi-ID Development Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

/**
 * GET /api/sppg/procurement/orders/[id]/items/stats
 * Get aggregated statistics for procurement items
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id: orderId } = await params

      // Verify SPPG access
      if (!session.user.sppgId) {
        return NextResponse.json(
          { error: 'SPPG access required' },
          { status: 403 }
        )
      }

      // Verify order exists and belongs to user's SPPG
      const order = await db.procurement.findFirst({
        where: {
          id: orderId,
          sppgId: session.user.sppgId,
        },
        select: {
          id: true,
          procurementCode: true,
        },
      })

      if (!order) {
        return NextResponse.json(
          { error: 'Order not found or access denied' },
          { status: 404 }
        )
      }

      // Fetch all items for statistics
      const items = await db.procurementItem.findMany({
        where: {
          procurementId: orderId,
        },
        select: {
          id: true,
          category: true,
          orderedQuantity: true,
          receivedQuantity: true,
          finalPrice: true,
          discountAmount: true,
          isAccepted: true,
          rejectionReason: true,
        },
      })

      // Calculate statistics
      const totalItems = items.length
      const totalValue = items.reduce((sum, item) => sum + item.finalPrice, 0)
      const totalDiscount = items.reduce((sum, item) => sum + item.discountAmount, 0)

      // Count accepted and rejected items
      const acceptedItems = items.filter(
        (item) => item.receivedQuantity && item.isAccepted
      ).length
      const rejectedItems = items.filter(
        (item) => item.receivedQuantity && !item.isAccepted
      ).length
      const pendingItems = items.filter((item) => !item.receivedQuantity).length

      // Calculate average discount
      const itemsWithDiscount = items.filter((item) => item.discountAmount > 0)
      const averageDiscount =
        itemsWithDiscount.length > 0
          ? itemsWithDiscount.reduce((sum, item) => sum + item.discountAmount, 0) /
            itemsWithDiscount.length
          : 0

      // Group by category
      const itemsByCategory = items.reduce(
        (acc, item) => {
          const category = item.category
          if (!acc[category]) {
            acc[category] = {
              count: 0,
              totalValue: 0,
              accepted: 0,
              rejected: 0,
              pending: 0,
            }
          }
          acc[category].count++
          acc[category].totalValue += item.finalPrice

          if (item.receivedQuantity) {
            if (item.isAccepted) {
              acc[category].accepted++
            } else {
              acc[category].rejected++
            }
          } else {
            acc[category].pending++
          }

          return acc
        },
        {} as Record<
          string,
          {
            count: number
            totalValue: number
            accepted: number
            rejected: number
            pending: number
          }
        >
      )

      // Calculate acceptance rate
      const receivedItemsCount = acceptedItems + rejectedItems
      const acceptanceRate =
        receivedItemsCount > 0 ? (acceptedItems / receivedItemsCount) * 100 : 0

      // Calculate total ordered vs received quantities
      const totalOrdered = items.reduce(
        (sum, item) => sum + item.orderedQuantity,
        0
      )
      const totalReceived = items.reduce(
        (sum, item) => sum + (item.receivedQuantity || 0),
        0
      )
      const receiveRate = totalOrdered > 0 ? (totalReceived / totalOrdered) * 100 : 0

      const stats = {
        totalItems,
        totalValue,
        totalDiscount,
        acceptedItems,
        rejectedItems,
        pendingItems,
        averageDiscount,
        acceptanceRate,
        totalOrdered,
        totalReceived,
        receiveRate,
        itemsByCategory,
      }

      return NextResponse.json({
        success: true,
        data: stats,
        meta: {
          orderId,
          orderCode: order.procurementCode,
        },
      })
    } catch (error) {
      console.error('Get items stats error:', error)
      return NextResponse.json(
        {
          error: 'Failed to fetch items statistics',
          details: process.env.NODE_ENV === 'development' ? error : undefined,
        },
        { status: 500 }
      )
    }
  })
}
