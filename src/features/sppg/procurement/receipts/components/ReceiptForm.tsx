/**
 * @fileoverview Receipt Form Component - Create/Update Receipt
 * @version Next.js 15.5.4 / React Hook Form + Zod / Enterprise-grade
 * @author Bagizi-ID Development Team
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Package,
  Truck,
  Camera,
  AlertCircle
} from 'lucide-react'
import { useCreateReceipt, useUpdateReceipt, usePendingProcurements } from '../hooks'
import { createReceiptFormSchema } from '../schemas'
import type { 
  CreateReceiptFormInput, 
  CreateReceiptInput,
  ReceiptWithDetails 
} from '../types'
import { formatCurrency } from '../lib'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Simplified pending procurement type (from API)
interface PendingProcurement {
  id: string
  procurementCode: string
  supplierName: string | null
  expectedDelivery: Date | null
  totalAmount: number
  items: Array<{
    id: string
    itemName: string
    quantity: number
    unit: string
    price: number
  }>
}

// ================================ TYPES ================================

interface ReceiptFormProps {
  receipt?: ReceiptWithDetails
  mode?: 'create' | 'update'
  onSuccess?: () => void
  onCancel?: () => void
}

// ================================ COMPONENT ================================

export function ReceiptForm({
  receipt,
  mode = 'create',
  onSuccess,
  onCancel,
}: ReceiptFormProps) {
  const router = useRouter()
  const [selectedProcurement, setSelectedProcurement] = useState<PendingProcurement | null>(null)

  // Fetch pending procurements for selection
  const { data: pendingProcurements = [] } = usePendingProcurements()
  const { mutate: createReceipt, isPending: isCreating } = useCreateReceipt()
  const { mutate: updateReceipt, isPending: isUpdating } = useUpdateReceipt()

  const isSubmitting = isCreating || isUpdating

  // Form setup with Form Input types (strings for dates)
  const form = useForm<CreateReceiptFormInput>({
    resolver: zodResolver(createReceiptFormSchema),
    defaultValues: receipt
      ? {
          procurementId: receipt.id, // Use receipt ID as procurement ID
          actualDelivery: receipt.actualDelivery 
            ? new Date(receipt.actualDelivery).toISOString().split('T')[0] 
            : new Date().toISOString().split('T')[0], // Convert Date to string (YYYY-MM-DD)
          receiptNumber: receipt.receiptNumber || undefined,
          receiptPhoto: receipt.receiptPhoto || undefined,
          deliveryPhoto: receipt.deliveryPhoto || undefined,
          items: receipt.items.map((item) => ({
            itemId: item.id,
            receivedQuantity: item.receivedQuantity || item.orderedQuantity,
            batchNumber: item.batchNumber || undefined,
            expiryDate: item.expiryDate 
              ? new Date(item.expiryDate).toISOString().split('T')[0]
              : undefined, // Convert Date to string
            productionDate: item.productionDate
              ? new Date(item.productionDate).toISOString().split('T')[0]
              : undefined, // Convert Date to string
          })),
        }
      : {
          procurementId: '',
          actualDelivery: new Date().toISOString().split('T')[0], // String format
          items: [],
        },
  })

  // Watch procurement selection
  const watchedProcurementId = form.watch('procurementId')
  
  useEffect(() => {
    if (watchedProcurementId && mode === 'create') {
      const selected = pendingProcurements.find((p) => p.id === watchedProcurementId)
      setSelectedProcurement(selected || null)
      
      // Auto-populate items from procurement
      if (selected?.items) {
        form.setValue(
          'items',
          selected.items.map((item: { id: string; quantity: number }) => ({
            itemId: item.id,
            receivedQuantity: item.quantity, // Default to ordered quantity
            batchNumber: undefined,
            expiryDate: undefined,
          }))
        )
      }
    }
  }, [watchedProcurementId, pendingProcurements, form, mode])

  // Submit handler - transform form input (strings) to API format (Dates)
  const onSubmit = (formData: CreateReceiptFormInput) => {
    // Transform dates from string to Date for API
    const apiData: CreateReceiptInput = {
      ...formData,
      actualDelivery: new Date(formData.actualDelivery),
      items: formData.items.map(item => ({
        ...item,
        expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined,
        productionDate: item.productionDate ? new Date(item.productionDate) : undefined,
      }))
    }
    
    if (mode === 'update' && receipt) {
      updateReceipt(
        { id: receipt.id, data: apiData },
        {
          onSuccess: () => {
            onSuccess?.()
            router.push(`/procurement/receipts/${receipt.id}`)
          },
        }
      )
    } else {
      createReceipt(apiData, {
        onSuccess: (response) => {
          onSuccess?.()
          if (response.data) {
            router.push(`/procurement/receipts/${response.data.id}`)
          }
        },
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Informasi Dasar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Procurement Selection */}
            {mode === 'create' && (
              <FormField
                control={form.control}
                name="procurementId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Procurement *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih procurement..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {pendingProcurements.map((proc) => (
                          <SelectItem key={proc.id} value={proc.id}>
                            {proc.procurementCode} - {proc.supplierName} (
                            {formatCurrency(proc.totalAmount)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Pilih procurement order yang akan diterima
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Selected Procurement Info */}
            {selectedProcurement && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1 text-sm">
                    <div className="font-medium">Detail Procurement:</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>Supplier: {selectedProcurement.supplierName}</div>
                      <div>Total: {formatCurrency(selectedProcurement.totalAmount)}</div>
                      {selectedProcurement.expectedDelivery && (
                        <div>Expected: {new Date(selectedProcurement.expectedDelivery).toLocaleDateString('id-ID')}</div>
                      )}
                      <div>Items: {selectedProcurement.items.length} item</div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Actual Delivery Date */}
              <FormField
                control={form.control}
                name="actualDelivery"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Penerimaan *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="datetime-local"
                          className="pl-8"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Tanggal dan waktu penerimaan barang
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Receipt Number */}
              <FormField
                control={form.control}
                name="receiptNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Tanda Terima</FormLabel>
                    <FormControl>
                      <Input placeholder="TTB-2025-001" {...field} />
                    </FormControl>
                    <FormDescription>
                      Nomor dokumen tanda terima barang
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Photos Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Dokumentasi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Receipt Photo */}
              <FormField
                control={form.control}
                name="receiptPhoto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Foto Tanda Terima</FormLabel>
                    <FormControl>
                      <Input placeholder="URL foto tanda terima" {...field} />
                    </FormControl>
                    <FormDescription>
                      URL atau path foto dokumen tanda terima
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Delivery Photo */}
              <FormField
                control={form.control}
                name="deliveryPhoto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Foto Pengiriman</FormLabel>
                    <FormControl>
                      <Input placeholder="URL foto pengiriman" {...field} />
                    </FormControl>
                    <FormDescription>
                      URL atau path foto proses pengiriman
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Items Card */}
        {selectedProcurement && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Daftar Barang ({selectedProcurement.items.length} item)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedProcurement.items.map((item, index) => (
                  <div key={item.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.itemName}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">
                              Ordered: {item.quantity} {item.unit}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              @ {formatCurrency(item.price)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Received Quantity */}
                        <FormField
                          control={form.control}
                          name={`items.${index}.receivedQuantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Jumlah Diterima *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(parseFloat(e.target.value))
                                  }
                                />
                              </FormControl>
                              <FormDescription>
                                Maksimal: {item.quantity} {item.unit}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Batch Number */}
                        <FormField
                          control={form.control}
                          name={`items.${index}.batchNumber`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Batch Number</FormLabel>
                              <FormControl>
                                <Input placeholder="BATCH-001" {...field} />
                              </FormControl>
                              <FormDescription>
                                Nomor batch/lot produksi
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Expiry Date */}
                        <FormField
                          control={form.control}
                          name={`items.${index}.expiryDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tanggal Kadaluarsa</FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  value={field.value || ''}
                                  onChange={(e) => field.onChange(e.target.value)}
                                />
                              </FormControl>
                              <FormDescription>
                                Tanggal kadaluarsa produk
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onCancel?.()
              router.back()
            }}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? mode === 'update'
                ? 'Menyimpan...'
                : 'Membuat...'
              : mode === 'update'
              ? 'Simpan Perubahan'
              : 'Buat Penerimaan'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
