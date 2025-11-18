/**
 * @fileoverview Budget Transaction Form Component
 * @version Next.js 15.5.4 / React Hook Form + Zod
 * @author Bagizi-ID Development Team
 * 
 * Form untuk create/edit budget transaction dengan:
 * - Program & allocation selection
 * - Transaction category dengan 11 options
 * - Amount & date input
 * - Receipt upload (optional)
 * - Notes & description
 */

'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarIcon, Receipt, Upload } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

import { budgetTransactionCreateSchema } from '../lib/schemas'
import type { BudgetTransactionCreateInput } from '../lib/schemas'
import { useBudgetAllocations } from '../hooks'
import { usePrograms } from '@/features/sppg/program/hooks'
import { BudgetTransactionCategory } from '@prisma/client'
import { cn } from '@/lib/utils'

// Type untuk form data yang support edit mode
type BudgetTransactionData = Partial<BudgetTransactionCreateInput> & {
  id?: string
  transactionNumber?: string
  createdAt?: Date | string
  updatedAt?: Date | string
  [key: string]: unknown
}

interface BudgetTransactionFormProps {
  initialData?: BudgetTransactionData
  onSubmit: (data: BudgetTransactionCreateInput) => void
  onCancel?: () => void
  isSubmitting?: boolean
  mode?: 'create' | 'edit'
  prefillProgramId?: string
  prefillAllocationId?: string
}

// Category configuration dengan labels dan icons
const categoryConfig: Record<BudgetTransactionCategory, { label: string; description: string }> = {
  FOOD_PROCUREMENT: { 
    label: 'Pengadaan Bahan Pangan', 
    description: 'Pembelian beras, telur, sayur, buah, daging, dll' 
  },
  OPERATIONAL: { 
    label: 'Operasional Umum', 
    description: 'Biaya operasional harian' 
  },
  TRANSPORT: { 
    label: 'Transport & Distribusi', 
    description: 'Biaya kendaraan, BBM, transport delivery' 
  },
  UTILITIES: { 
    label: 'Utilitas', 
    description: 'Listrik, air, gas, internet' 
  },
  STAFF_SALARY: { 
    label: 'Gaji Staff', 
    description: 'Gaji pegawai tetap dan honor harian' 
  },
  EQUIPMENT: { 
    label: 'Peralatan Dapur', 
    description: 'Kompor, panci, pisau, dll' 
  },
  PACKAGING: { 
    label: 'Pengemasan', 
    description: 'Kotak makan, plastik, label' 
  },
  MARKETING: { 
    label: 'Marketing & Sosialisasi', 
    description: 'Promosi, sosialisasi, publikasi' 
  },
  TRAINING: { 
    label: 'Pelatihan & Training', 
    description: 'Pelatihan staff, workshop' 
  },
  MAINTENANCE: { 
    label: 'Pemeliharaan', 
    description: 'Perbaikan peralatan, maintenance rutin' 
  },
  OTHER: { 
    label: 'Lain-lain', 
    description: 'Pengeluaran lainnya' 
  },
}

export function BudgetTransactionForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode = 'create',
  prefillProgramId,
  prefillAllocationId,
}: BudgetTransactionFormProps) {
  const { data: programs, isLoading: programsLoading } = usePrograms()
  const { data: allocations, isLoading: allocationsLoading } = useBudgetAllocations()

  const form = useForm({
    resolver: zodResolver(budgetTransactionCreateSchema),
    defaultValues: initialData ? {
      allocationId: initialData.allocationId || '',
      programId: initialData.programId || prefillProgramId || '',
      category: initialData.category || 'FOOD_PROCUREMENT',
      amount: initialData.amount || 0,
      transactionDate: initialData.transactionDate ? new Date(initialData.transactionDate) : new Date(),
      description: initialData.description || '',
      procurementId: initialData.procurementId ?? undefined,
      productionId: initialData.productionId ?? undefined,
      distributionId: initialData.distributionId ?? undefined,
      receiptNumber: initialData.receiptNumber ?? undefined,
      receiptUrl: initialData.receiptUrl ?? undefined,
      notes: initialData.notes ?? undefined,
    } : {
      allocationId: prefillAllocationId || '',
      programId: prefillProgramId || '',
      category: 'FOOD_PROCUREMENT',
      amount: 0,
      transactionDate: new Date(),
      description: '',
      procurementId: undefined,
      productionId: undefined,
      distributionId: undefined,
      receiptNumber: undefined,
      receiptUrl: undefined,
      notes: undefined,
    },
  })

  const watchProgramId = form.watch('programId')

  // Filter allocations by selected program
  const filteredAllocations = allocations?.filter(
    a => a.program.id === watchProgramId && a.status === 'ACTIVE'
  )

  // Auto-select allocation if only one available
  useEffect(() => {
    if (filteredAllocations && filteredAllocations.length === 1 && !initialData) {
      form.setValue('allocationId', filteredAllocations[0].id)
    }
  }, [filteredAllocations, form, initialData])

  const handleSubmit = (data: BudgetTransactionCreateInput) => {
    onSubmit(data)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          {mode === 'create' ? 'Catat Transaksi Anggaran Baru' : 'Edit Transaksi Anggaran'}
        </CardTitle>
        <CardDescription>
          {mode === 'create' 
            ? 'Input detail pengeluaran dari budget allocation yang tersedia'
            : 'Perbarui informasi transaksi anggaran yang sudah ada'
          }
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Info Alert */}
            <Alert>
              <Receipt className="h-4 w-4" />
              <AlertDescription>
                Pastikan semua data transaksi sesuai dengan bukti nota/kwitansi. 
                Upload bukti pembayaran untuk dokumentasi yang lebih baik.
              </AlertDescription>
            </Alert>

            {/* Program & Allocation Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Informasi Dasar</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Program Selection */}
                <FormField
                  control={form.control}
                  name="programId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Program</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={programsLoading || !!initialData}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih program" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {programs?.map((program) => (
                            <SelectItem key={program.id} value={program.id}>
                              {program.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Program yang menggunakan budget
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Budget Allocation Selection */}
                <FormField
                  control={form.control}
                  name="allocationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alokasi Budget</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={allocationsLoading || !watchProgramId || !!initialData}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih alokasi budget" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredAllocations?.map((allocation) => (
                            <SelectItem key={allocation.id} value={allocation.id}>
                              {allocation.source} - Rp {allocation.allocatedAmount.toLocaleString()} 
                              (Sisa: Rp {(allocation.allocatedAmount - allocation.spentAmount).toLocaleString()})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Sumber dana yang akan digunakan
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Transaction Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Detail Transaksi</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategori Pengeluaran</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih kategori" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(categoryConfig).map(([value, config]) => (
                            <SelectItem key={value} value={value}>
                              <div className="flex flex-col">
                                <span className="font-medium">{config.label}</span>
                                <span className="text-xs text-muted-foreground">
                                  {config.description}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Transaction Date */}
                <FormField
                  control={form.control}
                  name="transactionDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Tanggal Transaksi</FormLabel>
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
                              {field.value && field.value instanceof Date ? (
                                format(field.value, 'dd MMMM yyyy', { locale: localeId })
                              ) : (
                                <span>Pilih tanggal</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value instanceof Date ? field.value : undefined}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Tanggal pengeluaran dilakukan
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Amount */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah Pengeluaran (Rp)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="5000000"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Total nominal yang dikeluarkan dalam Rupiah
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi Transaksi</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Pembelian bahan makanan: beras 100kg, telur 50kg, sayuran dan buah-buahan"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Detail apa saja yang dibeli/dibayar (maksimal 500 karakter)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Receipt Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Bukti Pembayaran (Opsional)</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Receipt Number */}
                <FormField
                  control={form.control}
                  name="receiptNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Nota/Kwitansi</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="INV-001/XI/2025"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Nomor yang tertera di nota pembayaran
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Receipt URL */}
                <FormField
                  control={form.control}
                  name="receiptUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link Bukti Nota</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input
                            placeholder="https://storage.googleapis.com/..."
                            {...field}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => alert('Fitur upload akan segera tersedia')}
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormDescription>
                        URL file foto/PDF nota (TODO: Upload feature)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catatan Tambahan</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Catatan internal untuk referensi (opsional)"
                        className="min-h-[60px]"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Catatan tambahan untuk keperluan internal
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  size="lg"
                >
                  Batal
                </Button>
              )}
              <Button 
                type="submit" 
                disabled={isSubmitting}
                size="lg"
              >
                {isSubmitting ? 'Menyimpan...' : mode === 'create' ? 'Simpan Transaksi' : 'Perbarui Transaksi'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
