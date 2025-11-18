/**
 * @fileoverview Position Management API Routes
 * Handles list and create operations for positions
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Auth.js v5
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { canManageHR } from '@/lib/permissions'
import { db } from '@/lib/prisma'
import { z } from 'zod'
import { EmployeeLevel, UserRole } from '@prisma/client'

/**
 * Position Filters Schema
 * Validates query parameters for position list endpoint
 */
const positionFiltersSchema = z.object({
  search: z.string().nullish().transform(val => val || undefined),
  departmentId: z
    .string()
    .nullish()
    .transform(val => val || undefined)
    .refine(val => !val || /^c[a-z0-9]{24}$/.test(val), 'Invalid department ID format'),
  level: z.nativeEnum(EmployeeLevel).nullish().catch(undefined),
  isActive: z
    .string()
    .nullish()
    .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
  minSalaryRange: z.string().nullish().transform((val) => (val ? Number(val) : undefined)),
  maxSalaryRange: z.string().nullish().transform((val) => (val ? Number(val) : undefined)),
})

/**
 * Position Create Schema
 * Validates input for position creation
 */
const positionCreateSchema = z.object({
  departmentId: z.string().cuid({ message: 'Department ID tidak valid' }),
  positionCode: z
    .string()
    .min(2, 'Kode posisi minimal 2 karakter')
    .max(20, 'Kode posisi maksimal 20 karakter')
    .regex(/^[A-Z0-9-_]+$/, 'Kode posisi harus huruf besar, angka, dash, atau underscore')
    .transform((val) => val.toUpperCase()),
  positionName: z
    .string()
    .min(3, 'Nama posisi minimal 3 karakter')
    .max(255, 'Nama posisi maksimal 255 karakter'),
  jobDescription: z.string().optional(),
  requirements: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  level: z.nativeEnum(EmployeeLevel).default(EmployeeLevel.STAFF),
  reportsTo: z.string().cuid().optional().nullable(),
  minSalary: z.number().min(0, 'Minimal salary tidak boleh negatif').optional().nullable(),
  maxSalary: z.number().min(0, 'Maksimal salary tidak boleh negatif').optional().nullable(),
  currency: z.string().default('IDR'),
  maxOccupants: z.number().int().min(1, 'Maksimal occupants minimal 1').default(1),
  isActive: z.boolean().default(true),
})

/**
 * GET /api/sppg/positions
 * List positions with filtering
 * Multi-tenant: Automatically filtered by user's sppgId
 *
 * Query Parameters:
 * - search: Search by position name or code
 * - departmentId: Filter by department
 * - level: Filter by employee level
 * - isActive: Filter by active status
 * - minSalaryRange: Filter by minimum salary
 * - maxSalaryRange: Filter by maximum salary
 *
 * @returns Array of positions with relations
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

      const sppgId = session.user.sppgId!

      // Parse and validate query parameters
      const { searchParams } = new URL(request.url)
      const filtersResult = positionFiltersSchema.safeParse({
        search: searchParams.get('search'),
        departmentId: searchParams.get('departmentId'),
        level: searchParams.get('level'),
        isActive: searchParams.get('isActive'),
        minSalaryRange: searchParams.get('minSalaryRange'),
        maxSalaryRange: searchParams.get('maxSalaryRange'),
      })

      if (!filtersResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation failed',
            details: filtersResult.error.issues,
          },
          { status: 400 }
        )
      }

      const filters = filtersResult.data

      // Build query with multi-tenant filtering
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {
        sppgId, // CRITICAL: Multi-tenant isolation
      }

    // Apply search filter
    if (filters.search) {
      where.OR = [
        { positionName: { contains: filters.search, mode: 'insensitive' } },
        { positionCode: { contains: filters.search, mode: 'insensitive' } },
        { jobDescription: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    // Apply department filter
    if (filters.departmentId) {
      where.departmentId = filters.departmentId
    }

    // Apply level filter
    if (filters.level) {
      where.level = filters.level
    }

    // Apply active status filter
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive
    }

      // Apply salary range filters
      if (filters.minSalaryRange !== undefined || filters.maxSalaryRange !== undefined) {
        where.AND = []
        
        if (filters.minSalaryRange !== undefined) {
          where.AND.push({
            minSalary: {
              gte: filters.minSalaryRange,
            },
          })
        }

        if (filters.maxSalaryRange !== undefined) {
          where.AND.push({
            maxSalary: {
              lte: filters.maxSalaryRange,
            },
          })
        }
      }

      // Fetch positions with relations
      const positions = await db.position.findMany({
        where,
        include: {
          department: {
            select: {
              id: true,
              departmentCode: true,
              departmentName: true,
              isActive: true,
            },
          },
          _count: {
            select: {
              employees: true,
            },
          },
        },
        orderBy: [{ positionCode: 'asc' }],
      })

      return NextResponse.json({ success: true, data: positions })
    } catch (error) {
      console.error('GET /api/sppg/positions error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch positions',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}/**
 * POST /api/sppg/positions
 * Create new position
 * Multi-tenant: Automatically assigned to user's sppgId
 *
 * Request Body:
 * - departmentId: Department ID (required)
 * - positionCode: Unique code (required, auto-uppercase)
 * - positionName: Position name (required)
 * - jobDescription: Job description (optional)
 * - requirements: Array of requirements (optional)
 * - responsibilities: Array of responsibilities (optional)
 * - level: Employee level (default: STAFF)
 * - reportsTo: Position ID (optional)
 * - minSalary: Minimum salary (optional)
 * - maxSalary: Maximum salary (optional)
 * - currency: Currency code (default: IDR)
 * - maxOccupants: Maximum occupants (default: 1)
 * - isActive: Active status (default: true)
 *
 * @returns Created position with relations
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

      const sppgId = session.user.sppgId!

      // Parse and validate request body
      const body = await request.json()
      const validated = positionCreateSchema.safeParse(body)

      if (!validated.success) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation failed',
            details: validated.error.issues,
          },
          { status: 400 }
        )
      }

      const data = validated.data

      // Validate salary range (minSalary <= maxSalary)
      if (
        data.minSalary !== null &&
        data.minSalary !== undefined &&
        data.maxSalary !== null &&
        data.maxSalary !== undefined &&
        data.minSalary > data.maxSalary
      ) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation failed',
            details: [
              {
                code: 'custom',
                path: ['maxSalary'],
                message: 'Maksimal salary harus lebih besar atau sama dengan minimal salary',
              },
            ],
          },
          { status: 400 }
        )
      }

      // Check if position code already exists for this SPPG
      const existingPosition = await db.position.findFirst({
        where: {
          sppgId, // CRITICAL: Multi-tenant isolation
          positionCode: data.positionCode,
        },
      })

      if (existingPosition) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation failed',
            details: [
              {
                code: 'custom',
                path: ['positionCode'],
                message: 'Kode posisi sudah digunakan',
              },
            ],
          },
          { status: 409 }
        )
      }

      // Verify department exists and belongs to this SPPG
      const department = await db.department.findFirst({
        where: {
          id: data.departmentId,
          sppgId, // CRITICAL: Multi-tenant isolation
        },
      })

      if (!department) {
        return NextResponse.json(
          {
            success: false,
            error: 'Department not found or access denied',
          },
          { status: 404 }
        )
      }

      // If reportsTo is provided, verify position exists
      if (data.reportsTo) {
        const supervisorPosition = await db.position.findFirst({
          where: {
            id: data.reportsTo,
            sppgId, // CRITICAL: Multi-tenant isolation
          },
        })

        if (!supervisorPosition) {
          return NextResponse.json(
            {
              success: false,
              error: 'Supervisor position not found',
            },
            { status: 404 }
          )
        }
      }

      // Create position
      const position = await db.position.create({
        data: {
          ...data,
          sppgId, // CRITICAL: Multi-tenant isolation
          currentOccupants: 0, // Initialize counter
        },
        include: {
          department: {
            select: {
              id: true,
              departmentCode: true,
              departmentName: true,
              isActive: true,
            },
          },
          _count: {
            select: {
              employees: true,
            },
          },
        },
      })

      return NextResponse.json({ success: true, data: position }, { status: 201 })
    } catch (error) {
      console.error('POST /api/sppg/positions error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create position',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}
