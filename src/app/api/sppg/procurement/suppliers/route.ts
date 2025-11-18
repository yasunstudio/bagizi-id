/**
 * @fileoverview Suppliers API endpoints - Main CRUD operations
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Enterprise Development Guidelines
 * 
 * RBAC Integration:
 * - GET/POST: Protected by withSppgAuth
 * - Automatic audit logging
 * - Multi-tenant: Supplier ownership verified
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { canManageSupplier } from '@/lib/permissions'
import { UserRole } from '@prisma/client'
import { 
  supplierCreateSchema, 
  supplierFiltersSchema
} from '@/features/sppg/procurement/suppliers/schemas'

// ================================ GET /api/sppg/procurement/suppliers ================================

/**
 * @rbac Protected by withSppgAuth
 * @audit Automatic logging
 */
export async function GET(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // Parse and validate query parameters
    const url = new URL(request.url)
    const queryParams = Object.fromEntries(url.searchParams)
    
    // Convert string values to appropriate types
    const processedParams = {
      ...queryParams,
      page: queryParams.page ? parseInt(queryParams.page) : undefined,
      limit: queryParams.limit ? parseInt(queryParams.limit) : undefined,
      minRating: queryParams.minRating ? parseFloat(queryParams.minRating) : undefined,
      isActive: queryParams.isActive ? queryParams.isActive === 'true' : undefined,
      isPreferred: queryParams.isPreferred ? queryParams.isPreferred === 'true' : undefined,
      supplierType: queryParams.supplierType ? queryParams.supplierType.split(',') : undefined,
      category: queryParams.category ? queryParams.category.split(',') : undefined,
      city: queryParams.city ? queryParams.city.split(',') : undefined,
      province: queryParams.province ? queryParams.province.split(',') : undefined,
      partnershipLevel: queryParams.partnershipLevel ? queryParams.partnershipLevel.split(',') : undefined,
      complianceStatus: queryParams.complianceStatus ? queryParams.complianceStatus.split(',') : undefined,
    }

    const filters = supplierFiltersSchema.parse(processedParams)

    // 4. Build database query with multi-tenant filtering
    const where = {
      // Multi-tenant: Only get suppliers from user's SPPG
      sppgId: session.user.sppgId!,
      
      // Apply filters
      ...(filters.search && {
        OR: [
          { supplierName: { contains: filters.search, mode: 'insensitive' as const } },
          { supplierCode: { contains: filters.search, mode: 'insensitive' as const } },
          { businessName: { contains: filters.search, mode: 'insensitive' as const } },
          { phone: { contains: filters.search } },
          { email: { contains: filters.search, mode: 'insensitive' as const } }
        ]
      }),
      ...(filters.supplierType && { supplierType: { in: filters.supplierType } }),
      ...(filters.category && { category: { in: filters.category } }),
      ...(filters.city && { city: { in: filters.city } }),
      ...(filters.province && { province: { in: filters.province } }),
      ...(filters.isActive !== undefined && { isActive: filters.isActive }),
      ...(filters.isPreferred !== undefined && { isPreferred: filters.isPreferred }),
      ...(filters.minRating && { overallRating: { gte: filters.minRating } }),
      ...(filters.partnershipLevel && { partnershipLevel: { in: filters.partnershipLevel } }),
      ...(filters.complianceStatus && { complianceStatus: { in: filters.complianceStatus } })
    }

    // 5. Execute queries with pagination
    const [suppliers, total] = await Promise.all([
      db.supplier.findMany({
        where,
        include: {
          sppg: {
            select: {
              id: true,
              name: true
            }
          },
          procurements: {
            select: {
              id: true,
              totalAmount: true,
              status: true,
              procurementDate: true
            },
            orderBy: {
              procurementDate: 'desc'
            },
            take: 5 // Last 5 procurements
          },
          _count: {
            select: {
              procurements: true,
              supplierContracts: true,
              supplierProducts: true
            }
          }
        },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        orderBy: {
          [filters.sortBy]: filters.sortOrder
        }
      }),
      db.supplier.count({ where })
    ])

    // 6. Transform response with computed fields
    const transformedSuppliers = suppliers.map(supplier => {
      const totalActiveContracts = supplier._count?.supplierContracts || 0
      const recentProcurements = supplier.procurements || []
      const averageOrderValue = supplier.totalOrders > 0 ? supplier.totalPurchaseValue / supplier.totalOrders : 0
      const lastOrderDate = recentProcurements.length > 0 ? recentProcurements[0].procurementDate : null
      
      // Calculate performance score (0-100)
      const performanceScore = Math.round(
        (supplier.overallRating / 5 * 30) + // 30% weight
        (supplier.qualityRating / 5 * 25) + // 25% weight
        (supplier.deliveryRating / 5 * 25) + // 25% weight
        (supplier.serviceRating / 5 * 20) // 20% weight
      )

      return {
        ...supplier,
        totalActiveContracts,
        averageOrderValue: Math.round(averageOrderValue),
        lastOrderDate,
        performanceScore,
        // Remove sensitive data
        encryptedBankDetails: undefined,
        encryptedContracts: undefined
      }
    })

    // 7. Success response with pagination
    return NextResponse.json({
      success: true,
      data: transformedSuppliers,
      pagination: {
        total,
        page: filters.page,
        pageSize: filters.limit,
        totalPages: Math.ceil(total / filters.limit)
      }
    })

  } catch (error) {
    console.error('GET /api/sppg/procurement/suppliers error:', error)
    
    // Validation error
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid query parameters',
        details: error 
      }, { status: 400 })
    }

    // Internal server error
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch suppliers',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 })
    }
  })
}

// ================================ POST /api/sppg/procurement/suppliers ================================

/**
 * @rbac Protected by withSppgAuth
 * @audit Automatic logging
 */
export async function POST(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // RBAC Check - Only users with SUPPLIER_MANAGE permission can create
      if (!session.user.userRole || !canManageSupplier(session.user.userRole as UserRole)) {
        return NextResponse.json({ 
          success: false, 
          error: 'Insufficient permissions',
          message: 'You do not have permission to create suppliers'
        }, { status: 403 })
      }

    // 4. Parse and validate request body
    const body = await request.json()
    const validated = supplierCreateSchema.parse(body)

    // 5. Generate unique supplier code
    const count = await db.supplier.count({
      where: {
        sppgId: session.user.sppgId!
      }
    })

    const supplierCode = `SUP-${String(count + 1).padStart(5, '0')}`

    // 6. Check for duplicate supplier (by name or phone)
    const existingSupplier = await db.supplier.findFirst({
      where: {
        sppgId: session.user.sppgId!,
        OR: [
          { supplierName: validated.supplierName },
          { phone: validated.phone }
        ]
      }
    })

    if (existingSupplier) {
      return NextResponse.json({ 
        success: false, 
        error: 'Supplier with this name or phone already exists' 
      }, { status: 409 })
    }

    // 7. Create supplier
    const supplier = await db.supplier.create({
      data: {
        sppgId: session.user.sppgId!,
        supplierCode,
        supplierName: validated.supplierName,
        businessName: validated.businessName,
        supplierType: validated.supplierType,
        category: validated.category,
        primaryContact: validated.primaryContact,
        phone: validated.phone,
        email: validated.email,
        whatsapp: validated.whatsapp,
        website: validated.website,
        address: validated.address,
        city: validated.city,
        province: validated.province,
        postalCode: validated.postalCode,
        coordinates: validated.coordinates,
        deliveryRadius: validated.deliveryRadius,
        paymentTerms: validated.paymentTerms || 'CASH_ON_DELIVERY',
        creditLimit: validated.creditLimit,
        minOrderValue: validated.minOrderValue,
        maxOrderCapacity: validated.maxOrderCapacity,
        leadTimeHours: validated.leadTimeHours || 24,
        deliveryDays: validated.deliveryDays || [],
        specialties: validated.specialties || [],
        certifications: validated.certifications || [],
        isHalalCertified: validated.isHalalCertified || false,
        isFoodSafetyCertified: validated.isFoodSafetyCertified || false,
        isISOCertified: validated.isISOCertified || false,
        preferredOrderMethod: validated.preferredOrderMethod || 'PHONE',
        isActive: true,
        isPreferred: false,
        isBlacklisted: false,
        overallRating: 0,
        qualityRating: 0,
        deliveryRating: 0,
        priceCompetitiveness: 0,
        serviceRating: 0,
        totalOrders: 0,
        successfulDeliveries: 0,
        failedDeliveries: 0,
        onTimeDeliveryRate: 0,
        totalPurchaseValue: 0,
        complianceStatus: 'PENDING',
        partnershipLevel: 'STANDARD',
        hasAPIIntegration: false,
        supportsEDI: false,
        currency: 'IDR'
      },
      include: {
        sppg: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // 8. Success response
    return NextResponse.json({
      success: true,
      data: supplier,
      message: 'Supplier created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('POST /api/sppg/procurement/suppliers error:', error)
    
    // Validation error
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ 
        success: false, 
        error: 'Validation failed',
        details: error 
      }, { status: 400 })
    }

    // Prisma error
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2002') {
        return NextResponse.json({ 
          success: false, 
          error: 'Supplier with this code already exists' 
        }, { status: 409 })
      }
    }

    // Internal server error
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create supplier',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 })
    }
  })
}
