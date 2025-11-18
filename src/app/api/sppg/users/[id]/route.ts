/**
 * SPPG User Detail API - GET, PUT, DELETE operations
 * Next.js 15 / Prisma 6 / Auth.js v5
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth, hasPermission } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import {
  updateUserSchema,
  type UpdateUserInput,
} from '@/features/sppg/user/schemas'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id } = await params

      // Multi-tenant safety: Must have sppgId
      if (!session.user.sppgId) {
        return NextResponse.json(
          { success: false, error: 'SPPG access required' },
          { status: 403 }
        )
      }

      const user = await db.user.findFirst({
        where: {
          id,
          sppgId: session.user.sppgId,
        },
        select: {
          id: true,
          email: true,
          name: true,
          firstName: true,
          lastName: true,
          phone: true,
          userType: true,
          userRole: true,
          isActive: true,
          isEmailVerified: true,
          emailVerified: true,
          twoFactorEnabled: true,
          twoFactorSecret: true,
          lastLogin: true,
          lastPasswordChange: true,
          failedLoginAttempts: true,
          lockedUntil: true,
          sessionCount: true,
          lastIpAddress: true,
          lastUserAgent: true,
          lastActiveModule: true,
          sppgId: true,
          departmentId: true,
          positionId: true,
          location: true,
          timezone: true,
          language: true,
          emergencyContact: true,
          emergencyPhone: true,
          emergencyRelationship: true,
          createdAt: true,
          updatedAt: true,
          sppg: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          department: {
            select: {
              id: true,
              departmentName: true,
              departmentCode: true,
            },
          },
          position: {
            select: {
              id: true,
              positionName: true,
              positionCode: true,
            },
          },
        },
      })

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ success: true, data: user })
    } catch (error) {
      console.error('GET /api/sppg/users/[id] error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch user' },
        { status: 500 }
      )
    }
  })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      if (!hasPermission(session.user.userRole, 'user:update')) {
        return NextResponse.json(
          { success: false, error: 'Insufficient permissions' },
          { status: 403 }
        )
      }

      const { id } = await params

      // Multi-tenant safety: Must have sppgId
      if (!session.user.sppgId) {
        return NextResponse.json(
          { success: false, error: 'SPPG access required' },
          { status: 403 }
        )
      }

      const existingUser = await db.user.findFirst({
        where: {
          id,
          sppgId: session.user.sppgId,
        },
      })

      if (!existingUser) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        )
      }

      const body = await request.json()
      const validated = updateUserSchema.safeParse(body)

      if (!validated.success) {
        return NextResponse.json(
          { success: false, error: 'Validation failed', details: validated.error.flatten().fieldErrors },
          { status: 400 }
        )
      }

      const data = validated.data as UpdateUserInput

      const updatedUser = await db.user.update({
        where: { id },
        data: { ...data },
        select: {
          id: true,
          email: true,
          name: true,
          firstName: true,
          lastName: true,
          phone: true,
          userType: true,
          userRole: true,
          isActive: true,
          sppgId: true,
          departmentId: true,
          positionId: true,
          location: true,
          timezone: true,
          language: true,
          updatedAt: true,
          sppg: { select: { id: true, name: true, code: true } },
        },
      })

      await db.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'UPDATE_USER',
          entityType: 'User',
          entityId: id,
          oldValues: JSON.parse(JSON.stringify(existingUser)),
          newValues: JSON.parse(JSON.stringify(updatedUser)),
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      })

      return NextResponse.json({ success: true, data: updatedUser })
    } catch (error) {
      console.error('PUT /api/sppg/users/[id] error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update user' },
        { status: 500 }
      )
    }
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      if (!hasPermission(session.user.userRole, 'user:delete')) {
        return NextResponse.json(
          { success: false, error: 'Insufficient permissions' },
          { status: 403 }
        )
      }

      const { id } = await params

      if (id === session.user.id) {
        return NextResponse.json(
          { success: false, error: 'Cannot delete own account' },
          { status: 400 }
        )
      }

      // Multi-tenant safety: Must have sppgId
      if (!session.user.sppgId) {
        return NextResponse.json(
          { success: false, error: 'SPPG access required' },
          { status: 403 }
        )
      }

      const existingUser = await db.user.findFirst({
        where: {
          id,
          sppgId: session.user.sppgId,
        },
      })

      if (!existingUser) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        )
      }

      await db.user.update({
        where: { id },
        data: { isActive: false },
      })

      await db.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'DELETE_USER',
          entityType: 'User',
          entityId: id,
          oldValues: JSON.parse(JSON.stringify(existingUser)),
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      })

      return NextResponse.json({ success: true, message: 'User deactivated' })
    } catch (error) {
      console.error('DELETE /api/sppg/users/[id] error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete user' },
        { status: 500 }
      )
    }
  })
}