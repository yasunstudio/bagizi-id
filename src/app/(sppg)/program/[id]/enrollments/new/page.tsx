/**
 * @fileoverview Create New Beneficiary Enrollment Page
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.19.0
 * @author Bagizi-ID Development Team
 * 
 * Page: /program/[id]/enrollments/new
 * Purpose: Form to create new beneficiary enrollment
 * 
 * Features:
 * - Organization selection
 * - Target group configuration
 * - Beneficiary count setup
 * - Feeding schedule setup
 * - Budget allocation
 * - Full form validation
 * 
 * URL Query Parameters:
 * - targetGroup: Pre-select target group (optional)
 */

'use client'

import { Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { BeneficiaryEnrollmentForm } from '@/features/sppg/program/components/beneficiary/BeneficiaryEnrollmentForm'
import type { TargetGroup } from '@prisma/client'

function NewEnrollmentContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const programId = params.id as string
  const targetGroup = searchParams.get('targetGroup') as TargetGroup | undefined

  const handleSuccess = () => {
    router.push(`/program/${programId}`)
  }

  const handleCancel = () => {
    router.push(`/program/${programId}`)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="gap-2 -ml-2 hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tambah Pendaftaran Penerima Manfaat</h1>
          <p className="text-muted-foreground mt-1">
            Daftarkan organisasi penerima manfaat ke program ini
          </p>
        </div>
      </div>

      {/* Form */}
      <BeneficiaryEnrollmentForm 
        programId={programId}
        targetGroup={targetGroup}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  )
}

export default function NewEnrollmentPage() {
  return (
    <Suspense fallback={<NewEnrollmentPageSkeleton />}>
      <NewEnrollmentContent />
    </Suspense>
  )
}

function NewEnrollmentPageSkeleton() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-10 w-96" />
        <Skeleton className="h-5 w-64" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  )
}
