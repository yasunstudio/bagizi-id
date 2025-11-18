'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, Target, Users, UserCheck } from 'lucide-react'
import { 
  calculateProgress, 
  formatNumberWithSeparator, 
  getEnrollmentStatusLabel, 
  getEnrollmentStatusVariant,
  getTargetGroupLabel // Use from programUtils (accepts string)
} from '@/features/sppg/program/lib/programUtils'
import type { NutritionProgram } from '@prisma/client'

interface ProgramOverviewTabProps {
  program: NutritionProgram & {
    beneficiaryEnrollments?: {
      id: string
      enrollmentStatus: string
      targetBeneficiaries: number
      activeBeneficiaries: number
      targetGroup: string
      beneficiaryOrg: {
        id: string
        organizationName: string
        type: string
      }
    }[]
  }
}

export function ProgramOverviewTab({ program }: ProgramOverviewTabProps) {
  // ✅ SIMPLIFIED (Nov 11, 2025): Calculate multi-target from array length
  const isMultiTarget = program.allowedTargetGroups.length > 1
  
  // ✅ Calculate actual enrolled beneficiaries from enrollments
  const totalTargetFromEnrollments = program.beneficiaryEnrollments?.reduce(
    (sum, enrollment) => sum + enrollment.targetBeneficiaries,
    0
  ) || 0
  
  const totalActiveFromEnrollments = program.beneficiaryEnrollments?.reduce(
    (sum, enrollment) => sum + (enrollment.activeBeneficiaries || 0),
    0
  ) || 0
  
  // ✅ Calculate organization counts by type from enrollments
  const organizationCounts = program.beneficiaryEnrollments?.reduce((acc, enrollment) => {
    const type = enrollment.beneficiaryOrg.type
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}
  
  // Helper: Convert technical organization type to user-friendly label
  const getOrganizationTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      'SCHOOL': 'Sekolah',
      'INTEGRATED_SERVICE_POST': 'Posyandu',
      'HEALTH_FACILITY': 'Puskesmas',
      'COMMUNITY_CENTER': 'Pusat Komunitas',
      'RELIGIOUS_INSTITUTION': 'Lembaga Keagamaan',
      'ORPHANAGE': 'Panti Asuhan',
      'NURSING_HOME': 'Panti Jompo',
      'DAYCARE': 'Tempat Penitipan Anak',
      'FOUNDATION': 'Yayasan',
      'NGO': 'LSM',
      'GOVERNMENT': 'Pemerintah',
      'PRIVATE': 'Swasta',
      'OTHER': 'Lainnya',
    }
    return labels[type] || type
  }
  
  // Format organization counts for display with user-friendly labels
  const organizationSummary = Object.entries(organizationCounts)
    .map(([type, count]) => `${count} ${getOrganizationTypeLabel(type)}`)
    .join(', ')
  
  return (
    <div className="space-y-4 mt-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            Deskripsi Program
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {program.description || 'Tidak ada deskripsi program.'}
          </p>
        </CardContent>
      </Card>

      {/* ✅ SIMPLIFIED (Nov 11, 2025): Target Groups Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            Konfigurasi Kelompok Sasaran
          </CardTitle>
          <CardDescription>
            {isMultiTarget 
              ? `Program multi-target melayani ${program.allowedTargetGroups.length} kelompok sasaran`
              : 'Program single-target melayani satu kelompok sasaran'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Mode:</span>
            <Badge variant={isMultiTarget ? 'default' : 'secondary'}>
              {isMultiTarget ? 'Multi-Target' : 'Single-Target'}
            </Badge>
          </div>

          {/* Allowed Target Groups Display */}
          <div>
            <span className="text-sm text-muted-foreground mb-2 block">
              Kelompok Sasaran:
            </span>
            <div className="flex flex-wrap gap-2">
              {program.allowedTargetGroups.map(group => (
                <Badge key={group} variant="default">
                  {getTargetGroupLabel(group)}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Target Penerima Manfaat
            </CardTitle>
            <CardDescription>
              Progress pencapaian target penerima
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Target:</span>
              <span className="text-2xl font-bold">{formatNumberWithSeparator(program.targetRecipients)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Target dari Enrollment:</span>
              <span className="text-lg font-semibold text-blue-600">{formatNumberWithSeparator(totalTargetFromEnrollments)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Aktif Saat Ini:</span>
              <span className="text-2xl font-bold text-primary">{formatNumberWithSeparator(totalActiveFromEnrollments)}</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress Enrollment:</span>
                <span className="font-medium">
                  {calculateProgress(totalTargetFromEnrollments, program.targetRecipients)}%
                </span>
              </div>
              <Progress 
                value={calculateProgress(totalTargetFromEnrollments, program.targetRecipients)} 
                className="h-2"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress Aktif:</span>
                <span className="font-medium">
                  {calculateProgress(totalActiveFromEnrollments, totalTargetFromEnrollments)}%
                </span>
              </div>
              <Progress 
                value={calculateProgress(totalActiveFromEnrollments, totalTargetFromEnrollments)} 
                className="h-2"
              />
            </div>
            {totalTargetFromEnrollments < program.targetRecipients && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950 rounded-md">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm text-amber-600 dark:text-amber-400">
                  Masih membutuhkan {formatNumberWithSeparator(program.targetRecipients - totalTargetFromEnrollments)} penerima lagi untuk didaftarkan
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Lokasi Implementasi
            </CardTitle>
            <CardDescription>
              Area dan organisasi mitra program
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* ✅ Display implementation area */}
            {program.implementationArea && (
              <div className="p-3 bg-green-50 dark:bg-green-950 rounded-md border border-green-200 dark:border-green-800">
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  Area Implementasi:
                </span>
                <p className="font-semibold text-green-900 dark:text-green-100 mt-1">
                  {program.implementationArea}
                </p>
              </div>
            )}
            
            {/* ✅ Display dynamic organization summary from actual enrollments */}
            {organizationSummary && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Organisasi Terdaftar:
                </span>
                <p className="font-semibold text-blue-900 dark:text-blue-100 mt-1">
                  {organizationSummary}
                </p>
              </div>
            )}
            
            {/* Display beneficiary organizations from beneficiaryEnrollments relation */}
            {program.beneficiaryEnrollments && program.beneficiaryEnrollments.length > 0 && (
              <div>
                <span className="text-sm text-muted-foreground">
                  Organisasi Mitra ({program.beneficiaryEnrollments.length})
                </span>
                <ul className="mt-2 space-y-2">
                  {program.beneficiaryEnrollments.map((enrollment, idx) => (
                    <li key={enrollment.id} className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5">
                        {idx + 1}
                      </Badge>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium">
                            {enrollment.beneficiaryOrg.organizationName}
                          </span>
                          <Badge variant="default" className="text-xs bg-primary">
                            {getTargetGroupLabel(enrollment.targetGroup)}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 space-y-1">
                          <div>
                            <span className="font-medium">{getOrganizationTypeLabel(enrollment.beneficiaryOrg.type)}</span> • 
                            Target: <span className="font-semibold text-blue-600 dark:text-blue-400">{formatNumberWithSeparator(enrollment.targetBeneficiaries)}</span> penerima • 
                            Aktif: <span className="font-semibold text-green-600 dark:text-green-400">{formatNumberWithSeparator(enrollment.activeBeneficiaries || 0)}</span> penerima
                          </div>
                          <div>
                            Status:{' '}
                            <Badge 
                              variant={getEnrollmentStatusVariant(enrollment.enrollmentStatus)}
                              className="inline-flex"
                            >
                              {getEnrollmentStatusLabel(enrollment.enrollmentStatus)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {(!program.beneficiaryEnrollments || program.beneficiaryEnrollments.length === 0) && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Belum ada organisasi mitra terdaftar. Tambahkan melalui tab &quot;Penerima Manfaat&quot;
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
