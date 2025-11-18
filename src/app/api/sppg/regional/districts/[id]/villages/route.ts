/**
 * @fileoverview Cascade Villages by District Endpoint
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * 
 * Purpose: Fetch villages for a specific district (cascade select)
 * RBAC: Protected by withSppgAuth
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

/**
 * GET /api/sppg/regional/districts/[id]/villages
 * Fetch villages by district ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async () => {
    try {
      const { id } = await params

      const villages = await db.village.findMany({
        where: {
          districtId: id,
        },
        orderBy: {
          name: 'asc',
        },
        select: {
          id: true,
          districtId: true,
          code: true,
          name: true,
          type: true,
          postalCode: true,
        },
      })

      return NextResponse.json({
        success: true,
        data: villages,
      })
    } catch (error) {
      console.error('GET /api/sppg/regional/districts/[id]/villages error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch villages',
        },
        { status: 500 }
      )
    }
  })
}
