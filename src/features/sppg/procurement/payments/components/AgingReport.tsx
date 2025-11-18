"use client"

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Building2, AlertTriangle, TrendingUp } from 'lucide-react'
import { useAgingReport } from '@/features/sppg/procurement/payments/hooks'
import type { AgingReportFilters } from '@/features/sppg/procurement/payments/types'

interface AgingReportProps {
  filters?: AgingReportFilters
}

export function AgingReport({ filters }: AgingReportProps) {
  const { data: response, isLoading, error } = useAgingReport(filters)

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
            <p className="font-medium">Gagal memuat laporan aging</p>
            <p className="text-sm mt-2">{error?.message || 'Terjadi kesalahan'}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const reportData = response.data
  const agingData = reportData.supplierBreakdown || []
  const summary = reportData.summary || {
    current: 0,
    days31to60: 0,
    days61to90: 0,
    over90: 0,
    totalOutstanding: 0,
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">0-30 Hari</p>
              <p className="text-xl font-bold">
                Rp {summary.current.toLocaleString('id-ID')}
              </p>
              <Badge variant="secondary" className="text-xs">
                Lancar
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">31-60 Hari</p>
              <p className="text-xl font-bold">
                Rp {summary.days31to60.toLocaleString('id-ID')}
              </p>
              <Badge variant="secondary" className="text-xs bg-yellow-500/10 text-yellow-700">
                Perhatian
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">61-90 Hari</p>
              <p className="text-xl font-bold">
                Rp {summary.days61to90.toLocaleString('id-ID')}
              </p>
              <Badge variant="secondary" className="text-xs bg-orange-500/10 text-orange-700">
                Urgent
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">&gt;90 Hari</p>
              <p className="text-xl font-bold">
                Rp {summary.over90.toLocaleString('id-ID')}
              </p>
              <Badge variant="destructive" className="text-xs">
                Kritis
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary/5">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total Belum Dibayar</p>
              <p className="text-2xl font-bold">
                Rp {summary.totalOutstanding.toLocaleString('id-ID')}
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                {agingData.length} Supplier
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aging Table */}
      <Card>
        <CardHeader>
          <CardTitle>Umur Hutang per Supplier</CardTitle>
        </CardHeader>
        <CardContent>
          {agingData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-right">0-30 Hari</TableHead>
                  <TableHead className="text-right">31-60 Hari</TableHead>
                  <TableHead className="text-right">61-90 Hari</TableHead>
                  <TableHead className="text-right">&gt;90 Hari</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Invoice Tertua</TableHead>
                  <TableHead>Kontak</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agingData.map((item: {
                  supplierId: string
                  supplierName: string
                  current: number
                  days31to60: number
                  days61to90: number
                  over90: number
                  totalOutstanding: number
                  procurementCount: number
                }) => {
                  const riskLevel = getRiskLevel(item)
                  
                  return (
                    <TableRow key={item.supplierId}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{item.supplierName}</p>
                            {riskLevel === 'high' && (
                              <Badge variant="destructive" className="text-xs mt-1">
                                Risiko Tinggi
                              </Badge>
                            )}
                            {riskLevel === 'medium' && (
                              <Badge variant="secondary" className="text-xs mt-1 bg-orange-500/10 text-orange-700">
                                Risiko Sedang
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        Rp {item.current.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={item.days31to60 > 0 ? 'text-yellow-700 font-medium' : ''}>
                          Rp {item.days31to60.toLocaleString('id-ID')}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={item.days61to90 > 0 ? 'text-orange-700 font-medium' : ''}>
                          Rp {item.days61to90.toLocaleString('id-ID')}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={item.over90 > 0 ? 'text-destructive font-bold' : ''}>
                          Rp {item.over90.toLocaleString('id-ID')}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        Rp {item.totalOutstanding.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        -
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          -
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Tidak ada data aging</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Analisis & Rekomendasi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {summary.over90 > 0 && (
            <div className="flex items-start gap-3 p-3 bg-destructive/10 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-sm">Kritis: Terlambat {'>'}90 Hari</p>
                <p className="text-xs text-muted-foreground">
                  Rp {summary.over90.toLocaleString('id-ID')} dalam kategori kritis. Segera lakukan
                  follow-up dan pertimbangkan sanksi atau renegotiasi.
                </p>
              </div>
            </div>
          )}

          {summary.days61to90 > summary.totalOutstanding * 0.3 && (
            <div className="flex items-start gap-3 p-3 bg-orange-500/10 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-700 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-sm">Peringatan: Saldo 61-90 Hari Tinggi</p>
                <p className="text-xs text-muted-foreground">
                  Lebih dari 30% outstanding dalam kategori 61-90 hari. Tingkatkan monitoring dan
                  reminder pembayaran.
                </p>
              </div>
            </div>
          )}

          {summary.current > summary.totalOutstanding * 0.7 && (
            <div className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-700 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-sm">Bagus: Cash Flow Sehat</p>
                <p className="text-xs text-muted-foreground">
                  Sebagian besar outstanding (
                  {((summary.current / summary.totalOutstanding) * 100).toFixed(0)}%) masih dalam kategori
                  lancar (0-30 hari).
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Helper function to determine risk level
function getRiskLevel(item: {
  over90: number
  days61to90: number
  totalOutstanding: number
}): 'low' | 'medium' | 'high' {
  if (item.over90 > 0 || item.days61to90 > item.totalOutstanding * 0.5) {
    return 'high'
  }
  if (item.days61to90 > 0) {
    return 'medium'
  }
  return 'low'
}
