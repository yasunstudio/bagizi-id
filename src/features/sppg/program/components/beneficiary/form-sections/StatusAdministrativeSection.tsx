/**
 * @fileoverview Section 10: Status & Administratif
 * Form section untuk status enrollment dan catatan admin
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
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { FileText } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'
import { ProgramEnrollmentStatus } from '@prisma/client'
import { FORM_LABELS } from '../../../lib/enrollmentFormLabels'
import { CreateBeneficiaryEnrollmentInput } from '../../../schemas/beneficiaryEnrollmentSchema'

interface StatusAdministrativeSectionProps {
  form: UseFormReturn<CreateBeneficiaryEnrollmentInput>
}

export function StatusAdministrativeSection({ form }: StatusAdministrativeSectionProps) {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-gray-500/10 p-2">
          <FileText className="h-5 w-5 text-gray-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">
            {FORM_LABELS.sections.statusAdmin}
          </h3>
          <p className="text-sm text-muted-foreground">
            Status pendaftaran dan informasi administratif
          </p>
        </div>
      </div>

      {/* Enrollment Status */}
      <FormField
        control={form.control}
        name="enrollmentStatus"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{FORM_LABELS.enrollmentStatus.label}</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={FORM_LABELS.enrollmentStatus.placeholder} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value={ProgramEnrollmentStatus.DRAFT}>
                  Draft
                </SelectItem>
                <SelectItem value={ProgramEnrollmentStatus.ACTIVE}>
                  Aktif
                </SelectItem>
                <SelectItem value={ProgramEnrollmentStatus.PAUSED}>
                  Dijeda
                </SelectItem>
                <SelectItem value={ProgramEnrollmentStatus.COMPLETED}>
                  Selesai
                </SelectItem>
                <SelectItem value={ProgramEnrollmentStatus.CANCELLED}>
                  Dibatalkan
                </SelectItem>
                <SelectItem value={ProgramEnrollmentStatus.SUSPENDED}>
                  Ditangguhkan
                </SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              {FORM_LABELS.enrollmentStatus.description}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Status Flags */}
      <div className="space-y-4">
        <div>
          <h4 className="font-medium">Penanda Status</h4>
          <p className="text-sm text-muted-foreground">
            Tandai kondisi khusus untuk pendaftaran ini
          </p>
        </div>

        <div className="space-y-3">
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value ?? true}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Aktif</FormLabel>
                  <FormDescription>
                    Pendaftaran sedang aktif dan menerima layanan
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isPriority"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Prioritas</FormLabel>
                  <FormDescription>
                    Tandai sebagai prioritas untuk penanganan khusus
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="needsAssessment"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Perlu Asesmen</FormLabel>
                  <FormDescription>
                    Memerlukan asesmen lanjutan oleh tim teknis
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Administrative Notes */}
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="remarks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catatan Umum</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Catatan atau keterangan tambahan mengenai pendaftaran ini"
                  className="min-h-[80px]"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormDescription>
                Informasi tambahan yang relevan dengan pendaftaran
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="internalNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{FORM_LABELS.internalNotes.label}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={FORM_LABELS.internalNotes.placeholder}
                  className="min-h-[80px]"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormDescription>
                {FORM_LABELS.internalNotes.description}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
