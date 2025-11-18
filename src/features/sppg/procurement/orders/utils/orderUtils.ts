/**
 * @fileoverview Procurement Orders Utility Functions - Enterprise-grade
 * @version Next.js 15.5.4 / TypeScript 5.7.2
 * @author Bagizi-ID Development Team
 * 
 * Comprehensive utilities for order management including:
 * - Formatters (currency, dates, status)
 * - Validators (business rules, constraints)
 * - Calculators (totals, discounts, taxes)
 * - Status helpers (colors, labels, icons)
 * - Date utilities (delivery estimation, urgency)
 */

import type { 
  Order, 
  OrderItem, 
  OrderFormInput,
  OrderItemFormInput,
  OrderFilters,
  OrderPriority,
  DeliveryUrgency
} from '../types'
import type { ProcurementStatus } from '@prisma/client'

// ================================ FORMATTERS ================================

/**
 * Format currency to Indonesian Rupiah
 * @param amount - Amount to format
 * @returns Formatted currency string (e.g., "Rp 1.500.000")
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
 * @param value - Number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Format date to Indonesian locale
 * @param date - Date to format
 * @param format - Format type ('short' | 'long' | 'full')
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | null | undefined, 
  format: 'short' | 'long' | 'full' = 'short'
): string {
  if (!date) return '-'
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObj.getTime())) return '-'
  
  const options: Record<string, Intl.DateTimeFormatOptions> = {
    short: { day: '2-digit', month: '2-digit', year: 'numeric' },
    long: { day: 'numeric', month: 'long', year: 'numeric' },
    full: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
  }
  
  return new Intl.DateTimeFormat('id-ID', options[format]).format(dateObj)
}

/**
 * Format date with time
 * @param date - Date to format
 * @returns Formatted datetime string
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '-'
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObj.getTime())) return '-'
  
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj)
}

/**
 * Format date for input fields (YYYY-MM-DD)
 * @param date - Date to format
 * @returns ISO date string (YYYY-MM-DD)
 */
export function formatDateForInput(date: Date | string | null | undefined): string {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObj.getTime())) return ''
  
  return dateObj.toISOString().split('T')[0]
}

/**
 * Format relative time (e.g., "2 hari lagi", "3 jam yang lalu")
 * @param date - Date to format
 * @returns Relative time string
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = dateObj.getTime() - now.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  
  if (Math.abs(diffDays) === 0) {
    if (Math.abs(diffHours) === 0) return 'Hari ini'
    if (diffHours > 0) return `${diffHours} jam lagi`
    return `${Math.abs(diffHours)} jam yang lalu`
  }
  
  if (diffDays > 0) {
    if (diffDays === 1) return 'Besok'
    return `${diffDays} hari lagi`
  } else {
    if (diffDays === -1) return 'Kemarin'
    return `${Math.abs(diffDays)} hari yang lalu`
  }
}

/**
 * Format procurement code (e.g., "PRC-001-2024")
 * @param code - Procurement code
 * @returns Formatted code
 */
export function formatProcurementCode(code: string): string {
  return code.toUpperCase()
}

// ================================ STATUS HELPERS ================================

/**
 * Get status color variant
 * @param status - Procurement status
 * @returns Tailwind color class
 */
export function getStatusColor(status: ProcurementStatus): string {
  const colors: Record<ProcurementStatus, string> = {
    DRAFT: 'bg-gray-100 text-gray-800',
    PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-blue-100 text-blue-800',
    ORDERED: 'bg-indigo-100 text-indigo-800',
    PARTIALLY_RECEIVED: 'bg-orange-100 text-orange-800',
    FULLY_RECEIVED: 'bg-teal-100 text-teal-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    REJECTED: 'bg-red-100 text-red-800',
  }
  
  return colors[status] || 'bg-gray-100 text-gray-800'
}

/**
 * Get status label in Indonesian
 * @param status - Procurement status
 * @returns Indonesian status label
 */
export function getStatusLabel(status: ProcurementStatus): string {
  const labels: Record<ProcurementStatus, string> = {
    DRAFT: 'Draft',
    PENDING_APPROVAL: 'Menunggu Persetujuan',
    APPROVED: 'Disetujui',
    ORDERED: 'Dipesan',
    PARTIALLY_RECEIVED: 'Diterima Sebagian',
    FULLY_RECEIVED: 'Diterima Penuh',
    COMPLETED: 'Selesai',
    CANCELLED: 'Dibatalkan',
    REJECTED: 'Ditolak',
  }
  
  return labels[status] || status
}

/**
 * Get payment status color
 * @param status - Payment status
 * @returns Tailwind color class
 */
export function getPaymentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    UNPAID: 'bg-red-100 text-red-800',
    PARTIAL: 'bg-yellow-100 text-yellow-800',
    PAID: 'bg-green-100 text-green-800',
    OVERDUE: 'bg-purple-100 text-purple-800',
  }
  
  return colors[status] || 'bg-gray-100 text-gray-800'
}

/**
 * Get payment status label
 * @param status - Payment status
 * @returns Indonesian payment status label
 */
export function getPaymentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    UNPAID: 'Belum Dibayar',
    PARTIAL: 'Dibayar Sebagian',
    PAID: 'Lunas',
    OVERDUE: 'Jatuh Tempo',
  }
  
  return labels[status] || status
}

/**
 * Get delivery status color
 * @param status - Delivery status
 * @returns Tailwind color class
 */
export function getDeliveryStatusColor(status: string): string {
  const colors: Record<string, string> = {
    ORDERED: 'bg-blue-100 text-blue-800',
    SHIPPED: 'bg-indigo-100 text-indigo-800',
    IN_TRANSIT: 'bg-purple-100 text-purple-800',
    DELIVERED: 'bg-green-100 text-green-800',
    PARTIAL: 'bg-orange-100 text-orange-800',
    CANCELLED: 'bg-red-100 text-red-800',
  }
  
  return colors[status] || 'bg-gray-100 text-gray-800'
}

/**
 * Get delivery status label
 * @param status - Delivery status
 * @returns Indonesian delivery status label
 */
export function getDeliveryStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    ORDERED: 'Dipesan',
    SHIPPED: 'Dikirim',
    IN_TRANSIT: 'Dalam Perjalanan',
    DELIVERED: 'Terkirim',
    PARTIAL: 'Terkirim Sebagian',
    CANCELLED: 'Dibatalkan',
  }
  
  return labels[status] || status
}

/**
 * Get priority color
 * @param priority - Order priority
 * @returns Tailwind color class
 */
export function getPriorityColor(priority: OrderPriority): string {
  const colors: Record<OrderPriority, string> = {
    LOW: 'bg-gray-100 text-gray-800',
    MEDIUM: 'bg-blue-100 text-blue-800',
    HIGH: 'bg-orange-100 text-orange-800',
    URGENT: 'bg-red-100 text-red-800',
  }
  
  return colors[priority] || 'bg-gray-100 text-gray-800'
}

/**
 * Get priority label
 * @param priority - Order priority
 * @returns Indonesian priority label
 */
export function getPriorityLabel(priority: OrderPriority): string {
  const labels: Record<OrderPriority, string> = {
    LOW: 'Rendah',
    MEDIUM: 'Sedang',
    HIGH: 'Tinggi',
    URGENT: 'Mendesak',
  }
  
  return labels[priority] || priority
}

// ================================ CALCULATORS ================================

/**
 * Calculate item total (quantity * price)
 * @param item - Order item
 * @returns Item total before discount
 */
export function calculateItemTotal(item: OrderItemFormInput | OrderItem): number {
  const quantity = 'orderedQuantity' in item ? item.orderedQuantity : 0
  return quantity * item.pricePerUnit
}

/**
 * Calculate item discount amount
 * @param item - Order item
 * @returns Discount amount
 */
export function calculateItemDiscount(item: OrderItemFormInput | OrderItem): number {
  const total = calculateItemTotal(item)
  const discountPercent = item.discountPercent || 0
  return (total * discountPercent) / 100
}

/**
 * Calculate item final price (after discount)
 * @param item - Order item
 * @returns Final price after discount
 */
export function calculateItemFinalPrice(item: OrderItemFormInput | OrderItem): number {
  const total = calculateItemTotal(item)
  const discount = calculateItemDiscount(item)
  return total - discount
}

/**
 * Calculate order subtotal (sum of all items before discounts)
 * @param items - Order items
 * @returns Subtotal amount
 */
export function calculateSubtotal(items: (OrderItemFormInput | OrderItem)[]): number {
  return items.reduce((sum, item) => sum + calculateItemTotal(item), 0)
}

/**
 * Calculate total discount amount
 * @param items - Order items
 * @returns Total discount amount
 */
export function calculateTotalDiscount(items: (OrderItemFormInput | OrderItem)[]): number {
  return items.reduce((sum, item) => sum + calculateItemDiscount(item), 0)
}

/**
 * Calculate order total after item discounts
 * @param items - Order items
 * @returns Total after item discounts
 */
export function calculateItemsTotal(items: (OrderItemFormInput | OrderItem)[]): number {
  return items.reduce((sum, item) => sum + calculateItemFinalPrice(item), 0)
}

/**
 * Calculate tax amount
 * @param subtotal - Subtotal amount
 * @param taxRate - Tax rate percentage (default: 11% PPN)
 * @returns Tax amount
 */
export function calculateTax(subtotal: number, taxRate: number = 11): number {
  return (subtotal * taxRate) / 100
}

/**
 * Calculate grand total (subtotal + tax + shipping - discount)
 * @param subtotal - Subtotal amount
 * @param taxAmount - Tax amount
 * @param shippingCost - Shipping cost
 * @param discountAmount - Order-level discount
 * @returns Grand total
 */
export function calculateGrandTotal(
  subtotal: number,
  taxAmount: number = 0,
  shippingCost: number = 0,
  discountAmount: number = 0
): number {
  return subtotal + taxAmount + shippingCost - discountAmount
}

/**
 * Calculate order summary
 * @param input - Order form input
 * @returns Complete order calculation
 */
export function calculateOrderSummary(input: OrderFormInput) {
  const subtotal = calculateSubtotal(input.items)
  const itemDiscounts = calculateTotalDiscount(input.items)
  const itemsTotal = calculateItemsTotal(input.items)
  const tax = calculateTax(itemsTotal)
  const shipping = input.transportCost || 0
  const total = calculateGrandTotal(itemsTotal, tax, shipping, 0)
  
  return {
    subtotal,
    itemDiscounts,
    itemsTotal,
    tax,
    shipping,
    total,
    itemCount: input.items.length,
    totalQuantity: input.items.reduce((sum, item) => sum + item.orderedQuantity, 0)
  }
}

// ================================ VALIDATORS ================================

/**
 * Validate order can be edited
 * @param status - Order status
 * @returns True if order can be edited
 */
export function canEditOrder(status: ProcurementStatus): boolean {
  return status === 'DRAFT' || status === 'PENDING_APPROVAL'
}

/**
 * Validate order can be cancelled
 * @param status - Order status
 * @returns True if order can be cancelled
 */
export function canCancelOrder(status: ProcurementStatus): boolean {
  return status !== 'COMPLETED' && status !== 'CANCELLED'
}

/**
 * Validate order can be approved
 * @param status - Order status
 * @returns True if order can be approved
 */
export function canApproveOrder(status: ProcurementStatus): boolean {
  return status === 'PENDING_APPROVAL'
}

/**
 * Validate order can be sent to supplier
 * @param status - Order status
 * @returns True if order can be sent
 */
export function canSendOrder(status: ProcurementStatus): boolean {
  return status === 'APPROVED'
}

/**
 * Check if order is overdue for delivery
 * @param order - Order to check
 * @returns True if delivery is overdue
 */
export function isDeliveryOverdue(order: Order): boolean {
  if (!order.expectedDelivery || order.actualDelivery) return false
  
  const expected = new Date(order.expectedDelivery)
  const now = new Date()
  
  return now > expected && order.status !== 'COMPLETED'
}

/**
 * Check if payment is overdue
 * @param order - Order to check
 * @returns True if payment is overdue
 */
export function isPaymentOverdue(order: Order): boolean {
  if (!order.paymentDue || order.paymentStatus === 'PAID') return false
  
  const due = new Date(order.paymentDue)
  const now = new Date()
  
  return now > due && order.paymentStatus !== 'PAID'
}

/**
 * Calculate days until delivery
 * @param expectedDelivery - Expected delivery date
 * @returns Number of days (negative if overdue)
 */
export function getDaysUntilDelivery(expectedDelivery: Date | string | null): number | null {
  if (!expectedDelivery) return null
  
  const deliveryDate = typeof expectedDelivery === 'string' 
    ? new Date(expectedDelivery) 
    : expectedDelivery
  const now = new Date()
  
  const diffMs = deliveryDate.getTime() - now.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

/**
 * Get delivery urgency based on expected date
 * @param expectedDelivery - Expected delivery date
 * @returns Delivery urgency level
 */
export function getDeliveryUrgency(expectedDelivery: Date | string | null): DeliveryUrgency {
  const daysUntil = getDaysUntilDelivery(expectedDelivery)
  
  if (daysUntil === null) return 'STANDARD'
  if (daysUntil <= 2) return 'IMMEDIATE'
  if (daysUntil <= 5) return 'EXPRESS'
  
  return 'STANDARD'
}

// ================================ FILTERS & SEARCH ================================

/**
 * Filter orders by search query
 * @param orders - Orders to filter
 * @param query - Search query
 * @returns Filtered orders
 */
export function filterOrdersBySearch(orders: Order[], query: string): Order[] {
  if (!query) return orders
  
  const lowerQuery = query.toLowerCase()
  
  return orders.filter(order => 
    order.procurementCode.toLowerCase().includes(lowerQuery) ||
    order.supplierName?.toLowerCase().includes(lowerQuery) ||
    order.invoiceNumber?.toLowerCase().includes(lowerQuery) ||
    order.receiptNumber?.toLowerCase().includes(lowerQuery)
  )
}

/**
 * Apply filters to orders list
 * @param orders - Orders to filter
 * @param filters - Filter criteria
 * @returns Filtered orders
 */
export function applyOrderFilters(orders: Order[], filters: OrderFilters): Order[] {
  let filtered = orders
  
  // Search
  if (filters.search) {
    filtered = filterOrdersBySearch(filtered, filters.search)
  }
  
  // Status
  if (filters.status && filters.status.length > 0) {
    filtered = filtered.filter(order => 
      filters.status!.includes(order.status)
    )
  }
  
  // Delivery Status
  if (filters.deliveryStatus && filters.deliveryStatus.length > 0) {
    filtered = filtered.filter(order => 
      filters.deliveryStatus!.includes(order.deliveryStatus)
    )
  }
  
  // Payment Status
  if (filters.paymentStatus && filters.paymentStatus.length > 0) {
    filtered = filtered.filter(order => 
      filters.paymentStatus!.includes(order.paymentStatus)
    )
  }
  
  // Supplier
  if (filters.supplierId) {
    filtered = filtered.filter(order => order.supplierId === filters.supplierId)
  }
  
  // Plan
  if (filters.planId) {
    filtered = filtered.filter(order => order.planId === filters.planId)
  }
  
  // Purchase Method
  if (filters.purchaseMethod && filters.purchaseMethod.length > 0) {
    filtered = filtered.filter(order => 
      filters.purchaseMethod!.includes(order.purchaseMethod)
    )
  }
  
  // Date Range
  if (filters.dateFrom) {
    const fromDate = new Date(filters.dateFrom)
    filtered = filtered.filter(order => 
      new Date(order.procurementDate) >= fromDate
    )
  }
  
  if (filters.dateTo) {
    const toDate = new Date(filters.dateTo)
    filtered = filtered.filter(order => 
      new Date(order.procurementDate) <= toDate
    )
  }
  
  // Amount Range
  if (filters.minAmount !== undefined) {
    filtered = filtered.filter(order => order.totalAmount >= filters.minAmount!)
  }
  
  if (filters.maxAmount !== undefined) {
    filtered = filtered.filter(order => order.totalAmount <= filters.maxAmount!)
  }
  
  return filtered
}

// ================================ SORTING ================================

/**
 * Sort orders by field
 * @param orders - Orders to sort
 * @param field - Field to sort by
 * @param direction - Sort direction
 * @returns Sorted orders
 */
export function sortOrders(
  orders: Order[], 
  field: string, 
  direction: 'asc' | 'desc'
): Order[] {
  const sorted = [...orders]
  
  sorted.sort((a, b) => {
    let aVal: unknown = a[field as keyof Order]
    let bVal: unknown = b[field as keyof Order]
    
    // Handle dates
    if (aVal instanceof Date || bVal instanceof Date) {
      aVal = aVal ? new Date(aVal as Date).getTime() : 0
      bVal = bVal ? new Date(bVal as Date).getTime() : 0
    }
    
    // Handle nulls
    if (aVal === null || aVal === undefined) return 1
    if (bVal === null || bVal === undefined) return -1
    
    // Compare
    if (aVal < bVal) return direction === 'asc' ? -1 : 1
    if (aVal > bVal) return direction === 'asc' ? 1 : -1
    return 0
  })
  
  return sorted
}

// ================================ EXPORT UTILITIES ================================

/**
 * Prepare order data for CSV export
 * @param order - Order to export
 * @returns Flattened order data
 */
export function prepareOrderForExport(order: Order & { items: OrderItem[] }) {
  return {
    'Kode Procurement': order.procurementCode,
    'Tanggal Order': formatDate(order.procurementDate),
    'Supplier': order.supplierName || '-',
    'Status': getStatusLabel(order.status),
    'Status Pembayaran': getPaymentStatusLabel(order.paymentStatus),
    'Status Pengiriman': getDeliveryStatusLabel(order.deliveryStatus),
    'Metode Pembelian': order.purchaseMethod,
    'Subtotal': formatCurrency(order.subtotalAmount),
    'Pajak': formatCurrency(order.taxAmount),
    'Diskon': formatCurrency(order.discountAmount),
    'Biaya Kirim': formatCurrency(order.shippingCost),
    'Total': formatCurrency(order.totalAmount),
    'Dibayar': formatCurrency(order.paidAmount),
    'Tanggal Pengiriman Diharapkan': formatDate(order.expectedDelivery),
    'Tanggal Pengiriman Aktual': formatDate(order.actualDelivery),
    'Jumlah Item': order.items.length,
  }
}
