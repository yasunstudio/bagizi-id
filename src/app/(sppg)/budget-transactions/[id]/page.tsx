/**
 * @fileoverview Budget Transaction Detail Page
 * @version Next.js 15.5.4 App Router
 * @author Bagizi-ID Development Team
 * 
 * Page untuk melihat detail transaksi budget
 */

'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, Receipt, Calendar, DollarSign, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
import { 
  useBudgetTransaction, 
  useDeleteBudgetTransaction,
  useApproveBudgetTransaction 
} from '@/features/sppg/banper-tracking/hooks'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { BudgetTransactionCategory } from '@prisma/client'

interface BudgetTransactionDetailPageProps {
  params: Promise<{ id: string }>
}

// Category labels
const categoryLabels: Record<BudgetTransactionCategory, string> = {
  FOOD_PROCUREMENT: 'Pengadaan Bahan Pangan',
  OPERATIONAL: 'Operasional Umum',
  TRANSPORT: 'Transport & Distribusi',
  UTILITIES: 'Utilitas',
  STAFF_SALARY: 'Gaji Staff',
  EQUIPMENT: 'Peralatan Dapur',
  PACKAGING: 'Pengemasan',
  MARKETING: 'Marketing & Sosialisasi',
  TRAINING: 'Pelatihan',
  MAINTENANCE: 'Pemeliharaan',
  OTHER: 'Lain-lain',
}

// Format currency helper
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export default function BudgetTransactionDetailPage({ params }: BudgetTransactionDetailPageProps) {
  const router = useRouter()
  const { id } = use(params)
  const { data: session } = useSession()
  
  const { data: transaction, isLoading, error } = useBudgetTransaction(id)
  const { mutate: deleteTransaction, isPending: isDeleting } = useDeleteBudgetTransaction()
  const { mutate: approveTransaction, isPending: isApproving } = useApproveBudgetTransaction()

  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleEdit = () => {
    router.push(`/budget-transactions/${id}/edit`)
  }

  const handleDelete = () => {
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    deleteTransaction(id, {
      onSuccess: () => {
        toast.success('Transaksi berhasil dihapus')
        router.push('/budget-transactions')
      },
      onError: (error) => {
        toast.error(error.message || 'Gagal menghapus transaksi')
      }
    })
    setDeleteDialogOpen(false)
  }

  const handleApprove = () => {
    if (!session?.user?.name && !session?.user?.email) {
      toast.error('User information not available')
      return
    }
    setApproveDialogOpen(true)
  }

  const confirmApprove = () => {
    if (!session?.user?.name && !session?.user?.email) return

    approveTransaction({
      id,
      approvedBy: session.user.name || session.user.email || 'Unknown',
    }, {
      onSuccess: () => {
        toast.success('Transaksi berhasil disetujui')
      },
      onError: (error) => {
        toast.error(error.message || 'Gagal menyetujui transaksi')
      }
    })
    setApproveDialogOpen(false)
  }

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
              Transaksi yang Anda cari tidak tersedia.
            </p>
            <Button onClick={() => router.push('/budget-transactions')}>
              Kembali ke Daftar Transaksi
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const isApproved = !!transaction.approvedBy

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Detail Transaksi Budget</h1>
            <p className="text-muted-foreground">{transaction.transactionNumber}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {!isApproved && (
            <>
              <Button
                variant="outline"
                onClick={handleEdit}
                disabled={isDeleting || isApproving}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={handleApprove}
                disabled={isDeleting || isApproving}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {isApproving ? 'Menyetujui...' : 'Setujui'}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting || isApproving}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? 'Menghapus...' : 'Hapus'}
              </Button>
            </>
          )}
          {isApproved && (
            <Badge variant="default" className="text-sm">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Sudah Disetujui
            </Badge>
          )}
        </div>
      </div>

      {/* Approval Alert */}
      {isApproved && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Transaksi ini sudah disetujui oleh <strong>{transaction.approvedBy}</strong> pada{' '}
            {transaction.approvedAt && format(new Date(transaction.approvedAt), 'dd MMMM yyyy HH:mm', { locale: localeId })}
          </AlertDescription>
        </Alert>
      )}

      {/* Transaction Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informasi Transaksi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Program & Allocation */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Program</div>
                <div className="font-medium">{transaction.allocation.program.name}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Sumber Budget</div>
                <Badge variant="secondary">{transaction.allocation.source}</Badge>
              </div>
            </div>

            <Separator />

            {/* Category & Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Kategori Pengeluaran</div>
                <Badge variant="outline" className="text-sm">
                  {categoryLabels[transaction.category]}
                </Badge>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Tanggal Transaksi
                </div>
                <div className="font-medium">
                  {format(new Date(transaction.transactionDate), 'dd MMMM yyyy', { locale: localeId })}
                </div>
              </div>
            </div>

            <Separator />

            {/* Amount */}
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                <DollarSign className="h-4 w-4 inline mr-1" />
                Jumlah Pengeluaran
              </div>
              <div className="text-3xl font-bold text-primary">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(transaction.amount)}
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <div className="text-sm text-muted-foreground mb-2">Deskripsi</div>
              <p className="text-sm leading-relaxed">{transaction.description}</p>
            </div>

            {/* Notes */}
            {transaction.notes && (
              <>
                <Separator />
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Catatan Tambahan</div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{transaction.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Receipt & Metadata */}
        <div className="space-y-6">
          {/* Receipt Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Bukti Pembayaran
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {transaction.receiptNumber ? (
                <>
                  <div>
                    <div className="text-sm text-muted-foreground">Nomor Nota</div>
                    <div className="font-medium">{transaction.receiptNumber}</div>
                  </div>
                  {transaction.receiptUrl && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">File Bukti</div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => window.open(transaction.receiptUrl!, '_blank')}
                      >
                        <Receipt className="h-4 w-4 mr-2" />
                        Lihat Bukti
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Tidak ada bukti pembayaran</p>
              )}
            </CardContent>
          </Card>

          {/* Budget Allocation Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Budget Allocation</CardTitle>
              <CardDescription>{transaction.allocation.source}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground">Total Alokasi</div>
                <div className="font-medium">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                  }).format(transaction.allocation.allocatedAmount)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Sudah Terpakai</div>
                <div className="font-medium">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                  }).format(transaction.allocation.spentAmount)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Sisa Budget</div>
                <div className="font-bold text-primary">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                  }).format(transaction.allocation.allocatedAmount - transaction.allocation.spentAmount)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informasi Sistem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <div className="text-muted-foreground">Dibuat oleh</div>
                <div className="font-medium">{transaction.createdBy}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Tanggal dibuat</div>
                <div className="font-medium">
                  {format(new Date(transaction.createdAt), 'dd MMM yyyy HH:mm', { locale: localeId })}
                </div>
              </div>
              {transaction.updatedAt && new Date(transaction.updatedAt).getTime() !== new Date(transaction.createdAt).getTime() && (
                <div>
                  <div className="text-muted-foreground">Terakhir diupdate</div>
                  <div className="font-medium">
                    {format(new Date(transaction.updatedAt), 'dd MMM yyyy HH:mm', { locale: localeId })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Setujui Transaksi?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Anda akan menyetujui transaksi berikut:</p>
              <div className="bg-muted p-3 rounded-md space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nomor:</span>
                  <span className="font-medium">{transaction.transactionNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deskripsi:</span>
                  <span className="font-medium max-w-[250px] truncate">{transaction.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Jumlah:</span>
                  <span className="font-semibold text-primary">{formatCurrency(transaction.amount)}</span>
                </div>
              </div>
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
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Hapus Transaksi?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Anda akan menghapus transaksi berikut:</p>
              <div className="bg-muted p-3 rounded-md space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nomor:</span>
                  <span className="font-medium">{transaction.transactionNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deskripsi:</span>
                  <span className="font-medium max-w-[250px] truncate">{transaction.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Jumlah:</span>
                  <span className="font-semibold text-destructive">{formatCurrency(transaction.amount)}</span>
                </div>
              </div>
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
    </div>
  )
}
