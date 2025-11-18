/**
 * @fileoverview Plan Actions Component
 * @version Next.js 15.5.4 / React 19
 * @author Bagizi-ID Development Team
 * @see {@link /docs/PROCUREMENT_WORKFLOW_GUIDE.md} Procurement Documentation
 * 
 * COMPONENT FEATURES:
 * - Action button group for plan operations
 * - Submit plan for approval
 * - Approve/Reject plan
 * - Cancel plan
 * - Permission-based visibility
 * - Confirmation dialogs
 * - Loading states
 * - Dark mode support
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
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
  Send,
  CheckCircle2,
  XCircle,
  Ban,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSubmitPlan, useApprovePlan, useRejectPlan, useCancelPlan } from '../hooks'
import type { PlanApprovalStatus } from '../types'

// ================================ TYPES ================================

interface PlanActionsProps {
  planId: string
  currentStatus: PlanApprovalStatus | string
  onActionComplete?: () => void
  className?: string
}

type DialogState = {
  type: 'submit' | 'approve' | 'reject' | 'cancel' | null
  isOpen: boolean
}

// ================================ COMPONENT ================================

/**
 * Plan Actions Component
 * Provides action buttons for plan workflow operations
 * 
 * @example
 * <PlanActions
 *   planId={plan.id}
 *   currentStatus={plan.approvalStatus}
 *   onActionComplete={() => refetch()}
 * />
 */
export function PlanActions({
  planId,
  currentStatus,
  onActionComplete,
  className,
}: PlanActionsProps) {
  const [dialogState, setDialogState] = useState<DialogState>({
    type: null,
    isOpen: false,
  })
  const [notes, setNotes] = useState('')

  // Mutations
  const { mutate: submitPlan, isPending: isSubmitting } = useSubmitPlan()
  const { mutate: approvePlan, isPending: isApproving } = useApprovePlan()
  const { mutate: rejectPlan, isPending: isRejecting } = useRejectPlan()
  const { mutate: cancelPlan, isPending: isCancelling } = useCancelPlan()

  const isProcessing = isSubmitting || isApproving || isRejecting || isCancelling

  // Permission checks based on status
  const canSubmit = currentStatus === 'DRAFT'
  const canApprove = ['SUBMITTED', 'UNDER_REVIEW'].includes(currentStatus)
  const canReject = ['SUBMITTED', 'UNDER_REVIEW'].includes(currentStatus)
  const canCancel = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW'].includes(currentStatus)

  // Open dialog
  const openDialog = (type: 'submit' | 'approve' | 'reject' | 'cancel') => {
    setDialogState({ type, isOpen: true })
    setNotes('')
  }

  // Close dialog
  const closeDialog = () => {
    if (!isProcessing) {
      setDialogState({ type: null, isOpen: false })
      setNotes('')
    }
  }

  // Handle submit
  const handleSubmit = () => {
    submitPlan(
      { 
        id: planId, 
        data: { 
          planId,
          submissionNotes: notes || undefined 
        } 
      },
      {
        onSuccess: () => {
          closeDialog()
          onActionComplete?.()
        },
      }
    )
  }

  // Handle approve
  const handleApprove = () => {
    approvePlan(
      { 
        id: planId, 
        data: { 
          planId,
          approvalNotes: notes || undefined 
        } 
      },
      {
        onSuccess: () => {
          closeDialog()
          onActionComplete?.()
        },
      }
    )
  }

  // Handle reject
  const handleReject = () => {
    if (!notes.trim() || notes.trim().length < 10) {
      return // Rejection requires notes with minimum 10 characters
    }
    
    rejectPlan(
      { 
        id: planId, 
        data: { 
          planId,
          rejectionReason: notes.trim() 
        } 
      },
      {
        onSuccess: () => {
          closeDialog()
          onActionComplete?.()
        },
      }
    )
  }

  // Handle cancel
  const handleCancel = () => {
    if (!notes.trim() || notes.trim().length < 10) {
      return // Cancellation requires reason with minimum 10 characters
    }
    
    cancelPlan(
      { 
        id: planId, 
        data: { 
          planId,
          cancellationReason: notes.trim() 
        }
      },
      {
        onSuccess: () => {
          closeDialog()
          onActionComplete?.()
        },
      }
    )
  }

  // If no actions available, return null
  if (!canSubmit && !canApprove && !canReject && !canCancel) {
    return null
  }

  return (
    <>
      <div className={cn('flex flex-wrap items-center gap-3', className)}>
        {/* Submit Button */}
        {canSubmit && (
          <Button
            onClick={() => openDialog('submit')}
            disabled={isProcessing}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Ajukan Rencana
          </Button>
        )}

        {/* Approve Button */}
        {canApprove && (
          <Button
            onClick={() => openDialog('approve')}
            disabled={isProcessing}
            size="lg"
            className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
          >
            {isApproving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            )}
            Setujui
          </Button>
        )}

        {/* Reject Button */}
        {canReject && (
          <Button
            onClick={() => openDialog('reject')}
            disabled={isProcessing}
            size="lg"
            variant="destructive"
          >
            {isRejecting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="mr-2 h-4 w-4" />
            )}
            Tolak
          </Button>
        )}

        {/* Cancel Button */}
        {canCancel && (
          <Button
            onClick={() => openDialog('cancel')}
            disabled={isProcessing}
            size="lg"
            variant="outline"
            className="border-destructive/50 text-destructive hover:bg-destructive/10"
          >
            {isCancelling ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Ban className="mr-2 h-4 w-4" />
            )}
            Batalkan Rencana
          </Button>
        )}
      </div>

      {/* Submit Dialog */}
      {dialogState.type === 'submit' && (
        <Dialog open={dialogState.isOpen} onOpenChange={closeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajukan Rencana Pengadaan</DialogTitle>
              <DialogDescription>
                Rencana akan diajukan untuk review dan persetujuan. Anda dapat menambahkan
                catatan tambahan jika diperlukan.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="submit-notes">Catatan (Opsional)</Label>
                <Textarea
                  id="submit-notes"
                  placeholder="Tambahkan catatan untuk reviewer..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeDialog}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengajukan...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Ajukan
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Approve Dialog */}
      {dialogState.type === 'approve' && (
        <AlertDialog open={dialogState.isOpen} onOpenChange={closeDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Setujui Rencana Pengadaan</AlertDialogTitle>
              <AlertDialogDescription>
                Dengan menyetujui rencana ini, anggaran akan dialokasikan dan dapat
                digunakan untuk pembuatan order pengadaan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Label htmlFor="approve-notes" className="mb-2 block">
                Catatan Persetujuan (Opsional)
              </Label>
              <Textarea
                id="approve-notes"
                placeholder="Tambahkan catatan persetujuan..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                disabled={isApproving}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isApproving}>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault()
                  handleApprove()
                }}
                disabled={isApproving}
                className="bg-green-600 hover:bg-green-700"
              >
                {isApproving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyetujui...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Setujui
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Reject Dialog */}
      {dialogState.type === 'reject' && (
        <Dialog open={dialogState.isOpen} onOpenChange={closeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tolak Rencana Pengadaan</DialogTitle>
              <DialogDescription>
                Rencana akan ditolak dan dikembalikan ke pembuat untuk revisi. Alasan
                penolakan wajib diisi dengan minimal 10 karakter.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reject-reason">
                  Alasan Penolakan <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="reject-reason"
                  placeholder="Jelaskan alasan penolakan dengan detail..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={5}
                  disabled={isRejecting}
                  required
                  className={cn(
                    notes.length > 0 && notes.length < 10 && 'border-destructive focus-visible:ring-destructive'
                  )}
                />
                {notes.length > 0 && notes.length < 10 && (
                  <p className="text-sm text-destructive">
                    Alasan penolakan minimal 10 karakter ({notes.length}/10)
                  </p>
                )}
                {notes.length >= 10 && (
                  <p className="text-sm text-muted-foreground">
                    {notes.length} karakter
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeDialog}
                disabled={isRejecting}
              >
                Batal
              </Button>
              <Button
                onClick={handleReject}
                disabled={isRejecting || !notes.trim() || notes.trim().length < 10}
                variant="destructive"
              >
                {isRejecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menolak...
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Tolak
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Cancel Dialog */}
      {dialogState.type === 'cancel' && (
        <AlertDialog open={dialogState.isOpen} onOpenChange={closeDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Batalkan Rencana Pengadaan</AlertDialogTitle>
              <AlertDialogDescription>
                Rencana yang dibatalkan tidak dapat digunakan kembali. Alasan pembatalan
                wajib diisi dengan minimal 10 karakter. Pastikan Anda yakin dengan tindakan ini.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4 space-y-2">
              <Label htmlFor="cancel-reason">
                Alasan Pembatalan <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="cancel-reason"
                placeholder="Jelaskan alasan pembatalan dengan detail..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
                disabled={isCancelling}
                required
                className={cn(
                  notes.length > 0 && notes.length < 10 && 'border-destructive focus-visible:ring-destructive'
                )}
              />
              {notes.length > 0 && notes.length < 10 && (
                <p className="text-sm text-destructive">
                  Alasan pembatalan minimal 10 karakter ({notes.length}/10)
                </p>
              )}
              {notes.length >= 10 && (
                <p className="text-sm text-muted-foreground">
                  {notes.length} karakter
                </p>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isCancelling}>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault()
                  handleCancel()
                }}
                disabled={isCancelling || !notes.trim() || notes.trim().length < 10}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Membatalkan...
                  </>
                ) : (
                  <>
                    <Ban className="mr-2 h-4 w-4" />
                    Batalkan
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}
