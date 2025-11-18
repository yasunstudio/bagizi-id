/**
 * @fileoverview Receipt Detail Component with Tabs
 * @version Next.js 15.5.4 / shadcn/ui Tabs / Enterprise-grade
 * @author Bagizi-ID Development Team
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Calendar,
  Package,
  User,
  FileText,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  AlertCircle,
  Building2,
  Phone,
  Mail,
  Clock
} from 'lucide-react'
import { useReceipt, useAcceptReceipt, useRejectReceipt, useDeleteReceipt } from '../hooks'
import type { ReceiptWithDetails } from '../types'
import {
  formatCurrency,
  formatDeliveryDate,
  getDeliveryStatusLabel,
  getDeliveryStatusVariant,
  getQualityGradeLabel,
  getQualityGradeVariant,
  getQualityGradeColor,
} from '../lib'

// ================================ COMPONENT ================================

interface ReceiptDetailProps {
  receiptId: string
  defaultTab?: string
}

export function ReceiptDetail({ receiptId, defaultTab = 'overview' }: ReceiptDetailProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(defaultTab)

  // Fetch receipt detail
  const { data: receipt, isLoading, error } = useReceipt(receiptId)
  const { mutate: acceptReceipt, isPending: isAccepting } = useAcceptReceipt()
  const { mutate: rejectReceipt, isPending: isRejecting } = useRejectReceipt()
  const { mutate: deleteReceipt, isPending: isDeleting } = useDeleteReceipt()

  // Actions
  const handleEdit = () => {
    router.push(`/procurement/receipts/${receiptId}/edit`)
  }

  const handleQualityControl = () => {
    setActiveTab('quality-control')
  }

  const handleAccept = () => {
    if (confirm('Apakah Anda yakin ingin menerima penerimaan ini?')) {
      acceptReceipt(receiptId)
    }
  }

  const handleReject = () => {
    const reason = prompt('Masukkan alasan penolakan:')
    if (reason) {
      rejectReceipt({ id: receiptId, reason })
    }
  }

  const handleDelete = () => {
    if (confirm('Apakah Anda yakin ingin menghapus penerimaan ini?')) {
      deleteReceipt(receiptId, {
        onSuccess: () => {
          router.push('/procurement/receipts')
        }
      })
    }
  }

  // Loading state
  if (isLoading) {
    return <ReceiptDetailSkeleton />
  }

  // Error state
  if (error || !receipt) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error?.message || 'Gagal memuat detail penerimaan barang'}
        </AlertDescription>
      </Alert>
    )
  }

  const needsQC = !receipt.inspectedBy && receipt.deliveryStatus === 'DELIVERED'
  const canAccept = receipt.deliveryStatus === 'DELIVERED' && receipt.inspectedBy
  const canReject = receipt.deliveryStatus !== 'CANCELLED'

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {receipt.procurementCode}
              </CardTitle>
              <CardDescription>
                {receipt.receiptNumber && (
                  <span>No. Terima: {receipt.receiptNumber}</span>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getDeliveryStatusVariant(receipt.deliveryStatus)}>
                {getDeliveryStatusLabel(receipt.deliveryStatus)}
              </Badge>
              {receipt.qualityGrade && (
                <Badge variant={getQualityGradeVariant(receipt.qualityGrade)}>
                  {getQualityGradeLabel(receipt.qualityGrade)}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Alert for pending QC */}
          {needsQC && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Penerimaan ini perlu dilakukan quality control.
                <Button 
                  variant="link" 
                  className="px-1 h-auto" 
                  onClick={handleQualityControl}
                >
                  Lakukan QC
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Quick Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Supplier</div>
                <div className="font-medium">{receipt.supplierName || '-'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Tanggal Terima</div>
                <div className="font-medium">
                  {formatDeliveryDate(receipt.actualDelivery, null)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Total Nilai</div>
                <div className="font-medium">{formatCurrency(receipt.totalAmount)}</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {needsQC && (
              <Button onClick={handleQualityControl}>
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Quality Control
              </Button>
            )}
            {canAccept && (
              <Button 
                variant="default" 
                onClick={handleAccept}
                disabled={isAccepting}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {isAccepting ? 'Memproses...' : 'Terima'}
              </Button>
            )}
            {canReject && (
              <Button 
                variant="destructive" 
                onClick={handleReject}
                disabled={isRejecting}
              >
                <XCircle className="mr-2 h-4 w-4" />
                {isRejecting ? 'Memproses...' : 'Tolak'}
              </Button>
            )}
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDelete}
              disabled={isDeleting}
              className="ml-auto"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">Items ({receipt.items.length})</TabsTrigger>
          <TabsTrigger value="quality-control">Quality Control</TabsTrigger>
          <TabsTrigger value="supplier">Supplier</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <OverviewTab receipt={receipt} />
        </TabsContent>

        {/* Items Tab */}
        <TabsContent value="items">
          <ItemsTab receipt={receipt} />
        </TabsContent>

        {/* Quality Control Tab */}
        <TabsContent value="quality-control">
          <QualityControlTab receipt={receipt} />
        </TabsContent>

        {/* Supplier Tab */}
        <TabsContent value="supplier">
          <SupplierTab receipt={receipt} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ================================ TAB COMPONENTS ================================

function OverviewTab({ receipt }: { receipt: ReceiptWithDetails }) {
  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Informasi Penerimaan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Kode Procurement</div>
              <div className="font-medium">{receipt.procurementCode}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">No. Tanda Terima</div>
              <div className="font-medium">{receipt.receiptNumber || '-'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Tanggal Expected</div>
              <div className="font-medium">
                {formatDeliveryDate(receipt.expectedDelivery, null)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Tanggal Actual</div>
              <div className="font-medium">
                {formatDeliveryDate(receipt.actualDelivery, null)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Metode Pengiriman</div>
              <div className="font-medium">{receipt.deliveryMethod || '-'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Biaya Transport</div>
              <div className="font-medium">
                {receipt.transportCost ? formatCurrency(receipt.transportCost) : '-'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Biaya</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatCurrency(receipt.subtotalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pajak</span>
              <span className="font-medium">{formatCurrency(receipt.taxAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Diskon</span>
              <span className="font-medium text-destructive">
                -{formatCurrency(receipt.discountAmount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Biaya Kirim</span>
              <span className="font-medium">{formatCurrency(receipt.shippingCost)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(receipt.totalAmount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ItemsTab({ receipt }: { receipt: ReceiptWithDetails }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Barang</CardTitle>
        <CardDescription>
          {receipt.items.length} item dalam penerimaan ini
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Barang</TableHead>
              <TableHead className="text-center">Dipesan</TableHead>
              <TableHead className="text-center">Diterima</TableHead>
              <TableHead className="text-right">Harga</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipt.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{item.itemName}</div>
                    {item.batchNumber && (
                      <div className="text-sm text-muted-foreground">
                        Batch: {item.batchNumber}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {item.orderedQuantity} {item.unit}
                </TableCell>
                <TableCell className="text-center">
                  {item.receivedQuantity || 0} {item.unit}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(item.pricePerUnit)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(item.finalPrice)}
                </TableCell>
                <TableCell>
                  {item.isAccepted ? (
                    <Badge variant="default">Diterima</Badge>
                  ) : item.rejectionReason ? (
                    <Badge variant="destructive">Ditolak</Badge>
                  ) : (
                    <Badge variant="secondary">Pending</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function QualityControlTab({ receipt }: { receipt: ReceiptWithDetails }) {
  if (!receipt.inspectedBy) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center space-y-2">
            <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="font-medium">Belum Ada Quality Control</h3>
            <p className="text-sm text-muted-foreground">
              Penerimaan ini belum dilakukan quality control
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quality Control</CardTitle>
        <CardDescription>
          Hasil pemeriksaan kualitas barang
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-sm text-muted-foreground">Pemeriksa</div>
              <div className="font-medium">{receipt.inspectedBy}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-sm text-muted-foreground">Waktu Pemeriksaan</div>
              <div className="font-medium">
                {receipt.inspectedAt 
                  ? new Date(receipt.inspectedAt).toLocaleString('id-ID')
                  : '-'
                }
              </div>
            </div>
          </div>
        </div>

        {receipt.qualityGrade && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Grade:</span>
            <Badge 
              variant={getQualityGradeVariant(receipt.qualityGrade)}
              className={getQualityGradeColor(receipt.qualityGrade)}
            >
              {getQualityGradeLabel(receipt.qualityGrade)}
            </Badge>
          </div>
        )}

        {receipt.qualityNotes && (
          <div>
            <div className="text-sm text-muted-foreground mb-1">Catatan:</div>
            <p className="text-sm">{receipt.qualityNotes}</p>
          </div>
        )}

        <Separator />

        <div>
          <h4 className="font-medium mb-3">Per Item</h4>
          <div className="space-y-2">
            {receipt.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{item.itemName}</div>
                  {item.qualityReceived && (
                    <div className="text-sm text-muted-foreground">
                      Kualitas: {item.qualityReceived}
                    </div>
                  )}
                </div>
                {item.gradeReceived && (
                  <Badge variant="outline">{item.gradeReceived}</Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SupplierTab({ receipt }: { receipt: ReceiptWithDetails }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informasi Supplier</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <div className="text-sm text-muted-foreground">Nama Supplier</div>
              <div className="font-medium">{receipt.supplier.supplierName}</div>
              <div className="text-sm text-muted-foreground">
                {receipt.supplier.supplierCode}
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <div className="text-sm text-muted-foreground">Tipe</div>
              <div className="font-medium">{receipt.supplier.supplierType}</div>
            </div>
          </div>

          {receipt.supplier.contactPhone && (
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm text-muted-foreground">Telepon</div>
                <div className="font-medium">{receipt.supplier.contactPhone}</div>
              </div>
            </div>
          )}

          {receipt.supplier.contactEmail && (
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm text-muted-foreground">Email</div>
                <div className="font-medium">{receipt.supplier.contactEmail}</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ================================ LOADING SKELETON ================================

function ReceiptDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
          <Separator />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-24" />
            ))}
          </div>
        </CardContent>
      </Card>
      <Skeleton className="h-96" />
    </div>
  )
}
