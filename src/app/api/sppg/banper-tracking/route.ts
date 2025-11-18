/**
 * @fileoverview API endpoint untuk Banper Request Tracking - GET & POST
 * @version Next.js 15.5.4 / Auth.js v5 / Enterprise-Grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * RBAC Integration:
 * - GET: Protected by withSppgAuth (all SPPG roles)
 * - POST: Protected by withSppgAuth with role check
 * - Automatic audit logging for all operations
 * - Multi-tenant: Banper tracking filtered by session.user.sppgId
 * 
 * CRITICAL: Multi-tenant security with sppgId filtering
 * CRITICAL: Auto-generate requestCode on creation
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { createBanperRequestSchema } from '@/features/sppg/banper-tracking/schemas'
import { UserRole, Prisma, BgnRequestStatus } from '@prisma/client'

/**
 * GET /api/sppg/banper-tracking
 * Fetch all banper tracking records untuk SPPG user
 * Auto-filtered by sppgId (multi-tenant security)
 * 
 * @rbac Protected by withSppgAuth - requires valid SPPG session
 * @audit Automatic logging via middleware
 */
export async function GET(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // Parse query parameters for filtering
      const { searchParams } = new URL(request.url)
      const statusParam = searchParams.get('status')
      const programId = searchParams.get('programId')
      const search = searchParams.get('search')

      // Validate enum value
      const status = statusParam && Object.values(BgnRequestStatus).includes(statusParam as BgnRequestStatus)
        ? (statusParam as BgnRequestStatus)
        : undefined

      // Build where clause with multi-tenant filtering
      const where: Prisma.BanperRequestTrackingWhereInput = {
        program: {
          sppgId: session.user.sppgId!, // MANDATORY multi-tenant filter
        },
        ...(status && { bgnStatus: status }),
        ...(programId && { programId }),
        ...(search && {
          OR: [
            { bgnRequestNumber: { contains: search, mode: 'insensitive' as const } },
            { bgnApprovalNumber: { contains: search, mode: 'insensitive' as const } },
          ],
        }),
      }

      // Fetch banper tracking records with relations
      const trackingRecords = await db.banperRequestTracking.findMany({
        where,
        orderBy: [
          { bgnStatus: 'asc' }, // Pending first
          { bgnSubmissionDate: 'desc' }, // Newest first
        ],
        include: {
          program: {
            select: {
              id: true,
              name: true,
              programCode: true,
              programType: true,
              startDate: true,
              endDate: true,
              allowedTargetGroups: true,
              targetRecipients: true,
              sppg: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
          _count: {
            select: {
              budgetAllocations: true,
            },
          },
        },
      })

      return NextResponse.json({ success: true, data: trackingRecords })
    } catch (error) {
      console.error('GET /api/sppg/banper-tracking error:', error)
      return NextResponse.json(
        {
          error: 'Failed to fetch banper tracking records',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}

/**
 * POST /api/sppg/banper-tracking
 * Create new banper request tracking
 * Auto-populate: requestCode, requestDate, requestStatus (DRAFT)
 * 
 * @rbac Protected by withSppgAuth with role validation
 * @audit Automatic logging via middleware
 */
export async function POST(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // Role Check - Only certain roles can create banper tracking
      const allowedRoles: UserRole[] = [
        'PLATFORM_SUPERADMIN',
        'SPPG_KEPALA',
        'SPPG_ADMIN',
        'SPPG_AKUNTAN',
      ]

      if (!session.user.userRole || !allowedRoles.includes(session.user.userRole as UserRole)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }

      // Verify SPPG exists and is active
      const sppg = await db.sPPG.findFirst({
        where: {
          id: session.user.sppgId!,
          status: 'ACTIVE',
        },
      })

      if (!sppg) {
        return NextResponse.json({ error: 'SPPG not found or inactive' }, { status: 403 })
      }

      // Parse and validate request body
      const body = await request.json()
      const validated = createBanperRequestSchema.safeParse(body)

      if (!validated.success) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: validated.error.issues,
          },
          { status: 400 }
        )
      }

      // Verify program belongs to SPPG
      const program = await db.nutritionProgram.findFirst({
        where: {
          id: validated.data.programId ?? undefined,
          sppgId: session.user.sppgId!,
        },
      })

      if (!program && validated.data.programId) {
        return NextResponse.json(
          { error: 'Program not found or access denied' },
          { status: 404 }
        )
      }

      // Check if banper tracking already exists for this program
      if (validated.data.programId) {
        const existingTracking = await db.banperRequestTracking.findFirst({
          where: {
            programId: validated.data.programId,
          },
        })

        if (existingTracking) {
          return NextResponse.json(
            { error: 'Banper tracking already exists for this program' },
            { status: 409 }
          )
        }
      }

      // Create banper tracking with auto-populated fields (bgnStatus = DRAFT)
      // Filter out null values for Prisma compatibility
      const createData: Record<string, unknown> = {
        sppgId: session.user.sppgId!,
        bgnStatus: 'DRAFT_LOCAL',
        createdBy: session.user.name || session.user.email,
      }

      // Add validated fields, excluding null values
      for (const [key, value] of Object.entries(validated.data)) {
        if (value !== null && value !== undefined) {
          createData[key] = value
        }
      }

      const tracking = await db.banperRequestTracking.create({
        // @ts-expect-error - Prisma type inference issue with nullable JSON fields
        data: createData,
        include: {
          program: {
            select: {
              id: true,
              name: true,
              programCode: true,
              programType: true,
              startDate: true,
              endDate: true,
              allowedTargetGroups: true,
              targetRecipients: true,
              sppg: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
        },
      })

      return NextResponse.json({ success: true, data: tracking }, { status: 201 })
    } catch (error) {
      console.error('POST /api/sppg/banper-tracking error:', error)
      return NextResponse.json(
        {
          error: 'Failed to create banper tracking',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}
