/**
 * @fileoverview Edit Beneficiary Organization Page - Edit existing organization
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 */

import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { beneficiaryOrganizationApi } from '@/features/sppg/beneficiary-organization/api/beneficiaryOrganizationApi'
import { BeneficiaryOrganizationForm } from '@/features/sppg/beneficiary-organization/components/BeneficiaryOrganizationForm'

interface EditBeneficiaryOrganizationPageProps {
  params: Promise<{ id: string }>
}

export default async function EditBeneficiaryOrganizationPage({
  params,
}: EditBeneficiaryOrganizationPageProps) {
  const { id } = await params
  
  // CRITICAL: Extract cookie for SSR authentication
  const headersList = await headers()
  const cookieHeader = headersList.get('cookie')
  const requestHeaders = cookieHeader ? { Cookie: cookieHeader } : undefined
  
  const result = await beneficiaryOrganizationApi.getById(id, requestHeaders)

  if (!result.success || !result.data) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link href={`/beneficiary-organizations/${id}`}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Edit Organisasi Penerima Manfaat
          </h1>
          <p className="text-muted-foreground mt-1">
            Perbarui informasi {result.data.organizationName}
          </p>
        </div>
      </div>

      {/* Form */}
      <BeneficiaryOrganizationForm mode="edit" organization={result.data} />
    </div>
  )
}
