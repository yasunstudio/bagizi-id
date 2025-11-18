"use client"

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  Building2,
  CreditCard,
  FileText,
  Download,
  AlertTriangle,
  Clock,
  Trash2,
} from 'lucide-react'
import { usePayment, useDeletePayment } from '@/features/sppg/procurement/payments/hooks'
import { formatPaymentMethod } from '@/features/sppg/procurement/payments/types'

interface PaymentDetailProps {
  paymentId: string
  onEdit?: () => void
  onBack?: () => void
}

export function PaymentDetail({ paymentId, onEdit, onBack }: PaymentDetailProps) {
  const { data: response, isLoading, error } = usePayment(paymentId)
  const { mutate: deletePayment, isPending: isDeleting } = useDeletePayment()

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !response?.success || !response.data) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <p className="font-medium">Data pembayaran tidak ditemukan</p>
            <p className="text-sm mt-2">{error?.message || 'Terjadi kesalahan'}</p>
            {onBack && (
              <Button variant="outline" className="mt-4" onClick={onBack}>
                Kembali
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const payment = response.data

  const handleDelete = () => {
    if (confirm('Yakin ingin menghapus transaksi pembayaran ini?')) {
      deletePayment(paymentId, {
        onSuccess: () => {
          onBack?.()
        },
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">Detail Transaksi Pembayaran</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>ID: {payment.id}</span>
              </div>
            </div>
            <Badge className="text-base px-3 py-1">
              {formatPaymentMethod(payment.paymentMethod)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Payment Amount */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Jumlah Pembayaran</p>
            <p className="text-3xl font-bold">
              Rp {payment.amount.toLocaleString('id-ID')}
            </p>
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Tanggal Pembayaran:</span>
                <span className="font-medium">
                  {new Date(payment.paymentDate).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Metode Pembayaran:</span>
                <span className="font-medium">
                  {formatPaymentMethod(payment.paymentMethod)}
                </span>
              </div>

              {payment.referenceNumber && (
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Nomor Referensi:</span>
                  <span className="font-mono text-sm">{payment.referenceNumber}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {payment.bankName && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Nama Bank:</span>
                  <span className="font-medium">{payment.bankName}</span>
                </div>
              )}

              {payment.accountNumber && (
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Nomor Rekening:</span>
                  <span className="font-mono text-sm">{payment.accountNumber}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Dicatat Oleh:</span>
                <span className="font-medium">{payment.createdByName || 'Unknown'}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {payment.notes && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Catatan:</p>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                {payment.notes}
              </p>
            </div>
          )}

          {/* Receipt */}
          {payment.receiptUrl && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Bukti Pembayaran:</p>
              <Button
                variant="outline"
                onClick={() => window.open(payment.receiptUrl!, '_blank')}
              >
                <Download className="h-4 w-4 mr-2" />
                Lihat Bukti Pembayaran
              </Button>
            </div>
          )}

          {/* Timestamps */}
          <div className="pt-4 border-t text-xs text-muted-foreground space-y-1">
            <p>
              Dibuat: {new Date(payment.createdAt).toLocaleString('id-ID')}
            </p>
            <p>
              Diperbarui: {new Date(payment.updatedAt).toLocaleString('id-ID')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            Kembali
          </Button>
        )}
        <div className="flex gap-2">
          {onEdit && (
            <Button variant="outline" onClick={onEdit}>
              Edit
            </Button>
          )}
          <Button
            variant="destructive"
            disabled={isDeleting}
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? 'Menghapus...' : 'Hapus'}
          </Button>
        </div>
      </div>
    </div>
  )
}
