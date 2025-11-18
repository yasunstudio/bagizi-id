/**
 * @fileoverview Aging Report API Route - GET /api/sppg/procurement/payments/aging
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * 
 * RBAC Integration:
 * - GET: Protected by withSppgAuth (all SPPG roles with procurement access)
 * - Automatic audit logging
 * - Multi-tenant isolation: Payments filtered by sppgId
 * 
 * BUSINESS LOGIC:
 * - Generate accounts payable aging report
 * - Categorize outstanding payments by age: 0-30, 31-60, 61-90, 90+ days
 * - Provide supplier-level breakdown
 * - Calculate total outstanding per supplier and category
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { hasPermission } from '@/lib/permissions'
import { UserRole } from '@prisma/client'
import { agingReportFiltersSchema } from '@/features/sppg/procurement/payments/schemas'
import { calculateDaysOverdue, calculateAgingCategory } from '@/features/sppg/procurement/payments/types'

/**
 * GET /api/sppg/procurement/payments/aging
 * Generate accounts payable aging report
 * 
 * @rbac Protected by withSppgAuth
 * @audit Automatic logging
 * @security Requires READ permission
 * @returns {Promise<Response>} Aging report with supplier breakdown
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
      const validated = agingReportFiltersSchema.safeParse(queryParams)
      if (!validated.success) {
        return NextResponse.json({
          success: false,
          error: 'Invalid filter parameters',
          details: validated.error.flatten().fieldErrors
        }, { status: 400 })
      }

      const filters = validated.data

      // Build where clause
      const where: Record<string, unknown> = {
        sppgId: session.user.sppgId!, // Multi-tenant check
        paymentStatus: { 
          notIn: ['PAID', 'CANCELLED'] // Only unpaid and partially paid
        },
        ...(filters.supplierId && { supplierId: filters.supplierId }),
      }

      // Fetch outstanding procurements
      const procurements = await db.procurement.findMany({
        where,
        select: {
          id: true,
          procurementCode: true,
          procurementDate: true,
          supplierId: true,
          supplierName: true,
          totalAmount: true,
          paidAmount: true,
          paymentStatus: true,
          paymentDue: true,
          invoiceNumber: true,
        }
      })

      // Group by supplier and calculate aging
      const supplierMap = new Map<string, {
        supplierId: string
        supplierName: string
        totalOutstanding: number
        current: number      // 0-30 days
        days31to60: number   // 31-60 days
        days61to90: number   // 61-90 days
        over90: number       // 90+ days
        procurementCount: number
      }>()

      let totalCurrent = 0
      let totalDays31to60 = 0
      let totalDays61to90 = 0
      let totalOver90 = 0

      procurements.forEach(p => {
        const remainingAmount = p.totalAmount - p.paidAmount
        const daysOverdue = calculateDaysOverdue(p.paymentDue)
        const agingCategory = calculateAgingCategory(daysOverdue)

        // Initialize supplier entry if not exists
        if (!supplierMap.has(p.supplierId)) {
          supplierMap.set(p.supplierId, {
            supplierId: p.supplierId,
            supplierName: p.supplierName,
            totalOutstanding: 0,
            current: 0,
            days31to60: 0,
            days61to90: 0,
            over90: 0,
            procurementCount: 0,
          })
        }

        const supplier = supplierMap.get(p.supplierId)!
        supplier.totalOutstanding += remainingAmount
        supplier.procurementCount++

        // Categorize by aging
        switch (agingCategory) {
          case 'CURRENT':
            supplier.current += remainingAmount
            totalCurrent += remainingAmount
            break
          case 'DAYS_31_60':
            supplier.days31to60 += remainingAmount
            totalDays31to60 += remainingAmount
            break
          case 'DAYS_61_90':
            supplier.days61to90 += remainingAmount
            totalDays61to90 += remainingAmount
            break
          case 'OVER_90':
            supplier.over90 += remainingAmount
            totalOver90 += remainingAmount
            break
        }
      })

      // Convert map to array and sort by total outstanding (descending)
      const supplierBreakdown = Array.from(supplierMap.values()).sort(
        (a, b) => b.totalOutstanding - a.totalOutstanding
      )

      // Calculate totals
      const totalOutstanding = totalCurrent + totalDays31to60 + totalDays61to90 + totalOver90

      return NextResponse.json({
        success: true,
        data: {
          generatedAt: new Date(),
          summary: {
            totalOutstanding,
            current: totalCurrent,
            days31to60: totalDays31to60,
            days61to90: totalDays61to90,
            over90: totalOver90,
            totalSuppliers: supplierBreakdown.length,
            totalProcurements: procurements.length,
          },
          supplierBreakdown,
        }
      })
    } catch (error) {
      console.error('GET /api/sppg/procurement/payments/aging error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to generate aging report',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, { status: 500 })
    }
  })
}
