/**
 * @fileoverview Procurement Settings API Routes
 * 
 * Handles fetching and updating procurement settings with all related data:
 * - General settings (auto-approve, QC, notifications)
 * - Approval workflow levels
 * - Custom categories
 * - Payment terms
 * - QC checklists
 * 
 * Multi-tenant: All operations filtered by sppgId from session
 * RBAC Integration: Protected by withSppgAuth wrapper
 * 
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
// import { updateSettingsSchema } from '@/features/sppg/procurement/settings/schemas' // TODO: Fix schema mismatch

/**
 * GET /api/sppg/procurement/settings
 * @rbac Protected by withSppgAuth
 * @audit Automatic logging
 * 
 * Fetch all procurement settings for current SPPG with nested relations
 * 
 * @returns {Promise<NextResponse>} Settings data with all related tables
 */
export async function GET(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      console.log('[GET /api/sppg/procurement/settings] Request from:', {
        userId: session.user.id,
        email: session.user.email,
        sppgId: session.user.sppgId,
        userRole: session.user.userRole,
      })

      // Fetch settings with all relations
      const settings = await db.procurementSettings.findUnique({
        where: {
          sppgId: session.user.sppgId!,
        },
        include: {
          approvalLevels: {
            orderBy: {
              level: 'asc',
            },
          },
          customCategories: {
            where: {
              isActive: true,
            },
            orderBy: {
              sortOrder: 'asc',
            },
          },
          notificationRules: true,
          paymentTerms: {
            where: {
              isActive: true,
            },
            orderBy: {
              code: 'asc',
            },
          },
          qcChecklists: {
            where: {
              isActive: true,
            },
            orderBy: {
              code: 'asc',
            },
          },
        },
      })

      console.log('[GET /api/sppg/procurement/settings] Query result:', {
        found: !!settings,
        settingsId: settings?.id,
        approvalLevelsCount: settings?.approvalLevels?.length || 0,
        paymentTermsCount: settings?.paymentTerms?.length || 0,
        qcChecklistsCount: settings?.qcChecklists?.length || 0,
      })

      // Return settings (or null if not found)
      return NextResponse.json({
        success: true,
        data: settings,
      })
    } catch (error) {
      console.error('GET /api/sppg/procurement/settings error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch settings',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        { status: 500 }
      )
    }
  })
}

/**
 * PUT /api/sppg/procurement/settings
 * @rbac Protected by withSppgAuth (when enabled)
 * 
 * Update procurement settings with all related data
 * Uses upsert pattern for related tables:
 * - Delete existing records
 * - Create new records from request
 * 
 * @returns {Promise<NextResponse>} Updated settings data
 * 
 * NOTE: Temporarily disabled - schema mismatch between Zod and Prisma needs fixing
 * Use /initialize or /reset endpoints instead for now
 */
export async function PUT() {
  return NextResponse.json(
    {
      success: false,
      error: 'PUT endpoint temporarily disabled. Use POST /initialize or POST /reset instead.',
    },
    { status: 501 }
  )
}

/*
// TODO: Fix schema alignment between Zod schemas and Prisma models
// Issues:
// 1. Field name mismatches (minQCPhotos vs minQCPhotoCount, etc.)
// 2. Optional field handling (general?, approvalLevels?, etc.)
// 3. Type conversions needed
export async function PUT_DISABLED(request: NextRequest) {
  try {
    // 1. Authentication check
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. SPPG access check
    const sppgId = session.user.sppgId
    if (!sppgId) {
      return NextResponse.json(
        { success: false, error: 'SPPG access required' },
        { status: 403 }
      )
    }

    // 3. Permission check (only SPPG_KEPALA and SPPG_ADMIN)
    const allowedRoles = ['SPPG_KEPALA', 'SPPG_ADMIN']
    if (!allowedRoles.includes(session.user.userRole)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // 4. Parse and validate request body
    const body = await request.json()
    const validated = updateSettingsSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validated.error.errors,
        },
        { status: 400 }
      )
    }

    const { general, approvalLevels, categories, paymentTerms, qcChecklists } = validated.data

    // 5. Check if settings exist
    const existingSettings = await db.procurementSettings.findUnique({
      where: { sppgId },
    })

    if (!existingSettings) {
      return NextResponse.json(
        { success: false, error: 'Settings not found. Initialize first.' },
        { status: 404 }
      )
    }

    // 6. Update settings with transaction (atomic operation)
    const updatedSettings = await db.$transaction(async (tx) => {
      // Update general settings
      const updated = await tx.procurementSettings.update({
        where: { sppgId },
        data: {
          // Auto-approve
          autoApproveThreshold: general.autoApproveThreshold,
          
          // QC Settings
          requireQCPhotos: general.requireQCPhotos,
          minQCPhotoCount: general.minQCPhotos,
          
          // Payment
          defaultPaymentTerm: general.defaultPaymentTerm,
          
          // Notifications
          enableWhatsappNotif: general.enableWhatsAppNotif,
          whatsappNumber: general.whatsappNumber,
          enableEmailDigest: general.enableEmailDigest,
          digestFrequency: general.digestFrequency,
          
          // Budget
          budgetAlertEnabled: general.enableBudgetAlerts,
          budgetAlertThreshold: general.budgetAlertThreshold,
          
          // Integrations
          accountingIntegration: general.enableAccountingSync,
          inventoryAutoSync: general.enableInventorySync,
        },
      })

      // Upsert approval levels (delete all, then create new)
      await tx.procurementApprovalLevel.deleteMany({
        where: { settingsId: updated.id },
      })
      if (approvalLevels.length > 0) {
        await tx.procurementApprovalLevel.createMany({
          data: approvalLevels.map((level) => ({
            settingsId: updated.id,
            level: level.level,
            levelName: level.levelName,
            minAmount: level.minAmount,
            maxAmount: level.maxAmount,
            requiredRole: level.requiredRole,
            isParallel: level.isParallel,
            escalationDays: level.escalationDays,
          })),
        })
      }

      // Upsert custom categories (delete all, then create new)
      await tx.procurementCategory.deleteMany({
        where: { settingsId: updated.id },
      })
      if (categories.length > 0) {
        await tx.procurementCategory.createMany({
          data: categories.map((category) => ({
            settingsId: updated.id,
            code: category.code,
            name: category.name,
            description: category.description,
            color: category.color,
            icon: category.icon,
            monthlyBudget: category.monthlyBudget,
            yearlyBudget: category.yearlyBudget,
            budgetAllocation: category.budgetAllocation,
            requiresApproval: category.requiresApproval,
            minApprovalAmount: category.minApprovalAmount,
            customApprover: category.customApprover,
            isActive: category.isActive ?? true,
            sortOrder: category.sortOrder ?? 0,
          })),
        })
      }

      // Upsert payment terms (delete all, then create new)
      await tx.procurementPaymentTerm.deleteMany({
        where: { settingsId: updated.id },
      })
      if (paymentTerms.length > 0) {
        await tx.procurementPaymentTerm.createMany({
          data: paymentTerms.map((term) => ({
            settingsId: updated.id,
            code: term.code,
            name: term.name,
            dueDays: term.dueDays,
            requireDP: term.requireDP,
            dpPercentage: term.dpPercentage,
            lateFeePerDay: term.lateFeePerDay,
            autoRemindDays: term.autoRemindDays,
            autoEscalateDays: term.autoEscalateDays,
            isActive: term.isActive ?? true,
          })),
        })
      }

      // Upsert QC checklists (delete all, then create new)
      await tx.procurementQCChecklist.deleteMany({
        where: { settingsId: updated.id },
      })
      if (qcChecklists.length > 0) {
        await tx.procurementQCChecklist.createMany({
          data: qcChecklists.map((checklist) => ({
            settingsId: updated.id,
            code: checklist.code,
            name: checklist.name,
            category: checklist.category,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            checkItems: checklist.checkItems as any, // Prisma Json type
            passThreshold: checklist.passThreshold,
            requirePhotos: checklist.requirePhotos,
            minPhotos: checklist.minPhotos,
            maxPhotos: checklist.maxPhotos,
            samplingPct: checklist.samplingPct,
            minSampleSize: checklist.minSampleSize,
            autoRejectBelow: checklist.autoRejectBelow,
            autoApproveAbove: checklist.autoApproveAbove,
            isActive: checklist.isActive ?? true,
          })),
        })
      }

      return updated
    })

    // 7. Fetch complete settings with relations
    const completeSettings = await db.procurementSettings.findUnique({
      where: { id: updatedSettings.id },
      include: {
        approvalLevels: {
          orderBy: { level: 'asc' },
        },
        customCategories: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        notificationRules: {
          where: { isActive: true },
        },
        paymentTerms: {
          where: { isActive: true },
          orderBy: { code: 'asc' },
        },
        qcChecklists: {
          where: { isActive: true },
          orderBy: { code: 'asc' },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: completeSettings,
    })
  } catch (error) {
    console.error('PUT /api/sppg/procurement/settings error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update settings',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
}
*/
