/**
 * @fileoverview Employee List & Create API Routes
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * 
 * GET  /api/sppg/employees - List employees with filters
 * POST /api/sppg/employees - Create new employee
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { 
  createEmployeeSchema, 
  employeeFiltersSchema 
} from '@/features/sppg/hrd/schemas/employeeSchema'
import type { Prisma } from '@prisma/client'

/**
 * GET /api/sppg/employees
 * List employees with filtering, pagination, and sorting
 */
export async function GET(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    // 3. Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const filters = employeeFiltersSchema.parse({
      search: searchParams.get('search') || undefined,
      departmentId: searchParams.get('departmentId') || undefined,
      positionId: searchParams.get('positionId') || undefined,
      employmentType: searchParams.get('employmentType') || undefined,
      employmentStatus: searchParams.get('employmentStatus') || undefined,
      employeeLevel: searchParams.get('employeeLevel') || undefined,
      gender: searchParams.get('gender') || undefined,
      isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
      joinDateFrom: searchParams.get('joinDateFrom') || undefined,
      joinDateTo: searchParams.get('joinDateTo') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
      sortBy: searchParams.get('sortBy') || 'fullName',
      sortOrder: searchParams.get('sortOrder') || 'asc',
    })

    // 4. Build WHERE clause with multi-tenant filtering
    const where: Prisma.EmployeeWhereInput = {
      sppgId: session.user.sppgId!, // MANDATORY multi-tenant filter
    }

    // Search filter
    if (filters.search) {
      where.OR = [
        { fullName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { employeeCode: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    // Department filter
    if (filters.departmentId) {
      where.departmentId = filters.departmentId
    }

    // Position filter
    if (filters.positionId) {
      where.positionId = filters.positionId
    }

    // Employment type filter
    if (filters.employmentType) {
      where.employmentType = filters.employmentType
    }

    // Employment status filter
    if (filters.employmentStatus) {
      where.employmentStatus = filters.employmentStatus
    }

    // Gender filter
    if (filters.gender) {
      where.gender = filters.gender
    }

    // Active status filter
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive
    }

    // Join date range filter
    if (filters.joinDateFrom || filters.joinDateTo) {
      where.joinDate = {}
      if (filters.joinDateFrom) {
        where.joinDate.gte = filters.joinDateFrom
      }
      if (filters.joinDateTo) {
        where.joinDate.lte = filters.joinDateTo
      }
    }

    // 5. Build ORDER BY clause
    let orderBy: Prisma.EmployeeOrderByWithRelationInput = {}
    switch (filters.sortBy) {
      case 'fullName':
        orderBy = { fullName: filters.sortOrder }
        break
      case 'employeeCode':
        orderBy = { employeeCode: filters.sortOrder }
        break
      case 'joinDate':
        orderBy = { joinDate: filters.sortOrder }
        break
      case 'department':
        orderBy = { department: { departmentName: filters.sortOrder } }
        break
      case 'position':
        orderBy = { position: { positionName: filters.sortOrder } }
        break
      default:
        orderBy = { fullName: 'asc' }
    }

    // 6. Pagination
    const page = filters.page || 1
    const limit = filters.limit || 10
    const skip = (page - 1) * limit

    // 7. Fetch employees
    const [employees, total] = await Promise.all([
      db.employee.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          employeeCode: true,
          fullName: true,
          email: true,
          phone: true,
          department: {
            select: {
              id: true,
              departmentName: true,
            },
          },
          position: {
            select: {
              id: true,
              positionName: true,
              level: true,
            },
          },
          employmentType: true,
          employmentStatus: true,
          joinDate: true,
          isActive: true,
        },
      }),
      db.employee.count({ where }),
    ])

    // 8. Return response
    return NextResponse.json({
      success: true,
      data: employees,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  })
}

/**
 * POST /api/sppg/employees
 * Create new employee
 */
export async function POST(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    // 3. Parse and validate request body
    const body = await request.json()
    const validated = createEmployeeSchema.parse(body)

    // 4. Check if department and position exist and belong to same SPPG
    const [department, position] = await Promise.all([
      db.department.findFirst({
        where: {
          id: validated.departmentId,
          sppgId: session.user.sppgId!,
        },
      }),
      db.position.findFirst({
        where: {
          id: validated.positionId,
          sppgId: session.user.sppgId!,
        },
      }),
    ])

    if (!department) {
      return NextResponse.json(
        { success: false, error: 'Department not found' },
        { status: 404 }
      )
    }

    if (!position) {
      return NextResponse.json(
        { success: false, error: 'Position not found' },
        { status: 404 }
      )
    }

    // 5. Check if position has available slots
    if (position.currentOccupants >= position.maxOccupants) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Position ${position.positionName} has reached maximum occupancy (${position.maxOccupants})` 
        },
        { status: 400 }
      )
    }

    // 6. Generate employee code if not provided
    let employeeCode = validated.employeeCode
    if (!employeeCode) {
      // Generate format: EMP-DEPT-XXXX
      const count = await db.employee.count({
        where: {
          sppgId: session.user.sppgId!,
          departmentId: validated.departmentId,
        },
      })
      employeeCode = `EMP-${department.departmentCode}-${String(count + 1).padStart(4, '0')}`
    }

    // 6a. Generate employeeId (unique identifier for system)
    const employeeIdCount = await db.employee.count()
    const employeeId = `EMPID-${String(employeeIdCount + 1).padStart(6, '0')}`

    // 7. Check if employee code already exists
    const existingEmployee = await db.employee.findFirst({
      where: {
        employeeCode,
        sppgId: session.user.sppgId!,
      },
    })

    if (existingEmployee) {
      return NextResponse.json(
        { success: false, error: 'Employee code already exists' },
        { status: 400 }
      )
    }

    // 8. Check if NIK already exists (if provided)
    if (validated.nik) {
      const existingNik = await db.employee.findFirst({
        where: {
          nik: validated.nik,
        },
      })

      if (existingNik) {
        return NextResponse.json(
          { success: false, error: 'NIK already registered' },
          { status: 400 }
        )
      }
    }

    // 9. Create employee and update counters in transaction
    const employee = await db.$transaction(async (tx) => {
      // Create employee
      const newEmployee = await tx.employee.create({
        data: {
          ...validated,
          employeeId,
          employeeCode,
          sppgId: session.user.sppgId!,
        },
        include: {
          department: {
            select: {
              id: true,
              departmentCode: true,
              departmentName: true,
            },
          },
          position: {
            select: {
              id: true,
              positionCode: true,
              positionName: true,
              level: true,
            },
          },
          village: {
            select: {
              id: true,
              name: true,
              district: {
                select: {
                  id: true,
                  name: true,
                  regency: {
                    select: {
                      id: true,
                      name: true,
                      province: {
                        select: {
                          id: true,
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          sppg: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
        },
      })

      // Update department employee count
      await tx.department.update({
        where: { id: validated.departmentId },
        data: {
          currentEmployees: {
            increment: 1,
          },
        },
      })

      // Update position occupancy
      await tx.position.update({
        where: { id: validated.positionId },
        data: {
          currentOccupants: {
            increment: 1,
          },
        },
      })

      return newEmployee
    })

    // 10. Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE',
        entityType: 'EMPLOYEE',
        entityId: employee.id,
        newValues: {
          employeeCode: employee.employeeCode,
          fullName: employee.fullName,
          departmentId: employee.departmentId,
          positionId: employee.positionId,
        },
      },
    })

    // 11. Return created employee
    return NextResponse.json(
      {
        success: true,
        data: employee,
        message: 'Employee created successfully',
      },
      { status: 201 }
    )
  })
}
