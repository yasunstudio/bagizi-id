/**
 * @fileoverview API endpoint untuk Beneficiary Organizations - GET & POST
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * RBAC Integration:
 * - GET: Protected by withSppgAuth (all SPPG roles)
 * - POST: Protected by withSppgAuth with role check (SPPG_ADMIN+)
 * - Automatic audit logging for all operations
 * - Multi-tenant: Organizations filtered by session.user.sppgId
 * 
 * CRITICAL: Multi-tenant security with sppgId filtering
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { beneficiaryOrganizationSchema } from '@/features/sppg/beneficiary-organization/schemas'
import { 
  BeneficiaryOrganizationType, 
  BeneficiaryOrganizationSubType,
  Prisma 
} from '@prisma/client'

/**
 * GET /api/sppg/beneficiary-organizations
 * Fetch all beneficiary organizations untuk SPPG user
 * Auto-filtered by sppgId (multi-tenant security)
 * 
 * Query Parameters:
 * - type: Filter by organization type (SCHOOL, HEALTH_FACILITY, etc.)
 * - subType: Filter by sub type (SD, PUSKESMAS, POSYANDU, etc.)
 * - operationalStatus: Filter by status (ACTIVE, INACTIVE, SUSPENDED)
 * - province: Filter by province
 * - city: Filter by city
 * - district: Filter by district
 * - search: Search by name, NPSN, NIKKES, or registration number
 * 
 * @rbac Protected by withSppgAuth - requires valid SPPG session
 * @audit Automatic logging via middleware
 */
export async function GET(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // Parse query parameters for filtering
      const { searchParams } = new URL(request.url)
      const typeParam = searchParams.get('type') // ✅ FIXED: was organizationType
      const subTypeParam = searchParams.get('subType') // ✅ FIXED: was organizationSubType
      const operationalStatus = searchParams.get('operationalStatus')
      const province = searchParams.get('province')
      const city = searchParams.get('city') // ✅ FIXED: was regency
      const district = searchParams.get('district')
      const search = searchParams.get('search')
      const isActiveParam = searchParams.get('isActive') // ✅ NEW: isActive filter

      // ✅ Validate enum values with proper type checking
      const type = typeParam && 
        Object.values(BeneficiaryOrganizationType).includes(typeParam as BeneficiaryOrganizationType)
        ? (typeParam as BeneficiaryOrganizationType)
        : undefined

      const subType = subTypeParam && 
        Object.values(BeneficiaryOrganizationSubType).includes(subTypeParam as BeneficiaryOrganizationSubType)
        ? (subTypeParam as BeneficiaryOrganizationSubType)
        : undefined

      // ✅ Parse isActive as boolean
      const isActive = isActiveParam !== null 
        ? isActiveParam === 'true' 
        : undefined

      // Build where clause with multi-tenant filtering
      const where: Prisma.BeneficiaryOrganizationWhereInput = {
        sppgId: session.user.sppgId!, // MANDATORY multi-tenant filter
        ...(type && { type }),
        ...(subType && { subType }),
        ...(operationalStatus && { operationalStatus }),
        ...(isActive !== undefined && { isActive }), // ✅ NEW: isActive filter
        // ✅ FIXED: Filter via nested relations (foreign keys)
        ...(province && { 
          province: { 
            name: { contains: province, mode: 'insensitive' as const } 
          } 
        }),
        ...(city && { 
          regency: { 
            name: { contains: city, mode: 'insensitive' as const } 
          } 
        }),
        ...(district && { 
          district: { 
            name: { contains: district, mode: 'insensitive' as const } 
          } 
        }),
        ...(search && {
          OR: [
            { organizationName: { contains: search, mode: 'insensitive' as const } },
            { npsn: { contains: search, mode: 'insensitive' as const } },
            { nikkes: { contains: search, mode: 'insensitive' as const } },
            { registrationNumber: { contains: search, mode: 'insensitive' as const } },
            { address: { contains: search, mode: 'insensitive' as const } },
          ],
        }),
      }

      // Fetch organizations with ordering
      const organizations = await db.beneficiaryOrganization.findMany({
        where,
        orderBy: [
          { operationalStatus: 'asc' }, // Active first
          { organizationName: 'asc' },
        ],
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
          _count: {
            select: {
              enrollments: true,
              distributions: true,
            },
          },
        },
      })

      return NextResponse.json({ success: true, data: organizations })
    } catch (error) {
      console.error('GET /api/sppg/beneficiary-organizations error:', error)
      return NextResponse.json(
        {
          error: 'Failed to fetch beneficiary organizations',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}

/**
 * POST /api/sppg/beneficiary-organizations
 * Create new beneficiary organization
 * 
 * @rbac Requires SPPG_ADMIN, SPPG_KEPALA, or higher
 * @audit Logged with action: 'beneficiary_organization.create'
 */
export async function POST(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // ✅ Role check: Only ADMIN+ can create organizations
      const allowedRoles = ['SPPG_ADMIN', 'SPPG_KEPALA']
      if (!session.user.userRole || !allowedRoles.includes(session.user.userRole)) {
        return NextResponse.json(
          { error: 'Insufficient permissions. Admin access required.' },
          { status: 403 }
        )
      }

      // Parse and validate request body
      const body = await request.json()
      const validated = beneficiaryOrganizationSchema.safeParse(body)

      if (!validated.success) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: validated.error.issues, // ✅ FIXED: was .errors
          },
          { status: 400 }
        )
      }

      // Check for duplicate NPSN (for schools)
      if (validated.data.npsn) {
        const existingByNpsn = await db.beneficiaryOrganization.findFirst({
          where: {
            sppgId: session.user.sppgId!,
            npsn: validated.data.npsn,
          },
        })

        if (existingByNpsn) {
          return NextResponse.json(
            { error: 'Organization with this NPSN already exists' },
            { status: 409 }
          )
        }
      }

      // Check for duplicate NIKKES (for health facilities)
      if (validated.data.nikkes) {
        const existingByNikkes = await db.beneficiaryOrganization.findFirst({
          where: {
            sppgId: session.user.sppgId!,
            nikkes: validated.data.nikkes,
          },
        })

        if (existingByNikkes) {
          return NextResponse.json(
            { error: 'Organization with this NIKKES already exists' },
            { status: 409 }
          )
        }
      }

      // ✅ Generate unique organizationCode based on type
      // Updated for MBG National Program (3 main beneficiary types)
      const codePrefix = {
        SCHOOL: 'SCH',                      // Sekolah
        HEALTH_FACILITY: 'HLT',             // Fasilitas Kesehatan
        INTEGRATED_SERVICE_POST: 'PSY',    // Posyandu
      }[validated.data.type]

      const count = await db.beneficiaryOrganization.count({
        where: { 
          sppgId: session.user.sppgId!, 
          type: validated.data.type 
        }
      })

      const organizationCode = `${codePrefix}-${String(count + 1).padStart(4, '0')}`

      // Create beneficiary organization with sppgId and organizationCode
      // ✅ Explicitly type the data to match Prisma's UncheckedCreateInput
      const createData = {
        ...validated.data,
        organizationCode, // ✅ Auto-generated
        sppgId: session.user.sppgId!, // Multi-tenant safety
        operationalStatus: validated.data.operationalStatus || 'ACTIVE', // ✅ Ensure default
      }

      const organization = await db.beneficiaryOrganization.create({
        data: createData,
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

      // ✅ Audit log automatically created by middleware

      return NextResponse.json(
        { success: true, data: organization },
        { status: 201 }
      )
    } catch (error) {
      console.error('POST /api/sppg/beneficiary-organizations error:', error)
      return NextResponse.json(
        {
          error: 'Failed to create beneficiary organization',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}
