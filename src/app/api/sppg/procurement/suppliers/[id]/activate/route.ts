/**
 * @fileoverview Supplier Status Management API - PATCH operations
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @author Bagizi-ID Development Team
 * 
 * Status Operations:
 * - PATCH /activate: Reactivate supplier
 * - PATCH /deactivate: Deactivate supplier
 * - PATCH /blacklist: Blacklist supplier
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { canManageSupplier } from '@/lib/permissions'
import { UserRole } from '@prisma/client'

// ================================ PATCH /api/sppg/suppliers/[id]/activate ================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id } = await params

      // RBAC Check - Only users with SUPPLIER_MANAGE permission can activate
      if (!session.user.userRole || !canManageSupplier(session.user.userRole as UserRole)) {
        return NextResponse.json({ 
          success: false, 
          error: 'Insufficient permissions',
          message: 'You do not have permission to activate suppliers'
        }, { status: 403 })
      }

      // Verify supplier exists and belongs to SPPG
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

      // Activate supplier
      const updatedSupplier = await db.supplier.update({
        where: { id },
        data: {
          isActive: true,
          isBlacklisted: false,
          blacklistReason: null
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
        message: 'Supplier activated successfully'
      })

    } catch (error) {
      console.error('PATCH /api/sppg/suppliers/[id]/activate error:', error)
      
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to activate supplier',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 })
    }
  })
}
