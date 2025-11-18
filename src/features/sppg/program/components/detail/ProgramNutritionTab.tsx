/**
 * @fileoverview ProgramNutritionTab - Display nutrition standards from NutritionStandard
 * @version Phase 4 - Nov 8, 2025 (Updated to use nutrition-helpers)
 * @author Bagizi-ID Development Team
 */

'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Target, Award, AlertCircle, Info } from 'lucide-react'
import { getTargetGroupLabel } from '@/features/sppg/program/lib/programUtils'
import type { Program } from '@/features/sppg/program/types/program.types'
import type { ProgramNutritionSummary } from '@/lib/nutrition-helpers'

interface ProgramNutritionTabProps {
  program: Program
}

export function ProgramNutritionTab({ program }: ProgramNutritionTabProps) {
  const [summary, setSummary] = useState<ProgramNutritionSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadNutritionSummary() {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch from API endpoint instead of calling helper directly
        const response = await fetch(`/api/sppg/program/${program.id}/nutrition-summary`)
        if (!response.ok) {
          throw new Error('Failed to fetch nutrition summary')
        }
        
        const result = await response.json()
        if (!result.success || !result.data) {
          throw new Error(result.error || 'No data returned')
        }
        
        setSummary(result.data)
      } catch (err) {
        console.error('Failed to load nutrition summary:', err)
        setError('Gagal memuat data nutrisi')
      } finally {
        setLoading(false)
      }
    }

    loadNutritionSummary()
  }, [program.id])

  if (loading) {
    return (
      <div className="space-y-4 mt-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !summary || summary.targetGroups.length === 0) {
    return (
      <div className="space-y-4 mt-4">
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">
                {error || 'Belum Ada Data Kebutuhan Gizi'}
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                {error 
                  ? 'Terjadi kesalahan saat memuat data. Silakan coba lagi atau hubungi administrator.'
                  : 'Data kebutuhan gizi akan muncul setelah program memiliki kelompok penerima manfaat yang jelas.'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { aggregates, targetGroups } = summary

  return (
    <div className="space-y-4 mt-4">
      {/* Summary Card - Aggregated Nutrition */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Kebutuhan Gizi Program
          </CardTitle>
          <CardDescription>
            Ringkasan kebutuhan nutrisi dari {targetGroups.length} kelompok penerima manfaat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Calories */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Energi (Kalori)</span>
                <Badge variant="secondary">kkal</Badge>
              </div>
              <p className="text-2xl font-bold">{aggregates.avgCalories.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Kebutuhan per hari ({aggregates.minCalories}-{aggregates.maxCalories} kkal)
              </p>
            </div>

            {/* Protein */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Protein</span>
                <Badge variant="secondary">gram</Badge>
              </div>
              <p className="text-2xl font-bold">{aggregates.avgProtein.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Per hari ({aggregates.minProtein}-{aggregates.maxProtein} gram)
              </p>
            </div>

            {/* Carbohydrates */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Karbohidrat</span>
                <Badge variant="secondary">gram</Badge>
              </div>
              <p className="text-2xl font-bold">{aggregates.avgCarbohydrates.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Kebutuhan per hari
              </p>
            </div>

            {/* Fat */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Lemak</span>
                <Badge variant="secondary">gram</Badge>
              </div>
              <p className="text-2xl font-bold">{aggregates.avgFat.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Kebutuhan per hari
              </p>
            </div>

            {/* Fiber */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Serat</span>
                <Badge variant="secondary">gram</Badge>
              </div>
              <p className="text-2xl font-bold">{aggregates.avgFiber.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Kebutuhan per hari
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Target Groups Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Kebutuhan Gizi per Kelompok Penerima</CardTitle>
          <CardDescription>
            Kebutuhan gizi harian sesuai standar Kementerian Kesehatan RI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summary.standards.map((standard, index) => (
              <div 
                key={`${standard.targetGroup}-${standard.ageGroup}-${standard.gender || 'all'}-${standard.activityLevel}-${index}`} 
                className="p-4 border rounded-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{getTargetGroupLabel(standard.targetGroup)}</h4>
                    {standard.ageGroup && (
                      <p className="text-sm text-muted-foreground">
                        Usia {standard.ageGroup} • {standard.gender === 'MALE' ? 'Laki-laki' : standard.gender === 'FEMALE' ? 'Perempuan' : 'Semua'} • {standard.activityLevel === 'SEDENTARY' ? 'Aktivitas Ringan' : standard.activityLevel === 'MODERATE' ? 'Aktivitas Sedang' : standard.activityLevel === 'ACTIVE' ? 'Aktivitas Tinggi' : standard.activityLevel}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline">{getTargetGroupLabel(standard.targetGroup)}</Badge>
                </div>
                
                <div className="grid grid-cols-5 gap-3 mt-3">
                  <div className="text-center">
                    <p className="text-lg font-bold">{standard.calories}</p>
                    <p className="text-xs text-muted-foreground">kkal/hari</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{standard.protein}</p>
                    <p className="text-xs text-muted-foreground">g protein</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{standard.carbohydrates}</p>
                    <p className="text-xs text-muted-foreground">g karbo</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{standard.fat}</p>
                    <p className="text-xs text-muted-foreground">g lemak</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{standard.fiber}</p>
                    <p className="text-xs text-muted-foreground">g serat</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Panduan Penggunaan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="flex items-start gap-3">
                <Award className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-1">
                    Tentang Standar Gizi
                  </h4>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    Angka yang ditampilkan adalah kebutuhan gizi harian sesuai Peraturan Menteri Kesehatan RI. 
                    Setiap kelompok penerima manfaat memiliki kebutuhan yang berbeda berdasarkan usia, jenis kelamin, dan tingkat aktivitas.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-600 dark:text-amber-400 mb-1">
                    Perencanaan Menu
                  </h4>
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    Saat membuat menu, pastikan kandungan gizi sesuai dengan kebutuhan kelompok penerima. 
                    Gunakan fitur pengecekan otomatis untuk memastikan menu memenuhi standar minimal yang diperlukan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
