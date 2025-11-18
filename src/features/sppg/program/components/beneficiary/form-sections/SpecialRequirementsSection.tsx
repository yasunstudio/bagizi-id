/**
 * @fileoverview Section 9: Kebutuhan Khusus
 * Form section untuk kebutuhan diet khusus, alergen, dan pertimbangan medis
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
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'
import { FORM_LABELS } from '../../../lib/enrollmentFormLabels'
import { CreateBeneficiaryEnrollmentInput } from '../../../schemas/beneficiaryEnrollmentSchema'

interface SpecialRequirementsSectionProps {
  form: UseFormReturn<CreateBeneficiaryEnrollmentInput>
}

export function SpecialRequirementsSection({ form }: SpecialRequirementsSectionProps) {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-red-500/10 p-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">
            {FORM_LABELS.sections.specialRequirements}
          </h3>
          <p className="text-sm text-muted-foreground">
            Kebutuhan khusus yang perlu diperhatikan dalam program
          </p>
        </div>
      </div>

      {/* Special Dietary Needs */}
      <FormField
        control={form.control}
        name="specialDietaryNeeds"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{FORM_LABELS.specialDietaryNeeds.label}</FormLabel>
            <FormControl>
              <Textarea
                placeholder={FORM_LABELS.specialDietaryNeeds.placeholder}
                className="min-h-[80px]"
                {...field}
                value={field.value ?? ''}
              />
            </FormControl>
            <FormDescription>
              {FORM_LABELS.specialDietaryNeeds.description}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Allergen Restrictions */}
      <FormField
        control={form.control}
        name="allergenRestrictions"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{FORM_LABELS.allergenRestrictions.label}</FormLabel>
            <FormControl>
              <Textarea
                placeholder={FORM_LABELS.allergenRestrictions.placeholder}
                className="min-h-[80px]"
                {...field}
                value={field.value ?? ''}
              />
            </FormControl>
            <FormDescription>
              {FORM_LABELS.allergenRestrictions.description}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Medical Considerations */}
      <FormField
        control={form.control}
        name="medicalConsiderations"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{FORM_LABELS.medicalConsiderations.label}</FormLabel>
            <FormControl>
              <Textarea
                placeholder={FORM_LABELS.medicalConsiderations.placeholder}
                className="min-h-[80px]"
                {...field}
                value={field.value ?? ''}
              />
            </FormControl>
            <FormDescription>
              {FORM_LABELS.medicalConsiderations.description}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Cultural Preferences */}
      <FormField
        control={form.control}
        name="culturalPreferences"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{FORM_LABELS.culturalPreferences.label}</FormLabel>
            <FormControl>
              <Textarea
                placeholder={FORM_LABELS.culturalPreferences.placeholder}
                className="min-h-[80px]"
                {...field}
                value={field.value ?? ''}
              />
            </FormControl>
            <FormDescription>
              {FORM_LABELS.culturalPreferences.description}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Program-Specific Configuration */}
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="programFocus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fokus Program</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Contoh: Pencegahan stunting, Peningkatan gizi ibu hamil"
                  className="min-h-[80px]"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormDescription>
                Area fokus khusus dari program ini
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="supplementaryServices"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Layanan Tambahan</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Contoh: Konseling gizi, Pemeriksaan kesehatan rutin"
                  className="min-h-[80px]"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormDescription>
                Layanan pendukung yang disediakan selain pemberian makanan
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
