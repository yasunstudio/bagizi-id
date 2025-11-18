/**
 * @fileoverview Create Beneficiary Organization Page
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BeneficiaryOrganizationForm } from '@/features/sppg/program/components/beneficiary'

export default function CreateBeneficiaryOrganizationPage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push('/program/beneficiary-organizations')
  }

  const handleCancel = () => {
    router.back()
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
          <h1 className="text-3xl font-bold tracking-tight">Tambah Organisasi Penerima Manfaat</h1>
          <p className="text-muted-foreground">
            Daftarkan organisasi baru sebagai penerima manfaat program
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Organisasi</CardTitle>
          <CardDescription>
            Lengkapi data organisasi penerima manfaat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BeneficiaryOrganizationForm
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  )
}
