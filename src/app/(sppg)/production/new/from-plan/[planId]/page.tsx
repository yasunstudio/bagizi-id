/**
 * @fileoverview Create Production From Approved Plan Page
 * @version Next.js 15.5.4 / App Router
 * @author Bagizi-ID Development Team
 * @route /production/new/from-plan/[planId]
 * 
 * PHASE 3: PRODUCTION FROM PLAN IMPLEMENTATION
 * - Server component fetching approved procurement plan
 * - Validates plan status (must be APPROVED)
 * - Uses ProductionReadinessCard for production scheduling
 * - Pre-fills program and menu from plan
 * - Enables seamless procurement → production workflow
 */

import { Metadata } from 'next'
import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ArrowLeft, CheckCircle2, AlertTriangle, Package } from 'lucide-react'
import { planApi } from '@/features/sppg/procurement/plans/api'
import { db } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Buat Produksi dari Rencana | Bagizi-ID',
  description: 'Jadwalkan produksi berdasarkan rencana pengadaan yang telah disetujui',
}

/**
 * Create Production From Plan Page
 * Validates approved plan and enables production scheduling
 */
export default async function CreateProductionFromPlanPage({
  params,
}: {
  params: { planId: string }
}) {
  // 1. Authentication check
  const session = await auth()
  if (!session?.user?.sppgId) {
    redirect('/login')
  }

  // 2. Get request headers for API authentication
  const headersList = await headers()
  const cookieHeader = headersList.get('cookie')
  const requestHeaders: HeadersInit = cookieHeader ? { Cookie: cookieHeader } : {}

  // 3. Fetch plan via API
  let planResponse
  try {
    planResponse = await planApi.getById(params.planId, requestHeaders)
  } catch {
    notFound()
  }

  if (!planResponse.success || !planResponse.data) {
    notFound()
  }

  const plan = planResponse.data

  // 4. Validate plan status
  if (plan.approvalStatus !== 'APPROVED') {
    return (
      <div className="space-y-6">
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
                <Link href="/procurement/plans">Rencana Pengadaan</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/procurement/plans/${plan.id}`}>{plan.planName}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Buat Produksi</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Rencana Belum Disetujui</AlertTitle>
          <AlertDescription>
            Hanya rencana pengadaan dengan status <strong>APPROVED</strong> yang dapat digunakan
            untuk membuat jadwal produksi. Status rencana saat ini: <strong>{plan.approvalStatus}</strong>
          </AlertDescription>
        </Alert>

        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href={`/procurement/plans/${plan.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Detail Rencana
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  // 5. Fetch programs and inventory items for ProductionReadinessCard
  const [programs, inventoryItems] = await Promise.all([
    db.nutritionProgram.findMany({
      where: {
        sppgId: session.user.sppgId,
        status: { in: ['ACTIVE', 'COMPLETED'] },
      },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        status: true,
      },
      orderBy: { startDate: 'desc' },
    }),
    db.inventoryItem.findMany({
      where: {
        sppgId: session.user.sppgId,
        isActive: true,
      },
      select: {
        id: true,
        itemName: true,
        category: true,
        currentStock: true,
        unit: true,
        lastPrice: true,
      },
      orderBy: { itemName: 'asc' },
    }),
  ])

  // 6. Calculate summary statistics
  const totalBudget = plan.totalBudget || 0
  const targetRecipients = plan.targetRecipients || 0
  const targetMeals = plan.targetMeals || 0

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
              <Link href="/procurement/plans">Rencana Pengadaan</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/procurement/plans/${plan.id}`}>{plan.planName}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Buat Produksi</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Buat Jadwal Produksi</h1>
          <p className="text-muted-foreground mt-2">
            Jadwalkan produksi berdasarkan rencana pengadaan yang telah disetujui
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/procurement/plans/${plan.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Link>
        </Button>
      </div>

      {/* Plan Info Card */}
      <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-green-900 dark:text-green-100">
                {plan.planName}
              </CardTitle>
              <CardDescription className="text-green-700 dark:text-green-300 mt-1">
                Rencana pengadaan telah disetujui dan siap untuk produksi
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Budget */}
            <div className="space-y-1">
              <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                Total Anggaran
              </p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                Rp {totalBudget.toLocaleString('id-ID')}
              </p>
            </div>

            {/* Recipients */}
            <div className="space-y-1">
              <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                Target Penerima
              </p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {targetRecipients.toLocaleString('id-ID')} orang
              </p>
            </div>

            {/* Meals */}
            <div className="space-y-1">
              <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                Target Porsi
              </p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {targetMeals.toLocaleString('id-ID')} porsi
              </p>
            </div>
          </div>

          {/* Plan Period */}
          {plan.planMonth && plan.planYear && (
            <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-400">
                <Package className="inline h-4 w-4 mr-1" />
                Periode: <strong>{plan.planMonth} {plan.planYear}</strong>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Production Form - Redirect to regular production form */}
      <Card>
        <CardHeader>
          <CardTitle>Buat Produksi Baru</CardTitle>
          <CardDescription>
            Gunakan form produksi standar dengan data rencana yang sudah terisi otomatis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Untuk membuat produksi dari rencana ini, klik tombol di bawah untuk membuka form produksi.
              Program akan dipilih otomatis sesuai dengan rencana pengadaan.
            </p>
            <Link href={`/production/new?planId=${plan.id}&programId=${plan.programId || ''}`}>
              <Button size="lg" className="w-full">
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Lanjutkan ke Form Produksi
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Help Text */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Petunjuk Penggunaan</AlertTitle>
        <AlertDescription>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Program sudah dipilih otomatis sesuai rencana pengadaan</li>
            <li>Pilih menu yang akan diproduksi dari program tersebut</li>
            <li>Tentukan tanggal produksi dan jumlah porsi yang direncanakan</li>
            <li>Masukkan penggunaan bahan dari stok inventori</li>
            <li>Sistem akan memvalidasi ketersediaan stok secara otomatis</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  )
}
