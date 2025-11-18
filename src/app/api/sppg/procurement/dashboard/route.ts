/**
 * @fileoverview Procurement Dashboard API Route
 * @description API endpoint for fetching comprehensive dashboard statistics
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} API Endpoint Standards
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

/**
 * GET /api/sppg/procurement/dashboard
 * @description Fetch comprehensive procurement dashboard statistics
 * @returns Dashboard stats with real-time data from 7 parallel queries
 * @protected SPPG access required (automatic via withSppgAuth)
 */
export async function GET(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // 1. Get sppgId from session (guaranteed by withSppgAuth)
      const sppgId = session.user.sppgId!

      // 2. Calculate date ranges for time-based queries
      const today = new Date()
      const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

      // 3. Fetch comprehensive data with 7 parallel queries
    const [
      ordersStats,
      plansStats,
      suppliersStats,
      recentActivities,
      pendingApprovals,
      lowStockItems,
      upcomingDeliveries
    ] = await Promise.all([
      // Query 1: Orders statistics
      db.procurement.aggregate({
        where: { sppgId },
        _count: { id: true },
      }).then(async (total) => {
        const [pending, approved, completed, totalValue, thisMonth] = await Promise.all([
          db.procurement.count({ 
            where: { sppgId, status: 'PENDING_APPROVAL' } 
          }),
          db.procurement.count({ 
            where: { sppgId, status: 'APPROVED' } 
          }),
          db.procurement.count({ 
            where: { sppgId, status: 'COMPLETED' } 
          }),
          db.procurement.aggregate({
            where: { sppgId },
            _sum: { totalAmount: true }
          }),
          db.procurement.count({
            where: {
              sppgId,
              procurementDate: { gte: startOfMonth }
            }
          })
        ])

        return {
          total: total._count.id,
          pending,
          approved,
          completed,
          totalValue: totalValue._sum.totalAmount || 0,
          thisMonth
        }
      }),

      // Query 2: Plans statistics with budget tracking
      db.procurementPlan.aggregate({
        where: { sppgId },
        _count: { id: true },
      }).then(async (total) => {
        const [active, completed, budgets] = await Promise.all([
          db.procurementPlan.count({ 
            where: { 
              sppgId, 
              approvalStatus: { in: ['APPROVED', 'SUBMITTED'] }
            } 
          }),
          db.procurementPlan.count({ 
            where: { 
              sppgId,
              approvalStatus: { in: ['COMPLETED', 'CLOSED'] }
            } 
          }),
          db.procurementPlan.aggregate({
            where: { sppgId },
            _sum: { totalBudget: true }
          })
        ])

        const totalBudget = budgets._sum.totalBudget || 0
        
        // Calculate used budget from completed procurements
        const usedBudgetResult = await db.procurement.aggregate({
          where: { 
            sppgId,
            status: { in: ['COMPLETED', 'APPROVED'] }
          },
          _sum: { totalAmount: true }
        })
        
        const usedBudget = usedBudgetResult._sum.totalAmount || 0
        const remainingBudget = totalBudget - usedBudget

        return {
          total: total._count.id,
          active,
          completed,
          totalBudget,
          usedBudget,
          remainingBudget
        }
      }),

      // Query 3: Suppliers statistics
      db.supplier.aggregate({
        where: { sppgId },
        _count: { id: true },
      }).then(async (total) => {
        const [active, preferred, newThisMonth] = await Promise.all([
          db.supplier.count({ 
            where: { sppgId, isActive: true } 
          }),
          db.supplier.count({ 
            where: { sppgId, isPreferred: true } 
          }),
          db.supplier.count({
            where: {
              sppgId,
              createdAt: { gte: startOfMonth }
            }
          })
        ])

        return {
          total: total._count.id,
          active,
          preferred,
          newThisMonth
        }
      }),

      // Query 4: Recent activities (last 10 procurements)
      db.procurement.findMany({
        where: { sppgId },
        select: {
          id: true,
          procurementCode: true,
          procurementDate: true,
          totalAmount: true,
          status: true,
          supplier: {
            select: {
              supplierName: true
            }
          }
        },
        orderBy: { procurementDate: 'desc' },
        take: 10
      }),

      // Query 5: Pending approvals (top 5)
      db.procurement.findMany({
        where: {
          sppgId,
          status: 'PENDING_APPROVAL'
        },
        select: {
          id: true,
          procurementCode: true,
          procurementDate: true,
          totalAmount: true,
          supplier: {
            select: {
              supplierName: true
            }
          }
        },
        orderBy: { procurementDate: 'desc' },
        take: 5
      }),

      // Query 6: Low stock items (top 5)
      db.inventoryItem.findMany({
        where: {
          sppgId,
          currentStock: {
            lte: db.inventoryItem.fields.minStock
          }
        },
        select: {
          id: true,
          itemName: true,
          itemCode: true,
          currentStock: true,
          minStock: true,
          unit: true
        },
        orderBy: { currentStock: 'asc' },
        take: 5
      }),

      // Query 7: Upcoming deliveries (next 7 days)
      db.procurement.findMany({
        where: {
          sppgId,
          expectedDelivery: {
            gte: today,
            lte: sevenDaysFromNow
          },
          status: { in: ['APPROVED', 'ORDERED'] }
        },
        select: {
          id: true,
          procurementCode: true,
          expectedDelivery: true,
          totalAmount: true,
          supplier: {
            select: {
              supplierName: true
            }
          }
        },
        orderBy: { expectedDelivery: 'asc' },
        take: 5
      })
      ])

      // 4. Return comprehensive dashboard data
      return NextResponse.json({
        success: true,
        data: {
          orders: ordersStats,
          plans: plansStats,
          suppliers: suppliersStats,
          recentActivities,
          pendingApprovals,
          lowStockItems,
          upcomingDeliveries
        }
      })

    } catch (error) {
      console.error('[Procurement Dashboard API] Error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch dashboard statistics',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, { status: 500 })
    }
  })
}