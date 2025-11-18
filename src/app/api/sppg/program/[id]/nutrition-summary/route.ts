import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { getProgramNutritionSummary } from '@/lib/nutrition-helpers'

/**
 * GET /api/sppg/program/[id]/nutrition-summary
 * Get nutrition summary for a program
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const programId = params.id
    const summary = await getProgramNutritionSummary(programId)

    return Response.json({ success: true, data: summary })
  } catch (error) {
    console.error('Get nutrition summary error:', error)
    return Response.json(
      { 
        error: 'Failed to get nutrition summary',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}
