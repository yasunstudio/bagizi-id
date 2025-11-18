/**
 * @fileoverview OrderForm Component - Enterprise Form with Validation
 * @version Next.js 15.5.4 / React Hook Form 7.52 / Zod 3.23
 * @author Bagizi-ID Development Team
 * 
 * CRITICAL: Main form component for creating/updating orders
 * - React Hook Form + Zod validation
 * - Dynamic item management
 * - Real-time calculations
 * - Auto-save draft support
 * 
 * FEATURES:
 * - Multi-step form (optional)
 * - Item management with add/remove
 * - Automatic calculations (subtotal, tax, total)
 * - Supplier selection with auto-fill
 * - Delivery date validation
 * - Draft save/restore
 */

'use client'

import { useEffect, useState } from 'react'
import { useForm, useFieldArray, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateOrder, useUpdateOrder, useApprovedPlans, usePaymentTerms } from '../hooks'
import { useSuppliers } from '@/features/sppg/procurement/suppliers/hooks'
import { useInventoryItems } from '@/features/sppg/menu/hooks/useInventory'
import type { Supplier } from '@/features/sppg/procurement/suppliers/types'
import { createOrderFormSchema, type CreateOrderFormInput } from '../schemas'
import { 
  calculateTax, 
  calculateGrandTotal, 
  formatCurrency 
} from '../utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Plus, Trash2, Info as InfoIcon, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { OrderWithDetails } from '../types'
import { AutoApprovePreview } from './AutoApprovePreview'

/**
 * OrderForm Component Props
 */
interface OrderFormProps {
  /** Existing order data for edit mode */
  order?: OrderWithDetails
  /** Called on successful submission */
  onSuccess?: (orderId: string) => void
  /** Called on cancel */
  onCancel?: () => void
}

/**
 * OrderForm Component
 * Create or update procurement order with validation
 * 
 * @example
 * ```tsx
 * // Create mode
 * <OrderForm onSuccess={(id) => router.push(`/procurement/orders/${id}`)} />
 * 
 * // Edit mode
 * <OrderForm order={existingOrder} onSuccess={(id) => router.push(`/procurement/orders/${id}`)} />
 * ```
 */
export function OrderForm({ order, onSuccess, onCancel }: OrderFormProps) {
  const isEditMode = !!order

  // Fetch approved plans for dropdown
  const { data: approvedPlans, isLoading: isLoadingPlans } = useApprovedPlans()

  // Fetch active suppliers for dropdown
  const { data: suppliers, isLoading: isLoadingSuppliers } = useSuppliers({ 
    isActive: true 
  })

  // Fetch active payment terms for dropdown
  const { data: paymentTerms, isLoading: isLoadingPaymentTerms } = usePaymentTerms()

  // Fetch inventory items for dropdown
  const { data: inventoryItems, isLoading: isLoadingInventory } = useInventoryItems()

  // Mutations
  const { mutate: createOrder, isPending: isCreating } = useCreateOrder()
  const { mutate: updateOrder, isPending: isUpdating } = useUpdateOrder()

  const isPending = isCreating || isUpdating

  // Form setup
  const form = useForm<CreateOrderFormInput>({
    resolver: zodResolver(createOrderFormSchema) as Resolver<CreateOrderFormInput>,
    defaultValues: order ? {
      planId: order.planId || undefined,
      procurementDate: new Date(order.procurementDate).toISOString().split('T')[0],
      expectedDelivery: order.expectedDelivery 
        ? new Date(order.expectedDelivery).toISOString().split('T')[0] 
        : '',
      supplierId: order.supplierId,
      supplierName: order.supplierName || '',
      supplierContact: order.supplierContact || '',
      purchaseMethod: order.purchaseMethod,
      paymentTerms: order.paymentTerms || '',
      deliveryMethod: order.deliveryMethod || '',
      items: order.items?.map(item => ({
        inventoryItemId: item.inventoryItemId || undefined,
        itemName: item.itemName,
        category: item.category,
        orderedQuantity: item.orderedQuantity,
        unit: item.unit,
        pricePerUnit: item.pricePerUnit,
        discountPercent: item.discountPercent ?? 0,
      })) || [],
    } : {
      procurementDate: new Date().toISOString().split('T')[0],
      expectedDelivery: '',
      supplierId: '',
      supplierName: '',
      supplierContact: '',
      purchaseMethod: 'DIRECT',
      paymentTerms: '',
      deliveryMethod: '',
      items: [],
    },
  })

  // Item array management
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  // Watch items for calculations
  const items = form.watch('items')

  // Watch selected plan for budget tracking
  const selectedPlanId = form.watch('planId')
  const selectedPlan = approvedPlans?.find(p => p.id === selectedPlanId)

  // Calculate totals
  const [totals, setTotals] = useState({
    subtotal: 0,
    discount: 0,
    tax: 0,
    grandTotal: 0,
  })

  useEffect(() => {
    // Calculate all items' final price (after discounts)
    const itemsTotals = items.map(item => {
      const quantity = item.orderedQuantity || 0
      const price = item.pricePerUnit || 0
      const discount = item.discountPercent || 0
      const subtotal = quantity * price
      const discountAmount = (subtotal * discount) / 100
      return subtotal - discountAmount
    })

    const subtotal = itemsTotals.reduce((sum, itemTotal) => sum + itemTotal, 0)
    const totalDiscount = items.reduce((sum, item) => {
      const itemTotal = (item.orderedQuantity || 0) * (item.pricePerUnit || 0)
      const discount = itemTotal * ((item.discountPercent || 0) / 100)
      return sum + discount
    }, 0)

    const tax = calculateTax(subtotal)
    const grandTotal = calculateGrandTotal(subtotal, tax, 0, 0)

    setTotals({
      subtotal,
      discount: totalDiscount,
      tax,
      grandTotal,
    })
  }, [items])

  // Handle form submission
  const onSubmit = (data: CreateOrderFormInput) => {
    console.log('🚀 Form submitted with data:', data)
    console.log('📊 Form validation state:', form.formState.errors)
    console.log('✅ Is edit mode:', isEditMode)
    
    if (isEditMode && order) {
      console.log('📝 Updating order:', order.id)
      updateOrder(
        {
          id: order.id,
          data: {
            expectedDelivery: data.expectedDelivery,
            supplierContact: data.supplierContact,
            paymentTerms: data.paymentTerms,
            paymentDue: data.paymentDue,
            deliveryMethod: data.deliveryMethod,
            items: data.items,
          },
        },
        {
          onSuccess: () => {
            toast.success('Order updated successfully')
            onSuccess?.(order.id)
          },
          onError: (error) => {
            console.error('❌ Update error:', error)
            toast.error(error.message || 'Failed to update order')
          },
        }
      )
    } else {
      console.log('➕ Creating new order')
      createOrder(data, {
        onSuccess: (newOrder) => {
          console.log('✅ Order created successfully:', newOrder)
          toast.success('Order created successfully')
          onSuccess?.(newOrder.id)
        },
        onError: (error) => {
          console.error('❌ Create error:', error)
          toast.error(error.message || 'Failed to create order')
        },
      })
    }
  }

  // Add new item
  const handleAddItem = () => {
    append({
      inventoryItemId: '',
      itemName: '',
      category: 'PROTEIN',
      orderedQuantity: 1,
      unit: 'kg',
      pricePerUnit: 0,
      discountPercent: 0,
    })
  }

  // Handle inventory item selection - auto-fill details
  const handleInventoryItemSelect = (itemId: string, index: number) => {
    const selectedItem = inventoryItems?.find(item => item.id === itemId)
    
    if (selectedItem) {
      // Auto-fill item details from inventory
      form.setValue(`items.${index}.itemName`, selectedItem.itemName)
      form.setValue(`items.${index}.itemCode`, selectedItem.itemCode || '')
      // Map inventory category to form category enum
      const categoryMap: Record<string, string> = {
        'PROTEIN': 'PROTEIN',
        'KARBOHIDRAT': 'KARBOHIDRAT',
        'SAYURAN': 'SAYURAN',
        'BUAH': 'BUAH',
        'SUSU_OLAHAN': 'SUSU_OLAHAN',
        'BUMBU_REMPAH': 'BUMBU_REMPAH',
        'MINYAK_LEMAK': 'MINYAK_LEMAK',
        'LAINNYA': 'LAINNYA',
      }
      const mappedCategory = categoryMap[selectedItem.category] || 'LAINNYA'
      form.setValue(`items.${index}.category`, mappedCategory as CreateOrderFormInput['items'][0]['category'])
      form.setValue(`items.${index}.unit`, selectedItem.unit)
      form.setValue(`items.${index}.pricePerUnit`, selectedItem.costPerUnit || 0)
      
      console.log('🔄 Auto-filled item details from inventory:', selectedItem)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Instructions for New Orders */}
        {!isEditMode && (
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Creating New Order</AlertTitle>
            <AlertDescription>
              Complete the form to create a new procurement order. Required fields are marked with *.
              Don&apos;t forget to add at least one item before submitting.
            </AlertDescription>
          </Alert>
        )}

        {/* Form-level Validation Errors */}
        {Object.keys(form.formState.errors).length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Form Validation Errors</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1 mt-2">
                {form.formState.errors.items?.message && (
                  <li>{form.formState.errors.items.message}</li>
                )}
                {form.formState.errors.supplierId?.message && (
                  <li>{form.formState.errors.supplierId.message}</li>
                )}
                {form.formState.errors.procurementDate?.message && (
                  <li>{form.formState.errors.procurementDate.message}</li>
                )}
                {form.formState.errors.expectedDelivery?.message && (
                  <li>{form.formState.errors.expectedDelivery.message}</li>
                )}
                {form.formState.errors.paymentTerms?.message && (
                  <li>{form.formState.errors.paymentTerms.message}</li>
                )}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Auto-Approve Preview */}
        {!isEditMode && totals.grandTotal > 0 && (
          <AutoApprovePreview
            orderTotal={totals.grandTotal}
            threshold={5000000}
            showProgress={true}
          />
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
            <CardDescription>
              Basic procurement order details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="procurementDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Procurement Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled={isEditMode} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expectedDelivery"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Delivery</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        value={field.value || ''} 
                      />
                    </FormControl>
                    <FormDescription>
                      Expected delivery date from supplier
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Plan Selection */}
            <FormField
              control={form.control}
              name="planId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rencana Pengadaan (Optional)</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      // Convert special "none" value to undefined for API
                      field.onChange(value === '__no_plan__' ? undefined : value)
                    }}
                    value={field.value || '__no_plan__'}
                    disabled={isEditMode || isLoadingPlans}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih rencana atau kosongkan untuk emergency order" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__no_plan__">
                        <span className="text-muted-foreground">Tidak ada rencana (Emergency Order)</span>
                      </SelectItem>
                      {approvedPlans?.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          <div className="flex items-center justify-between w-full gap-2">
                            <span className="font-medium">{plan.planName}</span>
                            <span className="text-sm text-muted-foreground">
                              ({plan.planMonth} {plan.planYear})
                            </span>
                            <span className={cn(
                              "text-sm font-semibold",
                              plan.hasRemainingBudget ? "text-green-600" : "text-destructive"
                            )}>
                              Sisa: {formatCurrency(plan.remainingBudget)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Link order ke rencana pengadaan yang sudah disetujui untuk tracking budget
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Budget Info Display */}
            {selectedPlan && (
              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Budget Tracking</AlertTitle>
                <AlertDescription>
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Budget:</span>
                      <span className="font-semibold">{formatCurrency(selectedPlan.totalBudget)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Terpakai:</span>
                      <span className="font-semibold text-orange-600">
                        {formatCurrency(selectedPlan.usedBudget)} ({selectedPlan.budgetUsagePercent}%)
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sisa:</span>
                      <span className={cn(
                        "font-semibold",
                        selectedPlan.hasRemainingBudget ? "text-green-600" : "text-destructive"
                      )}>
                        {formatCurrency(selectedPlan.remainingBudget)}
                      </span>
                    </div>
                    <Progress 
                      value={selectedPlan.budgetUsagePercent} 
                      className="h-2 mt-2"
                    />
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Over Budget Warning */}
            {selectedPlan && totals.grandTotal > selectedPlan.remainingBudget && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Peringatan Budget!</AlertTitle>
                <AlertDescription>
                  Total order <strong>{formatCurrency(totals.grandTotal)}</strong> melebihi 
                  sisa budget rencana <strong>{formatCurrency(selectedPlan.remainingBudget)}</strong>.
                  Selisih: <strong>{formatCurrency(totals.grandTotal - selectedPlan.remainingBudget)}</strong>
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isEditMode || isLoadingSuppliers}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingSuppliers ? (
                          <SelectItem value="__loading__" disabled>
                            Loading suppliers...
                          </SelectItem>
                        ) : suppliers && Array.isArray(suppliers) && suppliers.length > 0 ? (
                          suppliers.map((supplier: Supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                              <div className="flex items-center justify-between w-full gap-2">
                                <span className="font-medium">{supplier.supplierName}</span>
                                <span className="text-sm text-muted-foreground">
                                  {supplier.supplierType}
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="__empty__" disabled>
                            No suppliers available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select from active suppliers
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supplierContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier Contact</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone or email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="purchaseMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Method *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isEditMode}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DIRECT">Direct Purchase</SelectItem>
                        <SelectItem value="TENDER">Tender</SelectItem>
                        <SelectItem value="CONTRACT">Contract</SelectItem>
                        <SelectItem value="EMERGENCY">Emergency</SelectItem>
                        <SelectItem value="BULK">Bulk Purchase</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentTerms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Terms</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ''}
                      disabled={isLoadingPaymentTerms}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment terms" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingPaymentTerms ? (
                          <SelectItem value="__loading__" disabled>
                            Loading payment terms...
                          </SelectItem>
                        ) : paymentTerms && paymentTerms.length > 0 ? (
                          paymentTerms.map((term) => (
                            <SelectItem key={term.id} value={term.code}>
                              <div className="flex items-center justify-between w-full gap-2">
                                <span className="font-medium">{term.name}</span>
                                {term.requireDP && (
                                  <Badge variant="secondary" className="text-xs">
                                    DP {term.dpPercentage}%
                                  </Badge>
                                )}
                                <span className="text-sm text-muted-foreground">
                                  {term.dueDays === 0 ? 'Immediate' : `${term.dueDays} days`}
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="__empty__" disabled>
                            No payment terms available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select payment terms based on supplier agreement
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Order Items</CardTitle>
                <CardDescription>
                  Items to be ordered ({fields.length} items)
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {fields.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No items added yet. Click &quot;Add Item&quot; to start.
              </div>
            ) : (
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <Card key={field.id} className="relative">
                    <CardContent className="pt-6">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                      {/* Inventory Item Selector */}
                      <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                        <FormField
                          control={form.control}
                          name={`items.${index}.inventoryItemId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Select from Inventory (Optional)</FormLabel>
                              <Select 
                                onValueChange={(value) => {
                                  field.onChange(value === '__none__' ? '' : value)
                                  if (value !== '__none__') {
                                    handleInventoryItemSelect(value, index)
                                  }
                                }}
                                value={field.value || '__none__'}
                                disabled={isLoadingInventory}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select item from inventory..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="__none__">
                                    <span className="text-muted-foreground">
                                      -- Don&apos;t use inventory (manual entry) --
                                    </span>
                                  </SelectItem>
                                  {isLoadingInventory ? (
                                    <SelectItem value="__loading__" disabled>
                                      Loading inventory items...
                                    </SelectItem>
                                  ) : inventoryItems && inventoryItems.length > 0 ? (
                                    inventoryItems.map((item) => (
                                      <SelectItem key={item.id} value={item.id}>
                                        <div className="flex items-center justify-between w-full gap-2">
                                          <span className="font-medium">{item.itemName}</span>
                                          {item.itemCode && (
                                            <Badge variant="outline" className="text-xs">
                                              {item.itemCode}
                                            </Badge>
                                          )}
                                          <span className="text-xs text-muted-foreground">
                                            Stock: {item.currentStock} {item.unit}
                                          </span>
                                        </div>
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem value="__empty__" disabled>
                                      No inventory items available
                                    </SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Select an item from inventory to auto-fill details, or leave empty to enter manually
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name={`items.${index}.itemName`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Item Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="Item name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.category`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="PROTEIN">Protein</SelectItem>
                                  <SelectItem value="KARBOHIDRAT">Karbohidrat</SelectItem>
                                  <SelectItem value="SAYURAN">Sayuran</SelectItem>
                                  <SelectItem value="BUAH">Buah</SelectItem>
                                  <SelectItem value="SUSU_OLAHAN">Susu & Olahan</SelectItem>
                                  <SelectItem value="BUMBU_REMPAH">Bumbu & Rempah</SelectItem>
                                  <SelectItem value="MINYAK_LEMAK">Minyak & Lemak</SelectItem>
                                  <SelectItem value="LAINNYA">Lainnya</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.unit`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unit *</FormLabel>
                              <FormControl>
                                <Input placeholder="kg, liter, pcs" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.orderedQuantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantity *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.pricePerUnit`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price per Unit *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.discountPercent`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Discount (%)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.01"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                        <span>
                          Item Total: {formatCurrency((() => {
                            const item = items[index]
                            if (!item) return 0
                            const quantity = item.orderedQuantity || 0
                            const price = item.pricePerUnit || 0
                            const discount = item.discountPercent || 0
                            const subtotal = quantity * price
                            const discountAmount = (subtotal * discount) / 100
                            return subtotal - discountAmount
                          })())}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Summary */}
        {fields.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount:</span>
                  <span className="font-medium text-green-600">
                    -{formatCurrency(totals.discount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (PPN 11%):</span>
                  <span className="font-medium">{formatCurrency(totals.tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-semibold">Grand Total:</span>
                  <span className="text-xl font-bold text-primary">
                    {formatCurrency(totals.grandTotal)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form Actions */}
        <div className="space-y-4">
          {/* Warning when no items */}
          {fields.length === 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Items Added</AlertTitle>
              <AlertDescription>
                Please add at least one item to the order before submitting.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-end gap-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isPending}
              >
                Cancel
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={isPending || fields.length === 0}
              onClick={() => {
                console.log('🔵 Submit button clicked!')
                console.log('🔵 isPending:', isPending)
                console.log('🔵 fields.length:', fields.length)
                console.log('🔵 Form errors:', form.formState.errors)
              }}
            >
              {isPending ? 'Saving...' : isEditMode ? 'Update Order' : 'Create Order'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
