/**
 * @fileoverview Orders API Routes - Main CRUD Endpoints
 * Handles listing and creating procurement orders
 * RBAC Integration: Protected by withSppgAuth wrapper
 * 
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { createOrderFormSchema } from '@/features/sppg/procurement/orders/schemas'
import type { ProcurementStatus, UserRole } from '@prisma/client'
import { checkCategoryBudget, logBudgetAlert, type BudgetCheckResult } from '@/lib/budget-tracking'
import { sendApprovalRequestNotification } from '@/lib/notification-service'

// ============================================================================
// GET /api/sppg/procurement/orders - List Orders
// ============================================================================

/**
 * @rbac Protected by withSppgAuth
 * @audit Automatic logging
 */
export async function GET(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // Parse Query Parameters
      const { searchParams } = new URL(request.url)
      const page = parseInt(searchParams.get('page') || '1')
      const pageSize = parseInt(searchParams.get('pageSize') || '10')
      const search = searchParams.get('search') || undefined
      const status = searchParams.get('status')?.split(',') as ProcurementStatus[] | undefined
      const supplierId = searchParams.get('supplierId') || undefined
      const planId = searchParams.get('planId') || undefined
      const dateFrom = searchParams.get('dateFrom') || undefined
      const dateTo = searchParams.get('dateTo') || undefined

      // Build WHERE Clause with Multi-tenant Filter
      const where: {
        sppgId: string
        OR?: Array<{ procurementCode: { contains: string; mode: 'insensitive' } } | { supplierName: { contains: string; mode: 'insensitive' } }>
        status?: { in: ProcurementStatus[] }
        supplierId?: string
        planId?: string
        procurementDate?: {
          gte?: Date
          lte?: Date
        }
      } = {
        sppgId: session.user.sppgId!, // CRITICAL: Multi-tenant filtering
      }

      // Search filter
      if (search) {
        where.OR = [
          { procurementCode: { contains: search, mode: 'insensitive' } },
          { supplierName: { contains: search, mode: 'insensitive' } },
        ]
      }

      // Status filter
      if (status && status.length > 0) {
        where.status = { in: status }
      }

      // Supplier filter
      if (supplierId) {
        where.supplierId = supplierId
      }

      // Plan filter
      if (planId) {
        where.planId = planId
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

      // Fetch Orders with Pagination
      const [orders, totalItems] = await Promise.all([
        db.procurement.findMany({
          where,
          include: {
            items: {
              include: {
                inventoryItem: {
                  select: {
                    id: true,
                    itemName: true,
                    unit: true,
                    category: true,
                  },
                },
              },
            },
            plan: {
              select: {
                id: true,
                planName: true,
              },
          },
        },
        orderBy: {
          procurementDate: 'desc',
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.procurement.count({ where }),
    ])

    // Calculate Pagination
    const totalPages = Math.ceil(totalItems / pageSize)

    // Return Response
    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          pageSize,
          totalItems,
          totalPages,
        },
      },
    })
    } catch (error) {
      console.error('GET /api/sppg/procurement/orders error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch orders',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}

// ============================================================================
// POST /api/sppg/procurement/orders - Create Order
// ============================================================================

/**
 * @rbac Protected by withSppgAuth
 * @audit Automatic logging
 */
export async function POST(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // Parse Request Body
      const body = await request.json()

      // Validation with Zod
      const validated = createOrderFormSchema.safeParse(body)
      if (!validated.success) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation failed',
            details: validated.error.format(),
          },
          { status: 400 }
        )
      }

      const data = validated.data

      // Generate Order Code
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      
      // Get count for this month
      const startOfMonth = new Date(year, now.getMonth(), 1)
      const endOfMonth = new Date(year, now.getMonth() + 1, 0, 23, 59, 59)
      
      const count = await db.procurement.count({
        where: {
          sppgId: session.user.sppgId!,
          procurementDate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      })
      
      const sequence = String(count + 1).padStart(4, '0')
      const procurementCode = `ORD-${year}${month}-${sequence}`

      // Convert string dates to Date objects
      const procurementDate = new Date(data.procurementDate)
      const expectedDelivery = data.expectedDelivery ? new Date(data.expectedDelivery) : null
      const paymentDue = data.paymentDue ? new Date(data.paymentDue) : null

      // Calculate totals
      const subtotalAmount = data.items.reduce((sum, item) => {
        return sum + (item.orderedQuantity * item.pricePerUnit)
      }, 0)

      const taxAmount = (subtotalAmount * 0.11) // Default 11% PPN
      const discountAmount = 0
      const shippingCost = data.transportCost || 0
      const totalAmount = subtotalAmount + taxAmount - discountAmount + shippingCost

      // ============================================================================
      // Phase 1.1: Fetch Procurement Settings for Auto-Approve & Default Values
      // ============================================================================
      const settings = await db.procurementSettings.findUnique({
        where: { sppgId: session.user.sppgId! },
      })

      // Determine initial status based on auto-approve threshold
      let initialStatus: ProcurementStatus = 'DRAFT'
      
      if (settings?.autoApproveThreshold && totalAmount <= settings.autoApproveThreshold) {
        // Auto-approve if total amount is below or equal to threshold
        initialStatus = 'APPROVED'
        console.log(`[Auto-Approve] Order ${procurementCode} auto-approved: ${totalAmount} <= ${settings.autoApproveThreshold}`)
      } else {
        // Require manual approval if above threshold or no threshold set
        initialStatus = 'PENDING_APPROVAL'
        console.log(`[Manual Approval] Order ${procurementCode} pending approval: ${totalAmount} ${settings?.autoApproveThreshold ? `> ${settings.autoApproveThreshold}` : '(no threshold)'}`)
      }

      // Use default payment term if not provided and settings exist
      const finalPaymentTerms = data.paymentTerms || settings?.defaultPaymentTerm || null

      // ============================================================================
      // Phase 3.1 & 3.2: Budget Validation Before Order Creation
      // ============================================================================
      
      // Group items by category and check budget for each
      const categoryTotals = new Map<string, number>()
      
      for (const item of data.items) {
        const category = item.category
        const itemTotal = item.orderedQuantity * item.pricePerUnit
        const currentTotal = categoryTotals.get(category) || 0
        categoryTotals.set(category, currentTotal + itemTotal)
      }

      // Check budget for each category
      const budgetChecks: Array<{ category: string; result: BudgetCheckResult }> = []
      
      for (const [category, amount] of categoryTotals.entries()) {
        const budgetCheck = await checkCategoryBudget(
          session.user.sppgId!,
          category,
          amount
        )
        
        budgetChecks.push({ category, result: budgetCheck })
        
        // If budget exceeded, return error immediately
        if (!budgetCheck.allowed) {
          return NextResponse.json(
            {
              success: false,
              error: budgetCheck.message,
              details: {
                category,
                ...budgetCheck.details,
              },
            },
            { status: 400 }
          )
        }
        
        // Phase 3.3: Log budget alert if threshold reached
        if (budgetCheck.details?.shouldAlert) {
          await logBudgetAlert(session.user.sppgId!, budgetCheck.details)
        }
      }

      // Create Order with Items (Transaction)
      const order = await db.$transaction(async (tx) => {
        // Create main order
        const newOrder = await tx.procurement.create({
          data: {
            sppgId: session.user.sppgId!,
            planId: data.planId || null,
            procurementCode,
            procurementDate,
            expectedDelivery,
            supplierId: data.supplierId,
            supplierName: data.supplierName || null,
            supplierContact: data.supplierContact || null,
            purchaseMethod: data.purchaseMethod,
            paymentTerms: finalPaymentTerms, // ✅ Use default from settings if available
          paymentDue,
          subtotalAmount,
          taxAmount,
          discountAmount,
          shippingCost,
          totalAmount,
          paidAmount: 0,
          paymentStatus: 'UNPAID',
          status: initialStatus, // ✅ Use calculated status (DRAFT, PENDING_APPROVAL, or APPROVED)
          deliveryStatus: 'PENDING',
          deliveryMethod: data.deliveryMethod || null,
          transportCost: data.transportCost || null,
          packagingType: data.packagingType || null,
        },
        include: {
          items: {
            include: {
              inventoryItem: true,
            },
          },
          plan: true,
        },
      })

      // Create order items
      if (data.items && data.items.length > 0) {
        await tx.procurementItem.createMany({
          data: data.items.map((item) => {
            const itemTotal = item.orderedQuantity * item.pricePerUnit
            const discount = itemTotal * (item.discountPercent || 0) / 100
            
            return {
              procurementId: newOrder.id,
              inventoryItemId: item.inventoryItemId || undefined,
              itemName: item.itemName,
              itemCode: item.itemCode || undefined,
              category: item.category,
              brand: item.brand || undefined,
              orderedQuantity: item.orderedQuantity,
              unit: item.unit,
              pricePerUnit: item.pricePerUnit,
              totalPrice: itemTotal,
              discountPercent: item.discountPercent || 0,
              discountAmount: discount,
              finalPrice: itemTotal - discount,
              qualityStandard: item.qualityStandard || undefined,
              gradeRequested: item.gradeRequested || undefined,
              expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined,
              storageRequirement: item.storageRequirement || undefined,
              notes: item.notes || undefined,
            }
          }),
        })
      }

      // Create audit log
      await tx.auditLog.create({
        data: {
          sppgId: session.user.sppgId!,
          userId: session.user.id,
          action: 'CREATE',
          entityType: 'PROCUREMENT',
          entityId: newOrder.id,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      })

      return newOrder
    })

      // ============================================================================
      // Phase 4.4 Option C: Send Approval Request Notification
      // ============================================================================
      
      // Only send notification if order requires approval
      if (order.status === 'PENDING_APPROVAL') {
        try {
          // Query approval level that matches order total amount
          const approvalLevel = await db.procurementApprovalLevel.findFirst({
            where: {
              settings: {
                sppgId: session.user.sppgId!,
              },
              isActive: true,
              minAmount: { lte: totalAmount },
              OR: [
                { maxAmount: { gte: totalAmount } },
                { maxAmount: null }, // Unlimited
              ],
            },
            orderBy: [
              { level: 'asc' }, // Get first level approval
            ],
            include: {
              settings: {
                select: {
                  approvalNotificationWhatsapp: true,
                  approvalNotificationEmail: true,
                },
              },
            },
          })

          if (approvalLevel) {
            // Query users with required role who can approve
            const approvers = await db.user.findMany({
              where: {
                sppgId: session.user.sppgId!,
                userRole: approvalLevel.requiredRole as UserRole,
                isActive: true,
              },
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            })

            // Build recipients array (users with phone or email)
            const recipients = approvers
              .map(user => ({
                phone: user.phone || undefined,
                email: user.email || undefined,
                name: user.name || 'Approver',
              }))
              .filter(r => r.phone || r.email) // At least one contact method

            // Send approval request notification
            if (recipients.length > 0) {
              await sendApprovalRequestNotification(
                session.user.sppgId!,
                order.id,
                recipients
              )

              console.log(
                `[Approval Request] Notification sent to ${recipients.length} approver(s) ` +
                `for order ${order.procurementCode} (${approvalLevel.levelName})`
              )
            } else {
              console.warn(
                `[Approval Request] No approvers found with contact info for role ${approvalLevel.requiredRole}`
              )
            }
          } else {
            console.warn(
              `[Approval Request] No approval level configured for amount ${totalAmount}`
            )
          }
        } catch (notificationError) {
          // Log error but don't fail order creation
          console.error(
            '[Approval Request] Failed to send notification:',
            notificationError
          )
        }
      }

      // Return Success Response
      return NextResponse.json(
        {
          success: true,
          data: order,
          message: 'Order created successfully',
        },
        { status: 201 }
      )
    } catch (error) {
      console.error('POST /api/sppg/procurement/orders error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create order',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}
