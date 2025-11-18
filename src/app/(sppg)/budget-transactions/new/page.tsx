/**
 * @fileoverview Budget Transaction New Page
 * @version Next.js 15.5.4 App Router
 * @author Bagizi-ID Development Team
 * 
 * Page untuk create transaksi budget baru
 */

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BudgetTransactionForm } from '@/features/sppg/banper-tracking/components'
import { useCreateBudgetTransaction } from '@/features/sppg/banper-tracking/hooks'
import type { BudgetTransactionCreateInput } from '@/features/sppg/banper-tracking/lib/schemas'
import { toast } from 'sonner'

export default function NewBudgetTransactionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { mutate: createTransaction, isPending } = useCreateBudgetTransaction()

  // Get prefill data from URL params
  const prefillProgramId = searchParams.get('programId') || undefined
  const prefillAllocationId = searchParams.get('allocationId') || undefined

  const handleSubmit = async (data: BudgetTransactionCreateInput) => {
    createTransaction(data, {
      onSuccess: (response) => {
        toast.success('Transaksi budget berhasil dicatat')
        if (response.id) {
          router.push(`/budget-transactions`)
        }
      },
      onError: (error) => {
        toast.error(error.message || 'Gagal menyimpan transaksi')
      },
    })
  }

  const handleCancel = () => {
    router.push('/budget-transactions')
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
          <h1 className="text-3xl font-bold tracking-tight">
            Catat Transaksi Budget Baru
          </h1>
          <p className="text-muted-foreground">
            Input detail pengeluaran operasional dari budget allocation
          </p>
        </div>
      </div>

      {/* Form */}
      <BudgetTransactionForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isPending}
        mode="create"
        prefillProgramId={prefillProgramId}
        prefillAllocationId={prefillAllocationId}
      />
    </div>
  )
}
