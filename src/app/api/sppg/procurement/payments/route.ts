/**
 * @fileoverview Payment API Routes - GET & POST /api/sppg/procurement/payments
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/PROCUREMENT_ENTERPRISE_AUDIT_COMPLETE.md} Audit Documentation
 * 
 * RBAC Integration:
 * - GET: Protected by withSppgAuth (all SPPG roles with procurement access)
 * - POST: Protected by withSppgAuth (requires PROCUREMENT_MANAGE permission)
 * - Automatic audit logging for all operations
 * - Multi-tenant isolation: Payments filtered by sppgId
 * 
 * BUSINESS LOGIC:
 * - List payments with filtering, pagination, and search
 * - Record new payment transactions
 * - Update procurement payment status automatically
 * - Calculate remaining amounts and aging
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { hasPermission } from '@/lib/permissions'
import { UserRole } from '@prisma/client'
import { 
  paymentFiltersSchema,
  paymentTransactionCreateSchema 
} from '@/features/sppg/procurement/payments/schemas'

// ================================ GET /api/sppg/procurement/payments ================================

/**
 * GET /api/sppg/procurement/payments
 * List all payments with filters and pagination
 * 
 * @rbac Protected by withSppgAuth
 * @audit Automatic logging
 * @security Requires READ permission
 * @returns {Promise<Response>} List of payments with pagination
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
      
      // Convert string values to appropriate types
      const processedParams = {
        ...queryParams,
        page: queryParams.page ? parseInt(queryParams.page) : undefined,
        limit: queryParams.limit ? parseInt(queryParams.limit) : undefined,
        minAmount: queryParams.minAmount ? parseFloat(queryParams.minAmount) : undefined,
        maxAmount: queryParams.maxAmount ? parseFloat(queryParams.maxAmount) : undefined,
        overdueOnly: queryParams.overdueOnly === 'true',
        paymentStatus: queryParams.paymentStatus ? queryParams.paymentStatus.split(',') : undefined,
        agingCategory: queryParams.agingCategory ? queryParams.agingCategory.split(',') : undefined,
      }

      // Validate filters
      const validated = paymentFiltersSchema.safeParse(processedParams)
      if (!validated.success) {
        return NextResponse.json({
          success: false,
          error: 'Invalid filter parameters',
          details: validated.error.flatten().fieldErrors
        }, { status: 400 })
      }

      const filters = validated.data

      // Build database query with multi-tenant filtering
      const where: Record<string, unknown> = {
        // Multi-tenant: Only get payments from user's SPPG
        sppgId: session.user.sppgId!,
        
        // Apply filters
        ...(filters.search && {
          OR: [
            { procurementCode: { contains: filters.search, mode: 'insensitive' as const } },
            { supplierName: { contains: filters.search, mode: 'insensitive' as const } },
            { invoiceNumber: { contains: filters.search, mode: 'insensitive' as const } },
          ]
        }),
        ...(filters.paymentStatus && filters.paymentStatus.length > 0 && {
          paymentStatus: { in: filters.paymentStatus }
        }),
        ...(filters.dateFrom && {
          procurementDate: { gte: new Date(filters.dateFrom) }
        }),
        ...(filters.dateTo && {
          procurementDate: { lte: new Date(filters.dateTo) }
        }),
        ...(filters.dueDateFrom && {
          paymentDue: { gte: new Date(filters.dueDateFrom) }
        }),
        ...(filters.dueDateTo && {
          paymentDue: { lte: new Date(filters.dueDateTo) }
        }),
        ...(filters.supplierId && {
          supplierId: filters.supplierId
        }),
        ...(filters.minAmount && {
          totalAmount: { gte: filters.minAmount }
        }),
        ...(filters.maxAmount && {
          totalAmount: { lte: filters.maxAmount }
        }),
      }

      // Overdue only filter
      if (filters.overdueOnly) {
        where.paymentDue = { lt: new Date() }
        where.paymentStatus = { notIn: ['PAID', 'CANCELLED'] }
      }

      // Get total count
      const total = await db.procurement.count({ where })

      // Calculate pagination
      const page = filters.page || 1
      const limit = filters.limit || 10
      const skip = (page - 1) * limit

      // Fetch payments with relationships
      const procurements = await db.procurement.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [filters.sortBy || 'procurementDate']: filters.sortOrder || 'desc'
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
          updatedAt: true,
        }
      })

      // Transform to Payment format with calculated fields
      const payments = procurements.map(p => ({
        procurementId: p.id,
        procurementCode: p.procurementCode,
        procurementDate: p.procurementDate,
        supplierId: p.supplierId,
        supplierName: p.supplierName,
        supplierContact: p.supplierContact,
        totalAmount: p.totalAmount,
        paidAmount: p.paidAmount,
        remainingAmount: p.totalAmount - p.paidAmount,
        paymentStatus: p.paymentStatus,
        paymentDue: p.paymentDue,
        paymentTerms: p.paymentTerms,
        invoiceNumber: p.invoiceNumber,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }))

      return NextResponse.json({
        success: true,
        data: {
          payments,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      })
    } catch (error) {
      console.error('GET /api/sppg/procurement/payments error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch payments',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, { status: 500 })
    }
  })
}

// ================================ POST /api/sppg/procurement/payments ================================

/**
 * POST /api/sppg/procurement/payments
 * Record new payment transaction
 * 
 * @rbac Protected by withSppgAuth
 * @audit Automatic logging
 * @security Requires PROCUREMENT_MANAGE permission
 * @body {PaymentTransactionCreateInput} Payment transaction data
 * @returns {Promise<Response>} Created payment transaction
 */
export async function POST(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // Permission Check
      if (!session.user.userRole || !hasPermission(session.user.userRole as UserRole, 'PROCUREMENT_MANAGE')) {
        return NextResponse.json({ 
          success: false, 
          error: 'Insufficient permissions' 
        }, { status: 403 })
      }

      // Parse request body
      const body = await request.json()
      
      // Validate input
      const validated = paymentTransactionCreateSchema.safeParse(body)
      if (!validated.success) {
        return NextResponse.json({
          success: false,
          error: 'Validation failed',
          details: validated.error.flatten().fieldErrors
        }, { status: 400 })
      }

      const data = validated.data

      // Verify procurement exists and belongs to user's SPPG
      const procurement = await db.procurement.findFirst({
        where: {
          id: data.procurementId,
          sppgId: session.user.sppgId! // Multi-tenant check
        }
      })

      if (!procurement) {
        return NextResponse.json({
          success: false,
          error: 'Procurement not found or access denied'
        }, { status: 404 })
      }

      // Validate payment amount doesn't exceed remaining balance
      const remainingAmount = procurement.totalAmount - procurement.paidAmount
      if (data.amount > remainingAmount) {
        return NextResponse.json({
          success: false,
          error: `Payment amount (Rp ${data.amount.toLocaleString('id-ID')}) exceeds remaining balance (Rp ${remainingAmount.toLocaleString('id-ID')})`
        }, { status: 400 })
      }

      // Create payment transaction
      const paymentTransaction = await db.paymentTransaction.create({
        data: {
          procurementId: data.procurementId,
          paymentDate: new Date(data.paymentDate),
          paymentMethod: data.paymentMethod,
          amount: data.amount,
          referenceNumber: data.referenceNumber || null,
          bankName: data.bankName || null,
          accountNumber: data.accountNumber || null,
          receiptUrl: data.receiptUrl || null,
          notes: data.notes || null,
          createdBy: session.user.id,
          createdByName: session.user.name || null,
        }
      })

      // Update procurement paid amount and payment status
      const newPaidAmount = procurement.paidAmount + data.amount
      const newPaymentStatus = newPaidAmount >= procurement.totalAmount 
        ? 'PAID' 
        : newPaidAmount > 0 
          ? 'PARTIALLY_PAID' 
          : 'UNPAID'

      await db.procurement.update({
        where: { id: data.procurementId },
        data: {
          paidAmount: newPaidAmount,
          paymentStatus: newPaymentStatus,
        }
      })

      return NextResponse.json({
        success: true,
        data: paymentTransaction,
        message: `Payment of Rp ${data.amount.toLocaleString('id-ID')} recorded successfully`
      }, { status: 201 })
    } catch (error) {
      console.error('POST /api/sppg/procurement/payments error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to create payment transaction',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, { status: 500 })
    }
  })
}
