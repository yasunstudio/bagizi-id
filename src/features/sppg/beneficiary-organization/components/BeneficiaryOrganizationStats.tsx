/**
 * @fileoverview Beneficiary Organization Statistics Component
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

'use client'

import { Building2, Heart, School, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { BeneficiaryOrganizationResponse } from '../api/beneficiaryOrganizationApi'

interface BeneficiaryOrganizationStatsProps {
  organizations: BeneficiaryOrganizationResponse[]
  isLoading?: boolean
}

export function BeneficiaryOrganizationStats({
  organizations,
  isLoading = false,
}: BeneficiaryOrganizationStatsProps) {
  const totalOrganizations = organizations.length
  const totalSchools = organizations.filter((org) => org.type === 'SCHOOL').length
  const totalHealthFacilities = organizations.filter((org) => org.type === 'HEALTH_FACILITY').length
  const totalStaff = organizations.reduce((sum, org) => {
    return sum + (org.teachingStaffCount || 0) + (org.nonTeachingStaffCount || 0)
  }, 0)

  const stats = [
    {
      label: 'Total Organisasi',
      value: totalOrganizations,
      icon: Building2,
      bgColor: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      label: 'Sekolah',
      value: totalSchools,
      icon: School,
      bgColor: 'bg-blue-500/10',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Fasilitas Kesehatan',
      value: totalHealthFacilities,
      icon: Heart,
      bgColor: 'bg-red-500/10',
      iconColor: 'text-red-600',
    },
    {
      label: 'Total Personel',
      value: totalStaff.toLocaleString('id-ID'),
      icon: Users,
      bgColor: 'bg-green-500/10',
      iconColor: 'text-green-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-2">
                    {isLoading ? '-' : stat.value}
                  </p>
                </div>
                <div className={`h-12 w-12 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
