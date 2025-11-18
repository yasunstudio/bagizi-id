/**
 * @fileoverview New Beneficiary Organization Page - Create New Organization
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 */

'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BeneficiaryOrganizationForm } from '@/features/sppg/beneficiary-organization/components/BeneficiaryOrganizationForm'

export default function NewBeneficiaryOrganizationPage() {
  const router = useRouter()

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Tambah Organisasi Penerima Manfaat
          </h1>
          <p className="text-muted-foreground mt-1">
            Daftarkan sekolah, posyandu, puskesmas, atau organisasi penerima manfaat lainnya
          </p>
        </div>
      </div>

      {/* Form */}
      <BeneficiaryOrganizationForm mode="create" />
    </div>
  )
}
