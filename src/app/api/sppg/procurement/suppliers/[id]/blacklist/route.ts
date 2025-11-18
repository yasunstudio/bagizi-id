/**
 * @fileoverview Supplier Blacklist API
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @author Bagizi-ID Development Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { z } from 'zod'

const blacklistSchema = z.object({
  reason: z.string().min(10, 'Reason must be at least 10 characters')
})

// ================================ PATCH /api/sppg/suppliers/[id]/blacklist ================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id } = await params

      // Role Check - Only admins can blacklist (stricter permissions)
      const allowedBlacklistRoles: UserRole[] = ['SPPG_KEPALA', 'SPPG_ADMIN']
      
      if (!session.user.userRole || !allowedBlacklistRoles.includes(session.user.userRole as UserRole)) {
        return NextResponse.json({ 
          success: false, 
          error: 'Insufficient permissions',
          message: 'Only SPPG administrators can blacklist suppliers'
        }, { status: 403 })
      }

      // Parse and validate request body
      const body = await request.json()
      const { reason } = blacklistSchema.parse(body)

      // Verify supplier exists
      const supplier = await db.supplier.findFirst({
        where: {
          id,
          sppgId: session.user.sppgId!
        }
      })

      if (!supplier) {
        return NextResponse.json({ 
          success: false, 
          error: 'Supplier not found or access denied' 
        }, { status: 404 })
      }

      // Blacklist supplier
      const updatedSupplier = await db.supplier.update({
        where: { id },
        data: {
          isActive: false,
          isBlacklisted: true,
          blacklistReason: reason
        },
        include: {
          sppg: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })

      return NextResponse.json({
        success: true,
        data: updatedSupplier,
        message: 'Supplier blacklisted successfully'
      })

    } catch (error) {
      console.error('PATCH /api/sppg/suppliers/[id]/blacklist error:', error)
      
      // Validation error
      if (error instanceof Error && error.name === 'ZodError') {
        return NextResponse.json({ 
          success: false, 
          error: 'Validation failed',
          details: error 
        }, { status: 400 })
      }
      
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to blacklist supplier',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 })
    }
  })
}
