/**
 * @fileoverview Budget Allocation Form Component
 * @version Next.js 15.5.4 / shadcn/ui with Dark Mode
 * @author Bagizi-ID Development Team
 * 
 * Form untuk membuat atau mengedit alokasi anggaran program
 */

'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { BudgetSource } from '@prisma/client'

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
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { programBudgetAllocationCreateSchema } from '../lib/schemas'
import type { ProgramBudgetAllocationCreateInput } from '../lib/schemas'
import { usePrograms } from '@/features/sppg/program/hooks'
import { useBanperTrackings } from '../hooks'
import { cn } from '@/lib/utils'

interface BudgetAllocationFormProps {
  initialData?: Partial<ProgramBudgetAllocationCreateInput> & { id?: string }
  onSubmit: (data: ProgramBudgetAllocationCreateInput) => void
  onCancel?: () => void
  isSubmitting?: boolean
  mode?: 'create' | 'edit'
  prefillProgramId?: string
}

// Budget source labels - SESUAI DENGAN PRISMA SCHEMA
const budgetSourceLabels: Record<BudgetSource, string> = {
  APBN_PUSAT: 'APBN Pusat',
  APBN_DEKONSENTRASI: 'APBN Dekonsentrasi',
  APBD_PROVINSI: 'APBD Provinsi',
  APBD_KABUPATEN: 'APBD Kabupaten',
  APBD_KOTA: 'APBD Kota',
  HIBAH: 'Hibah',
  DAK: 'Dana Alokasi Khusus (DAK)',
  MIXED: 'Campuran Beberapa Sumber',
}

export function BudgetAllocationForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode = 'create',
  prefillProgramId,
}: BudgetAllocationFormProps) {
  const { data: programs, isLoading: isLoadingPrograms } = usePrograms()
  const { data: banperTrackings, isLoading: isLoadingBanper } = useBanperTrackings()

  const currentYear = new Date().getFullYear()

  const form = useForm({
    resolver: zodResolver(programBudgetAllocationCreateSchema),
    defaultValues: {
      programId: prefillProgramId || initialData?.programId || '',
      source: (initialData?.source || 'APBN_PUSAT') as BudgetSource,
      banperTrackingId: initialData?.banperTrackingId || null,
      allocatedAmount: initialData?.allocatedAmount || 0,
      allocatedDate: initialData?.allocatedDate || new Date(),
      fiscalYear: initialData?.fiscalYear || currentYear,
      decreeNumber: initialData?.decreeNumber || null,
      decreeDate: initialData?.decreeDate || null,
      decreeUrl: initialData?.decreeUrl || null,
      dpaNumber: initialData?.dpaNumber || null,
      dpaDate: initialData?.dpaDate || null,
      notes: initialData?.notes || null,
    },
  })

  // Update form when prefill changes
  useEffect(() => {
    if (prefillProgramId && !initialData?.programId) {
      form.setValue('programId', prefillProgramId)
    }
  }, [prefillProgramId, form, initialData?.programId])

  const selectedSource = form.watch('source')

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? 'Buat Alokasi Anggaran Baru' : 'Edit Alokasi Anggaran'}
        </CardTitle>
        <CardDescription>
          {mode === 'create' 
            ? 'Tambahkan alokasi anggaran baru untuk program SPPG' 
            : 'Perbarui informasi alokasi anggaran program'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Program Selection */}
            <FormField
              control={form.control}
              name="programId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Program <span className="text-destructive">*</span></FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={mode === 'edit' || !!prefillProgramId || isLoadingPrograms}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih program" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingPrograms ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : programs && programs.length > 0 ? (
                        programs.map((program) => (
                          <SelectItem key={program.id} value={program.id}>
                            {program.name} ({program.programCode})
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-4 text-sm text-muted-foreground text-center">
                          Tidak ada program tersedia
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Pilih program yang akan dialokasikan anggaran
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Budget Source & Amount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sumber Anggaran <span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih sumber" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(budgetSourceLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fiscalYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tahun Anggaran <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="2025"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="allocatedAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah Alokasi <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="100000000"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        disabled={mode === 'edit'}
                      />
                    </FormControl>
                    <FormDescription>
                      Dalam Rupiah (tanpa titik atau koma)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allocatedDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tanggal Alokasi <span className="text-destructive">*</span></FormLabel>
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
                              <span>Pilih tanggal</span>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Banper Tracking (optional for APBN PUSAT) */}
            {selectedSource === 'APBN_PUSAT' && (
              <FormField
                control={form.control}
                name="banperTrackingId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tracking Banper (Opsional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || undefined}
                      disabled={isLoadingBanper}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tracking banper (jika ada)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Tidak terkait banper</SelectItem>
                        {isLoadingBanper ? (
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        ) : banperTrackings && banperTrackings.length > 0 ? (
                          banperTrackings.map((tracking) => (
                            <SelectItem key={tracking.id} value={tracking.id}>
                              {tracking.bgnRequestNumber || 'Belum ada nomor'} - {tracking.program?.name || 'Program'}
                            </SelectItem>
                          ))
                        ) : null}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Hubungkan dengan tracking banper jika alokasi berasal dari permohonan banper
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Separator />

            {/* Decree Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Informasi SK (Surat Keputusan)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="decreeNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor SK</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123/SK/2025"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="decreeDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Tanggal SK</FormLabel>
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
                                <span>Pilih tanggal</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={(field.value as Date) || undefined}
                            onSelect={field.onChange}
                            locale={localeId}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="decreeUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Dokumen SK</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://example.com/sk.pdf"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Link ke dokumen SK (opsional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* DPA Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Informasi DPA (Dokumen Pelaksanaan Anggaran)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dpaNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor DPA</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="DPA-001/2025"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dpaDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Tanggal DPA</FormLabel>
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
                                <span>Pilih tanggal</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={(field.value as Date) || undefined}
                            onSelect={field.onChange}
                            locale={localeId}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Catatan tambahan tentang alokasi anggaran ini..."
                      className="min-h-[100px]"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Informasi tambahan yang relevan (maksimal 1000 karakter)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                  Batal
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'create' ? 'Simpan Alokasi' : 'Update Alokasi'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
