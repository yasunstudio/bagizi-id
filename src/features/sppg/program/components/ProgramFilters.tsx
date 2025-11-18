/**
 * @fileoverview Program Filters Component
 * Simple filter component like BeneficiaryOrganizationFilters
 * 
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 */

'use client'

import { Search, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getProgramTypeLabel, getTargetGroupLabel, getProgramStatusLabel } from '@/features/sppg/program/lib/programUtils'
import { ProgramStatus, ProgramType, TargetGroup } from '@prisma/client'
import type { ProgramFilters as ProgramFiltersType } from '@/features/sppg/program/types'

/**
 * Props for ProgramFilters component
 */
interface ProgramFiltersProps {
  filters: ProgramFiltersType
  onFiltersChange: (filters: ProgramFiltersType) => void
}

/**
 * Program Filters Component
 * Simple and clean like beneficiary-organizations
 */
export function ProgramFilters({
  filters,
  onFiltersChange,
}: ProgramFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filter & Pencarian
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama atau kode..."
              value={filters.search || ''}
              onChange={(e) =>
                onFiltersChange({ ...filters, search: e.target.value || undefined })
              }
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                status: value === 'all' ? undefined : (value as ProgramStatus),
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value={ProgramStatus.ACTIVE}>{getProgramStatusLabel(ProgramStatus.ACTIVE)}</SelectItem>
              <SelectItem value={ProgramStatus.DRAFT}>{getProgramStatusLabel(ProgramStatus.DRAFT)}</SelectItem>
              <SelectItem value={ProgramStatus.COMPLETED}>{getProgramStatusLabel(ProgramStatus.COMPLETED)}</SelectItem>
              <SelectItem value={ProgramStatus.PAUSED}>{getProgramStatusLabel(ProgramStatus.PAUSED)}</SelectItem>
              <SelectItem value={ProgramStatus.CANCELLED}>{getProgramStatusLabel(ProgramStatus.CANCELLED)}</SelectItem>
              <SelectItem value={ProgramStatus.ARCHIVED}>{getProgramStatusLabel(ProgramStatus.ARCHIVED)}</SelectItem>
            </SelectContent>
          </Select>

          {/* Program Type Filter */}
          <Select
            value={filters.programType || 'all'}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                programType: value === 'all' ? undefined : (value as ProgramType),
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Semua Jenis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Jenis</SelectItem>
              <SelectItem value={ProgramType.NUTRITIONAL_RECOVERY}>{getProgramTypeLabel(ProgramType.NUTRITIONAL_RECOVERY)}</SelectItem>
              <SelectItem value={ProgramType.NUTRITIONAL_EDUCATION}>{getProgramTypeLabel(ProgramType.NUTRITIONAL_EDUCATION)}</SelectItem>
              <SelectItem value={ProgramType.FREE_NUTRITIOUS_MEAL}>{getProgramTypeLabel(ProgramType.FREE_NUTRITIOUS_MEAL)}</SelectItem>
              <SelectItem value={ProgramType.EMERGENCY_NUTRITION}>{getProgramTypeLabel(ProgramType.EMERGENCY_NUTRITION)}</SelectItem>
              <SelectItem value={ProgramType.STUNTING_INTERVENTION}>{getProgramTypeLabel(ProgramType.STUNTING_INTERVENTION)}</SelectItem>
            </SelectContent>
          </Select>

          {/* Target Group Filter */}
          <Select
            value={filters.targetGroup || 'all'}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                targetGroup: value === 'all' ? undefined : (value as TargetGroup),
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Semua Kelompok" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kelompok</SelectItem>
              <SelectItem value={TargetGroup.TODDLER}>{getTargetGroupLabel(TargetGroup.TODDLER)}</SelectItem>
              <SelectItem value={TargetGroup.PREGNANT_WOMAN}>{getTargetGroupLabel(TargetGroup.PREGNANT_WOMAN)}</SelectItem>
              <SelectItem value={TargetGroup.BREASTFEEDING_MOTHER}>{getTargetGroupLabel(TargetGroup.BREASTFEEDING_MOTHER)}</SelectItem>
              <SelectItem value={TargetGroup.TEENAGE_GIRL}>{getTargetGroupLabel(TargetGroup.TEENAGE_GIRL)}</SelectItem>
              <SelectItem value={TargetGroup.ELDERLY}>{getTargetGroupLabel(TargetGroup.ELDERLY)}</SelectItem>
              <SelectItem value={TargetGroup.SCHOOL_CHILDREN}>{getTargetGroupLabel(TargetGroup.SCHOOL_CHILDREN)}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
