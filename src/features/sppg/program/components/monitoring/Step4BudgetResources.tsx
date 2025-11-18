/**
 * Step 4: Budget & Resources
 * Monitoring form component for budget utilization, staff attendance, and training
 */

'use client'

import { Control } from 'react-hook-form'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { CreateMonitoringInput } from '@/features/sppg/program/schemas/monitoringSchema'
import { DollarSign, Users, GraduationCap } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Step4BudgetResourcesProps {
  control: Control<CreateMonitoringInput>
}

export function Step4BudgetResources({ control }: Step4BudgetResourcesProps) {
  return (
    <div className="space-y-8">
      {/* Budget Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Anggaran</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="budgetAllocated"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Anggaran Dialokasikan (Rp)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 50000000"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Total anggaran yang dialokasikan untuk periode ini
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="budgetUtilized"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Anggaran Terpakai (Rp)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 45000000"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Total anggaran yang telah digunakan
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Budget Calculation Card */}
        <Card className="mt-4 bg-muted/50">
          <CardHeader>
            <CardTitle className="text-base">Kalkulasi Anggaran</CardTitle>
            <CardDescription>
              Perhitungan otomatis berdasarkan data yang diinput
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Utilisasi:</span>
              <span className="font-medium">
                (Terpakai / Dialokasikan) × 100%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sisa Anggaran:</span>
              <span className="font-medium">
                Dialokasikan - Terpakai
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Biaya per Penerima:</span>
              <span className="font-medium">
                Terpakai / Jumlah Penerima Aktif
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Biaya per Makanan:</span>
              <span className="font-medium">
                Terpakai / Total Makanan Didistribusikan
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Human Resources Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Sumber Daya Manusia</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="staffAttendance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kehadiran Staf (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g., 96.5"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Persentase kehadiran staf rata-rata (0-100)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="trainingCompleted"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Pelatihan Selesai
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 3"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Jumlah sesi pelatihan yang telah diselesaikan
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="bg-muted/50 p-4 rounded-lg space-y-2">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Tips Manajemen Anggaran:</strong>
        </p>
        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
          <li>Utilisasi ideal: 85-95% dari anggaran yang dialokasikan</li>
          <li>Monitor biaya per penerima untuk efisiensi program</li>
          <li>Pastikan kehadiran staf minimal 90% untuk kualitas program</li>
          <li>Target minimal 1 pelatihan per bulan untuk pengembangan SDM</li>
        </ul>
      </div>
    </div>
  )
}
