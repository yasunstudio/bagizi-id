/**
 * Step 3: Production & Quality Control
 * Monitoring form component for meal production, quality scores, and safety incidents
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
import { Calendar, UtensilsCrossed, Star, ThumbsUp, ThumbsDown, ShieldAlert, Thermometer } from 'lucide-react'

interface Step3ProductionQualityProps {
  control: Control<CreateMonitoringInput>
}

export function Step3ProductionQuality({ control }: Step3ProductionQualityProps) {
  return (
    <div className="space-y-8">
      {/* Feeding Days Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Jadwal Pemberian Makanan</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="feedingDaysPlanned"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hari Direncanakan</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 22"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Jumlah hari pemberian makanan yang direncanakan
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="feedingDaysCompleted"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hari Terlaksana</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 21"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Jumlah hari pemberian makanan yang terlaksana
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Menu & Stock Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <UtensilsCrossed className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Menu & Stok</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={control}
            name="menuVariety"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Variasi Menu</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 15"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Jumlah menu berbeda yang disajikan
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="stockoutDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hari Stok Habis</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 1"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Jumlah hari dengan kehabisan stok bahan
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="qualityIssues"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Masalah Kualitas</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 2"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Jumlah insiden masalah kualitas bahan
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Meal Production Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <UtensilsCrossed className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Produksi Makanan</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={control}
            name="totalMealsProduced"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Diproduksi</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 10500"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Total porsi makanan yang diproduksi
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="totalMealsDistributed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Didistribusikan</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 10200"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Total porsi makanan yang didistribusikan
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="wastePercentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Persentase Waste (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g., 2.5"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Persentase makanan yang terbuang
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Quality Scores Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Star className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Skor Kualitas</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="avgQualityScore"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Skor Kualitas Rata-rata</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g., 4.5"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Skor kualitas makanan (skala 1-5)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="customerSatisfaction"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kepuasan Pelanggan (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g., 92.5"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Persentase kepuasan penerima manfaat (0-100)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Feedback Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <ThumbsUp className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Feedback</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="complaintCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <ThumbsDown className="h-4 w-4 text-destructive" />
                  Keluhan
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
                  Jumlah keluhan yang diterima
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="complimentCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-green-600" />
                  Pujian
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 30"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Jumlah pujian/apresiasi yang diterima
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Food Safety Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Keamanan Pangan</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={control}
            name="foodSafetyIncidents"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Insiden Keamanan</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Jumlah insiden keamanan pangan
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="hygieneScore"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Skor Kebersihan</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g., 95.0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Skor audit kebersihan (0-100)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="temperatureCompliance"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4" />
                  Kepatuhan Suhu (%)
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g., 98.5"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Persentase kepatuhan kontrol suhu
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="bg-muted/50 p-4 rounded-lg space-y-2">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Tips:</strong>
        </p>
        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
          <li>Total didistribusikan tidak boleh melebihi total diproduksi</li>
          <li>Waste percentage = ((Produksi - Distribusi) / Produksi) × 100%</li>
          <li>Skor kualitas menggunakan skala 1-5 (5 = excellent)</li>
          <li>Target: 0 insiden keamanan pangan</li>
        </ul>
      </div>
    </div>
  )
}
