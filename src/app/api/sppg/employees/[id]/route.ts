/**
 * @fileoverview Employee Detail API Routes
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * 
 * GET    /api/sppg/employees/[id] - Get employee detail
 * PUT    /api/sppg/employees/[id] - Update employee
 * DELETE /api/sppg/employees/[id] - Delete employee
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { updateEmployeeSchema } from '@/features/sppg/hrd/schemas/employeeSchema'

/**
 * GET /api/sppg/employees/[id]
 * Get employee detail with all relations
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    const { id } = await params

    // 3. Fetch employee with multi-tenant filtering
    const employee = await db.employee.findFirst({
      where: {
        id,
        sppgId: session.user.sppgId!, // MANDATORY multi-tenant filter
      },
      include: {
        department: {
          select: {
            id: true,
            departmentCode: true,
            departmentName: true,
          },
        },
        position: {
          select: {
            id: true,
            positionCode: true,
            positionName: true,
            level: true,
          },
        },
        village: {
          select: {
            id: true,
            name: true,
            district: {
              select: {
                id: true,
                name: true,
                regency: {
                  select: {
                    id: true,
                    name: true,
                    province: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        sppg: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    })

    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      )
    }

    // 4. Return employee detail
    return NextResponse.json({
      success: true,
      data: employee,
    })
  })
}

/**
 * PUT /api/sppg/employees/[id]
 * Update employee with validation and counter management
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    const { id } = await params

    // 3. Fetch existing employee to verify ownership
    const existingEmployee = await db.employee.findFirst({
      where: {
        id,
        sppgId: session.user.sppgId!, // MANDATORY multi-tenant filter
      },
      include: {
        department: true,
        position: true,
      },
    })

    if (!existingEmployee) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      )
    }

    // 4. Parse and validate request body
    const body = await request.json()

    const validated = updateEmployeeSchema.safeParse(body)
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

    // 5. Check if NIK changed and is unique
    if (data.nik && data.nik !== existingEmployee.nik) {
      const existingNik = await db.employee.findFirst({
        where: {
          nik: data.nik,
          sppgId: session.user.sppgId!,
          id: { not: id },
        },
      })

      if (existingNik) {
        return NextResponse.json(
          { success: false, error: 'NIK already exists' },
          { status: 409 }
        )
      }
    }

    // 6. Check if position changed and validate availability
    let newPosition = null
    if (data.positionId && data.positionId !== existingEmployee.positionId) {
      newPosition = await db.position.findFirst({
        where: {
          id: data.positionId,
          sppgId: session.user.sppgId!,
        },
      })

      if (!newPosition) {
        return NextResponse.json(
          { success: false, error: 'Position not found' },
          { status: 404 }
        )
      }

      // Check position capacity
      if (
        newPosition.maxOccupants &&
        newPosition.currentOccupants >= newPosition.maxOccupants
      ) {
        return NextResponse.json(
          { success: false, error: 'Position is full' },
          { status: 400 }
        )
      }
    }

    // 7. Check if department changed
    let newDepartment = null
    if (
      data.departmentId &&
      data.departmentId !== existingEmployee.departmentId
    ) {
      newDepartment = await db.department.findFirst({
        where: {
          id: data.departmentId,
          sppgId: session.user.sppgId!,
        },
      })

      if (!newDepartment) {
        return NextResponse.json(
          { success: false, error: 'Department not found' },
          { status: 404 }
        )
      }
    }

    // 8. Update employee in transaction (CRITICAL: Counter management)
    const updatedEmployee = await db.$transaction(async (tx) => {
      // Update counters if department changed
      if (newDepartment) {
        // Decrement old department
        await tx.department.update({
          where: { id: existingEmployee.departmentId! },
          data: { currentEmployees: { decrement: 1 } },
        })

        // Increment new department
        await tx.department.update({
          where: { id: data.departmentId! },
          data: { currentEmployees: { increment: 1 } },
        })
      }

      // Update counters if position changed
      if (newPosition) {
        // Decrement old position
        await tx.position.update({
          where: { id: existingEmployee.positionId! },
          data: { currentOccupants: { decrement: 1 } },
        })

        // Increment new position
        await tx.position.update({
          where: { id: data.positionId! },
          data: { currentOccupants: { increment: 1 } },
        })
      }

      // Update employee
      const employee = await tx.employee.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: {
          department: {
            select: {
              id: true,
              departmentCode: true,
              departmentName: true,
            },
          },
          position: {
            select: {
              id: true,
              positionCode: true,
              positionName: true,
              level: true,
            },
          },
          village: {
            select: {
              id: true,
              name: true,
              district: {
                select: {
                  id: true,
                  name: true,
                  regency: {
                    select: {
                      id: true,
                      name: true,
                      province: {
                        select: {
                          id: true,
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          sppg: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
        },
      })

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          sppgId: session.user.sppgId!,
          action: 'UPDATE',
          entityType: 'EMPLOYEE',
          entityId: id,
          newValues: JSON.stringify({
            before: existingEmployee,
            after: employee,
            changes: data,
          }),
        },
      })

      return employee
    })

    // 9. Return updated employee
    return NextResponse.json({
      success: true,
      data: updatedEmployee,
      message: 'Employee updated successfully',
    })
  })
}

/**
 * DELETE /api/sppg/employees/[id]
 * Delete employee (soft delete by setting isActive to false)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    const { id } = await params

    // 3. Check if employee exists and belongs to user's SPPG
    const employee = await db.employee.findFirst({
      where: {
        id,
        sppgId: session.user.sppgId!,
      },
    })

    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      )
    }

    // 4. Check if employee can be deleted
    // Check for related records that would prevent deletion
    const [attendanceCount, leaveCount, payrollCount] = await Promise.all([
      db.employeeAttendance.count({ where: { employeeId: id } }),
      db.leaveRequest.count({ where: { employeeId: id } }),
      db.payroll.count({ where: { employeeId: id } }),
    ])

    const hasRecords = attendanceCount > 0 || leaveCount > 0 || payrollCount > 0

    // 5. Perform soft delete or hard delete based on records
    if (hasRecords) {
      // Soft delete: Set isActive to false
      await db.employee.update({
        where: { id },
        data: {
          isActive: false,
          employmentStatus: 'TERMINATED',
          terminationDate: new Date(),
        },
      })
    } else {
      // Hard delete: Remove employee and update counters
      await db.$transaction(async (tx) => {
        // Delete employee
        await tx.employee.delete({
          where: { id },
        })

        // Update department counter
        await tx.department.update({
          where: { id: employee.departmentId },
          data: { currentEmployees: { decrement: 1 } },
        })

        // Update position counter
        await tx.position.update({
          where: { id: employee.positionId },
          data: { currentOccupants: { decrement: 1 } },
        })
      })
    }

    // 6. Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE',
        entityType: 'EMPLOYEE',
        entityId: id,
        oldValues: {
          ...employee,
          deletionType: hasRecords ? 'soft' : 'hard',
        },
      },
    })

    // 7. Return success response
    return NextResponse.json({
      success: true,
      message: hasRecords 
        ? 'Employee deactivated successfully (has related records)' 
        : 'Employee deleted successfully',
    })
  })
}
