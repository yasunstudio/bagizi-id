'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react'
import {
  useBeneficiaryEnrollments,
  useDeleteBeneficiaryEnrollment,
} from '../../hooks'
import type { BeneficiaryEnrollmentFilters } from '../../types/beneficiaryEnrollment.types'
import type { TargetGroup } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
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

interface BeneficiaryEnrollmentListProps {
  programId?: string
  targetGroupFilter?: TargetGroup
  searchQuery?: string
  statusFilter?: string
  onEditClick?: (id: string) => void
}

export function BeneficiaryEnrollmentList({
  programId,
  targetGroupFilter,
  searchQuery,
  statusFilter,
  onEditClick,
}: BeneficiaryEnrollmentListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [enrollmentToDelete, setEnrollmentToDelete] = useState<string | null>(null)

  const filters: BeneficiaryEnrollmentFilters = {
    ...(programId && { programId }),
    ...(targetGroupFilter && { targetGroup: targetGroupFilter }),
  }

  const { data: allEnrollments, isLoading } = useBeneficiaryEnrollments(filters)
  const { mutate: deleteEnrollment, isPending: isDeleting } = useDeleteBeneficiaryEnrollment()

  // Client-side filtering for search and status
  const enrollments = allEnrollments?.filter((enrollment) => {
    // Search filter (already handled in parent, but keep for backward compatibility)
    if (searchQuery) {
      const search = searchQuery.toLowerCase()
      const orgName = enrollment.beneficiaryOrg?.organizationName?.toLowerCase() || ''
      const orgCode = enrollment.beneficiaryOrg?.organizationCode?.toLowerCase() || ''
      if (!orgName.includes(search) && !orgCode.includes(search)) {
        return false
      }
    }

    // Status filter (already handled in parent, but keep for backward compatibility)
    if (statusFilter && enrollment.enrollmentStatus !== statusFilter) {
      return false
    }

    return true
  })

  const handleDelete = (id: string) => {
    setEnrollmentToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (enrollmentToDelete) {
      deleteEnrollment(enrollmentToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false)
          setEnrollmentToDelete(null)
        },
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="default">Aktif</Badge>
      case 'PAUSED':
        return <Badge variant="secondary">Ditangguhkan</Badge>
      case 'COMPLETED':
        return <Badge variant="outline">Selesai</Badge>
      case 'CANCELLED':
        return <Badge variant="destructive">Dibatalkan</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTargetGroupBadge = (targetGroup: string) => {
    const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      SCHOOL_CHILDREN: { label: '🎓 Anak Sekolah', variant: 'default' },
      PREGNANT_WOMAN: { label: '🤰 Ibu Hamil', variant: 'secondary' },
      BREASTFEEDING_MOTHER: { label: '🤱 Ibu Menyusui', variant: 'outline' },
      TODDLER: { label: '👶 Balita', variant: 'secondary' },
      TEENAGE_GIRL: { label: '👧 Remaja Putri', variant: 'default' },
      ELDERLY: { label: '👴 Lansia', variant: 'outline' },
      STUNTING_RISK: { label: '⚠️ Risiko Stunting', variant: 'destructive' },
    }

    const { label, variant } = config[targetGroup] || { label: targetGroup, variant: 'outline' as const }
    return <Badge variant={variant}>{label}</Badge>
  }

  const formatDateString = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organisasi</TableHead>
                  <TableHead>Kelompok Target</TableHead>
                  <TableHead className="text-right">Target</TableHead>
                  <TableHead className="text-right">Aktif</TableHead>
                  <TableHead>Periode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments && enrollments.length > 0 ? (
                  enrollments.map((enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {enrollment.beneficiaryOrg?.organizationName || 'N/A'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {enrollment.beneficiaryOrg?.organizationCode || 'N/A'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getTargetGroupBadge(enrollment.targetGroup)}
                      </TableCell>
                      <TableCell className="text-right">
                        {enrollment.targetBeneficiaries.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell className="text-right">
                        {enrollment.activeBeneficiaries?.toLocaleString('id-ID') || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatDateString(enrollment.startDate)}</div>
                          {enrollment.endDate && (
                            <div className="text-muted-foreground">
                              s/d {formatDateString(enrollment.endDate)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(enrollment.enrollmentStatus)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Buka menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/program/beneficiary-enrollments/${enrollment.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                Lihat Detail
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEditClick?.(enrollment.id)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(enrollment.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Belum ada pendaftaran penerima manfaat
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pendaftaran</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pendaftaran ini? Tindakan ini tidak dapat
              dibatalkan dan akan menghapus semua data distribusi terkait.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}