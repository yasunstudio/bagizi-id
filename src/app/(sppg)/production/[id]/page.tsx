/**
 * @fileoverview Production Detail Page
 * @version Next.js 15.5.4 / App Router
 * @author Bagizi-ID Development Team
 * @route /production/[id]
 * 
 * MODULAR ARCHITECTURE:
 * - Thin wrapper page using feature components
 * - Server-side data fetching with auth
 * - Multi-tenant isolation (sppgId filtering)
 * - SEO optimization with dynamic metadata
 */

import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { canManageProduction } from '@/lib/permissions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CostBreakdownCard } from '@/features/sppg/production/components'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { ArrowLeft, Edit, Trash2, Calendar, Users, Thermometer } from 'lucide-react'
import { 
  ProductionStatus,
  QualityControl,
} from '@/features/sppg/production/components'
import { formatDate } from '@/features/sppg/production/lib'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.sppgId) {
    return { title: 'Detail Produksi | Bagizi-ID' }
  }

  const production = await db.foodProduction.findFirst({
    where: {
      id,
      sppgId: session.user.sppgId,
    },
    select: {
      batchNumber: true,
    },
  })

  return {
    title: production ? `Produksi ${production.batchNumber} | Bagizi-ID` : 'Detail Produksi | Bagizi-ID',
    description: 'Detail produksi makanan dan quality control',
  }
}

/**
 * Production Detail Page
 */
export default async function ProductionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  // Auth check
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  // Permission check
  if (!session.user.userRole || !canManageProduction(session.user.userRole)) {
    redirect('/dashboard')
  }

  // Multi-tenant check
  if (!session.user.sppgId) {
    redirect('/dashboard')
  }

    // 4. Fetch production with relations
    const production = await db.foodProduction.findFirst({
      where: {
        id,
        program: {
          sppgId: session.user.sppgId,
        },
      },
      include: {
        sppg: {
          select: {
            name: true,
          },
        },
        menu: true,
        program: true,
        qualityChecks: true,
      },
    })

  if (!production) {
    notFound()
  }

  const canEdit = production.status === 'PLANNED'
  const canDelete = production.status === 'PLANNED'
  const showQualityControl = production.status === 'QUALITY_CHECK' || production.status === 'COMPLETED'

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/production">Produksi</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{production.batchNumber}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

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
            {production.menu.menuName} • {production.program.name}
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
                  <p className="font-semibold">{production.program.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Menu</p>
                  <p className="font-semibold">{production.menu.menuName}</p>
                  <p className="text-xs text-muted-foreground">{production.menu.menuCode}</p>
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
                {/* Cost display with CostBreakdownCard */}
                {(production.ingredientCost || production.laborCost || production.totalCost) && (
                  <div className="md:col-span-2">
                    <CostBreakdownCard
                      estimatedCost={{
                        ingredientCost: production.menu?.costPerServing ? production.menu.costPerServing * (production.plannedPortions || 1) : 0,
                        laborCost: 0,
                        utilityCost: 0,
                        otherCosts: 0,
                        totalCost: production.menu?.costPerServing ? production.menu.costPerServing * (production.plannedPortions || 1) : 0,
                        costPerMeal: production.menu?.costPerServing || 0
                      }}
                      actualCost={production.totalCost ? {
                        ingredientCost: production.ingredientCost || 0,
                        laborCost: production.laborCost || 0,
                        utilityCost: production.utilityCost || 0,
                        otherCosts: production.otherCosts || 0,
                        totalCost: production.totalCost,
                        costPerMeal: production.costPerMeal || 0
                      } : undefined}
                      portions={production.actualPortions || production.plannedPortions}
                    />
                  </div>
                )}
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

          {/* Recipe Viewer - TODO: Fetch recipe data */}
          {/* <RecipeViewer recipe={recipe} portionMultiplier={production.actualPortions || production.plannedPortions} /> */}

          {/* Production Status Timeline */}
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
