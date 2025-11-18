/**
 * Program Beneficiary Enrollment Detail API Route
 * 
 * Handles GET (single enrollment), PUT (update), and DELETE operations
 * for individual ProgramBeneficiaryEnrollment with multi-tenant security.
 * 
 * @fileoverview Individual enrollment API endpoints with validation
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/PROGRAM_BENEFICIARY_ARCHITECTURE_ANALYSIS.md} Architecture Guide
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth, type AuthSession } from '@/lib/api-middleware'
import { createBeneficiaryEnrollmentSchema } from '@/features/sppg/program/schemas/beneficiaryEnrollmentSchema'
import { db } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

/**
 * GET /api/sppg/program/[id]/enrollments/[enrollmentId]
 * 
 * Fetch single enrollment by ID
 * 
 * @returns JSON response with enrollment details or error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; enrollmentId: string } }
) {
  return withSppgAuth(request, async (session: AuthSession) => {
    // Fetch enrollment with security checks
    const enrollment = await db.programBeneficiaryEnrollment.findFirst({
      where: {
        id: params.enrollmentId,
        programId: params.id,
        sppgId: session.user.sppgId! // Multi-tenant filter
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

    if (!enrollment) {
      return NextResponse.json({ 
        success: false,
        error: 'Enrollment not found or access denied' 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      data: enrollment 
    })
  })
}

/**
 * PUT /api/sppg/program/[id]/enrollments/[enrollmentId]
 * 
 * Update existing enrollment
 * 
 * Request Body: Partial<EnrollmentInput> (validated with Zod schema)
 * 
 * @returns JSON response with updated enrollment or error
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; enrollmentId: string } }
) {
  return withSppgAuth(request, async (session: AuthSession) => {
    try {
      console.log('🔍 PUT Enrollment - Start', {
        enrollmentId: params.enrollmentId,
        programId: params.id,
        sppgId: session.user.sppgId
      })

      // 1. Verify enrollment exists and belongs to SPPG
      const existing = await db.programBeneficiaryEnrollment.findFirst({
        where: {
          id: params.enrollmentId,
          programId: params.id,
          sppgId: session.user.sppgId!
        }
      })

      if (!existing) {
        console.log('❌ Enrollment not found')
        return NextResponse.json({ 
          success: false,
          error: 'Enrollment not found or access denied' 
        }, { status: 404 })
      }

      console.log('✓ Existing enrollment found:', existing.id)

      // 2. Parse and validate request body
      const body = await request.json()
      console.log('📝 Request body received:', JSON.stringify(body, null, 2))
      console.log('📋 Body field types:', {
        enrollmentDate: typeof body.enrollmentDate,
        startDate: typeof body.startDate,
        endDate: typeof body.endDate,
        contractStartDate: typeof body.contractStartDate,
        contractEndDate: typeof body.contractEndDate,
      })
      
      const validated = createBeneficiaryEnrollmentSchema.safeParse(body)
      
      if (!validated.success) {
        console.error('❌ Validation failed:', JSON.stringify(validated.error.issues, null, 2))
        return NextResponse.json({ 
          success: false,
          error: 'Validation failed',
          details: validated.error.issues
        }, { status: 400 })
      }
      
      console.log('✓ Validation passed')
      console.log('📦 Validated data:', JSON.stringify(validated.data, null, 2))
      
      // 3. Note: programId, beneficiaryOrgId, and targetGroup are immutable after creation
      // Remove them from update data to prevent accidental changes
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { programId, beneficiaryOrgId, targetGroup, ...updateData } = validated.data

      console.log('🔄 Updating database...')
      console.log('📝 Update data (filtered):', JSON.stringify(updateData, null, 2))

      // 4. Update enrollment
      const { targetGroupSpecificData, ...restUpdate } = updateData
      const enrollment = await db.programBeneficiaryEnrollment.update({
        where: {
          id: params.enrollmentId
        },
        data: {
          ...restUpdate,
          targetGroupSpecificData: targetGroupSpecificData === null 
            ? Prisma.JsonNull 
            : targetGroupSpecificData === undefined
            ? undefined
            : targetGroupSpecificData,
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

      console.log('✅ Update successful:', enrollment.id)

      return NextResponse.json({ 
        success: true, 
        data: enrollment 
      })
    } catch (error) {
      console.error('💥 PUT Enrollment error:', error)
      console.error('💥 Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
      })
      
      return NextResponse.json({ 
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }
  })
}

/**
 * DELETE /api/sppg/program/[id]/enrollments/[enrollmentId]
 * 
 * Delete enrollment (remove school from program)
 * 
 * Note: This will cascade delete related distribution records if configured
 * 
 * @returns JSON response with success status or error
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; enrollmentId: string } }
) {
  return withSppgAuth(request, async (session: AuthSession) => {
    // 1. Verify enrollment exists and belongs to SPPG
    const enrollment = await db.programBeneficiaryEnrollment.findFirst({
      where: {
        id: params.enrollmentId,
        programId: params.id,
        sppgId: session.user.sppgId!
      },
      include: {
        beneficiaryOrg: {
          select: {
            organizationName: true
          }
        }
      }
    })

    if (!enrollment) {
      return NextResponse.json({ 
        success: false,
        error: 'Enrollment not found or access denied' 
      }, { status: 404 })
    }

    // 2. Check if enrollment has active distributions
    const activeDistributions = await db.foodDistribution.count({
      where: {
        beneficiaryEnrollmentId: enrollment.id,
        status: {
          in: ['SCHEDULED', 'PREPARING', 'IN_TRANSIT', 'DISTRIBUTING']
        }
      }
    })

    if (activeDistributions > 0) {
      return NextResponse.json({ 
        success: false,
        error: 'Cannot delete enrollment with active distributions',
        details: {
          activeDistributions,
          suggestion: 'Please complete or cancel active distributions first'
        }
      }, { status: 409 })
    }

    // 3. Delete enrollment
    await db.programBeneficiaryEnrollment.delete({
      where: {
        id: params.enrollmentId
      }
    })

    return NextResponse.json({ 
      success: true,
      message: `Enrollment for ${enrollment.beneficiaryOrg.organizationName} removed successfully`
    })
  })
}