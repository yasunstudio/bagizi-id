/**
 * @fileoverview Beneficiary Organizations List Page
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * List page untuk beneficiary organizations dengan navigasi ke halaman terpisah
 */

'use client'

import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BeneficiaryOrganizationList } from '@/features/sppg/program/components/beneficiary'
import { useBeneficiaryOrganizations } from '@/features/sppg/program/hooks'
import { Skeleton } from '@/components/ui/skeleton'

export default function BeneficiaryOrganizationsPage() {
  const router = useRouter()
  const { data: organizations, isLoading } = useBeneficiaryOrganizations()

  const handleCreate = () => {
    router.push('/program/beneficiary-organizations/new')
  }

  const handleEdit = (orgId: string) => {
    router.push(`/program/beneficiary-organizations/${orgId}/edit`)
  }

  // Calculate stats
  const stats = organizations
    ? {
        total: organizations.length,
        schools: organizations.filter((org) => org.type === 'SCHOOL').length,
        healthFacilities: organizations.filter((org) => org.type === 'HEALTH_FACILITY').length,
        servicePosts: organizations.filter((org) => org.type === 'INTEGRATED_SERVICE_POST').length,
      }
    : null

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organisasi Penerima Manfaat</h1>
          <p className="text-muted-foreground">
            Kelola semua organisasi penerima manfaat (sekolah, posyandu, puskesmas, dll)
          </p>
        </div>
        <Button onClick={handleCreate} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Organisasi
        </Button>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Organisasi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">Semua jenis</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sekolah</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.schools}</div>
              <p className="text-xs text-muted-foreground mt-1">SD, SMP, SMA, SMK, Pesantren</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fasilitas Kesehatan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.healthFacilities}</div>
              <p className="text-xs text-muted-foreground mt-1">Puskesmas, Klinik, RS</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Posyandu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.servicePosts}</div>
              <p className="text-xs text-muted-foreground mt-1">Pos Pelayanan Terpadu</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Organizations List */}
      <BeneficiaryOrganizationList
        showCreateButton={false}
        onEditClick={handleEdit}
      />
    </div>
  )
}
