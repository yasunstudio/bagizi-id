/**
 * Beneficiary Organization Distributions Tab Component
 * Displays distribution history for this organization
 * 
 * @component
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { BeneficiaryOrganizationDetail } from '../../api/beneficiaryOrganizationApi'

interface BeneficiaryOrganizationDistributionsTabProps {
  organization: BeneficiaryOrganizationDetail
}

export function BeneficiaryOrganizationDistributionsTab({
  organization,
}: BeneficiaryOrganizationDistributionsTabProps) {
  const getDistributionStatusBadge = (status: string): string => {
    switch (status) {
      case 'COMPLETED':
        return 'Selesai'
      case 'IN_PROGRESS':
        return 'Berlangsung'
      case 'PLANNED':
        return 'Direncanakan'
      case 'SCHEDULED':
        return 'Terjadwal'
      case 'CANCELLED':
        return 'Dibatalkan'
      default:
        return status
    }
  }

  const getMealTypeLabel = (mealType: string) => {
    const labels: Record<string, string> = {
      BREAKFAST: 'Sarapan',
      LUNCH: 'Makan Siang',
      SNACK: 'Makanan Tambahan',
      DINNER: 'Makan Malam',
    }
    return labels[mealType] || mealType
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'outline' | 'destructive' => {
    switch (status) {
      case 'COMPLETED':
        return 'default'
      case 'IN_PROGRESS':
        return 'secondary'
      case 'PLANNED':
      case 'SCHEDULED':
        return 'outline'
      case 'CANCELLED':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Riwayat Distribusi</CardTitle>
      </CardHeader>
      <CardContent>
        {organization.distributions && organization.distributions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal & Waktu</TableHead>
                <TableHead>Kode Distribusi</TableHead>
                <TableHead>Jenis Makanan</TableHead>
                <TableHead>Penerima</TableHead>
                <TableHead>Total Porsi</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organization.distributions.map((distribution) => (
                <TableRow key={distribution.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {formatDate(distribution.distributionDate)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatTime(distribution.distributionDate)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {distribution.distributionCode || '-'}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      {getMealTypeLabel(distribution.mealType || '')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-sm">
                        {distribution.actualRecipients !== null && distribution.actualRecipients !== undefined
                          ? `${distribution.actualRecipients} terlayani`
                          : `${distribution.plannedRecipients} direncanakan`}
                      </div>
                      {distribution.actualRecipients !== null && 
                       distribution.actualRecipients !== undefined && 
                       distribution.actualRecipients !== distribution.plannedRecipients && (
                        <div className="text-xs text-muted-foreground">
                          dari {distribution.plannedRecipients} target
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-sm">
                      {distribution.totalPortions?.toLocaleString('id-ID') || 0} porsi
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(distribution.status || 'PLANNED')}>
                      {getDistributionStatusBadge(distribution.status || 'PLANNED')}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Belum ada riwayat distribusi untuk organisasi ini.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
