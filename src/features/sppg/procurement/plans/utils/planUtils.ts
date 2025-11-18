/**
 * @fileoverview Procurement Plans Utility Functions
 * @version Next.js 15.5.4 / TypeScript 5.7.2
 * @author Bagizi-ID Development Team
 * @see {@link /docs/PROCUREMENT_WORKFLOW_GUIDE.md} Procurement Documentation
 * 
 * UTILITY CATEGORIES:
 * - Status Formatters: Display status with badges/colors
 * - Date Formatters: Format month/year displays
 * - Budget Calculations: Calculate totals, percentages, allocations
 * - Permission Checks: Validate user actions based on status/role
 * - Data Transformations: Convert between form/API formats
 */

import type { UserRole } from '@prisma/client'
import { 
  FileEdit, 
  Send, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Ban, 
  FileText,
  type LucideIcon 
} from 'lucide-react'
import type {
  PlanApprovalStatus,
  PlanStatusInfo,
  BudgetUtilization,
  BudgetCategory,
  BudgetCategoryBreakdown,
  PlanCardData,
  CreatePlanFormInput,
  CreatePlanRequest,
} from '../types'

// ================================ STATUS FORMATTERS ================================

/**
 * Get status label in Indonesian
 */
export function getPlanStatusLabel(status: PlanApprovalStatus): string {
  const statusLabels: Record<PlanApprovalStatus, string> = {
    DRAFT: 'Draft',
    SUBMITTED: 'Diajukan',
    UNDER_REVIEW: 'Sedang Ditinjau',
    APPROVED: 'Disetujui',
    REJECTED: 'Ditolak',
    CANCELLED: 'Dibatalkan',
  }
  
  return statusLabels[status] || status
}

/**
 * Get status color for badges
 */
export function getPlanStatusColor(status: PlanApprovalStatus): string {
  const statusColors: Record<PlanApprovalStatus, string> = {
    DRAFT: 'gray',
    SUBMITTED: 'blue',
    UNDER_REVIEW: 'yellow',
    APPROVED: 'green',
    REJECTED: 'red',
    CANCELLED: 'gray',
  }
  
  return statusColors[status] || 'gray'
}

/**
 * Get status background color
 */
export function getPlanStatusBgColor(status: PlanApprovalStatus): string {
  const statusBgColors: Record<PlanApprovalStatus, string> = {
    DRAFT: 'bg-gray-100 dark:bg-gray-800',
    SUBMITTED: 'bg-blue-100 dark:bg-blue-900',
    UNDER_REVIEW: 'bg-yellow-100 dark:bg-yellow-900',
    APPROVED: 'bg-green-100 dark:bg-green-900',
    REJECTED: 'bg-red-100 dark:bg-red-900',
    CANCELLED: 'bg-gray-100 dark:bg-gray-800',
  }
  
  return statusBgColors[status] || 'bg-gray-100 dark:bg-gray-800'
}

/**
 * Get status icon
 */
export function getPlanStatusIcon(status: PlanApprovalStatus): LucideIcon {
  const statusIcons: Record<PlanApprovalStatus, LucideIcon> = {
    DRAFT: FileEdit,
    SUBMITTED: Send,
    UNDER_REVIEW: Eye,
    APPROVED: CheckCircle2,
    REJECTED: XCircle,
    CANCELLED: Ban,
  }
  
  return statusIcons[status] || FileText
}

/**
 * Get status description
 */
export function getPlanStatusDescription(status: PlanApprovalStatus): string {
  const statusDescriptions: Record<PlanApprovalStatus, string> = {
    DRAFT: 'Rencana masih dalam tahap penyusunan',
    SUBMITTED: 'Rencana telah diajukan untuk ditinjau',
    UNDER_REVIEW: 'Rencana sedang ditinjau oleh pihak berwenang',
    APPROVED: 'Rencana telah disetujui dan siap dijalankan',
    REJECTED: 'Rencana ditolak dan perlu perbaikan',
    CANCELLED: 'Rencana dibatalkan',
  }
  
  return statusDescriptions[status] || 'Status tidak diketahui'
}

/**
 * Get complete status info
 */
export function getPlanStatusInfo(status: PlanApprovalStatus): PlanStatusInfo {
  return {
    status,
    label: getPlanStatusLabel(status),
    color: getPlanStatusColor(status),
    bgColor: getPlanStatusBgColor(status),
    icon: getPlanStatusIcon(status),
    description: getPlanStatusDescription(status),
  }
}

// ================================ DATE FORMATTERS ================================

/**
 * Format month to Indonesian name
 */
export function formatPlanMonth(month: string): string {
  // If already a month name, return as is
  const monthNames = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ]
  
  if (monthNames.includes(month.toUpperCase())) {
    const monthMap: Record<string, string> = {
      JANUARY: 'Januari',
      FEBRUARY: 'Februari',
      MARCH: 'Maret',
      APRIL: 'April',
      MAY: 'Mei',
      JUNE: 'Juni',
      JULY: 'Juli',
      AUGUST: 'Agustus',
      SEPTEMBER: 'September',
      OCTOBER: 'Oktober',
      NOVEMBER: 'November',
      DECEMBER: 'Desember',
    }
    return monthMap[month.toUpperCase()] || month
  }
  
  // If YYYY-MM format, convert to month name
  const yearMonthRegex = /^(\d{4})-(0[1-9]|1[0-2])$/
  const match = month.match(yearMonthRegex)
  if (match) {
    const monthIndex = parseInt(match[2], 10) - 1
    const monthNamesIndo = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]
    return monthNamesIndo[monthIndex] || month
  }
  
  return month
}

/**
 * Format plan period
 */
export function formatPlanPeriod(month: string, year: number): string {
  return `${formatPlanMonth(month)} ${year}`
}

/**
 * Format quarter
 */
export function formatPlanQuarter(quarter: number | null): string {
  if (!quarter) return '-'
  return `Kuartal ${quarter}`
}

/**
 * Get month number from month string
 */
export function getMonthNumber(month: string): number {
  const monthMap: Record<string, number> = {
    JANUARY: 1,
    FEBRUARY: 2,
    MARCH: 3,
    APRIL: 4,
    MAY: 5,
    JUNE: 6,
    JULY: 7,
    AUGUST: 8,
    SEPTEMBER: 9,
    OCTOBER: 10,
    NOVEMBER: 11,
    DECEMBER: 12,
  }
  
  return monthMap[month.toUpperCase()] || 1
}

// ================================ BUDGET CALCULATIONS ================================

/**
 * Calculate budget usage percentage
 */
export function calculateBudgetUsagePercent(
  totalBudget: number,
  usedBudget: number
): number {
  if (totalBudget === 0) return 0
  return Math.round((usedBudget / totalBudget) * 100)
}

/**
 * Calculate budget allocation percentage
 */
export function calculateBudgetAllocationPercent(
  totalBudget: number,
  allocatedBudget: number
): number {
  if (totalBudget === 0) return 0
  return Math.round((allocatedBudget / totalBudget) * 100)
}

/**
 * Calculate remaining budget
 */
export function calculateRemainingBudget(
  totalBudget: number,
  usedBudget: number
): number {
  return Math.max(0, totalBudget - usedBudget)
}

/**
 * Calculate cost per meal
 */
export function calculateCostPerMeal(
  totalBudget: number,
  targetMeals: number
): number {
  if (targetMeals === 0) return 0
  return totalBudget / targetMeals
}

/**
 * Calculate allocated budget from categories
 */
export function calculateAllocatedBudget(budget: {
  proteinBudget?: number | null
  carbBudget?: number | null
  vegetableBudget?: number | null
  fruitBudget?: number | null
  otherBudget?: number | null
}): number {
  return (
    (budget.proteinBudget || 0) +
    (budget.carbBudget || 0) +
    (budget.vegetableBudget || 0) +
    (budget.fruitBudget || 0) +
    (budget.otherBudget || 0)
  )
}

/**
 * Get budget utilization info
 */
export function getBudgetUtilization(
  totalBudget: number,
  allocatedBudget: number,
  usedBudget: number
): BudgetUtilization {
  const remaining = calculateRemainingBudget(totalBudget, usedBudget)
  const percentageUsed = calculateBudgetUsagePercent(totalBudget, usedBudget)
  const percentageAllocated = calculateBudgetAllocationPercent(totalBudget, allocatedBudget)
  
  let status: BudgetUtilization['status'] = 'UNDER_BUDGET'
  let statusColor = 'text-green-600 dark:text-green-400'
  let statusLabel = 'Di Bawah Anggaran'
  
  if (usedBudget > totalBudget) {
    status = 'EXCEEDED'
    statusColor = 'text-red-600 dark:text-red-400'
    statusLabel = 'Melebihi Anggaran'
  } else if (percentageUsed >= 90) {
    status = 'OVER_BUDGET'
    statusColor = 'text-orange-600 dark:text-orange-400'
    statusLabel = 'Mendekati Batas'
  } else if (percentageUsed >= 70) {
    status = 'ON_BUDGET'
    statusColor = 'text-yellow-600 dark:text-yellow-400'
    statusLabel = 'Sesuai Rencana'
  }
  
  return {
    total: totalBudget,
    allocated: allocatedBudget,
    used: usedBudget,
    remaining,
    percentageUsed,
    percentageAllocated,
    status,
    statusColor,
    statusLabel,
  }
}

/**
 * Get budget category breakdown
 */
export function getBudgetCategoryBreakdown(budget: {
  totalBudget: number
  proteinBudget?: number | null
  carbBudget?: number | null
  vegetableBudget?: number | null
  fruitBudget?: number | null
  otherBudget?: number | null
}): BudgetCategoryBreakdown[] {
  const categories: Array<{
    category: BudgetCategory
    amount: number
    label: string
    color: string
  }> = [
    {
      category: 'PROTEIN',
      amount: budget.proteinBudget || 0,
      label: 'Protein',
      color: 'text-red-600 dark:text-red-400',
    },
    {
      category: 'CARB',
      amount: budget.carbBudget || 0,
      label: 'Karbohidrat',
      color: 'text-yellow-600 dark:text-yellow-400',
    },
    {
      category: 'VEGETABLE',
      amount: budget.vegetableBudget || 0,
      label: 'Sayuran',
      color: 'text-green-600 dark:text-green-400',
    },
    {
      category: 'FRUIT',
      amount: budget.fruitBudget || 0,
      label: 'Buah',
      color: 'text-orange-600 dark:text-orange-400',
    },
    {
      category: 'OTHER',
      amount: budget.otherBudget || 0,
      label: 'Lainnya',
      color: 'text-gray-600 dark:text-gray-400',
    },
  ]
  
  return categories
    .filter((cat) => cat.amount > 0)
    .map((cat) => ({
      ...cat,
      percentage: Math.round((cat.amount / budget.totalBudget) * 100),
    }))
}

// ================================ PERMISSION CHECKS ================================

/**
 * Check if plan can be edited
 */
export function canEditPlan(approvalStatus: string): boolean {
  return approvalStatus === 'DRAFT'
}

/**
 * Check if plan can be deleted
 */
export function canDeletePlan(approvalStatus: string): boolean {
  return approvalStatus === 'DRAFT'
}

/**
 * Check if plan can be submitted
 */
export function canSubmitPlan(approvalStatus: string): boolean {
  return approvalStatus === 'DRAFT'
}

/**
 * Check if plan can be approved
 */
export function canApprovePlan(
  approvalStatus: string,
  userRole: UserRole
): boolean {
  const allowedStatuses = ['SUBMITTED', 'UNDER_REVIEW']
  const allowedRoles: UserRole[] = [
    'SPPG_KEPALA',
    'SPPG_ADMIN',
    'SPPG_AKUNTAN',
    'PLATFORM_SUPERADMIN',
  ]
  
  return allowedStatuses.includes(approvalStatus) && allowedRoles.includes(userRole)
}

/**
 * Check if plan can be rejected
 */
export function canRejectPlan(
  approvalStatus: string,
  userRole: UserRole
): boolean {
  return canApprovePlan(approvalStatus, userRole)
}

/**
 * Check if plan can be cancelled
 */
export function canCancelPlan(
  approvalStatus: string,
  userRole: UserRole
): boolean {
  const allowedStatuses = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED']
  const allowedRoles: UserRole[] = [
    'SPPG_KEPALA',
    'SPPG_ADMIN',
    'PLATFORM_SUPERADMIN',
  ]
  
  return allowedStatuses.includes(approvalStatus) && allowedRoles.includes(userRole)
}

// ================================ DATA TRANSFORMATIONS ================================

/**
 * Transform form input to API request
 * NO DATE CONVERSION NEEDED (uses month/year)
 */
export function transformFormToAPI(
  formData: CreatePlanFormInput
): CreatePlanRequest {
  return {
    ...formData,
  }
}

/**
 * Transform plan data to card display
 */
export function transformPlanToCardData(plan: {
  id: string
  planName: string
  planMonth: string
  planYear: number
  planQuarter: number | null
  approvalStatus: string
  totalBudget: number
  usedBudget: number
  remainingBudget: number
  targetRecipients: number
  targetMeals: number
  costPerMeal?: number | null
}): PlanCardData {
  const statusInfo = getPlanStatusInfo(plan.approvalStatus as PlanApprovalStatus)
  const budgetUsagePercent = calculateBudgetUsagePercent(plan.totalBudget, plan.usedBudget)
  
  return {
    id: plan.id,
    planName: plan.planName,
    planMonth: formatPlanMonth(plan.planMonth),
    planYear: plan.planYear,
    planQuarter: plan.planQuarter,
    approvalStatus: plan.approvalStatus,
    statusLabel: statusInfo.label,
    statusColor: statusInfo.color,
    totalBudget: formatCurrency(plan.totalBudget),
    usedBudget: formatCurrency(plan.usedBudget),
    remainingBudget: formatCurrency(plan.remainingBudget),
    budgetUsagePercent,
    targetRecipients: plan.targetRecipients,
    targetMeals: plan.targetMeals,
    costPerMeal: plan.costPerMeal ? formatCurrency(plan.costPerMeal) : '-',
  }
}

// ================================ FORMATTING HELPERS ================================

/**
 * Format currency to Indonesian Rupiah
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format number with thousand separators
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num)
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}
