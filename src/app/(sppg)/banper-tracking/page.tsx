/**
 * @fileoverview Banper Tracking List Page - Government Budget Tracking
 * @version Next.js 15.5.4 / Auth.js v5
 * @author Bagizi-ID Development Team
 * 
 * Main dashboard page for Government Budget Tracking (Banper) feature
 * Shows statistics and list of all banper requests with multi-status workflow
 */

'use client'

import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BudgetStats,
  BanperTrackingList,
  BudgetAllocationList,
} from '@/features/sppg/banper-tracking/components'

export default function BanperTrackingPage() {
  const router = useRouter()

  const handleCreateBanperRequest = () => {
    // TODO: Implement create form dialog or navigate to create page
    router.push('/banper-tracking/new')
  }

  const handleCreateAllocation = () => {
    // TODO: Implement create allocation dialog
    router.push('/budget-allocations/new')
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Anggaran Pemerintah</h1>
        <p className="text-muted-foreground">
          Kelola permintaan banper, alokasi anggaran, dan transaksi penggunaan
        </p>
      </div>

      {/* Budget Statistics Dashboard */}
      <BudgetStats />

      {/* Tabs for different views */}
      <Tabs defaultValue="banper-requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="banper-requests">Permintaan Banper</TabsTrigger>
          <TabsTrigger value="allocations">Alokasi Anggaran</TabsTrigger>
        </TabsList>

        {/* Banper Requests Tab */}
        <TabsContent value="banper-requests" className="space-y-4">
          <BanperTrackingList onCreateNew={handleCreateBanperRequest} />
        </TabsContent>

        {/* Budget Allocations Tab */}
        <TabsContent value="allocations" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Alokasi Anggaran Program</CardTitle>
                  <CardDescription>
                    Kelola alokasi anggaran per program dari berbagai sumber (APBN, APBD, dll)
                  </CardDescription>
                </div>
                <Button onClick={handleCreateAllocation} variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Alokasi
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <BudgetAllocationList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
