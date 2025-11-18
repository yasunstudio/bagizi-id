/**
 * @fileoverview Banper Request Edit Page
 * @version Next.js 15.5.4 App Router
 * @author Bagizi-ID Development Team
 * 
 * Page untuk edit BANPER request yang sudah ada
 */

'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { BanperRequestForm } from '@/features/sppg/banper-tracking/components'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useBanperTracking, useUpdateBanperTracking } from '@/features/sppg/banper-tracking/hooks'
import type { CreateBanperRequestInput } from '@/features/sppg/banper-tracking/schemas'

interface EditBanperRequestPageProps {
  params: Promise<{ id: string }>
}

export default function EditBanperRequestPage({ params }: EditBanperRequestPageProps) {
  const router = useRouter()
  const { id } = use(params)
  
  // Fetch existing BANPER data
  const { data: tracking, isLoading, error } = useBanperTracking(id)
  const { mutate: updateTracking, isPending } = useUpdateBanperTracking()

  const handleSubmit = async (data: CreateBanperRequestInput) => {
    updateTracking(
      { id, data },
      {
        onSuccess: () => {
          toast.success('Permintaan BANPER berhasil diperbarui')
          router.push(`/banper-tracking/${id}`)
        },
        onError: (error) => {
          toast.error(error.message || 'Gagal memperbarui permintaan BANPER')
        },
      }
    )
  }

  const handleCancel = () => {
    router.push(`/banper-tracking/${id}`)
  }

  // Transform tracking data to form-compatible format
  const formData = tracking ? {
    programId: tracking.programId,
    requestedAmount: tracking.requestedAmount,
    operationalPeriod: tracking.operationalPeriod,
    totalBeneficiaries: tracking.totalBeneficiaries,
    operationalDays: tracking.operationalDays ?? undefined,
    foodCostTotal: tracking.foodCostTotal,
    operationalCost: tracking.operationalCost,
    transportCost: tracking.transportCost ?? undefined,
    utilityCost: tracking.utilityCost ?? undefined,
    staffCost: tracking.staffCost ?? undefined,
    otherCosts: tracking.otherCosts ?? undefined,
    bgnRequestNumber: tracking.bgnRequestNumber ?? undefined,
    bgnSubmissionDate: tracking.bgnSubmissionDate ?? undefined,
    bgnApprovalDate: tracking.bgnApprovalDate ?? undefined,
    bgnStatus: tracking.bgnStatus,
  } : undefined

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Memuat data BANPER...</p>
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
            <h2 className="text-2xl font-bold mb-2">Data tidak ditemukan</h2>
            <p className="text-muted-foreground mb-4">
              Permintaan BANPER yang Anda cari tidak tersedia.
            </p>
            <Button onClick={() => router.push('/banper-tracking')}>
              Kembali ke Daftar BANPER
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Edit Permintaan BANPER
          </h1>
          <p className="text-muted-foreground">
            {tracking.bgnRequestNumber || `Request #${tracking.id.slice(0, 8)}`}
          </p>
        </div>
      </div>

      {/* Form */}
      <BanperRequestForm 
        initialData={formData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isPending}
        mode="edit"
      />
    </div>
  )
}
