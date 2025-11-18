/**
 * @fileoverview Initialize Procurement Settings with Defaults
 * 
 * Creates first-time settings with sensible defaults:
 * - 3 approval levels (0-5M, 5M-50M, 50M+)
 * - 4 payment terms (COD, NET_7, NET_30, NET_60)
 * - 3 QC checklists (FRESH_PRODUCE, FROZEN_GOODS, PACKAGED_GOODS)
 * 
 * Only available if settings don't exist yet
 * RBAC Integration: Protected by withSppgAuth wrapper
 * 
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

/**
 * POST /api/sppg/procurement/settings/initialize
 * @rbac Protected by withSppgAuth
 * @audit Automatic logging
 * @security Requires SPPG_KEPALA or SPPG_ADMIN role
 * 
 * Initialize procurement settings with sensible defaults
 * 
 * @returns {Promise<NextResponse>} Created settings with all defaults
 */
export async function POST(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // Permission check (only SPPG_KEPALA and SPPG_ADMIN)
      const allowedRoles = ['SPPG_KEPALA', 'SPPG_ADMIN']
      if (!session.user.userRole || !allowedRoles.includes(session.user.userRole)) {
        return NextResponse.json(
          { success: false, error: 'Insufficient permissions' },
          { status: 403 }
        )
      }

      // Check if settings already exist
      const existingSettings = await db.procurementSettings.findUnique({
        where: { sppgId: session.user.sppgId! },
      })

      if (existingSettings) {
        return NextResponse.json(
          { success: false, error: 'Settings already exist. Use PUT to update or POST /reset to reset.' },
          { status: 409 }
        )
      }

      // Create settings with defaults
      const settings = await db.procurementSettings.create({
        data: {
          sppgId: session.user.sppgId!,
        
        // General defaults
        autoApproveThreshold: 5000000, // 5 juta
        requireQCPhotos: true,
        minQCPhotoCount: 2,
        defaultPaymentTerm: 'NET_30',
        enableWhatsappNotif: false,
        whatsappNumber: null,
        enableEmailDigest: true,
        digestFrequency: 'WEEKLY',
        budgetAlertEnabled: true,
        budgetAlertThreshold: 80, // 80%
        accountingIntegration: false,
        inventoryAutoSync: true,

        // Default approval levels
        approvalLevels: {
          create: [
            {
              level: 1,
              levelName: 'Approval Level 1 (< 5 Juta)',
              minAmount: 0,
              maxAmount: 5000000,
              requiredRole: 'SPPG_ADMIN',
              isParallel: false,
              escalationDays: 3,
            },
            {
              level: 2,
              levelName: 'Approval Level 2 (5 - 50 Juta)',
              minAmount: 5000000,
              maxAmount: 50000000,
              requiredRole: 'SPPG_KEPALA',
              isParallel: false,
              escalationDays: 5,
            },
            {
              level: 3,
              levelName: 'Approval Level 3 (> 50 Juta)',
              minAmount: 50000000,
              maxAmount: null,
              requiredRole: 'SPPG_KEPALA',
              isParallel: true,
              escalationDays: 7,
            },
          ],
        },

        // Default payment terms
        paymentTerms: {
          create: [
            {
              code: 'COD',
              name: 'Cash on Delivery',
              dueDays: 0,
              requireDP: false,
              dpPercentage: null,
              lateFeePerDay: null,
              autoRemindDays: null,
              autoEscalateDays: null,
              isActive: true,
            },
            {
              code: 'NET_7',
              name: 'Net 7 Days',
              dueDays: 7,
              requireDP: false,
              dpPercentage: null,
              lateFeePerDay: 50000,
              autoRemindDays: 5,
              autoEscalateDays: 10,
              isActive: true,
            },
            {
              code: 'NET_30',
              name: 'Net 30 Days',
              dueDays: 30,
              requireDP: false,
              dpPercentage: null,
              lateFeePerDay: 100000,
              autoRemindDays: 25,
              autoEscalateDays: 35,
              isActive: true,
            },
            {
              code: 'NET_60',
              name: 'Net 60 Days',
              dueDays: 60,
              requireDP: true,
              dpPercentage: 30,
              lateFeePerDay: 150000,
              autoRemindDays: 55,
              autoEscalateDays: 70,
              isActive: true,
            },
          ],
        },

        // Default QC checklists
        qcChecklists: {
          create: [
            {
              code: 'FRESH_PRODUCE_QC',
              name: 'Fresh Produce Quality Control',
              category: 'FRESH_PRODUCE',
              checkItems: [
                {
                  itemName: 'Visual Inspection',
                  criteria: 'No bruises, discoloration, or visible damage',
                  weight: 30,
                  mandatory: true,
                },
                {
                  itemName: 'Freshness Check',
                  criteria: 'Firm texture, vibrant color, fresh smell',
                  weight: 40,
                  mandatory: true,
                },
                {
                  itemName: 'Size & Weight',
                  criteria: 'Consistent size, meets weight specifications',
                  weight: 20,
                  mandatory: false,
                },
                {
                  itemName: 'Packaging',
                  criteria: 'Clean, intact, properly labeled',
                  weight: 10,
                  mandatory: false,
                },
              ],
              passThreshold: 80,
              requirePhotos: true,
              minPhotos: 3,
              maxPhotos: 5,
              samplingPct: 10,
              minSampleSize: 5,
              autoRejectBelow: 60,
              autoApproveAbove: 95,
              isActive: true,
            },
            {
              code: 'FROZEN_GOODS_QC',
              name: 'Frozen Goods Quality Control',
              category: 'FROZEN_GOODS',
              checkItems: [
                {
                  itemName: 'Temperature Check',
                  criteria: 'Maintained at -18°C or below',
                  weight: 40,
                  mandatory: true,
                },
                {
                  itemName: 'Packaging Integrity',
                  criteria: 'No frost buildup, seals intact, no freezer burn',
                  weight: 30,
                  mandatory: true,
                },
                {
                  itemName: 'Expiry Date',
                  criteria: 'Minimum 6 months shelf life remaining',
                  weight: 20,
                  mandatory: true,
                },
                {
                  itemName: 'Product Condition',
                  criteria: 'No ice crystals, proper color',
                  weight: 10,
                  mandatory: false,
                },
              ],
              passThreshold: 85,
              requirePhotos: true,
              minPhotos: 2,
              maxPhotos: 4,
              samplingPct: 15,
              minSampleSize: 3,
              autoRejectBelow: 70,
              autoApproveAbove: 98,
              isActive: true,
            },
            {
              code: 'PACKAGED_GOODS_QC',
              name: 'Packaged Goods Quality Control',
              category: 'PACKAGED_GOODS',
              checkItems: [
                {
                  itemName: 'Packaging Condition',
                  criteria: 'No tears, dents, or damages',
                  weight: 25,
                  mandatory: true,
                },
                {
                  itemName: 'Label & Documentation',
                  criteria: 'Proper labeling, BPOM registration, halal cert',
                  weight: 30,
                  mandatory: true,
                },
                {
                  itemName: 'Expiry Date',
                  criteria: 'Minimum 3 months shelf life',
                  weight: 25,
                  mandatory: true,
                },
                {
                  itemName: 'Quantity Verification',
                  criteria: 'Matches order quantity, no missing items',
                  weight: 20,
                  mandatory: true,
                },
              ],
              passThreshold: 75,
              requirePhotos: true,
              minPhotos: 2,
              maxPhotos: 4,
              samplingPct: 5,
              minSampleSize: 2,
              autoRejectBelow: 50,
              autoApproveAbove: 90,
              isActive: true,
            },
          ],
        },
      },
      include: {
        approvalLevels: {
          orderBy: { level: 'asc' },
        },
        customCategories: true,
        notificationRules: true,
        paymentTerms: {
          orderBy: { code: 'asc' },
        },
        qcChecklists: {
          orderBy: { code: 'asc' },
        },
      },
    })

      return NextResponse.json({
        success: true,
        data: settings,
      })
    } catch (error) {
      console.error('POST /api/sppg/procurement/settings/initialize error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to initialize settings',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}
