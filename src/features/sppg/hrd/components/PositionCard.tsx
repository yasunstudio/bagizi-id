/**
 * @fileoverview Position Detail Card Component
 * Displays comprehensive position information
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import Link from 'next/link'
import {
  Building2,
  Calendar,
  DollarSign,
  Edit,
  FileText,
  ListChecks,
  Trash2,
  User,
  Users,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { useDeletePosition } from '../hooks/usePositions'
import type { PositionWithRelations } from '../types/position.types'
import { EMPLOYEE_LEVEL_LABELS, EMPLOYEE_LEVEL_COLORS } from '../types/position.types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useRouter } from 'next/navigation'

interface PositionCardProps {
  position: PositionWithRelations
}

export function PositionCard({ position }: PositionCardProps) {
  const router = useRouter()
  const { mutate: deletePosition, isPending: isDeleting } = useDeletePosition()

  const handleDelete = () => {
    deletePosition(position.id, {
      onSuccess: () => {
        router.push('/hrd/positions')
      },
    })
  }

  // Calculate occupancy
  const occupancyPercentage = position.maxOccupants > 0
    ? Math.round((position.currentOccupants / position.maxOccupants) * 100)
    : 0

  const getOccupancyStatus = () => {
    if (occupancyPercentage >= 100) return { color: 'text-red-600 dark:text-red-400', icon: AlertCircle, label: 'Penuh' }
    if (occupancyPercentage >= 80) return { color: 'text-yellow-600 dark:text-yellow-400', icon: AlertCircle, label: 'Hampir Penuh' }
    return { color: 'text-green-600 dark:text-green-400', icon: CheckCircle2, label: 'Tersedia' }
  }

  const occupancyStatus = getOccupancyStatus()
  const OccupancyIcon = occupancyStatus.icon

  // Format currency
  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: position.currency || 'IDR',
    minimumFractionDigits: 0,
  })

  const hasEmployees = position.currentOccupants > 0

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <CardTitle className="text-3xl">{position.positionName}</CardTitle>
                <Badge variant={position.isActive ? 'default' : 'secondary'}>
                  {position.isActive ? 'Aktif' : 'Nonaktif'}
                </Badge>
                <Badge variant={EMPLOYEE_LEVEL_COLORS[position.level]}>
                  {EMPLOYEE_LEVEL_LABELS[position.level]}
                </Badge>
              </div>
              <p className="text-sm font-mono text-muted-foreground">
                {position.positionCode}
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/hrd/positions/${position.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={hasEmployees}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Posisi</AlertDialogTitle>
                    <AlertDialogDescription>
                      Apakah Anda yakin ingin menghapus posisi &ldquo;{position.positionName}&rdquo;?
                      Tindakan ini tidak dapat dibatalkan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? 'Menghapus...' : 'Hapus'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
        {position.jobDescription && (
          <CardContent>
            <p className="text-muted-foreground">{position.jobDescription}</p>
          </CardContent>
        )}
      </Card>

      {/* Department & Occupancy */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Departemen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href={`/hrd/departments/${position.department.id}`}
              className="flex items-center gap-3 rounded-lg border p-4 hover:bg-accent transition-colors"
            >
              <div className="flex-1">
                <div className="font-medium">{position.department.departmentName}</div>
                <div className="text-sm text-muted-foreground">
                  {position.department.departmentCode}
                </div>
              </div>
              <Badge variant={position.department.isActive ? 'default' : 'secondary'}>
                {position.department.isActive ? 'Aktif' : 'Nonaktif'}
              </Badge>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Okupansi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <OccupancyIcon className={`h-5 w-5 ${occupancyStatus.color}`} />
                <span className={`font-medium ${occupancyStatus.color}`}>
                  {occupancyStatus.label}
                </span>
              </div>
              <span className="text-2xl font-bold">
                {position.currentOccupants}/{position.maxOccupants}
              </span>
            </div>
            <div className="space-y-2">
              <Progress
                value={occupancyPercentage}
                className={`h-3 ${
                  occupancyPercentage >= 100
                    ? '[&>div]:bg-red-600'
                    : occupancyPercentage >= 80
                    ? '[&>div]:bg-yellow-600'
                    : '[&>div]:bg-green-600'
                }`}
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Terisi {occupancyPercentage}%</span>
                <span>Sisa {position.maxOccupants - position.currentOccupants} slot</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Salary Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Informasi Gaji
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Gaji Minimum</div>
              <div className="text-2xl font-bold">
                {formatter.format(position.minSalary || 0)}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Gaji Maksimum</div>
              <div className="text-2xl font-bold">
                {formatter.format(position.maxSalary || 0)}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Rata-rata</div>
              <div className="text-2xl font-bold">
                {formatter.format(((position.minSalary || 0) + (position.maxSalary || 0)) / 2)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requirements */}
      {position.requirements && position.requirements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5" />
              Persyaratan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2">
              {position.requirements.map((req, index) => (
                <li key={index} className="text-muted-foreground">
                  {req}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Responsibilities */}
      {position.responsibilities && position.responsibilities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Tanggung Jawab
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2">
              {position.responsibilities.map((resp, index) => (
                <li key={index} className="text-muted-foreground">
                  {resp}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Employees */}
      {position.employees && position.employees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Pegawai di Posisi Ini ({position.employees.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {position.employees.slice(0, 5).map((employee) => (
                <Link
                  key={employee.id}
                  href={`/hrd/employees/${employee.id}`}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{employee.fullName}</div>
                      <div className="text-sm text-muted-foreground">
                        {employee.employeeCode}
                      </div>
                    </div>
                  </div>
                  <Badge variant={employee.employmentStatus === 'ACTIVE' ? 'default' : 'secondary'}>
                    {employee.employmentStatus === 'ACTIVE' ? 'Aktif' : employee.employmentStatus}
                  </Badge>
                </Link>
              ))}
              {position.employees.length > 5 && (
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/hrd/employees?positionId=${position.id}`}>
                    Lihat Semua {position.employees.length} Pegawai
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cannot Delete Warning */}
      {hasEmployees && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-600 dark:text-yellow-400">
                  Posisi Tidak Dapat Dihapus
                </h4>
                <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                  Posisi ini memiliki {position.currentOccupants} pegawai aktif. Pindahkan atau
                  nonaktifkan pegawai terlebih dahulu sebelum menghapus posisi ini.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Informasi Sistem
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Dibuat</div>
              <div className="font-medium">
                {new Date(position.createdAt).toLocaleDateString('id-ID', {
                  dateStyle: 'long',
                })}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Terakhir Diperbarui</div>
              <div className="font-medium">
                {new Date(position.updatedAt).toLocaleDateString('id-ID', {
                  dateStyle: 'long',
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
