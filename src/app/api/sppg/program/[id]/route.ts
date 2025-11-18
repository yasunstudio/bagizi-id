/**
 * @fileoverview API endpoint untuk single Program - GET, PUT, DELETE
 * @version Next.js 15.5.4 / Auth.js v5
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * RBAC Integration:
 * - GET: Protected by withSppgAuth (all SPPG roles)
 * - PUT: Protected by withSppgAuth with role check
 * - DELETE: Protected by withSppgAuth with strict role check
 * - Automatic audit logging for all operations
 * - Multi-tenant: Program ownership verified via sppgId
 * 
 * CRITICAL: Multi-tenant security - verify program belongs to user's SPPG
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { updateProgramSchema } from '@/features/sppg/program/schemas'
import { UserRole } from '@prisma/client'

/**
 * GET /api/sppg/program/[id]
 * Fetch single program by ID
 * Includes stats if includeStats=true query param
 * 
 * @rbac Protected by withSppgAuth - requires valid SPPG session
 * @audit Automatic logging via middleware
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id } = await params

      // Parse query params
      const { searchParams } = new URL(request.url)
      const includeStats = searchParams.get('includeStats') === 'true'

      // Fetch program with multi-tenant security
      const program = await db.nutritionProgram.findFirst({
        where: {
          id,
          sppgId: session.user.sppgId!, // MANDATORY multi-tenant filter
        },
        include: {
          sppg: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          // ✅ Include beneficiaryEnrollments for Overview tab
          // Filter by:
          // 1. isActive: true (only active enrollments)
          // 2. targetGroup IN allowedTargetGroups (only allowed target groups)
          // NOTE: We'll filter targetGroup after fetching program.allowedTargetGroups
          beneficiaryEnrollments: {
            where: {
              isActive: true
            },
            select: {
              id: true,
              enrollmentStatus: true,
              enrollmentDate: true,
              startDate: true,
              endDate: true,
              targetBeneficiaries: true,
              activeBeneficiaries: true,
              targetGroup: true,
              beneficiaryOrg: {
                select: {
                  id: true,
                  organizationName: true,
                  type: true,
                }
              }
            },
            orderBy: {
              enrollmentDate: 'desc'
            }
          },
          ...(includeStats && {
            _count: {
              select: {
                menus: true,
                menuPlans: true,
                productions: true,
                distributions: true,
                beneficiaryEnrollments: true, // ✅ FIXED: programEnrollments → beneficiaryEnrollments
                feedback: true,
              },
            },
          }),
        },
      })

      if (!program) {
        return NextResponse.json({ error: 'Program not found' }, { status: 404 })
      }

      // ✅ CRITICAL: Filter enrollments by allowedTargetGroups
      // Remove enrollments with targetGroup NOT in program.allowedTargetGroups
      // This prevents showing orphaned enrollments from old target groups
      if (program.beneficiaryEnrollments) {
        program.beneficiaryEnrollments = program.beneficiaryEnrollments.filter(
          enrollment => program.allowedTargetGroups.includes(enrollment.targetGroup)
        )
      }

      return NextResponse.json({ success: true, data: program })
    } catch (error) {
      console.error('GET /api/sppg/program/[id] error:', error)
      return NextResponse.json(
        {
          error: 'Failed to fetch program',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}

/**
 * PUT /api/sppg/program/[id]
 * Update existing program
 * Only fields provided will be updated (partial update)
 * 
 * @rbac Protected by withSppgAuth with role validation
 * @audit Automatic logging via middleware
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id } = await params

      // Role Check
      const allowedRoles: UserRole[] = [
        'PLATFORM_SUPERADMIN',
        'SPPG_KEPALA',
        'SPPG_ADMIN',
        'SPPG_AHLI_GIZI',
      ]

      if (!session.user.userRole || !allowedRoles.includes(session.user.userRole as UserRole)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }

      // Verify program exists and belongs to SPPG
      const existingProgram = await db.nutritionProgram.findFirst({
        where: {
          id,
          sppgId: session.user.sppgId!, // Multi-tenant security
        },
      })

      if (!existingProgram) {
        return NextResponse.json({ error: 'Program not found' }, { status: 404 })
      }

      // Parse and validate request body
      const body = await request.json()
      const validated = updateProgramSchema.safeParse(body)

      if (!validated.success) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: validated.error.issues,
          },
          { status: 400 }
        )
      }

      // Note: Partner schools are now managed via ProgramSchoolEnrollment junction table
      // Use the enrollment API endpoints to add/remove schools from programs

      // Update program
      const updatedProgram = await db.nutritionProgram.update({
        where: { id },
        data: validated.data,
        include: {
          sppg: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      })

      // Log audit trail
      console.log(`Program updated: ${updatedProgram.programCode} by user: ${session.user.email}`)

      return NextResponse.json({ success: true, data: updatedProgram })
    } catch (error) {
      console.error('PUT /api/sppg/program/[id] error:', error)
      return NextResponse.json(
        {
          error: 'Failed to update program',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}

/**
 * DELETE /api/sppg/program/[id]
 * Delete program
 * Cascade delete will remove: menus, menu plans, productions, distributions
 * 
 * @rbac Protected by withSppgAuth with strict role validation
 * @audit Automatic logging via middleware
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id } = await params

      // Role Check - Only SPPG_KEPALA and SUPERADMIN can delete
      const allowedRoles: UserRole[] = [
        'PLATFORM_SUPERADMIN',
        'SPPG_KEPALA',
      ]

      if (!session.user.userRole || !allowedRoles.includes(session.user.userRole as UserRole)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }

      // Verify program exists and belongs to SPPG
      const existingProgram = await db.nutritionProgram.findFirst({
        where: {
          id,
          sppgId: session.user.sppgId!, // Multi-tenant security
        },
        include: {
          _count: {
            select: {
              menus: true,
              menuPlans: true,
              productions: true,
              distributions: true,
            },
          },
        },
      })

      if (!existingProgram) {
        return NextResponse.json({ error: 'Program not found' }, { status: 404 })
      }

      // Check if program has dependencies (optional warning)
      const hasMenus = existingProgram._count.menus > 0
      const hasProductions = existingProgram._count.productions > 0
      const hasDistributions = existingProgram._count.distributions > 0

      if (hasMenus || hasProductions || hasDistributions) {
        console.warn(`Deleting program with dependencies: 
        Menus: ${existingProgram._count.menus}
        Productions: ${existingProgram._count.productions}
        Distributions: ${existingProgram._count.distributions}
      `)
      }

      // Delete program (cascade will handle related records)
      await db.nutritionProgram.delete({
        where: { id },
      })

      // Log audit trail
      console.log(`Program deleted: ${existingProgram.programCode} by user: ${session.user.email}`)

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('DELETE /api/sppg/program/[id] error:', error)
      return NextResponse.json(
        {
          error: 'Failed to delete program',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}
