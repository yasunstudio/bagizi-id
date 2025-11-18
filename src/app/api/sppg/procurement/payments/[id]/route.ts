/**
 * @fileoverview Payment Transaction API Routes - GET/PUT/DELETE /api/sppg/procurement/payments/[id]
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * 
 * RBAC Integration:
 * - GET: Protected by withSppgAuth (all SPPG roles with procurement access)
 * - PUT: Protected by withSppgAuth (requires PROCUREMENT_MANAGE permission)
 * - DELETE: Protected by withSppgAuth (requires PROCUREMENT_MANAGE permission)
 * - Automatic audit logging for all operations
 * - Multi-tenant isolation: Payments filtered by sppgId
 * 
 * BUSINESS LOGIC:
 * - Get payment transaction details
 * - Update payment transaction information
 * - Delete payment transaction (reverses payment amount)
 * - Recalculate procurement payment status on changes
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { hasPermission } from '@/lib/permissions'
import { UserRole } from '@prisma/client'
import { paymentTransactionUpdateSchema } from '@/features/sppg/procurement/payments/schemas'

// ================================ GET /api/sppg/procurement/payments/[id] ================================

/**
 * GET /api/sppg/procurement/payments/[id]
 * Get payment transaction details
 * 
 * @rbac Protected by withSppgAuth
 * @audit Automatic logging
 * @security Requires READ permission
 * @param {string} id - Payment transaction ID
 * @returns {Promise<Response>} Payment transaction details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withSppgAuth(request, async (session) => {
    try {
      // Permission Check
      if (!session.user.userRole || !hasPermission(session.user.userRole as UserRole, 'READ')) {
        return NextResponse.json({ 
          success: false, 
          error: 'Insufficient permissions' 
        }, { status: 403 })
      }

      // Fetch payment transaction with relationships
      const paymentTransaction = await db.paymentTransaction.findFirst({
        where: {
          id: params.id,
          procurement: {
            sppgId: session.user.sppgId! // Multi-tenant check
          }
        },
        include: {
          procurement: {
            select: {
              id: true,
              procurementCode: true,
              supplierName: true,
              totalAmount: true,
              paidAmount: true,
              paymentStatus: true,
              paymentDue: true,
            }
          },
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      })

      if (!paymentTransaction) {
        return NextResponse.json({
          success: false,
          error: 'Payment transaction not found or access denied'
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        data: paymentTransaction
      })
    } catch (error) {
      console.error('GET /api/sppg/procurement/payments/[id] error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch payment transaction',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, { status: 500 })
    }
  })
}

// ================================ PUT /api/sppg/procurement/payments/[id] ================================

/**
 * PUT /api/sppg/procurement/payments/[id]
 * Update payment transaction
 * 
 * @rbac Protected by withSppgAuth
 * @audit Automatic logging
 * @security Requires PROCUREMENT_MANAGE permission
 * @param {string} id - Payment transaction ID
 * @body {PaymentTransactionUpdateInput} Updated payment data
 * @returns {Promise<Response>} Updated payment transaction
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withSppgAuth(request, async (session) => {
    try {
      // Permission Check
      if (!session.user.userRole || !hasPermission(session.user.userRole as UserRole, 'PROCUREMENT_MANAGE')) {
        return NextResponse.json({ 
          success: false, 
          error: 'Insufficient permissions' 
        }, { status: 403 })
      }

      // Verify payment transaction exists and belongs to user's SPPG
      const existingPayment = await db.paymentTransaction.findFirst({
        where: {
          id: params.id,
          procurement: {
            sppgId: session.user.sppgId! // Multi-tenant check
          }
        },
        include: {
          procurement: true
        }
      })

      if (!existingPayment) {
        return NextResponse.json({
          success: false,
          error: 'Payment transaction not found or access denied'
        }, { status: 404 })
      }

      // Parse request body
      const body = await request.json()
      
      // Validate input
      const validated = paymentTransactionUpdateSchema.safeParse(body)
      if (!validated.success) {
        return NextResponse.json({
          success: false,
          error: 'Validation failed',
          details: validated.error.flatten().fieldErrors
        }, { status: 400 })
      }

      const data = validated.data

      // If amount is being changed, validate it
      if (data.amount !== undefined && data.amount !== existingPayment.amount) {
        const procurement = existingPayment.procurement
        const otherPaymentsTotal = procurement.paidAmount - existingPayment.amount
        const newTotal = otherPaymentsTotal + data.amount
        
        if (newTotal > procurement.totalAmount) {
          return NextResponse.json({
            success: false,
            error: `New payment amount would exceed procurement total. Maximum allowed: Rp ${(procurement.totalAmount - otherPaymentsTotal).toLocaleString('id-ID')}`
          }, { status: 400 })
        }
      }

      // Update payment transaction
      const updatedPayment = await db.paymentTransaction.update({
        where: { id: params.id },
        data: {
          ...(data.paymentDate && { paymentDate: new Date(data.paymentDate) }),
          ...(data.paymentMethod && { paymentMethod: data.paymentMethod }),
          ...(data.amount !== undefined && { amount: data.amount }),
          ...(data.referenceNumber !== undefined && { referenceNumber: data.referenceNumber }),
          ...(data.bankName !== undefined && { bankName: data.bankName }),
          ...(data.accountNumber !== undefined && { accountNumber: data.accountNumber }),
          ...(data.receiptUrl !== undefined && { receiptUrl: data.receiptUrl }),
          ...(data.notes !== undefined && { notes: data.notes }),
        },
        include: {
          procurement: true
        }
      })

      // Recalculate procurement payment status if amount changed
      if (data.amount !== undefined && data.amount !== existingPayment.amount) {
        const procurement = updatedPayment.procurement
        const amountDifference = data.amount - existingPayment.amount
        const newPaidAmount = procurement.paidAmount + amountDifference
        const newPaymentStatus = newPaidAmount >= procurement.totalAmount 
          ? 'PAID' 
          : newPaidAmount > 0 
            ? 'PARTIALLY_PAID' 
            : 'UNPAID'

        await db.procurement.update({
          where: { id: procurement.id },
          data: {
            paidAmount: newPaidAmount,
            paymentStatus: newPaymentStatus,
          }
        })
      }

      return NextResponse.json({
        success: true,
        data: updatedPayment,
        message: 'Payment transaction updated successfully'
      })
    } catch (error) {
      console.error('PUT /api/sppg/procurement/payments/[id] error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to update payment transaction',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, { status: 500 })
    }
  })
}

// ================================ DELETE /api/sppg/procurement/payments/[id] ================================

/**
 * DELETE /api/sppg/procurement/payments/[id]
 * Delete payment transaction (reverses payment)
 * 
 * @rbac Protected by withSppgAuth
 * @audit Automatic logging
 * @security Requires PROCUREMENT_MANAGE permission
 * @param {string} id - Payment transaction ID
 * @returns {Promise<Response>} Success confirmation
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withSppgAuth(request, async (session) => {
    try {
      // Permission Check
      if (!session.user.userRole || !hasPermission(session.user.userRole as UserRole, 'PROCUREMENT_MANAGE')) {
        return NextResponse.json({ 
          success: false, 
          error: 'Insufficient permissions' 
        }, { status: 403 })
      }

      // Verify payment transaction exists and belongs to user's SPPG
      const paymentTransaction = await db.paymentTransaction.findFirst({
        where: {
          id: params.id,
          procurement: {
            sppgId: session.user.sppgId! // Multi-tenant check
          }
        },
        include: {
          procurement: true
        }
      })

      if (!paymentTransaction) {
        return NextResponse.json({
          success: false,
          error: 'Payment transaction not found or access denied'
        }, { status: 404 })
      }

      // Delete payment transaction
      await db.paymentTransaction.delete({
        where: { id: params.id }
      })

      // Recalculate procurement payment status
      const procurement = paymentTransaction.procurement
      const newPaidAmount = procurement.paidAmount - paymentTransaction.amount
      const newPaymentStatus = newPaidAmount >= procurement.totalAmount 
        ? 'PAID' 
        : newPaidAmount > 0 
          ? 'PARTIALLY_PAID' 
          : 'UNPAID'

      await db.procurement.update({
        where: { id: procurement.id },
        data: {
          paidAmount: newPaidAmount,
          paymentStatus: newPaymentStatus,
        }
      })

      return NextResponse.json({
        success: true,
        message: `Payment transaction deleted successfully. Rp ${paymentTransaction.amount.toLocaleString('id-ID')} reversed from procurement.`
      })
    } catch (error) {
      console.error('DELETE /api/sppg/procurement/payments/[id] error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to delete payment transaction',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, { status: 500 })
    }
  })
}
