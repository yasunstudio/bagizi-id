/**
 * @fileoverview Program Statistics API Endpoint
 * GET /api/sppg/program/stats - Fetch program statistics for dashboard
 * 
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * RBAC Integration:
 * - GET: Protected by withSppgAuth (all SPPG roles)
 * - Automatic audit logging for all operations
 * - Multi-tenant: Statistics filtered by session.user.sppgId
 * 
 * FEATURES:
 * - Multi-tenant security with sppgId filtering
 * - Comprehensive program statistics
 * - Status-based aggregation
 * - Percentage calculations
 * - Budget and recipient totals
 * 
 * STATISTICS:
 * - Total programs count
 * - Count by status (DRAFT, ACTIVE, PAUSED, COMPLETED, CANCELLED, ARCHIVED)
 * - Percentage for active and completed
 * - Total recipients across all programs
 * - Total budget allocated
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

/**
 * GET /api/sppg/program/stats
 * Fetch program statistics for SPPG dashboard
 * 
 * @rbac Protected by withSppgAuth - requires valid SPPG session
 * @audit Automatic logging via middleware
 * @returns Program statistics with counts, percentages, and totals
 */
export async function GET(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // ============================================
      // FETCH PROGRAM STATISTICS (MULTI-TENANT)
      // ============================================
      
      const sppgId = session.user.sppgId
      if (!sppgId) {
        return NextResponse.json(
          { success: false, error: 'SPPG ID not found in session' },
          { status: 403 }
        )
      }
      
      // Get all programs for this SPPG (auto-filtered by sppgId via withSppgAuth)
      const programs = await db.nutritionProgram.findMany({
        where: {
          sppgId
        },
        select: {
          id: true,
          status: true,
          currentRecipients: true,
          totalBudget: true
        }
      })

      // Calculate statistics
      const total = programs.length
      const draft = programs.filter(p => p.status === 'DRAFT').length
      const active = programs.filter(p => p.status === 'ACTIVE').length
      const paused = programs.filter(p => p.status === 'PAUSED').length
      const completed = programs.filter(p => p.status === 'COMPLETED').length
      const cancelled = programs.filter(p => p.status === 'CANCELLED').length
      const archived = programs.filter(p => p.status === 'ARCHIVED').length

      // Calculate percentages
      const activePercentage = total > 0 ? Math.round((active / total) * 100) : 0
      const completedPercentage = total > 0 ? Math.round((completed / total) * 100) : 0

      // Calculate totals
      const totalRecipients = programs.reduce((sum, p) => sum + p.currentRecipients, 0)
      const totalBudget = programs.reduce((sum, p) => sum + (p.totalBudget || 0), 0)

      // ============================================
      // RETURN STATISTICS
      // ============================================
      
      const statistics = {
        total,
        draft,
        active,
        paused,
        completed,
        cancelled,
        archived,
        activePercentage,
        completedPercentage,
        totalRecipients,
        totalBudget
      }

      return NextResponse.json({
        success: true,
        data: statistics
      })

    } catch (error) {
      console.error('GET /api/sppg/program/stats error:', error)
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch program statistics',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
        },
        { status: 500 }
      )
    }
  })
}
