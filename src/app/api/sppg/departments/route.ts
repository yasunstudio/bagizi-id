/**
 * @fileoverview Department API - List & Create
 * @version Next.js 15.5.4 / Auth.js v5
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} API Development Guidelines
 * 
 * REST API endpoints for Department management
 * GET /api/sppg/departments - List departments with filters (multi-tenant)
 * POST /api/sppg/departments - Create new department
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { canManageHR } from '@/lib/permissions'
import { db } from '@/lib/prisma'
import { departmentSchema, departmentFiltersSchema } from '@/features/sppg/hrd/schemas/departmentSchema'
import { UserRole } from '@prisma/client'

/**
 * GET /api/sppg/departments
 * List all departments with optional filters
 * Multi-tenant: Automatically filtered by user's sppgId
 * 
 * Query Parameters:
 * - search: string (searches departmentName, departmentCode, description)
 * - parentId: string (filter by parent department)
 * - managerId: string (filter by manager)
 * - isActive: boolean (filter by active status)
 * - hasParent: boolean (true = child depts, false = root depts)
 */
export async function GET(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // Permission check
      if (!canManageHR(session.user.userRole as UserRole)) {
        return NextResponse.json({ 
          success: false,
          error: 'Insufficient permissions' 
        }, { status: 403 })
      }

      // Get sppgId from session (automatic multi-tenant security)
      const sppgId = session.user.sppgId!

      // Parse and validate query parameters
      const searchParams = request.nextUrl.searchParams
      const filters = departmentFiltersSchema.parse({
        search: searchParams.get('search') || undefined,
      parentId: searchParams.get('parentId') || undefined,
      managerId: searchParams.get('managerId') || undefined,
      isActive: searchParams.get('isActive') === 'true' ? true : 
                searchParams.get('isActive') === 'false' ? false : undefined,
      hasParent: searchParams.get('hasParent') === 'true' ? true :
                 searchParams.get('hasParent') === 'false' ? false : undefined,
    })

    // Build where clause with multi-tenant filtering
    const whereClause: {
      sppgId: string
      OR?: Array<{
        departmentName?: { contains: string; mode: 'insensitive' }
        departmentCode?: { contains: string; mode: 'insensitive' }
        description?: { contains: string; mode: 'insensitive' }
      }>
      parentId?: string | null | { not: null }
      managerId?: string
      isActive?: boolean
    } = {
      sppgId, // CRITICAL: Multi-tenant isolation
    }

    // Apply filters
    if (filters.search) {
      whereClause.OR = [
        { departmentName: { contains: filters.search, mode: 'insensitive' } },
        { departmentCode: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    if (filters.parentId !== undefined) {
      whereClause.parentId = filters.parentId
    }

    if (filters.managerId !== undefined) {
      whereClause.managerId = filters.managerId
    }

    if (filters.isActive !== undefined) {
      whereClause.isActive = filters.isActive
    }

    if (filters.hasParent === true) {
      whereClause.parentId = { not: null }
    } else if (filters.hasParent === false) {
      whereClause.parentId = null
    }

    // 5. Fetch departments with relationships
    const departments = await db.department.findMany({
      where: whereClause,
      include: {
        parent: {
          select: {
            id: true,
            departmentCode: true,
            departmentName: true,
          },
        },
        _count: {
          select: {
            employees: true,
            positions: true,
            children: true,
          },
        },
      },
      orderBy: [
        { departmentCode: 'asc' },
        { departmentName: 'asc' },
      ],
    })

    return NextResponse.json({
      success: true,
      data: departments,
    })
    } catch (error) {
      console.error('GET /api/sppg/departments error:', error)
      
      if (error instanceof Error) {
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to fetch departments',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
          },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      )
    }
  }) // End of withSppgAuth wrapper
}

/**
 * POST /api/sppg/departments
 * Create new department
 * Multi-tenant: Automatically assigns user's sppgId
 * 
 * Request Body: DepartmentInput
 * - departmentCode: string (unique per SPPG)
 * - departmentName: string
 * - description?: string
 * - parentId?: string (null for root department)
 * - managerId?: string
 * - budgetAllocated?: number
 * - maxEmployees?: number
 * - email?: string
 * - phone?: string
 * - location?: string
 * - isActive?: boolean
 */
/**
 * POST /api/sppg/departments
 * Create new department
 * Multi-tenant: Automatically assigns user's sppgId
 * 
 * Request Body: DepartmentInput
 * - departmentCode: string (unique per SPPG)
 * - departmentName: string
 * - description?: string
 * - parentId?: string (null for root department)
 * - managerId?: string
 * - budgetAllocated?: number
 * - maxEmployees?: number
 * - email?: string
 * - phone?: string
 * - location?: string
 * - isActive?: boolean
 */
export async function POST(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // Permission check
      if (!canManageHR(session.user.userRole as UserRole)) {
        return NextResponse.json({ 
          success: false,
          error: 'Insufficient permissions' 
        }, { status: 403 })
      }

      // Get sppgId from session
      const sppgId = session.user.sppgId!

      // Parse request body
      const body = await request.json()

      // Validation with Zod
      const validated = departmentSchema.safeParse(body)
      if (!validated.success) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation failed',
            details: validated.error.issues, // Fix: use .issues instead of .errors
          },
          { status: 400 }
        )
      }

      // Check for duplicate departmentCode in same SPPG
      const existingDept = await db.department.findFirst({
        where: {
          sppgId,
          departmentCode: validated.data.departmentCode,
        },
      })

      if (existingDept) {
        return NextResponse.json(
          {
            success: false,
            error: 'Department code already exists in your organization',
            details: { field: 'departmentCode' },
          },
          { status: 409 }
        )
      }

      // If parentId is provided, verify it exists and belongs to same SPPG
      if (validated.data.parentId) {
        const parentDept = await db.department.findFirst({
          where: {
            id: validated.data.parentId,
            sppgId,
          },
        })

        if (!parentDept) {
          return NextResponse.json(
            {
              success: false,
              error: 'Parent department not found or access denied',
              details: { field: 'parentId' },
            },
            { status: 404 }
          )
        }

        // Prevent circular reference (simple check)
      if (parentDept.parentId === validated.data.parentId) {
        return NextResponse.json(
          {
            success: false,
            error: 'Circular parent-child relationship not allowed',
            details: { field: 'parentId' },
          },
          { status: 400 }
        )
      }
    }

      // Create department with multi-tenant safety
      const department = await db.department.create({
        data: {
          ...validated.data,
          sppgId, // CRITICAL: Multi-tenant isolation
          currentEmployees: 0, // Initialize counter
        },
        include: {
          parent: {
            select: {
              id: true,
              departmentCode: true,
              departmentName: true,
            },
          },
          _count: {
            select: {
              employees: true,
              positions: true,
              children: true,
            },
          },
        },
      })

      return NextResponse.json(
        {
          success: true,
          data: department,
        },
        { status: 201 }
      )
    } catch (error) {
      console.error('POST /api/sppg/departments error:', error)
      
      if (error instanceof Error) {
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to create department',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
          },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      )
    }
  }) // End of withSppgAuth wrapper
}
