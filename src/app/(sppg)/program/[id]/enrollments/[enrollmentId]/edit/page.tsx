/**
 * @fileoverview Edit Beneficiary Enrollment Page
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.19.0
 * @author Bagizi-ID Development Team
 * 
 * Page: /program/[id]/enrollments/[enrollmentId]/edit
 * Purpose: Form to edit existing beneficiary enrollment
 * 
 * Features:
 * - Pre-filled form with existing data
 * - Organization selection (readonly)
 * - Beneficiary count update
 * - Feeding schedule update
 * - Budget allocation update
 * - Full form validation
 */

'use client'

import { Suspense, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { BeneficiaryEnrollmentForm } from '@/features/sppg/program/components/beneficiary/BeneficiaryEnrollmentForm'
import { useBeneficiaryEnrollment } from '@/features/sppg/program/hooks/useBeneficiaryEnrollments'

interface EditEnrollmentPageProps {
  params: Promise<{ id: string; enrollmentId: string }>
}

function EditEnrollmentContent({ params }: EditEnrollmentPageProps) {
  const router = useRouter()
  const { id: programId, enrollmentId } = use(params)

  const { data: enrollment, isLoading, error } = useBeneficiaryEnrollment(enrollmentId)

  const handleSuccess = () => {
    router.push(`/program/${programId}`)
  }

  const handleCancel = () => {
    router.push(`/program/${programId}`)
  }

  if (isLoading) {
    return <EditEnrollmentPageSkeleton />
  }

  if (error || !enrollment) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Pendaftaran Tidak Ditemukan</h4>
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : 'Data tidak tersedia'}
              </p>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="mt-4"
              >
                Kembali ke Daftar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Daftar Penerima
          </Button>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Pendaftaran</h1>
        <p className="text-muted-foreground">
          Perbarui informasi pendaftaran penerima manfaat
        </p>
      </div>

      <Separator />

      {/* Form */}
      <BeneficiaryEnrollmentForm 
        enrollmentId={enrollmentId}
        programId={programId}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  )
}

export default function EditEnrollmentPage(props: EditEnrollmentPageProps) {
  return (
    <Suspense fallback={<EditEnrollmentPageSkeleton />}>
      <EditEnrollmentContent {...props} />
    </Suspense>
  )
}

function EditEnrollmentPageSkeleton() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-48" />
      </div>
      <Skeleton className="h-12 w-64" />
      <Separator />
      <Skeleton className="h-96 w-full" />
    </div>
  )
}
