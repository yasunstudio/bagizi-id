/**
 * @fileoverview Cascade Regencies by Province Endpoint
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * 
 * Purpose: Fetch regencies for a specific province (cascade select)
 * RBAC: Protected by withSppgAuth
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

/**
 * GET /api/sppg/regional/provinces/[id]/regencies
 * Fetch regencies by province ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async () => {
    try {
      const { id } = await params

      const regencies = await db.regency.findMany({
        where: {
          provinceId: id,
        },
        orderBy: {
          name: 'asc',
        },
        select: {
          id: true,
          provinceId: true,
          code: true,
          name: true,
          type: true,
        },
      })

      return NextResponse.json({
        success: true,
        data: regencies,
      })
    } catch (error) {
      console.error('GET /api/sppg/regional/provinces/[id]/regencies error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch regencies',
        },
        { status: 500 }
      )
    }
  })
}
