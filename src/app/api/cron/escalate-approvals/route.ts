/**
 * @fileoverview Cron Job Endpoint for Auto-Escalating Pending Approvals
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * Background job to automatically escalate orders pending approval beyond threshold
 * Should be triggered by cron service (Vercel Cron, GitHub Actions, etc.)
 * 
 * @example
 * // Vercel Cron (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/escalate-approvals",
 *     "schedule": "0 9 * * *"
 *   }]
 * }
 */

import { NextRequest } from 'next/server'
import { db } from '@/lib/prisma'
import { processEscalations } from '@/lib/approval-workflow'

export async function GET(request: NextRequest) {
  try {
    // 1. Verify cron secret (prevent unauthorized calls)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'dev-secret-key'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Get all active SPPGs
    const sppgs = await db.sPPG.findMany({
      where: {
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
      },
    })

    // 3. Process escalations for each SPPG
    const results: Record<string, { 
      sppgName: string
      escalatedCount: number
      escalatedOrderIds: string[]
    }> = {}

    for (const sppg of sppgs) {
      try {
        const escalatedOrderIds = await processEscalations(sppg.id)
        
        results[sppg.id] = {
          sppgName: sppg.name,
          escalatedCount: escalatedOrderIds.length,
          escalatedOrderIds,
        }

        console.log(`✅ Processed escalations for ${sppg.name}: ${escalatedOrderIds.length} orders`)
      } catch (error) {
        console.error(`❌ Error processing escalations for ${sppg.name}:`, error)
        results[sppg.id] = {
          sppgName: sppg.name,
          escalatedCount: 0,
          escalatedOrderIds: [],
        }
      }
    }

    // 4. Calculate totals
    const totalEscalated = Object.values(results).reduce(
      (sum, r) => sum + r.escalatedCount,
      0
    )

    // 5. Return summary
    return Response.json({
      success: true,
      executedAt: new Date().toISOString(),
      summary: {
        totalSppgs: sppgs.length,
        totalEscalated,
      },
      details: results,
    })
  } catch (error) {
    console.error('Cron escalate-approvals error:', error)
    return Response.json(
      {
        error: 'Failed to process escalations',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
}

// Allow POST as well for manual testing
export async function POST(request: NextRequest) {
  return GET(request)
}
