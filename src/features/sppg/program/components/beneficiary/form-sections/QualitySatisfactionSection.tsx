/**
 * @fileoverview Section 8: Kualitas & Kepuasan
 * Form section untuk metrik kualitas dan feedback
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
import { Star } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'
import { FORM_LABELS } from '../../../lib/enrollmentFormLabels'
import { CreateBeneficiaryEnrollmentInput } from '../../../schemas/beneficiaryEnrollmentSchema'

interface QualitySatisfactionSectionProps {
  form: UseFormReturn<CreateBeneficiaryEnrollmentInput>
}

export function QualitySatisfactionSection({ form }: QualitySatisfactionSectionProps) {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-yellow-500/10 p-2">
          <Star className="h-5 w-5 text-yellow-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">
            {FORM_LABELS.sections.quality}
          </h3>
          <p className="text-sm text-muted-foreground">
            Penilaian kualitas dan kepuasan penerima manfaat
          </p>
        </div>
      </div>

      {/* Quality Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="satisfactionScore"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{FORM_LABELS.satisfactionScore.label}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  placeholder={FORM_LABELS.satisfactionScore.placeholder}
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                />
              </FormControl>
              <FormDescription>
                {FORM_LABELS.satisfactionScore.description}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="complaintCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{FORM_LABELS.complaintCount.label}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  placeholder={FORM_LABELS.complaintCount.placeholder}
                  {...field}
                  value={field.value ?? 0}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                {FORM_LABELS.complaintCount.description}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
