/**
 * @fileoverview Production Detail Client Component
 * @version Next.js 15.5.4 / TanStack Query v5
 * @author Bagizi-ID Development Team
 * 
 * Client wrapper for production detail page with real-time updates
 * Uses TanStack Query for automatic refresh after mutations
 */

'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Edit, Trash2, Calendar, Users, Thermometer } from 'lucide-react'
import { 
  ProductionStatus,
  QualityControl,
} from '@/features/sppg/production/components'
import { useProduction } from '@/features/sppg/production/hooks'
import { formatDate } from '@/features/sppg/production/lib'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface ProductionDetailClientProps {
  productionId: string
  canEdit: boolean
  canDelete: boolean
}

export function ProductionDetailClient({ 
  productionId, 
  canEdit, 
  canDelete 
}: ProductionDetailClientProps) {
  const router = useRouter()
  const { data: production, isLoading, error } = useProduction(productionId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !production) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <p className="text-destructive">Gagal memuat data produksi</p>
        <Button onClick={() => router.push('/production')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Daftar Produksi
        </Button>
      </div>
    )
  }

  const showQualityControl = production.status === 'QUALITY_CHECK' || production.status === 'COMPLETED'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{production.batchNumber}</h1>
            <Badge className={
              production.status === 'COMPLETED' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
              production.status === 'CANCELLED' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
              production.status === 'COOKING' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' :
              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
            }>
              {production.status}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            {production.menu?.name || 'Menu tidak ditemukan'} • {production.program?.name || 'Program tidak ditemukan'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/production">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Link>
          </Button>
          {canEdit && (
            <Button asChild>
              <Link href={`/production/${production.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
          )}
          {canDelete && (
            <Button variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* 2-Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Production Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Produksi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Program</p>
                  <p className="font-semibold">{production.program?.name || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Menu</p>
                  <p className="font-semibold">{production.menu?.name || '-'}</p>
                  <p className="text-xs text-muted-foreground">{production.menu?.code || '-'}</p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tanggal Produksi</p>
                    <p className="font-semibold">{formatDate(production.productionDate)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Porsi</p>
                    <p className="font-semibold">
                      {production.actualPortions || production.plannedPortions} porsi
                      {production.actualPortions && production.actualPortions !== production.plannedPortions && (
                        <span className="text-xs text-muted-foreground ml-1">
                          (Rencana: {production.plannedPortions})
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Thermometer className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Suhu</p>
                    <p className="font-semibold">
                      Target: {production.targetTemperature || '-'}°C
                      {production.actualTemperature && (
                        <span className="ml-2">| Aktual: {production.actualTemperature}°C</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Tim Produksi</p>
                <div className="space-y-1">
                  <p className="font-semibold">Kepala Koki: {production.headCook}</p>
                  {production.supervisorId && (
                    <p className="text-sm">Supervisor: {production.supervisorId}</p>
                  )}
                  {production.assistantCooks && production.assistantCooks.length > 0 && (
                    <p className="text-sm">
                      Asisten: {production.assistantCooks.length} orang
                    </p>
                  )}
                </div>
              </div>

              {production.notes && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Catatan</p>
                    <p className="text-sm">{production.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Production Status Timeline - Component will auto-refresh via query invalidation */}
          <ProductionStatus production={production} />
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Quality Control */}
          {showQualityControl && (
            <QualityControl productionId={production.id} />
          )}

          {/* Related Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Link Terkait</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/menu/${production.menuId}`}>
                  Lihat Menu
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/program/${production.programId}`}>
                  Lihat Program
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
