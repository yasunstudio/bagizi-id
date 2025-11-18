/**
 * @fileoverview Section: Budget Tracking (Optional for Government Programs)
 * Form section untuk pelacakan anggaran program pemerintah
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
import { DollarSign } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'
import { CreateBeneficiaryEnrollmentInput } from '../../../schemas/beneficiaryEnrollmentSchema'

interface BudgetTrackingSectionProps {
  form: UseFormReturn<CreateBeneficiaryEnrollmentInput>
}

export function BudgetTrackingSection({ form }: BudgetTrackingSectionProps) {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-emerald-500/10 p-2">
          <DollarSign className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Pelacakan Anggaran</h3>
          <p className="text-sm text-muted-foreground">
            Untuk program pemerintah (opsional)
          </p>
        </div>
      </div>

      {/* Budget Fields */}
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="monthlyBudgetAllocation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alokasi Anggaran Bulanan (Rp)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="10000000"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                />
              </FormControl>
              <FormDescription>
                Total alokasi anggaran per bulan dari APBD/APBN
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="budgetPerBeneficiary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Anggaran per Penerima (Rp)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="100"
                  placeholder="50000"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                />
              </FormControl>
              <FormDescription>
                Biaya per penerima manfaat untuk keperluan tracking
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Budget Summary (calculated field) */}
      {(() => {
        const monthlyBudget = form.watch('monthlyBudgetAllocation')
        const budgetPerBeneficiary = form.watch('budgetPerBeneficiary')
        const targetBeneficiaries = form.watch('targetBeneficiaries')

        if (monthlyBudget && targetBeneficiaries) {
          const calculatedPerBeneficiary = monthlyBudget / targetBeneficiaries

          return (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950">
              <div className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                Ringkasan Anggaran
              </div>
              <div className="mt-2 grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Anggaran Bulanan:</span>
                  <span className="font-semibold">
                    Rp {monthlyBudget.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Target Penerima:</span>
                  <span className="font-semibold">
                    {targetBeneficiaries.toLocaleString('id-ID')} orang
                  </span>
                </div>
                <div className="flex justify-between border-t border-emerald-200 pt-2 dark:border-emerald-800">
                  <span className="text-muted-foreground">Rata-rata per Penerima:</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                    Rp {calculatedPerBeneficiary.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                  </span>
                </div>
                {budgetPerBeneficiary && Math.abs(calculatedPerBeneficiary - budgetPerBeneficiary) > 100 && (
                  <div className="mt-2 text-xs text-amber-600 dark:text-amber-500">
                    ⚠️ Anggaran per penerima yang diinput berbeda dengan perhitungan otomatis
                  </div>
                )}
              </div>
            </div>
          )
        }

        return null
      })()}
    </div>
  )
}
