/**
 * Beneficiary Organization Enrollments Tab Component
 * Displays list of program enrollments for this organization
 * 
 * @component
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { BeneficiaryOrganizationDetail } from '../../api/beneficiaryOrganizationApi'

interface BeneficiaryOrganizationEnrollmentsTabProps {
  organization: BeneficiaryOrganizationDetail
}

export function BeneficiaryOrganizationEnrollmentsTab({
  organization,
}: BeneficiaryOrganizationEnrollmentsTabProps) {
  const getEnrollmentStatusBadge = (status: string): string => {
    switch (status) {
      case 'ACTIVE':
        return 'Aktif'
      case 'COMPLETED':
        return 'Selesai'
      case 'PAUSED':
        return 'Dijeda'
      case 'CANCELLED':
        return 'Dibatalkan'
      case 'DRAFT':
        return 'Draft'
      default:
        return status
    }
  }

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'outline' | 'destructive' => {
    switch (status) {
      case 'ACTIVE':
        return 'default'
      case 'COMPLETED':
        return 'secondary'
      case 'PAUSED':
      case 'DRAFT':
        return 'outline'
      case 'CANCELLED':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const getTargetGroupLabel = (targetGroup: string): string => {
    const labels: Record<string, string> = {
      PREGNANT_WOMAN: 'Ibu Hamil',
      BREASTFEEDING_MOTHER: 'Ibu Menyusui',
      TODDLER: 'Balita',
      SCHOOL_CHILDREN: 'Anak Sekolah',
      TEENAGE_GIRL: 'Remaja Putri',
      ELDERLY: 'Lansia',
      STUNTING_RISK: 'Risiko Stunting',
    }
    return labels[targetGroup] || targetGroup.replace(/_/g, ' ')
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getBeneficiaryProgress = (active: number, target: number): number => {
    if (target === 0) return 0
    return Math.round((active / target) * 100)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Daftar Program</CardTitle>
          <Badge variant="secondary" className="text-sm">
            {organization.enrollments?.length || 0} Program
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {organization.enrollments && organization.enrollments.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Informasi Program</TableHead>
                <TableHead>Kelompok Sasaran</TableHead>
                <TableHead>Penerima Manfaat</TableHead>
                <TableHead>Status Program</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organization.enrollments.map((enrollment) => {
                const progress = getBeneficiaryProgress(
                  enrollment.activeBeneficiaries || 0,
                  enrollment.targetBeneficiaries || 0
                )
                
                return (
                  <TableRow key={enrollment.id}>
                    <TableCell>
                      <div className="space-y-2">
                        <div>
                          <div className="font-semibold text-base mb-1">
                            {enrollment.program?.name || '-'}
                          </div>
                          <code className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            {enrollment.program?.programCode || '-'}
                          </code>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>📅</span>
                          <span>
                            Terdaftar: {enrollment.enrollmentDate
                              ? formatDate(enrollment.enrollmentDate)
                              : '-'}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {getTargetGroupLabel(enrollment.targetGroup || '')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-lg text-primary">
                                {enrollment.activeBeneficiaries || 0}
                              </span>
                              <span className="text-muted-foreground text-sm">aktif</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              dari {enrollment.targetBeneficiaries || 0} target
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          <div className="text-xs text-center font-medium text-muted-foreground">
                            {progress}% tercapai
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Badge variant={getStatusVariant(enrollment.enrollmentStatus || 'DRAFT')} className="text-sm">
                          {getEnrollmentStatusBadge(enrollment.enrollmentStatus || 'DRAFT')}
                        </Badge>
                        {enrollment.enrollmentStatus === 'ACTIVE' && progress >= 90 && (
                          <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                            <span>✓</span>
                            <span>Target hampir tercapai</span>
                          </div>
                        )}
                        {enrollment.enrollmentStatus === 'ACTIVE' && progress < 50 && (
                          <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                            <span>⚠</span>
                            <span>Perlu perhatian</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Belum ada program yang terdaftar untuk organisasi ini.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
