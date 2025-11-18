/**
 * @fileoverview Section 5: Konfigurasi Pengiriman
 * Form section untuk alamat dan detail pengiriman
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
import { Textarea } from '@/components/ui/textarea'
import { Truck } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'
import { FORM_LABELS } from '../../../lib/enrollmentFormLabels'
import { CreateBeneficiaryEnrollmentInput } from '../../../schemas/beneficiaryEnrollmentSchema'

interface DeliveryConfigSectionProps {
  form: UseFormReturn<CreateBeneficiaryEnrollmentInput>
}

export function DeliveryConfigSection({ form }: DeliveryConfigSectionProps) {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-blue-500/10 p-2">
          <Truck className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">
            {FORM_LABELS.sections.deliveryConfig}
          </h3>
          <p className="text-sm text-muted-foreground">
            Informasi alamat dan kontak pengiriman
          </p>
        </div>
      </div>

      {/* Delivery Address */}
      <FormField
        control={form.control}
        name="deliveryAddress"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{FORM_LABELS.deliveryAddress.label}</FormLabel>
            <FormControl>
              <Textarea
                placeholder={FORM_LABELS.deliveryAddress.placeholder}
                className="min-h-[100px]"
                {...field}
                value={field.value ?? ''}
              />
            </FormControl>
            <FormDescription>
              {FORM_LABELS.deliveryAddress.description}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Delivery Contact Details */}
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="deliveryContact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{FORM_LABELS.deliveryContactName.label}</FormLabel>
              <FormControl>
                <Input
                  placeholder={FORM_LABELS.deliveryContactName.placeholder}
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormDescription>
                {FORM_LABELS.deliveryContactName.description}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="deliveryPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{FORM_LABELS.deliveryContactPhone.label}</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder={FORM_LABELS.deliveryContactPhone.placeholder}
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormDescription>
                {FORM_LABELS.deliveryContactPhone.description}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Additional Delivery Configuration */}
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="preferredDeliveryTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Waktu Pengiriman yang Diinginkan</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Contoh: Pagi (07:00-09:00)"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormDescription>
                Rentang waktu pengiriman yang diinginkan
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="estimatedTravelTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimasi Waktu Tempuh (menit)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                />
              </FormControl>
              <FormDescription>
                Perkiraan waktu perjalanan dari dapur ke lokasi
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Delivery Instructions */}
      <FormField
        control={form.control}
        name="deliveryInstructions"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{FORM_LABELS.deliveryInstructions.label}</FormLabel>
            <FormControl>
              <Textarea
                placeholder={FORM_LABELS.deliveryInstructions.placeholder}
                className="min-h-[80px]"
                {...field}
                value={field.value ?? ''}
              />
            </FormControl>
            <FormDescription>
              {FORM_LABELS.deliveryInstructions.description}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Storage & Service Configuration */}
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="storageCapacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kapasitas Penyimpanan (porsi)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                />
              </FormControl>
              <FormDescription>
                Kapasitas penyimpanan makanan di lokasi
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="servingMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Metode Penyajian</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Contoh: Self-service, Dibagikan petugas"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormDescription>
                Cara makanan disajikan kepada penerima manfaat
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
