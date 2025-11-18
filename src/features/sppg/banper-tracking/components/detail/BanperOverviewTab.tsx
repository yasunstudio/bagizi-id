/**
 * @fileoverview Banper Overview Tab Component
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  DollarSign, 
  Users, 
  Calendar, 
  FileText,
  Building2,
  TrendingUp,
} from 'lucide-react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import type { BanperRequestTrackingWithRelations } from '../../types'

interface BanperOverviewTabProps {
  tracking: BanperRequestTrackingWithRelations
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

interface InfoCardProps {
  icon: React.ElementType
  title: string
  value: string | number | React.ReactNode
  description?: string
}

function InfoCard({ icon: Icon, title, value, description }: InfoCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

export function BanperOverviewTab({ tracking }: BanperOverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Ringkasan Anggaran */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <InfoCard
          icon={DollarSign}
          title="Jumlah Diminta"
          value={formatCurrency(tracking.requestedAmount)}
          description="Total anggaran yang diajukan"
        />
        <InfoCard
          icon={TrendingUp}
          title="Dana Cair"
          value={tracking.disbursedAmount ? formatCurrency(tracking.disbursedAmount) : '-'}
          description={tracking.disbursedDate ? 
            `Cair: ${format(new Date(tracking.disbursedDate), 'd MMM yyyy', { locale: localeId })}` :
            'Belum dicairkan'
          }
        />
        <InfoCard
          icon={Users}
          title="Penerima Manfaat"
          value={tracking.totalBeneficiaries.toLocaleString('id-ID')}
          description="Total yang dilayani"
        />
        <InfoCard
          icon={Calendar}
          title="Periode Operasional"
          value={tracking.operationalPeriod}
          description={tracking.operationalDays ? `${tracking.operationalDays} hari kerja` : undefined}
        />
      </div>

      {/* Informasi Program */}
      {tracking.program && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informasi Program
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nama Program</p>
              <p className="text-base font-semibold">{tracking.program.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Kode Program</p>
              <p className="text-base font-mono">{tracking.program.programCode}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Jenis Program</p>
              <p className="text-base">{tracking.program.programType}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Periode Program</p>
              <p className="text-base">
                {format(new Date(tracking.program.startDate), 'd MMM yyyy', { locale: localeId })} - {' '}
                {tracking.program.endDate ? format(new Date(tracking.program.endDate), 'd MMM yyyy', { locale: localeId }) : 'Tidak ditentukan'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rincian Biaya */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Rincian Biaya
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium">Biaya Makanan</span>
              <span className="font-semibold">{formatCurrency(tracking.foodCostTotal)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium">Biaya Operasional</span>
              <span className="font-semibold">{formatCurrency(tracking.operationalCost)}</span>
            </div>
            {tracking.transportCost && tracking.transportCost > 0 && (
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm font-medium">Biaya Transportasi</span>
                <span className="font-semibold">{formatCurrency(tracking.transportCost)}</span>
              </div>
            )}
            {tracking.utilityCost && tracking.utilityCost > 0 && (
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm font-medium">Biaya Utilitas</span>
                <span className="font-semibold">{formatCurrency(tracking.utilityCost)}</span>
              </div>
            )}
            {tracking.staffCost && tracking.staffCost > 0 && (
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm font-medium">Biaya Pegawai</span>
                <span className="font-semibold">{formatCurrency(tracking.staffCost)}</span>
              </div>
            )}
            {tracking.otherCosts && tracking.otherCosts > 0 && (
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm font-medium">Biaya Lainnya</span>
                <span className="font-semibold">{formatCurrency(tracking.otherCosts)}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-3 bg-primary/5 rounded-lg px-4 mt-2">
              <span className="font-bold">Total Anggaran</span>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(tracking.requestedAmount)}
              </span>
            </div>
          </div>
          
          {tracking.dailyBudgetPerBeneficiary && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Anggaran per Penerima per Hari</p>
              <p className="text-lg font-semibold text-primary">
                {formatCurrency(tracking.dailyBudgetPerBeneficiary)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Catatan Internal */}
      {tracking.internalNotes && (
        <Card>
          <CardHeader>
            <CardTitle>Catatan Internal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {tracking.internalNotes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
