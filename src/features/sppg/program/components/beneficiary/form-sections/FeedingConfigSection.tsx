/**
 * @fileoverview Section 4: Konfigurasi Pemberian Makan
 * Form section untuk jadwal dan frekuensi pemberian makan
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
import { Utensils } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'
import { FORM_LABELS } from '../../../lib/enrollmentFormLabels'
import { CreateBeneficiaryEnrollmentInput } from '../../../schemas/beneficiaryEnrollmentSchema'

interface FeedingConfigSectionProps {
  form: UseFormReturn<CreateBeneficiaryEnrollmentInput>
}

export function FeedingConfigSection({ form }: FeedingConfigSectionProps) {
  const mealsPerDay = form.watch('mealsPerDay') || 1

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-orange-500/10 p-2">
          <Utensils className="h-5 w-5 text-orange-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">
            {FORM_LABELS.sections.feedingConfig}
          </h3>
          <p className="text-sm text-muted-foreground">
            Jadwal dan frekuensi pemberian makan
          </p>
        </div>
      </div>

      {/* Feeding Schedule */}
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="feedingDays"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{FORM_LABELS.feedingDaysPerWeek.label}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  max="7"
                  placeholder={FORM_LABELS.feedingDaysPerWeek.placeholder}
                  {...field}
                  value={field.value ?? 5}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                {FORM_LABELS.feedingDaysPerWeek.description}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mealsPerDay"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{FORM_LABELS.mealsPerDay.label}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  max="3"
                  placeholder={FORM_LABELS.mealsPerDay.placeholder}
                  {...field}
                  value={field.value || 1}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                {FORM_LABELS.mealsPerDay.description}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Meal Times - Conditional based on mealsPerDay */}
      <div className="space-y-4">
        <div>
          <h4 className="font-medium">Waktu Pemberian Makan</h4>
          <p className="text-sm text-muted-foreground">
            Atur waktu pemberian makan sesuai jadwal
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Breakfast Time - Always show */}
          <FormField
            control={form.control}
            name="breakfastTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{FORM_LABELS.breakfastTime.label}</FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    placeholder={FORM_LABELS.breakfastTime.placeholder}
                    {...field}
                    value={field.value || '07:00'}
                  />
                </FormControl>
                <FormDescription>
                  {FORM_LABELS.breakfastTime.description}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Lunch Time - Show if >= 2 meals */}
          {mealsPerDay >= 2 && (
            <FormField
              control={form.control}
              name="lunchTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{FORM_LABELS.lunchTime.label}</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      placeholder={FORM_LABELS.lunchTime.placeholder}
                      {...field}
                      value={field.value || '12:00'}
                    />
                  </FormControl>
                  <FormDescription>
                    {FORM_LABELS.lunchTime.description}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Feeding Time - General time field */}
          <FormField
            control={form.control}
            name="feedingTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Waktu Pemberian Umum</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Contoh: Pagi, Siang, Sore"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormDescription>
                  Deskripsi umum waktu pemberian makan
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Snack Time - Optional */}
          <FormField
            control={form.control}
            name="snackTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{FORM_LABELS.snackTime.label}</FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    placeholder={FORM_LABELS.snackTime.placeholder}
                    {...field}
                    value={field.value || '10:00'}
                  />
                </FormControl>
                <FormDescription>
                  {FORM_LABELS.snackTime.description}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  )
}
