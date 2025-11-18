/**
 * @fileoverview Banper Tracking Detail Page - Modular Component-Based
 * @version Next.js 15.5.4 App Router (Refactored)
 * @author Bagizi-ID Development Team
 */

'use client'

import React, { use } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { useBanperTracking, useDeleteBanperTracking } from '@/features/sppg/banper-tracking/hooks'
import { 
  BanperDetailHeader,
  BanperOverviewTab,
  BanperDocumentsTab,
  BanperAllocationsTab,
  BanperTimelineTab,
} from '@/features/sppg/banper-tracking/components/detail'
import { toast } from 'sonner'

interface BanperDetailPageProps {
  params: Promise<{ id: string }>
}

export default function BanperDetailPage({ params }: BanperDetailPageProps) {
  const router = useRouter()
  const { id } = use(params)
  const { data: tracking, isLoading, error, refetch } = useBanperTracking(id)
  const { mutate: deleteTracking } = useDeleteBanperTracking()

  // Refetch data when page is focused
  React.useEffect(() => {
    const handleFocus = () => {
      refetch()
    }
    
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [refetch])

  const handleBack = () => {
    router.push('/banper-tracking')
  }

  const handleEdit = () => {
    router.push(`/banper-tracking/${id}/edit`)
  }

  const handleDelete = () => {
    if (tracking?.bgnStatus !== 'DRAFT_LOCAL') {
      toast.error('Hanya tracking dengan status Draft Lokal yang dapat dihapus')
      return
    }

    if (confirm('Apakah Anda yakin ingin menghapus tracking banper ini?')) {
      deleteTracking(id, {
        onSuccess: () => {
          toast.success('Tracking banper berhasil dihapus')
          router.push('/banper-tracking')
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
            <p className="text-muted-foreground">Memuat detail tracking banper...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !tracking) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Tracking tidak ditemukan</h2>
            <p className="text-muted-foreground mb-4">
              Tracking banper yang Anda cari tidak tersedia atau telah dihapus.
            </p>
            <button
              onClick={handleBack}
              className="text-primary hover:underline"
            >
              Kembali ke daftar tracking
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header Section */}
      <BanperDetailHeader
        tracking={tracking}
        onBack={handleBack}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Separator />

      {/* Tabs Section */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Ringkasan</TabsTrigger>
          <TabsTrigger value="documents">Dokumen</TabsTrigger>
          <TabsTrigger value="allocations">Alokasi</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <BanperOverviewTab tracking={tracking} />
        </TabsContent>

        <TabsContent value="documents">
          <BanperDocumentsTab tracking={tracking} />
        </TabsContent>

        <TabsContent value="allocations">
          <BanperAllocationsTab trackingId={id} />
        </TabsContent>

        <TabsContent value="timeline">
          <BanperTimelineTab tracking={tracking} />
        </TabsContent>
      </Tabs>
    </div>
  )
}