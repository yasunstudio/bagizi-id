/**
 * Step 2: Beneficiaries & Attendance
 * Monitoring form component for beneficiary metrics, attendance, and nutrition assessments
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
import { Badge } from '@/components/ui/badge'
import { Users, UserCheck, UserX, TrendingUp, Heart, AlertTriangle } from 'lucide-react'

interface Step2BeneficiariesProps {
  control: Control<CreateMonitoringInput>
}

export function Step2Beneficiaries({ control }: Step2BeneficiariesProps) {
  return (
    <div className="space-y-8">
      {/* Recipients Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Penerima Manfaat</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={control}
            name="targetRecipients"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Penerima</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 500"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Jumlah target penerima manfaat
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="enrolledRecipients"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Terdaftar</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 480"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Jumlah yang telah terdaftar
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="activeRecipients"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aktif</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 475"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Jumlah penerima yang aktif
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Enrollment Changes Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Perubahan Keanggotaan</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="dropoutCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <UserX className="h-4 w-4 text-destructive" />
                  Dropout
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 5"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Jumlah penerima yang keluar
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="newEnrollments"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-green-600" />
                  Pendaftar Baru
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 10"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Jumlah pendaftar baru periode ini
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Attendance Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <UserCheck className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Kehadiran</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={control}
            name="attendanceRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tingkat Kehadiran (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g., 95.5"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Persentase kehadiran rata-rata (0-100)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Nutrition Assessments Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Heart className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Asesmen Gizi</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="assessmentsCompleted"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Asesmen Selesai</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 450"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Jumlah asesmen gizi yang telah selesai
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="criticalCases"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  Kasus Kritis
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
                  Jumlah kasus gizi buruk yang memerlukan perhatian khusus
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <FormField
            control={control}
            name="improvedNutrition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Badge variant="default" className="bg-green-600">
                    Membaik
                  </Badge>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 50"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Jumlah anak dengan status gizi membaik
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="stableNutrition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Badge variant="secondary">
                    Stabil
                  </Badge>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 380"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Jumlah anak dengan status gizi stabil
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="worsenedNutrition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Badge variant="destructive">
                    Memburuk
                  </Badge>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 20"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Jumlah anak dengan status gizi memburuk
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Tip:</strong> Pastikan total (membaik + stabil + memburuk) 
          tidak melebihi jumlah asesmen yang selesai.
        </p>
      </div>
    </div>
  )
}
