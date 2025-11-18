/**
 * @fileoverview Procurement Item Card Component
 * Display single item with status indicators and actions
 * 
 * @version React 18 / shadcn/ui
 * @author Bagizi-ID Development Team
 */

'use client'

import { type FC } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  AlertTriangle,
  Package,
  Edit,
  Trash2,
  Scale,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ProcurementItemResponse } from '../types/item.types'

interface ItemCardProps {
  item: ProcurementItemResponse
  onEdit?: (item: ProcurementItemResponse) => void
  onDelete?: (itemId: string) => void
  variant?: 'default' | 'compact'
  showActions?: boolean
}

export const ItemCard: FC<ItemCardProps> = ({
  item,
  onEdit,
  onDelete,
  variant = 'default',
  showActions = true,
}) => {
  // Calculate received percentage
  const receivedPercent = item.receivedQuantity
    ? (item.receivedQuantity / item.orderedQuantity) * 100
    : 0

  // Determine status color
  const getStatusColor = () => {
    if (!item.receivedQuantity) return 'text-muted-foreground'
    if (!item.isAccepted) return 'text-destructive'
    if (item.returnedQuantity > 0) return 'text-warning'
    return 'text-success'
  }

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <Card
      className={cn(
        'hover:shadow-md transition-shadow',
        variant === 'compact' && 'shadow-sm'
      )}
    >
      <CardHeader
        className={cn(
          'pb-3',
          variant === 'compact' && 'p-4 pb-2'
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-4 w-4 text-muted-foreground shrink-0" />
              <h3 className="font-semibold text-base truncate">
                {item.itemName}
              </h3>
            </div>
            
            {item.itemCode && (
              <p className="text-sm text-muted-foreground">
                Code: {item.itemCode}
              </p>
            )}
          </div>

          {/* Status Badge */}
          <Badge
            variant={
              !item.receivedQuantity
                ? 'secondary'
                : item.isAccepted
                ? 'default'
                : 'destructive'
            }
            className="shrink-0"
          >
            {!item.receivedQuantity
              ? 'Pending'
              : item.isAccepted
              ? 'Accepted'
              : 'Rejected'}
          </Badge>
        </div>
      </CardHeader>

      <Separator />

      <CardContent
        className={cn(
          'space-y-3 pt-3',
          variant === 'compact' && 'p-4 pt-3 space-y-2'
        )}
      >
        {/* Category and Brand */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Category</span>
            <p className="font-medium">{item.category}</p>
          </div>
          {item.brand && (
            <div>
              <span className="text-muted-foreground">Brand</span>
              <p className="font-medium">{item.brand}</p>
            </div>
          )}
        </div>

        <Separator />

        {/* Quantities */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Ordered</span>
            <span className="font-semibold">
              {item.orderedQuantity} {item.unit}
            </span>
          </div>

          {item.receivedQuantity !== null && item.receivedQuantity !== undefined && (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Received</span>
                <span className={cn('font-semibold', getStatusColor())}>
                  {item.receivedQuantity} {item.unit}
                  <span className="text-xs ml-1">
                    ({receivedPercent.toFixed(0)}%)
                  </span>
                </span>
              </div>

              {item.returnedQuantity > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Returned</span>
                  <span className="font-semibold text-warning">
                    {item.returnedQuantity} {item.unit}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        <Separator />

        {/* Pricing */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Price/Unit</span>
            <span className="font-medium">
              {formatCurrency(item.pricePerUnit)}
            </span>
          </div>

          {item.discountPercent > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Discount</span>
              <span className="font-medium text-success">
                -{item.discountPercent}%
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total</span>
            <span className="font-bold text-lg">
              {formatCurrency(item.finalPrice)}
            </span>
          </div>
        </div>

        {/* Quality Information */}
        {(item.qualityStandard || item.qualityReceived) && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Scale className="h-4 w-4" />
                <span>Quality</span>
              </div>

              {item.qualityStandard && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Required</span>
                  <span className="font-medium">{item.qualityStandard}</span>
                </div>
              )}

              {item.qualityReceived && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Received</span>
                  <span className={cn('font-medium', getStatusColor())}>
                    {item.qualityReceived}
                  </span>
                </div>
              )}

              {!item.isAccepted && item.rejectionReason && (
                <div className="mt-2 p-2 bg-destructive/10 rounded-md">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    <div className="flex-1 text-sm">
                      <p className="font-medium text-destructive">Rejected</p>
                      <p className="text-muted-foreground mt-1">
                        {item.rejectionReason}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Product Details */}
        {(item.batchNumber || item.expiryDate) && (
          <>
            <Separator />
            <div className="grid grid-cols-2 gap-3 text-sm">
              {item.batchNumber && (
                <div>
                  <span className="text-muted-foreground">Batch</span>
                  <p className="font-medium">{item.batchNumber}</p>
                </div>
              )}
              {item.expiryDate && (
                <div>
                  <span className="text-muted-foreground">Expiry</span>
                  <p className="font-medium">
                    {new Date(item.expiryDate).toLocaleDateString('id-ID')}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>

      {showActions && (onEdit || onDelete) && (
        <>
          <Separator />
          <CardFooter
            className={cn(
              'pt-3 gap-2',
              variant === 'compact' && 'p-4 pt-3'
            )}
          >
            {onEdit && (
              <Button
                onClick={() => onEdit(item)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                onClick={() => onDelete(item.id)}
                variant="outline"
                size="sm"
                className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </CardFooter>
        </>
      )}
    </Card>
  )
}
