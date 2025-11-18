/**
 * @fileoverview Stats Cards Component - Dashboard statistics display
 * @version Next.js 15.5.4 / shadcn/ui / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Users, 
  ChefHat, 
  Truck, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'
import { useDashboardStats } from '../hooks'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import type { DashboardStats } from '../types'

interface StatsCardsProps {
  className?: string
}

const statItems = [
  {
    key: 'totalBeneficiaries' as keyof DashboardStats,
    title: 'Total Penerima Manfaat',
    icon: Users,
    valueKey: 'current',
    secondaryKey: 'organizations',
    changeKey: 'percentage',
    format: (value: number) => value.toLocaleString(),
    secondaryFormat: (value: number) => `${value} organisasi`,
    secondaryText: 'terdaftar',
    changeFormat: (value: number) => `${value > 0 ? '+' : ''}${value}%`,
    changeText: 'dari minggu lalu'
  },
  {
    key: 'activeMenus' as keyof DashboardStats,
    title: 'Menu Aktif',
    icon: ChefHat,
    valueKey: 'current',
    newKey: 'newThisWeek',
    format: (value: number) => value.toString(),
    newFormat: (value: number) => `${value} menu`,
    newText: 'baru minggu ini'
  },
  {
    key: 'pendingDistributions' as keyof DashboardStats,
    title: 'Distribusi Pending',
    icon: Truck,
    valueKey: 'current',
    achievementKey: 'percentage',
    format: (value: number) => value.toLocaleString(),
    achievementFormat: (value: number) => `${value}%`,
    achievementText: 'selesai minggu ini'
  },
  {
    key: 'budgetUtilization' as keyof DashboardStats,
    title: 'Utilisasi Budget',
    icon: DollarSign,
    valueKey: 'total',
    percentageKey: 'percentage',
    format: (value: number) => `Rp ${(value / 1000000).toFixed(1)}M`,
    percentageFormat: (value: number) => `${value}%`,
    percentageText: 'terpakai'
  }
]

function getTrendIcon(trend: 'up' | 'down' | 'stable') {
  switch (trend) {
    case 'up':
      return <TrendingUp className="h-3 w-3 text-green-600" />
    case 'down':
      return <TrendingDown className="h-3 w-3 text-red-600" />
    default:
      return <Minus className="h-3 w-3 text-muted-foreground" />
  }
}

function getTrendColor(trend: 'up' | 'down' | 'stable') {
  switch (trend) {
    case 'up':
      return 'text-green-600'
    case 'down':
      return 'text-red-600'
    default:
      return 'text-muted-foreground'
  }
}

export function StatsCards({ className }: StatsCardsProps) {
  const { data: session } = useSession()
  const sppgId = session?.user?.sppgId
  
  const { data: stats, isLoading, error } = useDashboardStats()

  // Show loading state when loading or no sppgId
  if (isLoading || !sppgId || (!stats && !error)) {
    return (
      <div className={cn('grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4', className)}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-3 md:h-4 w-24 md:w-32" />
              <Skeleton className="h-3 w-3 md:h-4 md:w-4 rounded" />
            </CardHeader>
            <CardContent className="pt-0">
              <Skeleton className="h-6 md:h-8 w-16 md:w-20 mb-2" />
              <Skeleton className="h-3 w-20 md:w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className={cn('grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4', className)}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-red-600">
                Error Loading Stats
              </CardTitle>
              <Users className="h-3 w-3 md:h-4 md:w-4 text-red-400" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs md:text-sm text-muted-foreground">
                Failed to load statistics
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // No stats data available
  if (!stats) {
    return (
      <div className={cn('grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4', className)}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">
                No Data
              </CardTitle>
              <Users className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs md:text-sm text-muted-foreground">
                No statistics available
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4', className)}>
      {statItems.map((item) => {
        const statData = (stats[item.key as keyof typeof stats] || {}) as Record<string, number | string>
        const IconComponent = item.icon
        
        // Skip rendering if no data
        if (!statData || Object.keys(statData).length === 0) {
          return null
        }

        return (
          <Card key={item.key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">
                {item.title}
              </CardTitle>
              <IconComponent className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl md:text-2xl font-bold">
                {item.format(statData[item.valueKey] as number)}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                {/* Secondary value (e.g., organization count) */}
                {item.secondaryKey && (
                  <>
                    <Badge variant="outline" className="text-blue-600 border-blue-600/20">
                      {item.secondaryFormat!(statData[item.secondaryKey] as number)}
                    </Badge>
                    <span>{item.secondaryText}</span>
                  </>
                )}

                {/* Trend indicator for totalBeneficiaries */}
                {item.changeKey && !item.secondaryKey && item.trendKey && (
                  <>
                    {getTrendIcon(statData[item.trendKey] as 'up' | 'down' | 'stable')}
                    <span className={getTrendColor(statData[item.trendKey] as 'up' | 'down' | 'stable')}>
                      {item.changeFormat!(statData[item.changeKey] as number)}
                    </span>
                    <span>{item.changeText}</span>
                  </>
                )}

                {/* New items indicator for activeMenus */}
                {item.newKey && (
                  <>
                    <Badge variant="outline" className="text-blue-600 border-blue-600/20">
                      {item.newFormat!(statData[item.newKey] as number)}
                    </Badge>
                    <span>{item.newText}</span>
                  </>
                )}

                {/* Achievement indicator for distribution */}
                {item.achievementKey && (
                  <>
                    <span className="text-green-600 font-medium">
                      {item.achievementFormat!(statData[item.achievementKey] as number)}
                    </span>
                    <span>{item.achievementText}</span>
                  </>
                )}

                {/* Percentage indicator for budget */}
                {item.percentageKey && (
                  <>
                    <span className="text-yellow-600 font-medium">
                      {item.percentageFormat!(statData[item.percentageKey] as number)}
                    </span>
                    <span>{item.percentageText}</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}