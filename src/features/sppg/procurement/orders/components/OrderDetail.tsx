/**
 * @fileoverview OrderDetail Component - Comprehensive Order Display
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 * 
 * CRITICAL: Full order detail display with all information
 * - Order header with status badges
 * - Supplier and delivery information
 * - Items table with calculations
 * - Order summary with totals
 * - Status timeline
 * - Action buttons (conditional)
 * - Audit trail
 * 
 * FEATURES:
 * - Responsive grid layout
 * - Conditional rendering based on status
 * - Action buttons with permissions
 * - Print/export functionality
 * - Real-time status updates
 * - Comprehensive data display
 */

'use client'

import { useState } from 'react'
import { 
  Calendar,
  Building2,
  User,
  Phone,
  Mail,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Download,
  Printer,
  Trash2,
  MoreHorizontal,
  MapPin,
  Truck,
  DollarSign,
  Info,
  ArrowUpCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
import type { OrderWithDetails } from '../types'
import {
  formatCurrency,
  formatDate,
  getStatusColor,
  getStatusLabel
} from '../utils'
import { ItemsList } from '@/features/sppg/procurement/items/components/ItemsList'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface OrderDetailProps {
  order: OrderWithDetails
  onDelete?: () => void
  onApprove?: () => void
  onReject?: () => void
  onCancel?: () => void
  onEscalate?: () => void
  canEdit?: boolean
  canDelete?: boolean
  canApprove?: boolean
  canReject?: boolean
  canCancel?: boolean
  canEscalate?: boolean
}

export function OrderDetail({
  order,
  onDelete,
  onApprove,
  onReject,
  onCancel,
  onEscalate,
  // canEdit = false, // TODO: Use when implementing edit mode
  canDelete = false,
  canApprove = false,
  canReject = false,
  canCancel = false,
  canEscalate = false,
}: OrderDetailProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  // ============================================================================
  // CRITICAL: Use data from API response (database), NOT frontend calculation
  // ============================================================================
  
  // Get totals from database (calculated by backend)
  const subtotal = order.subtotalAmount || 0
  const taxAmount = order.taxAmount || 0
  const discountAmount = order.discountAmount || 0
  const shippingCost = order.shippingCost || 0
  const grandTotal = order.totalAmount || 0

  // Calculate per-item discount for display purposes only
  const totalItemDiscount = order.items.reduce((sum, item) => {
    const itemSubtotal = item.orderedQuantity * item.pricePerUnit
    return sum + (itemSubtotal * (item.discountPercent || 0)) / 100
  }, 0)

  // Status badge
  const statusColor = getStatusColor(order.status)
  const statusLabel = getStatusLabel(order.status)

  // Can perform actions based on status
  const canPerformActions = ['DRAFT', 'PENDING_APPROVAL'].includes(order.status)
  const showApproveReject = order.status === 'PENDING_APPROVAL' && (canApprove || canReject)

  return (
    <>
      <div className="space-y-6">
        {/* Header Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-2xl">Order #{order.procurementCode}</CardTitle>
                  <Badge 
                    variant={
                      statusColor === 'default' ? 'default' :
                      statusColor === 'secondary' ? 'secondary' :
                      statusColor === 'destructive' ? 'destructive' :
                      statusColor === 'outline' ? 'outline' :
                      'default'
                    }
                  >
                    {statusLabel}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-4 text-base">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Tanggal: {formatDate(order.procurementDate)}
                  </span>
                  {order.expectedDelivery && (
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Truck className="h-4 w-4" />
                      Pengiriman: {formatDate(order.expectedDelivery)}
                    </span>
                  )}
                </CardDescription>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {showApproveReject && (
                  <>
                    {canApprove && (
                      <Button onClick={onApprove} size="sm">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    )}
                    {canReject && (
                      <Button onClick={onReject} variant="destructive" size="sm">
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    )}
                    {canEscalate && (
                      <Button onClick={onEscalate} variant="outline" size="sm">
                        <ArrowUpCircle className="h-4 w-4 mr-2" />
                        Escalate
                      </Button>
                    )}
                  </>
                )}

                {/* More Actions Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="h-4 w-4 mr-2" />
                      Export PDF
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {canCancel && canPerformActions && (
                      <DropdownMenuItem 
                        onClick={() => setShowCancelDialog(true)}
                        className="text-orange-600"
                      >
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Cancel Order
                      </DropdownMenuItem>
                    )}
                    {canDelete && order.status === 'DRAFT' && (
                      <DropdownMenuItem 
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Supplier Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Informasi Supplier
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Building2 className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Nama Supplier</p>
                    <p className="font-semibold">{order.supplier.supplierName}</p>
                  </div>
                </div>

                {order.supplier.contactAddress && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Alamat</p>
                      <p>{order.supplier.contactAddress}</p>
                    </div>
                  </div>
                )}

                {order.supplierContact && (
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Contact Person</p>
                      <p>{order.supplierContact}</p>
                    </div>
                  </div>
                )}

                {order.supplier.contactPhone && (
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Telepon</p>
                      <p>{order.supplier.contactPhone}</p>
                    </div>
                  </div>
                )}

                {order.supplier.contactEmail && (
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p>{order.supplier.contactEmail}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Informasi Order
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Metode Pengadaan</p>
                  <p className="font-semibold">{order.purchaseMethod}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Syarat Pembayaran</p>
                  <p className="font-semibold">{order.paymentTerms || '-'}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Tanggal Order</p>
                  <p className="font-semibold">{formatDate(order.procurementDate)}</p>
                </div>

                {order.expectedDelivery && (
                  <div>
                    <p className="text-sm text-muted-foreground">Estimasi Pengiriman</p>
                    <p className="font-semibold">{formatDate(order.expectedDelivery)}</p>
                  </div>
                )}

                {order.actualDelivery && (
                  <div>
                    <p className="text-sm text-muted-foreground">Tanggal Terima</p>
                    <p className="font-semibold">{formatDate(order.actualDelivery)}</p>
                  </div>
                )}

                {order.deliveryMethod && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Metode Pengiriman</p>
                    <p className="font-semibold">{order.deliveryMethod}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Items Management with Tabs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Item Management
            </CardTitle>
            <CardDescription>
              Kelola item yang dipesan, terima barang, dan lakukan quality control
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="items" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="items">
                  Items ({order.items.length})
                </TabsTrigger>
                <TabsTrigger value="receiving">
                  Receiving & QC
                </TabsTrigger>
              </TabsList>

              <TabsContent value="items" className="mt-6">
                <ItemsList 
                  orderId={order.id}
                />
              </TabsContent>

              <TabsContent value="receiving" className="mt-6">
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Receiving & Quality Control</p>
                  <p className="text-sm">
                    {order.status === 'ORDERED' || order.status === 'PARTIALLY_RECEIVED'
                      ? 'Terima barang dan lakukan quality control di tab ini'
                      : 'Receiving hanya tersedia untuk order dengan status ORDERED atau PARTIALLY_RECEIVED'}
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Ringkasan Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal ({order.items.length} items)</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>

              {totalItemDiscount > 0 && (
                <div className="flex items-center justify-between text-green-600">
                  <span>Diskon Item</span>
                  <span className="font-semibold">-{formatCurrency(totalItemDiscount)}</span>
                </div>
              )}

              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-green-600">
                  <span>Diskon Tambahan</span>
                  <span className="font-semibold">-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">PPN (11%)</span>
                <span className="font-semibold">{formatCurrency(taxAmount)}</span>
              </div>

              {shippingCost > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Biaya Pengiriman</span>
                  <span className="font-semibold">{formatCurrency(shippingCost)}</span>
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between text-lg">
                <span className="font-bold">Total Order</span>
                <span className="font-bold text-primary">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        {(order.inspectedBy || order.rejectionReason) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Informasi Tambahan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.inspectedBy && order.inspectedAt && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Diperiksa oleh</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="font-medium">{order.inspectedBy}</span>
                    <span className="text-sm text-muted-foreground">
                      pada {formatDate(order.inspectedAt)}
                    </span>
                  </div>
                </div>
              )}

              {order.rejectionReason && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Alasan Penolakan</p>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <p className="text-sm text-muted-foreground">
                      {order.rejectionReason}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Audit Trail */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Audit Trail
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tanggal dibuat</span>
                <span className="font-medium">{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Terakhir diperbarui</span>
                <span className="font-medium">{formatDate(order.updatedAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Order?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus order #{order.procurementCode}? 
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete?.()
                setShowDeleteDialog(false)
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Batalkan Order?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin membatalkan order #{order.procurementCode}? 
              Order yang sudah dibatalkan tidak dapat diproses lebih lanjut.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Tidak</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onCancel?.()
                setShowCancelDialog(false)
              }}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Ya, Batalkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
