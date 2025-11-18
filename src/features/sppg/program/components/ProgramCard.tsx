/**
 * @fileoverview ProgramCard Component - Display program summary
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 */

'use client'

import { type FC } from 'react'
import Link from 'next/link'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp,
  MoreVertical,
  Edit,
  Trash2,
  Eye
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import type { Program } from '../types'
import { ProgramTypeDisplay } from './ProgramTypeDisplay'
import { TargetGroupConfigBadge } from './TargetGroupConfigBadge'

interface ProgramCardProps {
  program: Program
  variant?: 'default' | 'compact'
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onView?: (id: string) => void
  showActions?: boolean
}

export const ProgramCard: FC<ProgramCardProps> = ({
  program,
  variant = 'default',
  onEdit,
  onDelete,
  onView,
  showActions = true,
}) => {
  // Status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default'
      case 'COMPLETED':
        return 'secondary'
      case 'SUSPENDED':
        return 'destructive'
      case 'DRAFT':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  // Program type label
  const getProgramTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      NUTRITIONAL_RECOVERY: 'Pemulihan Gizi',
      NUTRITIONAL_EDUCATION: 'Edukasi Gizi',
      FREE_NUTRITIOUS_MEAL: 'Makan Bergizi Gratis',
      EMERGENCY_NUTRITION: 'Nutrisi Darurat',
      STUNTING_INTERVENTION: 'Intervensi Stunting',
    }
    return labels[type] || type
  }

  // Calculate progress percentage
  const progressPercentage = program.currentRecipients && program.targetRecipients
    ? Math.round((program.currentRecipients / program.targetRecipients) * 100)
    : 0

  return (
    <Card 
      className={cn(
        'hover:shadow-lg transition-all duration-200',
        'dark:hover:shadow-xl dark:hover:shadow-primary/5',
        variant === 'compact' && 'p-4'
      )}
    >
      <CardHeader className={cn(variant === 'compact' && 'pb-3')}>
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className={cn(
                'text-foreground',
                variant === 'compact' ? 'text-lg' : 'text-xl'
              )}>
                {program.name}
              </CardTitle>
              <Badge variant={getStatusVariant(program.status || 'DRAFT')}>
                {program.status || 'DRAFT'}
              </Badge>
            </div>
            <CardDescription className="text-sm text-muted-foreground">
              {program.programCode}
            </CardDescription>
          </div>

          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Menu aksi</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {onView && (
                  <DropdownMenuItem onClick={() => onView(program.id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Lihat Detail
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(program.id)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Program
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(program.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Hapus Program
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {program.description && variant === 'default' && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {program.description}
          </p>
        )}
      </CardHeader>

      <CardContent className={cn(variant === 'compact' && 'py-3')}>
        <div className="space-y-4">
          {/* Program Details */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <span className="text-muted-foreground">Jenis Program</span>
              <p className="font-medium text-foreground">
                {program.programType ? getProgramTypeLabel(program.programType) : '-'}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Konfigurasi Target</span>
              <div className="flex flex-col gap-1">
                {/* ✅ SIMPLIFIED (Nov 11, 2025): Removed isMultiTarget prop */}
                <ProgramTypeDisplay
                  allowedTargetGroups={program.allowedTargetGroups ?? []}
                  variant="badge"
                  showTooltip={false}
                  showIcon={true}
                />
                
                {/* Show badges for target groups (always shown if length > 1) */}
                {program.allowedTargetGroups && program.allowedTargetGroups.length > 1 && (
                  <TargetGroupConfigBadge
                    targetGroups={program.allowedTargetGroups}
                    variant="outline"
                    maxDisplay={2}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Target Recipients */}
            <div className="flex items-center gap-2 rounded-lg border p-3 bg-muted/50 dark:bg-muted/20">
              <Users className="h-4 w-4 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Target Penerima</p>
                <p className="text-sm font-semibold text-foreground">
                  {program.targetRecipients?.toLocaleString('id-ID') || 0}
                </p>
              </div>
            </div>

            {/* Current Recipients */}
            <div className="flex items-center gap-2 rounded-lg border p-3 bg-muted/50 dark:bg-muted/20">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-500" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Penerima Saat Ini</p>
                <p className="text-sm font-semibold text-foreground">
                  {program.currentRecipients?.toLocaleString('id-ID') || 0}
                </p>
              </div>
            </div>

            {/* Budget */}
            {program.totalBudget && (
              <div className="flex items-center gap-2 rounded-lg border p-3 bg-muted/50 dark:bg-muted/20">
                <DollarSign className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Total Anggaran</p>
                  <p className="text-sm font-semibold text-foreground">
                    Rp {(program.totalBudget / 1000000).toFixed(1)}jt
                  </p>
                </div>
              </div>
            )}

            {/* Schedule */}
            {program.startDate && (
              <div className="flex items-center gap-2 rounded-lg border p-3 bg-muted/50 dark:bg-muted/20">
                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Periode</p>
                  <p className="text-sm font-semibold text-foreground">
                    {format(new Date(program.startDate), 'MMM yyyy', { locale: localeId })}
                    {program.endDate && ` - ${format(new Date(program.endDate), 'MMM yyyy', { locale: localeId })}`}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {program.targetRecipients && program.currentRecipients !== undefined && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress Penerima</span>
                <span className="font-medium text-foreground">{progressPercentage}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full transition-all duration-300',
                    progressPercentage >= 100 ? 'bg-green-500' :
                    progressPercentage >= 75 ? 'bg-blue-500' :
                    progressPercentage >= 50 ? 'bg-yellow-500' : 'bg-orange-500'
                  )}
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* ❌ REMOVED (Phase 4 - Nov 8, 2025): Nutrition targets now from NutritionStandard */}
          {/* Use ProgramNutritionTab for detailed nutrition display */}
          {/* See: /src/lib/nutrition-helpers.ts for getProgramNutritionSummary() */}
        </div>
      </CardContent>

      {variant === 'default' && (
        <CardFooter className="flex justify-between pt-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/program/${program.id}`}>
              Lihat Detail
            </Link>
          </Button>
          
          <div className="flex gap-2">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(program.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
