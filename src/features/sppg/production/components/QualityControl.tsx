/**
 * @fileoverview Quality Control Management Component
 * @version Next.js 15.5.4 / shadcn/ui / TanStack Query
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import {
  Plus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Thermometer,
  Eye,
  Utensils,
  Shield,
  Award,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAddQualityCheck, useQualityChecks } from '../hooks/useProductions'
import { qualityCheckCreateSchema } from '../schemas'
import { formatDateTime } from '../lib'
import type { QualityCheckCreateInput } from '../schemas'

// ============================================================================
// Types
// ============================================================================

type QualityCheckType = 'TEMPERATURE' | 'HYGIENE' | 'TASTE' | 'APPEARANCE' | 'SAFETY'
type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

interface QualityControlProps {
  productionId: string
  className?: string
}

interface QualityCheck {
  id: string
  checkType: string
  parameter: string
  expectedValue?: string | null
  actualValue: string
  passed: boolean
  score?: number | null
  severity?: string | null
  notes?: string | null
  recommendations?: string | null
  actionRequired?: boolean | null
  actionTaken?: string | null
  checkTime: Date
  checkedBy: string
  user?: {
    id: string
    name: string
    email: string
    userRole: string | null
  }
}

// ============================================================================
// Constants
// ============================================================================

const CHECK_TYPES: { 
  value: QualityCheckType
  label: string
  icon: typeof Thermometer
  parameterExample: string
  expectedValueExample: string
  actualValueExample: string
}[] = [
  { 
    value: 'TEMPERATURE', 
    label: 'Suhu', 
    icon: Thermometer,
    parameterExample: 'Suhu makanan saat disajikan',
    expectedValueExample: '≥ 60°C',
    actualValueExample: '65°C'
  },
  { 
    value: 'HYGIENE', 
    label: 'Kebersihan', 
    icon: Shield,
    parameterExample: 'Kebersihan area dapur',
    expectedValueExample: 'Tidak ada kontaminasi',
    actualValueExample: 'Bersih'
  },
  { 
    value: 'TASTE', 
    label: 'Rasa', 
    icon: Utensils,
    parameterExample: 'Rasa makanan',
    expectedValueExample: 'Sesuai resep standar',
    actualValueExample: 'Sesuai'
  },
  { 
    value: 'APPEARANCE', 
    label: 'Penampilan', 
    icon: Eye,
    parameterExample: 'Penampilan visual makanan',
    expectedValueExample: 'Menarik dan rapi',
    actualValueExample: 'Sangat baik'
  },
  { 
    value: 'SAFETY', 
    label: 'Keamanan', 
    icon: Award,
    parameterExample: 'Keamanan pangan',
    expectedValueExample: 'Tidak ada bahaya',
    actualValueExample: 'Aman'
  },
]

const SEVERITY_LEVELS: { value: Severity; label: string; className: string }[] = [
  { value: 'LOW', label: 'Rendah', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' },
  { value: 'MEDIUM', label: 'Sedang', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' },
  { value: 'HIGH', label: 'Tinggi', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300' },
  { value: 'CRITICAL', label: 'Kritis', className: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' },
]

// ============================================================================
// Helper Functions
// ============================================================================

function getCheckTypeIcon(type: string) {
  const checkType = CHECK_TYPES.find((t) => t.value === type)
  return checkType?.icon || Shield
}

function getCheckTypeLabel(type: string) {
  const checkType = CHECK_TYPES.find((t) => t.value === type)
  return checkType?.label || type
}

function getSeverityLabel(severity: string) {
  const severityLevel = SEVERITY_LEVELS.find((s) => s.value === severity)
  return severityLevel?.label || severity
}

function getSeverityClassName(severity: string) {
  const severityLevel = SEVERITY_LEVELS.find((s) => s.value === severity)
  return severityLevel?.className || ''
}

function getRoleLabel(role: string): string {
  const roleLabels: Record<string, string> = {
    'SPPG_STAFF_QC': 'Staff QC',
    'SPPG_PRODUKSI_MANAGER': 'Manager Produksi',
    'SPPG_KEPALA': 'Kepala SPPG',
    'SPPG_ADMIN': 'Admin SPPG',
    'SPPG_AHLI_GIZI': 'Ahli Gizi',
    'SPPG_STAFF_DAPUR': 'Staff Dapur',
    'SPPG_STAFF_DISTRIBUSI': 'Staff Distribusi',
  }
  return roleLabels[role] || role
}

function calculateOverallScore(checks: QualityCheck[]): number {
  const scoresWithValues = checks.filter((c) => c.score !== null && c.score !== undefined)
  if (scoresWithValues.length === 0) return 0

  const totalScore = scoresWithValues.reduce((sum, c) => sum + (c.score || 0), 0)
  return Math.round(totalScore / scoresWithValues.length)
}

// ============================================================================
// Add Quality Check Dialog
// ============================================================================

function AddQualityCheckDialog({
  open,
  onOpenChange,
  productionId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  productionId: string
}) {
  const { mutate: addCheck, isPending } = useAddQualityCheck()

  const form = useForm<QualityCheckCreateInput>({
    resolver: zodResolver(qualityCheckCreateSchema),
    defaultValues: {
      checkType: 'TEMPERATURE',
      parameter: '',
      expectedValue: '',
      actualValue: '',
      passed: true,
      score: undefined,
      severity: undefined,
      notes: '',
      recommendations: '',
      actionRequired: false,
      actionTaken: '',
    },
  })

  // Get current check type for dynamic placeholders
  const currentCheckType = form.watch('checkType')
  const selectedType = CHECK_TYPES.find(t => t.value === currentCheckType)

  const onSubmit = (data: QualityCheckCreateInput) => {
    addCheck(
      { productionId, data },
      {
        onSuccess: () => {
          form.reset()
          onOpenChange(false)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Quality Check</DialogTitle>
          <DialogDescription>Tambahkan pemeriksaan kualitas baru untuk produksi ini</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
          {/* Info Card */}
          {selectedType && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 font-medium">
                {(() => {
                  const Icon = selectedType.icon
                  return <Icon className="h-5 w-5 text-primary" />
                })()}
                <span>Pemeriksaan {selectedType.label}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {currentCheckType === 'TEMPERATURE' && 'Periksa suhu makanan untuk memastikan keamanan dan kualitas'}
                {currentCheckType === 'HYGIENE' && 'Periksa kebersihan area produksi, peralatan, dan personel'}
                {currentCheckType === 'TASTE' && 'Periksa rasa, tekstur, dan kematangan makanan'}
                {currentCheckType === 'APPEARANCE' && 'Periksa penampilan visual, warna, dan penyajian makanan'}
                {currentCheckType === 'SAFETY' && 'Periksa keamanan pangan dan tidak ada kontaminasi'}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                <Shield className="h-3 w-3" />
                <span>
                  <strong>Catatan:</strong> Quality Control sebaiknya dilakukan oleh <strong>Staff QC</strong> atau <strong>Manager Produksi</strong>
                </span>
              </div>
            </div>
          )}

          {/* Check Type & Parameter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkType">Tipe Pemeriksaan</Label>
              <Select
                value={form.watch('checkType')}
                onValueChange={(value) => form.setValue('checkType', value as QualityCheckType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe" />
                </SelectTrigger>
                <SelectContent>
                  {CHECK_TYPES.map((type) => {
                    const Icon = type.icon
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              {form.formState.errors.checkType && (
                <p className="text-sm text-destructive">{form.formState.errors.checkType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="parameter">Parameter Pemeriksaan</Label>
              <Input
                id="parameter"
                {...form.register('parameter')}
                placeholder={selectedType?.parameterExample || 'Contoh: Suhu makanan'}
              />
              {form.formState.errors.parameter && (
                <p className="text-sm text-destructive">{form.formState.errors.parameter.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Jelaskan apa yang diperiksa. Contoh: {selectedType?.parameterExample}
              </p>
            </div>
          </div>

          {/* Values */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expectedValue">Nilai yang Diharapkan (Opsional)</Label>
              <Input
                id="expectedValue"
                {...form.register('expectedValue')}
                placeholder={selectedType?.expectedValueExample || 'Contoh: ≥ 60°C'}
              />
              <p className="text-xs text-muted-foreground">
                Standar yang harus dipenuhi. Contoh: {selectedType?.expectedValueExample}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="actualValue">Nilai Aktual (Hasil Pemeriksaan)</Label>
              <Input
                id="actualValue"
                {...form.register('actualValue')}
                placeholder={selectedType?.actualValueExample || 'Contoh: 65°C'}
              />
              {form.formState.errors.actualValue && (
                <p className="text-sm text-destructive">{form.formState.errors.actualValue.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Hasil yang didapat. Contoh: {selectedType?.actualValueExample}
              </p>
            </div>
          </div>

          {/* Passed & Score */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="passed">Status Pemeriksaan</Label>
              <Select
                value={form.watch('passed') ? 'true' : 'false'}
                onValueChange={(value) => form.setValue('passed', value === 'true')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>✅ Lulus</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="false">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span>❌ Tidak Lulus</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Apakah hasil sesuai standar?
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="score">Skor (0-100) (Opsional)</Label>
              <Input
                id="score"
                type="number"
                min="0"
                max="100"
                {...form.register('score', { valueAsNumber: true })}
                placeholder="85"
              />
              {form.formState.errors.score && (
                <p className="text-sm text-destructive">{form.formState.errors.score.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Nilai kualitas 0-100
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Tingkat Keparahan (Opsional)</Label>
              <Select
                value={form.watch('severity') || 'LOW'}
                onValueChange={(value) => form.setValue('severity', value as Severity)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tingkat" />
                </SelectTrigger>
                <SelectContent>
                  {SEVERITY_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Seberapa serius masalah ini?
              </p>
            </div>
          </div>

          <Separator />

          {/* Notes & Recommendations */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Catatan</Label>
              <Textarea
                id="notes"
                rows={3}
                {...form.register('notes')}
                placeholder="Catatan tambahan tentang pemeriksaan..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recommendations">Rekomendasi</Label>
              <Textarea
                id="recommendations"
                rows={3}
                {...form.register('recommendations')}
                placeholder="Rekomendasi perbaikan atau tindakan..."
              />
            </div>
          </div>

          {/* Action Required */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="actionRequired"
                {...form.register('actionRequired')}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="actionRequired" className="cursor-pointer">
                Tindakan diperlukan
              </Label>
            </div>

            {form.watch('actionRequired') && (
              <div className="space-y-2">
                <Label htmlFor="actionTaken">Tindakan yang Diambil</Label>
                <Textarea
                  id="actionTaken"
                  rows={2}
                  {...form.register('actionTaken')}
                  placeholder="Deskripsi tindakan yang telah diambil..."
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Menyimpan...' : 'Simpan Quality Check'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function QualityControl({ productionId, className }: QualityControlProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const { data: checks = [], isLoading, isFetching, dataUpdatedAt } = useQualityChecks(productionId)

  // Debug logging
  console.log('[QualityControl] Render:', {
    productionId,
    checksCount: checks.length,
    isLoading,
    isFetching,
    dataUpdatedAt: new Date(dataUpdatedAt).toISOString(),
  })

  const overallScore = calculateOverallScore(checks)
  const passedChecks = checks.filter((c) => c.passed).length
  const totalChecks = checks.length
  const failedChecks = totalChecks - passedChecks

  return (
    <>
      <Card className={cn('w-full', className)}>
        <CardHeader className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-xl flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Quality Control
              </CardTitle>
              <CardDescription>Pemeriksaan kualitas produksi makanan</CardDescription>
            </div>
            <Button onClick={() => setShowAddDialog(true)} size="sm" className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Check
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Statistics */}
          {checks.length > 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-900/10 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Skor Keseluruhan</p>
                    <Award className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{overallScore}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">dari 100</p>
                </div>
                <div className="p-4 border rounded-lg bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/20 dark:to-slate-900/10">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-muted-foreground">Total Pemeriksaan</p>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-3xl font-bold">{totalChecks}</p>
                  <p className="text-xs text-muted-foreground mt-1">checks dilakukan</p>
                </div>
                <div className="p-4 border rounded-lg bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-900/10 border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-green-700 dark:text-green-300">Lulus</p>
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-100">{passedChecks}</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">pemeriksaan</p>
                </div>
                <div className="p-4 border rounded-lg bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-900/10 border-red-200 dark:border-red-800">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-red-700 dark:text-red-300">Tidak Lulus</p>
                    <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <p className="text-3xl font-bold text-red-900 dark:text-red-100">{failedChecks}</p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">pemeriksaan</p>
                </div>
              </div>
              <Separator />
            </div>
          )}

          {/* Quality Checks Table */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Memuat data quality check...</div>
          ) : checks.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Belum ada quality check</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Quality Check Pertama
              </Button>
            </div>
          ) : (
            <div className="space-y-4 relative">
              {/* Fetching Indicator */}
              {isFetching && (
                <div className="absolute top-0 right-0 z-10">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-full text-xs text-blue-700 dark:text-blue-300">
                    <div className="h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    Memperbarui...
                  </div>
                </div>
              )}
              
              {/* Info Header */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Informasi Quality Control
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Setiap pemeriksaan dicatat atas nama <strong>user yang sedang login</strong>. 
                    Pastikan Quality Control dilakukan oleh <strong>Staff QC</strong> atau <strong>Manager Produksi</strong> yang memiliki wewenang untuk melakukan pemeriksaan kualitas.
                  </p>
                </div>
              </div>

              {/* Table Container with Horizontal Scroll */}
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[140px]">Tipe</TableHead>
                      <TableHead className="min-w-[200px]">Parameter</TableHead>
                      <TableHead className="min-w-[120px]">Nilai</TableHead>
                      <TableHead className="min-w-[100px]">Status</TableHead>
                      <TableHead className="min-w-[80px]">Skor</TableHead>
                      <TableHead className="min-w-[120px]">Tingkat</TableHead>
                      <TableHead className="min-w-[180px]">Waktu</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                  {checks.map((check) => {
                    const Icon = getCheckTypeIcon(check.checkType)
                    return (
                      <TableRow key={check.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{getCheckTypeLabel(check.checkType)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{check.parameter}</p>
                            {check.expectedValue && (
                              <p className="text-xs text-muted-foreground">
                                Target: {check.expectedValue}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-semibold">{check.actualValue}</p>
                        </TableCell>
                        <TableCell>
                          {check.passed ? (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Lulus
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                              <XCircle className="h-3 w-3 mr-1" />
                              Tidak Lulus
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {check.score !== null && check.score !== undefined ? (
                            <span className="font-semibold">{check.score}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {check.severity ? (
                            <Badge className={getSeverityClassName(check.severity)}>
                              {check.severity === 'CRITICAL' && (
                                <AlertTriangle className="h-3 w-3 mr-1" />
                              )}
                              {getSeverityLabel(check.severity)}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{formatDateTime(check.checkTime)}</p>
                            {check.user ? (
                              <div className="flex flex-col gap-0.5">
                                <p className="text-xs font-medium text-foreground">{check.user.name}</p>
                                {check.user.userRole && (
                                  <Badge variant="outline" className="w-fit text-xs px-1.5 py-0">
                                    {getRoleLabel(check.user.userRole)}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground">ID: {check.checkedBy}</p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
            </div>
          )}

          {/* Action Required Alerts */}
          {checks.some((c) => c.actionRequired && !c.actionTaken) && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  Tindakan Diperlukan
                </p>
                {checks
                  .filter((c) => c.actionRequired && !c.actionTaken)
                  .map((check) => (
                    <div
                      key={check.id}
                      className="p-3 border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20 rounded-lg"
                    >
                      <p className="text-sm font-medium">
                        {getCheckTypeLabel(check.checkType)} - {check.parameter}
                      </p>
                      {check.recommendations && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Rekomendasi: {check.recommendations}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <AddQualityCheckDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        productionId={productionId}
      />
    </>
  )
}
