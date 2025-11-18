/**
 * @fileoverview Budget Tracking & Alert Helper Functions
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * PHASE 3: Budget Management Integration
 * - Track spending per category
 * - Validate budget limits
 * - Generate budget alerts
 * 
 * PHASE 4.3: WhatsApp Notifications
 * - Send budget alerts via WhatsApp
 */

import { db } from '@/lib/prisma'
import { sendBudgetAlertNotification } from '@/lib/notification-service'

/**
 * Budget Check Result
 */
export interface BudgetCheckResult {
  allowed: boolean
  message?: string
  details?: {
    categoryName: string
    currentSpending: number
    newAmount: number
    totalAfter: number
    monthlyBudget: number | null
    yearlyBudget: number | null
    usagePercent: number
    alertThreshold: number
    shouldAlert: boolean
  }
}

/**
 * Calculate current month spending for a category
 * 
 * @param sppgId - SPPG ID
 * @param _categoryCode - Category code to calculate (TODO: integrate with items filtering)
 * @returns Current month spending amount
 */
export async function calculateMonthlySpending(
  sppgId: string,
  _categoryCode: string // eslint-disable-line @typescript-eslint/no-unused-vars
): Promise<number> {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  // Sum total amount from procurement where category matches
  // TODO: Filter by category from items when schema relationship established
  const result = await db.procurement.aggregate({
    where: {
      sppgId,
      procurementDate: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
      status: {
        in: ['APPROVED', 'ORDERED', 'PARTIALLY_RECEIVED', 'FULLY_RECEIVED', 'COMPLETED'],
      },
    },
    _sum: {
      totalAmount: true,
    },
  })

  return result._sum?.totalAmount || 0
}

/**
 * Calculate current year spending for a category
 * 
 * @param sppgId - SPPG ID
 * @param categoryCode - Category code to calculate (TODO: integrate with items filtering)
 * @returns Current year spending amount
 */
export async function calculateYearlySpending(
  sppgId: string,
  _categoryCode: string // eslint-disable-line @typescript-eslint/no-unused-vars
): Promise<number> {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59)

  // TODO: Filter by category from items when schema relationship established
  const result = await db.procurement.aggregate({
    where: {
      sppgId,
      procurementDate: {
        gte: startOfYear,
        lte: endOfYear,
      },
      status: {
        in: ['APPROVED', 'ORDERED', 'PARTIALLY_RECEIVED', 'FULLY_RECEIVED', 'COMPLETED'],
      },
    },
    _sum: {
      totalAmount: true,
    },
  })

  return result._sum?.totalAmount || 0
}

/**
 * Check if order is within budget limits
 * 
 * @param sppgId - SPPG ID
 * @param categoryCode - Category code
 * @param orderAmount - New order amount to check
 * @returns Budget check result with alert info
 * 
 * @example
 * ```typescript
 * const result = await checkCategoryBudget('sppg-id', 'SAYURAN', 5000000)
 * if (!result.allowed) {
 *   return NextResponse.json({ error: result.message }, { status: 400 })
 * }
 * if (result.details?.shouldAlert) {
 *   await sendBudgetAlert(result.details)
 * }
 * ```
 */
export async function checkCategoryBudget(
  sppgId: string,
  categoryCode: string,
  orderAmount: number
): Promise<BudgetCheckResult> {
  // Fetch settings and category budget
  const settings = await db.procurementSettings.findUnique({
    where: { sppgId },
    include: {
      customCategories: {
        where: {
          code: categoryCode,
          isActive: true,
        },
      },
    },
  })

  // If no settings or no category, allow (no budget configured)
  if (!settings || !settings.customCategories.length) {
    return {
      allowed: true,
      message: 'No budget configured for this category',
    }
  }

  const category = settings.customCategories[0]

  // If category has no budget limits, allow
  if (!category.monthlyBudget && !category.yearlyBudget) {
    return {
      allowed: true,
      message: 'No budget limits configured for this category',
    }
  }

  // Calculate current spending
  const currentMonthlySpending = await calculateMonthlySpending(sppgId, categoryCode)
  const currentYearlySpending = await calculateYearlySpending(sppgId, categoryCode)

  const totalAfterMonthly = currentMonthlySpending + orderAmount
  const totalAfterYearly = currentYearlySpending + orderAmount

  // Check monthly budget
  if (category.monthlyBudget && totalAfterMonthly > category.monthlyBudget) {
    return {
      allowed: false,
      message: `Monthly budget exceeded for category "${category.name}"`,
      details: {
        categoryName: category.name,
        currentSpending: currentMonthlySpending,
        newAmount: orderAmount,
        totalAfter: totalAfterMonthly,
        monthlyBudget: category.monthlyBudget,
        yearlyBudget: category.yearlyBudget,
        usagePercent: (totalAfterMonthly / category.monthlyBudget) * 100,
        alertThreshold: settings.budgetAlertThreshold || 80,
        shouldAlert: true,
      },
    }
  }

  // Check yearly budget
  if (category.yearlyBudget && totalAfterYearly > category.yearlyBudget) {
    return {
      allowed: false,
      message: `Yearly budget exceeded for category "${category.name}"`,
      details: {
        categoryName: category.name,
        currentSpending: currentYearlySpending,
        newAmount: orderAmount,
        totalAfter: totalAfterYearly,
        monthlyBudget: category.monthlyBudget,
        yearlyBudget: category.yearlyBudget,
        usagePercent: (totalAfterYearly / category.yearlyBudget) * 100,
        alertThreshold: settings.budgetAlertThreshold || 80,
        shouldAlert: true,
      },
    }
  }

  // Budget OK, but check if alert needed
  const usagePercent = category.monthlyBudget
    ? (totalAfterMonthly / category.monthlyBudget) * 100
    : 0

  const alertThreshold = settings.budgetAlertThreshold || 80
  const shouldAlert = settings.budgetAlertEnabled && usagePercent >= alertThreshold

  return {
    allowed: true,
    message: 'Budget check passed',
    details: {
      categoryName: category.name,
      currentSpending: currentMonthlySpending,
      newAmount: orderAmount,
      totalAfter: totalAfterMonthly,
      monthlyBudget: category.monthlyBudget,
      yearlyBudget: category.yearlyBudget,
      usagePercent,
      alertThreshold,
      shouldAlert,
    },
  }
}

/**
 * Log budget alert (placeholder for notification system)
 * This will be expanded in Phase 4 for actual notifications
 */
export async function logBudgetAlert(
  sppgId: string,
  details: BudgetCheckResult['details']
) {
  if (!details) return

  console.log('🚨 BUDGET ALERT:', {
    sppg: sppgId,
    category: details.categoryName,
    usage: `${details.usagePercent.toFixed(1)}%`,
    current: details.currentSpending,
    limit: details.monthlyBudget,
    threshold: details.alertThreshold,
  })

  // Phase 4.3: Send WhatsApp notifications
  try {
    // Get finance team users (SPPG_KEPALA and SPPG_AKUNTAN)
    const financeUsers = await db.user.findMany({
      where: {
        sppgId,
        userRole: {
          in: ['SPPG_KEPALA', 'SPPG_AKUNTAN'],
        },
      },
      select: {
        phone: true,
        email: true,
        name: true,
      },
    })

    const recipients = financeUsers
      .map(u => ({ phone: u.phone || undefined, email: u.email || undefined, name: u.name || 'Finance' }))
      .filter(r => r.phone || r.email)

    if (recipients.length > 0) {
      await sendBudgetAlertNotification(sppgId, details.categoryName, details.usagePercent, recipients)
    }
  } catch (notificationError) {
    // Log but don't fail if notification fails
    console.error('Failed to send budget alert notification:', notificationError)
  }
}
