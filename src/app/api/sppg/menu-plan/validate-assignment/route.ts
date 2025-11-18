/**
 * @fileoverview API Route - Validate Menu Assignment Compatibility
 * @description Checks if a menu is compatible with an enrollment's target group
 * @version Next.js 15.5.4 / Prisma 6.19.0 / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/MENU_TARGET_GROUPS_IMPLEMENTATION_SUMMARY.md} Implementation Guide
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { z } from 'zod'
import type { TargetGroup } from '@prisma/client'

/**
 * Validation schema for assignment check request
 */
const validateAssignmentSchema = z.object({
  menuId: z.string().cuid('Invalid menu ID format'),
  enrollmentId: z.string().cuid('Invalid enrollment ID format'),
})

/**
 * Response type for validation result
 */
interface ValidationResponse {
  success: boolean
  compatible: boolean
  error?: string
  details?: {
    menuName?: string
    menuTargetGroups?: TargetGroup[]
    enrollmentTargetGroup?: TargetGroup
    beneficiaryName?: string
    reason?: string
  }
}

/**
 * POST /api/sppg/menu-plan/validate-assignment
 * Validates if a menu can be assigned to a specific enrollment based on target group compatibility
 * 
 * @param request - Request body containing menuId and enrollmentId
 * @returns ValidationResponse with compatibility status
 * 
 * @example
 * ```typescript
 * const response = await fetch('/api/sppg/menu-plan/validate-assignment', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     menuId: 'cm3...',
 *     enrollmentId: 'cm3...'
 *   })
 * })
 * 
 * const { compatible } = await response.json()
 * if (!compatible) {
 *   alert('Menu tidak compatible dengan beneficiary ini')
 * }
 * ```
 */
export async function POST(request: NextRequest): Promise<NextResponse<ValidationResponse>> {
  try {
    // 1. Authentication Check
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          compatible: false,
          error: 'Unauthorized - Please login to continue',
        },
        { status: 401 }
      )
    }

    // 2. SPPG Access Check (Multi-tenant Security)
    if (!session.user.sppgId) {
      return NextResponse.json(
        {
          success: false,
          compatible: false,
          error: 'SPPG access required',
        },
        { status: 403 }
      )
    }

    // 3. Parse and Validate Request Body
    const body = await request.json()
    const validation = validateAssignmentSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          compatible: false,
          error: 'Validation failed',
          details: {
            reason: validation.error.issues.map((e) => e.message).join(', '),
          },
        },
        { status: 400 }
      )
    }

    const { menuId, enrollmentId } = validation.data

    // 4. Fetch Menu with Target Groups (with SPPG isolation)
    const menu = await db.nutritionMenu.findFirst({
      where: {
        id: menuId,
        program: {
          sppgId: session.user.sppgId, // Multi-tenant filter
        },
      },
      select: {
        id: true,
        menuName: true,
        compatibleTargetGroups: true,
        program: {
          select: {
            sppgId: true,
          },
        },
      },
    })

    if (!menu) {
      return NextResponse.json(
        {
          success: false,
          compatible: false,
          error: 'Menu not found or access denied',
          details: {
            reason: 'Menu tidak ditemukan atau Anda tidak memiliki akses',
          },
        },
        { status: 404 }
      )
    }

    // 5. Fetch Enrollment with Target Group (with SPPG isolation)
    const enrollment = await db.programBeneficiaryEnrollment.findFirst({
      where: {
        id: enrollmentId,
        sppgId: session.user.sppgId, // Multi-tenant filter
      },
      select: {
        id: true,
        targetGroup: true,
        beneficiaryOrg: {
          select: {
            organizationName: true,
          },
        },
      },
    })

    if (!enrollment) {
      return NextResponse.json(
        {
          success: false,
          compatible: false,
          error: 'Enrollment not found or access denied',
          details: {
            reason: 'Enrollment tidak ditemukan atau Anda tidak memiliki akses',
          },
        },
        { status: 404 }
      )
    }

    // 6. Compatibility Check Logic
    const menuTargetGroups = menu.compatibleTargetGroups as TargetGroup[]
    const enrollmentTargetGroup = enrollment.targetGroup

    // 6a. Universal Menu Check (empty array = compatible with all)
    if (menuTargetGroups.length === 0) {
      return NextResponse.json({
        success: true,
        compatible: true,
        details: {
          menuName: menu.menuName,
          menuTargetGroups: [],
          enrollmentTargetGroup,
          beneficiaryName: enrollment.beneficiaryOrg.organizationName,
          reason: 'Universal menu - compatible dengan semua target group',
        },
      })
    }

    // 6b. Target-Specific Menu Check
    const isCompatible = menuTargetGroups.includes(enrollmentTargetGroup)

    if (!isCompatible) {
      // Get readable target group names
      const targetGroupLabels: Record<TargetGroup, string> = {
        PREGNANT_WOMAN: 'Ibu Hamil',
        BREASTFEEDING_MOTHER: 'Ibu Menyusui',
        SCHOOL_CHILDREN: 'Anak Sekolah Dasar',
        TODDLER: 'Balita',
        TEENAGE_GIRL: 'Remaja Putri',
        ELDERLY: 'Lansia',
      }

      const menuTargetLabels = menuTargetGroups.map((tg) => targetGroupLabels[tg]).join(', ')
      const enrollmentTargetLabel = targetGroupLabels[enrollmentTargetGroup as TargetGroup]

      return NextResponse.json(
        {
          success: false,
          compatible: false,
          error: 'Menu tidak compatible dengan target group beneficiary ini',
          details: {
            menuName: menu.menuName,
            menuTargetGroups,
            enrollmentTargetGroup,
            beneficiaryName: enrollment.beneficiaryOrg.organizationName,
            reason: `Menu "${menu.menuName}" hanya untuk: ${menuTargetLabels}. Beneficiary "${enrollment.beneficiaryOrg.organizationName}" adalah: ${enrollmentTargetLabel}.`,
          },
        },
        { status: 400 }
      )
    }

    // 7. Success - Compatible Assignment
    return NextResponse.json({
      success: true,
      compatible: true,
      details: {
        menuName: menu.menuName,
        menuTargetGroups,
        enrollmentTargetGroup,
        beneficiaryName: enrollment.beneficiaryOrg.organizationName,
        reason: 'Menu compatible dengan target group beneficiary',
      },
    })
  } catch (error) {
    console.error('Validate menu assignment error:', error)

    return NextResponse.json(
      {
        success: false,
        compatible: false,
        error: 'Internal server error',
        details: {
          reason:
            process.env.NODE_ENV === 'development'
              ? error instanceof Error
                ? error.message
                : 'Unknown error'
              : 'Terjadi kesalahan pada server',
        },
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/sppg/menu-plan/validate-assignment
 * Returns API documentation and usage information
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    endpoint: '/api/sppg/menu-plan/validate-assignment',
    method: 'POST',
    description: 'Validates if a menu can be assigned to an enrollment based on target group compatibility',
    authentication: 'Required - Session with sppgId',
    requestBody: {
      menuId: 'string (cuid)',
      enrollmentId: 'string (cuid)',
    },
    responses: {
      200: 'Compatible assignment',
      400: 'Incompatible assignment or validation error',
      401: 'Unauthorized',
      403: 'SPPG access required',
      404: 'Menu or enrollment not found',
      500: 'Internal server error',
    },
    compatibilityRules: {
      universalMenu: 'Empty compatibleTargetGroups array = compatible with all target groups',
      targetSpecific:
        'Non-empty compatibleTargetGroups array = restricted to specific target groups only',
    },
    example: {
      request: {
        menuId: 'cm3abc123...',
        enrollmentId: 'cm3xyz789...',
      },
      responseSuccess: {
        success: true,
        compatible: true,
        details: {
          menuName: 'Paket Gizi Ibu Hamil T1',
          menuTargetGroups: ['PREGNANT_WOMAN'],
          enrollmentTargetGroup: 'PREGNANT_WOMAN',
          beneficiaryName: 'Siti Aminah',
          reason: 'Menu compatible dengan target group beneficiary',
        },
      },
      responseFail: {
        success: false,
        compatible: false,
        error: 'Menu tidak compatible dengan target group beneficiary ini',
        details: {
          menuName: 'Paket Gizi Ibu Hamil T1',
          menuTargetGroups: ['PREGNANT_WOMAN'],
          enrollmentTargetGroup: 'SCHOOL_CHILDREN',
          beneficiaryName: 'Ahmad Fauzi',
          reason:
            'Menu "Paket Gizi Ibu Hamil T1" hanya untuk: Ibu Hamil. Beneficiary "Ahmad Fauzi" adalah: Anak Sekolah Dasar.',
        },
      },
    },
  })
}
