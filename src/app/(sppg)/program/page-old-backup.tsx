/**
 * @fileoverview Program List Page - SPPG Layer (REFACTORED - Thin Orchestrator)
 * Client-side rendered page with modular component architecture
 * 
 * @version Next.js 15.5.4 / Auth.js v5 / Enterprise Pattern
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * REFACTORED FEATURES:
 * - ✅ Thin orchestrator pattern (~150 lines, modular architecture)
 * - ✅ Component-based UI (ProgramHeader, ProgramStatsCards, ProgramFilters, ProgramList)
 * - ✅ Clean state management with filters
 * - ✅ Professional statistics cards with real data
 * - ✅ Collapsible filter section with active filters display
 * - ✅ Responsive design with dark mode
 * - ✅ Indonesian enum labels throughout
 * 
 * ARCHITECTURE IMPROVEMENTS:
 * - UI split into focused, reusable components
 * - Type-safe with proper interfaces
 * - Clean separation of concerns
 * - Follows supplier page pattern for consistency
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  ProgramList,
  ProgramHeader,
  ProgramFilters,
  ProgramStatsCards
} from '@/features/sppg/program/components'
import { usePrograms, useDeleteProgram } from '@/features/sppg/program/hooks'
import { toast } from 'sonner'
import { formatNumber, formatCurrency } from '@/features/sppg/program/lib'
import type { ProgramFilters as ProgramFiltersType } from '@/features/sppg/program/types'

// ============================================
// PROGRAM LIST PAGE (THIN ORCHESTRATOR)
// ============================================

/**
 * Program List Page - Client Component
 * Orchestrates filter state and component rendering
 * 
 * @returns Rendered program list page
 */
export default function ProgramPage() {
  const router = useRouter()

  // ============================================
  // 1. FILTER STATE MANAGEMENT
  // ============================================

  const [filters, setFilters] = useState<ProgramFiltersType>({})

  // ============================================
  // 2. DATA FETCHING WITH FILTERS
  // ============================================

  const { data: programs = [], isLoading } = usePrograms(filters)
  const { mutate: deleteProgram } = useDeleteProgram()

  // ============================================
  // 3. CALCULATE STATISTICS
  // ============================================

  const stats = {
    total: programs.length,
    active: programs.filter(p => p.status === 'ACTIVE').length,
    completed: programs.filter(p => p.status === 'COMPLETED').length,
    draft: programs.filter(p => p.status === 'DRAFT').length,
    paused: programs.filter(p => p.status === 'PAUSED').length,
    cancelled: programs.filter(p => p.status === 'CANCELLED').length,
    archived: programs.filter(p => p.status === 'ARCHIVED').length,
    activePercentage: programs.length > 0 ? Math.round((programs.filter(p => p.status === 'ACTIVE').length / programs.length) * 100) : 0,
    completedPercentage: programs.length > 0 ? Math.round((programs.filter(p => p.status === 'COMPLETED').length / programs.length) * 100) : 0,
  }

  const summaryStats = {
    totalPrograms: programs.length,
    activePrograms: programs.filter(p => p.status === 'ACTIVE').length,
    totalRecipients: programs.reduce((sum, p) => sum + p.currentRecipients, 0),
    totalBudget: programs.reduce((sum, p) => sum + (p.totalBudget || 0), 0),
  }

  // ============================================
  // 4. EVENT HANDLERS
  // ============================================

  const handleView = (id: string) => {
    router.push(`/program/${id}`)
  }

  const handleEdit = (id: string) => {
    router.push(`/program/${id}/edit`)
  }

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus program ini?')) {
      deleteProgram(id, {
        onSuccess: () => {
          toast.success('Program berhasil dihapus')
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : 'Gagal menghapus program')
        }
      })
    }
  }

  const handleFilterChange = (key: keyof ProgramFiltersType, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value
    }))
  }

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      search: value || undefined
    }))
  }

  const handleClearFilters = () => {
    setFilters({})
  }

  // ============================================
  // 5. RENDER PAGE WITH COMPONENTS
  // ============================================

  return (
    <div className="flex-1 space-y-4 md:space-y-6">
      {/* ================================ HEADER ================================ */}

      <ProgramHeader />

      {/* ================================ FILTERS ================================ */}

      <ProgramFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        onClearFilters={handleClearFilters}
      />

      {/* ================================ STATISTICS CARDS ================================ */}

      <ProgramStatsCards stats={stats} />

      {/* ================================ SUMMARY STATISTICS ================================ */}

      <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
              Total Program
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl md:text-2xl font-bold">{formatNumber(summaryStats.totalPrograms)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summaryStats.activePrograms} program aktif
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
              Program Aktif
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl md:text-2xl font-bold">{formatNumber(summaryStats.activePrograms)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((summaryStats.activePrograms / summaryStats.totalPrograms) * 100 || 0).toFixed(0)}% dari total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
              Total Penerima
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl md:text-2xl font-bold">{formatNumber(summaryStats.totalRecipients)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Penerima manfaat aktif
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
              Total Anggaran
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl md:text-2xl font-bold">{formatCurrency(summaryStats.totalBudget)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Anggaran keseluruhan
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* ================================ PROGRAM LIST ================================ */}

      <Card>
        <CardHeader className="pb-3 md:pb-4">
          <CardTitle className="text-base md:text-lg">Daftar Program</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Kelola dan pantau semua program gizi yang sedang berjalan
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-6">
            <ProgramList
              data={programs}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={isLoading}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}