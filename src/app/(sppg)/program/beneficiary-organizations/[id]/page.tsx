/**
 * @fileoverview Detail Beneficiary Organization Page
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

'use client'

import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, Building2, Mail, Phone, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useBeneficiaryOrganization, useDeleteBeneficiaryOrganization } from '@/features/sppg/program/hooks'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export default function BeneficiaryOrganizationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const organizationId = params.id as string

  const { data: organization, isLoading } = useBeneficiaryOrganization(organizationId)
  const { mutate: deleteOrganization, isPending: isDeleting } = useDeleteBeneficiaryOrganization()

  const handleEdit = () => {
    router.push(`/program/beneficiary-organizations/${organizationId}/edit`)
  }

  const handleDelete = () => {
    if (confirm(`Apakah Anda yakin ingin menghapus ${organization?.organizationName}?`)) {
      deleteOrganization(organizationId, {
        onSuccess: () => {
          toast.success('Organisasi berhasil dihapus')
          router.push('/program/beneficiary-organizations')
        },
        onError: (error) => {
          toast.error(error.message || 'Gagal menghapus organisasi')
        }
      })
    }
  }

  const getTypeBadge = (type: string) => {
    const typeMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
      SCHOOL: { label: 'Sekolah', variant: 'default' },
      HEALTH_FACILITY: { label: 'Fasilitas Kesehatan', variant: 'secondary' },
      INTEGRATED_SERVICE_POST: { label: 'Posyandu', variant: 'outline' },
    }
    const config = typeMap[type] || { label: type, variant: 'outline' as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getSubTypeBadge = (subType: string) => {
    return <Badge variant="outline">{subType}</Badge>
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-96" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">Organisasi tidak ditemukan</p>
            <Button onClick={() => router.back()} className="mt-4">
              Kembali
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{organization.organizationName}</h1>
              {getTypeBadge(organization.type)}
              {organization.subType && getSubTypeBadge(organization.subType)}
            </div>
            <p className="text-muted-foreground mt-1">
              Kode: {organization.organizationCode}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleEdit} variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            onClick={handleDelete}
            variant="destructive"
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? 'Menghapus...' : 'Hapus'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informasi Dasar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nama Organisasi</label>
              <p className="text-base mt-1">{organization.organizationName}</p>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-muted-foreground">Kode Organisasi</label>
              <p className="text-base mt-1 font-mono">{organization.organizationCode}</p>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-muted-foreground">Jenis Organisasi</label>
              <div className="mt-1">{getTypeBadge(organization.type)}</div>
            </div>
            {organization.subType && (
              <>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Sub Jenis</label>
                  <div className="mt-1">{getSubTypeBadge(organization.subType)}</div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Informasi Kontak
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Alamat
              </label>
              <p className="text-base mt-1">{organization.address || '-'}</p>
              {(organization.regency || organization.district || organization.village) && (
                <p className="text-sm text-muted-foreground mt-1">
                  {organization.regency?.name || ''}
                  {organization.district && `, ${organization.district.name}`}
                  {organization.village && `, ${organization.village.name}`}
                  {organization.province && `, ${organization.province.name}`}
                  {organization.postalCode && ` ${organization.postalCode}`}
                </p>
              )}
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Telepon
              </label>
              <p className="text-base mt-1">{organization.phone || '-'}</p>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </label>
              <p className="text-base mt-1">{organization.email || '-'}</p>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-muted-foreground">Contact Person</label>
              <p className="text-base mt-1">{organization.contactPerson || '-'}</p>
              {organization.contactTitle && (
                <p className="text-sm text-muted-foreground mt-1">{organization.contactTitle}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Information */}
      {(organization.npsn || organization.description) && (
        <Card>
          <CardHeader>
            <CardTitle>Informasi Tambahan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {organization.npsn && (
              <>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">NPSN</label>
                  <p className="text-base mt-1 font-mono">{organization.npsn}</p>
                </div>
                <Separator />
              </>
            )}
            {organization.description && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Deskripsi</label>
                <p className="text-base mt-1 whitespace-pre-wrap">{organization.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
