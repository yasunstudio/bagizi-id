/**
 * @fileoverview Quality Check API Route
 * @route /api/sppg/production/[id]/quality-checks
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * 
 * RBAC Integration:
 * - GET/POST: Protected by withSppgAuth
 * - Automatic audit logging
 * - Multi-tenant: Production ownership verified
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

/**
 * GET /api/sppg/production/[id]/quality-checks
 * @rbac Protected by withSppgAuth
 * @audit Automatic logging
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id } = await params

      // Check if production exists and belongs to user's SPPG
      const production = await db.foodProduction.findFirst({
        where: {
          id,
          sppgId: session.user.sppgId!,
        },
      })

      if (!production) {
        return NextResponse.json({ error: 'Production not found' }, { status: 404 })
      }

      // Get quality checks with user info
      const qualityChecks = await db.qualityControl.findMany({
        where: {
          productionId: id,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              userRole: true,
            },
          },
        },
        orderBy: {
          checkTime: 'desc',
        },
      })

      return NextResponse.json({
        success: true,
        data: qualityChecks,
      })
    } catch (error) {
      console.error('GET /api/sppg/production/[id]/quality-checks error:', error)
      return NextResponse.json(
        {
          error: 'Failed to fetch quality checks',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}

/**
 * POST /api/sppg/production/[id]/quality-checks
 * @rbac Protected by withSppgAuth
 * @audit Automatic logging
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id } = await params

      // Check if production exists and belongs to user's SPPG
      const production = await db.foodProduction.findFirst({
        where: {
          id,
          sppgId: session.user.sppgId!,
        },
      })

      if (!production) {
        return NextResponse.json({ error: 'Production not found' }, { status: 404 })
      }

      // 🔒 Role Validation: Only QC Staff or Production Manager can perform quality checks
      const allowedRoles = ['SPPG_STAFF_QC', 'SPPG_PRODUKSI_MANAGER', 'SPPG_KEPALA', 'SPPG_ADMIN']
      if (!allowedRoles.includes(session.user.userRole)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Akses ditolak',
            message:
              'Hanya Staff QC atau Manager Produksi yang dapat melakukan pemeriksaan quality control',
          },
          { status: 403 }
        )
      }

      const body = await request.json()

      // Create quality check (using actual schema fields)
      const qualityCheck = await db.qualityControl.create({
        data: {
          productionId: id,
          checkType: body.checkType || 'GENERAL',
          checkTime: body.checkTime ? new Date(body.checkTime) : new Date(),
          checkedBy: body.checkedBy || session.user.id,
          parameter: body.parameter || 'General Quality',
          expectedValue: body.expectedValue,
          actualValue: body.actualValue || 'Checked',
          passed: body.passed,
          score: body.score,
          severity: body.severity,
          notes: body.notes,
          recommendations: body.recommendations,
          actionRequired: body.actionRequired || false,
        },
      })

      // If quality check failed, update production status to CANCELLED
      if (!body.passed && production.status === 'QUALITY_CHECK') {
        await db.foodProduction.update({
          where: {
            id,
          },
          data: {
            status: 'CANCELLED',
            rejectionReason: 'Failed quality check',
            qualityPassed: false,
          },
        })
      }

      // If quality check passed and production is in QUALITY_CHECK, move to COMPLETED
      if (body.passed && production.status === 'QUALITY_CHECK') {
        await db.foodProduction.update({
          where: {
            id,
          },
          data: {
            status: 'COMPLETED',
            actualEndTime: new Date(),
            qualityPassed: true,
          },
        })
      }

      return NextResponse.json(
        {
          success: true,
          data: qualityCheck,
        },
        { status: 201 }
      )
    } catch (error) {
      console.error('POST /api/sppg/production/[id]/quality-checks error:', error)
      return NextResponse.json(
        {
          error: 'Failed to create quality check',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}
