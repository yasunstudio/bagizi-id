/**
 * @fileoverview Budget Transactions Page - Government Budget Tracking
 * @version Next.js 15.5.4 / Auth.js v5
 * @author Bagizi-ID Development Team
 * 
 * Page for managing all budget transactions across programs
 * Shows transaction list with filtering and approval actions
 */

'use client'

import { useRouter } from 'next/navigation'
import { BudgetTransactionList } from '@/features/sppg/banper-tracking/components'

export default function BudgetTransactionsPage() {
  const router = useRouter()

  const handleCreateTransaction = () => {
    router.push('/budget-transactions/new')
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transaksi Anggaran</h1>
        <p className="text-muted-foreground">
          Kelola semua transaksi penggunaan anggaran dari berbagai program
        </p>
      </div>

      {/* Transaction List */}
      <BudgetTransactionList onCreateNew={handleCreateTransaction} />
    </div>
  )
}
