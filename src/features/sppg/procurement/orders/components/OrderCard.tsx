/**
 * @fileoverview Order Card Component - Summary card display for order list
 * @version Next.js 15.5.4 / React 19 / TypeScript 5.7.2
 * @author Bagizi-ID Development Team
 * @see {@link /docs/PROCUREMENT_WORKFLOW_GUIDE.md} Procurement Documentation
 * 
 * COMPONENT FEATURES:
 * - Order summary display with key metrics
 * - Status badge with color coding
 * - Supplier information
 * - Dates display (procurement & delivery)
 * - Action buttons (view, edit, delete)
 * - Click handler for navigation
 * - Hover effects and responsive layout
 * - Permission-based button visibility
 * 
 * USAGE:
 * ```tsx
 * <OrderCard
 *   order={orderData}
 *   onClick={() => router.push(`/procurement/orders/${orderData.id}`)}
 *   onEdit={() => router.push(`/procurement/orders/${orderData.id}/edit`)}
 *   onDelete={() => handleDelete(orderData.id)}
 *   canEdit={hasPermission('EDIT_ORDER')}
 *   canDelete={hasPermission('DELETE_ORDER')}
 * />
 * ```
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  Building2, 
  Package, 
  Truck,
  Eye,
  Edit,
  Trash2,
  DollarSign
} from 'lucide-react'
import type { Order } from '../types'
import { 
  formatCurrency, 
  formatDate, 
  getStatusColor, 
  getStatusLabel 
} from '../utils'
import { PendingDurationBadge } from './PendingDurationBadge'
import { AutoApproveBadge } from './AutoApproveBadge'

// ================================ TYPES ================================

interface OrderCardProps {
  order: Order
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
  canEdit?: boolean
  canDelete?: boolean
  showActions?: boolean
}

// ================================ COMPONENT ================================

/**
 * OrderCard - Summary card component for order display
 * 
 * Features:
 * - Compact order information display
 * - Status badge with color coding
 * - Key metrics (items count, total amount)
 * - Supplier name
 * - Important dates
 * - Action buttons (view, edit, delete)
 * - Click handler for navigation
 * - Responsive card layout
 * - Hover effects
 */
export function OrderCard({
  order,
  onClick,
  onEdit,
  onDelete,
  canEdit = false,
  canDelete = false,
  showActions = true,
}: OrderCardProps) {
  // Status styling
  const statusColor = getStatusColor(order.status)
  const statusLabel = getStatusLabel(order.status)

  // Calculate days until delivery
  const daysUntilDelivery = order.expectedDelivery
    ? Math.ceil((new Date(order.expectedDelivery).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <Card 
      className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                {order.procurementCode}
              </CardTitle>
              {/* Pending Duration Badge */}
              <PendingDurationBadge
                startDate={order.createdAt}
                status={order.status}
                warningThreshold={3}
                showIcon={false}
              />
              {/* Auto-Approve Badge */}
              {order.status === 'APPROVED' && order.totalAmount < 5000000 && (
                <AutoApproveBadge
                  isAutoApproved={true}
                  totalAmount={order.totalAmount}
                  threshold={5000000}
                  showTooltip={false}
                />
              )}
            </div>
            <CardDescription className="flex items-center gap-2 text-sm">
              <Building2 className="h-3.5 w-3.5" />
              {order.supplierName || 'Supplier tidak diketahui'}
            </CardDescription>
          </div>
          <Badge 
            className={statusColor}
            variant="outline"
          >
            {statusLabel}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Total Amount */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              <span>Total</span>
            </div>
            <p className="text-sm font-bold text-primary">
              {formatCurrency(order.totalAmount)}
            </p>
          </div>

          {/* Payment Status */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Package className="h-3 w-3" />
              <span>Pembayaran</span>
            </div>
            <p className="text-sm font-semibold">
              {order.paymentStatus === 'PAID' ? '✓ Lunas' : 
               order.paymentStatus === 'PARTIAL' ? '⚠ Sebagian' : 
               '✗ Belum Bayar'}
            </p>
          </div>
        </div>

        {/* Dates Information */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Tanggal Order
            </span>
            <span className="font-medium">{formatDate(order.procurementDate)}</span>
          </div>

          {order.expectedDelivery && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Truck className="h-3 w-3" />
                Pengiriman
              </span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{formatDate(order.expectedDelivery)}</span>
                {daysUntilDelivery !== null && daysUntilDelivery > 0 && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    {daysUntilDelivery}d
                  </Badge>
                )}
                {daysUntilDelivery !== null && daysUntilDelivery < 0 && (
                  <Badge variant="destructive" className="text-xs px-1.5 py-0">
                    Terlambat
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation()
                onClick?.()
              }}
            >
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              Lihat
            </Button>

            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit?.()
                }}
              >
                <Edit className="h-3.5 w-3.5 mr-1.5" />
                Edit
              </Button>
            )}

            {canDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete?.()
                }}
                className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
