/**
 * @fileoverview Quality Control Form Component
 * @version Next.js 15.5.4 / React Hook Form + Zod / Enterprise-grade
 * @author Bagizi-ID Development Team
 */

'use client'

import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
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
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ClipboardCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
} from 'lucide-react'
import { QualityGrade } from '@prisma/client'
import { useSubmitQualityControl } from '../hooks'
import { qualityControlInputSchema } from '../schemas'
import type { QualityControlInput, ReceiptWithDetails } from '../types'
import { getQualityGradeLabel, getQualityGradeColor } from '../lib'

// ================================ COMPONENT ================================

interface QualityControlFormProps {
  receipt: ReceiptWithDetails
  onSuccess?: () => void
  onCancel?: () => void
}

export function QualityControlForm({
  receipt,
  onSuccess,
  onCancel,
}: QualityControlFormProps) {
  const router = useRouter()
  
  const { mutate: submitQC, isPending } = useSubmitQualityControl()

  // Form setup with default values
  const form = useForm<QualityControlInput>({
    resolver: zodResolver(qualityControlInputSchema),
    defaultValues: {
      receiptId: receipt.id,
      inspectedBy: '',
      overallNotes: '',
      items: receipt.items.map((item) => ({
        itemId: item.id,
        qualityReceived: '',
        gradeReceived: 'GOOD',
        isAccepted: true,
        rejectionReason: '',
        checkPoints: [
          {
            aspect: 'Appearance',
            standard: 'Fresh and clean',
            actual: '',
            isPassed: true,
          },
        ],
      })),
    },
  })

  // Field array for items
  const { fields } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  // Submit handler
  const onSubmit = (data: QualityControlInput) => {
    submitQC(data, {
      onSuccess: () => {
        onSuccess?.()
        router.push(`/procurement/receipts/${receipt.id}?tab=quality-control`)
      },
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Header Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              Quality Control Inspection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Lakukan pemeriksaan kualitas untuk semua item yang diterima. Pastikan
                setiap item memenuhi standar yang ditetapkan.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Inspector Name */}
              <FormField
                control={form.control}
                name="inspectedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Pemeriksa *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama lengkap pemeriksa" {...field} />
                    </FormControl>
                    <FormDescription>
                      Nama petugas yang melakukan quality control
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Overall Notes */}
            <FormField
              control={form.control}
              name="overallNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan Umum</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Catatan atau temuan umum dari pemeriksaan..."
                      className="min-h-[100px]"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Catatan tambahan atau temuan khusus
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Items Inspection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Pemeriksaan Per Item ({fields.length} item)
          </h3>

          {fields.map((field, itemIndex) => {
            const item = receipt.items[itemIndex]
            const isAccepted = form.watch(`items.${itemIndex}.isAccepted`)

            return (
              <Card key={field.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{item.itemName}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">
                          {item.receivedQuantity || item.orderedQuantity} {item.unit}
                        </Badge>
                        {item.batchNumber && (
                          <span className="text-sm text-muted-foreground">
                            Batch: {item.batchNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Quality Assessment */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Quality Received */}
                    <FormField
                      control={form.control}
                      name={`items.${itemIndex}.qualityReceived`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kualitas Diterima *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Misal: Fresh, baik, sesuai standar"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Deskripsi kondisi kualitas yang diterima
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Grade Received */}
                    <FormField
                      control={form.control}
                      name={`items.${itemIndex}.gradeReceived`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grade *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih grade" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(QualityGrade).map((grade) => (
                                <SelectItem key={grade} value={grade}>
                                  <Badge
                                    variant="outline"
                                    className={getQualityGradeColor(grade)}
                                  >
                                    {getQualityGradeLabel(grade)}
                                  </Badge>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Grade kualitas item ini
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  {/* Acceptance Status */}
                  <FormField
                    control={form.control}
                    name={`items.${itemIndex}.isAccepted`}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="cursor-pointer">
                            {field.value ? (
                              <span className="flex items-center gap-2 text-green-600">
                                <CheckCircle2 className="h-4 w-4" />
                                Item Diterima
                              </span>
                            ) : (
                              <span className="flex items-center gap-2 text-red-600">
                                <XCircle className="h-4 w-4" />
                                Item Ditolak
                              </span>
                            )}
                          </FormLabel>
                          <FormDescription>
                            Centang jika item ini memenuhi standar dan diterima
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Rejection Reason (if rejected) */}
                  {!isAccepted && (
                    <FormField
                      control={form.control}
                      name={`items.${itemIndex}.rejectionReason`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alasan Penolakan *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Jelaskan alasan penolakan item ini..."
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Alasan kenapa item ini ditolak
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <Separator />

                  {/* Quality Check Points */}
                  <div>
                    <h4 className="font-medium mb-3">Check Points</h4>
                    <QualityCheckPoints
                      form={form}
                      itemIndex={itemIndex}
                    />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Pemeriksaan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Item</span>
                <span className="font-medium">{receipt.items.length} item</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Diterima</span>
                <span className="font-medium text-green-600">
                  {form.watch('items')?.filter((item) => item.isAccepted).length || 0} item
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ditolak</span>
                <span className="font-medium text-red-600">
                  {form.watch('items')?.filter((item) => !item.isAccepted).length || 0} item
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onCancel?.()
              router.back()
            }}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Menyimpan...' : 'Submit Quality Control'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

// ================================ QUALITY CHECK POINTS SUB-COMPONENT ================================

interface QualityCheckPointsProps {
  form: ReturnType<typeof useForm<QualityControlInput>>
  itemIndex: number
}

function QualityCheckPoints({ form, itemIndex }: QualityCheckPointsProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `items.${itemIndex}.checkPoints`,
  })

  const addCheckPoint = () => {
    append({
      aspect: '',
      standard: '',
      actual: '',
      isPassed: true,
    })
  }

  return (
    <div className="space-y-3">
      {fields.map((field, checkIndex) => (
        <div key={field.id} className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="font-medium text-sm">
              Check Point #{checkIndex + 1}
            </h5>
            {fields.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(checkIndex)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Aspect */}
            <FormField
              control={form.control}
              name={`items.${itemIndex}.checkPoints.${checkIndex}.aspect`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Aspek</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Misal: Appearance, Smell, Texture"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Standard */}
            <FormField
              control={form.control}
              name={`items.${itemIndex}.checkPoints.${checkIndex}.standard`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Standar</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Standar yang diharapkan"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actual */}
            <FormField
              control={form.control}
              name={`items.${itemIndex}.checkPoints.${checkIndex}.actual`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Aktual</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Kondisi aktual yang ditemukan"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Is Passed */}
            <FormField
              control={form.control}
              name={`items.${itemIndex}.checkPoints.${checkIndex}.isPassed`}
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm cursor-pointer">
                      {field.value ? (
                        <span className="text-green-600">✓ Passed</span>
                      ) : (
                        <span className="text-red-600">✗ Failed</span>
                      )}
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addCheckPoint}
        className="w-full"
      >
        <Plus className="mr-2 h-4 w-4" />
        Tambah Check Point
      </Button>
    </div>
  )
}
