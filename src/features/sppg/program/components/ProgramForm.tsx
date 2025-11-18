/**
 * @fileoverview ProgramForm Component - Create/Edit Program Form
 * @version Next.js 15.5.4 / React Hook Form + Zod
 * @author Bagizi-ID Development Team
 */

'use client'

import { type FC, useCallback, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import { SafeSelect, SelectItem as SafeSelectItem } from '@/components/ui/safe-select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { 
  CalendarIcon, 
  Info,
  Users,
  DollarSign,
  MapPin,
} from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { createProgramSchema, type CreateProgramInput } from '../schemas'
import type { Program } from '../types'
import { ProgramStatus, ProgramType, TargetGroup, BudgetSource } from '@prisma/client'
import { toast } from 'sonner'
import { TargetGroupSelector } from './TargetGroupSelector'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { InfoIcon } from 'lucide-react'
import { getTargetGroupLabel } from '../lib/programUtils'

interface ProgramFormProps {
  initialData?: Program
  onSubmit: (data: CreateProgramInput) => void | Promise<void>
  onCancel?: () => void
  isSubmitting?: boolean
  mode?: 'create' | 'edit'
}

export const ProgramForm: FC<ProgramFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode = 'create',
}) => {
  const form = useForm({
    resolver: zodResolver(createProgramSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      description: initialData.description ?? '',
      programCode: initialData.programCode,
      programType: initialData.programType,
      // ✅ SIMPLIFIED (Nov 11, 2025): Always use allowedTargetGroups array
      allowedTargetGroups: (initialData.allowedTargetGroups ?? []) as TargetGroup[],
      targetRecipients: initialData.targetRecipients,
      currentRecipients: initialData.currentRecipients ?? 0,
      // ❌ REMOVED (Phase 4 - Nov 8, 2025): Nutrition targets from NutritionStandard
      // calorieTarget, proteinTarget, carbTarget, fatTarget, fiberTarget
      mealsPerDay: initialData.mealsPerDay,
      feedingDays: initialData.feedingDays ?? [],
      startDate: initialData.startDate ? new Date(initialData.startDate) : undefined,
      endDate: initialData.endDate ? new Date(initialData.endDate) : undefined,
      
      // ✅ UPDATED (Nov 12, 2025): Budget fields
      totalBudget: initialData.totalBudget ?? undefined,
      budgetPerMeal: initialData.budgetPerMeal ?? undefined,
      budgetSource: initialData.budgetSource ?? BudgetSource.APBN_PUSAT,
      budgetYear: initialData.budgetYear ?? new Date().getFullYear(),
      dpaNumber: initialData.dpaNumber ?? undefined,
      dpaDate: initialData.dpaDate ? new Date(initialData.dpaDate) : undefined,
      apbnProgramCode: initialData.apbnProgramCode ?? undefined,
      budgetDecreeNumber: initialData.budgetDecreeNumber ?? undefined,
      budgetDecreeDate: initialData.budgetDecreeDate ? new Date(initialData.budgetDecreeDate) : undefined,
      budgetDecreeUrl: initialData.budgetDecreeUrl ?? undefined,
      foodBudget: initialData.foodBudget ?? undefined,
      operationalBudget: initialData.operationalBudget ?? undefined,
      transportBudget: initialData.transportBudget ?? undefined,
      utilityBudget: initialData.utilityBudget ?? undefined,
      staffBudget: initialData.staffBudget ?? undefined,
      otherBudget: initialData.otherBudget ?? undefined,
      budgetApprovalNotes: initialData.budgetApprovalNotes ?? undefined,
      
      status: initialData.status as ProgramStatus,
      implementationArea: initialData.implementationArea ?? '',
    } : {
      name: '',
      description: '',
      programCode: '',
      programType: ProgramType.FREE_NUTRITIOUS_MEAL,
      // ✅ SIMPLIFIED: Start with empty array, user must select at least 1
      allowedTargetGroups: [] as TargetGroup[],
      targetRecipients: 1,
      currentRecipients: 0,
      mealsPerDay: 1,
      feedingDays: [],
      
      // ✅ UPDATED (Nov 12, 2025): Budget fields with defaults
      totalBudget: undefined,
      budgetPerMeal: undefined,
      budgetSource: BudgetSource.APBN_PUSAT,
      budgetYear: new Date().getFullYear(),
      dpaNumber: undefined,
      dpaDate: undefined,
      apbnProgramCode: undefined,
      budgetDecreeNumber: undefined,
      budgetDecreeDate: undefined,
      budgetDecreeUrl: undefined,
      foodBudget: undefined,
      operationalBudget: undefined,
      transportBudget: undefined,
      utilityBudget: undefined,
      staffBudget: undefined,
      otherBudget: undefined,
      budgetApprovalNotes: undefined,
      
      status: ProgramStatus.DRAFT,
      implementationArea: '',
    }
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    // Validate with Zod schema before submitting
    const validated = createProgramSchema.safeParse(data)
    if (!validated.success) {
      console.error('Validation error:', validated.error)
      return
    }
    await onSubmit(validated.data)
  })

  // ✅ SIMPLIFIED (Nov 11, 2025): Only watch allowedTargetGroups
  const watchAllowedTargetGroups = form.watch('allowedTargetGroups')

  // Store form in ref to avoid dependency issues
  const formRef = useRef(form)
  useEffect(() => {
    formRef.current = form
  }, [form])

  // Stable onChange handlers using ref (NO dependencies to prevent re-creation)
  const handleProgramTypeChange = useCallback((value: string) => {
    formRef.current.setValue('programType', value as ProgramType, { shouldValidate: true })
  }, [])

  const handleStatusChange = useCallback((value: string) => {
    formRef.current.setValue('status', value as ProgramStatus, { shouldValidate: true })
  }, [])

  const handleMealsPerDayChange = useCallback((value: string) => {
    formRef.current.setValue('mealsPerDay', Number(value), { shouldValidate: true })
  }, [])

  const handleAllowedTargetGroupsChange = useCallback((value: TargetGroup[]) => {
    formRef.current.setValue('allowedTargetGroups', value, { shouldValidate: true })
  }, [])

  // NOTE: Fields are NOT auto-reset when toggling modes to prevent Select errors
  // User can manually clear fields if needed
  // This prevents "defaultValue must be scalar" error in Radix UI Select

  // Note: currentRecipients should be manually input or calculated from enrollments
  // To manage school enrollments, use the "Sekolah" tab after creating the program

  // Days of week for feeding schedule (0-6: Sunday to Saturday, ISO 8601 standard)
  const daysOfWeek = [
    { value: 1, label: 'Senin' },
    { value: 2, label: 'Selasa' },
    { value: 3, label: 'Rabu' },
    { value: 4, label: 'Kamis' },
    { value: 5, label: 'Jumat' },
    { value: 6, label: 'Sabtu' },
    { value: 0, label: 'Minggu' },
  ]

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Informasi Dasar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Program *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Program Gizi Balita 2025" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Nama yang jelas dan deskriptif untuk program
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="programCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode Program *</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="PRG12ABC" 
                          {...field}
                          className="font-mono"
                          style={{ textTransform: 'uppercase' }}
                        />
                        {mode === 'create' && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              // Generate 8-character random alphanumeric code
                              const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
                              let code = ''
                              for (let i = 0; i < 8; i++) {
                                code += chars.charAt(Math.floor(Math.random() * chars.length))
                              }
                              
                              form.setValue('programCode', code)
                              toast.success('Kode program berhasil dibuat')
                            }}
                            className="shrink-0"
                          >
                            Generate
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      {mode === 'create' 
                        ? 'Klik "Generate" untuk membuat kode unik 8 karakter secara otomatis'
                        : 'Kode unik 8 karakter untuk identifikasi program'
                      }
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Jelaskan tujuan dan detail program..."
                      rows={4}
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="programType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis Program *</FormLabel>
                    <Select 
                      value={field.value || ''} 
                      onValueChange={handleProgramTypeChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih jenis program" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="FREE_NUTRITIOUS_MEAL">
                          Makan Bergizi Gratis
                        </SelectItem>
                        <SelectItem value="NUTRITIONAL_RECOVERY">
                          Pemulihan Gizi
                        </SelectItem>
                        <SelectItem value="NUTRITIONAL_EDUCATION">
                          Edukasi Gizi
                        </SelectItem>
                        <SelectItem value="EMERGENCY_NUTRITION">
                          Gizi Darurat
                        </SelectItem>
                        <SelectItem value="STUNTING_INTERVENTION">
                          Intervensi Stunting
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator className="my-6" />

            {/* Multi-Target Configuration Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Konfigurasi Target Penerima</h3>
                <p className="text-sm text-muted-foreground">
                  Tentukan apakah program ini untuk satu kelompok spesifik atau bisa melayani berbagai kelompok sasaran
                </p>
              </div>

              {/* ✅ SIMPLIFIED (Nov 11, 2025): Target Groups Selection (Always Multi-Select) */}
              <div className="space-y-4">
                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Kelompok Sasaran:</strong> Pilih minimal 1 kelompok sasaran untuk program ini.
                    {watchAllowedTargetGroups && watchAllowedTargetGroups.length > 1
                      ? ` (Multi-target: ${watchAllowedTargetGroups.length} kelompok dipilih)`
                      : watchAllowedTargetGroups && watchAllowedTargetGroups.length === 1
                      ? ` (Single-target: 1 kelompok dipilih)`
                      : ' Belum ada kelompok dipilih.'}
                  </AlertDescription>
                </Alert>

                <FormField
                  control={form.control}
                  name="allowedTargetGroups"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kelompok Sasaran *</FormLabel>
                      <FormControl>
                        <TargetGroupSelector
                          value={Array.isArray(field.value) ? field.value : []}
                          onChange={handleAllowedTargetGroupsChange}
                            mode="checkbox"
                          />
                        </FormControl>
                        <FormDescription>
                          Pilih minimal 1 kelompok sasaran. Pilih 1 untuk single-target, atau 2+ untuk multi-target.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Show selection preview */}
                  {watchAllowedTargetGroups && watchAllowedTargetGroups.length > 0 && (
                    <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4 border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        {watchAllowedTargetGroups.length === 1 
                          ? `✓ Program single-target untuk: ${getTargetGroupLabel(watchAllowedTargetGroups[0])}`
                          : `✓ Program multi-target dengan ${watchAllowedTargetGroups.length} kelompok sasaran`}
                      </p>
                    </div>
                  )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Program</FormLabel>
                    <FormControl>
                      <SafeSelect
                        value={field.value}
                        onValueChange={handleStatusChange}
                        placeholder="Pilih status"
                        className="w-full"
                      >
                        <SafeSelectItem value={ProgramStatus.DRAFT}>
                          Draft
                        </SafeSelectItem>
                        <SafeSelectItem value={ProgramStatus.ACTIVE}>
                          Aktif
                        </SafeSelectItem>
                        <SafeSelectItem value={ProgramStatus.PAUSED}>
                          Ditunda
                        </SafeSelectItem>
                        <SafeSelectItem value={ProgramStatus.COMPLETED}>
                          Selesai
                        </SafeSelectItem>
                        <SafeSelectItem value={ProgramStatus.CANCELLED}>
                          Dibatalkan
                        </SafeSelectItem>
                        <SafeSelectItem value={ProgramStatus.ARCHIVED}>
                          Arsip
                        </SafeSelectItem>
                      </SafeSelect>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Target & Recipients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Target Penerima
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="targetRecipients"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah Target Penerima *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="500"
                      min={1}
                      max={100000}
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        // Convert to number, default to 1 if empty
                        const numValue = value === '' || value === '0' ? 1 : Number(value)
                        field.onChange(numValue)
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Target jumlah penerima manfaat program (minimal 1 orang)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Current Recipients (Auto-calculated) */}
            <FormField
              control={form.control}
              name="currentRecipients"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Jumlah Penerima Saat Ini (Otomatis)
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        {...field}
                        value={field.value || 0}
                        readOnly
                        disabled
                        className="bg-muted/50 cursor-not-allowed"
                      />
                    </div>
                  </FormControl>
                  <FormDescription className="flex items-center gap-2">
                    Input manual atau akan dihitung dari total siswa terdaftar di tab &quot;Sekolah&quot;
                    {(field.value ?? 0) > 0 && (
                      <span className="text-primary font-medium">
                        ({(((field.value ?? 0) / form.watch('targetRecipients')) * 100).toFixed(1)}% dari target)
                      </span>
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="implementationArea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Area Implementasi
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Kecamatan Menteng, Jakarta Pusat" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* ❌ REMOVED (Phase 4 - Nov 8, 2025): Nutrition Target Form Fields */}
        {/* Nutrition data now comes from NutritionStandard (read-only) */}
        {/* See ProgramNutritionTab for viewing nutrition standards */}

        {/* Schedule & Budget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Jadwal & Anggaran
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tanggal Mulai *</FormLabel>
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
                              format(field.value as Date, 'PPP', { locale: localeId })
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
                          disabled={(date) =>
                            date < new Date('1900-01-01')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tanggal Selesai</FormLabel>
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
                              format(field.value as Date, 'PPP', { locale: localeId })
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
                          disabled={(date) =>
                            date < new Date('1900-01-01')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="mealsPerDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frekuensi Makan per Hari *</FormLabel>
                    <FormControl>
                      <SafeSelect
                        value={field.value?.toString()}
                        onValueChange={handleMealsPerDayChange}
                        placeholder="Pilih frekuensi"
                        className="w-full"
                      >
                        <SafeSelectItem value="1">1x sehari</SafeSelectItem>
                        <SafeSelectItem value="2">2x sehari</SafeSelectItem>
                        <SafeSelectItem value="3">3x sehari</SafeSelectItem>
                      </SafeSelect>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="feedingDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hari Pemberian Makan</FormLabel>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {daysOfWeek.map((day) => {
                        const isSelected = field.value?.includes(day.value)
                        return (
                          <Badge
                            key={day.value}
                            variant={isSelected ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => {
                              const current = field.value || []
                              if (isSelected) {
                                field.onChange(current.filter((d) => d !== day.value))
                              } else {
                                field.onChange([...current, day.value].sort())
                              }
                            }}
                          >
                            {day.label}
                          </Badge>
                        )
                      })}
                    </div>
                    <FormDescription>
                      Klik untuk memilih/membatalkan hari
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Budget Section - UPDATED (Nov 12, 2025) */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Anggaran Program
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Detail anggaran program sesuai regulasi pemerintah
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="totalBudget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Total Anggaran (Rp) *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="3000000000"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>
                        Total anggaran program (REQUIRED)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="budgetPerMeal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Anggaran per Makan (Rp) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="15000"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>
                        Budget per porsi makan (REQUIRED)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="budgetYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tahun Anggaran *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="2025"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>
                        Tahun fiskal
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Budget Source & DPA */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="budgetSource"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sumber Anggaran</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih sumber anggaran" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={BudgetSource.APBN_PUSAT}>APBN Pusat</SelectItem>
                          <SelectItem value={BudgetSource.APBD_PROVINSI}>APBD Provinsi</SelectItem>
                          <SelectItem value={BudgetSource.APBD_KABUPATEN}>APBD Kabupaten</SelectItem>
                          <SelectItem value={BudgetSource.APBD_KOTA}>APBD Kota</SelectItem>
                          <SelectItem value={BudgetSource.HIBAH}>Hibah</SelectItem>
                          <SelectItem value={BudgetSource.APBN_DEKONSENTRASI}>APBN Dekonsentrasi</SelectItem>
                          <SelectItem value={BudgetSource.DAK}>DAK (Dana Alokasi Khusus)</SelectItem>
                          <SelectItem value={BudgetSource.MIXED}>Campuran (Mixed)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dpaNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor DPA</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="DPA-024.01.2025.XXX"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Dokumen Pelaksanaan Anggaran
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="apbnProgramCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kode Program APBN</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="024.01.2025.123"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Kode program (jika APBN)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Budget Decree */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="budgetDecreeNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor SK Penetapan</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="SK-XXX/2025/XXX"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Nomor SK penetapan anggaran
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="budgetDecreeUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL Dokumen SK</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://storage.example.com/sk.pdf"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Link dokumen SK (PDF)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Budget Breakdown */}
              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>
                  <strong>Breakdown Anggaran</strong>: Total breakdown harus sama dengan total anggaran (toleransi 1%)
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="foodBudget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Anggaran Bahan Makanan</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="2100000000"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>
                        60-75% dari total (rekomendasi)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="operationalBudget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Anggaran Operasional</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="450000000"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>
                        15-20% dari total
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="transportBudget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Anggaran Transport</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="210000000"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>
                        5-10% dari total
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="utilityBudget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Anggaran Utilitas</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="90000000"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>
                        3-5% dari total
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="staffBudget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Anggaran Tenaga</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="120000000"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>
                        5-7% dari total
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="otherBudget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Anggaran Lain-lain</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="30000000"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>
                        2-3% dari total
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Budget Approval Notes */}
              <FormField
                control={form.control}
                name="budgetApprovalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catatan Persetujuan</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Program telah disetujui sesuai SK..."
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Catatan persetujuan anggaran (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3 pt-4">
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
            {isSubmitting ? 'Menyimpan...' : mode === 'create' ? 'Buat Program' : 'Simpan Perubahan'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
