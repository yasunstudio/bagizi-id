/**
 * @fileoverview Receipt Utility Functions
 * @version Next.js 15.5.4 / Enterprise-grade
 * @author Bagizi-ID Development Team
 */

import { QualityGrade } from '@prisma/client'
import type { ReceiptItem } from '../types'

// ================================ STATUS HELPERS ================================

/**
 * Get delivery status label
 */
export function getDeliveryStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    ORDERED: 'Dipesan',
    SHIPPED: 'Dikirim',
    PARTIAL: 'Diterima Sebagian',
    DELIVERED: 'Diterima',
    CANCELLED: 'Dibatalkan'
  }
  return labels[status] || status
}

/**
 * Get delivery status variant
 */
export function getDeliveryStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    ORDERED: 'outline',
    SHIPPED: 'secondary',
    PARTIAL: 'secondary',
    DELIVERED: 'default',
    CANCELLED: 'destructive'
  }
  return variants[status] || 'outline'
}

/**
 * Get quality grade label
 */
export function getQualityGradeLabel(grade: QualityGrade | null): string {
  if (!grade) return 'Belum Dinilai'
  
  const labels: Record<QualityGrade, string> = {
    EXCELLENT: 'Excellent',
    GOOD: 'Baik',
    FAIR: 'Cukup',
    POOR: 'Kurang',
    REJECTED: 'Ditolak'
  }
  return labels[grade]
}

/**
 * Get quality grade variant
 */
export function getQualityGradeVariant(grade: QualityGrade | null): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (!grade) return 'outline'
  
  const variants: Record<QualityGrade, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    EXCELLENT: 'default',
    GOOD: 'default',
    FAIR: 'secondary',
    POOR: 'secondary',
    REJECTED: 'destructive'
  }
  return variants[grade]
}

/**
 * Get quality grade color
 */
export function getQualityGradeColor(grade: QualityGrade | null): string {
  if (!grade) return 'text-muted-foreground'
  
  const colors: Record<QualityGrade, string> = {
    EXCELLENT: 'text-green-600 dark:text-green-400',
    GOOD: 'text-blue-600 dark:text-blue-400',
    FAIR: 'text-yellow-600 dark:text-yellow-400',
    POOR: 'text-orange-600 dark:text-orange-400',
    REJECTED: 'text-red-600 dark:text-red-400'
  }
  return colors[grade]
}

// ================================ CALCULATION HELPERS ================================

/**
 * Calculate receipt completion percentage
 */
export function calculateReceiptCompletion(items: ReceiptItem[]): number {
  if (items.length === 0) return 0
  
  const totalOrdered = items.reduce((sum, item) => sum + item.orderedQuantity, 0)
  const totalReceived = items.reduce((sum, item) => sum + (item.receivedQuantity || 0), 0)
  
  if (totalOrdered === 0) return 0
  
  return Math.round((totalReceived / totalOrdered) * 100)
}

/**
 * Calculate quality pass rate
 */
export function calculateQualityPassRate(items: ReceiptItem[]): number {
  if (items.length === 0) return 0
  
  const acceptedCount = items.filter(item => item.isAccepted).length
  
  return Math.round((acceptedCount / items.length) * 100)
}

/**
 * Calculate total received value
 */
export function calculateReceivedValue(items: ReceiptItem[]): number {
  return items.reduce((sum, item) => {
    const receivedQty = item.receivedQuantity || 0
    return sum + (receivedQty * item.pricePerUnit)
  }, 0)
}

/**
 * Calculate total rejected value
 */
export function calculateRejectedValue(items: ReceiptItem[]): number {
  return items
    .filter(item => !item.isAccepted)
    .reduce((sum, item) => {
      const rejectedQty = item.returnedQuantity || 0
      return sum + (rejectedQty * item.pricePerUnit)
    }, 0)
}

/**
 * Check if receipt is complete
 */
export function isReceiptComplete(items: ReceiptItem[]): boolean {
  return items.every(item => {
    const orderedQty = item.orderedQuantity
    const receivedQty = item.receivedQuantity || 0
    return receivedQty >= orderedQty
  })
}

/**
 * Check if receipt is partial
 */
export function isReceiptPartial(items: ReceiptItem[]): boolean {
  return items.some(item => {
    const orderedQty = item.orderedQuantity
    const receivedQty = item.receivedQuantity || 0
    return receivedQty > 0 && receivedQty < orderedQty
  })
}

// ================================ VALIDATION HELPERS ================================

/**
 * Validate receipt dates
 */
export function validateReceiptDates(
  procurementDate: Date,
  expectedDelivery: Date | null,
  actualDelivery: Date | null
): { isValid: boolean; error?: string } {
  if (actualDelivery) {
    if (actualDelivery < procurementDate) {
      return {
        isValid: false,
        error: 'Tanggal penerimaan tidak boleh sebelum tanggal procurement'
      }
    }
  }
  
  if (expectedDelivery && actualDelivery) {
    const daysDiff = Math.floor((actualDelivery.getTime() - expectedDelivery.getTime()) / (1000 * 60 * 60 * 24))
    if (daysDiff > 30) {
      return {
        isValid: false,
        error: 'Tanggal penerimaan terlalu jauh dari estimasi (>30 hari)'
      }
    }
  }
  
  return { isValid: true }
}

/**
 * Validate expiry date
 */
export function validateExpiryDate(
  expiryDate: Date | null,
  productionDate: Date | null
): { isValid: boolean; error?: string } {
  if (!expiryDate) return { isValid: true }
  
  const now = new Date()
  if (expiryDate <= now) {
    return {
      isValid: false,
      error: 'Produk sudah kadaluarsa'
    }
  }
  
  if (productionDate && expiryDate <= productionDate) {
    return {
      isValid: false,
      error: 'Tanggal kadaluarsa harus setelah tanggal produksi'
    }
  }
  
  return { isValid: true }
}

/**
 * Validate received quantity
 */
export function validateReceivedQuantity(
  orderedQuantity: number,
  receivedQuantity: number,
  allowOverReceive: boolean = false
): { isValid: boolean; error?: string } {
  if (receivedQuantity < 0) {
    return {
      isValid: false,
      error: 'Jumlah diterima tidak boleh negatif'
    }
  }
  
  if (!allowOverReceive && receivedQuantity > orderedQuantity) {
    return {
      isValid: false,
      error: 'Jumlah diterima melebihi jumlah pesanan'
    }
  }
  
  return { isValid: true }
}

// ================================ FORMATTING HELPERS ================================

/**
 * Format receipt code
 */
export function formatReceiptCode(procurementCode: string, receiptNumber?: string | null): string {
  if (receiptNumber) {
    return `${procurementCode}-${receiptNumber}`
  }
  return procurementCode
}

/**
 * Format delivery date
 */
export function formatDeliveryDate(actualDelivery: Date | null, expectedDelivery: Date | null): string {
  // Check if actualDelivery is valid
  if (!actualDelivery || !(actualDelivery instanceof Date) || isNaN(actualDelivery.getTime())) {
    if (expectedDelivery && expectedDelivery instanceof Date && !isNaN(expectedDelivery.getTime())) {
      const formatter = new Intl.DateTimeFormat('id-ID', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      })
      return `Diharapkan: ${formatter.format(expectedDelivery)}`
    }
    return 'Belum diterima'
  }
  
  const formatter = new Intl.DateTimeFormat('id-ID', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })
  return formatter.format(actualDelivery)
}

/**
 * Format quantity with unit
 */
export function formatQuantity(quantity: number, unit: string): string {
  return `${quantity.toLocaleString('id-ID')} ${unit}`
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// ================================ QUALITY HELPERS ================================

/**
 * Determine overall quality grade from items
 */
export function determineOverallGrade(items: ReceiptItem[]): QualityGrade {
  const grades = items
    .map(item => item.gradeReceived)
    .filter(Boolean) as string[]
  
  if (grades.length === 0) return QualityGrade.GOOD
  
  // Count grade occurrences
  const gradeCounts: Record<string, number> = {}
  grades.forEach(grade => {
    gradeCounts[grade] = (gradeCounts[grade] || 0) + 1
  })
  
  // Find most common grade
  let maxCount = 0
  let mostCommonGrade: QualityGrade = QualityGrade.GOOD // Fixed: Explicit type annotation
  
  for (const [grade, count] of Object.entries(gradeCounts)) {
    if (count > maxCount) {
      maxCount = count
      mostCommonGrade = grade as QualityGrade
    }
  }
  
  return mostCommonGrade
}

/**
 * Check if quality inspection is required
 */
export function isQualityInspectionRequired(totalAmount: number): boolean {
  // Inspection required for orders above 10 million IDR
  return totalAmount >= 10000000
}

/**
 * Get quality inspection deadline
 */
export function getQualityInspectionDeadline(actualDelivery: Date): Date {
  // Inspection must be done within 24 hours
  const deadline = new Date(actualDelivery)
  deadline.setHours(deadline.getHours() + 24)
  return deadline
}
