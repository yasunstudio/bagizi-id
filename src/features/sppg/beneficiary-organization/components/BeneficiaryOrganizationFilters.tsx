/**
 * @fileoverview Beneficiary Organization Filters Component
 * @version Next.js 15.5.4
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
import type { BeneficiaryOrganizationFilter } from '../schemas/beneficiaryOrganizationSchema'

interface BeneficiaryOrganizationFiltersProps {
  filters: BeneficiaryOrganizationFilter
  onFiltersChange: (filters: BeneficiaryOrganizationFilter) => void
}

export function BeneficiaryOrganizationFilters({
  filters,
  onFiltersChange,
}: BeneficiaryOrganizationFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filter & Pencarian
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          <Select
            value={filters.type || 'all'}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                type: value === 'all' ? undefined : (value as BeneficiaryOrganizationFilter['type']),
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Semua Jenis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Jenis</SelectItem>
              <SelectItem value="SCHOOL">Sekolah</SelectItem>
              <SelectItem value="HEALTH_FACILITY">Fasilitas Kesehatan</SelectItem>
              <SelectItem value="INTEGRATED_SERVICE_POST">Posyandu</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.isActive === undefined ? 'all' : filters.isActive ? 'active' : 'inactive'}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                isActive: value === 'all' ? undefined : value === 'active',
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="inactive">Tidak Aktif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
