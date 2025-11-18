/**
 * @fileoverview Banper Disbursement Page
 * @version Next.js 15.5.4 / App Router
 * @author Bagizi-ID Development Team
 * 
 * Halaman untuk input data pencairan dana Banper
 * Route: /banper-tracking/[id]/disburse
 */

'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { BanperDisbursementForm } from '@/features/sppg/banper-tracking/components'
import { useBanperTracking, useDisburseBanperTracking } from '@/features/sppg/banper-tracking/hooks'
import type { BanperRequestTrackingDisbursementInput } from '@/features/sppg/banper-tracking/lib/schemas'

export default function BanperDisbursementPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  // Fetch banper tracking data
  const { data: banper, isLoading, error } = useBanperTracking(id)
  const { mutate: disburseBanper, isPending } = useDisburseBanperTracking()

  const handleSubmit = (data: BanperRequestTrackingDisbursementInput) => {
    disburseBanper(
      { id, data },
      {
        onSuccess: () => {
          toast.success('Data pencairan dana berhasil disimpan')
          router.push(`/banper-tracking/${id}`)
        },
        onError: (error: Error) => {
          toast.error(error.message || 'Gagal menyimpan data pencairan')
        },
      }
    )
  }

  const handleCancel = () => {
    router.push(`/banper-tracking/${id}`)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  // Error state
  if (error || !banper) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>
              {error?.message || 'Data banper tracking tidak ditemukan'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/banper-tracking')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Daftar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check if already disbursed
  if (banper.bgnStatus === 'DISBURSED') {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Dana Sudah Dicairkan
            </CardTitle>
            <CardDescription>
              Permohonan Banper ini sudah dalam status DISBURSED
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Jumlah Dicairkan</div>
                <div className="text-lg font-semibold">
                  Rp {banper.disbursedAmount?.toLocaleString('id-ID') || '-'}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Tanggal Pencairan</div>
                <div className="text-lg font-semibold">
                  {banper.disbursedDate
                    ? new Date(banper.disbursedDate).toLocaleDateString('id-ID')
                    : '-'}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Nomor Referensi Bank</div>
                <div className="text-lg font-semibold">
                  {banper.bankReferenceNumber || '-'}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Rekening Penerima</div>
                <div className="text-lg font-semibold">
                  {banper.bankAccountReceived || '-'}
                </div>
              </div>
            </div>

            <Separator />

            <Button onClick={() => router.push(`/banper-tracking/${id}`)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Detail
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check if approved
  if (banper.bgnStatus !== 'APPROVED_BY_BGN') {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Tidak Dapat Melakukan Pencairan</CardTitle>
            <CardDescription>
              Permohonan Banper harus dalam status APPROVED_BY_BGN untuk dapat dicairkan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground mb-2">Status Saat Ini</div>
              <Badge variant="outline">{banper.bgnStatus}</Badge>
            </div>

            <Separator />

            <Button onClick={() => router.push(`/banper-tracking/${id}`)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Detail
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Input Pencairan Dana</h1>
          <p className="text-muted-foreground mt-2">
            {banper.program?.name || 'Program'}
          </p>
        </div>
        <Button variant="outline" onClick={handleCancel}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
      </div>

      {/* Banper Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Permohonan</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Nomor Permohonan BGN</div>
            <div className="font-semibold">{banper.bgnRequestNumber || '-'}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Nomor Approval BGN</div>
            <div className="font-semibold">{banper.bgnApprovalNumber || '-'}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Jumlah Disetujui</div>
            <div className="font-semibold">
              Rp {banper.requestedAmount.toLocaleString('id-ID')}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Status</div>
            <Badge variant="default">{banper.bgnStatus}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Disbursement Form */}
      <BanperDisbursementForm
        requestedAmount={banper.requestedAmount}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isPending}
      />
    </div>
  )
}
