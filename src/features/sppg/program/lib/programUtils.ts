/**
 * @fileoverview Utility functions untuk Program domain
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import type { ProgramType, TargetGroup, ProgramStatus } from '@prisma/client'

/**
 * Format currency to IDR format
 * @param amount - Amount in rupiah
 * @returns Formatted currency string (e.g., "Rp 50.000.000")
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '-'
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format date to Indonesian format
 * @param date - Date object or ISO string
 * @param formatStr - date-fns format string
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | null | undefined,
  formatStr: string = 'dd MMM yyyy'
): string {
  if (!date) return '-'
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, formatStr, { locale: localeId })
}

/**
 * Format date range
 * @param startDate - Start date
 * @param endDate - End date (optional)
 * @returns Formatted date range string
 */
export function formatDateRange(
  startDate: Date | string | null | undefined,
  endDate?: Date | string | null
): string {
  if (!startDate) return '-'
  
  const start = formatDate(startDate, 'dd MMM yyyy')
  
  if (!endDate) {
    return `${start} - Sekarang`
  }
  
  const end = formatDate(endDate, 'dd MMM yyyy')
  return `${start} - ${end}`
}

/**
 * Calculate progress percentage
 * @param current - Current value
 * @param target - Target value
 * @returns Percentage (0-100)
 */
export function calculateProgress(
  current: number | null | undefined,
  target: number | null | undefined
): number {
  if (!current || !target || target === 0) return 0
  
  const percentage = (current / target) * 100
  return Math.min(Math.round(percentage), 100) // Cap at 100%
}

/**
 * Get status color for badges
 * @param status - Program status
 * @returns Tailwind color class
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    DRAFT: 'bg-gray-500 text-white',
    ACTIVE: 'bg-green-500 text-white',
    PAUSED: 'bg-yellow-500 text-white',
    COMPLETED: 'bg-blue-500 text-white',
    CANCELLED: 'bg-red-500 text-white',
    ARCHIVED: 'bg-gray-600 text-white',
  }
  
  return colors[status] || 'bg-gray-500 text-white'
}

/**
 * Get status variant for shadcn/ui Badge
 * @param status - Program status
 * @returns Badge variant
 */
export function getStatusVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    DRAFT: 'outline',
    ACTIVE: 'default',
    PAUSED: 'secondary',
    COMPLETED: 'secondary',
    CANCELLED: 'destructive',
    ARCHIVED: 'outline',
  }
  
  return variants[status] || 'secondary'
}

/**
 * Get Indonesian label for ProgramType enum
 * @param type - ProgramType enum value
 * @returns Indonesian label
 */
export function getProgramTypeLabel(type: ProgramType | string): string {
  const labels: Record<string, string> = {
    NUTRITIONAL_RECOVERY: 'Pemulihan Gizi',
    NUTRITIONAL_EDUCATION: 'Edukasi Gizi',
    FREE_NUTRITIOUS_MEAL: 'Makanan Bergizi Gratis',
    EMERGENCY_NUTRITION: 'Gizi Darurat',
    STUNTING_INTERVENTION: 'Intervensi Stunting',
  }
  
  return labels[type] || type
}

/**
 * Get Indonesian label for TargetGroup enum
 * @param group - TargetGroup enum value
 * @returns Indonesian label
 */
export function getTargetGroupLabel(group: TargetGroup | string): string {
  const labels: Record<string, string> = {
    TODDLER: 'Balita',
    PREGNANT_WOMAN: 'Ibu Hamil',
    BREASTFEEDING_MOTHER: 'Ibu Menyusui',
    TEENAGE_GIRL: 'Remaja Putri',
    ELDERLY: 'Lansia',
    SCHOOL_CHILDREN: 'Anak Sekolah',
  }
  
  return labels[group] || group
}

/**
 * Get Indonesian label for ProgramStatus enum
 * @param status - ProgramStatus enum value
 * @returns Indonesian status label
 */
export function getProgramStatusLabel(status: ProgramStatus | string): string {
  const labels: Record<string, string> = {
    DRAFT: 'Draft',
    ACTIVE: 'Aktif',
    PAUSED: 'Dijeda',
    COMPLETED: 'Selesai',
    CANCELLED: 'Dibatalkan',
    ARCHIVED: 'Diarsipkan',
  }
  
  return labels[status] || status
}

/**
 * Get Indonesian label for EnrollmentStatus enum
 * @param status - EnrollmentStatus enum value
 * @returns Indonesian status label
 */
export function getEnrollmentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'Menunggu',
    ACTIVE: 'Aktif',
    SUSPENDED: 'Ditangguhkan',
    COMPLETED: 'Selesai',
    CANCELLED: 'Dibatalkan',
    GRADUATED: 'Lulus',
  }
  
  return labels[status] || status
}

/**
 * Get status variant for EnrollmentStatus
 * @param status - EnrollmentStatus enum value
 * @returns Badge variant
 */
export function getEnrollmentStatusVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    PENDING: 'outline',
    ACTIVE: 'default',
    SUSPENDED: 'secondary',
    COMPLETED: 'secondary',
    CANCELLED: 'destructive',
    GRADUATED: 'default',
  }
  
  return variants[status] || 'secondary'
}

/**
 * Format large numbers with abbreviations
 * @param num - Number to format
 * @returns Formatted string (e.g., "1.5K", "2.3M")
 */
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return '0'
  
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  
  return num.toString()
}

/**
 * Format number with thousand separators (Indonesian format)
 * @param num - Number to format
 * @returns Formatted string with dots as thousand separators (e.g., "5.000", "1.250.000")
 */
export function formatNumberWithSeparator(num: number | null | undefined): string {
  if (num === null || num === undefined) return '0'
  return num.toLocaleString('id-ID')
}

/**
 * Calculate days remaining until end date
 * @param endDate - End date
 * @returns Days remaining (negative if past)
 */
export function getDaysRemaining(endDate: Date | string | null | undefined): number {
  if (!endDate) return 0
  
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate
  const now = new Date()
  const diffTime = end.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}

/**
 * Format days remaining as human-readable string
 * @param endDate - End date
 * @returns Formatted string (e.g., "5 hari lagi", "Berakhir kemarin")
 */
export function formatDaysRemaining(endDate: Date | string | null | undefined): string {
  if (!endDate) return 'Tidak ada batas waktu'
  
  const days = getDaysRemaining(endDate)
  
  if (days === 0) return 'Berakhir hari ini'
  if (days === 1) return 'Berakhir besok'
  if (days === -1) return 'Berakhir kemarin'
  if (days > 0) return `${days} hari lagi`
  if (days < 0) return `Berakhir ${Math.abs(days)} hari lalu`
  
  return 'Tidak ada batas waktu'
}

/**
 * Get progress status based on percentage
 * @param percentage - Progress percentage
 * @returns Status category
 */
export function getProgressStatus(percentage: number): 'excellent' | 'good' | 'warning' | 'danger' {
  if (percentage >= 100) return 'excellent'
  if (percentage >= 75) return 'good'
  if (percentage >= 50) return 'warning'
  return 'danger'
}

/**
 * Get progress color based on percentage
 * @param percentage - Progress percentage
 * @returns Tailwind color class
 */
export function getProgressColor(percentage: number): string {
  const status = getProgressStatus(percentage)
  
  const colors: Record<string, string> = {
    excellent: 'bg-green-500',
    good: 'bg-blue-500',
    warning: 'bg-yellow-500',
    danger: 'bg-orange-500',
  }
  
  return colors[status]
}

/**
 * Format feeding days array to readable string
 * @param days - Array of day numbers (1-7: Mon-Sun)
 * @returns Formatted string (e.g., "Senin, Rabu, Jumat")
 */
export function formatFeedingDays(days: number[] | null | undefined): string {
  if (!days || days.length === 0) return '-'
  
  const dayNames: Record<number, string> = {
    1: 'Sen',
    2: 'Sel',
    3: 'Rab',
    4: 'Kam',
    5: 'Jum',
    6: 'Sab',
    7: 'Min',
  }
  
  return days
    .sort()
    .map(day => dayNames[day] || day)
    .join(', ')
}

/**
 * Validate if program is active
 * @param status - Program status
 * @param endDate - Program end date
 * @returns Boolean indicating if program is currently active
 */
export function isProgramActive(
  status: string,
  endDate?: Date | string | null
): boolean {
  if (status !== 'ACTIVE') return false
  if (!endDate) return true
  
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate
  return end > new Date()
}

/**
 * Calculate budget utilization percentage
 * @param spent - Amount spent
 * @param total - Total budget
 * @returns Percentage (0-100+)
 */
export function calculateBudgetUtilization(
  spent: number | null | undefined,
  total: number | null | undefined
): number {
  if (!spent || !total || total === 0) return 0
  
  return Math.round((spent / total) * 100)
}
