'use client'

/**
 * ProgramEnrollmentsTab Component - Beneficiary Enrollment Management
 * 
 * ✅ REFACTORED (Nov 13, 2025): Single list with filter instead of tabs
 * REASON: Better UX - show all enrollments at once with flexible filtering
 * 
 * Displays all beneficiary enrollments in a unified list with:
 * - Search by organization name/code
 * - Filter by target group (multi-select dropdown)
 * - Filter by status
 * - Sort by various columns
 * 
 * @component
 * @example
 * <ProgramEnrollmentsTab programId="prog_123" />
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { School, Baby, Heart, UserPlus, GraduationCap, Plus, Users, Search, Filter } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BeneficiaryEnrollmentList } from '../beneficiary'
import { useBeneficiaryEnrollments, useProgram } from '../../hooks'
import type { TargetGroup } from '@prisma/client'

interface ProgramEnrollmentsTabProps {
  programId: string
}

// Target group configuration with icons and labels
const TARGET_GROUPS: Record<TargetGroup, {
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}> = {
  SCHOOL_CHILDREN: {
    label: 'Anak Sekolah',
    icon: School,
    color: 'blue',
  },
  PREGNANT_WOMAN: {
    label: 'Ibu Hamil',
    icon: Heart,
    color: 'pink',
  },
  BREASTFEEDING_MOTHER: {
    label: 'Ibu Menyusui',
    icon: Baby,
    color: 'purple',
  },
  TODDLER: {
    label: 'Balita',
    icon: UserPlus,
    color: 'green',
  },
  TEENAGE_GIRL: {
    label: 'Remaja Putri',
    icon: GraduationCap,
    color: 'orange',
  },
  ELDERLY: {
    label: 'Lansia',
    icon: Users,
    color: 'gray',
  },
  STUNTING_RISK: {
    label: 'Berisiko Stunting',
    icon: Heart,
    color: 'red',
  },
}

export function ProgramEnrollmentsTab({ programId }: ProgramEnrollmentsTabProps) {
  const router = useRouter()

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [targetGroupFilter, setTargetGroupFilter] = useState<TargetGroup | 'ALL'>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  // Fetch program data
  const { data: program } = useProgram(programId)

  // TanStack Query for ALL enrollments (no pre-filtering)
  const { data: allEnrollments, isLoading } = useBeneficiaryEnrollments({
    programId,
    isActive: true, // Only show active enrollments
  })

  // Client-side filtering based on search and filters
  const filteredEnrollments = allEnrollments?.filter((enrollment) => {
    // Search filter (organization name or code)
    if (searchQuery) {
      const search = searchQuery.toLowerCase()
      const orgName = enrollment.beneficiaryOrg?.organizationName?.toLowerCase() || ''
      const orgCode = enrollment.beneficiaryOrg?.organizationCode?.toLowerCase() || ''
      if (!orgName.includes(search) && !orgCode.includes(search)) {
        return false
      }
    }

    // Target group filter
    if (targetGroupFilter !== 'ALL' && enrollment.targetGroup !== targetGroupFilter) {
      return false
    }

    // Status filter
    if (statusFilter !== 'ALL' && enrollment.enrollmentStatus !== statusFilter) {
      return false
    }

    return true
  })

  // Calculate overall stats (from filtered data)
  const stats = filteredEnrollments
    ? {
        total: filteredEnrollments.length,
        active: filteredEnrollments.filter((e) => e.enrollmentStatus === 'ACTIVE').length,
        totalBeneficiaries: filteredEnrollments.reduce(
          (sum, e) => sum + (e.targetBeneficiaries || 0),
          0
        ),
        totalBudget: filteredEnrollments.reduce(
          (sum, e) => sum + Number(e.monthlyBudgetAllocation || 0),
          0
        ),
      }
    : null

  const handleCreate = () => {
    // Navigate to create page with programId (no pre-selected target group)
    router.push(`/program/${programId}/enrollments/new`)
  }

  const handleEdit = (enrollmentId: string) => {
    router.push(`/program/${programId}/enrollments/${enrollmentId}/edit`)
  }

  return (
    <div className="space-y-6 mt-4">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Pendaftaran Penerima Manfaat</h3>
          <p className="text-sm text-muted-foreground">
            Kelola semua pendaftaran penerima manfaat untuk program ini
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Pendaftaran
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pendaftaran</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.active} aktif</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Penerima</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBeneficiaries.toLocaleString('id-ID')}</div>
              <p className="text-xs text-muted-foreground mt-1">Target penerima manfaat</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Anggaran</CardTitle>
              <Baby className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(stats.totalBudget)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Alokasi bulanan</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rata-rata</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.total > 0 ? Math.round(stats.totalBeneficiaries / stats.total) : 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Penerima per pendaftaran</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Daftar Pendaftaran</CardTitle>
              <CardDescription>
                Filter dan cari pendaftaran penerima manfaat
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {filteredEnrollments?.length || 0} dari {allEnrollments?.length || 0} pendaftaran
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filter Controls */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari organisasi atau kode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Target Group Filter */}
            <Select value={targetGroupFilter} onValueChange={(value) => setTargetGroupFilter(value as TargetGroup | 'ALL')}>
              <SelectTrigger>
                <SelectValue placeholder="Kelompok Target" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Kelompok</SelectItem>
                {program?.allowedTargetGroups?.map((tg) => {
                  const config = TARGET_GROUPS[tg]
                  const Icon = config.icon
                  return (
                    <SelectItem key={tg} value={tg}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{config.label}</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Status</SelectItem>
                <SelectItem value="ACTIVE">Aktif</SelectItem>
                <SelectItem value="PENDING">Menunggu</SelectItem>
                <SelectItem value="SUSPENDED">Ditangguhkan</SelectItem>
                <SelectItem value="COMPLETED">Selesai</SelectItem>
                <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Enrollment List */}
          <div className="mt-6">
            <BeneficiaryEnrollmentList
              programId={programId}
              targetGroupFilter={targetGroupFilter === 'ALL' ? undefined : targetGroupFilter}
              searchQuery={searchQuery}
              statusFilter={statusFilter === 'ALL' ? undefined : statusFilter}
              onEditClick={handleEdit}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
