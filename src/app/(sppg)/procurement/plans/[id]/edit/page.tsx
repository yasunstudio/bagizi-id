/**
 * @fileoverview Edit Procurement Plan Page
 * @version Next.js 15.5.4 / App Router
 * @author Bagizi-ID Development Team
 * @route /procurement/plans/[id]/edit
 * 
 * MODULAR ARCHITECTURE:
 * - Thin wrapper page using feature components
 * - Server-side data fetching with auth
 * - Multi-tenant isolation (sppgId filtering)
 * - Edit restriction (only DRAFT/REVISION status)
 * - SEO optimization with dynamic metadata
 */

import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { canManageProcurement } from '@/lib/permissions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ProcurementPageHeader } from '@/components/shared/procurement'
import { ArrowLeft, AlertCircle, ClipboardList } from 'lucide-react'
import { PlanFormWizard } from '@/features/sppg/procurement/plans/components'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.sppgId) {
    return { title: 'Edit Rencana Pengadaan | Bagizi-ID' }
  }

  const plan = await db.procurementPlan.findFirst({
    where: {
      id,
      sppgId: session.user.sppgId,
    },
    select: {
      planName: true,
    },
  })

  return {
    title: plan ? `Edit ${plan.planName} | Bagizi-ID` : 'Edit Rencana Pengadaan | Bagizi-ID',
    description: 'Edit rencana pengadaan dan budget planning',
  }
}

/**
 * Edit Procurement Plan Page
 */
export default async function EditProcurementPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  // Auth check
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  // Permission check
  const userRole = session.user.userRole
  if (!userRole || !canManageProcurement(userRole)) {
    redirect('/dashboard')
  }

  // Multi-tenant check
  if (!session.user.sppgId) {
    redirect('/dashboard')
  }

  // Fetch plan with multi-tenant isolation
  const plan = await db.procurementPlan.findFirst({
    where: {
      id,
      sppgId: session.user.sppgId,
    },
    include: {
      program: {
        select: {
          name: true,
        },
      },
    },
  })

  if (!plan) {
    notFound()
  }

  // Check if plan can be edited
  const canEdit = plan.approvalStatus === 'DRAFT' || plan.approvalStatus === 'REVISION'
  if (!canEdit) {
    redirect(`/procurement/plans/${id}`)
  }

  // Transform Prisma result to component's expected type
  // Enterprise Pattern: Explicit type transformation with validation
  // Convert null values to undefined or defaults for form compatibility
  const planFormData = {
    id: plan.id,
    programId: plan.programId ?? '',
    planName: plan.planName,
    planMonth: plan.planMonth,
    planYear: plan.planYear,
    planQuarter: plan.planQuarter === null ? undefined : plan.planQuarter,
    targetRecipients: plan.targetRecipients,
    targetMeals: plan.targetMeals,
    totalBudget: plan.totalBudget,
    proteinBudget: plan.proteinBudget ?? 0,
    carbBudget: plan.carbBudget ?? 0,
    vegetableBudget: plan.vegetableBudget ?? 0,
    fruitBudget: plan.fruitBudget ?? 0,
    otherBudget: plan.otherBudget ?? 0,
    notes: plan.notes ?? '',
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <ProcurementPageHeader
        title="Edit Rencana Pengadaan"
        description="Perbarui rencana budget dan target pengadaan"
        icon={ClipboardList}
        breadcrumbs={['Procurement', 'Plans', plan.planName, 'Edit']}
        action={{
          label: 'Kembali',
          href: `/procurement/plans/${plan.id}`,
          icon: ArrowLeft,
          variant: 'outline'
        }}
      />

      {/* Revision Alert */}
      {plan.approvalStatus === 'REVISION' && plan.rejectionReason && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Revisi Diperlukan</AlertTitle>
          <AlertDescription>
            <p className="font-medium mt-1">Alasan revisi:</p>
            <p className="mt-1">{plan.rejectionReason}</p>
          </AlertDescription>
        </Alert>
      )}

      {/* Guidelines Card */}
      <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900/20 dark:bg-yellow-900/10">
        <CardHeader>
          <CardTitle className="text-lg">Panduan Edit Rencana</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li><strong>Step 1 - Informasi Dasar:</strong> Perbarui program, nama rencana, dan periode</li>
            <li><strong>Step 2 - Alokasi Budget:</strong> Sesuaikan total budget dan distribusi per kategori</li>
            <li><strong>Step 3 - Review:</strong> Tinjau perubahan sebelum menyimpan</li>
            <li>Perubahan pada budget akan mempengaruhi kalkulasi biaya per porsi</li>
            <li>Pastikan total budget kategori tidak melebihi total budget</li>
            {plan.approvalStatus === 'REVISION' && (
              <li className="font-medium text-yellow-800 dark:text-yellow-400">
                ⚠️ Perhatikan alasan revisi di atas dan perbaiki sesuai catatan
              </li>
            )}
          </ul>
        </CardContent>
      </Card>

      {/* Form Wizard */}
      <PlanFormWizard mode="edit" initialData={planFormData} />
    </div>
  )
}
