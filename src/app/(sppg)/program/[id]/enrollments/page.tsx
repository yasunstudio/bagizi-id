/**
 * @fileoverview Program Enrollments List Page
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.18.0
 * @author Bagizi-ID Development Team
 * 
 * Page: /program/[id]/enrollments
 * Purpose: Display all school enrollments for a program
 * 
 * Features:
 * - List all enrollments with school details
 * - Filter by status and school type
 * - Quick stats overview
 * - Link to create new enrollment
 * - Link to view/edit enrollment details
 */

'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Plus,
  ArrowLeft,
  School,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  MapPin,
  Filter,
  Search
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useProgramEnrollments } from '@/features/sppg/program/hooks'
import { formatDate } from '@/features/sppg/program/lib/programUtils'
import type { EnrollmentStatus } from '@prisma/client'

export default function ProgramEnrollmentsListPage() {
  const params = useParams()
  const router = useRouter()
  const programId = params.id as string

  // Filters
  const [statusFilter, setStatusFilter] = useState<EnrollmentStatus | 'ALL'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch enrollments
  const { data: enrollments, isLoading, error } = useProgramEnrollments(programId, {
    ...(statusFilter !== 'ALL' && { status: statusFilter })
  })

  // Client-side search filter
  const filteredEnrollments = enrollments?.filter((enrollment) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      enrollment.school.schoolName.toLowerCase().includes(query) ||
      enrollment.school.schoolAddress?.toLowerCase().includes(query) ||
      enrollment.school.schoolType?.toLowerCase().includes(query)
    )
  })

  // Calculate stats
  const stats = {
    total: enrollments?.length || 0,
    active: enrollments?.filter((e) => e.status === 'ACTIVE').length || 0,
    completed: enrollments?.filter((e) => e.status === 'COMPLETED').length || 0,
    cancelled: enrollments?.filter((e) => e.status === 'CANCELLED').length || 0,
    totalStudents: enrollments?.reduce((sum, e) => sum + (e.targetStudents || 0), 0) || 0,
    activeStudents: enrollments?.reduce((sum, e) => sum + (e.activeStudents || 0), 0) || 0,
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Gagal Memuat Data</h4>
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : 'Terjadi kesalahan'}
              </p>
              <Button onClick={() => router.back()} variant="outline" className="mt-4">
                Kembali
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/program/${programId}`)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Program
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Sekolah Terdaftar</h1>
          <p className="text-muted-foreground">
            Daftar sekolah yang terdaftar dalam program ini
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href={`/program/${programId}/enrollments/new`}>
            <Plus className="h-4 w-4" />
            Tambah Sekolah
          </Link>
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <School className="h-4 w-4 text-primary" />
              Total Sekolah
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.active} aktif, {stats.completed} selesai
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Total Siswa Target
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Dari semua sekolah
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Siswa Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeStudents.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalStudents > 0 
                ? `${((stats.activeStudents / stats.totalStudents) * 100).toFixed(1)}% dari target`
                : 'Belum ada data'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4 text-primary" />
              Status Lainnya
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed + stats.cancelled}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.completed} selesai, {stats.cancelled} dibatalkan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter & Pencarian
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="search">Cari Sekolah</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nama sekolah, alamat..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as EnrollmentStatus | 'ALL')}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Status</SelectItem>
                  <SelectItem value="ACTIVE">Aktif</SelectItem>
                  <SelectItem value="COMPLETED">Selesai</SelectItem>
                  <SelectItem value="SUSPENDED">Ditangguhkan</SelectItem>
                  <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enrollments List */}
      {filteredEnrollments && filteredEnrollments.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="h-20 w-20 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center">
                <School className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery || statusFilter !== 'ALL' 
                  ? 'Tidak Ada Hasil' 
                  : 'Belum Ada Sekolah Terdaftar'}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {searchQuery || statusFilter !== 'ALL'
                  ? 'Coba ubah filter atau kata kunci pencarian'
                  : 'Mulai dengan mendaftarkan sekolah pertama ke program ini'}
              </p>
              {!searchQuery && statusFilter === 'ALL' && (
                <Button asChild size="lg">
                  <Link href={`/program/${programId}/enrollments/new`}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Sekolah
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEnrollments?.map((enrollment) => (
            <Card key={enrollment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-1">
                      {enrollment.school.schoolName}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Building2 className="h-3 w-3" />
                      {enrollment.school.schoolType || 'Tidak ada data'}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      enrollment.status === 'ACTIVE'
                        ? 'default'
                        : enrollment.status === 'COMPLETED'
                        ? 'secondary'
                        : 'destructive'
                    }
                  >
                    {enrollment.status === 'ACTIVE' && 'Aktif'}
                    {enrollment.status === 'COMPLETED' && 'Selesai'}
                    {enrollment.status === 'SUSPENDED' && 'Ditangguhkan'}
                    {enrollment.status === 'CANCELLED' && 'Dibatalkan'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Location */}
                {enrollment.school.schoolAddress && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground line-clamp-2">
                      {enrollment.school.schoolAddress}
                    </span>
                  </div>
                )}

                {/* Contact info removed - properties not available in Pick type */}

                {/* Students */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div className="text-sm">
                      <span className="font-semibold">{enrollment.activeStudents || 0}</span>
                      <span className="text-muted-foreground"> / {enrollment.targetStudents || 0} siswa</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDate(enrollment.enrollmentDate, 'dd MMM yyyy')}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button asChild variant="default" size="sm" className="flex-1">
                    <Link href={`/program/${programId}/enrollments/${enrollment.id}`}>
                      Lihat Detail
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/program/${programId}/enrollments/${enrollment.id}/edit`}>
                      Edit
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
