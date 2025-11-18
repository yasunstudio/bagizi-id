/**
 * @fileoverview API Routes untuk Beneficiary Enrollments - List & Create
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * 
 * Enterprise-grade API endpoints with:
 * - Multi-tenant security (sppgId filtering via middleware)
 * - RBAC permission checks
 * - Input validation with Zod
 * - Comprehensive error handling
 * - Automatic audit logging
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { createBeneficiaryEnrollmentSchema } from '@/features/sppg/program/schemas/beneficiaryEnrollmentSchema'
import { validateEnrollmentTargetGroup } from '@/lib/programValidation'
import { TargetGroup, ProgramEnrollmentStatus, Prisma } from '@prisma/client'

/**
 * GET /api/sppg/beneficiary-enrollments
 * 
 * Fetch all beneficiary enrollments with filtering
 * Auto-filtered by sppgId via middleware for multi-tenant security
 * 
 * Query Parameters:
 * @param {string} programId - Filter by program ID
 * @param {string} beneficiaryOrgId - Filter by organization ID
 * @param {TargetGroup} targetGroup - Filter by target group (SCHOOL_CHILDREN, TODDLER, etc.)
 * @param {ProgramEnrollmentStatus} enrollmentStatus - Filter by status (ACTIVE, PAUSED, etc.)
 * @param {boolean} isActive - Filter by active status
 * @param {boolean} isPriority - Filter by priority status
 * @param {string} search - Search in delivery address, contact, notes
 * 
 * @rbac Protected by withSppgAuth - requires valid SPPG session
 * @audit Automatic logging via middleware
 * @returns {Array} Beneficiary enrollments with relations
 */
export async function GET(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // Parse Query Parameters
      const { searchParams } = new URL(request.url)
      const programIdParam = searchParams.get('programId')
      const beneficiaryOrgIdParam = searchParams.get('beneficiaryOrgId')
      const targetGroupParam = searchParams.get('targetGroup')
      const enrollmentStatusParam = searchParams.get('enrollmentStatus')
      const isActiveParam = searchParams.get('isActive')
      const isPriorityParam = searchParams.get('isPriority')
      const search = searchParams.get('search')

      // Validate Enum Parameters
      const targetGroup = targetGroupParam && Object.values(TargetGroup).includes(targetGroupParam as TargetGroup)
        ? (targetGroupParam as TargetGroup)
        : undefined

      const enrollmentStatus = enrollmentStatusParam && Object.values(ProgramEnrollmentStatus).includes(enrollmentStatusParam as ProgramEnrollmentStatus)
        ? (enrollmentStatusParam as ProgramEnrollmentStatus)
        : undefined

      // Build Where Clause (Multi-tenant + Filters)
      const where: Record<string, unknown> = {
        sppgId: session.user.sppgId, // ✅ CRITICAL: Multi-tenant filtering
      }

      if (programIdParam) where.programId = programIdParam
      if (beneficiaryOrgIdParam) where.beneficiaryOrgId = beneficiaryOrgIdParam
      if (targetGroup) where.targetGroup = targetGroup
      if (enrollmentStatus) where.enrollmentStatus = enrollmentStatus
      if (isActiveParam) where.isActive = isActiveParam === 'true'
      if (isPriorityParam) where.isPriority = isPriorityParam === 'true'

      // Search across relevant text fields
      if (search) {
        where.OR = [
          { deliveryAddress: { contains: search, mode: 'insensitive' } },
          { deliveryContact: { contains: search, mode: 'insensitive' } },
          { remarks: { contains: search, mode: 'insensitive' } },
          { internalNotes: { contains: search, mode: 'insensitive' } },
        ]
      }

      // Fetch Enrollments with Relations
      const enrollments = await db.programBeneficiaryEnrollment.findMany({
        where,
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
            },
            orderBy: {
              distributionDate: 'desc',
            },
            take: 5, // Show last 5 distributions
          },
          _count: {
            select: {
              distributions: true,
            },
          },
        },
        orderBy: [
          { isPriority: 'desc' }, // Priority first
          { startDate: 'desc' },   // Then by start date
        ],
      })

      return NextResponse.json({ success: true, data: enrollments })
    } catch (error) {
      console.error('GET /api/sppg/beneficiary-enrollments error:', error)
      return NextResponse.json(
        {
          error: 'Failed to fetch beneficiary enrollments',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}

/**
 * POST /api/sppg/beneficiary-enrollments
 * 
 * Create new beneficiary enrollment
 * 
 * @rbac Requires SPPG_KEPALA, SPPG_ADMIN, SPPG_AHLI_GIZI or higher
 * @audit Logged with action: 'beneficiary_enrollment.create'
 * 
 * Request Body:
 * @see CreateBeneficiaryEnrollmentInput
 * 
 * @returns {object} Created enrollment with relations
 */
export async function POST(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // Role Check - Only specific roles can create enrollments
      const allowedRoles = [
        'SPPG_KEPALA',
        'SPPG_ADMIN',
        'SPPG_AHLI_GIZI',
      ]

      if (!session.user.userRole || !allowedRoles.includes(session.user.userRole)) {
        return NextResponse.json(
          { error: 'Insufficient permissions to create enrollment' },
          { status: 403 }
        )
      }

      // Parse and Validate Request Body
      const body = await request.json()
      const validated = createBeneficiaryEnrollmentSchema.safeParse(body)
      
      if (!validated.success) {
        return NextResponse.json(
          { 
            error: 'Validation failed',
            details: validated.error.issues
          },
          { status: 400 }
        )
      }

      // Verify Program Exists and Belongs to SPPG
      const program = await db.nutritionProgram.findFirst({
        where: {
          id: validated.data.programId,
          sppgId: session.user.sppgId!, // Multi-tenant check (! asserts non-null)
        },
        select: {
          id: true,
          allowedTargetGroups: true,
        },
      })

      if (!program) {
        return NextResponse.json(
          { error: 'Program not found or access denied' },
          { status: 404 }
        )
      }

      // Phase 2: Validate target group against program configuration
      const targetGroupValidation = validateEnrollmentTargetGroup(
        program,
        validated.data.targetGroup
      )

      if (!targetGroupValidation.valid) {
        return NextResponse.json(
          { error: targetGroupValidation.error },
          { status: 400 }
        )
      }

      // Verify Beneficiary Organization Exists and Belongs to SPPG
      const beneficiaryOrg = await db.beneficiaryOrganization.findFirst({
        where: {
          id: validated.data.beneficiaryOrgId,
          sppgId: session.user.sppgId!, // Multi-tenant check (! asserts non-null)
        },
      })

      if (!beneficiaryOrg) {
        return NextResponse.json(
          { error: 'Beneficiary organization not found or access denied' },
          { status: 404 }
        )
      }

      // Check for Duplicate Enrollment
      const existingEnrollment = await db.programBeneficiaryEnrollment.findFirst({
        where: {
          programId: validated.data.programId,
          beneficiaryOrgId: validated.data.beneficiaryOrgId,
          targetGroup: validated.data.targetGroup,
          enrollmentStatus: {
            in: ['DRAFT', 'ACTIVE', 'PAUSED'], // Only check active statuses
          },
        },
      })

      if (existingEnrollment) {
        return NextResponse.json(
          { error: 'Active enrollment already exists for this organization and target group' },
          { status: 409 }
        )
      }

      // Create Enrollment
      const enrollment = await db.programBeneficiaryEnrollment.create({
        data: {
          ...validated.data,
          sppgId: session.user.sppgId!, // ✅ Multi-tenant safety (! asserts non-null)
          enrolledBy: session.user.id,
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

      return NextResponse.json({ success: true, data: enrollment }, { status: 201 })
    } catch (error) {
      console.error('POST /api/sppg/beneficiary-enrollments error:', error)
      return NextResponse.json(
        {
          error: 'Failed to create beneficiary enrollment',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}
