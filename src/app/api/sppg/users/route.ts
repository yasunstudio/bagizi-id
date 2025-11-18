/**
 * @fileoverview SPPG User Management API - List & Create
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} API Development Guidelines
 * 
 * API Endpoints:
 * - GET /api/sppg/users - List users with filters and pagination
 * - POST /api/sppg/users - Create new user
 * 
 * @rbac Protected by withSppgAuth
 * - GET: All SPPG roles can view users in their SPPG
 * - POST: Only SPPG_KEPALA, SPPG_ADMIN, SPPG_HRD_MANAGER can create users
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth, hasPermission } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import type { UserRole } from '@prisma/client'
import {
  userFiltersSchema,
  createUserSchema,
  type UserFilters,
  type CreateUserInput,
} from '@/features/sppg/user/schemas'
import bcryptjs from 'bcryptjs'

/**
 * GET /api/sppg/users
 * List users with filtering and pagination
 * 
 * Query Parameters:
 * - search: Search in name, email
 * - userRole: Filter by role
 * - isActive: Filter by active status (true/false)
 * - sppgId: Filter by SPPG (superadmin only)
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10)
 * 
 * @rbac All SPPG roles can view users
 * @audit Logged in audit trail
 */
export async function GET(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // Parse query parameters
      const { searchParams } = new URL(request.url)
      const filters: UserFilters = {
        search: searchParams.get('search') || undefined,
        userRole: (searchParams.get('userRole') as UserRole | null) || undefined,
        isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
        sppgId: searchParams.get('sppgId') || undefined,
        page: Number(searchParams.get('page')) || 1,
        limit: Number(searchParams.get('limit')) || 10,
      }

      // Validate filters
      const validated = userFiltersSchema.safeParse(filters)
      if (!validated.success) {
        return NextResponse.json({
          success: false,
          error: 'Invalid filter parameters',
          details: validated.error.flatten().fieldErrors
        }, { status: 400 })
      }

      // Multi-tenant safety: Must have sppgId
      if (!session.user.sppgId) {
        return NextResponse.json({
          success: false,
          error: 'SPPG access required'
        }, { status: 403 })
      }

      // Build where clause with proper typing
      interface WhereClause {
        sppgId: string
        OR?: Array<{
          name?: { contains: string; mode: 'insensitive' }
          email?: { contains: string; mode: 'insensitive' }
        }>
        userRole?: UserRole
        isActive?: boolean
      }
      
      const where: WhereClause = {
        sppgId: session.user.sppgId
      }

      // Search filter
      if (validated.data.search) {
        where.OR = [
          { name: { contains: validated.data.search, mode: 'insensitive' } },
          { email: { contains: validated.data.search, mode: 'insensitive' } },
        ]
      }

      // Role filter
      if (validated.data.userRole) {
        where.userRole = validated.data.userRole
      }

      // Active status filter
      if (validated.data.isActive !== undefined) {
        where.isActive = validated.data.isActive
      }

      // Count total records
      const total = await db.user.count({ where })

      // Calculate pagination
      const page = validated.data.page || 1
      const limit = validated.data.limit || 10
      const skip = (page - 1) * limit
      const totalPages = Math.ceil(total / limit)

      // Fetch users
      const users = await db.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { isActive: 'desc' }, // Active users first
          { name: 'asc' }
        ],
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          profileImage: true,
          userType: true,
          userRole: true,
          isActive: true,
          emailVerified: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
          sppg: {
            select: {
              id: true,
              code: true,
              name: true,
            }
          },
          department: {
            select: {
              id: true,
              departmentName: true,
              departmentCode: true,
            }
          },
          position: {
            select: {
              id: true,
              positionName: true,
              positionCode: true,
            }
          }
        }
      })

      return NextResponse.json({
        success: true,
        data: users,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      })
    } catch (error) {
      console.error('GET /api/sppg/users error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch users',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, { status: 500 })
    }
  })
}

/**
 * POST /api/sppg/users
 * Create new user in SPPG
 * 
 * Request Body: CreateUserInput
 * - email, name, password, userType, userRole (required)
 * - phone, firstName, lastName, jobTitle, department (optional)
 * 
 * @rbac Only SPPG_KEPALA, SPPG_ADMIN, SPPG_HRD_MANAGER can create users
 * @audit Logged in audit trail
 */
export async function POST(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // Permission check
      if (!hasPermission(session.user.userRole, 'user:create')) {
        return NextResponse.json({
          success: false,
          error: 'Insufficient permissions to create users'
        }, { status: 403 })
      }

      // Parse request body
      const body: CreateUserInput = await request.json()

      // Validate input
      const validated = createUserSchema.safeParse(body)
      if (!validated.success) {
        return NextResponse.json({
          success: false,
          error: 'Validation failed',
          details: validated.error.flatten().fieldErrors
        }, { status: 400 })
      }

      // Multi-tenant safety: New user must belong to session's SPPG
      if (!session.user.sppgId) {
        return NextResponse.json({
          success: false,
          error: 'SPPG access required to create users'
        }, { status: 403 })
      }

      // Check if email already exists
      const existingUser = await db.user.findUnique({
        where: { email: validated.data.email }
      })

      if (existingUser) {
        return NextResponse.json({
          success: false,
          error: 'Email already registered'
        }, { status: 409 })
      }

      // Hash password
      const hashedPassword = await bcryptjs.hash(validated.data.password, 12)

      // Create user
      const newUser = await db.user.create({
        data: {
          email: validated.data.email,
          name: validated.data.name,
          password: hashedPassword,
          userType: validated.data.userType,
          userRole: validated.data.userRole,
          sppgId: session.user.sppgId, // CRITICAL: Always use session SPPG
          phone: validated.data.phone,
          firstName: validated.data.firstName,
          lastName: validated.data.lastName,
          departmentId: validated.data.departmentId,
          positionId: validated.data.positionId,
          timezone: validated.data.timezone || 'WIB',
          language: validated.data.language || 'id',
          isActive: validated.data.isActive !== undefined ? validated.data.isActive : true,
        },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          profileImage: true,
          userType: true,
          userRole: true,
          isActive: true,
          emailVerified: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
          firstName: true,
          lastName: true,
          departmentId: true,
          positionId: true,
          location: true,
          timezone: true,
          language: true,
          workPhone: true,
          personalPhone: true,
          alternateEmail: true,
          address: true,
          emergencyContact: true,
          emergencyPhone: true,
          emergencyRelationship: true,
          twoFactorEnabled: true,
          lastPasswordChange: true,
          failedLoginAttempts: true,
          lockedUntil: true,
          lastIpAddress: true,
          isEmailVerified: true,
          isPhoneVerified: true,
          securityLevel: true,
          lastActiveModule: true,
          sessionCount: true,
          sppg: {
            select: {
              id: true,
              code: true,
              name: true,
            }
          }
        }
      })

      // Create audit log
      await db.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'CREATE_USER',
          entityType: 'User',
          entityId: newUser.id,
          description: 'New user created',
          newValues: {
            email: newUser.email,
            name: newUser.name,
            userRole: newUser.userRole,
            isActive: newUser.isActive
          },
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        }
      })

      return NextResponse.json({
        success: true,
        data: newUser,
        message: 'User created successfully'
      }, { status: 201 })
    } catch (error) {
      console.error('POST /api/sppg/users error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to create user',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, { status: 500 })
    }
  })
}
