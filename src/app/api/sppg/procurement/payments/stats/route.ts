/**
 * @fileoverview Payment Statistics API Route - GET /api/sppg/procurement/payments/stats
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * 
 * RBAC Integration:
 * - GET: Protected by withSppgAuth (all SPPG roles with procurement access)
 * - Automatic audit logging
 * - Multi-tenant isolation: Payments filtered by sppgId
 * 
 * BUSINESS LOGIC:
 * - Calculate comprehensive payment statistics
 * - Total outstanding, overdue, paid amounts
 * - Payment trend analysis (this month, last month, year-to-date)
 * - Average payment cycle time
 * - Payment method distribution
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { hasPermission } from '@/lib/permissions'
import { UserRole } from '@prisma/client'
import { paymentStatsQuerySchema } from '@/features/sppg/procurement/payments/schemas'
import { calculateDaysOverdue, calculateAgingCategory } from '@/features/sppg/procurement/payments/types'

/**
 * GET /api/sppg/procurement/payments/stats
 * Get comprehensive payment statistics
 * 
 * @rbac Protected by withSppgAuth
 * @audit Automatic logging
 * @security Requires READ permission
 * @returns {Promise<Response>} Payment statistics and trends
 */
export async function GET(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // Permission Check
      if (!session.user.userRole || !hasPermission(session.user.userRole as UserRole, 'READ')) {
        return NextResponse.json({ 
          success: false, 
          error: 'Insufficient permissions' 
        }, { status: 403 })
      }

      // Parse query parameters
      const { searchParams } = new URL(request.url)
      const queryParams = Object.fromEntries(searchParams)
      
      // Validate filters
      const validated = paymentStatsQuerySchema.safeParse(queryParams)
      if (!validated.success) {
        return NextResponse.json({
          success: false,
          error: 'Invalid query parameters',
          details: validated.error.flatten().fieldErrors
        }, { status: 400 })
      }

      const filters = validated.data

      // Calculate date ranges
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
      const startOfYear = new Date(now.getFullYear(), 0, 1)
      const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      const next30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

      // Base where clause
      const baseWhere: Record<string, unknown> = {
        sppgId: session.user.sppgId!, // Multi-tenant check
        ...(filters.supplierId && { supplierId: filters.supplierId }),
      }

      // Fetch all procurements for analysis
      const allProcurements = await db.procurement.findMany({
        where: baseWhere,
        select: {
          id: true,
          totalAmount: true,
          paidAmount: true,
          paymentStatus: true,
          paymentDue: true,
          procurementDate: true,
          paymentTransactions: {
            select: {
              amount: true,
              paymentDate: true,
              paymentMethod: true,
            }
          }
        }
      })

      // Calculate totals
      const totalProcurements = allProcurements.length
      const totalAmount = allProcurements.reduce((sum, p) => sum + p.totalAmount, 0)
      const totalPaid = allProcurements.reduce((sum, p) => sum + p.paidAmount, 0)
      const totalOutstanding = totalAmount - totalPaid

      // Calculate overdue (only for procurements with due dates)
      const overdueProcurements = allProcurements.filter(
        p => p.paymentDue && p.paymentDue < now && p.paymentStatus !== 'PAID' && p.paymentStatus !== 'CANCELLED'
      )
      const totalOverdue = overdueProcurements.reduce((sum, p) => sum + (p.totalAmount - p.paidAmount), 0)

      // Calculate aging breakdown
      let agingCurrent = 0
      let agingDays31to60 = 0
      let agingDays61to90 = 0
      let agingOver90 = 0

      overdueProcurements.forEach(p => {
        const remaining = p.totalAmount - p.paidAmount
        if (!p.paymentDue) return // Skip if no due date
        
        const daysOverdue = calculateDaysOverdue(p.paymentDue)
        const category = calculateAgingCategory(daysOverdue)
        
        switch (category) {
          case 'CURRENT': agingCurrent += remaining; break
          case 'DAYS_31_60': agingDays31to60 += remaining; break
          case 'DAYS_61_90': agingDays61to90 += remaining; break
          case 'OVER_90': agingOver90 += remaining; break
        }
      })

      // Calculate due soon (only for procurements with due dates)
      const dueNext7Days = allProcurements
        .filter(p => p.paymentDue && p.paymentDue >= now && p.paymentDue <= next7Days && p.paymentStatus !== 'PAID')
        .reduce((sum, p) => sum + (p.totalAmount - p.paidAmount), 0)

      const dueNext30Days = allProcurements
        .filter(p => p.paymentDue && p.paymentDue >= now && p.paymentDue <= next30Days && p.paymentStatus !== 'PAID')
        .reduce((sum, p) => sum + (p.totalAmount - p.paidAmount), 0)

      // Payment trends
      const paymentsThisMonth = allProcurements
        .flatMap(p => p.paymentTransactions)
        .filter(t => t.paymentDate >= startOfMonth)

      const paymentsLastMonth = allProcurements
        .flatMap(p => p.paymentTransactions)
        .filter(t => t.paymentDate >= startOfLastMonth && t.paymentDate <= endOfLastMonth)

      const paymentsYTD = allProcurements
        .flatMap(p => p.paymentTransactions)
        .filter(t => t.paymentDate >= startOfYear)

      const paidThisMonth = paymentsThisMonth.reduce((sum, t) => sum + t.amount, 0)
      const paidLastMonth = paymentsLastMonth.reduce((sum, t) => sum + t.amount, 0)
      const paidYTD = paymentsYTD.reduce((sum, t) => sum + t.amount, 0)

      // Payment method distribution
      const paymentMethodCounts = allProcurements
        .flatMap(p => p.paymentTransactions)
        .reduce((acc, t) => {
          acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + 1
          return acc
        }, {} as Record<string, number>)

      // Average payment cycle (days from procurement date to full payment)
      const paidProcurements = allProcurements.filter(p => p.paymentStatus === 'PAID')
      const avgPaymentCycle = paidProcurements.length > 0
        ? paidProcurements.reduce((sum, p) => {
            const lastPayment = p.paymentTransactions[p.paymentTransactions.length - 1]
            if (!lastPayment) return sum
            const days = Math.floor(
              (lastPayment.paymentDate.getTime() - p.procurementDate.getTime()) / (1000 * 60 * 60 * 24)
            )
            return sum + days
          }, 0) / paidProcurements.length
        : 0

      return NextResponse.json({
        success: true,
        data: {
          summary: {
            totalProcurements,
            totalAmount,
            totalPaid,
            totalOutstanding,
            totalOverdue,
            overdueCount: overdueProcurements.length,
          },
          aging: {
            current: agingCurrent,
            days31to60: agingDays31to60,
            days61to90: agingDays61to90,
            over90: agingOver90,
          },
          dueSoon: {
            next7Days: dueNext7Days,
            next30Days: dueNext30Days,
          },
          trends: {
            thisMonth: {
              amount: paidThisMonth,
              count: paymentsThisMonth.length,
            },
            lastMonth: {
              amount: paidLastMonth,
              count: paymentsLastMonth.length,
            },
            yearToDate: {
              amount: paidYTD,
              count: paymentsYTD.length,
            },
            changeFromLastMonth: paidLastMonth > 0 
              ? ((paidThisMonth - paidLastMonth) / paidLastMonth) * 100 
              : 0,
          },
          paymentMethods: paymentMethodCounts,
          avgPaymentCycle: Math.round(avgPaymentCycle),
        }
      })
    } catch (error) {
      console.error('GET /api/sppg/procurement/payments/stats error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch payment statistics',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, { status: 500 })
    }
  })
}
