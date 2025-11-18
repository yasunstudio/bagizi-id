/**
 * @fileoverview Section 3: Kelompok Sasaran & Penerima Manfaat
 * Form section dengan conditional rendering berdasarkan target group
 * UPDATED: Multi-target support - filters options based on program configuration
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

'use client'

import {
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Users, AlertCircle, Info } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'
import { TargetGroup } from '@prisma/client'
import { FORM_LABELS } from '../../../lib/enrollmentFormLabels'
import { getTargetGroupOptions, getTargetGroupConfig } from '../../../lib/targetGroupConfig'
import { CreateBeneficiaryEnrollmentInput } from '../../../schemas/beneficiaryEnrollmentSchema'
import { 
  getAllowedTargetGroups, 
  isProgramAllowingTargetGroup
} from '@/lib/programValidation'
import { ProgramTypeDisplay } from '../../ProgramTypeDisplay'
import type { Program } from '../../../types/program.types'

interface TargetGroupSectionProps {
  form: UseFormReturn<CreateBeneficiaryEnrollmentInput>
  selectedProgram?: Program | null
  isLoadingProgram?: boolean
}

export function TargetGroupSection({ form, selectedProgram, isLoadingProgram }: TargetGroupSectionProps) {
  const targetGroupOptions = getTargetGroupOptions()
  const selectedTargetGroup = form.watch('targetGroup') as TargetGroup | undefined
  const targetGroupConfig = selectedTargetGroup
    ? getTargetGroupConfig(selectedTargetGroup)
    : null

  // ✅ SIMPLIFIED (Nov 11, 2025): Multi-target support with unified approach
  const allowedGroups = selectedProgram 
    ? getAllowedTargetGroups(selectedProgram)
    : targetGroupOptions.map(opt => opt.value as TargetGroup)

  const filteredOptions = targetGroupOptions.filter(option =>
    allowedGroups.includes(option.value as TargetGroup)
  )

  // Validation: Check if selected target group is allowed by program
  const isSelectedGroupAllowed = selectedTargetGroup && selectedProgram
    ? isProgramAllowingTargetGroup(selectedProgram, selectedTargetGroup)
    : true

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-green-500/10 p-2">
          <Users className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">
            {FORM_LABELS.sections.targetGroup}
          </h3>
          <p className="text-sm text-muted-foreground">
            Kelompok sasaran dan jumlah penerima manfaat
          </p>
        </div>
      </div>

      {/* ✅ IMPROVED: Combined Program Configuration & Target Group Display */}
      {selectedProgram && (
        <Alert className="border-primary/20 bg-primary/5">
          <Info className="h-4 w-4 text-primary" />
          <AlertDescription className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Konfigurasi Program:</span>
              <ProgramTypeDisplay
                allowedTargetGroups={selectedProgram.allowedTargetGroups}
                variant="text"
                showIcon={false}
              />
            </div>
            {selectedProgram.allowedTargetGroups.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedProgram.allowedTargetGroups.map((group) => {
                  const config = getTargetGroupConfig(group as TargetGroup)
                  return config ? (
                    <div key={group} className="flex items-center gap-1.5 text-xs">
                      <span>{config.icon}</span>
                      <span className="font-medium">{config.label}</span>
                    </div>
                  ) : null
                })}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Target Group Selection */}
      <FormField
        control={form.control}
        name="targetGroup"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {FORM_LABELS.targetGroup.label} *
            </FormLabel>
            <Select 
              onValueChange={field.onChange} 
              value={field.value}
              disabled={isLoadingProgram || !selectedProgram}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={
                    isLoadingProgram 
                      ? "Memuat konfigurasi program..."
                      : !selectedProgram
                      ? "Pilih program terlebih dahulu"
                      : FORM_LABELS.targetGroup.placeholder
                  } />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {filteredOptions.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    Tidak ada kelompok target yang diizinkan untuk program ini
                  </div>
                ) : (
                  filteredOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <span>{option.icon}</span>
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <FormDescription>
              {selectedProgram 
                ? `Pilih dari ${filteredOptions.length} kelompok target yang diizinkan untuk program ini`
                : FORM_LABELS.targetGroup.description
              }
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ✅ SIMPLIFIED: Validation Error - Disallowed Target Group */}
      {selectedTargetGroup && selectedProgram && !isSelectedGroupAllowed && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Kelompok target <strong>{getTargetGroupConfig(selectedTargetGroup)?.label}</strong> tidak diizinkan untuk program ini.
            {selectedProgram.allowedTargetGroups && selectedProgram.allowedTargetGroups.length > 0 && (
              <> Program ini hanya mengizinkan: <strong>{selectedProgram.allowedTargetGroups.map(g => getTargetGroupConfig(g as TargetGroup)?.label).join(', ')}</strong></>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Beneficiary Counts */}
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="targetBeneficiaries"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {targetGroupConfig?.beneficiaryLabel || FORM_LABELS.targetBeneficiaries.label}
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder={FORM_LABELS.targetBeneficiaries.placeholder}
                  className="w-full"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                {FORM_LABELS.targetBeneficiaries.description}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="activeBeneficiaries"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{FORM_LABELS.activeBeneficiaries.label}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder={FORM_LABELS.activeBeneficiaries.placeholder}
                  className="w-full"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                {FORM_LABELS.activeBeneficiaries.description}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Gender Breakdown - CONDITIONAL: Only for target groups where gender matters */}
      {selectedTargetGroup && ![
        'PREGNANT_WOMAN',      // 100% female
        'BREASTFEEDING_MOTHER', // 100% female
      ].includes(selectedTargetGroup) && (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Distribusi Berdasarkan Jenis Kelamin</h4>
            <p className="text-sm text-muted-foreground">
              Rincian penerima manfaat berdasarkan jenis kelamin (opsional)
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="maleBeneficiaries"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Laki-laki</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      className="w-full"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormDescription>
                    Jumlah penerima manfaat laki-laki
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="femaleBeneficiaries"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Perempuan</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      className="w-full"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormDescription>
                    Jumlah penerima manfaat perempuan
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      )}

      {/* Age Groups - UNIVERSAL: Standard age breakdown for nutrition calculation */}
      <div className="space-y-4">
        <div>
          <h4 className="font-medium flex items-center gap-2">
            {FORM_LABELS.ageBreakdown.header}
            <span className="text-xs font-normal text-muted-foreground">(untuk perhitungan standar nutrisi)</span>
          </h4>
          <p className="text-sm text-muted-foreground">
            {FORM_LABELS.ageBreakdown.description}
          </p>
        </div>

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Penting:</strong> Data distribusi usia ini digunakan untuk menghitung kebutuhan nutrisi sesuai dengan{' '}
            <strong>Standar Gizi Nasional</strong>. Setiap kelompok usia memiliki kebutuhan kalori, protein, dan nutrisi yang berbeda.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="beneficiaries0to2Years"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{FORM_LABELS.ageBreakdown.beneficiaries0to2}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={FORM_LABELS.ageBreakdown.placeholder}
                    className="w-full"
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
            name="beneficiaries2to5Years"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{FORM_LABELS.ageBreakdown.beneficiaries2to5}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={FORM_LABELS.ageBreakdown.placeholder}
                    className="w-full"
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
            name="beneficiaries6to12Years"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{FORM_LABELS.ageBreakdown.beneficiaries6to12}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={FORM_LABELS.ageBreakdown.placeholder}
                    className="w-full"
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
            name="beneficiaries13to15Years"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{FORM_LABELS.ageBreakdown.beneficiaries13to15}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={FORM_LABELS.ageBreakdown.placeholder}
                    className="w-full"
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
            name="beneficiaries16to18Years"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{FORM_LABELS.ageBreakdown.beneficiaries16to18}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={FORM_LABELS.ageBreakdown.placeholder}
                    className="w-full"
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
            name="beneficiariesAbove18"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{FORM_LABELS.ageBreakdown.beneficiariesAbove18}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={FORM_LABELS.ageBreakdown.placeholder}
                    className="w-full"
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
      </div>

      {/* Age Breakdown - Target Specific: Conditional rendering based on target group */}
      {selectedTargetGroup && targetGroupConfig && targetGroupConfig.ageRanges.length > 0 && (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium flex items-center gap-2">
              {targetGroupConfig.ageBreakdownLabel}
              <span className="text-xs font-normal text-muted-foreground">(data spesifik kelompok target)</span>
            </h4>
            <p className="text-sm text-muted-foreground">
              Distribusi detail penerima manfaat berdasarkan kategori spesifik (opsional)
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {targetGroupConfig.ageRanges.map((ageRange) => (
              <FormItem key={ageRange.key}>
                <FormLabel>{ageRange.label}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    className="w-full"
                    value={
                      (form.watch('targetGroupSpecificData')?.[ageRange.key] as number) || ''
                    }
                    onChange={(e) => {
                      const currentData = form.getValues('targetGroupSpecificData') || {}
                      const newValue = e.target.value ? Number(e.target.value) : undefined
                      form.setValue('targetGroupSpecificData', {
                        ...currentData,
                        [ageRange.key]: newValue,
                      })
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
