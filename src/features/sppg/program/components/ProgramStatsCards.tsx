/**
 * @fileoverview Program Statistics Cards Component
 * Calculates statistics from filtered program data
 * 
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 */

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Layers, CheckCircle2, Users, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/features/sppg/program/lib'
import type { Program } from '@/features/sppg/program/types'

/**
 * Props for ProgramStatsCards component
 */
interface ProgramStatsCardsProps {
  programs: Program[]
  isLoading?: boolean
}

/**
 * Program Statistics Cards Component
 * Calculates and displays stats from filtered data
 */
export function ProgramStatsCards({
  programs,
  isLoading = false,
}: ProgramStatsCardsProps) {
  // Calculate statistics from filtered programs
  const totalPrograms = programs.length
  const activePrograms = programs.filter((p) => p.status === 'ACTIVE').length
  const totalRecipients = programs.reduce((sum, p) => sum + (p.targetRecipients || 0), 0)
  const totalBudget = programs.reduce((sum, p) => sum + (p.totalBudget || 0), 0)

  const stats = [
    {
      label: 'Total Program',
      value: totalPrograms.toLocaleString('id-ID'),
      icon: Layers,
      bgColor: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      label: 'Program Aktif',
      value: activePrograms.toLocaleString('id-ID'),
      icon: CheckCircle2,
      bgColor: 'bg-green-500/10',
      iconColor: 'text-green-600',
    },
    {
      label: 'Total Penerima',
      value: totalRecipients.toLocaleString('id-ID'),
      icon: Users,
      bgColor: 'bg-blue-500/10',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Total Anggaran',
      value: formatCurrency(totalBudget),
      icon: DollarSign,
      bgColor: 'bg-purple-500/10',
      iconColor: 'text-purple-600',
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
