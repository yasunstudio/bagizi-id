/**
 * @fileoverview Banper Disbursement Form Component
 * @version Next.js 15.5.4 / shadcn/ui with Dark Mode
 * @author Bagizi-ID Development Team
 * 
 * Form untuk input data pencairan dana Banper
 */

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { banperRequestTrackingDisbursementSchema } from '../lib/schemas'
import type { BanperRequestTrackingDisbursementInput } from '../lib/schemas'
import { cn } from '@/lib/utils'

interface BanperDisbursementFormProps {
  requestedAmount: number
  onSubmit: (data: BanperRequestTrackingDisbursementInput) => void
  onCancel?: () => void
  isSubmitting?: boolean
}

export function BanperDisbursementForm({
  requestedAmount,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: BanperDisbursementFormProps) {
  const form = useForm({
    resolver: zodResolver(banperRequestTrackingDisbursementSchema),
    defaultValues: {
      disbursedAmount: requestedAmount,
      disbursedDate: new Date(),
      bankReferenceNumber: '',
      bankAccountReceived: '',
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Input Data Pencairan Dana</CardTitle>
        <CardDescription>
          Masukkan informasi pencairan dana Banper dari BGN
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Disbursed Amount */}
            <FormField
              control={form.control}
              name="disbursedAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah Dana Dicairkan *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Jumlah anggaran yang diminta: Rp {requestedAmount.toLocaleString('id-ID')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Disbursed Date */}
            <FormField
              control={form.control}
              name="disbursedDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tanggal Pencairan *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value as Date, 'dd MMMM yyyy', { locale: localeId })
                          ) : (
                            <span>Pilih tanggal pencairan</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value as Date}
                        onSelect={field.onChange}
                        locale={localeId}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Tanggal dana masuk ke rekening
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bank Reference Number */}
            <FormField
              control={form.control}
              name="bankReferenceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Referensi Bank *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: TRF20241112001234"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Nomor referensi transaksi dari bank
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bank Account Received */}
            <FormField
              control={form.control}
              name="bankAccountReceived"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rekening Penerima *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: BNI 1234567890 a.n. SPPG Jakarta"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Bank, nomor rekening, dan nama penerima
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex justify-end gap-2 pt-4">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan...' : 'Simpan Data Pencairan'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
