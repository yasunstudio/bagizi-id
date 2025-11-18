/**
 * @fileoverview Banper Request Create Page - Ajukan Banper Baru
 * @version Next.js 15.5.4 App Router
 * @author Bagizi-ID Development Team
 * 
 * Page untuk membuat permintaan BANPER baru
 * Dapat dipanggil standalone atau dari Program detail dengan programId pre-filled
 */

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { BanperRequestForm } from '@/features/sppg/banper-tracking/components'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import type { CreateBanperRequestInput } from '@/features/sppg/banper-tracking/schemas'

export default function NewBanperRequestPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const programId = searchParams?.get('programId')

  const handleSubmit = async (data: CreateBanperRequestInput) => {
    try {
      const response = await fetch('/api/sppg/banper-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Gagal menyimpan permintaan BANPER')
      }

      const result = await response.json()
      
      toast.success('Permintaan BANPER berhasil dibuat sebagai draft')
      
      // Redirect to detail page
      router.push(`/banper-tracking/${result.data.id}`)
    } catch (error) {
      console.error('Submit error:', error)
      toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan')
    }
  }

  const handleCancel = () => {
    router.back()
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
            Buat Permintaan BANPER Baru
          </h1>
          <p className="text-muted-foreground">
            Ajukan permintaan bantuan anggaran dari pemerintah pusat melalui Portal BGN
          </p>
        </div>
      </div>

      {/* Info Card if coming from Program */}
      {programId && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Terhubung dengan Program</CardTitle>
            <CardDescription>
              Permintaan BANPER ini akan dikaitkan dengan program yang Anda pilih. 
              Dana yang disetujui akan dialokasikan untuk program tersebut.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Form */}
      <BanperRequestForm 
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        prefillProgramId={programId}
      />
    </div>
  )
}
