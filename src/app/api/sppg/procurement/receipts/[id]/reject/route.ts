/**
 * @fileoverview Reject Receipt API Route
 * @version Next.js 15.5.4 / API Routes / Enterprise-grade
 * @author Bagizi-ID Development Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { z } from 'zod'

// Schema for rejection
const rejectSchema = z.object({
  reason: z.string().min(10, 'Alasan penolakan minimal 10 karakter'),
})

// ================================ POST - Reject Receipt ================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withSppgAuth(request, async (session) => {
    // Parse and Validate Request Body
    const body = await request.json()
    const validated = rejectSchema.parse(body)

    // Verify Receipt exists and belongs to SPPG
    const receipt = await db.procurement.findFirst({
      where: {
        id: params.id,
        sppgId: session.user.sppgId!,
      },
    })

    if (!receipt) {
      return NextResponse.json(
        { error: 'Receipt not found or access denied' },
        { status: 404 }
      )
    }

    // Reject Receipt
    await db.procurement.update({
      where: { id: params.id },
      data: {
        status: 'CANCELLED',
        deliveryStatus: 'CANCELLED',
        rejectionReason: validated.reason,
      },
    })

    // Log Activity
    await db.auditLog.create({
      data: {
        sppgId: session.user.sppgId!,
        userId: session.user.id,
        action: 'UPDATE',
        entityType: 'PROCUREMENT',
        entityId: receipt.id,
        description: `Penerimaan barang ditolak: ${receipt.procurementCode}`,
        metadata: {
          reason: validated.reason,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Penerimaan barang berhasil ditolak',
    })
  })
}
