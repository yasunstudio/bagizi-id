/**
 * @fileoverview Employee Detail Component
 * @module features/sppg/hrd/components/EmployeeDetail
 * @description Detail view for employee with tabbed interface
 * 
 * Features:
 * - 6 tabs: Overview, Employment, Documents, Attendance, Leave, Payroll
 * - Personal information display with photo
 * - Employment details with status badges
 * - Action buttons: Edit, Delete, Activate/Deactivate
 * - Loading states and error handling
 * - Responsive layout with cards
 * 
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  FileText,
  Clock,
  Plane,
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

import { useEmployee, useDeleteEmployee, useUpdateEmployeeStatus } from '../hooks'

interface EmployeeDetailProps {
  employeeId: string
}

export function EmployeeDetail({ employeeId }: EmployeeDetailProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const { data: employee, isLoading, error } = useEmployee(employeeId)
  const { mutate: deleteEmployee, isPending: isDeleting } = useDeleteEmployee()
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateEmployeeStatus()

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  // Error state
  if (error || !employee) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold">Karyawan tidak ditemukan</p>
            <p className="text-sm text-muted-foreground mt-2">
              Data karyawan tidak tersedia atau telah dihapus
            </p>
            <Button onClick={() => router.push('/hrd/employees')} className="mt-4">
              Kembali ke Daftar Karyawan
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleDelete = () => {
    deleteEmployee(employeeId, {
      onSuccess: () => {
        toast.success('Karyawan berhasil dihapus')
        router.push('/hrd/employees')
      },
    })
  }

  const handleStatusToggle = () => {
    updateStatus(
      { id: employeeId, isActive: !employee.isActive },
      {
        onSuccess: () => {
          toast.success(
            `Karyawan berhasil ${employee.isActive ? 'dinonaktifkan' : 'diaktifkan'}`
          )
        },
      }
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Photo */}
              <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                <AvatarImage src={employee.photoUrl || undefined} />
                <AvatarFallback className="text-3xl">
                  {employee.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>

              {/* Basic Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold">{employee.fullName}</h1>
                    {employee.nickname && (
                      <p className="text-lg text-muted-foreground">&ldquo;{employee.nickname}&rdquo;</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{employee.employeeCode || employee.employeeId}</Badge>
                      <Badge
                        variant={employee.isActive ? 'default' : 'secondary'}
                        className={employee.isActive ? 'bg-green-500' : ''}
                      >
                        {employee.isActive ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                      <Badge variant="secondary">
                        {employee.employmentType === 'PERMANENT' && 'Tetap'}
                        {employee.employmentType === 'CONTRACT' && 'Kontrak'}
                        {employee.employmentType === 'TEMPORARY' && 'Sementara'}
                        {employee.employmentType === 'INTERN' && 'Magang'}
                        {employee.employmentType === 'FREELANCE' && 'Freelance'}
                      </Badge>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/hrd/employees/${employeeId}/edit`)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleStatusToggle}
                      disabled={isUpdatingStatus}
                    >
                      {employee.isActive ? (
                        <>
                          <XCircle className="mr-2 h-4 w-4" />
                          Nonaktifkan
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Aktifkan
                        </>
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteDialogOpen(true)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Hapus
                    </Button>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Posisi</p>
                      <p className="font-medium">{employee.position?.positionName || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Departemen</p>
                      <p className="font-medium">{employee.department?.departmentName || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Bergabung</p>
                      <p className="font-medium">
                        {format(new Date(employee.joinDate), 'dd MMM yyyy', {
                          locale: idLocale,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="employment">Kepegawaian</TabsTrigger>
            <TabsTrigger value="documents">Dokumen</TabsTrigger>
            <TabsTrigger value="attendance">Kehadiran</TabsTrigger>
            <TabsTrigger value="leave">Cuti</TabsTrigger>
            <TabsTrigger value="payroll">Penggajian</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informasi Pribadi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem label="NIK" value={employee.nik || '-'} />
                  <InfoItem
                    label="Tanggal Lahir"
                    value={
                      employee.dateOfBirth
                        ? format(new Date(employee.dateOfBirth), 'dd MMMM yyyy', {
                            locale: idLocale,
                          })
                        : '-'
                    }
                  />
                  <InfoItem label="Tempat Lahir" value={employee.placeOfBirth || '-'} />
                  <InfoItem
                    label="Jenis Kelamin"
                    value={employee.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}
                  />
                  <InfoItem label="Agama" value={employee.religion || '-'} />
                  <InfoItem
                    label="Status Perkawinan"
                    value={
                      employee.maritalStatus === 'SINGLE'
                        ? 'Belum Menikah'
                        : employee.maritalStatus === 'MARRIED'
                        ? 'Menikah'
                        : employee.maritalStatus === 'DIVORCED'
                        ? 'Cerai'
                        : 'Janda/Duda'
                    }
                  />
                  <InfoItem label="Golongan Darah" value={employee.bloodType || '-'} />
                  <InfoItem label="Kewarganegaraan" value={employee.nationality || '-'} />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Informasi Kontak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Nomor Telepon</p>
                      <p className="font-medium">{employee.phone || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Email Perusahaan</p>
                      <p className="font-medium">{employee.email || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Email Pribadi</p>
                      <p className="font-medium">{employee.personalEmail || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Kode Pos</p>
                      <p className="font-medium">{employee.postalCode || '-'}</p>
                    </div>
                  </div>
                </div>
                {employee.addressDetail && (
                  <>
                    <Separator className="my-4" />
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Alamat Lengkap</p>
                        <p className="font-medium">{employee.addressDetail}</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            {(employee.emergencyContactName ||
              employee.emergencyContactPhone ||
              employee.emergencyContactRelation) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Kontak Darurat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InfoItem label="Nama" value={employee.emergencyContactName || '-'} />
                    <InfoItem label="Nomor Telepon" value={employee.emergencyContactPhone || '-'} />
                    <InfoItem label="Hubungan" value={employee.emergencyContactRelation || '-'} />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Biography & Skills */}
            {(employee.biography || (employee.skills && employee.skills.length > 0) || (employee.languages && employee.languages.length > 0)) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Informasi Tambahan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {employee.biography && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Biografi</p>
                      <p className="text-sm">{employee.biography}</p>
                    </div>
                  )}
                  {employee.skills && employee.skills.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Keahlian</p>
                      <div className="flex flex-wrap gap-2">
                        {employee.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {employee.languages && employee.languages.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Bahasa</p>
                      <div className="flex flex-wrap gap-2">
                        {employee.languages.map((language, index) => (
                          <Badge key={index} variant="outline">
                            {language}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Employment Tab */}
          <TabsContent value="employment" className="space-y-6">
            {/* Employment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Detail Kepegawaian
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem label="Kode Karyawan" value={employee.employeeCode || '-'} />
                  <InfoItem label="Employee ID" value={employee.employeeId} />
                  <InfoItem label="Departemen" value={employee.department?.departmentName || '-'} />
                  <InfoItem label="Posisi/Jabatan" value={employee.position?.positionName || '-'} />
                  <InfoItem
                    label="Jenis Kepegawaian"
                    value={
                      employee.employmentType === 'PERMANENT'
                        ? 'Tetap'
                        : employee.employmentType === 'CONTRACT'
                        ? 'Kontrak'
                        : employee.employmentType === 'TEMPORARY'
                        ? 'Sementara'
                        : employee.employmentType === 'INTERN'
                        ? 'Magang'
                        : 'Freelance'
                    }
                  />
                  <InfoItem
                    label="Status Kepegawaian"
                    value={
                      <Badge
                        variant={
                          employee.employmentStatus === 'ACTIVE'
                            ? 'default'
                            : employee.employmentStatus === 'PROBATION'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {employee.employmentStatus === 'ACTIVE' && 'Aktif'}
                        {employee.employmentStatus === 'PROBATION' && 'Probation'}
                        {employee.employmentStatus === 'SUSPENDED' && 'Suspended'}
                        {employee.employmentStatus === 'TERMINATED' && 'Diberhentikan'}
                        {employee.employmentStatus === 'RESIGNED' && 'Resign'}
                        {employee.employmentStatus === 'RETIRED' && 'Pensiun'}
                      </Badge>
                    }
                  />
                  <InfoItem
                    label="Tanggal Bergabung"
                    value={format(new Date(employee.joinDate), 'dd MMMM yyyy', {
                      locale: idLocale,
                    })}
                  />
                  {employee.probationEndDate && (
                    <InfoItem
                      label="Akhir Masa Percobaan"
                      value={format(new Date(employee.probationEndDate), 'dd MMMM yyyy', {
                        locale: idLocale,
                      })}
                    />
                  )}
                  {employee.contractStartDate && (
                    <InfoItem
                      label="Mulai Kontrak"
                      value={format(new Date(employee.contractStartDate), 'dd MMMM yyyy', {
                        locale: idLocale,
                      })}
                    />
                  )}
                  {employee.contractEndDate && (
                    <InfoItem
                      label="Akhir Kontrak"
                      value={format(new Date(employee.contractEndDate), 'dd MMMM yyyy', {
                        locale: idLocale,
                      })}
                    />
                  )}
                  {employee.terminationDate && (
                    <InfoItem
                      label="Tanggal Berhenti"
                      value={format(new Date(employee.terminationDate), 'dd MMMM yyyy', {
                        locale: idLocale,
                      })}
                    />
                  )}
                  <InfoItem label="Atasan Langsung" value={employee.directSupervisor || '-'} />
                  <InfoItem label="Lokasi Kerja" value={employee.workLocation || '-'} />
                </div>
              </CardContent>
            </Card>

            {/* Compensation Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Informasi Kompensasi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem
                    label="Gaji Pokok"
                    value={
                      employee.basicSalary
                        ? `${employee.currency || 'IDR'} ${employee.basicSalary.toLocaleString('id-ID')}`
                        : '-'
                    }
                  />
                  <InfoItem label="Grade Gaji" value={employee.salaryGrade || '-'} />
                  <InfoItem label="NPWP" value={employee.taxId || '-'} />
                  <InfoItem label="Nomor Rekening" value={employee.bankAccount || '-'} />
                  <InfoItem label="Nama Bank" value={employee.bankName || '-'} />
                  <InfoItem label="Cabang Bank" value={employee.bankBranch || '-'} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Dokumen Karyawan
                </CardTitle>
                <CardDescription>
                  Dokumen dan berkas terkait karyawan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Belum ada dokumen yang diunggah
                  </p>
                  <Button variant="outline" className="mt-4">
                    Upload Dokumen
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Riwayat Kehadiran
                </CardTitle>
                <CardDescription>
                  Data kehadiran dan absensi karyawan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Belum ada data kehadiran
                  </p>
                  <Button variant="outline" className="mt-4">
                    Lihat Jadwal Kerja
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leave Tab */}
          <TabsContent value="leave">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="h-5 w-5" />
                  Riwayat Cuti
                </CardTitle>
                <CardDescription>
                  Data pengajuan cuti dan saldo cuti
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Plane className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Belum ada data cuti
                  </p>
                  <Button variant="outline" className="mt-4">
                    Ajukan Cuti
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payroll Tab */}
          <TabsContent value="payroll">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Riwayat Penggajian
                </CardTitle>
                <CardDescription>
                  Data penggajian dan slip gaji karyawan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Belum ada data penggajian
                  </p>
                  <Button variant="outline" className="mt-4">
                    Lihat Slip Gaji
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Karyawan?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus karyawan <strong>{employee.fullName}</strong>?
              <br />
              <br />
              Tindakan ini akan menghapus data karyawan. Jika karyawan memiliki data terkait
              (absensi, cuti, payroll), data akan tetap tersimpan tetapi karyawan akan ditandai
              sebagai nonaktif.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Menghapus...' : 'Hapus Karyawan'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// Helper component for displaying information
function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
}
