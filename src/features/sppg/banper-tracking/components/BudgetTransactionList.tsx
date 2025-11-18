/**
 * @fileoverview Budget Transaction List Component
 * @version Next.js 15.5.4 / shadcn/ui with Dark Mode
 * @author Bagizi-ID Development Team
 * 
 * Data table untuk menampilkan semua Budget Transactions
 * dengan filtering, sorting, approval actions, dan category badges
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  CheckCircle2,
  XCircle,
  Receipt,
  ShoppingCart,
  Truck,
  Utensils,
  Users,
  AlertTriangle,
} from 'lucide-react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { DataTable } from '@/components/ui/data-table'
import { 
  useBudgetTransactions, 
  useDeleteBudgetTransaction,
  useApproveBudgetTransaction,
} from '../hooks'
import { useSession } from 'next-auth/react'
import type { BudgetTransactionListItem } from '../types'
import type { BudgetTransactionCategory } from '@prisma/client'

/**
 * Category configuration dengan icons dan colors
 */
const categoryConfig: Record<BudgetTransactionCategory, { 
  label: string
  icon: typeof ShoppingCart
  className: string
}> = {
  FOOD_PROCUREMENT: { 
    label: 'Pengadaan Pangan', 
    icon: ShoppingCart,
    className: 'bg-blue-500/10 text-blue-700 dark:text-blue-300'
  },
  OPERATIONAL: { 
    label: 'Operasional', 
    icon: Users,
    className: 'bg-purple-500/10 text-purple-700 dark:text-purple-300'
  },
  TRANSPORT: { 
    label: 'Transport', 
    icon: Truck,
    className: 'bg-green-500/10 text-green-700 dark:text-green-300'
  },
  UTILITIES: { 
    label: 'Utilitas', 
    icon: Receipt,
    className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300'
  },
  STAFF_SALARY: { 
    label: 'Gaji Staff', 
    icon: Users,
    className: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
  },
  EQUIPMENT: { 
    label: 'Peralatan', 
    icon: Utensils,
    className: 'bg-orange-500/10 text-orange-700 dark:text-orange-300'
  },
  MAINTENANCE: { 
    label: 'Pemeliharaan', 
    icon: Receipt,
    className: 'bg-pink-500/10 text-pink-700 dark:text-pink-300'
  },
  TRAINING: { 
    label: 'Pelatihan', 
    icon: Users,
    className: 'bg-teal-500/10 text-teal-700 dark:text-teal-300'
  },
  MARKETING: { 
    label: 'Pemasaran', 
    icon: Receipt,
    className: 'bg-red-500/10 text-red-700 dark:text-red-300'
  },
  PACKAGING: { 
    label: 'Pengemasan', 
    icon: ShoppingCart,
    className: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300'
  },
  OTHER: { 
    label: 'Lainnya', 
    icon: Receipt,
    className: 'bg-gray-500/10 text-gray-700 dark:text-gray-300'
  },
}

/**
 * Format currency to Indonesian Rupiah
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

interface BudgetTransactionListProps {
  allocationId?: string
  onCreateNew?: () => void
}

export function BudgetTransactionList({ allocationId, onCreateNew }: BudgetTransactionListProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const { data: transactions, isLoading } = useBudgetTransactions()
  const { mutate: deleteTransaction } = useDeleteBudgetTransaction()
  const { mutate: approveTransaction } = useApproveBudgetTransaction()

  // Dialog states
  const [approveDialog, setApproveDialog] = useState<{
    open: boolean
    transaction: BudgetTransactionListItem | null
  }>({
    open: false,
    transaction: null,
  })

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    transaction: BudgetTransactionListItem | null
  }>({
    open: false,
    transaction: null,
  })

  // Filter by allocationId if provided
  const filteredTransactions = allocationId 
    ? transactions?.filter(t => t.allocation.id === allocationId)
    : transactions

  const handleView = (id: string) => {
    router.push(`/budget-transactions/${id}`)
  }

  const handleEdit = (id: string) => {
    router.push(`/budget-transactions/${id}/edit`)
  }

  const handleApprove = (transaction: BudgetTransactionListItem) => {
    setApproveDialog({ open: true, transaction })
  }

  const confirmApprove = () => {
    if (!approveDialog.transaction) return
    if (!session?.user?.name && !session?.user?.email) {
      alert('User information not available')
      return
    }

    approveTransaction({
      id: approveDialog.transaction.id,
      approvedBy: session.user.name || session.user.email,
      approvalNotes: 'Approved via transaction list',
    })
    
    setApproveDialog({ open: false, transaction: null })
  }

  const handleDelete = (transaction: BudgetTransactionListItem) => {
    if (transaction.approvedBy) {
      alert('Transaksi yang sudah disetujui tidak dapat dihapus')
      return
    }
    setDeleteDialog({ open: true, transaction })
  }

  const confirmDelete = () => {
    if (!deleteDialog.transaction) return
    
    deleteTransaction(deleteDialog.transaction.id)
    setDeleteDialog({ open: false, transaction: null })
  }

  const columns: ColumnDef<BudgetTransactionListItem>[] = [
    {
      accessorKey: 'transactionNumber',
      header: 'Nomor',
      cell: ({ row }) => {
        const number = row.getValue('transactionNumber') as string
        return (
          <div className="flex items-center gap-2 min-w-[120px]">
            <Receipt className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="font-medium font-mono text-xs">{number}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'transactionDate',
      header: 'Tanggal',
      cell: ({ row }) => {
        const date = row.getValue('transactionDate') as Date
        return (
          <span className="text-xs whitespace-nowrap">
            {format(new Date(date), 'dd/MM/yy', { locale: localeId })}
          </span>
        )
      },
    },
    {
      accessorKey: 'category',
      header: 'Kategori',
      cell: ({ row }) => {
        const category = row.getValue('category') as BudgetTransactionCategory
        const config = categoryConfig[category]
        const Icon = config.icon
        
        return (
          <Badge variant="outline" className={`${config.className} text-xs whitespace-nowrap`}>
            <Icon className="mr-1 h-3 w-3 flex-shrink-0" />
            <span className="truncate">{config.label}</span>
          </Badge>
        )
      },
    },
    {
      accessorKey: 'description',
      header: 'Deskripsi',
      cell: ({ row }) => {
        const description = row.getValue('description') as string
        const allocation = row.original.allocation
        return (
          <div className="max-w-[200px] space-y-0.5">
            <div className="text-sm font-medium truncate" title={description}>
              {description}
            </div>
            <div className="text-xs text-muted-foreground truncate" title={allocation.program.name}>
              {allocation.program.name}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'amount',
      header: 'Jumlah',
      cell: ({ row }) => {
        const amount = row.getValue('amount') as number
        return (
          <span className="font-semibold text-sm whitespace-nowrap">{formatCurrency(amount)}</span>
        )
      },
    },
    {
      accessorKey: 'approvedBy',
      header: 'Status',
      cell: ({ row }) => {
        const transaction = row.original
        const approvedBy = transaction.approvedBy

        return approvedBy ? (
          <div className="flex flex-col gap-0.5">
            <Badge variant="default" className="gap-1 w-fit text-xs">
              <CheckCircle2 className="h-3 w-3" />
              Disetujui
            </Badge>
            <div className="text-[10px] text-muted-foreground truncate max-w-[100px]" title={approvedBy}>
              {approvedBy}
            </div>
          </div>
        ) : (
          <Badge variant="outline" className="gap-1 text-yellow-600 border-yellow-600 dark:text-yellow-400 dark:border-yellow-400 w-fit text-xs">
            <XCircle className="h-3 w-3" />
            Pending
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const transaction = row.original
        const isApproved = !!transaction.approvedBy

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleView(transaction.id)}>
                <Eye className="mr-2 h-4 w-4" />
                Lihat Detail
              </DropdownMenuItem>
              {!isApproved && (
                <>
                  <DropdownMenuItem onClick={() => handleEdit(transaction.id)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleApprove(transaction)}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Setujui Transaksi
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              {!isApproved && (
                <DropdownMenuItem 
                  onClick={() => handleDelete(transaction)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Transaksi Anggaran</CardTitle>
              <CardDescription>
                {allocationId 
                  ? 'Transaksi untuk alokasi terpilih' 
                  : 'Semua transaksi penggunaan anggaran'
                }
              </CardDescription>
            </div>
            <Button onClick={onCreateNew} className="w-full sm:w-auto">
              <Receipt className="mr-2 h-4 w-4" />
              Catat Transaksi Baru
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Memuat data...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <DataTable
                columns={columns}
                data={filteredTransactions || []}
                searchKey="transactionNumber"
                searchPlaceholder="Cari nomor transaksi..."
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={approveDialog.open} onOpenChange={(open) => setApproveDialog({ open, transaction: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Setujui Transaksi?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Anda akan menyetujui transaksi berikut:</p>
              {approveDialog.transaction && (
                <div className="bg-muted p-3 rounded-md space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nomor:</span>
                    <span className="font-medium">{approveDialog.transaction.transactionNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deskripsi:</span>
                    <span className="font-medium max-w-[250px] truncate">{approveDialog.transaction.description}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Jumlah:</span>
                    <span className="font-semibold text-primary">{formatCurrency(approveDialog.transaction.amount)}</span>
                  </div>
                </div>
              )}
              <p className="text-destructive text-xs">
                ⚠️ Transaksi yang sudah disetujui tidak dapat diedit atau dihapus lagi.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmApprove} className="bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Ya, Setujui
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, transaction: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Hapus Transaksi?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Anda akan menghapus transaksi berikut:</p>
              {deleteDialog.transaction && (
                <div className="bg-muted p-3 rounded-md space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nomor:</span>
                    <span className="font-medium">{deleteDialog.transaction.transactionNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deskripsi:</span>
                    <span className="font-medium max-w-[250px] truncate">{deleteDialog.transaction.description}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Jumlah:</span>
                    <span className="font-semibold text-destructive">{formatCurrency(deleteDialog.transaction.amount)}</span>
                  </div>
                </div>
              )}
              <p className="text-destructive text-xs">
                ⚠️ Data yang sudah dihapus tidak dapat dikembalikan. Budget allocation akan dikembalikan.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              <Trash2 className="mr-2 h-4 w-4" />
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
