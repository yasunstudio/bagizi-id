"use client"

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Form,
  FormControl,
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
import { paymentTransactionCreateSchema } from '@/features/sppg/procurement/payments/schemas'
import type { PaymentTransactionFormInput } from '@/features/sppg/procurement/payments/types'
import { useCreatePayment } from '@/features/sppg/procurement/payments/hooks'

interface PaymentFormProps {
  procurementId: string
  onSuccess?: () => void
}

export function PaymentForm({ procurementId, onSuccess }: PaymentFormProps) {
  const { mutate: createPayment, isPending } = useCreatePayment()

  const form = useForm<PaymentTransactionFormInput>({
    resolver: zodResolver(paymentTransactionCreateSchema),
    defaultValues: {
      procurementId,
      paymentDate: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
      paymentMethod: 'BANK_TRANSFER',
      amount: 0,
      referenceNumber: '',
      bankName: '',
      accountNumber: '',
      receiptUrl: '',
      notes: '',
    },
  })

  const paymentMethod = form.watch('paymentMethod')

  const onSubmit = (data: PaymentTransactionFormInput) => {
    createPayment(data, {
      onSuccess: () => {
        form.reset({
          procurementId,
          paymentDate: new Date().toISOString().slice(0, 10),
          paymentMethod: 'BANK_TRANSFER',
          amount: 0,
          referenceNumber: '',
          bankName: '',
          accountNumber: '',
          receiptUrl: '',
          notes: '',
        })
        onSuccess?.()
      },
    })
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Catat Pembayaran</CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="paymentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Pembayaran</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Metode Pembayaran</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih metode pembayaran" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="BANK_TRANSFER">Transfer Bank</SelectItem>
                          <SelectItem value="CASH">Tunai</SelectItem>
                          <SelectItem value="CREDIT_CARD">Kartu Kredit</SelectItem>
                          <SelectItem value="DEBIT_CARD">Kartu Debit</SelectItem>
                          <SelectItem value="CHECK">Cek</SelectItem>
                          <SelectItem value="OTHER">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah (Rp)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="referenceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Referensi</FormLabel>
                    <FormControl>
                      <Input placeholder="(opsional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {paymentMethod === 'BANK_TRANSFER' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Bank</FormLabel>
                      <FormControl>
                        <Input placeholder="Bank ABC" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Rekening</FormLabel>
                      <FormControl>
                        <Input placeholder="1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="receiptUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Bukti Pembayaran</FormLabel>
                  <FormControl>
                    <Input placeholder="https://... (opsional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan</FormLabel>
                  <FormControl>
                    <Input placeholder="Catatan (opsional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => form.reset()}>
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Menyimpan...' : 'Simpan Pembayaran'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
