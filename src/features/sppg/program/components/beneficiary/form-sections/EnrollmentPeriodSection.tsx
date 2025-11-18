/**
 * @fileoverview Section 2: Periode Pendaftaran
 * Form section untuk menentukan periode enrollment
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
import { Calendar } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'
import { FORM_LABELS } from '../../../lib/enrollmentFormLabels'
import { CreateBeneficiaryEnrollmentInput } from '../../../schemas/beneficiaryEnrollmentSchema'

interface EnrollmentPeriodSectionProps {
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

export function EnrollmentPeriodSection({ form }: EnrollmentPeriodSectionProps) {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-blue-500/10 p-2">
          <Calendar className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">
            {FORM_LABELS.sections.enrollmentPeriod}
          </h3>
          <p className="text-sm text-muted-foreground">
            Tentukan periode aktif pendaftaran
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Enrollment Date */}
        <FormField
          control={form.control}
          name="enrollmentDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{FORM_LABELS.enrollmentDate.label}</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  placeholder={FORM_LABELS.enrollmentDate.placeholder}
                  {...field}
                  value={formatDateForInput(field.value)}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : new Date()
                    field.onChange(date)
                  }}
                />
              </FormControl>
              <FormDescription>
                {FORM_LABELS.enrollmentDate.description}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Start Date */}
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{FORM_LABELS.startDate.label}</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  placeholder={FORM_LABELS.startDate.placeholder}
                  {...field}
                  value={formatDateForInput(field.value)}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : new Date()
                    field.onChange(date)
                  }}
                />
              </FormControl>
              <FormDescription>
                {FORM_LABELS.startDate.description}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* End Date */}
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{FORM_LABELS.endDate.label}</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  placeholder={FORM_LABELS.endDate.placeholder}
                  {...field}
                  value={formatDateForInput(field.value)}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : undefined
                    field.onChange(date)
                  }}
                />
              </FormControl>
              <FormDescription>
                {FORM_LABELS.endDate.description}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
