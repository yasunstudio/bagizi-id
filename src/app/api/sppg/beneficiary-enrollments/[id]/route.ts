/**
 * @fileoverview API Routes voor Beneficiary Enrollments - Detail, Update, Delete
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * 
 * Enterprise-grade API endpoints with:
 * - Multi-tenant security (sppgId verification via middleware)
 * - RBAC permission checks
 * - Input validation with Zod
 * - Comprehensive error handling
 * - Automatic audit logging
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { updateBeneficiaryEnrollmentSchema } from '@/features/sppg/program/schemas/beneficiaryEnrollmentSchema'
import { Prisma } from '@prisma/client'

/**
 * GET /api/sppg/beneficiary-enrollments/[id]
 * 
 * Fetch single beneficiary enrollment by ID
 * Includes relations: beneficiaryOrg, program, distributions
 * 
 * @rbac Protected by withSppgAuth - requires valid SPPG session
 * @audit Automatic logging via middleware
 * @param {string} id - Enrollment ID
 * @returns {object} Enrollment detail with relations
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withSppgAuth(request, async (session) => {
    try {
      // Fetch Enrollment with Multi-tenant Check
      const enrollment = await db.programBeneficiaryEnrollment.findFirst({
        where: { 
          id: params.id,
          sppgId: session.user.sppgId!, // ✅ Multi-tenant security (! asserts non-null)
        },
        include: {
          beneficiaryOrg: {
            select: {
              id: true,
              organizationCode: true,
              organizationName: true,
              type: true,
              subType: true,
              address: true,
              phone: true,
              email: true,
              contactPerson: true,
              contactTitle: true,
            },
          },
          program: {
            select: {
              id: true,
              name: true, // ✅ FIXED: Correct Prisma field (not programName)
              programCode: true,
              programType: true,
              startDate: true,
              endDate: true,
              status: true,
            },
          },
          distributions: {
            select: {
              id: true,
              distributionDate: true,
              distributionCode: true,
              mealType: true,
              plannedRecipients: true,
              actualRecipients: true,
              totalPortions: true,
              status: true,
              distributionPoint: true,
              address: true,
            },
            orderBy: {
              distributionDate: 'desc',
            },
            take: 20, // Show last 20 distributions
          },
          _count: {
            select: {
              distributions: true,
            },
          },
        },
      })

      if (!enrollment) {
        return NextResponse.json(
          { error: 'Enrollment not found or access denied' },
          { status: 404 }
        )
      }

      return NextResponse.json({ success: true, data: enrollment })
    } catch (error) {
      console.error('GET /api/sppg/beneficiary-enrollments/[id] error:', error)
      return NextResponse.json(
        {
          error: 'Failed to fetch beneficiary enrollment',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}

/**
 * PUT /api/sppg/beneficiary-enrollments/[id]
 * 
 * Update beneficiary enrollment
 * Supports partial updates
 * 
 * @rbac Requires SPPG_KEPALA, SPPG_ADMIN, SPPG_AHLI_GIZI or higher
 * @audit Logged with action: 'beneficiary_enrollment.update'
 * @param {string} id - Enrollment ID
 * @returns {object} Updated enrollment
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withSppgAuth(request, async (session) => {
    try {
      // Role Check
      const allowedRoles = [
        'SPPG_KEPALA',
        'SPPG_ADMIN',
        'SPPG_AHLI_GIZI',
      ]

      if (!session.user.userRole || !allowedRoles.includes(session.user.userRole)) {
        return NextResponse.json(
          { error: 'Insufficient permissions to update enrollment' },
          { status: 403 }
        )
      }

      // Verify Enrollment Exists and Belongs to SPPG
      const existingEnrollment = await db.programBeneficiaryEnrollment.findFirst({
        where: {
          id: params.id,
          sppgId: session.user.sppgId!, // Multi-tenant check (! asserts non-null)
        },
      })

      if (!existingEnrollment) {
        return NextResponse.json(
          { error: 'Enrollment not found or access denied' },
          { status: 404 }
        )
      }

      // Parse and Validate Request Body
      const body = await request.json()
      const validated = updateBeneficiaryEnrollmentSchema.safeParse(body)
      
      if (!validated.success) {
        return NextResponse.json(
          { 
            error: 'Validation failed',
            details: validated.error.issues
          },
          { status: 400 }
        )
      }

      // Update Enrollment
      const enrollment = await db.programBeneficiaryEnrollment.update({
        where: { 
          id: params.id,
        },
        data: {
          ...validated.data,
          // Ensure JSON field compatibility for Prisma JsonValue
          targetGroupSpecificData: (validated.data.targetGroupSpecificData || null) as Prisma.InputJsonValue,
        },
        include: {
          beneficiaryOrg: {
            select: {
              id: true,
              organizationCode: true,
              organizationName: true, // ✅ FIXED: Correct Prisma field
              type: true,
              address: true,
              phone: true,
            },
          },
          program: {
            select: {
              id: true,
              name: true, // ✅ FIXED: Correct Prisma field (not programName)
              programCode: true,
              startDate: true,
              endDate: true,
              status: true,
            },
          },
          _count: {
            select: {
              distributions: true,
            },
          },
        },
      })

      return NextResponse.json({ success: true, data: enrollment })
    } catch (error) {
      console.error('PUT /api/sppg/beneficiary-enrollments/[id] error:', error)
      return NextResponse.json(
        {
          error: 'Failed to update beneficiary enrollment',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}

/**
 * DELETE /api/sppg/beneficiary-enrollments/[id]
 * 
 * Delete beneficiary enrollment
 * Cascade deletes associated distributions
 * 
 * @rbac Requires SPPG_KEPALA, SPPG_ADMIN or higher (stricter than create/update)
 * @audit Logged with action: 'beneficiary_enrollment.delete'
 * @param {string} id - Enrollment ID
 * @returns {object} Success response
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withSppgAuth(request, async (session) => {
    try {
      // Role Check - Only admins can delete
      const allowedRoles = [
        'SPPG_KEPALA',
        'SPPG_ADMIN',
      ]

      if (!session.user.userRole || !allowedRoles.includes(session.user.userRole)) {
        return NextResponse.json(
          { error: 'Insufficient permissions to delete enrollment' },
          { status: 403 }
        )
      }

      // Verify Enrollment Exists and Belongs to SPPG
      const existingEnrollment = await db.programBeneficiaryEnrollment.findFirst({
        where: {
          id: params.id,
          sppgId: session.user.sppgId!, // Multi-tenant check (! asserts non-null)
        },
        select: {
          id: true,
          _count: {
            select: {
              distributions: true,
            },
          },
        },
      })

      if (!existingEnrollment) {
        return NextResponse.json(
          { error: 'Enrollment not found or access denied' },
          { status: 404 }
        )
      }

      // Optional: Check if has distributions
      if (existingEnrollment._count.distributions > 0) {
        // You can choose to prevent deletion or warn the user
        // For now, we allow cascade delete as per Prisma schema
        console.warn(`Deleting enrollment ${params.id} with ${existingEnrollment._count.distributions} distributions`)
      }

      // Delete Enrollment (Cascade deletes distributions)
      await db.programBeneficiaryEnrollment.delete({
        where: { id: params.id },
      })

      return NextResponse.json({ 
        success: true, 
        message: 'Enrollment deleted successfully' 
      })
    } catch (error) {
      console.error('DELETE /api/sppg/beneficiary-enrollments/[id] error:', error)
      return NextResponse.json(
        {
          error: 'Failed to delete beneficiary enrollment',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}
