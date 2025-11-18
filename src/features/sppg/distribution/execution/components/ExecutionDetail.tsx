'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Calendar,
  Clock,
  Package,
  Users,
  MapPin,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  TrendingUp,
  Play,
  RefreshCw,
} from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { useExecution } from '../hooks'
import { useExecutionAuditLogs } from '../hooks/useExecutionAuditLogs'
import { useExecutionPhotos } from '../hooks/useExecutionPhotos'
import { useExecutionIssues } from '../hooks/useExecutionIssues'
import {
  EXECUTION_STATUS_LABELS,
  EXECUTION_STATUS_COLORS,
} from '../types'
import { TemperatureMonitoringCard } from './TemperatureMonitoringCard'
import { TeamInformationCard } from './TeamInformationCard'
import { QualityMetricsCard } from './QualityMetricsCard'
import { ExecutionTimeline } from './ExecutionTimeline'
import { ExecutionAuditTrail } from './ExecutionAuditTrail'
import { ExecutionPhotoGallery } from './ExecutionPhotoGallery'
import { ExecutionIssuesCard } from './ExecutionIssuesCard'
import { WeatherConditionsCard } from './WeatherConditionsCard'
import { CostAnalysisCard } from '../../components/CostAnalysisCard'
import { buildCostBreakdown } from '../../lib/costHelpers'

interface ExecutionDetailProps {
  executionId: string
  onStartClick?: () => void
  onUpdateClick?: () => void
  onCompleteClick?: () => void
  onCancelClick?: () => void
  onReportIssueClick?: () => void
}

export function ExecutionDetail({
  executionId,
  onStartClick,
  onUpdateClick,
  onCompleteClick,
  onCancelClick,
  onReportIssueClick,
}: ExecutionDetailProps) {
  const { data: execution, isLoading } = useExecution(executionId)
  
  // Fetch audit logs for this execution
  const { 
    data: auditData, 
    isLoading: isAuditLoading, 
    error: auditError 
  } = useExecutionAuditLogs(executionId)
  
  // Fetch photos for this execution
  const {
    data: photosData,
    isLoading: isPhotosLoading,
    error: photosError,
  } = useExecutionPhotos(executionId)
  
  // Fetch issues for this execution
  const {
    data: issuesData,
    isLoading: isIssuesLoading,
    error: issuesError,
  } = useExecutionIssues(executionId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!execution) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Eksekusi distribusi tidak ditemukan
        </AlertDescription>
      </Alert>
    )
  }

  // Calculate metrics
  const delivered = execution.totalPortionsDelivered || 0
  const planned = execution.schedule?.totalPortions || 0
  const progressPercentage = planned > 0 ? Math.round((delivered / planned) * 100) : 0

  const beneficiariesReached = execution.totalBeneficiariesReached || 0
  const plannedBeneficiaries = execution.schedule?.estimatedBeneficiaries || 0
  const beneficiaryProgress = plannedBeneficiaries > 0 
    ? Math.round((beneficiariesReached / plannedBeneficiaries) * 100) 
    : 0

  const completedDeliveries = execution.deliveries.filter(d => d.status === 'DELIVERED').length
  const deliveryProgress = execution.deliveries.length > 0
    ? Math.round((completedDeliveries / execution.deliveries.length) * 100)
    : 0

  // Status info
  const statusVariant = EXECUTION_STATUS_COLORS[execution.status]
  const statusLabel = EXECUTION_STATUS_LABELS[execution.status]

  // Check active status
  const isActive = ['PREPARING', 'IN_TRANSIT', 'DISTRIBUTING'].includes(execution.status)
  const isScheduled = execution.status === 'SCHEDULED'

  // Issues - using DistributionIssue model
  const activeIssues: Array<{
    id: string
    description: string
    reportedAt: Date
    resolutionNotes?: string | null
  }> = []
  
  const resolvedIssues: Array<{
    id: string
    description: string
    reportedAt: Date
    resolvedAt: Date | null
    resolutionNotes?: string | null
  }> = []

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <CardTitle className="text-2xl">{execution.distributionCode}</CardTitle>
                <Badge variant={statusVariant} className="text-base px-3 py-1">
                  {statusLabel}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Jadwal:{' '}
                  <Link
                    href={`/distribution/schedule/${execution.schedule.id}`}
                    className="text-primary hover:underline font-medium"
                  >
                    {execution.schedule.production.menu.menuName}
                  </Link>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {isScheduled && (
                <Button onClick={onStartClick}>
                  <Play className="h-4 w-4 mr-2" />
                  Mulai Eksekusi
                </Button>
              )}

              {isActive && (
                <>
                  <Button variant="outline" onClick={onUpdateClick}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Update Progress
                  </Button>
                  <Button onClick={onCompleteClick}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Selesaikan
                  </Button>
                  <Button variant="outline" onClick={onReportIssueClick}>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Laporkan Masalah
                  </Button>
                  <Button variant="destructive" onClick={onCancelClick}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Batalkan
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Dibuat</span>
              </div>
              <p className="font-medium">
                {format(new Date(execution.createdAt), 'dd MMMM yyyy HH:mm', { locale: id })}
              </p>
            </div>

            {execution.actualStartTime && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Play className="h-4 w-4" />
                  <span>Dimulai</span>
                </div>
                <p className="font-medium">
                  {format(new Date(execution.actualStartTime), 'dd MMMM yyyy HH:mm', { locale: id })}
                </p>
              </div>
            )}

            {execution.actualEndTime && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4" />
                  <span>Selesai</span>
                </div>
                <p className="font-medium">
                  {format(new Date(execution.actualEndTime), 'dd MMMM yyyy HH:mm', { locale: id })}
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Progress Metrics */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Progress Distribusi
            </h3>

            {/* Portions Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Porsi Makanan</span>
                </div>
                <span className="text-sm font-semibold">
                  {delivered.toLocaleString('id-ID')} / {planned.toLocaleString('id-ID')} ({progressPercentage}%)
                </span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>

            {/* Beneficiaries Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Penerima Manfaat</span>
                </div>
                <span className="text-sm font-semibold">
                  {beneficiariesReached.toLocaleString('id-ID')} / {plannedBeneficiaries.toLocaleString('id-ID')} ({beneficiaryProgress}%)
                </span>
              </div>
              <Progress value={beneficiaryProgress} className="h-3" />
            </div>

            {/* Delivery Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Pengiriman</span>
                </div>
                <span className="text-sm font-semibold">
                  {completedDeliveries} / {execution.deliveries.length} ({deliveryProgress}%)
                </span>
              </div>
              <Progress value={deliveryProgress} className="h-3" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Temperature Monitoring */}
      <TemperatureMonitoringCard
        data={{
          departureTemp: execution.departureTemp,
          arrivalTemp: execution.arrivalTemp,
          servingTemp: execution.servingTemp,
        }}
        foodType="HOT"
      />

      {/* Team Information */}
      <TeamInformationCard
        data={{
          driver: execution.driverId
            ? {
                id: execution.driverId,
                name: 'Sopir', // TODO: Fetch actual driver name from User model
                phone: undefined,
                email: undefined,
              }
            : null,
          vehicle: execution.vehicle
            ? {
                id: execution.vehicle.id,
                vehicleName: execution.vehicle.vehicleName,
                vehiclePlate: execution.vehicle.licensePlate,
                vehicleType: execution.vehicle.vehicleType,
                capacity: execution.vehicle.capacity || undefined,
              }
            : null,
          volunteers: execution.volunteers || [],
          distributionTeam: undefined, // TODO: Add distribution team tracking
        }}
      />

      {/* Weather Conditions */}
      <WeatherConditionsCard
        weatherCondition={execution.weatherCondition}
        temperature={execution.temperature}
        humidity={execution.humidity}
        isLoading={false}
        error={null}
      />

      {/* Cost Analysis */}
      <CostAnalysisCard
        costs={buildCostBreakdown({
          production: execution.production
            ? {
                estimatedCost: execution.production.estimatedCost,
                actualCost: execution.production.actualCost,
                costPerPortion: execution.production.costPerPortion,
                plannedPortions: execution.production.plannedPortions,
              }
            : null,
          distribution: {
            transportCost: execution.transportCost,
            fuelCost: execution.fuelCost,
            otherCosts: execution.otherCosts,
          },
          schedule: execution.schedule
            ? {
                packagingCost: execution.schedule.packagingCost,
                fuelCost: execution.schedule.fuelCost,
                totalPortions: execution.schedule.totalPortions,
                estimatedBeneficiaries: execution.schedule.estimatedBeneficiaries,
              }
            : null,
        })}
        showVariance={true}
        showDetails={true}
      />

      {/* Quality Metrics */}
      <QualityMetricsCard
        data={{
          foodQuality: execution.foodQuality,
          hygieneScore: execution.hygieneScore,
          packagingCondition: execution.packagingCondition,
          // TODO: Add feedback/complaint data when available
          feedbackCount: undefined,
          complaintCount: undefined,
          averageRating: undefined,
        }}
      />

      {/* Execution Timeline */}
      <ExecutionTimeline
        data={{
          status: execution.status,
          createdAt: execution.createdAt,
          scheduledDate: execution.schedule?.distributionDate,
          actualStartTime: execution.actualStartTime,
          departureTime: execution.departureTime,
          arrivalTime: execution.arrivalTime,
          completionTime: execution.completionTime,
          actualEndTime: execution.actualEndTime,
          totalDeliveries: execution.deliveries.length,
          completedDeliveries: execution.deliveries.filter(
            (d) => d.status === 'DELIVERED'
          ).length,
          // TODO: Add first/last delivery time tracking when available
          firstDeliveryTime: undefined,
          lastDeliveryTime: undefined,
        }}
      />

      {/* Issues & Problems Tracking */}
      <ExecutionIssuesCard
        issues={issuesData?.issues || []}
        summary={
          issuesData?.summary || {
            total: 0,
            resolved: 0,
            unresolved: 0,
            bySeverity: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 },
            byType: {
              VEHICLE_BREAKDOWN: 0,
              WEATHER_DELAY: 0,
              TRAFFIC_JAM: 0,
              ACCESS_DENIED: 0,
              RECIPIENT_UNAVAILABLE: 0,
              FOOD_QUALITY: 0,
              SHORTAGE: 0,
              OTHER: 0,
            },
          }
        }
        isLoading={isIssuesLoading}
        error={issuesError?.message || null}
      />

      {/* Photo Gallery */}
      <ExecutionPhotoGallery
        executionId={execution.id}
        photos={
          photosData?.photos.map((photo) => ({
            ...photo,
            takenAt: new Date(photo.takenAt),
          })) || []
        }
        isLoading={isPhotosLoading}
        error={photosError?.message || null}
      />

      {/* Audit Trail */}
      <ExecutionAuditTrail
        data={{
          executionId: execution.id,
          logs: auditData?.logs || [],
          isLoading: isAuditLoading,
          error: auditError?.message || null,
        }}
      />

      {/* Active Issues Alert */}
      {activeIssues.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <span className="font-semibold">
              {activeIssues.length} masalah aktif ditemukan
            </span>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              {activeIssues.map((issue) => (
                <li key={issue.id}>{issue.description}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Deliveries List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Daftar Pengiriman ({execution.deliveries.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {execution.deliveries.map((delivery, index) => (
              <div
                key={delivery.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">{delivery.school?.schoolName || delivery.targetName}</p>
                  <p className="text-sm text-muted-foreground">
                    {delivery.school?.schoolAddress || delivery.targetAddress}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {delivery.portionsDelivered?.toLocaleString('id-ID') || 0} porsi
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Urutan #{index + 1}
                    </p>
                  </div>
                  <Badge
                    variant={
                      delivery.status === 'DELIVERED'
                        ? 'default'
                        : delivery.status === 'ASSIGNED'
                        ? 'outline'
                        : 'secondary'
                    }
                  >
                    {delivery.status === 'DELIVERED' && 'Selesai'}
                    {delivery.status === 'ASSIGNED' && 'Ditugaskan'}
                    {delivery.status === 'DEPARTED' && 'Dalam Perjalanan'}
                    {delivery.status === 'FAILED' && 'Gagal'}
                    {delivery.status === 'CANCELLED' && 'Dibatalkan'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {(execution.notes || execution.completionNotes || execution.resolutionNotes) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Catatan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {execution.notes && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Catatan Umum</p>
                <p className="text-sm">{execution.notes}</p>
              </div>
            )}
            {execution.resolutionNotes && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Catatan Resolusi</p>
                <p className="text-sm">{execution.resolutionNotes}</p>
              </div>
            )}
            {execution.completionNotes && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Catatan Penyelesaian</p>
                <p className="text-sm">{execution.completionNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Resolved Issues */}
      {resolvedIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Masalah yang Telah Diselesaikan ({resolvedIssues.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {resolvedIssues.map((issue) => (
                <div key={issue.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{issue.description}</p>
                      <p className="text-sm text-muted-foreground">
                        Dilaporkan: {format(new Date(issue.reportedAt), 'dd MMM yyyy HH:mm', { locale: id })}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Selesai
                    </Badge>
                  </div>
                  {issue.resolutionNotes && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground">Resolusi:</p>
                      <p className="text-sm">{issue.resolutionNotes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
