/**
 * @fileoverview Get Active Payment Terms - GET endpoint
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * 
 * PURPOSE:
 * Returns list of ACTIVE payment terms from settings
 * Used in order form dropdown to select payment terms
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

// ================================ GET /api/sppg/procurement/settings/payment-terms ================================

/**
 * Get active payment terms for order selection
 * Returns terms with business rules (DP, due days, etc)
 */
export async function GET(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // Get SPPG's procurement settings first
      const settings = await db.procurementSettings.findUnique({
        where: {
          sppgId: session.user.sppgId!,
        },
        select: {
          id: true,
        },
      })

      if (!settings) {
        // Return default terms if no settings exist yet
        return NextResponse.json({
          success: true,
          data: getDefaultPaymentTerms(),
        })
      }

      // Fetch active payment terms from settings
      const terms = await db.procurementPaymentTerm.findMany({
        where: {
          settingsId: settings.id,
          isActive: true,
        },
        select: {
          id: true,
          code: true,
          name: true,
          description: true,
          dueDays: true,
          requireDP: true,
          dpPercentage: true,
          dpDueDays: true,
          isDefault: true,
          sortOrder: true,
        },
        orderBy: [
          { sortOrder: 'asc' },
          { code: 'asc' },
        ],
      })

      // If no custom terms, return defaults
      if (terms.length === 0) {
        return NextResponse.json({
          success: true,
          data: getDefaultPaymentTerms(),
        })
      }

      return NextResponse.json({
        success: true,
        data: terms,
      })

    } catch (error) {
      console.error('GET /api/sppg/procurement/settings/payment-terms error:', error)

      return NextResponse.json({
        success: false,
        error: 'Failed to fetch payment terms',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 })
    }
  })
}

/**
 * Default payment terms when settings not configured
 */
function getDefaultPaymentTerms() {
  return [
    {
      id: 'default-cod',
      code: 'COD',
      name: 'Cash on Delivery',
      description: 'Payment due upon delivery',
      dueDays: 0,
      requireDP: false,
      dpPercentage: null,
      dpDueDays: null,
      isDefault: true,
      sortOrder: 1,
    },
    {
      id: 'default-net7',
      code: 'NET_7',
      name: 'Net 7 Days',
      description: 'Payment due within 7 days',
      dueDays: 7,
      requireDP: false,
      dpPercentage: null,
      dpDueDays: null,
      isDefault: false,
      sortOrder: 2,
    },
    {
      id: 'default-net14',
      code: 'NET_14',
      name: 'Net 14 Days',
      description: 'Payment due within 14 days',
      dueDays: 14,
      requireDP: false,
      dpPercentage: null,
      dpDueDays: null,
      isDefault: false,
      sortOrder: 3,
    },
    {
      id: 'default-net30',
      code: 'NET_30',
      name: 'Net 30 Days',
      description: 'Payment due within 30 days',
      dueDays: 30,
      requireDP: false,
      dpPercentage: null,
      dpDueDays: null,
      isDefault: false,
      sortOrder: 4,
    },
    {
      id: 'default-net45',
      code: 'NET_45',
      name: 'Net 45 Days',
      description: 'Payment due within 45 days',
      dueDays: 45,
      requireDP: false,
      dpPercentage: null,
      dpDueDays: null,
      isDefault: false,
      sortOrder: 5,
    },
    {
      id: 'default-net60',
      code: 'NET_60',
      name: 'Net 60 Days',
      description: 'Payment due within 60 days',
      dueDays: 60,
      requireDP: false,
      dpPercentage: null,
      dpDueDays: null,
      isDefault: false,
      sortOrder: 6,
    },
    {
      id: 'default-advance50',
      code: 'ADVANCE_50',
      name: '50% Advance Payment',
      description: '50% upfront, 50% on delivery',
      dueDays: 0,
      requireDP: true,
      dpPercentage: 50,
      dpDueDays: 7,
      isDefault: false,
      sortOrder: 7,
    },
    {
      id: 'default-advance100',
      code: 'ADVANCE_100',
      name: '100% Advance Payment',
      description: 'Full payment before delivery',
      dueDays: 0,
      requireDP: true,
      dpPercentage: 100,
      dpDueDays: 3,
      isDefault: false,
      sortOrder: 8,
    },
  ]
}
