/**
 * @fileoverview Edit Program Enrollment Page
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.18.0
 * @author Bagizi-ID Development Team
 * 
 * Page: /program/[id]/enrollments/[enrollmentId]/edit
 * Purpose: Form to edit existing school enrollment
 * 
 * Features:
 * - Pre-filled form with existing data
 * - School selection (readonly)
 * - Student configuration update
 * - Feeding schedule update
 * - Budget allocation update
 * - Full form validation
 */

'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { XCircle } from 'lucide-react'
import { EnrollmentForm } from '@/features/sppg/program/components/enrollments/EnrollmentForm'
import { useEnrollment } from '@/features/sppg/program/hooks'

interface EditEnrollmentPageProps {
  params: Promise<{ id: string; enrollmentId: string }>
}

export default function EditEnrollmentPage({ params }: EditEnrollmentPageProps) {
  const router = useRouter()
  const { id: programId, enrollmentId } = use(params)

  const { data: enrollment, isLoading, error } = useEnrollment(programId, enrollmentId)

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-48" />
        </div>
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error || !enrollment) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Enrollment Tidak Ditemukan</h4>
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : 'Data tidak tersedia'}
              </p>
              <Button
                onClick={() => router.push(`/program/${programId}/enrollments`)}
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
            onClick={() => router.push(`/program/${programId}/enrollments/${enrollmentId}`)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Detail
          </Button>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Enrollment</h1>
        <p className="text-muted-foreground">
          Edit informasi enrollment untuk {enrollment.school.schoolName}
        </p>
      </div>

      <Separator />

      {/* Form */}
      <EnrollmentForm 
        programId={programId} 
        enrollmentId={enrollmentId}
        enrollment={enrollment}
        mode="edit" 
      />
    </div>
  )
}
