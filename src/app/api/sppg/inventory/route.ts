/**
 * @fileoverview Inventory Management API Routes - List & Create
 * @module api/sppg/inventory
 * @description Handles GET (list with filters) and POST (create) operations for inventory items
 * @requires Auth.js v5 - Authentication
 * @requires Prisma - Database operations
 * @requires Zod - Request validation
 * 
 * RBAC Integration:
 * - GET/POST: Protected by withSppgAuth
 * - Automatic audit logging
 * - Multi-tenant: Inventory ownership verified
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { hasPermission } from '@/lib/permissions'
import type { Prisma } from '@prisma/client'
import { UserRole, InventoryCategory } from '@prisma/client'
import { 
  createInventorySchema, 
  inventoryFiltersSchema 
} from '@/features/sppg/inventory/schemas'

/**
 * GET /api/sppg/inventory
 * @rbac Protected by withSppgAuth
 * @audit Automatic logging
 * @security Requires INVENTORY_VIEW permission
 */
export async function GET(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // Permission Check
      const hasInventoryPermission = session.user.userRole && hasPermission(session.user.userRole as UserRole, 'INVENTORY_VIEW')
      
      if (!hasInventoryPermission) {
        return NextResponse.json({ 
          error: 'Insufficient permissions',
          message: 'Anda tidak memiliki akses untuk melihat inventori'
        }, { status: 403 })
      }

      // Parse and validate query parameters
      const { searchParams } = new URL(request.url)
      
      // Parse category with validation (match Prisma enum exactly)
      const categoryParam = searchParams.get('category')
      const validCategories = ['PROTEIN', 'KARBOHIDRAT', 'SAYURAN', 'BUAH', 'SUSU_OLAHAN', 'BUMBU_REMPAH', 'MINYAK_LEMAK', 'LAINNYA']
      const category = categoryParam && validCategories.includes(categoryParam) 
        ? categoryParam as InventoryCategory 
        : undefined
    
    const filters = {
      search: searchParams.get('search') || undefined,
      category,
      stockStatus: searchParams.get('stockStatus') || undefined,
      storageLocation: searchParams.get('storageLocation') || undefined,
      supplierId: searchParams.get('supplierId') || undefined,
      isActive: searchParams.get('isActive') === 'true' ? true : 
                searchParams.get('isActive') === 'false' ? false : undefined,
      page: parseInt(searchParams.get('page') || '1'),
      pageSize: parseInt(searchParams.get('pageSize') || '10'),
    }

    console.log('📋 [Inventory API] Filters to validate:', JSON.stringify(filters, null, 2))

    const validated = inventoryFiltersSchema.safeParse(filters)
    if (!validated.success) {
      console.error('❌ [Inventory API] Validation failed:', JSON.stringify(validated.error.issues, null, 2))
      return NextResponse.json({ 
        error: 'Invalid filters',
        details: validated.error.issues,
        receivedFilters: filters
      }, { status: 400 })
    }

    console.log('✅ [Inventory API] Validation passed:', JSON.stringify(validated.data, null, 2))

    // 5. Build where clause for Prisma query
    const where: Record<string, unknown> = {
      sppgId: session.user.sppgId, // CRITICAL: Multi-tenant filtering
    }

    // Apply filters
    if (validated.data.search) {
      where.OR = [
        { itemName: { contains: validated.data.search, mode: 'insensitive' } },
        { itemCode: { contains: validated.data.search, mode: 'insensitive' } },
        { brand: { contains: validated.data.search, mode: 'insensitive' } },
      ]
    }

    if (validated.data.category) {
      where.category = validated.data.category
    }

    if (validated.data.isActive !== undefined) {
      where.isActive = validated.data.isActive
    }

    if (validated.data.storageLocation) {
      where.storageLocation = { contains: validated.data.storageLocation, mode: 'insensitive' }
    }

    if (validated.data.supplierId) {
      where.preferredSupplierId = validated.data.supplierId
    }

    // Handle stock status filtering
    if (validated.data.stockStatus && validated.data.stockStatus !== 'ALL') {
      if (validated.data.stockStatus === 'OUT_OF_STOCK') {
        where.currentStock = { lte: 0 }
      } else if (validated.data.stockStatus === 'LOW_STOCK') {
        // Low stock: currentStock > 0 AND currentStock <= minStock
        // We'll filter this in memory after fetch since Prisma doesn't support
        // comparing two fields directly in where clause
      } else if (validated.data.stockStatus === 'IN_STOCK') {
        where.currentStock = { gt: 0 }
      }
    }

    // 6. Execute query with pagination
    const skip = (validated.data.page - 1) * validated.data.pageSize
    const take = validated.data.pageSize

    const [items, total] = await Promise.all([
      db.inventoryItem.findMany({
        where,
        include: {
          foodCategory: {
            select: {
              id: true,
              categoryCode: true,
              categoryName: true,
              colorCode: true,
              iconName: true
            }
          },
          preferredSupplier: {
            select: {
              id: true,
              supplierName: true,
              primaryContact: true,
              phone: true,
            }
          },
          stockMovements: {
            orderBy: { movedAt: 'desc' },
            take: 1,
            select: {
              id: true,
              movementType: true,
              quantity: true,
              movedAt: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      db.inventoryItem.count({ where })
    ])

    // 7. Post-process filtering for LOW_STOCK (Prisma limitation)
    let filteredItems = items
    if (validated.data.stockStatus === 'LOW_STOCK') {
      filteredItems = items.filter(item => 
        item.currentStock > 0 && item.currentStock <= item.minStock
      )
    }

    // 8. Calculate metadata
    const totalPages = Math.ceil(total / validated.data.pageSize)
    const hasNextPage = validated.data.page < totalPages
    const hasPreviousPage = validated.data.page > 1

    return NextResponse.json({
      success: true,
      data: filteredItems,
      meta: {
        total,
        page: validated.data.page,
        pageSize: validated.data.pageSize,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Terjadi kesalahan saat mengambil data inventori',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
  })
}

/**
 * POST /api/sppg/inventory
 * @rbac Protected by withSppgAuth
 * @audit Automatic logging
 * @security Requires INVENTORY_MANAGE permission
 */
export async function POST(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // Permission Check
      if (!session.user.userRole || !hasPermission(session.user.userRole as UserRole, 'INVENTORY_MANAGE')) {
        return NextResponse.json({ 
          error: 'Insufficient permissions',
          message: 'Anda tidak memiliki akses untuk mengelola inventori'
        }, { status: 403 })
      }

      // Parse and validate request body
      const body = await request.json()
      const validated = createInventorySchema.safeParse(body)
    
    if (!validated.success) {
      return NextResponse.json({ 
        error: 'Validation failed',
        message: 'Data tidak valid',
        details: validated.error.issues
      }, { status: 400 })
    }

    // 5. Check for duplicate item code
    if (validated.data.itemCode) {
      const existing = await db.inventoryItem.findFirst({
        where: {
          itemCode: validated.data.itemCode,
          sppgId: session.user.sppgId!,
        }
      })

      if (existing) {
        return NextResponse.json({
          error: 'Duplicate item code',
          message: `Kode item "${validated.data.itemCode}" sudah digunakan`
        }, { status: 409 })
      }
    }

    // 6. Verify supplier if provided
    if (validated.data.preferredSupplierId) {
      const supplier = await db.supplier.findFirst({
        where: {
          id: validated.data.preferredSupplierId,
          sppgId: session.user.sppgId!, // Multi-tenant check
        }
      })

      if (!supplier) {
        return NextResponse.json({
          error: 'Supplier not found',
          message: 'Supplier tidak ditemukan'
        }, { status: 404 })
      }
    }

    // 7. Create inventory item
    const item = await db.inventoryItem.create({
      data: {
        ...validated.data,
        sppgId: session.user.sppgId!, // CRITICAL: Multi-tenant assignment
      },
      include: {
        preferredSupplier: {
          select: {
            id: true,
            supplierName: true,
            primaryContact: true,
            phone: true,
          }
        }
      }
    })

    // 8. Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        sppgId: session.user.sppgId,
        action: 'CREATE',
        entityType: 'InventoryItem',
        entityId: item.id,
        description: `Created inventory item: ${item.itemName}`,
        newValues: {
          itemName: item.itemName,
          category: item.category,
        } as Prisma.InputJsonValue,
      }
    })

    return NextResponse.json({ 
      success: true, 
      data: item,
      message: 'Item inventori berhasil dibuat'
    }, { status: 201 })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Terjadi kesalahan saat membuat item inventori',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
  })
}
