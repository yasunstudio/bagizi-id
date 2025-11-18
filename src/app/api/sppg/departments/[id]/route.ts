/**
 * @fileoverview Department API - Detail, Update & Delete
 * @version Next.js 15.5.4 / Auth.js v5
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} API Development Guidelines
 * 
 * REST API endpoints for individual Department operations
 * GET /api/sppg/departments/[id] - Get department detail
 * PUT /api/sppg/departments/[id] - Update department
 * DELETE /api/sppg/departments/[id] - Delete department
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { canManageHR } from '@/lib/permissions'
import { db } from '@/lib/prisma'
import { departmentUpdateSchema } from '@/features/sppg/hrd/schemas/departmentSchema'
import { UserRole } from '@prisma/client'

/**
 * GET /api/sppg/departments/[id]
 * Get department detail with all relationships
 * Multi-tenant: Verifies department belongs to user's SPPG
 */
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      // Permission check
      if (!canManageHR(session.user.userRole as UserRole)) {
        return NextResponse.json({ 
          success: false,
          error: 'Insufficient permissions' 
        }, { status: 403 })
      }

      // Get params (Next.js 15 async pattern)
      const params = await props.params
      const { id } = params

      // Get sppgId from session
      const sppgId = session.user.sppgId!

      // Fetch department with multi-tenant check
      const department = await db.department.findFirst({
        where: {
          id,
          sppgId, // CRITICAL: Multi-tenant isolation
        },
        include: {
          sppg: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          parent: {
            select: {
              id: true,
              departmentCode: true,
              departmentName: true,
              isActive: true,
            },
          },
          children: {
            select: {
              id: true,
              departmentCode: true,
              departmentName: true,
              currentEmployees: true,
              maxEmployees: true,
              isActive: true,
            },
            orderBy: {
              departmentCode: 'asc',
            },
          },
          employees: {
            select: {
              id: true,
              employeeCode: true,
              fullName: true,
              email: true,
              phone: true,
              photoUrl: true,
              employmentStatus: true,
              positionId: true,
            },
            where: {
              employmentStatus: 'ACTIVE',
            },
            orderBy: {
              employeeCode: 'asc',
            },
          },
          positions: {
            select: {
              id: true,
              positionCode: true,
              positionName: true,
              level: true,
              currentOccupants: true,
              maxOccupants: true,
              isActive: true,
            },
            where: {
              isActive: true,
            },
            orderBy: {
              positionCode: 'asc',
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

      if (!department) {
        return NextResponse.json(
          { success: false, error: 'Department not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: department,
      })
    } catch (error) {
      console.error('GET /api/sppg/departments/[id] error:', error)

      if (error instanceof Error) {
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to fetch department',
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
 * PUT /api/sppg/departments/[id]
 * Update department
 * Multi-tenant: Verifies department belongs to user's SPPG
 * 
 * Request Body: Partial<DepartmentInput>
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
        return NextResponse.json(
          { success: false, error: 'Insufficient permissions to update departments' },
          { status: 403 }
        )
      }

      const sppgId = session.user.sppgId!

      // 1. Verify department exists and belongs to user's SPPG
      const existingDept = await db.department.findFirst({
        where: {
          id,
          sppgId, // CRITICAL: Multi-tenant isolation
        },
      })

      if (!existingDept) {
        return NextResponse.json(
          { success: false, error: 'Department not found or access denied' },
          { status: 404 }
        )
      }

      // 2. Parse request body
      const body = await request.json()

      // 3. Validation with Zod (partial schema for updates)
      const validated = departmentUpdateSchema.safeParse(body)
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

      // 4. Check for duplicate departmentCode if changed
      if (validated.data.departmentCode && validated.data.departmentCode !== existingDept.departmentCode) {
        const duplicateDept = await db.department.findFirst({
          where: {
            sppgId,
            departmentCode: validated.data.departmentCode,
            NOT: { id },
          },
        })

        if (duplicateDept) {
          return NextResponse.json(
            {
              success: false,
              error: 'Department code already exists in your organization',
              details: { field: 'departmentCode' },
            },
            { status: 409 }
          )
        }
      }

      // 5. If parentId is being changed, verify it exists and prevent circular reference
      if (validated.data.parentId !== undefined && validated.data.parentId !== existingDept.parentId) {
        if (validated.data.parentId) {
          // Cannot set self as parent
          if (validated.data.parentId === id) {
            return NextResponse.json(
              {
                success: false,
                error: 'Department cannot be its own parent',
                details: { field: 'parentId' },
              },
              { status: 400 }
            )
          }

          // Verify parent exists and belongs to same SPPG
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

          // Prevent circular reference: check if new parent is a child of this department
          const isCircular = await checkCircularReference(id, validated.data.parentId)
          if (isCircular) {
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
      }

      // 6. Update department
      const updatedDept = await db.department.update({
        where: { id },
        data: validated.data,
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

      return NextResponse.json({
        success: true,
        data: updatedDept,
      })
    } catch (error) {
      console.error('PUT /api/sppg/departments/[id] error:', error)

      if (error instanceof Error) {
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to update department',
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
 * DELETE /api/sppg/departments/[id]
 * Delete department
 * Multi-tenant: Verifies department belongs to user's SPPG
 * Validates: No active employees, no child departments
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
        return NextResponse.json(
          { success: false, error: 'Insufficient permissions to delete departments' },
          { status: 403 }
        )
      }

      const sppgId = session.user.sppgId!

      // 1. Verify department exists and belongs to user's SPPG
      const department = await db.department.findFirst({
        where: {
          id,
          sppgId, // CRITICAL: Multi-tenant isolation
        },
        include: {
          _count: {
            select: {
              employees: true,
              positions: true,
              children: true,
            },
          },
        },
      })

      if (!department) {
        return NextResponse.json(
          { success: false, error: 'Department not found or access denied' },
          { status: 404 }
        )
      }

      // 2. Validation: Cannot delete if has active employees
      if (department._count.employees > 0) {
        return NextResponse.json(
          {
            success: false,
            error: `Cannot delete department with ${department._count.employees} active employee(s). Please reassign or remove employees first.`,
            details: { 
              field: 'employees',
              count: department._count.employees,
            },
          },
          { status: 409 }
        )
      }

      // 3. Validation: Cannot delete if has child departments
      if (department._count.children > 0) {
        return NextResponse.json(
          {
            success: false,
            error: `Cannot delete department with ${department._count.children} child department(s). Please remove or reassign child departments first.`,
            details: { 
              field: 'children',
              count: department._count.children,
            },
          },
          { status: 409 }
        )
      }

      // 4. Validation: Cannot delete if has positions
      if (department._count.positions > 0) {
        return NextResponse.json(
          {
            success: false,
            error: `Cannot delete department with ${department._count.positions} position(s). Please remove positions first.`,
            details: { 
              field: 'positions',
              count: department._count.positions,
            },
          },
          { status: 409 }
        )
      }

      // 5. Delete department
      await db.department.delete({
        where: { id },
      })

      return NextResponse.json({
        success: true,
        message: 'Department deleted successfully',
      })
    } catch (error) {
      console.error('DELETE /api/sppg/departments/[id] error:', error)

      if (error instanceof Error) {
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to delete department',
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
 * Helper function to check circular reference in department hierarchy
 * Recursively checks if targetId is an ancestor of departmentId
 */
async function checkCircularReference(
  departmentId: string,
  targetId: string
): Promise<boolean> {
  const target = await db.department.findUnique({
    where: { id: targetId },
    select: { parentId: true },
  })

  if (!target) return false
  if (!target.parentId) return false
  if (target.parentId === departmentId) return true

  // Recursively check parent
  return checkCircularReference(departmentId, target.parentId)
}
