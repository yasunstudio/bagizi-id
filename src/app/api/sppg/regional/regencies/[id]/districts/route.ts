/**
 * @fileoverview Cascade Districts by Regency Endpoint
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * 
 * Purpose: Fetch districts for a specific regency (cascade select)
 * RBAC: Protected by withSppgAuth
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

/**
 * GET /api/sppg/regional/regencies/[id]/districts
 * Fetch districts by regency ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async () => {
    try {
      const { id } = await params

      const districts = await db.district.findMany({
        where: {
          regencyId: id,
        },
        orderBy: {
          name: 'asc',
        },
        select: {
          id: true,
          regencyId: true,
          code: true,
          name: true,
        },
      })

      return NextResponse.json({
        success: true,
        data: districts,
      })
    } catch (error) {
      console.error('GET /api/sppg/regional/regencies/[id]/districts error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch districts',
        },
        { status: 500 }
      )
    }
  })
}
