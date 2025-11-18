/**
 * @fileoverview Overdue Payments API Route - GET /api/sppg/procurement/payments/overdue
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * 
 * RBAC Integration:
 * - GET: Protected by withSppgAuth (all SPPG roles with procurement access)
 * - Automatic audit logging
 * - Multi-tenant isolation: Payments filtered by sppgId
 * 
 * BUSINESS LOGIC:
 * - List all overdue payments (past due date, not fully paid)
 * - Calculate days overdue for each payment
 * - Sort by most overdue first
 * - Include supplier contact information for follow-up
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { hasPermission } from '@/lib/permissions'
import { UserRole } from '@prisma/client'
import { calculateDaysOverdue, calculateAgingCategory } from '@/features/sppg/procurement/payments/types'

/**
 * GET /api/sppg/procurement/payments/overdue
 * Get list of overdue payments
 * 
 * @rbac Protected by withSppgAuth
 * @audit Automatic logging
 * @security Requires READ permission
 * @returns {Promise<Response>} List of overdue payments with details
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

      // Fetch overdue procurements
      const now = new Date()
      const overdueProcurements = await db.procurement.findMany({
        where: {
          sppgId: session.user.sppgId!, // Multi-tenant check
          paymentDue: { 
            not: null, // Must have due date
            lt: now  // Past due date
          },
          paymentStatus: { 
            notIn: ['PAID', 'CANCELLED'] // Not fully paid or cancelled
          }
        },
        select: {
          id: true,
          procurementCode: true,
          procurementDate: true,
          supplierId: true,
          supplierName: true,
          supplierContact: true,
          totalAmount: true,
          paidAmount: true,
          paymentStatus: true,
          paymentDue: true,
          paymentTerms: true,
          invoiceNumber: true,
          createdAt: true,
          paymentTransactions: {
            select: {
              id: true,
              paymentDate: true,
              amount: true,
              paymentMethod: true,
            },
            orderBy: {
              paymentDate: 'desc'
            }
          }
        },
        orderBy: {
          paymentDue: 'asc' // Most overdue first
        }
      })

      // Transform to OverduePayment format with calculations
      const overduePayments = overdueProcurements.map(p => {
        const remainingAmount = p.totalAmount - p.paidAmount
        const daysOverdue = calculateDaysOverdue(p.paymentDue)
        const agingCategory = calculateAgingCategory(daysOverdue)
        
        return {
          procurementId: p.id,
          procurementCode: p.procurementCode,
          procurementDate: p.procurementDate,
          supplierId: p.supplierId,
          supplierName: p.supplierName,
          supplierContact: p.supplierContact,
          totalAmount: p.totalAmount,
          paidAmount: p.paidAmount,
          remainingAmount,
          paymentStatus: p.paymentStatus,
          paymentDue: p.paymentDue,
          paymentTerms: p.paymentTerms,
          invoiceNumber: p.invoiceNumber,
          daysOverdue,
          agingCategory,
          lastPaymentDate: p.paymentTransactions[0]?.paymentDate || null,
          lastPaymentAmount: p.paymentTransactions[0]?.amount || null,
        }
      })

      // Calculate summary statistics
      const totalOverdue = overduePayments.reduce((sum, p) => sum + p.remainingAmount, 0)
      const countByCategory = {
        CURRENT: overduePayments.filter(p => p.agingCategory === 'CURRENT').length,
        DAYS_31_60: overduePayments.filter(p => p.agingCategory === 'DAYS_31_60').length,
        DAYS_61_90: overduePayments.filter(p => p.agingCategory === 'DAYS_61_90').length,
        OVER_90: overduePayments.filter(p => p.agingCategory === 'OVER_90').length,
      }

      return NextResponse.json({
        success: true,
        data: {
          payments: overduePayments,
          summary: {
            totalCount: overduePayments.length,
            totalOverdueAmount: totalOverdue,
            countByCategory,
            oldestOverdue: overduePayments[0] || null,
          }
        }
      })
    } catch (error) {
      console.error('GET /api/sppg/procurement/payments/overdue error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch overdue payments',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, { status: 500 })
    }
  })
}
