/**
 * @fileoverview Production domain utility functions and helpers
 * @version Next.js 15.5.4 / Enterprise-grade utilities
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Enterprise Development Guidelines
 */

import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import type { ProductionStatus, QualityCheckType, SeverityLevel } from '../types'

// ================================ FORMATTING UTILITIES ================================

/**
 * Format currency in Indonesian Rupiah
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
 * Format date and time
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'dd MMM yyyy, HH:mm', { locale: id })
}

/**
 * Format date only
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'dd MMMM yyyy', { locale: id })
}

/**
 * Format time only
 */
export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'HH:mm', { locale: id })
}

/**
 * Format number with thousand separator
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('id-ID')
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

// ================================ BATCH NUMBER UTILITIES ================================

/**
 * Generate batch number for production
 * Format: PROD-YYYYMMDD-XXX
 */
export function generateBatchNumber(date: Date, sequence: number): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const seq = String(sequence).padStart(3, '0')
  
  return `PROD-${year}${month}${day}-${seq}`
}

/**
 * Parse batch number to get date and sequence
 */
export function parseBatchNumber(batchNumber: string): { date: Date; sequence: number } | null {
  const regex = /^PROD-(\d{4})(\d{2})(\d{2})-(\d{3})$/
  const match = batchNumber.match(regex)
  
  if (!match) return null
  
  const [, year, month, day, seq] = match
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  const sequence = parseInt(seq)
  
  return { date, sequence }
}

// ================================ STATUS UTILITIES ================================

/**
 * Get status label in Indonesian
 */
export function getStatusLabel(status: ProductionStatus): string {
  const labels: Record<ProductionStatus, string> = {
    PLANNED: 'Dijadwalkan',
    PREPARING: 'Persiapan',
    COOKING: 'Memasak',
    QUALITY_CHECK: 'Quality Check',
    COMPLETED: 'Selesai',
    CANCELLED: 'Dibatalkan',
  }
  return labels[status]
}

/**
 * Get status color class for badges
 */
export function getStatusColor(status: ProductionStatus): string {
  const colors: Record<ProductionStatus, string> = {
    PLANNED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    PREPARING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
    COOKING: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
    QUALITY_CHECK: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
    COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  }
  return colors[status]
}

/**
 * Check if production status can be edited
 */
export function canEditProduction(status: ProductionStatus): boolean {
  return status === 'PLANNED'
}

/**
 * Check if production can be deleted
 */
export function canDeleteProduction(status: ProductionStatus): boolean {
  return status === 'PLANNED'
}

/**
 * Get next possible status transitions
 */
export function getNextStatuses(currentStatus: ProductionStatus): ProductionStatus[] {
  const transitions: Record<ProductionStatus, ProductionStatus[]> = {
    PLANNED: ['PREPARING', 'CANCELLED'],
    PREPARING: ['COOKING', 'CANCELLED'],
    COOKING: ['QUALITY_CHECK', 'CANCELLED'],
    QUALITY_CHECK: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: [],
  }
  return transitions[currentStatus] || []
}

// ================================ QUALITY CHECK UTILITIES ================================

/**
 * Get quality check type label
 */
export function getCheckTypeLabel(type: QualityCheckType): string {
  const labels: Record<QualityCheckType, string> = {
    HYGIENE: 'Kebersihan',
    TEMPERATURE: 'Suhu',
    TASTE: 'Rasa',
    APPEARANCE: 'Penampilan',
    SAFETY: 'Keamanan',
  }
  return labels[type]
}

/**
 * Get severity label
 */
export function getSeverityLabel(severity: SeverityLevel): string {
  const labels: Record<SeverityLevel, string> = {
    LOW: 'Rendah',
    MEDIUM: 'Sedang',
    HIGH: 'Tinggi',
    CRITICAL: 'Kritis',
  }
  return labels[severity]
}

/**
 * Get severity color
 */
export function getSeverityColor(severity: SeverityLevel): string {
  const colors: Record<SeverityLevel, string> = {
    LOW: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    MEDIUM: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
    HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
    CRITICAL: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  }
  return colors[severity]
}

/**
 * Calculate overall quality score from multiple checks
 */
export function calculateQualityScore(checks: Array<{ score?: number; passed: boolean }>): number {
  if (checks.length === 0) return 0
  
  const totalScore = checks.reduce((sum, check) => {
    if (check.score) return sum + check.score
    return sum + (check.passed ? 100 : 0)
  }, 0)
  
  return Math.round(totalScore / checks.length)
}

/**
 * Check if quality score passes threshold
 */
export function passesQualityThreshold(score: number, threshold: number = 70): boolean {
  return score >= threshold
}

// ================================ TIME UTILITIES ================================

/**
 * Calculate duration between two dates in minutes
 */
export function calculateDuration(start: Date | string, end: Date | string): number {
  const startDate = typeof start === 'string' ? new Date(start) : start
  const endDate = typeof end === 'string' ? new Date(end) : end
  return Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60))
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} menit`
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) return `${hours} jam`
  return `${hours} jam ${remainingMinutes} menit`
}

/**
 * Check if production is delayed
 */
export function isDelayed(plannedTime: Date, actualTime: Date): boolean {
  return actualTime > plannedTime
}

/**
 * Calculate delay in minutes
 */
export function calculateDelay(plannedTime: Date, actualTime: Date): number {
  const delay = calculateDuration(plannedTime, actualTime)
  return delay > 0 ? delay : 0
}

// ================================ COST UTILITIES ================================

/**
 * Calculate cost per portion
 */
export function calculateCostPerPortion(totalCost: number, portions: number): number {
  if (portions === 0) return 0
  return totalCost / portions
}

/**
 * Calculate cost variance percentage
 */
export function calculateCostVariance(estimated: number, actual: number): number {
  if (estimated === 0) return 0
  return ((actual - estimated) / estimated) * 100
}

/**
 * Check if cost is within budget (variance <= 10%)
 */
export function isWithinBudget(estimated: number, actual: number, threshold: number = 10): boolean {
  const variance = Math.abs(calculateCostVariance(estimated, actual))
  return variance <= threshold
}

// ================================ PORTION UTILITIES ================================

/**
 * Calculate portion achievement percentage
 */
export function calculatePortionAchievement(planned: number, actual: number): number {
  if (planned === 0) return 0
  return (actual / planned) * 100
}

/**
 * Calculate waste percentage
 */
export function calculateWastePercentage(produced: number, waste: number): number {
  if (produced === 0) return 0
  return (waste / produced) * 100
}

// ================================ VALIDATION UTILITIES ================================

/**
 * Validate batch number format
 */
export function isValidBatchNumber(batchNumber: string): boolean {
  const regex = /^PROD-\d{8}-\d{3}$/
  return regex.test(batchNumber)
}

/**
 * Validate temperature range for food safety
 */
export function isValidTemperature(temp: number, min: number = -20, max: number = 300): boolean {
  return temp >= min && temp <= max
}

/**
 * Validate portions range
 */
export function isValidPortions(portions: number, min: number = 1, max: number = 10000): boolean {
  return Number.isInteger(portions) && portions >= min && portions <= max
}

// ================================ CONSTANTS ================================

export const PRODUCTION_CONSTANTS = {
  MIN_PORTIONS: 1,
  MAX_PORTIONS: 10000,
  MIN_DURATION_MINUTES: 30,
  MIN_TEMPERATURE: -20,
  MAX_TEMPERATURE: 300,
  QUALITY_PASS_THRESHOLD: 70,
  COST_VARIANCE_THRESHOLD: 10,
  BATCH_NUMBER_PREFIX: 'PROD',
} as const

export const MEAL_TYPE_LABELS = {
  BREAKFAST: 'Sarapan',
  SNACK: 'Snack',
  LUNCH: 'Makan Siang',
  DINNER: 'Makan Malam',
} as const
