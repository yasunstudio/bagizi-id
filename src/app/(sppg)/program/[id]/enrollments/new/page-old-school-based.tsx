/**
 * @fileoverview Create New Program Enrollment Page
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.18.0
 * @author Bagizi-ID Development Team
 * 
 * Page: /program/[id]/enrollments/new
 * Purpose: Form to create new school enrollment
 * 
 * Features:
 * - School selection with search
 * - Student configuration
 * - Feeding schedule setup
 * - Budget allocation
 * - Full form validation
 */

'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { EnrollmentForm } from '@/features/sppg/program/components/enrollments/EnrollmentForm'

export default function NewEnrollmentPage() {
  const params = useParams()
  const router = useRouter()
  const programId = params.id as string

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/program/${programId}/enrollments`)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Daftar Sekolah
          </Button>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Tambah Sekolah Baru</h1>
        <p className="text-muted-foreground">
          Daftarkan sekolah baru ke program ini
        </p>
      </div>

      <Separator />

      {/* Form */}
      <EnrollmentForm programId={programId} mode="create" />
    </div>
  )
}
