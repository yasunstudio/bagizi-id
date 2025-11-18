/**
 * @fileoverview Procurement Plans List Page
 * @version Next.js 15.5.4 / App Router
 * @author Bagizi-ID Development Team
 * @route /procurement/plans
 * 
 * MODULAR ARCHITECTURE:
 * - Server Component with SSR for optimal performance
 * - Authentication & Authorization (RBAC)
 * - Multi-tenant data isolation (sppgId filtering)
 * - Breadcrumb navigation
 * - Page header with actions
 * - Integration with ProcurementPlanList component
 * - SEO optimization with metadata
 */

import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { checkSppgAccess, canManageProcurement } from '@/lib/permissions'
import { PlansPageClient } from './PlansPageClient'
import { PlanStats } from '@/features/sppg/procurement/plans/components'
import { ProcurementPageHeader } from '@/components/shared/procurement'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ClipboardList, Plus } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Rencana Pengadaan | Bagizi-ID',
  description: 'Kelola rencana budget dan target pengadaan bulanan di SPPG',
}

/**
 * Get procurement plan statistics for SPPG
 * 
 * @param {string} sppgId - SPPG ID for multi-tenant filtering
 * @returns {Promise<Object>} Procurement plan statistics with budget calculations
 */
async function getPlanStatistics(sppgId: string) {
  try {
    const [
      totalPlans,
      approvedPlans,
      draftPlans,
      submittedPlans,
      rejectedPlans,
      cancelledPlans,
      allPlans
    ] = await Promise.all([
      // Total plans
      db.procurementPlan.count({
        where: { sppgId }
      }),
      
      // Approved plans
      db.procurementPlan.count({
        where: {
          sppgId,
          approvalStatus: 'APPROVED'
        }
      }),
      
      // Draft plans
      db.procurementPlan.count({
        where: {
          sppgId,
          approvalStatus: 'DRAFT'
        }
      }),
      
      // Submitted plans (pending approval)
      db.procurementPlan.count({
        where: {
          sppgId,
          approvalStatus: 'SUBMITTED'
        }
      }),

      // Rejected plans
      db.procurementPlan.count({
        where: {
          sppgId,
          approvalStatus: 'REJECTED'
        }
      }),

      // Cancelled plans
      db.procurementPlan.count({
        where: {
          sppgId,
          approvalStatus: 'CANCELLED'
        }
      }),

      // Get all plans for budget calculations
      db.procurementPlan.findMany({
        where: { sppgId },
        select: {
          totalBudget: true,
          targetRecipients: true,
          targetMeals: true,
          approvalStatus: true
        }
      })
    ])

    // Calculate budget statistics
    const totalBudget = allPlans.reduce((sum, plan) => sum + (plan.totalBudget || 0), 0)
    const approvedBudget = allPlans
      .filter(plan => plan.approvalStatus === 'APPROVED')
      .reduce((sum, plan) => sum + (plan.totalBudget || 0), 0)
    const targetRecipients = allPlans.reduce((sum, plan) => sum + (plan.targetRecipients || 0), 0)
    const targetMeals = allPlans.reduce((sum, plan) => sum + (plan.targetMeals || 0), 0)

    // Calculate percentages
    const approvedPercentage = totalPlans > 0 
      ? Math.round((approvedPlans / totalPlans) * 100) 
      : 0
    
    const draftPercentage = totalPlans > 0 
      ? Math.round((draftPlans / totalPlans) * 100) 
      : 0

    return {
      // Plan counts by status
      totalPlans,
      byStatus: {
        draft: draftPlans,
        submitted: submittedPlans,
        approved: approvedPlans,
        rejected: rejectedPlans,
        cancelled: cancelledPlans
      },
      
      // Budget statistics
      totalBudget,
      allocatedBudget: approvedBudget,
      
      // Target metrics
      targetRecipients,
      targetMeals,
      
      // Percentages
      approvedPercentage,
      draftPercentage,
    }
  } catch (error) {
    console.error('Error fetching plan statistics:', error)
    return {
      totalPlans: 0,
      byStatus: {
        draft: 0,
        submitted: 0,
        approved: 0,
        rejected: 0,
        cancelled: 0
      },
      totalBudget: 0,
      allocatedBudget: 0,
      targetRecipients: 0,
      targetMeals: 0,
      approvedPercentage: 0,
      draftPercentage: 0,
    }
  }
}

/**
 * Procurement Plans List Page
 */
export default async function ProcurementPlansPage() {
  // ============================================
  // AUTHENTICATION & AUTHORIZATION
  // ============================================
  
  const session = await auth()
  
  // Check if user is authenticated
  if (!session?.user) {
    redirect('/login?callbackUrl=/procurement/plans')
  }

  // Check if user has sppgId (multi-tenant requirement)
  const sppgId = session.user.sppgId
  if (!sppgId) {
    redirect('/access-denied?reason=no-sppg')
  }

  // Verify SPPG exists and is active
  const sppg = await checkSppgAccess(sppgId)
  if (!sppg) {
    redirect('/access-denied?reason=invalid-sppg')
  }

  // Check if user has permission to manage procurement
  const userRole = session.user.userRole
  if (!userRole || !canManageProcurement(userRole)) {
    redirect('/access-denied?reason=insufficient-permissions')
  }

  // ============================================
  // DATA FETCHING
  // ============================================

  const [statistics, plans] = await Promise.all([
    getPlanStatistics(sppgId),
    // Fetch procurement plans
    db.procurementPlan.findMany({
      where: { sppgId },
      include: {
        program: {
          select: {
            name: true
          }
        },
        menuPlan: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  ])

  // ============================================
  // RENDER PAGE
  // ============================================

  // Transform statistics for PlanStats component (SAME AS PlansPageClient)
  const usedBudget = plans
    .filter(p => p.approvalStatus === 'APPROVED')
    .reduce((sum, p) => sum + (p.totalBudget || 0), 0)
  
  const remainingBudget = statistics.totalBudget - usedBudget

  const planStatsData = {
    totalPlans: statistics.totalPlans,
    totalBudget: statistics.totalBudget,
    allocatedBudget: statistics.allocatedBudget,
    usedBudget,
    remainingBudget,
    targetRecipients: statistics.targetRecipients,
    targetMeals: statistics.targetMeals,
    byStatus: {
      draft: statistics.byStatus.draft,
      submitted: statistics.byStatus.submitted,
      underReview: 0,
      approved: statistics.byStatus.approved,
      rejected: statistics.byStatus.rejected,
      cancelled: statistics.byStatus.cancelled,
    }
  }

  return (
    <div className="space-y-6">
      {/* ================================ HEADER ================================ */}
      
      <div className="flex items-center justify-between">
        <ProcurementPageHeader
          title="Rencana Pengadaan"
          description={`Kelola rencana budget dan target pengadaan bulanan di ${sppg.name}`}
          icon={ClipboardList}
          breadcrumbs={['Procurement', 'Plans']}
        />
        
        {/* Button: Create New Plan */}
        <Button asChild>
          <Link href="/procurement/plans/new">
            <Plus className="h-4 w-4 mr-2" />
            Buat Rencana Baru
          </Link>
        </Button>
      </div>

      {/* ================================ STATISTICS (OUTSIDE CARD - SAME AS SUPPLIERS) ================================ */}
      
      <PlanStats stats={planStatsData} />

      {/* ================================ PLANS LIST (INSIDE CARD - SAME AS SUPPLIERS) ================================ */}
      
      <Card>
        <CardHeader>
          <CardTitle>Semua Rencana Pengadaan</CardTitle>
          <CardDescription>
            Daftar lengkap rencana pengadaan yang terdaftar dalam sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlansPageClient plans={plans} />
        </CardContent>
      </Card>
    </div>
  )
}

