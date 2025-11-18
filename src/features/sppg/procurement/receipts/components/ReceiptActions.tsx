/**
 * @fileoverview Receipt Actions Component - Bulk Action Toolbar
 * @version Next.js 15.5.4 / TanStack Query / Enterprise-grade
 * @author Bagizi-ID Development Team
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  CheckCircle2,
  XCircle,
  FileDown,
  ClipboardCheck,
  Trash2,
  X as CloseIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { useReceiptStore } from '../stores'
import { useAcceptReceipt, useRejectReceipt, useDeleteReceipt } from '../hooks'

// ================================ COMPONENT ================================

export function ReceiptActions() {
  const router = useRouter()
  const { selectedIds, clearSelection } = useReceiptStore()
  
  const { mutate: acceptReceipt, isPending: isAccepting } = useAcceptReceipt()
  const { mutate: rejectReceipt, isPending: isRejecting } = useRejectReceipt()
  const { mutate: deleteReceipt, isPending: isDeleting } = useDeleteReceipt()

  // Dialog states
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectError, setRejectError] = useState('')

  // Don't show toolbar if no selection
  if (selectedIds.length === 0) return null

  // ============= HANDLERS =============

  /**
   * Handle bulk accept
   */
  const handleBulkAccept = () => {
    if (selectedIds.length === 0) {
      toast.error('Tidak ada receipt yang dipilih')
      return
    }

    // Accept each receipt individually
    let successCount = 0
    let errorCount = 0

    selectedIds.forEach((id) => {
      acceptReceipt(id, {
        onSuccess: () => {
          successCount++
          if (successCount + errorCount === selectedIds.length) {
            if (successCount > 0) {
              toast.success(`${successCount} receipt berhasil diterima`)
              clearSelection()
            }
            if (errorCount > 0) {
              toast.error(`${errorCount} receipt gagal diterima`)
            }
          }
        },
        onError: () => {
          errorCount++
          if (successCount + errorCount === selectedIds.length) {
            if (successCount > 0) {
              toast.success(`${successCount} receipt berhasil diterima`)
              clearSelection()
            }
            if (errorCount > 0) {
              toast.error(`${errorCount} receipt gagal diterima`)
            }
          }
        },
      })
    })
  }

  /**
   * Handle bulk reject with reason
   */
  const handleBulkReject = () => {
    if (!rejectReason.trim()) {
      setRejectError('Alasan penolakan harus diisi')
      return
    }

    if (rejectReason.length < 10) {
      setRejectError('Alasan penolakan minimal 10 karakter')
      return
    }

    // Reject each receipt with the same reason
    let successCount = 0
    let errorCount = 0

    selectedIds.forEach((id) => {
      rejectReceipt(
        { id, reason: rejectReason },
        {
          onSuccess: () => {
            successCount++
            if (successCount + errorCount === selectedIds.length) {
              if (successCount > 0) {
                toast.success(`${successCount} receipt berhasil ditolak`)
                clearSelection()
                setShowRejectDialog(false)
                setRejectReason('')
                setRejectError('')
              }
              if (errorCount > 0) {
                toast.error(`${errorCount} receipt gagal ditolak`)
              }
            }
          },
          onError: () => {
            errorCount++
            if (successCount + errorCount === selectedIds.length) {
              if (successCount > 0) {
                toast.success(`${successCount} receipt berhasil ditolak`)
                clearSelection()
                setShowRejectDialog(false)
                setRejectReason('')
                setRejectError('')
              }
              if (errorCount > 0) {
                toast.error(`${errorCount} receipt gagal ditolak`)
              }
            }
          },
        }
      )
    })
  }

  /**
   * Handle bulk delete
   */
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return

    // Delete each receipt individually
    let successCount = 0
    let errorCount = 0

    selectedIds.forEach((id) => {
      deleteReceipt(id, {
        onSuccess: () => {
          successCount++
          if (successCount + errorCount === selectedIds.length) {
            if (successCount > 0) {
              toast.success(`${successCount} receipt berhasil dihapus`)
              clearSelection()
              setShowDeleteDialog(false)
            }
            if (errorCount > 0) {
              toast.error(`${errorCount} receipt gagal dihapus`)
            }
          }
        },
        onError: () => {
          errorCount++
          if (successCount + errorCount === selectedIds.length) {
            if (successCount > 0) {
              toast.success(`${successCount} receipt berhasil dihapus`)
              clearSelection()
              setShowDeleteDialog(false)
            }
            if (errorCount > 0) {
              toast.error(`${errorCount} receipt gagal dihapus`)
            }
          }
        },
      })
    })
  }

  /**
   * Handle bulk QC
   */
  const handleBulkQC = () => {
    // Navigate to first selected receipt's QC page
    if (selectedIds.length > 0) {
      router.push(`/procurement/receipts/${selectedIds[0]}/qc`)
      toast.info(
        `Memulai QC untuk receipt pertama. ${selectedIds.length - 1} receipt lainnya menunggu.`
      )
    }
  }

  /**
   * Handle export to CSV
   */
  const handleExportCSV = () => {
    toast.info('Export CSV sedang dalam development')
    // TODO: Implement CSV export
  }

  /**
   * Handle export to PDF
   */
  const handleExportPDF = () => {
    toast.info('Export PDF sedang dalam development')
    // TODO: Implement PDF export
  }

  // ============= RENDER =============

  const isPending = isAccepting || isRejecting || isDeleting

  return (
    <>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-background border rounded-lg shadow-lg p-4 flex items-center gap-4 min-w-[600px]">
          {/* Selection Info */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-base">
              {selectedIds.length}
            </Badge>
            <span className="text-sm font-medium">
              {selectedIds.length === 1 ? 'receipt dipilih' : 'receipts dipilih'}
            </span>
          </div>

          <div className="flex-1 flex items-center gap-2">
            {/* Bulk QC */}
            <Button
              variant="default"
              size="sm"
              onClick={handleBulkQC}
              disabled={isPending}
            >
              <ClipboardCheck className="mr-2 h-4 w-4" />
              Quality Control
            </Button>

            {/* Bulk Accept */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkAccept}
              disabled={isPending}
              className="border-green-200 hover:bg-green-50 dark:border-green-900 dark:hover:bg-green-950"
            >
              <CheckCircle2 className="mr-2 h-4 w-4 text-green-600 dark:text-green-400" />
              Terima
            </Button>

            {/* Bulk Reject */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRejectDialog(true)}
              disabled={isPending}
              className="border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
            >
              <XCircle className="mr-2 h-4 w-4 text-red-600 dark:text-red-400" />
              Tolak
            </Button>

            {/* Export Actions */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={isPending}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Export CSV
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              disabled={isPending}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Export PDF
            </Button>

            {/* Delete */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isPending}
              className="border-destructive/50 hover:bg-destructive/10"
            >
              <Trash2 className="mr-2 h-4 w-4 text-destructive" />
              Hapus
            </Button>
          </div>

          {/* Clear Selection */}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSelection}
            disabled={isPending}
          >
            <CloseIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              Tolak Receipt
            </DialogTitle>
            <DialogDescription>
              Anda akan menolak {selectedIds.length} receipt. Masukkan alasan penolakan.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="reject-reason">Alasan Penolakan *</Label>
            <Textarea
              id="reject-reason"
              placeholder="Jelaskan alasan penolakan receipt..."
              value={rejectReason}
              onChange={(e) => {
                setRejectReason(e.target.value)
                setRejectError('')
              }}
              rows={4}
              className={rejectError ? 'border-destructive' : ''}
            />
            {rejectError && (
              <p className="text-sm text-destructive">{rejectError}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false)
                setRejectReason('')
                setRejectError('')
              }}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleBulkReject}
              disabled={isRejecting}
            >
              {isRejecting ? 'Menolak...' : 'Tolak Receipt'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Hapus Receipt
            </AlertDialogTitle>
            <AlertDialogDescription>
              Anda akan menghapus {selectedIds.length} receipt. Tindakan ini tidak dapat
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
