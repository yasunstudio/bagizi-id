/**
 * @fileoverview Procurement Reports Page - Comprehensive Analytics
 * 
 * Upgraded with ReportsDashboard component for:
 * - Cost analysis (production & distribution)
 * - Procurement status tracking
 * - Supplier performance metrics
 * - Budget utilization reports
 * - Export to CSV functionality
 * 
 * @version Next.js 15.5.4
 * @see {@link /docs/PROCUREMENT_WORKFLOW_GUIDE.md} Reporting & Analytics
 */

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/prisma'
import { ReportsDashboard } from '@/features/sppg/procurement/dashboard/components'
import { ProcurementPageHeader } from '@/components/shared/procurement'
import { BarChart2 } from 'lucide-react'

async function ReportsPage() {
  const session = await auth()
  const sppgId = session?.user?.sppgId
  
  if (!sppgId) redirect('/access-denied')

  // Fetch programs and suppliers for report filters
  const [programs, suppliers] = await Promise.all([
    db.nutritionProgram.findMany({
      where: { sppgId },
      select: {
        id: true,
        name: true,
        programCode: true
      },
      orderBy: {
        startDate: 'desc'
      }
    }),
    db.supplier.findMany({
      where: { sppgId },
      select: {
        id: true,
        supplierName: true
      },
      orderBy: {
        supplierName: 'asc'
      }
    })
  ])

  return (
    <div className="container mx-auto py-6 space-y-6">
      <ProcurementPageHeader
        title="Laporan & Analytics Procurement"
        description="Analisis menyeluruh procurement, production, dan distribution dengan export capabilities"
        icon={BarChart2}
        breadcrumbs={['Procurement', 'Reports']}
      />

      <ReportsDashboard 
        programs={programs.map(p => ({
          id: p.id,
          programName: p.name,
          programCode: p.programCode || ''
        }))}
        suppliers={suppliers.map(s => ({
          id: s.id,
          supplierName: s.supplierName
        }))}
      />
    </div>
  )
}

export default ReportsPage