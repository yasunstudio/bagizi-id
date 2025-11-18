/**
 * @fileoverview Edit Beneficiary Organization Page
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

'use client'

import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BeneficiaryOrganizationForm } from '@/features/sppg/program/components/beneficiary'
import { useBeneficiaryOrganization } from '@/features/sppg/program/hooks'
import { Skeleton } from '@/components/ui/skeleton'

export default function EditBeneficiaryOrganizationPage() {
  const router = useRouter()
  const params = useParams()
  const organizationId = params.id as string

  const { data: organization, isLoading } = useBeneficiaryOrganization(organizationId)

  const handleSuccess = () => {
    router.push('/program/beneficiary-organizations')
  }

  const handleCancel = () => {
    router.back()
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-96" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
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
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Organisasi Penerima Manfaat</h1>
          <p className="text-muted-foreground">
            {organization.organizationName}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Organisasi</CardTitle>
          <CardDescription>
            Update data organisasi penerima manfaat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BeneficiaryOrganizationForm
            organizationId={organizationId}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  )
}
