/**
 * @fileoverview Procurement Items API - List & Create
 * GET: List all items in procurement order
 * POST: Add new item to procurement order
 * 
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.18.0
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { createItemSchema, itemFilterSchema } from '@/features/sppg/procurement/items/schemas/itemSchema'
import type { InventoryCategory } from '@prisma/client'

// ============================================================================
// GET /api/sppg/procurement/orders/[id]/items - List Items
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id: orderId } = await params

      // Verify order exists and belongs to SPPG
      const order = await db.procurement.findFirst({
        where: {
          id: orderId,
          sppgId: session.user.sppgId!, // Multi-tenant check
        },
      })

      if (!order) {
        return NextResponse.json(
          { success: false, error: 'Procurement order not found' },
          { status: 404 }
        )
      }

      // Parse filters with null handling
      const { searchParams } = new URL(request.url)
      const filterResult = itemFilterSchema.safeParse({
        category: searchParams.get('category') || undefined,
        isAccepted: searchParams.get('isAccepted') || undefined,
        hasQualityIssues: searchParams.get('hasQualityIssues') || undefined,
        search: searchParams.get('search') || undefined,
      })

      if (!filterResult.success) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid filter parameters',
            details: filterResult.error.issues
          },
          { status: 400 }
        )
      }

      const filters = filterResult.data

      // Build WHERE clause
      const where: {
        procurementId: string
        category?: InventoryCategory
        isAccepted?: boolean
        OR?: Array<{
          itemName?: { contains: string; mode: 'insensitive' }
          itemCode?: { contains: string; mode: 'insensitive' }
          brand?: { contains: string; mode: 'insensitive' }
        }>
        rejectionReason?: { not: null }
      } = {
        procurementId: orderId,
      }

      if (filters.category) {
        where.category = filters.category
      }

      if (filters.isAccepted !== undefined) {
        where.isAccepted = filters.isAccepted
      }

      if (filters.hasQualityIssues) {
        where.rejectionReason = { not: null }
      }

      if (filters.search) {
        where.OR = [
          { itemName: { contains: filters.search, mode: 'insensitive' } },
          { itemCode: { contains: filters.search, mode: 'insensitive' } },
          { brand: { contains: filters.search, mode: 'insensitive' } },
        ]
      }

      // Fetch items
      const items = await db.procurementItem.findMany({
        where,
        include: {
          inventoryItem: {
            select: {
              id: true,
              itemName: true,
              itemCode: true,
              category: true,
              currentStock: true,
              minStock: true,
              unit: true,
            },
          },
          procurement: {
            select: {
              id: true,
              procurementCode: true,
              procurementDate: true,
              status: true,
              supplierName: true,
            },
          },
        },
        orderBy: [
          { category: 'asc' },
          { itemName: 'asc' },
        ],
      })

      return NextResponse.json({
        success: true,
        data: items,
        meta: {
          total: items.length,
          orderId,
          orderCode: order.procurementCode,
        },
      })
    } catch (error) {
      console.error('[GET /api/sppg/procurement/orders/[id]/items] Error:', error)
      
      if (error instanceof Error && error.message.includes('Zod')) {
        return NextResponse.json(
          { success: false, error: 'Invalid filter parameters' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { success: false, error: 'Failed to fetch procurement items' },
        { status: 500 }
      )
    }
  })
}

// ============================================================================
// POST /api/sppg/procurement/orders/[id]/items - Create Item
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id: orderId } = await params

      // Verify order exists and belongs to SPPG
      const order = await db.procurement.findFirst({
        where: {
          id: orderId,
          sppgId: session.user.sppgId!,
        },
      })

      if (!order) {
        return NextResponse.json(
          { success: false, error: 'Procurement order not found' },
          { status: 404 }
        )
      }

      // Only allow adding items to DRAFT or PENDING orders
      if (!['DRAFT', 'PENDING'].includes(order.status)) {
        return NextResponse.json(
          { success: false, error: 'Cannot add items to orders with status: ' + order.status },
          { status: 400 }
        )
      }

      // Parse and validate request body
      const body = await request.json()
      const validated = createItemSchema.parse(body)

      // Fetch inventory item to get snapshot data
      const inventoryItem = await db.inventoryItem.findFirst({
        where: {
          id: validated.inventoryItemId,
          sppgId: session.user.sppgId!,
        },
        select: {
          id: true,
          itemName: true,
          itemCode: true,
          category: true,
          brand: true,
          unit: true,
          calories: true,
          protein: true,
          fat: true,
          carbohydrates: true,
        },
      })

      if (!inventoryItem) {
        return NextResponse.json(
          { success: false, error: 'Inventory item not found' },
          { status: 404 }
        )
      }

      // Calculate pricing
      const totalPrice = validated.orderedQuantity * validated.pricePerUnit
      const discountAmount = (totalPrice * validated.discountPercent!) / 100
      const finalPrice = totalPrice - discountAmount

      // Create procurement item with snapshot data
      const item = await db.procurementItem.create({
        data: {
          procurementId: orderId,
          inventoryItemId: inventoryItem.id,
          
          // Snapshot from inventory item
          itemName: inventoryItem.itemName,
          itemCode: inventoryItem.itemCode,
          category: inventoryItem.category,
          brand: inventoryItem.brand,
          
          // Order details
          orderedQuantity: validated.orderedQuantity,
          unit: inventoryItem.unit,
          pricePerUnit: validated.pricePerUnit,
          totalPrice,
          discountPercent: validated.discountPercent!,
          discountAmount,
          finalPrice,
          
          // Quality & storage
          qualityStandard: validated.qualityStandard,
          gradeRequested: validated.gradeRequested,
          expiryDate: validated.expiryDate,
          storageRequirement: validated.storageRequirement,
          
          // Nutritional snapshot (from InventoryItem - per 100g values)
          caloriesPer100g: inventoryItem.calories,
          proteinPer100g: inventoryItem.protein,
          fatPer100g: inventoryItem.fat,
          carbsPer100g: inventoryItem.carbohydrates,
          
          notes: validated.notes,
        },
        include: {
          inventoryItem: {
            select: {
              id: true,
              itemName: true,
              itemCode: true,
              category: true,
              currentStock: true,
              minStock: true,
              unit: true,
            },
          },
          procurement: {
            select: {
              id: true,
              procurementCode: true,
              procurementDate: true,
              status: true,
              supplierName: true,
            },
          },
        },
      })

      // Update order totals
      const allItems = await db.procurementItem.findMany({
        where: { procurementId: orderId },
      })

      const updatedSubtotal = allItems.reduce((sum, item) => sum + item.totalPrice, 0)
      const updatedDiscount = allItems.reduce((sum, item) => sum + item.discountAmount, 0)
      const updatedTotal = allItems.reduce((sum, item) => sum + item.finalPrice, 0)

      await db.procurement.update({
        where: { id: orderId },
        data: {
          subtotalAmount: updatedSubtotal,
          discountAmount: updatedDiscount,
          totalAmount: updatedTotal + order.taxAmount + order.shippingCost,
        },
      })

      return NextResponse.json(
        {
          success: true,
          data: item,
          message: 'Item added successfully',
        },
        { status: 201 }
      )
    } catch (error) {
      console.error('[POST /api/sppg/procurement/orders/[id]/items] Error:', error)
      
      if (error instanceof Error) {
        if (error.message.includes('Zod')) {
          return NextResponse.json(
            { success: false, error: 'Validation failed', details: error.message },
            { status: 400 }
          )
        }
      }

      return NextResponse.json(
        { success: false, error: 'Failed to create procurement item' },
        { status: 500 }
      )
    }
  })
}
