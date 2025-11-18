/**
 * @fileoverview Program Enrollment Detail Page
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.18.0
 * @author Bagizi-ID Development Team
 * 
 * Page: /program/[id]/enrollments/[enrollmentId]
 * Purpose: Display detailed enrollment information
 * 
 * Features:
 * - Complete enrollment details
 * - School information
 * - Student statistics
 * - Feeding schedule
 * - Budget allocation
 * - Audit trail
 * - Edit/delete actions
 */

'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  School,
  Users,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Building2,
  Edit,
  Trash2,
  XCircle,
  UtensilsCrossed,
  User
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useEnrollment, useDeleteEnrollment } from '@/features/sppg/program/hooks'
import { formatDate, formatCurrency } from '@/features/sppg/program/lib/programUtils'
import { toast } from 'sonner'

interface EnrollmentDetailPageProps {
  params: Promise<{ id: string; enrollmentId: string }>
}

export default function EnrollmentDetailPage({ params }: EnrollmentDetailPageProps) {
  const router = useRouter()
  const { id: programId, enrollmentId } = use(params)

  const { data: enrollment, isLoading, error } = useEnrollment(programId, enrollmentId)
  const { mutate: deleteEnrollment, isPending: isDeleting } = useDeleteEnrollment(programId)

  const handleDelete = () => {
    if (confirm('Apakah Anda yakin ingin menghapus enrollment ini?')) {
      deleteEnrollment(
        enrollmentId,
        {
          onSuccess: () => {
            toast.success('Enrollment berhasil dihapus')
            router.push(`/program/${programId}/enrollments`)
          },
          onError: (error) => {
            toast.error(error.message || 'Gagal menghapus enrollment')
          },
        }
      )
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !enrollment) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Enrollment Tidak Ditemukan</h4>
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : 'Data tidak tersedia'}
              </p>
              <Button
                onClick={() => router.push(`/program/${programId}/enrollments`)}
                variant="outline"
                className="mt-4"
              >
                Kembali ke Daftar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const school = enrollment.school
  const studentsProgress = enrollment.targetStudents
    ? ((enrollment.activeStudents || 0) / enrollment.targetStudents) * 100
    : 0

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/program/${programId}/enrollments`)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Daftar Sekolah
          </Button>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{school.schoolName}</h1>
            <p className="text-muted-foreground mt-1">
              Detail enrollment sekolah dalam program
            </p>
          </div>
          <Badge
            variant={
              enrollment.status === 'ACTIVE'
                ? 'default'
                : enrollment.status === 'COMPLETED'
                ? 'secondary'
                : 'destructive'
            }
            className="text-sm"
          >
            {enrollment.status === 'ACTIVE' && 'Aktif'}
            {enrollment.status === 'COMPLETED' && 'Selesai'}
            {enrollment.status === 'SUSPENDED' && 'Ditangguhkan'}
            {enrollment.status === 'CANCELLED' && 'Dibatalkan'}
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button asChild>
          <Link href={`/program/${programId}/enrollments/${enrollmentId}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Enrollment
          </Link>
        </Button>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {isDeleting ? 'Menghapus...' : 'Hapus Enrollment'}
        </Button>
      </div>

      {/* School Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="h-5 w-5 text-primary" />
            Informasi Sekolah
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Jenis Sekolah</p>
                  <p className="font-medium">{school.schoolType || '-'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Alamat</p>
                  <p className="font-medium">{school.schoolAddress || '-'}</p>
                </div>
              </div>
            </div>

            {/* Phone and Email not available in Pick type - removed for now */}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Enrollment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Detail Enrollment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Tanggal Pendaftaran</p>
                <p className="font-medium">{formatDate(enrollment.enrollmentDate, 'dd MMMM yyyy')}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Periode</p>
                <p className="font-medium">
                  {formatDate(enrollment.startDate, 'dd MMM yyyy')} -{' '}
                  {enrollment.endDate ? formatDate(enrollment.endDate, 'dd MMM yyyy') : 'Sekarang'}
                </p>
              </div>

              <Separator />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Progress Siswa</p>
                  <p className="text-sm font-medium">{studentsProgress.toFixed(1)}%</p>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${Math.min(studentsProgress, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {enrollment.activeStudents || 0} dari {enrollment.targetStudents} siswa
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Statistik Siswa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Target Siswa</p>
                <p className="text-2xl font-bold">{enrollment.targetStudents}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Siswa Aktif</p>
                <p className="text-2xl font-bold">{enrollment.activeStudents || 0}</p>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm text-muted-foreground mb-2">Distribusi Gender</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 border rounded-lg">
                  <p className="text-xs text-muted-foreground">Laki-laki</p>
                  <p className="text-lg font-semibold">{enrollment.maleStudents || 0}</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-xs text-muted-foreground">Perempuan</p>
                  <p className="text-lg font-semibold">{enrollment.femaleStudents || 0}</p>
                </div>
              </div>
            </div>

            {(enrollment.students4to6Years || enrollment.students7to12Years || 
              enrollment.students13to15Years || enrollment.students16to18Years) && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Distribusi Usia</p>
                  <div className="space-y-2">
                    {(enrollment.students4to6Years ?? 0) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">4-6 tahun</span>
                        <span className="font-medium">{enrollment.students4to6Years}</span>
                      </div>
                    )}
                    {(enrollment.students7to12Years ?? 0) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">7-12 tahun</span>
                        <span className="font-medium">{enrollment.students7to12Years}</span>
                      </div>
                    )}
                    {(enrollment.students13to15Years ?? 0) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">13-15 tahun</span>
                        <span className="font-medium">{enrollment.students13to15Years}</span>
                      </div>
                    )}
                    {(enrollment.students16to18Years ?? 0) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">16-18 tahun</span>
                        <span className="font-medium">{enrollment.students16to18Years}</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Feeding Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5 text-primary" />
              Jadwal Feeding
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Hari Feeding/Minggu</p>
                <p className="text-2xl font-bold">{enrollment.feedingDays}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Makan/Hari</p>
                <p className="text-2xl font-bold">{enrollment.mealsPerDay}</p>
              </div>
            </div>

            {(enrollment.breakfastTime || enrollment.lunchTime || enrollment.snackTime) && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground mb-2">Waktu Makan</p>
                  {enrollment.breakfastTime && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Sarapan</span>
                      <span className="font-medium">{enrollment.breakfastTime}</span>
                    </div>
                  )}
                  {enrollment.lunchTime && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Makan Siang</span>
                      <span className="font-medium">{enrollment.lunchTime}</span>
                    </div>
                  )}
                  {enrollment.snackTime && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Snack</span>
                      <span className="font-medium">{enrollment.snackTime}</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {enrollment.feedingTime && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Catatan Waktu</p>
                  <p className="font-medium">{enrollment.feedingTime}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Budget & Cost */}
        {(enrollment.monthlyBudgetAllocation !== null && enrollment.monthlyBudgetAllocation !== undefined) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Anggaran & Biaya
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Alokasi Anggaran Bulanan</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(enrollment.monthlyBudgetAllocation || 0)}
                </p>
              </div>

              {enrollment.budgetPerStudent !== null && enrollment.budgetPerStudent !== undefined && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Anggaran per Siswa</p>
                    <p className="text-xl font-semibold">
                      {formatCurrency(enrollment.budgetPerStudent)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Per bulan</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Audit Trail */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Riwayat Perubahan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Dibuat</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(enrollment.createdAt, 'dd MMM yyyy, HH:mm')}
                  </p>
                </div>
              </div>
              {enrollment.createdBy && (
                <Badge variant="outline">{enrollment.createdBy}</Badge>
              )}
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Terakhir Diupdate</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(enrollment.updatedAt, 'dd MMM yyyy, HH:mm')}
                  </p>
                </div>
              </div>
              {enrollment.updatedBy && (
                <Badge variant="outline">{enrollment.updatedBy}</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
