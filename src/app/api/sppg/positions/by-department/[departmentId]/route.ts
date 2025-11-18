/**
 * @fileoverview Position by Department API Route
 * Handles listing positions filtered by department
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Auth.js v5
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

/**
 * GET /api/sppg/positions/by-department/[departmentId]
 * Get all positions for a specific department
 *
 * @param departmentId - Department ID from URL params
 * @returns Array of positions for the department
 */
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ departmentId: string }> }
) {
  const params = await props.params
  const { departmentId } = params
  
  return withSppgAuth(request, async (session) => {
    // 3. Verify department exists and belongs to this SPPG
    const department = await db.department.findFirst({
      where: {
        id: departmentId,
        sppgId: session.user.sppgId!,
      },
    })

    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 })
    }

    // 4. Fetch positions for this department with multi-tenant filtering
    const positions = await db.position.findMany({
      where: {
        departmentId,
        sppgId: session.user.sppgId!, // MANDATORY MULTI-TENANT FILTER
      },
      include: {
        _count: {
          select: {
            employees: true,
          },
        },
      },
      orderBy: [{ positionCode: 'asc' }],
    })

    return NextResponse.json({ success: true, data: positions })
  })
}
