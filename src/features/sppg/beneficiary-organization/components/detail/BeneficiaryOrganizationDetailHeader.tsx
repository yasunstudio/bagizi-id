/**
 * Beneficiary Organization Detail Header Component
 * Displays organization name, status, and action buttons
 * 
 * @component
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import {
  Building2,
  School,
  Heart,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowLeft,
} from 'lucide-react'
import type { BeneficiaryOrganizationDetail } from '../../api/beneficiaryOrganizationApi'

interface BeneficiaryOrganizationDetailHeaderProps {
  organization: BeneficiaryOrganizationDetail
  onEdit: () => void
  onDelete: () => void
  onBack: () => void
  isDeleting?: boolean
}

export function BeneficiaryOrganizationDetailHeader({
  organization,
  onEdit,
  onDelete,
  onBack,
  isDeleting = false,
}: BeneficiaryOrganizationDetailHeaderProps) {
  const getOrganizationTypeIcon = () => {
    switch (organization.type) {
      case 'SCHOOL':
        return <School className="h-6 w-6 text-primary" />
      case 'HEALTH_FACILITY':
        return <Heart className="h-6 w-6 text-primary" />
      default:
        return <Building2 className="h-6 w-6 text-primary" />
    }
  }

  const getOperationalStatusBadge = () => {
    switch (organization.operationalStatus) {
      case 'ACTIVE':
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Aktif
          </Badge>
        )
      case 'INACTIVE':
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Tidak Aktif
          </Badge>
        )
      case 'TEMPORARILY_CLOSED':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Tutup Sementara
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Tidak Aktif
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-4">
      {/* Header with Title and Status */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button 
            onClick={onBack} 
            variant="ghost" 
            size="icon"
            className="h-12 w-12 rounded-lg hover:bg-accent flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="p-3 rounded-lg bg-primary/10 flex-shrink-0">
            {getOrganizationTypeIcon()}
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {organization.organizationName}
            </h1>
            <div className="flex items-center gap-3">
              <code className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                {organization.organizationCode}
              </code>
              {getOperationalStatusBadge()}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button onClick={onEdit} size="sm" className="gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
                Hapus
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Konfirmasi Penghapusan</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin menghapus organisasi{' '}
                  <strong>{organization.organizationName}</strong>? Tindakan ini
                  tidak dapat dibatalkan dan akan menghapus semua data terkait.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>
                  Ya, Hapus
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  )
}
