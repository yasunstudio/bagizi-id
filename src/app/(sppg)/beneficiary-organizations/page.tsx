/**
 * @fileoverview Beneficiary Organizations List Page - Thin Orchestrator
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  useBeneficiaryOrganizations,
  useDeleteBeneficiaryOrganization,
} from '@/features/sppg/beneficiary-organization/hooks/useBeneficiaryOrganizations'
import type { BeneficiaryOrganizationFilter } from '@/features/sppg/beneficiary-organization/schemas/beneficiaryOrganizationSchema'
import { BeneficiaryOrganizationStats } from '@/features/sppg/beneficiary-organization/components/BeneficiaryOrganizationStats'
import { BeneficiaryOrganizationFilters } from '@/features/sppg/beneficiary-organization/components/BeneficiaryOrganizationFilters'
import { BeneficiaryOrganizationList } from '@/features/sppg/beneficiary-organization/components/BeneficiaryOrganizationList'

export default function BeneficiaryOrganizationsPage() {
  const router = useRouter()
  const [filters, setFilters] = useState<BeneficiaryOrganizationFilter>({})
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: organizations, isLoading, error } = useBeneficiaryOrganizations(filters)
  const { mutate: deleteOrganization, isPending: isDeleting } = useDeleteBeneficiaryOrganization()

  const handleDelete = () => {
    if (deleteId) {
      deleteOrganization(deleteId, {
        onSuccess: () => {
          setDeleteId(null)
        },
      })
    }
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <p>Gagal memuat data: {(error as Error).message}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* ================================ HEADER ================================ */}
      
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Organisasi Penerima Manfaat</h1>
              <p className="text-muted-foreground mt-1">
                Kelola data sekolah, faskes, dan organisasi lainnya
              </p>
            </div>
          </div>
        </div>
        <Button onClick={() => router.push('/beneficiary-organizations/new')} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Organisasi
        </Button>
      </div>

      {/* ================================ STATISTICS CARDS ================================ */}
      
      <BeneficiaryOrganizationStats 
        organizations={organizations || []} 
        isLoading={isLoading} 
      />

      {/* ================================ FILTERS ================================ */}
      
      <BeneficiaryOrganizationFilters 
        filters={filters} 
        onFiltersChange={setFilters} 
      />

      {/* ================================ TABLE ================================ */}
      
      <Card>
        <CardHeader>
          <CardTitle>Semua Organisasi</CardTitle>
          <CardDescription>
            Daftar lengkap organisasi penerima manfaat yang terdaftar dalam sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BeneficiaryOrganizationList
            organizations={organizations || []}
            isLoading={isLoading}
            onDelete={setDeleteId}
          />
        </CardContent>
      </Card>

      {/* ================================ DELETE DIALOG ================================ */}
      
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Organisasi?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus organisasi ini? Organisasi yang memiliki pendaftaran
              aktif tidak dapat dihapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
