/**
 * @fileoverview Position Detail API Routes
 * Handles detail, update, and delete operations for positions
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
 * Position Update Schema
 * Validates input for position updates (partial)
 */
const positionUpdateSchema = z
  .object({
    departmentId: z.string().cuid({ message: 'Department ID tidak valid' }).optional(),
    positionCode: z
      .string()
      .min(2, 'Kode posisi minimal 2 karakter')
      .max(20, 'Kode posisi maksimal 20 karakter')
      .regex(/^[A-Z0-9-_]+$/, 'Kode posisi harus huruf besar, angka, dash, atau underscore')
      .transform((val) => val.toUpperCase())
      .optional(),
    positionName: z
      .string()
      .min(3, 'Nama posisi minimal 3 karakter')
      .max(255, 'Nama posisi maksimal 255 karakter')
      .optional(),
    jobDescription: z.string().optional().nullable(),
    requirements: z.array(z.string()).optional(),
    responsibilities: z.array(z.string()).optional(),
    level: z.nativeEnum(EmployeeLevel).optional(),
    reportsTo: z.string().cuid().optional().nullable(),
    minSalary: z.number().min(0, 'Minimal salary tidak boleh negatif').optional().nullable(),
    maxSalary: z.number().min(0, 'Maksimal salary tidak boleh negatif').optional().nullable(),
    currency: z.string().optional(),
    maxOccupants: z.number().int().min(1, 'Maksimal occupants minimal 1').optional(),
    isActive: z.boolean().optional(),
  })
  .strict()

/**
 * GET /api/sppg/positions/[id]
 * Get position detail
 * Multi-tenant: Verifies position belongs to user's sppgId
 *
 * @param id - Position ID from URL params
 * @returns Position with full relations
 */
export async function GET(
  request: NextRequest, 
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  const { id } = params

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

      // Fetch position with multi-tenant filtering
      const position = await db.position.findFirst({
        where: {
          id,
          sppgId, // CRITICAL: Multi-tenant isolation
        },
        include: {
          department: {
            select: {
              id: true,
              departmentCode: true,
              departmentName: true,
              isActive: true,
              parentId: true,
            },
          },
          employees: {
            select: {
              id: true,
              employeeCode: true,
              fullName: true,
              email: true,
              photoUrl: true,
              employmentStatus: true,
              isActive: true,
            },
            orderBy: {
              fullName: 'asc',
            },
          },
          _count: {
            select: {
              employees: true,
            },
          },
        },
      })

      if (!position) {
        return NextResponse.json(
          { success: false, error: 'Position not found or access denied' },
          { status: 404 }
        )
      }

      return NextResponse.json({ success: true, data: position })
    } catch (error) {
      console.error('GET /api/sppg/positions/[id] error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch position',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}

/**
 * PUT /api/sppg/positions/[id]
 * Update position by ID
 * Multi-tenant: Verifies position belongs to user's sppgId
 *
 * @param id - Position ID from URL params
 * @returns Updated position with relations
 */
export async function PUT(
  request: NextRequest, 
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  const { id } = params

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
      const validated = positionUpdateSchema.safeParse(body)

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

      // Fetch existing position with multi-tenant filtering
      const existingPosition = await db.position.findFirst({
        where: {
          id,
          sppgId, // CRITICAL: Multi-tenant isolation
        },
      })

      if (!existingPosition) {
        return NextResponse.json(
          { success: false, error: 'Position not found or access denied' },
          { status: 404 }
        )
      }

      // Validate salary range if both are provided
      const minSalary = data.minSalary !== undefined ? data.minSalary : existingPosition.minSalary
      const maxSalary = data.maxSalary !== undefined ? data.maxSalary : existingPosition.maxSalary

      if (
        minSalary !== null &&
        minSalary !== undefined &&
        maxSalary !== null &&
        maxSalary !== undefined &&
        minSalary > maxSalary
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

      // Validate maxOccupants if changed
      if (data.maxOccupants !== undefined && data.maxOccupants < existingPosition.currentOccupants) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation failed',
            details: [
              {
                code: 'custom',
                path: ['maxOccupants'],
                message: `Maksimal occupants tidak boleh kurang dari jumlah karyawan saat ini (${existingPosition.currentOccupants})`,
              },
            ],
          },
          { status: 400 }
        )
      }

      // Check position code uniqueness if changed
      if (data.positionCode && data.positionCode !== existingPosition.positionCode) {
        const duplicatePosition = await db.position.findFirst({
          where: {
            sppgId, // CRITICAL: Multi-tenant isolation
            positionCode: data.positionCode,
            NOT: {
              id,
            },
          },
        })

        if (duplicatePosition) {
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
      }

      // Verify department exists and belongs to this SPPG if changed
      if (data.departmentId) {
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
      }

      // Verify reportsTo position exists if provided
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

      // Update position
      const position = await db.position.update({
        where: {
          id,
        },
        data,
        include: {
          department: {
            select: {
              id: true,
              departmentCode: true,
              departmentName: true,
              isActive: true,
              parentId: true,
            },
          },
          employees: {
            select: {
              id: true,
              employeeCode: true,
              fullName: true,
              email: true,
              photoUrl: true,
              employmentStatus: true,
              isActive: true,
            },
            orderBy: {
              fullName: 'asc',
            },
          },
          _count: {
            select: {
              employees: true,
            },
          },
        },
      })

      return NextResponse.json({ success: true, data: position })
    } catch (error) {
      console.error('PUT /api/sppg/positions/[id] error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update position',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}

/**
 * DELETE /api/sppg/positions/[id]
 * Delete position
 * Multi-tenant: Verifies position belongs to user's sppgId
 *
 * Deletion Constraints:
 * - Cannot delete if position has employees assigned (currentOccupants > 0)
 *
 * @param id - Position ID from URL params
 * @returns Success message
 */
export async function DELETE(
  request: NextRequest, 
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  const { id } = params

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

      // Fetch position with multi-tenant filtering and check employees
      const position = await db.position.findFirst({
        where: {
          id,
          sppgId, // CRITICAL: Multi-tenant isolation
        },
        include: {
          _count: {
            select: {
              employees: true,
            },
          },
        },
      })

      if (!position) {
        return NextResponse.json(
          { success: false, error: 'Position not found or access denied' },
          { status: 404 }
        )
      }

      // Check deletion constraints
      const hasEmployees = position._count.employees > 0

      if (hasEmployees) {
        return NextResponse.json(
          {
            success: false,
            error: 'Cannot delete position',
            message: 'Posisi masih memiliki karyawan yang ditugaskan',
            details: {
              reason: 'HAS_EMPLOYEES',
              employeeCount: position._count.employees,
              suggestion:
                'Pindahkan atau hapus karyawan terlebih dahulu sebelum menghapus posisi ini',
            },
          },
          { status: 409 }
        )
      }

      // Delete position
      await db.position.delete({
        where: {
          id,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Posisi berhasil dihapus',
      })
    } catch (error) {
      console.error('DELETE /api/sppg/positions/[id] error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to delete position',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}
