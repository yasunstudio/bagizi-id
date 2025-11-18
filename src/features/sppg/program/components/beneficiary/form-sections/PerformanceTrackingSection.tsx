/**
 * @fileoverview Section 7: Pemantauan Kinerja
 * Form section untuk tracking performa program
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
import { Input } from '@/components/ui/input'
import { TrendingUp } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'
import { FORM_LABELS } from '../../../lib/enrollmentFormLabels'
import { CreateBeneficiaryEnrollmentInput } from '../../../schemas/beneficiaryEnrollmentSchema'

interface PerformanceTrackingSectionProps {
  form: UseFormReturn<CreateBeneficiaryEnrollmentInput>
}

/**
 * Helper function to format date value for input field
 */
function formatDateForInput(value: unknown): string {
  if (!value) return ''
  
  if (value instanceof Date) {
    return value.toISOString().split('T')[0]
  }
  
  if (typeof value === 'string') {
    return value.split('T')[0]
  }
  
  return ''
}

export function PerformanceTrackingSection({ form }: PerformanceTrackingSectionProps) {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-purple-500/10 p-2">
          <TrendingUp className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">
            {FORM_LABELS.sections.performance}
          </h3>
          <p className="text-sm text-muted-foreground">
            Metrik kinerja dan pencapaian program
          </p>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="totalMealsServed"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{FORM_LABELS.totalMealsServed.label}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  placeholder={FORM_LABELS.totalMealsServed.placeholder}
                  {...field}
                  value={field.value ?? 0}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                {FORM_LABELS.totalMealsServed.description}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="totalBeneficiariesServed"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Penerima yang Terlayani</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  {...field}
                  value={field.value ?? 0}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                Jumlah total penerima manfaat yang telah dilayani
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Attendance & Compliance Rates */}
      <div className="grid gap-4 md:grid-cols-3">
        <FormField
          control={form.control}
          name="averageAttendanceRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{FORM_LABELS.attendanceRate.label}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder={FORM_LABELS.attendanceRate.placeholder}
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                />
              </FormControl>
              <FormDescription>
                {FORM_LABELS.attendanceRate.description}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nutritionComplianceRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tingkat Kepatuhan Gizi (%)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="0"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                />
              </FormControl>
              <FormDescription>
                Persentase kepatuhan terhadap standar gizi
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastMonitoringDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tanggal Monitoring Terakhir</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  value={formatDateForInput(field.value)}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : null
                    field.onChange(date)
                  }}
                />
              </FormControl>
              <FormDescription>
                Tanggal terakhir dilakukan monitoring
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Distribution Date */}
      <FormField
        control={form.control}
        name="lastDistributionDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tanggal Distribusi Terakhir</FormLabel>
            <FormControl>
              <Input
                type="date"
                {...field}
                value={formatDateForInput(field.value)}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : null
                  field.onChange(date)
                }}
              />
            </FormControl>
            <FormDescription>
              Tanggal terakhir makanan didistribusikan
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
