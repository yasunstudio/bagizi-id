/**
 * @fileoverview SPPG User Status Toggle API
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * 
 * API Endpoint:
 * - PATCH /api/sppg/users/[id]/status - Toggle user active status
 * 
 * @rbac Protected by withSppgAuth
 * - Only SPPG_KEPALA, SPPG_ADMIN can toggle status
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth, hasPermission } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

/**
 * PATCH /api/sppg/users/[id]/status
 * Toggle user active/inactive status
 * 
 * Request Body:
 * - isActive: boolean (required)
 * 
 * @rbac Only SPPG_KEPALA, SPPG_ADMIN can toggle status
 * @audit Logged in audit trail
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id: userId } = await params

      // Permission check
      if (!hasPermission(session.user.userRole, 'user:update')) {
        return NextResponse.json({
          success: false,
          error: 'Insufficient permissions to update user status'
        }, { status: 403 })
      }

      // Cannot deactivate self
      if (userId === session.user.id) {
        return NextResponse.json({
          success: false,
          error: 'Cannot change your own account status'
        }, { status: 400 })
      }

      // Parse request body
      const body = await request.json()
      const { isActive } = body

      if (typeof isActive !== 'boolean') {
        return NextResponse.json({
          success: false,
          error: 'isActive must be a boolean value'
        }, { status: 400 })
      }

      // Fetch user
      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          sppgId: true,
          email: true,
          name: true,
          isActive: true,
        }
      })

      if (!user) {
        return NextResponse.json({
          success: false,
          error: 'User not found'
        }, { status: 404 })
      }

      // Multi-tenant safety: User must belong to same SPPG
      if (!session.user.sppgId || user.sppgId !== session.user.sppgId) {
        return NextResponse.json({
          success: false,
          error: 'Access denied'
        }, { status: 403 })
      }

      // Update status
      const updatedUser = await db.user.update({
        where: { id: userId },
        data: { isActive },
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
          action: isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
          entityType: 'User',
          entityId: userId,
          description: isActive ? 'User activated' : 'User deactivated',
          oldValues: { isActive: user.isActive },
          newValues: { isActive },
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        }
      })

      return NextResponse.json({
        success: true,
        data: updatedUser,
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
      })
    } catch (error) {
      console.error('PATCH /api/sppg/users/[id]/status error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to update user status',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, { status: 500 })
    }
  })
}
