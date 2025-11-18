/**
 * @fileoverview Program Detail Page - View program details dengan tabs
 * @version Next.js 15.5.4 App Router (Refactored to modular components)
 * @author Bagizi-ID Development Team
 */

'use client'

import React, { use } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { useProgram, useDeleteProgram } from '@/features/sppg/program/hooks'
import { 
  ProgramDetailHeader,
  ProgramOverviewTab,
  ProgramScheduleTab,
  ProgramBudgetTab,
  ProgramNutritionTab,
  // ProgramMonitoringTab, // 🔒 Hidden - monitoring feature temporarily disabled
  ProgramEnrollmentsTab
} from '@/features/sppg/program/components'
import { toast } from 'sonner'

interface ProgramDetailPageProps {
  params: Promise<{ id: string }>
}

export default function ProgramDetailPage({ params }: ProgramDetailPageProps) {
  const router = useRouter()
  const { id } = use(params)
  const { data: program, isLoading, error, refetch } = useProgram(id)
  const { mutate: deleteProgram } = useDeleteProgram()

  // Refetch data when page is focused (user comes back from edit page)
  React.useEffect(() => {
    const handleFocus = () => {
      refetch()
    }
    
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [refetch])

  const handleBack = () => {
    router.push('/program')
  }

  const handleEdit = () => {
    router.push(`/program/${id}/edit`)
  }

  const handleDelete = () => {
    if (confirm('Apakah Anda yakin ingin menghapus program ini?')) {
      deleteProgram(id, {
        onSuccess: () => {
          toast.success('Program berhasil dihapus')
          router.push('/program')
        },
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Memuat detail program...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !program) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Program tidak ditemukan</h2>
            <p className="text-muted-foreground mb-4">
              Program yang Anda cari tidak tersedia atau telah dihapus.
            </p>
            <button
              onClick={handleBack}
              className="text-primary hover:underline"
            >
              Kembali ke daftar program
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header Section */}
      <ProgramDetailHeader
        program={program}
        onBack={handleBack}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Separator />

      {/* Tabs Section */}
      <Tabs defaultValue="overview" className="w-full">
        {/* Updated to show Beneficiary Enrollments instead of Schools */}
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Ringkasan</TabsTrigger>
          <TabsTrigger value="schedule">Jadwal</TabsTrigger>
          <TabsTrigger value="budget">Anggaran</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrisi</TabsTrigger>
          <TabsTrigger value="enrollments">Penerima Manfaat</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ProgramOverviewTab program={program} />
        </TabsContent>

        <TabsContent value="schedule">
          <ProgramScheduleTab program={program} />
        </TabsContent>

        <TabsContent value="budget">
          <ProgramBudgetTab program={program} />
        </TabsContent>

        <TabsContent value="nutrition">
          <ProgramNutritionTab program={program} onEdit={handleEdit} />
        </TabsContent>

        <TabsContent value="enrollments">
          <ProgramEnrollmentsTab programId={id} />
        </TabsContent>

        {/* 🔒 MONITORING TAB HIDDEN - Uncomment to re-enable
        <TabsContent value="monitoring">
          <ProgramMonitoringTab programId={id} />
        </TabsContent>
        */}
      </Tabs>
    </div>
  )
}