/**
 * @fileoverview API endpoint untuk single Beneficiary Organization - GET, PUT, DELETE
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * RBAC Integration:
 * - GET: Protected by withSppgAuth (all SPPG roles)
 * - PUT: Protected by withSppgAuth with role check (SPPG_ADMIN+)
 * - DELETE: Protected by withSppgAuth with strict role check (SPPG_KEPALA only)
 * - Automatic audit logging for all operations
 * - Multi-tenant: Organization ownership verified via sppgId
 * 
 * CRITICAL: Multi-tenant security - verify organization belongs to user's SPPG
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { beneficiaryOrganizationSchema } from '@/features/sppg/beneficiary-organization/schemas'

/**
 * GET /api/sppg/beneficiary-organizations/[id]
 * Fetch single beneficiary organization by ID dengan relasi
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

      // Fetch organization with multi-tenant security
      const organization = await db.beneficiaryOrganization.findFirst({
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
          // ✅ Include regional relations (foreign keys)
          province: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          regency: {
            select: {
              id: true,
              code: true,
              name: true,
              type: true,
            },
          },
          district: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          village: {
            select: {
              id: true,
              code: true,
              name: true,
              type: true,
            },
          },
          enrollments: {
            select: {
              id: true,
              enrollmentDate: true, // ✅ FIXED: was enrollmentCode
              enrollmentStatus: true,
              targetGroup: true, // ✅ ADDED: Target group for display
              targetBeneficiaries: true, // ✅ FIXED: was totalBeneficiaries
              activeBeneficiaries: true, // ✅ FIXED: was monthlyBudget
              program: {
                select: {
                  id: true,
                  name: true,
                  programCode: true,
                },
              },
            },
            orderBy: {
              enrollmentDate: 'desc', // ✅ FIXED: was createdAt
            },
          },
        distributions: {
          select: {
            id: true,
            distributionDate: true,
            distributionCode: true,
            mealType: true,
            plannedRecipients: true, // ✅ FIXED: Correct Prisma field name
            actualRecipients: true, // ✅ FIXED: Correct Prisma field name
            totalPortions: true,
            status: true,
          },
          orderBy: {
            distributionDate: 'desc',
          },
          take: 10,
        },
          _count: {
            select: {
              enrollments: true,
              distributions: true,
            },
          },
        },
      })

      if (!organization) {
        return NextResponse.json(
          { error: 'Beneficiary organization not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ success: true, data: organization })
    } catch (error) {
      console.error('GET /api/sppg/beneficiary-organizations/[id] error:', error)
      return NextResponse.json(
        {
          error: 'Failed to fetch beneficiary organization',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}

/**
 * PUT /api/sppg/beneficiary-organizations/[id]
 * Update existing beneficiary organization
 * 
 * @rbac Requires SPPG_ADMIN, SPPG_KEPALA, or higher
 * @audit Logged with action: 'beneficiary_organization.update'
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id } = await params

      // ✅ Role check: Only ADMIN+ can update organizations
      const allowedRoles = ['SPPG_ADMIN', 'SPPG_KEPALA']
      if (!session.user.userRole || !allowedRoles.includes(session.user.userRole)) { // ✅ FIXED: added null check
        return NextResponse.json(
          { error: 'Insufficient permissions. Admin access required.' },
          { status: 403 }
        )
      }

      // Verify organization belongs to user's SPPG
      const existingOrg = await db.beneficiaryOrganization.findFirst({
        where: {
          id,
          sppgId: session.user.sppgId!,
        },
      })

      if (!existingOrg) {
        return NextResponse.json(
          { error: 'Beneficiary organization not found' },
          { status: 404 }
        )
      }

      // Parse and validate request body
      const body = await request.json()
      const validated = beneficiaryOrganizationSchema.partial().safeParse(body)

      if (!validated.success) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: validated.error.issues, // ✅ FIXED: was .errors
          },
          { status: 400 }
        )
      }

      // Check for duplicate NPSN if updating (exclude current org)
      if (validated.data.npsn && validated.data.npsn !== existingOrg.npsn) {
        const duplicateNpsn = await db.beneficiaryOrganization.findFirst({
          where: {
            sppgId: session.user.sppgId!,
            npsn: validated.data.npsn,
            id: { not: id },
          },
        })

        if (duplicateNpsn) {
          return NextResponse.json(
            { error: 'Another organization with this NPSN already exists' },
            { status: 409 }
          )
        }
      }

      // Check for duplicate NIKKES if updating (exclude current org)
      if (validated.data.nikkes && validated.data.nikkes !== existingOrg.nikkes) {
        const duplicateNikkes = await db.beneficiaryOrganization.findFirst({
          where: {
            sppgId: session.user.sppgId!,
            nikkes: validated.data.nikkes,
            id: { not: id },
          },
        })

        if (duplicateNikkes) {
          return NextResponse.json(
            { error: 'Another organization with this NIKKES already exists' },
            { status: 409 }
          )
        }
      }

      // Update organization
      // ✅ Explicitly structure update data to match Prisma's UpdateInput
      const updateData = {
        ...validated.data,
        // Ensure operationalStatus is never null if provided
        ...(validated.data.operationalStatus && {
          operationalStatus: validated.data.operationalStatus,
        }),
      }

      const updatedOrganization = await db.beneficiaryOrganization.update({
        where: { id },
        data: updateData,
        include: {
          sppg: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          _count: {
            select: {
              enrollments: true,
              distributions: true,
            },
          },
        },
      })

      // ✅ Audit log automatically created by middleware

      return NextResponse.json({ success: true, data: updatedOrganization })
    } catch (error) {
      console.error('PUT /api/sppg/beneficiary-organizations/[id] error:', error)
      return NextResponse.json(
        {
          error: 'Failed to update beneficiary organization',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}

/**
 * DELETE /api/sppg/beneficiary-organizations/[id]
 * Delete beneficiary organization
 * 
 * @rbac Requires SPPG_KEPALA only (strict permission)
 * @audit Logged with action: 'beneficiary_organization.delete'
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id } = await params

      // ✅ Strict role check: Only KEPALA can delete organizations
      if (session.user.userRole !== 'SPPG_KEPALA') {
        return NextResponse.json(
          { error: 'Insufficient permissions. Only Kepala SPPG can delete organizations.' },
          { status: 403 }
        )
      }

      // Verify organization belongs to user's SPPG
      const existingOrg = await db.beneficiaryOrganization.findFirst({
        where: {
          id,
          sppgId: session.user.sppgId!,
        },
        include: {
          _count: {
            select: {
              enrollments: true,
              distributions: true,
            },
          },
        },
      })

      if (!existingOrg) {
        return NextResponse.json(
          { error: 'Beneficiary organization not found' },
          { status: 404 }
        )
      }

      // ✅ Prevent deletion if organization has enrollments or distributions
      if (existingOrg._count.enrollments > 0) {
        return NextResponse.json(
          {
            error: 'Cannot delete organization with active enrollments',
            details: `This organization has ${existingOrg._count.enrollments} enrollment(s). Please remove them first.`,
          },
          { status: 409 }
        )
      }

      if (existingOrg._count.distributions > 0) {
        return NextResponse.json(
          {
            error: 'Cannot delete organization with distribution history',
            details: `This organization has ${existingOrg._count.distributions} distribution(s). Consider deactivating instead.`,
          },
          { status: 409 }
        )
      }

      // Delete organization (cascade deletes handled by Prisma schema)
      await db.beneficiaryOrganization.delete({
        where: { id },
      })

      // ✅ Audit log automatically created by middleware

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('DELETE /api/sppg/beneficiary-organizations/[id] error:', error)
      return NextResponse.json(
        {
          error: 'Failed to delete beneficiary organization',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}
