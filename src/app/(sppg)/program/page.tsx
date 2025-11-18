/**
 * @fileoverview Program List Page - SPPG Layer
 * @version Next.js 15.5.4 / Auth.js v5
 */

'use client'

import { useState } from 'react'
import { 
  ProgramHeader, 
  ProgramStatsCards,
  ProgramList,
  ProgramFilters
} from '@/features/sppg/program/components'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { usePrograms } from '@/features/sppg/program/hooks'
import type { ProgramFilters as ProgramFiltersType } from '@/features/sppg/program/types'

export default function ProgramPage() {
  // Filter state - like beneficiary-organizations
  const [filters, setFilters] = useState<ProgramFiltersType>({})

  // Fetch programs with filters - stats will calculate from filtered data
  const { data: programs = [], isLoading } = usePrograms(filters)

  return (
    <div className="space-y-6">
      <ProgramHeader />
      
      {/* Stats calculated from filtered programs */}
      <ProgramStatsCards programs={programs} isLoading={isLoading} />

      {/* Filters */}
      <ProgramFilters
        filters={filters}
        onFiltersChange={setFilters}
      />

      <Card>
        <CardHeader>
          <CardTitle>Semua Program</CardTitle>
          <CardDescription>
            Kelola dan pantau semua program gizi yang sedang berjalan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProgramList data={programs} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  )
}
