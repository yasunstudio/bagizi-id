/**
 * @fileoverview BanperRequestForm Component - Form untuk ajukan Banper Request
 * @version Next.js 15.5.4 / React Hook Form + Zod
 * @author Bagizi-ID Development Team
 * 
 * Form untuk membuat permintaan bantuan pemerintah (BANPER) melalui BGN Portal
 * Dapat dikaitkan dengan Program yang sudah ada atau buat standalone request
 */

'use client'

import { type FC, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter, useSearchParams } from 'next/navigation'
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
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Info,
  DollarSign,
  AlertCircle,
  FileText,
} from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { createBanperRequestSchema, type CreateBanperRequestInput } from '../schemas'
import { usePrograms } from '@/features/sppg/program/hooks'
import { toast } from 'sonner'

// Type for BANPER data (loose type for flexibility with API response)
type BanperData = Partial<CreateBanperRequestInput> & {
  id?: string
  createdAt?: Date | string
  updatedAt?: Date | string
  [key: string]: unknown
}

interface BanperRequestFormProps {
  initialData?: BanperData // Existing BANPER data for edit mode
  onSubmit: (data: CreateBanperRequestInput) => void | Promise<void>
  onCancel?: () => void
  isSubmitting?: boolean
  prefillProgramId?: string | null // Pre-fill from Program detail page
  mode?: 'create' | 'edit'
}

export const BanperRequestForm: FC<BanperRequestFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  prefillProgramId,
  mode = 'create',
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const programIdFromUrl = searchParams?.get('programId')
  
  // Fetch programs for dropdown
  const { data: programs = [], isLoading: loadingPrograms } = usePrograms({ 
    status: 'ACTIVE' 
  })

  const form = useForm<CreateBanperRequestInput>({
    resolver: zodResolver(createBanperRequestSchema),
    defaultValues: initialData ? {
      programId: initialData.programId ?? null,
      requestedAmount: initialData.requestedAmount ?? undefined,
      operationalPeriod: initialData.operationalPeriod ?? '',
      totalBeneficiaries: initialData.totalBeneficiaries ?? 1,
      foodCostTotal: initialData.foodCostTotal ?? 0,
      operationalCost: initialData.operationalCost ?? 0,
      transportCost: initialData.transportCost ?? 0,
      utilityCost: initialData.utilityCost ?? 0,
      staffCost: initialData.staffCost ?? 0,
      otherCosts: initialData.otherCosts ?? 0,
      dailyBudgetPerBeneficiary: initialData.dailyBudgetPerBeneficiary ?? undefined,
      operationalDays: initialData.operationalDays ?? 12,
      bgnRequestNumber: initialData.bgnRequestNumber ?? null,
      bgnPortalUrl: initialData.bgnPortalUrl ?? null,
      bgnSubmissionDate: initialData.bgnSubmissionDate ? new Date(initialData.bgnSubmissionDate) : null,
      proposalDocumentUrl: initialData.proposalDocumentUrl ?? null,
      rabDocumentUrl: initialData.rabDocumentUrl ?? null,
      supportingDocuments: initialData.supportingDocuments ?? [],
      internalNotes: initialData.internalNotes ?? null,
      bgnStatus: initialData.bgnStatus ?? 'DRAFT_LOCAL',
    } : {
      programId: prefillProgramId ?? programIdFromUrl ?? null,
      requestedAmount: undefined,
      operationalPeriod: '',
      totalBeneficiaries: 1,
      foodCostTotal: 0,
      operationalCost: 0,
      transportCost: 0,
      utilityCost: 0,
      staffCost: 0,
      otherCosts: 0,
      dailyBudgetPerBeneficiary: undefined,
      operationalDays: 12,
      bgnRequestNumber: null,
      bgnPortalUrl: null,
      bgnSubmissionDate: null,
      proposalDocumentUrl: null,
      rabDocumentUrl: null,
      supportingDocuments: [],
      internalNotes: null,
      bgnStatus: 'DRAFT_LOCAL',
    }
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    const validated = createBanperRequestSchema.safeParse(data)
    if (!validated.success) {
      console.error('Validation error:', validated.error)
      toast.error('Validasi gagal, periksa kembali form')
      return
    }
    await onSubmit(validated.data)
  })

  // Watch values for auto-calculation
  const watchFoodCost = form.watch('foodCostTotal')
  const watchOperationalCost = form.watch('operationalCost')
  const watchTransportCost = form.watch('transportCost')
  const watchUtilityCost = form.watch('utilityCost')
  const watchStaffCost = form.watch('staffCost')
  const watchOtherCosts = form.watch('otherCosts')
  const watchTotalBeneficiaries = form.watch('totalBeneficiaries')
  const watchOperationalDays = form.watch('operationalDays')

  // Auto-calculate requested amount
  useEffect(() => {
    const total = 
      (watchFoodCost ?? 0) +
      (watchOperationalCost ?? 0) +
      (watchTransportCost ?? 0) +
      (watchUtilityCost ?? 0) +
      (watchStaffCost ?? 0) +
      (watchOtherCosts ?? 0)
    
    form.setValue('requestedAmount', total)
  }, [watchFoodCost, watchOperationalCost, watchTransportCost, watchUtilityCost, watchStaffCost, watchOtherCosts, form])

  // Auto-calculate daily budget per beneficiary
  useEffect(() => {
    const total = form.getValues('requestedAmount') ?? 0
    const beneficiaries = watchTotalBeneficiaries ?? 1
    const days = watchOperationalDays ?? 12
    
    if (beneficiaries > 0 && days > 0 && total > 0) {
      const dailyBudget = total / (beneficiaries * days)
      form.setValue('dailyBudgetPerBeneficiary', dailyBudget)
    }
  }, [watchTotalBeneficiaries, watchOperationalDays, watchFoodCost, watchOperationalCost, form])

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>{mode === 'edit' ? 'Edit Permintaan BANPER' : 'Permintaan Bantuan Pemerintah (BANPER)'}</strong> - 
            {mode === 'edit' 
              ? ' Perbarui informasi permintaan bantuan anggaran yang sudah ada.'
              : ' Form ini untuk mengajukan permintaan bantuan anggaran dari pemerintah pusat melalui Portal BGN.'
            }
            {(prefillProgramId || programIdFromUrl) && mode === 'create' && (
              <span className="text-green-600 font-medium"> Request ini akan dikaitkan dengan program yang Anda pilih.</span>
            )}
          </AlertDescription>
        </Alert>

        {/* Link to Program */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Kaitkan dengan Program (Opsional)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="programId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Program Gizi</FormLabel>
                  <Select 
                    value={field.value ?? undefined} 
                    onValueChange={field.onChange}
                    disabled={loadingPrograms}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih program (opsional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="null">Tidak dikaitkan dengan program</SelectItem>
                      {programs.map((program) => (
                        <SelectItem key={program.id} value={program.id}>
                          {program.programCode} - {program.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Pilih program yang akan didanai oleh BANPER ini. Jika tidak dipilih, 
                    request akan dibuat secara standalone.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Budget Request Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Rincian Permintaan Anggaran
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="operationalPeriod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Periode Operasional *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="November - Desember 2025" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Contoh: &quot;November - Desember 2025&quot; atau &quot;Q4 2025&quot;
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="operationalDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah Hari Operasional *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="12"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Jumlah hari pemberian makanan (default: 12 hari/bulan)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="totalBeneficiaries"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Penerima Manfaat *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      placeholder="500"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Jumlah total penerima manfaat yang akan dilayani
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Cost Breakdown */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Rincian Biaya</h3>
                <Badge variant="outline">
                  Total: Rp {(form.watch('requestedAmount') ?? 0).toLocaleString('id-ID')}
                </Badge>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Total rincian biaya harus sama dengan jumlah yang diminta (toleransi 1%)
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="foodCostTotal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Biaya Makanan * (65-70%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="15000000"
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
                  name="operationalCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Biaya Operasional * (15-20%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="3000000"
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
                  name="transportCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Biaya Transportasi (5-10%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="1500000"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="utilityCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Biaya Utilitas (3-5%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="800000"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="staffCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Biaya Tenaga Kerja (3-5%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="1000000"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="otherCosts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Biaya Lainnya (0-2%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="200000"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Auto-calculated fields */}
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Permintaan:</span>
                  <span className="font-semibold">
                    Rp {(form.watch('requestedAmount') ?? 0).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Anggaran Harian per Penerima:</span>
                  <span className="font-semibold">
                    Rp {(form.watch('dailyBudgetPerBeneficiary') ?? 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Catatan Internal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="internalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Catatan internal untuk tim SPPG..."
                      rows={4}
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Catatan ini hanya untuk internal SPPG, tidak dikirim ke BGN
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel ?? (() => router.back())}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : mode === 'edit' ? 'Perbarui Data' : 'Simpan Draft'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
