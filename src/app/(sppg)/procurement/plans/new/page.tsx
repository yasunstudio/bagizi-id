/**
 * @fileoverview Create Procurement Plan Page
 * @version Next.js 15.5.4 / App Router
 * @author Bagizi-ID Development Team
 * @route /procurement/plans/new
 * 
 * MODULAR ARCHITECTURE:
 * - Thin wrapper page using feature components
 * - ProcurementPlanForm handles all logic & UI
 * - Server Component for optimal performance
 * - SEO optimization with metadata
 */

import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProcurementPageHeader } from '@/components/shared/procurement'
import { ArrowLeft, Lightbulb, ClipboardList } from 'lucide-react'
import { PlanFormWizard } from '@/features/sppg/procurement/plans/components'

export const metadata: Metadata = {
  title: 'Buat Rencana Pengadaan Baru | Bagizi-ID',
  description: 'Buat rencana budget dan target pengadaan bulanan dengan wizard step-by-step',
}

/**
 * Create Procurement Plan Page
 */
export default async function CreateProcurementPlanPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <ProcurementPageHeader
        title="Buat Rencana Pengadaan Baru"
        description="Rencanakan budget dan target pengadaan untuk periode tertentu"
        icon={ClipboardList}
        breadcrumbs={['Procurement', 'Plans', 'New']}
        action={{
          label: 'Kembali',
          href: '/procurement/plans',
          icon: ArrowLeft,
          variant: 'outline'
        }}
      />

      {/* Guidelines Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Panduan Membuat Rencana Pengadaan</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li><strong>Step 1 - Menu Plan:</strong> Pilih menu plan yang sudah disetujui untuk auto-populate data (opsional)</li>
            <li><strong>Step 2 - Informasi Dasar:</strong> Isi program, nama rencana, periode, dan target penerima</li>
            <li><strong>Step 3 - Alokasi Budget:</strong> Tetapkan total budget dan distribusi per kategori bahan</li>
            <li><strong>Step 4 - Review:</strong> Tinjau semua data sebelum submit</li>
            <li>Sistem akan memandu Anda langkah demi langkah untuk kemudahan pengisian</li>
            <li>Anda dapat kembali ke step sebelumnya untuk edit data kapan saja</li>
          </ul>
        </CardContent>
      </Card>

      {/* Wizard Form */}
      <PlanFormWizard />
    </div>
  )
}
