/**
 * @fileoverview Receipt API Routes - GET (list) & POST (create)
 * RBAC Integration: Protected by withSppgAuth wrapper
 * 
 * @version Next.js 15.5.4 / API Routes / Enterprise-grade
 * @author Bagizi-ID Development Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { createReceiptSchema } from '@/features/sppg/procurement/receipts/schemas'
import { ZodError } from 'zod'
import { Prisma, QualityGrade } from '@prisma/client'

// ================================ GET - List Receipts ================================

/**
 * @rbac Protected by withSppgAuth
 * @audit Automatic logging
 */
export async function GET(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // Parse Query Parameters
      const { searchParams } = new URL(request.url)
      const supplierId = searchParams.get('supplierId')
      const deliveryStatus = searchParams.get('deliveryStatus')
      const qualityGrade = searchParams.get('qualityGrade')
      const dateFrom = searchParams.get('dateFrom')
      const dateTo = searchParams.get('dateTo')
      const inspectedBy = searchParams.get('inspectedBy')
      const searchTerm = searchParams.get('searchTerm')
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '10')
      const sortField = searchParams.get('sortField') || 'actualDelivery'
      const sortDirection = searchParams.get('sortDirection') || 'desc'

      // Build Filter Conditions
      const where: Prisma.ProcurementWhereInput = {
        sppgId: session.user.sppgId!,
        deliveryStatus: {
          in: ['DELIVERED', 'PARTIAL'], // Only show delivered items
        },
      }

      if (supplierId && supplierId !== 'all') {
        where.supplierId = supplierId
      }

      if (deliveryStatus && deliveryStatus !== 'all') {
        where.deliveryStatus = deliveryStatus
      }

      if (qualityGrade && qualityGrade !== 'all') {
        where.qualityGrade = qualityGrade as QualityGrade // Fixed: Use direct QualityGrade enum
      }

      if (dateFrom || dateTo) {
        where.actualDelivery = {}
        if (dateFrom) {
          where.actualDelivery.gte = new Date(dateFrom)
        }
        if (dateTo) {
          where.actualDelivery.lte = new Date(dateTo)
        }
      }

      if (inspectedBy) {
        where.inspectedBy = {
          contains: inspectedBy,
          mode: 'insensitive',
        }
      }

      if (searchTerm) {
        where.OR = [
          {
            procurementCode: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            receiptNumber: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        ]
      }

      // Execute Query with Pagination
      const [receipts, total] = await Promise.all([
        db.procurement.findMany({
          where,
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
          // TODO: Add qualityControl relation after schema migration
          // qualityControl: { ... }
        },
        orderBy: {
          [sortField]: sortDirection,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.procurement.count({ where }),
    ])

    // 6. Calculate Pagination Metadata
    const totalPages = Math.ceil(total / limit)
    const hasMore = page < totalPages

    return NextResponse.json({
      success: true,
      data: receipts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore,
      },
    })
    } catch (error) {
      console.error('GET /api/sppg/procurement/receipts error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch receipts',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}

// ================================ POST - Create Receipt ================================

/**
 * @rbac Protected by withSppgAuth
 * @audit Automatic logging
 */
export async function POST(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
    // 3. Parse Request Body
    const body = await request.json()

    // 4. Validate with Zod
    const validated = createReceiptSchema.parse(body)

    // 5. Verify Procurement exists and belongs to SPPG
    const procurement = await db.procurement.findFirst({
      where: {
        id: validated.procurementId,
        sppgId: session.user.sppgId!,
      },
      include: {
        items: true,
      },
    })

    if (!procurement) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Procurement not found or access denied' 
        },
        { status: 404 }
      )
    }

    // 6. Create Receipt (Update Procurement) with Transaction
    const updatedReceipt = await db.$transaction(async (tx: Prisma.TransactionClient) => {
      // Update procurement with receipt data
      const updated = await tx.procurement.update({
        where: { id: validated.procurementId },
        data: {
          actualDelivery: validated.actualDelivery,
          receiptNumber: validated.receiptNumber,
          receiptPhoto: validated.receiptPhoto,
          deliveryPhoto: validated.deliveryPhoto,
          deliveryStatus: 'DELIVERED',
          deliveryMethod: validated.deliveryMethod,
          transportCost: validated.transportCost,
          packagingType: validated.packagingType,
          invoiceNumber: validated.invoiceNumber,
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
      })

      // Update individual items with received quantities, batch, expiry
      for (const itemData of validated.items) {
        await tx.procurementItem.update({
          where: { id: itemData.itemId },
          data: {
            receivedQuantity: itemData.receivedQuantity,
            batchNumber: itemData.batchNumber,
            expiryDate: itemData.expiryDate,
            productionDate: itemData.productionDate,
            notes: itemData.notes,
          },
        })
      }

      return updated
    })

    // 7. Log Activity
    await db.auditLog.create({
      data: {
        sppgId: session.user.sppgId,
        userId: session.user.id,
        action: 'CREATE',
        entityType: 'RECEIPT', // Fixed: entity → entityType
        entityId: updatedReceipt.id,
        description: `Penerimaan barang baru: ${updatedReceipt.procurementCode}`,
        metadata: {
          receiptNumber: validated.receiptNumber,
          actualDelivery: validated.actualDelivery,
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: updatedReceipt,
        message: 'Penerimaan barang berhasil dicatat',
      },
      { status: 201 }
    )
    } catch (error) {
      console.error('POST /api/sppg/procurement/receipts error:', error)

      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation failed',
            details: error.issues,
          },
          { status: 400 }
        )
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create receipt',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}
