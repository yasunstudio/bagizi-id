/**
 * @fileoverview Order Actions Component
 * Action button group for order management operations
 * 
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Ban,
  FileText,
  Send,
  Package,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import type { Order } from '../types'

// ============================================================================
// Types & Interfaces
// ============================================================================

interface OrderActionsProps {
  order: Order
  
  // Permissions
  canEdit?: boolean
  canDelete?: boolean
  canApprove?: boolean
  canReject?: boolean
  canCancel?: boolean
  canSubmit?: boolean
  canReceive?: boolean
  canComplete?: boolean
  
  // Action handlers
  onEdit?: () => void
  onDelete?: () => Promise<void>
  onApprove?: () => Promise<void>
  onReject?: () => Promise<void>
  onCancel?: () => Promise<void>
  onSubmit?: () => Promise<void>
  onReceive?: () => Promise<void>
  onComplete?: () => Promise<void>
  
  // Loading states
  isDeleting?: boolean
  isApproving?: boolean
  isRejecting?: boolean
  isCancelling?: boolean
  isSubmitting?: boolean
  isReceiving?: boolean
  isCompleting?: boolean
  
  // Layout
  variant?: 'default' | 'compact'
  showLabels?: boolean
}

interface ConfirmationDialog {
  open: boolean
  action: 'delete' | 'approve' | 'reject' | 'cancel' | 'submit' | 'receive' | 'complete' | null
  title: string
  description: string
}

// ============================================================================
// Main Component
// ============================================================================

export function OrderActions({
  order,
  canEdit = false,
  canDelete = false,
  canApprove = false,
  canReject = false,
  canCancel = false,
  canSubmit = false,
  canReceive = false,
  canComplete = false,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onCancel,
  onSubmit,
  onReceive,
  onComplete,
  isDeleting = false,
  isApproving = false,
  isRejecting = false,
  isCancelling = false,
  isSubmitting = false,
  isReceiving = false,
  isCompleting = false,
  variant = 'default',
  showLabels = true,
}: OrderActionsProps) {
  const router = useRouter()
  const [confirmDialog, setConfirmDialog] = useState<ConfirmationDialog>({
    open: false,
    action: null,
    title: '',
    description: '',
  })

  // ============================================================================
  // Action Handlers
  // ============================================================================

  const handleEdit = () => {
    if (onEdit) {
      onEdit()
    } else {
      router.push(`/procurement/orders/${order.id}/edit`)
    }
  }

  const handleDelete = () => {
    setConfirmDialog({
      open: true,
      action: 'delete',
      title: 'Hapus Order',
      description: `Apakah Anda yakin ingin menghapus order ${order.procurementCode}? Tindakan ini tidak dapat dibatalkan.`,
    })
  }

  const handleApprove = () => {
    setConfirmDialog({
      open: true,
      action: 'approve',
      title: 'Setujui Order',
      description: `Apakah Anda yakin ingin menyetujui order ${order.procurementCode}? Order akan diproses setelah disetujui.`,
    })
  }

  const handleReject = () => {
    setConfirmDialog({
      open: true,
      action: 'reject',
      title: 'Tolak Order',
      description: `Apakah Anda yakin ingin menolak order ${order.procurementCode}? Order tidak akan diproses.`,
    })
  }

  const handleCancel = () => {
    setConfirmDialog({
      open: true,
      action: 'cancel',
      title: 'Batalkan Order',
      description: `Apakah Anda yakin ingin membatalkan order ${order.procurementCode}? Tindakan ini tidak dapat dibatalkan.`,
    })
  }

  const handleSubmit = () => {
    setConfirmDialog({
      open: true,
      action: 'submit',
      title: 'Kirim Order',
      description: `Apakah Anda yakin ingin mengirim order ${order.procurementCode} untuk disetujui?`,
    })
  }

  const handleReceive = () => {
    setConfirmDialog({
      open: true,
      action: 'receive',
      title: 'Terima Barang',
      description: `Apakah Anda yakin ingin menandai order ${order.procurementCode} sebagai sudah diterima?`,
    })
  }

  const handleComplete = () => {
    setConfirmDialog({
      open: true,
      action: 'complete',
      title: 'Selesaikan Order',
      description: `Apakah Anda yakin ingin menyelesaikan order ${order.procurementCode}? Order tidak dapat diubah setelah diselesaikan.`,
    })
  }

  const handleConfirm = async () => {
    const { action } = confirmDialog
    
    try {
      switch (action) {
        case 'delete':
          if (onDelete) await onDelete()
          break
        case 'approve':
          if (onApprove) await onApprove()
          break
        case 'reject':
          if (onReject) await onReject()
          break
        case 'cancel':
          if (onCancel) await onCancel()
          break
        case 'submit':
          if (onSubmit) await onSubmit()
          break
        case 'receive':
          if (onReceive) await onReceive()
          break
        case 'complete':
          if (onComplete) await onComplete()
          break
      }
      
      setConfirmDialog({ open: false, action: null, title: '', description: '' })
    } catch (error) {
      console.error(`Error ${action}ing order:`, error)
      toast.error(`Gagal ${action === 'delete' ? 'menghapus' : action === 'approve' ? 'menyetujui' : action === 'reject' ? 'menolak' : action === 'cancel' ? 'membatalkan' : action === 'submit' ? 'mengirim' : action === 'receive' ? 'menerima' : 'menyelesaikan'} order`)
    }
  }

  // ============================================================================
  // Render Helpers
  // ============================================================================

  const renderButton = (
    icon: React.ReactNode,
    label: string,
    onClick: () => void,
    buttonVariant: 'default' | 'outline' | 'ghost' | 'destructive' = 'outline',
    isLoading = false,
    disabled = false
  ) => {
    const buttonContent = (
      <Button
        onClick={onClick}
        variant={buttonVariant}
        size={showLabels ? 'default' : 'icon'}
        disabled={isLoading || disabled}
        className={variant === 'compact' ? 'h-8 px-2' : ''}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          icon
        )}
        {showLabels && <span className="ml-2">{label}</span>}
      </Button>
    )

    if (!showLabels) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {buttonContent}
            </TooltipTrigger>
            <TooltipContent>
              <p>{label}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return buttonContent
  }

  // ============================================================================
  // Render
  // ============================================================================

  const hasActions = canEdit || canDelete || canApprove || canReject || canCancel || canSubmit || canReceive || canComplete

  if (!hasActions) {
    return null
  }

  return (
    <>
      <div className={`flex items-center ${variant === 'compact' ? 'gap-1' : 'gap-2'} flex-wrap`}>
        {/* Edit */}
        {canEdit && renderButton(
          <Edit className="h-4 w-4" />,
          'Edit',
          handleEdit,
          'outline'
        )}

        {/* Submit for Approval */}
        {canSubmit && renderButton(
          <Send className="h-4 w-4" />,
          'Kirim',
          handleSubmit,
          'default',
          isSubmitting
        )}

        {/* Approve */}
        {canApprove && renderButton(
          <CheckCircle2 className="h-4 w-4" />,
          'Setujui',
          handleApprove,
          'default',
          isApproving
        )}

        {/* Reject */}
        {canReject && renderButton(
          <XCircle className="h-4 w-4" />,
          'Tolak',
          handleReject,
          'destructive',
          isRejecting
        )}

        {/* Receive */}
        {canReceive && renderButton(
          <Package className="h-4 w-4" />,
          'Terima',
          handleReceive,
          'default',
          isReceiving
        )}

        {/* Complete */}
        {canComplete && renderButton(
          <FileText className="h-4 w-4" />,
          'Selesaikan',
          handleComplete,
          'default',
          isCompleting
        )}

        {/* Cancel */}
        {canCancel && renderButton(
          <Ban className="h-4 w-4" />,
          'Batalkan',
          handleCancel,
          'outline',
          isCancelling
        )}

        {/* Delete */}
        {canDelete && renderButton(
          <Trash2 className="h-4 w-4" />,
          'Hapus',
          handleDelete,
          'destructive',
          isDeleting
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => {
        if (!open) {
          setConfirmDialog({ open: false, action: null, title: '', description: '' })
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              Ya, Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
