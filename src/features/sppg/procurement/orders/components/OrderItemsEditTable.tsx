/**
 * @fileoverview OrderItemsEditTable Component - Inline Quantity Editing
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 * 
 * FEATURES:
 * - Inline quantity editing with +/- buttons
 * - Real-time totals calculation
 * - Unsaved changes indicator
 * - Batch save to API
 * - Validation and error handling
 */

'use client'

import { useState, useEffect } from 'react'
import { Minus, Plus, Save, X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency } from '../utils'
import type { OrderWithDetails } from '../types'
import type { InventoryCategory } from '@prisma/client'
import { useUpdateOrder } from '../hooks'
import { toast } from 'sonner'

interface OrderItemsEditTableProps {
  order: OrderWithDetails
  canEdit?: boolean
  onSuccess?: () => void
}

interface EditableItem {
  id: string
  inventoryItemId?: string | null
  itemName: string
  itemCode?: string | null
  category: string
  brand?: string | null
  orderedQuantity: number
  unit: string
  pricePerUnit: number
  discountPercent: number
  qualityStandard?: string | null
  gradeRequested?: string | null
  expiryDate?: Date | null
  storageRequirement?: string | null
  notes?: string | null
}

export function OrderItemsEditTable({ order, canEdit = false, onSuccess }: OrderItemsEditTableProps) {
  const [editedItems, setEditedItems] = useState<EditableItem[]>([])
  const [hasChanges, setHasChanges] = useState(false)
  
  const { mutate: updateOrder, isPending } = useUpdateOrder()

  // Initialize edited items from order
  useEffect(() => {
    const items = order.items.map(item => ({
      id: item.id,
      inventoryItemId: item.inventoryItemId,
      itemName: item.itemName,
      itemCode: item.itemCode,
      category: item.category,
      brand: item.brand,
      orderedQuantity: item.orderedQuantity,
      unit: item.unit,
      pricePerUnit: item.pricePerUnit,
      discountPercent: item.discountPercent || 0,
      qualityStandard: item.qualityStandard,
      gradeRequested: item.gradeRequested,
      expiryDate: item.expiryDate,
      storageRequirement: item.storageRequirement,
      notes: item.notes,
    }))
    setEditedItems(items)
  }, [order.items])

  // Calculate if there are changes
  useEffect(() => {
    const changed = editedItems.some((editedItem, index) => {
      const originalItem = order.items[index]
      return originalItem && editedItem.orderedQuantity !== originalItem.orderedQuantity
    })
    setHasChanges(changed)
  }, [editedItems, order.items])

  // Update quantity
  const handleQuantityChange = (index: number, newQuantity: number) => {
    if (newQuantity <= 0 || newQuantity > 999999) return
    
    const updated = [...editedItems]
    updated[index] = {
      ...updated[index],
      orderedQuantity: newQuantity
    }
    setEditedItems(updated)
  }

  // Increment quantity
  const handleIncrement = (index: number) => {
    const current = editedItems[index].orderedQuantity
    handleQuantityChange(index, current + 1)
  }

  // Decrement quantity
  const handleDecrement = (index: number) => {
    const current = editedItems[index].orderedQuantity
    if (current > 1) {
      handleQuantityChange(index, current - 1)
    }
  }

  // Calculate item total
  const calculateItemTotal = (item: EditableItem) => {
    const subtotal = item.orderedQuantity * item.pricePerUnit
    const discount = (subtotal * item.discountPercent) / 100
    return subtotal - discount
  }

  // Calculate order totals
  const calculateTotals = () => {
    const subtotal = editedItems.reduce((sum, item) => {
      return sum + calculateItemTotal(item)
    }, 0)
    
    const totalDiscount = editedItems.reduce((sum, item) => {
      const itemSubtotal = item.orderedQuantity * item.pricePerUnit
      return sum + (itemSubtotal * item.discountPercent) / 100
    }, 0)
    
    const tax = (subtotal * 11) / 100 // 11% PPN
    const grandTotal = subtotal + tax + (order.shippingCost || 0)
    
    return { subtotal, totalDiscount, tax, grandTotal }
  }

  const totals = calculateTotals()

  // Save changes
  const handleSave = () => {
    // Transform to API format
    const items = editedItems.map(item => ({
      inventoryItemId: item.inventoryItemId || '',
      itemName: item.itemName,
      itemCode: item.itemCode || '',
      category: item.category as InventoryCategory,
      brand: item.brand || '',
      orderedQuantity: item.orderedQuantity,
      unit: item.unit,
      pricePerUnit: item.pricePerUnit,
      discountPercent: item.discountPercent,
      qualityStandard: item.qualityStandard || '',
      gradeRequested: item.gradeRequested || '',
      expiryDate: item.expiryDate ? item.expiryDate.toISOString().split('T')[0] : '',
      storageRequirement: item.storageRequirement || '',
      notes: item.notes || '',
    }))

    updateOrder({
      id: order.id,
      data: {
        items,
      }
    }, {
      onSuccess: () => {
        toast.success('Quantities updated successfully')
        setHasChanges(false)
        onSuccess?.()
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update quantities')
      }
    })
  }

  // Cancel changes
  const handleCancel = () => {
    const items = order.items.map(item => ({
      id: item.id,
      inventoryItemId: item.inventoryItemId,
      itemName: item.itemName,
      itemCode: item.itemCode,
      category: item.category,
      brand: item.brand,
      orderedQuantity: item.orderedQuantity,
      unit: item.unit,
      pricePerUnit: item.pricePerUnit,
      discountPercent: item.discountPercent || 0,
      qualityStandard: item.qualityStandard,
      gradeRequested: item.gradeRequested,
      expiryDate: item.expiryDate,
      storageRequirement: item.storageRequirement,
      notes: item.notes,
    }))
    setEditedItems(items)
    setHasChanges(false)
  }

  return (
    <div className="space-y-4">
      {/* Unsaved Changes Warning */}
      {hasChanges && canEdit && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Unsaved Changes</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>You have unsaved quantity changes. Click Save to persist changes.</span>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCancel}
                disabled={isPending}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleSave}
                disabled={isPending}
              >
                <Save className="h-4 w-4 mr-1" />
                {isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Items Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>Item</TableHead>
              <TableHead className="text-center">Quantity</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Discount</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {editedItems.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{item.itemName}</div>
                    {item.itemCode && (
                      <Badge variant="outline" className="text-xs">
                        {item.itemCode}
                      </Badge>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {item.category} • {item.unit}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    {canEdit ? (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDecrement(index)}
                          disabled={item.orderedQuantity <= 1 || isPending}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          max="999999"
                          step="1"
                          value={item.orderedQuantity}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 1
                            handleQuantityChange(index, value)
                          }}
                          className="w-20 text-center"
                          disabled={isPending}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleIncrement(index)}
                          disabled={isPending}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </>
                    ) : (
                      <span className="font-medium">{item.orderedQuantity} {item.unit}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(item.pricePerUnit)}
                </TableCell>
                <TableCell className="text-right">
                  {item.discountPercent > 0 ? (
                    <span className="text-green-600">
                      {item.discountPercent}%
                    </span>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(calculateItemTotal(item))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Order Summary */}
      <div className="flex justify-end">
        <div className="w-full max-w-sm space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal:</span>
            <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Discount:</span>
            <span className="font-medium text-green-600">
              -{formatCurrency(totals.totalDiscount)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax (PPN 11%):</span>
            <span className="font-medium">{formatCurrency(totals.tax)}</span>
          </div>
          {order.shippingCost && order.shippingCost > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping:</span>
              <span className="font-medium">{formatCurrency(order.shippingCost)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t">
            <span className="font-semibold">Grand Total:</span>
            <span className="text-xl font-bold text-primary">
              {formatCurrency(totals.grandTotal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
