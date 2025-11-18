/**
 * @fileoverview Supplier Deactivation API
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @author Bagizi-ID Development Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { canManageSupplier } from '@/lib/permissions'
import { UserRole } from '@prisma/client'
import { z } from 'zod'

const deactivateSchema = z.object({
  reason: z.string().optional()
})

// ================================ PATCH /api/sppg/suppliers/[id]/deactivate ================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id } = await params

      // RBAC Check - Only users with SUPPLIER_MANAGE permission can deactivate
      if (!session.user.userRole || !canManageSupplier(session.user.userRole as UserRole)) {
        return NextResponse.json({ 
          success: false, 
          error: 'Insufficient permissions',
          message: 'You do not have permission to deactivate suppliers'
        }, { status: 403 })
      }

      // Parse request body
      const body = await request.json()
      const { reason } = deactivateSchema.parse(body)

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

      // Deactivate supplier
      const updatedSupplier = await db.supplier.update({
        where: { id },
        data: {
          isActive: false,
          ...(reason && { blacklistReason: reason })
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
        message: 'Supplier deactivated successfully'
      })

    } catch (error) {
      console.error('PATCH /api/sppg/suppliers/[id]/deactivate error:', error)
      
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to deactivate supplier',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 })
    }
  })
}
