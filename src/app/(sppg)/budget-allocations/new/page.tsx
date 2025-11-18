/**
 * @fileoverview Budget Allocation Create Page
 * @version Next.js 15.5.4 App Router
 * @author Bagizi-ID Development Team
 * 
 * Page untuk membuat alokasi anggaran baru
 */

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BudgetAllocationForm } from '@/features/sppg/banper-tracking/components'
import { useCreateBudgetAllocation } from '@/features/sppg/banper-tracking/hooks'
import type { ProgramBudgetAllocationCreateInput } from '@/features/sppg/banper-tracking/lib/schemas'
import { toast } from 'sonner'

export default function NewBudgetAllocationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const programId = searchParams.get('programId')
  
  const { mutate: createAllocation, isPending } = useCreateBudgetAllocation()

  const handleSubmit = (data: ProgramBudgetAllocationCreateInput) => {
    createAllocation(data, {
      onSuccess: () => {
        toast.success('Alokasi anggaran berhasil dibuat')
        router.push('/banper-tracking?tab=allocations')
      },
      onError: (error) => {
        toast.error(error.message || 'Gagal membuat alokasi anggaran')
      }
    })
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
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Buat Alokasi Anggaran</h1>
          <p className="text-muted-foreground">
            Tambahkan alokasi anggaran baru untuk program
          </p>
        </div>
      </div>

      {/* Form */}
      <BudgetAllocationForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isPending}
        mode="create"
        prefillProgramId={programId || undefined}
      />
    </div>
  )
}
