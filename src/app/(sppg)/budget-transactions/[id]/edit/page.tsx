/**
 * @fileoverview Budget Transaction Edit Page
 * @version Next.js 15.5.4 App Router
 * @author Bagizi-ID Development Team
 * 
 * Page untuk edit transaksi budget yang sudah ada
 */

'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BudgetTransactionForm } from '@/features/sppg/banper-tracking/components'
import { 
  useBudgetTransaction, 
  useUpdateBudgetTransaction 
} from '@/features/sppg/banper-tracking/hooks'
import type { BudgetTransactionCreateInput } from '@/features/sppg/banper-tracking/lib/schemas'
import { toast } from 'sonner'

interface EditBudgetTransactionPageProps {
  params: Promise<{ id: string }>
}

export default function EditBudgetTransactionPage({ params }: EditBudgetTransactionPageProps) {
  const router = useRouter()
  const { id } = use(params)
  
  // Fetch existing transaction data
  const { data: transaction, isLoading, error } = useBudgetTransaction(id)
  const { mutate: updateTransaction, isPending } = useUpdateBudgetTransaction()

  const handleSubmit = async (data: BudgetTransactionCreateInput) => {
    updateTransaction(
      { id, data },
      {
        onSuccess: () => {
          toast.success('Transaksi budget berhasil diperbarui')
          router.push('/budget-transactions')
        },
        onError: (error) => {
          toast.error(error.message || 'Gagal memperbarui transaksi')
        },
      }
    )
  }

  const handleCancel = () => {
    router.push('/budget-transactions')
  }

  // Transform transaction data to form-compatible format
  const formData = transaction ? {
    allocationId: transaction.allocation.id,
    programId: transaction.allocation.program.id,
    category: transaction.category,
    amount: transaction.amount,
    transactionDate: transaction.transactionDate,
    description: transaction.description,
    procurementId: transaction.procurementId ?? undefined,
    productionId: transaction.productionId ?? undefined,
    distributionId: transaction.distributionId ?? undefined,
    receiptNumber: transaction.receiptNumber ?? undefined,
    receiptUrl: transaction.receiptUrl ?? undefined,
    notes: transaction.notes ?? undefined,
  } : undefined

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Memuat data transaksi...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !transaction) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Data tidak ditemukan</h2>
            <p className="text-muted-foreground mb-4">
              Transaksi budget yang Anda cari tidak tersedia.
            </p>
            <Button onClick={() => router.push('/budget-transactions')}>
              Kembali ke Daftar Transaksi
            </Button>
          </div>
        </div>
      </div>
    )
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
            Edit Transaksi Budget
          </h1>
          <p className="text-muted-foreground">
            {transaction.transactionNumber}
          </p>
        </div>
      </div>

      {/* Form */}
      <BudgetTransactionForm
        initialData={formData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isPending}
        mode="edit"
      />
    </div>
  )
}
