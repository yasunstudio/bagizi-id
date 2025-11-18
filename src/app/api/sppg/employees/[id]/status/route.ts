/**
 * @fileoverview Employee Status Update API Route
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * 
 * PATCH /api/sppg/employees/[id]/status - Update employee active status
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { z } from 'zod'

const statusSchema = z.object({
  isActive: z.boolean(),
})

/**
 * PATCH /api/sppg/employees/[id]/status
 * Update employee active status (activate/deactivate)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    const { id } = await params

    // 3. Check if employee exists and belongs to user's SPPG
    const existingEmployee = await db.employee.findFirst({
      where: {
        id,
        sppgId: session.user.sppgId!,
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
    const { isActive } = statusSchema.parse(body)

    // 5. Update employee status
    const employee = await db.employee.update({
      where: { id },
      data: { isActive },
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

    // 6. Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        sppgId: session.user.sppgId!,
        action: 'UPDATE',
        entityType: 'EMPLOYEE',
        entityId: id,
        oldValues: { isActive: existingEmployee.isActive },
        newValues: { isActive },
      },
    })

    // 7. Return updated employee
    return NextResponse.json({
      success: true,
      data: employee,
      message: `Employee ${isActive ? 'activated' : 'deactivated'} successfully`,
    })
  })
}
