/**
 * @fileoverview Order Detail Page
 * Displays detailed information about a specific procurement order
 * 
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useParams, useRouter } from 'next/navigation'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft } from 'lucide-react'
import { 
  OrderDetail, 
  OrderActions, 
  ApprovalTrackingCard,
  AutoApproveBadge,
  EscalationAlert,
  PendingDurationBadge,
} from '@/features/sppg/procurement/orders/components'
import { 
  useOrder, 
  useDeleteOrder, 
  useApproveOrder, 
  useRejectOrder, 
  useCancelOrder,
  useEscalateOrder
} from '@/features/sppg/procurement/orders/hooks'
import { toast } from 'sonner'

// ============================================================================
// Main Page Component
// ============================================================================

function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  // Fetch order data
  const { data: order, isLoading, error } = useOrder(orderId)

  // Mutations
  const { mutate: deleteOrder, isPending: isDeleting } = useDeleteOrder()
  const { mutate: approveOrder, isPending: isApproving } = useApproveOrder()
  const { mutate: rejectOrder, isPending: isRejecting } = useRejectOrder()
  const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder()
  const { mutate: escalateOrder } = useEscalateOrder()

  // Action handlers
  const handleEdit = () => {
    router.push(`/procurement/orders/${orderId}/edit`)
  }

  const handleDelete = async () => {
    deleteOrder(orderId, {
      onSuccess: () => {
        toast.success('Order berhasil dihapus')
        router.push('/procurement/orders')
      },
      onError: (error) => {
        toast.error(error.message || 'Gagal menghapus order')
      },
    })
  }

  const handleApprove = async () => {
    approveOrder(
      { 
        id: orderId, 
        data: { 
          approvalNotes: 'Disetujui' 
        } 
      },
      {
        onSuccess: () => {
          toast.success('Order berhasil disetujui')
        },
        onError: (error) => {
          toast.error(error.message || 'Gagal menyetujui order')
        },
      }
    )
  }

  const handleReject = async () => {
    // TODO: Show dialog to collect rejection reason
    rejectOrder(
      { 
        id: orderId, 
        data: { 
          rejectionReason: 'Alasan penolakan',
          alternativeAction: 'Revisi dokumen'
        } 
      },
      {
        onSuccess: () => {
          toast.success('Order berhasil ditolak')
        },
        onError: (error) => {
          toast.error(error.message || 'Gagal menolak order')
        },
      }
    )
  }

  const handleCancel = async () => {
    // TODO: Show dialog to collect cancellation reason
    cancelOrder(
      { 
        id: orderId, 
        data: { 
          cancellationReason: 'Alasan pembatalan',
          refundRequired: false
        } 
      },
      {
        onSuccess: () => {
          toast.success('Order berhasil dibatalkan')
        },
        onError: (error) => {
          toast.error(error.message || 'Gagal membatalkan order')
        },
      }
    )
  }

  const handleEscalate = async () => {
    // TODO: Show dialog to collect escalation details
    escalateOrder(
      { 
        id: orderId, 
        data: { 
          escalateToRole: 'SPPG_KEPALA',
          reason: 'Approval diperlukan segera'
        } 
      },
      {
        onSuccess: () => {
          toast.success('Order berhasil dieskalasi')
        },
        onError: (error) => {
          toast.error(error.message || 'Gagal melakukan eskalasi')
        },
      }
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error || !order) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/procurement/orders">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Order Not Found</h1>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription className="text-destructive">
              {error?.message || 'Order tidak ditemukan'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/procurement/orders">Kembali ke Daftar Order</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main content
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/procurement/orders">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">
                Detail Order {order.procurementCode}
              </h1>
              {/* Auto-Approve Badge */}
              {order.status === 'APPROVED' && order.totalAmount < 5000000 && (
                <AutoApproveBadge
                  isAutoApproved={true}
                  totalAmount={order.totalAmount}
                  threshold={5000000}
                />
              )}
              {/* Pending Duration Badge */}
              <PendingDurationBadge
                startDate={order.createdAt}
                status={order.status}
                warningThreshold={3}
              />
            </div>
            <p className="text-muted-foreground mt-1">
              Informasi lengkap tentang order pembelian
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <OrderActions
            order={order}
            canEdit={order.status === 'DRAFT' || order.status === 'PENDING_APPROVAL'}
            canDelete={order.status === 'DRAFT'}
            canApprove={order.status === 'PENDING_APPROVAL'}
            canReject={order.status === 'PENDING_APPROVAL'}
            canCancel={
              order.status === 'APPROVED' || 
              order.status === 'ORDERED' || 
              order.status === 'PARTIALLY_RECEIVED'
            }
            onEdit={handleEdit}
            onDelete={handleDelete}
            onApprove={handleApprove}
            onReject={handleReject}
            onCancel={handleCancel}
            isDeleting={isDeleting}
            isApproving={isApproving}
            isRejecting={isRejecting}
            isCancelling={isCancelling}
          />
        </div>
      </div>

      {/* Escalation Alert */}
      <EscalationAlert
        createdAt={order.createdAt}
        status={order.status}
        thresholdDays={3}
        showEscalateButton={true}
        onEscalate={handleEscalate}
        isEscalating={false}
      />

      {/* Order Detail */}
      {/* Conditional layout: Full width if no approval tracking, 2-column layout if has approval tracking */}
      {order.status === 'PENDING_APPROVAL' || (order.approvalTracking && order.approvalTracking.length > 0) ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            <OrderDetail 
              order={order}
              canEdit={false}
              canDelete={order.status === 'DRAFT'}
              canApprove={false}
              canReject={false}
              canCancel={
                order.status === 'APPROVED' || 
                order.status === 'ORDERED' || 
                order.status === 'PARTIALLY_RECEIVED'
              }
              canEscalate={false}
              onDelete={handleDelete}
              onApprove={handleApprove}
              onReject={handleReject}
              onCancel={handleCancel}
              onEscalate={handleEscalate}
            />
          </div>

          {/* Sidebar - Right Side */}
          <div className="space-y-6">
            {/* Approval Tracking Card */}
            <ApprovalTrackingCard
              approvals={order.approvalTracking || []}
              requiredApprovers={3}
              orderStatus={order.status}
            />
          </div>
        </div>
      ) : (
        /* Full Width Layout - No Sidebar */
        <OrderDetail 
          order={order}
          canEdit={false}
          canDelete={order.status === 'DRAFT'}
          canApprove={false}
          canReject={false}
          canCancel={
            order.status === 'APPROVED' || 
            order.status === 'ORDERED' || 
            order.status === 'PARTIALLY_RECEIVED'
          }
          canEscalate={false}
          onDelete={handleDelete}
          onApprove={handleApprove}
          onReject={handleReject}
          onCancel={handleCancel}
          onEscalate={handleEscalate}
        />
      )}
    </div>
  )
}

// ============================================================================
// Export with Auth Protection
// ============================================================================

export default OrderDetailPage
