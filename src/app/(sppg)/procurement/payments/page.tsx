/**
 * @fileoverview Payment Management Page - Enterprise Payment Dashboard
 * 
 * This page provides comprehensive payment management including:
 * - Real-time payment statistics and trends
 * - Overdue payment alerts
 * - Complete payment history with filtering
 * - Accounts payable aging analysis
 * - Payment reconciliation tools
 * 
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * @see {@link /docs/PROCUREMENT_ENTERPRISE_AUDIT_COMPLETE.md} Audit Documentation
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { CreditCard, TrendingUp, AlertTriangle, FileText, Plus } from 'lucide-react'
import { ProcurementPageHeader } from '@/components/shared/procurement'
import {
  PaymentStats,
  OverduePayments,
  PaymentList,
  PaymentForm,
  AgingReport,
} from '@/features/sppg/procurement/payments/components'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function PaymentsPage() {
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [selectedProcurementId, setSelectedProcurementId] = useState<string | null>(null)

  // Handle payment button click from table
  const handlePayClick = (procurementId: string) => {
    setSelectedProcurementId(procurementId)
    setShowPaymentForm(true)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header with Breadcrumb */}
      <ProcurementPageHeader
        title="Manajemen Pembayaran"
        description="Kelola pembayaran, track payment terms, dan analisis hutang supplier"
        icon={CreditCard}
        breadcrumbs={['Procurement', 'Payments']}
        action={{
          label: 'Catat Pembayaran',
          onClick: () => setShowPaymentForm(true),
          icon: Plus,
        }}
      />

      {/* Payment Statistics */}
      <PaymentStats />

      {/* Overdue Alerts */}
      <OverduePayments onPayClick={handlePayClick} />

      {/* Main Content Tabs */}
      <Tabs defaultValue="payments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto">
          <TabsTrigger value="payments" className="gap-2">
            <FileText className="h-4 w-4" />
            Riwayat Pembayaran
          </TabsTrigger>
          <TabsTrigger value="aging" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Laporan Umur Hutang
          </TabsTrigger>
        </TabsList>

        {/* Payments List Tab */}
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Pembayaran</CardTitle>
              <CardDescription>
                Riwayat pembayaran procurement dengan filter dan pencarian lengkap
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentList onPayClick={handlePayClick} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aging Report Tab */}
        <TabsContent value="aging" className="space-y-4">
          <AgingReport />
        </TabsContent>
      </Tabs>

      {/* Payment Form Dialog */}
      <Dialog open={showPaymentForm} onOpenChange={setShowPaymentForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Catat Pembayaran Baru</DialogTitle>
            <DialogDescription>
              {selectedProcurementId 
                ? 'Tambahkan transaksi pembayaran untuk procurement terpilih'
                : 'Pilih procurement terlebih dahulu dari daftar pembayaran'}
            </DialogDescription>
          </DialogHeader>
          {selectedProcurementId ? (
            <PaymentForm
              procurementId={selectedProcurementId}
              onSuccess={() => {
                setShowPaymentForm(false)
                setSelectedProcurementId(null)
              }}
            />
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
              <p>Silakan pilih procurement dari tabel Riwayat Pembayaran</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setShowPaymentForm(false)}
              >
                Tutup
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}