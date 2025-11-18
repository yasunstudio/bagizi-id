/**
 * Program Beneficiary Enrollments API Route
 * 
 * Handles GET (list all enrollments) and POST (create enrollment) operations
 * for ProgramBeneficiaryEnrollment with multi-tenant security and validation.
 * 
 * @fileoverview Enrollment API endpoints with enterprise patterns
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/PROGRAM_BENEFICIARY_ARCHITECTURE_ANALYSIS.md} Architecture Guide
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth, type AuthSession } from '@/lib/api-middleware'
import { createBeneficiaryEnrollmentSchema } from '@/features/sppg/program/schemas/beneficiaryEnrollmentSchema'
import { validateEnrollment } from '@/lib/enrollment-validators'
import { isProgramBudgetExceeded } from '@/lib/enrollment-helpers'
import { db } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

/**
 * GET /api/sppg/program/[id]/enrollments
 * 
 * Fetch all enrollments for a program with optional filtering
 * 
 * Query Parameters:
 * - status: EnrollmentStatus (ACTIVE, PAUSED, COMPLETED, CANCELLED)
 * - schoolType: string (SD, SMP, SMA, TK)
 * - search: string (search school name or code)
 * - isActive: boolean
 * - hasContract: boolean
 * - minStudents: number
 * - maxStudents: number
 * 
 * @returns JSON response with enrollment list or error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withSppgAuth(request, async (session: AuthSession) => {
    // 1. Verify program belongs to SPPG
    const program = await db.nutritionProgram.findFirst({
      where: {
        id: params.id,
        sppgId: session.user.sppgId!
      }
    })

    if (!program) {
      return NextResponse.json({ 
        success: false,
        error: 'Program not found or access denied' 
      }, { status: 404 })
    }

    // 2. Extract query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const targetGroup = searchParams.get('targetGroup')
    const organizationType = searchParams.get('organizationType')
    const search = searchParams.get('search')

    // 3. Build where clause with filters
    const where: Prisma.ProgramBeneficiaryEnrollmentWhereInput = {
      programId: params.id,
      sppgId: session.user.sppgId!, // Multi-tenant filter
    }

    // 4. Apply filters
    if (status) {
      where.enrollmentStatus = status as Prisma.EnumProgramEnrollmentStatusFilter
    }

    if (targetGroup) {
      where.targetGroup = targetGroup as Prisma.EnumTargetGroupFilter
    }

    if (organizationType || search) {
      where.beneficiaryOrg = {}
      
      if (organizationType) {
        where.beneficiaryOrg.type = organizationType as Prisma.EnumBeneficiaryOrganizationTypeFilter
      }
      
      if (search) {
        where.beneficiaryOrg.OR = [
          { organizationName: { contains: search, mode: 'insensitive' } },
          { organizationCode: { contains: search, mode: 'insensitive' } },
        ]
      }
    }

    // 5. Fetch enrollments with relations
    const enrollments = await db.programBeneficiaryEnrollment.findMany({
      where,
      include: {
        beneficiaryOrg: {
          select: {
            id: true,
            organizationName: true,
            organizationCode: true,
            type: true,
            subType: true,
            address: true,
            phone: true,
            email: true,
            contactPerson: true,
            operationalStatus: true,
          }
        },
        program: {
          select: {
            id: true,
            name: true,
            programCode: true,
            programType: true,
          }
        }
      },
      orderBy: {
        beneficiaryOrg: {
          organizationName: 'asc'
        }
      }
    })

    console.log('[ENROLLMENT API] Found enrollments:', {
      count: enrollments.length,
      programId: params.id,
      sppgId: session.user.sppgId
    })

    return NextResponse.json({ 
      success: true, 
      data: enrollments 
    })
  })
}

/**
 * POST /api/sppg/program/[id]/enrollments
 * 
 * Create new enrollment for a beneficiary organization in the program
 * 
 * Request Body: BeneficiaryEnrollmentInput (validated with Zod schema)
 * 
 * @returns JSON response with created enrollment or error
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withSppgAuth(request, async (session: AuthSession) => {
    // 1. Verify program belongs to SPPG
    const program = await db.nutritionProgram.findFirst({
      where: {
        id: params.id,
        sppgId: session.user.sppgId!
      },
      select: {
        id: true,
        allowedTargetGroups: true,
        startDate: true,
        endDate: true,
        budgetPerMeal: true,
      }
    })

    if (!program) {
      return NextResponse.json({ 
        success: false,
        error: 'Program not found or access denied' 
      }, { status: 404 })
    }

    // 2. Parse and validate request body
    const body = await request.json()
    const validated = createBeneficiaryEnrollmentSchema.safeParse(body)
    
    if (!validated.success) {
      return NextResponse.json({ 
        success: false,
        error: 'Validation failed',
        details: validated.error.issues
      }, { status: 400 })
    }

    // 3. Verify beneficiary organization exists and belongs to SPPG
    const beneficiaryOrg = await db.beneficiaryOrganization.findFirst({
      where: {
        id: validated.data.beneficiaryOrgId,
        sppgId: session.user.sppgId!
      }
    })

    if (!beneficiaryOrg) {
      return NextResponse.json({ 
        success: false,
        error: 'Beneficiary organization not found or access denied' 
      }, { status: 404 })
    }

    // 4. Check for duplicate enrollment (same beneficiaryOrg + program + targetGroup)
    const existing = await db.programBeneficiaryEnrollment.findFirst({
      where: {
        beneficiaryOrgId: validated.data.beneficiaryOrgId,
        programId: params.id,
        targetGroup: validated.data.targetGroup
      }
    })

    if (existing) {
      return NextResponse.json({ 
        success: false,
        error: `Beneficiary organization already enrolled for target group ${validated.data.targetGroup}`,
        details: {
          existingEnrollmentId: existing.id,
          enrollmentStatus: existing.enrollmentStatus
        }
      }, { status: 409 })
    }

    // 5. Comprehensive validation using validation layer
    try {
      await validateEnrollment({
        ...validated.data,
        programId: params.id,
        sppgId: session.user.sppgId!,
      })
    } catch (validationError) {
      return NextResponse.json({ 
        success: false,
        error: (validationError as Error).message,
        code: 'VALIDATION_ERROR'
      }, { status: 400 })
    }

    // 6. Budget validation (if monthlyBudgetAllocation is provided)
    if (validated.data.monthlyBudgetAllocation) {
      const budgetCheck = await isProgramBudgetExceeded(params.id)

      if (budgetCheck.exceeded) {
        return NextResponse.json({
          success: false,
          error: 'Monthly budget allocation would exceed program budget',
          details: {
            totalBudget: budgetCheck.totalBudget,
            allocated: budgetCheck.allocated,
            remaining: budgetCheck.remaining,
            utilizationRate: budgetCheck.utilizationRate
          }
        }, { status: 400 })
      }
    }

    // 7. Create enrollment
    const { targetGroupSpecificData, ...restData } = validated.data
    const enrollment = await db.programBeneficiaryEnrollment.create({
      data: {
        ...restData,
        targetGroupSpecificData: targetGroupSpecificData ?? Prisma.JsonNull,
        programId: params.id,
        sppgId: session.user.sppgId!,
        enrolledBy: session.user.id,
      },
      include: {
        beneficiaryOrg: {
          select: {
            id: true,
            organizationName: true,
            organizationCode: true,
            type: true,
            subType: true,
            address: true,
            phone: true,
            email: true,
            contactPerson: true,
            operationalStatus: true,
          }
        },
        program: {
          select: {
            id: true,
            name: true,
            programCode: true,
            programType: true,
          }
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      data: enrollment 
    }, { status: 201 })
  })
}
